# Concept Evidence Matrix

This is a documentation and judging artifact, not an app feature. Complete exact code locations, UI locations, eval evidence, and video timestamps before Kaggle submission.

| Concept | Implementation Evidence | UI Evidence | Eval/Test Evidence | Video Timestamp | Writeup Section |
| --- | --- | --- | --- | --- | --- |
| ADK agent/multi-agent system | `app/agent.py`, `app/workflows/tender_workflow.py` | Decision dashboard | `tests/unit/test_retrieval_and_workflow.py` | To fill after recording | ADK multi-agent design |
| Mandatory A2A Remote Evidence Audit Agent | `app/agents/a2a_audit/agent.py`, `app/agents/a2a_audit/audit.py`, scaffolded A2A route in `app/app_utils/a2a.py`, workflow call in `app/workflows/tender_workflow.py` | A2A audit status panel | `tests/unit/test_a2a_audit_loop.py`, `test_workflow_returns_audited_bid_report` | To fill after recording | Mandatory A2A Evidence Audit Agent |
| Bounded Evidence Quality Loop | `run_bounded_evidence_quality_loop` in `app/agents/a2a_audit/audit.py`; workflow calls loop before final report | Audit status and unresolved evidence gaps | `test_missing_citation_fails_after_bounded_rounds`, `test_unknown_evidence_routes_to_retrieval_agent` | To fill after recording | Bounded Evidence Quality Loop |
| MCP server | FastMCP server in `app/mcp/server.py`, pure tool functions in `app/mcp/tools.py`, ADK `McpToolset` factory in `app/mcp/toolset.py` with strict tool filter | Evidence/profile-backed outputs | `tests/unit/test_mcp_server.py`, workflow tests | To fill after recording | MCP server |
| ADK Gemini Live API Toolkit voice mode | Voice gateway skeleton in `app/voice_gateway/routes.py`; Live Toolkit integration pending dependency/credential setup | Voice button, transcript, audio states | `tests/unit/test_sanitization_voice.py`, frontend smoke test | To fill after recording | Real-time voice mode |
| Security features | `app/services/upload/validation.py`, `app/services/sanitization/html.py`, `app/services/voice/session.py` | Upload errors, privacy copy, safe rendering | Upload >5 MB and sanitization tests | To fill after recording | Security/privacy |
| Deployability | Planned: Agent Runtime + Vercel docs/config | Public demo URL | Deployment smoke tests | To fill after recording | Deployment |
| Agent skills / Agents CLI | Planned: scaffold/evals/deployment lifecycle | README and docs | `agents-cli info/run/eval` evidence | To fill after recording | Build process |
| ADK graph workflow | Deterministic workflow and `workflow_trace` in `app/workflows/tender_workflow.py`; graph-native ADK workflow migration remains a later hardening step | Progress/status flow | `tests/conformance/test_tool_trajectory.py` | To fill after recording | Architecture |
| Router agent | `app/agent.py` root router plus `router.accept_input` trace step in `app/workflows/tender_workflow.py` | Progress and final report | `test_core_analysis_path_reaches_a2a_before_final` | To fill after recording | ADK design |
| ParallelWorkflow | Parallel specialist trace steps in `app/workflows/tender_workflow.py` | Specialist status cards | `test_parallel_specialists_are_all_traced` | To fill after recording | Architecture |
| LoopWorkflow | Bounded loop in `app/agents/a2a_audit/audit.py`; ADK graph-native LoopWorkflow migration remains a later hardening step | Audit revision state | Loop max-round tests in `tests/unit/test_a2a_audit_loop.py` | To fill after recording | Architecture |
| OKF + RAG | `data/okf/smart-city-maintenance-2026/`, `app/services/okf/`, `app/services/retrieval/` | Evidence War Room, OKF graph | `tests/unit/test_okf_validator.py`, `test_retrieval_returns_cited_evidence` | To fill after recording | OKF + RAG |
| Evidence War Room | `frontend/index.html`, `frontend/app.js`, `frontend/styles.css` | Evidence filters/cards/citations | `frontend/scripts/smoke-check.mjs` | To fill after recording | Demo results |
| Upload privacy controls | `app/services/upload/validation.py`, `frontend/app.js` | Upload panel and 5 MB error | `tests/unit/test_upload_validation.py` | To fill after recording | Security/privacy |
| Voice privacy controls | `app/services/voice/session.py`, `app/voice_gateway/routes.py`, `frontend/app.js` | Explicit start, mute/end, transcript states | `tests/unit/test_sanitization_voice.py` | To fill after recording | Security/privacy |
| Arabic RTL support | `frontend/index.html`, `frontend/app.js`, `frontend/styles.css` | Arabic cockpit, RTL transcript | Frontend smoke test now; visual RTL check pending | To fill after recording | Bilingual support |
| Eval/observability | `tests/eval/` scaffold, deterministic conformance tests, Cloud Trace deployment docs | Docs/status where useful | `tests/conformance/test_tool_trajectory.py`; Agents CLI evals still pending credentials | To fill after recording | Evals/observability |
| Antigravity | Stretch only if available | Video clip if available | Not required | To fill if used | Tools |
