"""ADK MCP toolset factory for the local TenderLens MCP server."""

from __future__ import annotations

import sys
from pathlib import Path

from google.adk.tools.mcp_tool.mcp_session_manager import StdioConnectionParams
from google.adk.tools.mcp_tool.mcp_toolset import McpToolset
from mcp import StdioServerParameters

PROJECT_ROOT = Path(__file__).resolve().parents[2]

TENDERLENS_MCP_TOOL_FILTER = [
    "list_tenders",
    "get_tender_okf_index",
    "get_okf_concept",
    "search_evidence",
    "get_company_profile",
    "score_profile_against_requirement",
    "get_scoring_rubric",
    "simulate_strategy_overlay",
    "generate_clarification_question_candidates",
    "validate_okf_bundle",
    "validate_upload",
    "get_upload_analysis_status",
    "get_voice_session_context",
]


def create_tenderlens_mcp_toolset(timeout: float = 5.0) -> McpToolset:
    """Create a strict-filter ADK toolset for the local stdio MCP server."""
    params = StdioServerParameters(
        command=sys.executable,
        args=["-m", "app.mcp.server"],
        cwd=PROJECT_ROOT,
        env={
            "PYTHONPATH": str(PROJECT_ROOT),
            "PYTHONIOENCODING": "utf-8",
        },
    )
    return McpToolset(
        connection_params=StdioConnectionParams(
            server_params=params,
            timeout=timeout,
        ),
        tool_filter=TENDERLENS_MCP_TOOL_FILTER,
        tool_name_prefix="tenderlens",
    )
