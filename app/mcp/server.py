"""App-local TenderLens MCP server.

Run with:

```
python -m app.mcp.server
```

The server uses stdio by default so ADK can consume it through ``McpToolset``
without exposing broad filesystem access or a public network port.
"""

from __future__ import annotations

from mcp.server.fastmcp import FastMCP

from app.mcp.tools import (
    get_company_profile_tool,
    get_tender_okf_index,
    list_tenders_tool,
    score_profile_against_requirement,
    search_evidence,
    simulate_strategy_overlay_tool,
    validate_okf_bundle_tool,
    validate_upload_tool,
)

SERVER_NAME = "tenderlens-mcp"

mcp_server = FastMCP(
    SERVER_NAME,
    instructions=(
        "Controlled TenderLens tools for OKF evidence, bidder profiles, "
        "strategy simulation, upload validation, and OKF validation."
    ),
)


@mcp_server.tool(name="list_tenders")
def list_tenders() -> dict:
    """List curated demo tenders available for analysis."""
    return list_tenders_tool()


@mcp_server.tool(name="get_tender_okf_index")
def get_okf_index(tender_id: str) -> dict:
    """Return the OKF index markdown for a curated tender."""
    return get_tender_okf_index(tender_id)


@mcp_server.tool(name="get_okf_concept")
def get_okf_concept(tender_id: str, concept_id: str) -> dict:
    """Return a single OKF concept by concept id."""
    evidence = search_evidence(tender_id, concept_id.replace("-", " "), limit=20)[
        "evidence"
    ]
    matches = [item for item in evidence if item.get("concept_id") == concept_id]
    if not matches:
        return {"tender_id": tender_id, "concept_id": concept_id, "found": False}
    return {
        "tender_id": tender_id,
        "concept_id": concept_id,
        "found": True,
        "evidence": matches[0],
    }


@mcp_server.tool(name="search_evidence")
def search_evidence_tool(tender_id: str, query: str, limit: int = 5) -> dict:
    """Search cited OKF evidence for a tender."""
    safe_limit = max(1, min(int(limit), 10))
    return search_evidence(tender_id, query, safe_limit)


@mcp_server.tool(name="get_company_profile")
def get_company_profile(profile_id: str) -> dict:
    """Return a bidder profile by profile id."""
    return get_company_profile_tool(profile_id)


@mcp_server.tool(name="score_profile_against_requirement")
def score_requirement(profile_id: str, requirement: str) -> dict:
    """Score one tender requirement against the bidder profile."""
    return score_profile_against_requirement(profile_id, requirement)


@mcp_server.tool(name="get_scoring_rubric")
def get_scoring_rubric() -> dict:
    """Return TenderLens deterministic scoring rubric metadata."""
    return {
        "rubric": {
            "bid": "score >= 0.72 and no hard profile failures",
            "conditional_bid": "mostly aligned, but fixable gaps remain",
            "no_bid": "score < 0.55 or at least two hard failures",
        },
        "weights": {
            "profile_fit": "hard gate",
            "commercial_fit": "scenario score",
            "risk": "watch item modifier",
            "evidence_quality": "A2A audit gate",
        },
    }


@mcp_server.tool(name="simulate_strategy_overlay")
def simulate_strategy_overlay(base_score: float) -> dict:
    """Simulate the default strategy overlay for a base score."""
    return simulate_strategy_overlay_tool(base_score)


@mcp_server.tool(name="generate_clarification_question_candidates")
def generate_clarification_question_candidates(tender_id: str) -> dict:
    """Return evidence-backed clarification question candidates."""
    risk = search_evidence(tender_id, "risk HVAC SLA data handling", limit=3)[
        "evidence"
    ]
    return {
        "questions": [
            {
                "question": "Please confirm the complete HVAC asset inventory and required specialist certifications.",
                "why_it_matters": "Specialized HVAC scope affects delivery risk and partner planning.",
                "priority": "high",
                "affects_bid_no_bid": True,
                "evidence_id": risk[0]["id"] if risk else "risks-1",
            },
            {
                "question": "How will SLA response time be measured for incidents logged outside business hours?",
                "why_it_matters": "24x7 support design depends on the SLA measurement rule.",
                "priority": "medium",
                "affects_bid_no_bid": False,
                "evidence_id": "eligibility-1",
            },
        ]
    }


@mcp_server.tool(name="validate_okf_bundle")
def validate_okf_bundle(tender_id: str) -> dict:
    """Validate the OKF bundle for a curated tender."""
    return validate_okf_bundle_tool(tender_id)


@mcp_server.tool(name="validate_upload")
def validate_upload(filename: str, size_bytes: int) -> dict:
    """Validate upload metadata before parsing."""
    return validate_upload_tool(filename, size_bytes)


@mcp_server.tool(name="get_upload_analysis_status")
def get_upload_analysis_status(session_id: str) -> dict:
    """Return transient upload status placeholder for the public demo."""
    return {
        "session_id": session_id,
        "status": "not_started",
        "retention": "uploaded files and transient OKF bundles are not retained",
    }


@mcp_server.tool(name="get_voice_session_context")
def get_voice_session_context(session_id: str) -> dict:
    """Return transient voice session context placeholder for the public demo."""
    return {
        "session_id": session_id,
        "microphone": "explicit_start_only",
        "raw_audio_retained": False,
        "max_seconds": 300,
    }


def main() -> None:
    mcp_server.run(transport="stdio")


if __name__ == "__main__":
    main()
