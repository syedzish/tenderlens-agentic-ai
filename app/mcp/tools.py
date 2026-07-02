"""App-local MCP-style tool functions.

These functions are deliberately pure and schema-shaped so they can be wrapped
by a real MCP server or exposed as ADK function tools.
"""

from __future__ import annotations

from app.services.data_loader import get_company_profile, get_tender, list_tenders
from app.services.paths import OKF_DIR
from app.services.profile.matcher import score_requirement
from app.services.retrieval.retriever import search_okf_evidence
from app.services.scenario.scoring import DEFAULT_ASSUMPTIONS, simulate_strategy_overlay
from app.services.upload.validation import validate_upload_metadata
from app.services.okf.validator import validate_okf_bundle


def list_tenders_tool() -> dict:
    return {"tenders": [tender.__dict__ for tender in list_tenders()]}


def get_tender_okf_index(tender_id: str) -> dict:
    tender = get_tender(tender_id)
    path = OKF_DIR / tender.okf_bundle / "index.md"
    return {"tender_id": tender_id, "index_markdown": path.read_text(encoding="utf-8")}


def search_evidence(tender_id: str, query: str, limit: int) -> dict:
    tender = get_tender(tender_id)
    evidence = search_okf_evidence(OKF_DIR / tender.okf_bundle, tender_id, query, limit)
    return {"evidence": [item.__dict__ for item in evidence]}


def get_company_profile_tool(profile_id: str) -> dict:
    return {"profile": get_company_profile(profile_id).__dict__}


def score_profile_against_requirement(
    profile_id: str, requirement: str
) -> dict:
    profile = get_company_profile(profile_id)
    return score_requirement(requirement, profile)


def simulate_strategy_overlay_tool(base_score: float) -> dict:
    return simulate_strategy_overlay(base_score, DEFAULT_ASSUMPTIONS)


def validate_okf_bundle_tool(tender_id: str) -> dict:
    tender = get_tender(tender_id)
    return validate_okf_bundle(OKF_DIR / tender.okf_bundle).to_dict()


def validate_upload_tool(filename: str, size_bytes: int) -> dict:
    return validate_upload_metadata(filename, size_bytes).__dict__
