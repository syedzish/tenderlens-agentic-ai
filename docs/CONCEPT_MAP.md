# Concept Evidence Matrix

This is a documentation and judging artifact, not an app feature. Complete exact code locations, UI locations, eval evidence, and video timestamps before Kaggle submission.

| Concept | Implementation Evidence | UI Evidence | Eval/Test Evidence | Video Timestamp | Writeup Section |
| --- | --- | --- | --- | --- | --- |
| ADK agent/multi-agent system | Planned: `app/agents/`, `app/workflows/` | Decision dashboard | Planned conformance tests | To fill after recording | ADK multi-agent design |
| Mandatory A2A Remote Evidence Audit Agent | Planned: `app/agents/a2a_audit/` | A2A audit status panel | A2A reachable + router-before-final test | To fill after recording | Mandatory A2A Evidence Audit Agent |
| Bounded Evidence Quality Loop | Planned: workflow loop around synthesis and A2A audit | Audit status and unresolved evidence gaps | Missing-citation revision test | To fill after recording | Bounded Evidence Quality Loop |
| MCP server | Planned: `app/mcp/` | Evidence/profile-backed outputs | MCP tool integration tests | To fill after recording | MCP server |
| ADK Gemini Live API Toolkit voice mode | Planned: `app/voice_gateway/`, `app/agents/voice/` | Voice button, transcript, audio states | Voice schema/state tests and manual QA | To fill after recording | Real-time voice mode |
| Security features | Planned: upload validation, sanitization, privacy logging | Upload errors, privacy copy, safe rendering | Upload >5 MB, sanitization, prompt injection tests | To fill after recording | Security/privacy |
| Deployability | Planned: Agent Runtime + Vercel docs/config | Public demo URL | Deployment smoke tests | To fill after recording | Deployment |
| Agent skills / Agents CLI | Planned: scaffold/evals/deployment lifecycle | README and docs | `agents-cli info/run/eval` evidence | To fill after recording | Build process |
| ADK graph workflow | Planned: `app/workflows/` | Progress/status flow | Trajectory tests | To fill after recording | Architecture |
| Router agent | Planned: `app/agents/router/` | Progress and final report | Router path tests | To fill after recording | ADK design |
| ParallelWorkflow | Planned: specialist block | Specialist status cards | Parallel branch output tests | To fill after recording | Architecture |
| LoopWorkflow | Planned: quality loop | Audit revision state | Loop max-round tests | To fill after recording | Architecture |
| OKF + RAG | Planned: `data/okf/`, `app/services/retrieval/` | Evidence War Room, OKF graph | OKF validator + retrieval tests | To fill after recording | OKF + RAG |
| Evidence War Room | Planned: frontend evidence feature | Evidence filters/cards/citations | Frontend smoke tests | To fill after recording | Demo results |
| Upload privacy controls | Planned: upload service | Upload panel and 5 MB error | Over-size reject + cleanup tests | To fill after recording | Security/privacy |
| Voice privacy controls | Planned: voice service/gateway | Explicit start, mute/end, transcript states | Manual voice QA | To fill after recording | Security/privacy |
| Arabic RTL support | Planned: frontend RTL feature | Arabic cockpit, RTL transcript | RTL Playwright checks | To fill after recording | Bilingual support |
| Eval/observability | Planned: `tests/eval/`, Agents CLI evals | Docs/status where useful | Eval reports, Cloud Trace evidence | To fill after recording | Evals/observability |
| Antigravity | Stretch only if available | Video clip if available | Not required | To fill if used | Tools |
