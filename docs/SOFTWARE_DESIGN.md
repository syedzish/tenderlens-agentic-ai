# Software Design Document

This document is the engineering blueprint. It is separate from `docs/SDD.md`, which is the Specification-Driven Development document.

## Component Boundaries

### Frontend

Responsibility:

- Render the procurement cockpit.
- Manage language mode, local UI state, upload form state, and voice controls.
- Call server-side routes for analysis, upload, profile, scenario, and voice WebSocket connections.
- Never expose Agent Runtime or Live API secrets.
- Sanitize all model, tender, and transcript content before rendering.

### Backend API

Responsibility:

- Provide typed analysis, upload, profile, scenario, and health endpoints.
- Validate request schemas.
- Enforce upload max size and supported type checks before parsing.
- Call ADK agent runtime locally/deployed.
- Return dashboard-ready structured payloads.

### Voice Gateway

Responsibility:

- Accept browser WebSocket sessions only after explicit Voice Mode start.
- Forward audio/text into ADK Live API Toolkit.
- Stream transcripts, audio, dashboard patches, and audit events back.
- Enforce voice session duration and cleanup.
- Avoid storing raw audio.

### ADK Agent Layer

Responsibility:

- Router orchestration.
- Graph workflow.
- Parallel specialists.
- Synthesis.
- A2A audit call.
- Bounded Evidence Quality Loop.
- Structured output contracts.

### MCP Layer

Responsibility:

- Expose controlled tools for tender, OKF, evidence, profile, scenario, upload status, and voice context.
- Validate tool inputs.
- Avoid broad filesystem access.
- Keep transient upload and voice state private.

### Data Layer

Responsibility:

- Store curated sample tenders, OKF bundles, and sample bidder profiles.
- Never store user uploads or raw audio.
- Mark synthetic/public sample data in `DATA_SOURCES.md`.

## Agent Contracts

### Router / Orchestrator

Input:

- user intent
- tender/profile context
- language mode
- interaction mode
- optional scenario assumptions

Output:

- structured decision report
- dashboard payload
- voice summary when active
- audit status

### Specialist Output Shape

Each specialist returns:

- specialist name
- findings
- cited evidence ids
- confidence
- blockers/gaps/risks where relevant
- recommended actions

### Synthesis Output Shape

Synthesis returns:

- recommendation
- confidence
- cross-specialist rationale
- sections for dashboard
- evidence package for A2A audit
- voice-safe summary if applicable

### A2A Audit Contract

The A2A Evidence Audit Agent receives:

- draft report
- evidence package
- citations
- specialist outputs
- language mode
- voice payload when active
- privacy flags

It returns:

- status
- issues
- revision instructions
- unresolved issue severity
- audited claim metadata

## Voice WebSocket Message Shapes

Minimum categories:

- `session.start`: client opens voice session.
- `session.ready`: gateway accepted session.
- `audio.chunk`: client microphone audio chunk.
- `audio.end`: client finished a chunk/turn.
- `transcript.partial`: partial user transcript.
- `transcript.final`: final user transcript.
- `agent.text.partial`: partial model text.
- `agent.audio.chunk`: model audio bytes.
- `agent.turn.complete`: voice turn complete.
- `agent.interrupted`: user interrupted output.
- `dashboard.patch`: UI update from agent workflow.
- `audit.status`: A2A audit progress/result.
- `error`: structured error.
- `session.end`: voice session ended and buffers cleared.

Exact schema should use typed models before implementation.

## Upload Validation Contract

- Validate Tender Files metadata as a set, not only as isolated files.
- Require exactly one Main Tender File for uploaded analysis.
- Allow optional Supporting Files.
- Reject more than 5 files total before parsing.
- Reject files larger than 5 MB each before parsing.
- Reject Tender Files larger than 12 MB total before parsing.
- Reject unsupported extension/MIME combinations.
- Do not expose temp paths to frontend.
- Delete temp file in `finally` block or equivalent cleanup path.
- Mark generated uploaded OKF as transient.
- Do not place raw extracted text in durable session state.
- Preserve source role and safe filename metadata so citations can show Main Tender File or Supporting File source.
- The API exposes `/api/upload/tender-files/validate` for metadata validation and `/api/upload/analyze` for transient uploaded-file analysis.
- Uploaded live text analysis currently parses TXT, MD, and DOCX with in-memory standard-library extraction.
- PDF files remain metadata-validated, but PDF text analysis is not claimed until a reliable parser dependency is intentionally added.
- Uploaded analysis returns a normal `DecisionReport` with `source_documents`, source-file citations, A2A audit status, and workflow trace.

## Bounded Evidence Quality Loop Contract

- Max revision rounds: 2.
- A2A audit must run before final release.
- Missing citations and unsupported claims fail audit.
- Router maps audit failures to an existing specialist or Retrieval.
- Retrieval participates only for missing/weak evidence.
- If the loop ends still failing, final report marks unresolved evidence gaps.

## Failure Modes

- A2A audit unavailable: return visible audit-unavailable status and do not silently pass.
- Upload parsing fails: show clear error and delete temp files.
- Voice WebSocket fails: show error, preserve typed mode and analysis state.
- Arabic spoken output unavailable: keep Arabic typed mode and indicate voice limitation.
- Agent runtime timeout: show retry/fallback state and keep sample demo usable.
- Prompt injection found in tender text: treat as untrusted document content and cite only as evidence, not instruction.

## Deployment Topology

- Frontend on Vercel.
- Main ADK backend on Agent Runtime.
- Voice gateway on Vercel WebSockets/Fluid Compute if reliable.
- Cloud Run voice gateway fallback only after explicit approval.
- Server-side Vercel routes call backend services.

## Security Notes

- All secrets are server-side.
- Use `.env.example` only in repo.
- Render untrusted text through sanitization utilities.
- Keep MCP tools narrow and schema-validated.
- Keep loops bounded.
- Do not persist user-uploaded files, raw uploaded text, raw audio, or hidden voice transcripts.
