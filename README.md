# TenderLens Agentic AI

Production-grade bidder-side tender decisioning for Kaggle's AI Agents capstone.

TenderLens Agentic AI helps a supplier decide whether they can and should bid for a tender. It combines ADK 2.0 multi-agent workflows, a mandatory A2A Remote Evidence Audit Agent, MCP tools, OKF + RAG evidence grounding, a Bounded Evidence Quality Loop, typed and voice interaction, and a premium bilingual procurement cockpit.

## Current Status

Foundation, public repo, ADK scaffold, deterministic OKF/RAG services, sample data, A2A audit foundation, app-local MCP server, conformance tests, TenderLens eval dataset, API routes, voice gateway skeleton, and a Vercel-deployed cockpit UI are in place.

Public repository: https://github.com/syedzish/tenderlens-agentic-ai

Public demo: https://tenderlens-agentic-ai.vercel.app

Vercel: GitHub repo connected by the user. Root `package.json` and `vercel.json` build `frontend/` and publish `frontend/dist`; `frontend/vercel.json` also supports a Vercel project root set directly to `frontend`.

Production uploaded-file analysis should set `TENDERLENS_PUBLIC_BACKEND_URL` to the deployed backend runtime URL so multipart uploads go directly to FastAPI/Agent Runtime. Vercel `/api/*` proxy routes remain available for lightweight JSON calls through `AGENT_RUNTIME_ENDPOINT` or `TENDERLENS_BACKEND_URL`.

Final submission checklist: see `STEPS_TO_FINISH.md`.

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
- Tender Files workflow: Main Tender File, optional Supporting Files, 5 files total, 4 MB per file, 12 MB total
- Transient uploaded-file analysis for TXT, MD, DOCX, text-based PDF, and credential-backed JPG/PNG/WEBP image files with source-document citations
- Proof Behind This Recommendation and bid strategy simulator
- Example Files with Prepared Example Results to conserve API calls
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
GOOGLE_GENAI_USE_VERTEXAI=true
AGENT_RUNTIME_ENDPOINT=
TENDERLENS_BACKEND_URL=
TENDERLENS_PUBLIC_BACKEND_URL=
ALLOW_ORIGINS=
VOICE_AGENT_MODEL=
TENDERLENS_VISION_MODEL=
VOICE_SESSION_MAX_SECONDS=300
```

Use `.env.example` as the non-secret template.

## Current Verification

```bash
npm test
npm run build
npx playwright test --reporter=line
.venv\Scripts\python.exe -m unittest discover -s tests/unit -p "test_*.py"
.venv\Scripts\python.exe -m unittest discover -s tests/conformance -p "test_*.py"
.venv\Scripts\python.exe -m pytest tests/integration -q
.venv\Scripts\python.exe -c "from app.fast_api_app import app; print(app.title)"
```

When live Gemini or Vertex credentials are not present, the ADK root app uses the deterministic local TenderLens agent so imports, API routes, and integration tests remain reliable. With valid `GEMINI_API_KEY`/`GOOGLE_API_KEY` or Vertex env vars, the Gemini-backed router agent is enabled.

## Privacy Claims

- We do not save your uploaded files.
- We only listen when you start voice mode, and we do not save your voice.

These claims are implemented through Tender Files limits, transient TXT/MD/DOCX/text-PDF upload analysis, credential-backed JPG/PNG/WEBP image text extraction, no raw upload text in durable state/logs, explicit microphone start, visible voice controls, no raw audio retention, and session-scoped transcripts. Scanned or image-only PDFs fail with a clear extractable-text error rather than fake analysis.

## License

Code is licensed under Apache-2.0. Documentation and sample content provenance are tracked in `DATA_SOURCES.md`. Kaggle winner obligations and any separate asset licenses must be honored before final submission.
