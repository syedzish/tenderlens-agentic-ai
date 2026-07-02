# TenderLens Agentic AI

Production-grade bidder-side tender decisioning for Kaggle's AI Agents capstone.

TenderLens Agentic AI helps a supplier decide whether they can and should bid for a tender. It combines ADK 2.0 multi-agent workflows, a mandatory A2A Remote Evidence Audit Agent, MCP tools, OKF + RAG evidence grounding, a Bounded Evidence Quality Loop, typed and voice interaction, and a premium bilingual procurement cockpit.

## Current Status

Foundation, public repo, ADK scaffold, deterministic OKF/RAG services, sample data, unit tests, API route skeleton, voice gateway skeleton, and the first static cockpit UI slice are in place.

Public repository: https://github.com/syedzish/tenderlens-agentic-ai

Public demo: https://tenderlens-agentic-ai.vercel.app

Vercel: GitHub repo connected by the user. Root `package.json` and `vercel.json` build `frontend/` and publish `frontend/dist`; `frontend/vercel.json` also supports a Vercel project root set directly to `frontend`.

Implementation code will follow the approved milestone order:

1. Foundation documentation
2. Public GitHub repo
3. Agents CLI scaffold
4. OKF/RAG data foundation
5. MCP server
6. ADK agent workflow with A2A audit and quality loop
7. Backend API and voice gateway
8. Frontend cockpit
9. Tests/evals/deployment/Kaggle packaging

## Core Concepts

- ADK 2.0 agent/multi-agent system
- Mandatory A2A Remote Evidence Audit Agent
- Bounded Evidence Quality Loop
- MCP server for controlled evidence/profile/scenario tools
- OKF + RAG evidence foundation
- Parallel specialist agents
- ADK Gemini Live API Toolkit voice mode
- English default plus full Arabic RTL mode
- 5 MB secure upload workflow
- Evidence War Room and bid strategy simulator
- Agents CLI evals and deployment readiness

## Repository Layout

```text
app/        ADK agents, workflows, services, MCP, API, voice gateway
frontend/   Vercel web app
data/       curated samples, OKF bundles, sample bidder profiles
docs/       SDD, software design, architecture, privacy, concept map, evals
tests/      unit, integration, conformance, eval, and voice tests
scripts/    project scripts
```

## Local Setup

Detailed setup will be finalized after the Agents CLI scaffold lands. No secrets should be committed.

Expected environment variables:

```text
GOOGLE_CLOUD_PROJECT=
GOOGLE_CLOUD_LOCATION=
AGENT_RUNTIME_ENDPOINT=
VOICE_AGENT_MODEL=
VOICE_SESSION_MAX_SECONDS=300
```

Use `.env.example` as the non-secret template.

## Current Verification

```bash
npm test
npm run build
.venv\Scripts\python.exe -m unittest discover -s tests/unit -p "test_*.py"
.venv\Scripts\python.exe -c "from app.fast_api_app import app; print(app.title)"
```

Current local limitation: `agents-cli run` LLM smoke requires configured Gemini/Vertex credentials. Deterministic services, ADK root-agent import, FastAPI import, FastAPI API route smoke, unit tests, and static frontend build currently pass locally.

## Privacy Claims

- We do not save your uploaded files.
- We only listen when you start voice mode, and we do not save your voice.

These claims are implemented through 5 MB upload limits, transient upload processing, no raw upload text in durable state/logs, explicit microphone start, visible voice controls, no raw audio retention, and session-scoped transcripts.

## License

Code is licensed under Apache-2.0. Documentation and sample content provenance are tracked in `DATA_SOURCES.md`. Kaggle winner obligations and any separate asset licenses must be honored before final submission.
