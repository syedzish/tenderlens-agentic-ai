"""ADK wrapper for the mandatory A2A Remote Evidence Audit Agent."""

from __future__ import annotations

import os

from google.adk.agents import Agent
from google.adk.apps import App
from google.adk.models import Gemini
from google.genai import types

from app.agents.a2a_audit.audit import audit_draft_report

AUDIT_INSTRUCTION = """
You are the TenderLens A2A Evidence Audit Agent.

Review draft TenderLens bid/no-bid reports independently from the router.
Return pass/fail, missing citations, unsupported claims, weak evidence,
schema issues, privacy concerns, Arabic-mode mismatches, and voice-mode issues.
Do not create new tender facts. Audit only the supplied evidence package.
"""


evidence_audit_agent = Agent(
    name="tenderlens_a2a_evidence_audit_agent",
    model=Gemini(
        model=os.getenv("TENDERLENS_AUDIT_AGENT_MODEL", "gemini-flash-latest"),
        retry_options=types.HttpRetryOptions(attempts=3),
    ),
    instruction=AUDIT_INSTRUCTION,
    description="Independent A2A reviewer for TenderLens evidence grounding and quality-gate issues.",
    tools=[audit_draft_report],
)

app = App(
    root_agent=evidence_audit_agent,
    name="tenderlens-a2a-audit",
)
