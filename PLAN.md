# TenderLense Agentic AI Capstone Plan

## Summary

TenderLense Agentic AI is a production-grade Kaggle Agents for Business capstone project for bidder-side tender decisioning.

The application helps a supplier decide whether they can and should bid for a tender by analyzing tender requirements against a bidder profile, extracting structured tender knowledge into Google Open Knowledge Format (OKF), retrieving cited evidence with RAG, coordinating specialist agents through ADK 2.0 multi-agent workflows, using a mandatory A2A Remote Evidence Audit Agent as an independent reviewer, and producing a clear bid/no-bid recommendation, compliance gaps, risks, clarification questions, and action plan.

The app supports both typing mode and voice mode as v1 interaction paths. Voice mode starts only when the user clicks a Voice Mode button. It streams speech through the ADK Gemini Live API Toolkit, shows transcripts, returns concise spoken answers, and keeps citations and detailed tables visible in the cockpit.

The hero of the project is the agentic system: ADK agents, router behavior, mandatory A2A collaboration, MCP tools, graph workflow, parallel specialists, bounded evidence quality loop, voice streaming, evals, security, deployability, and observability. OKF + RAG is the evidence foundation that makes the agents grounded, inspectable, and useful.

- Track: Agents for Business
- Project name: TenderLense Agentic AI
- Workspace root: `D:\Projects\kaggle\tenderlense-agentic-ai`
- Repository: new public GitHub repo named `tenderlense-agentic-ai`
- Frontend: Vercel
- Backend: ADK 2.0 / Agents CLI / Agent Runtime
- Voice: ADK Gemini Live API Toolkit through a thin WebSocket voice gateway
- Default language: English
- Second full mode: Arabic with RTL layout and Arabic-native UI/content
- Upload: v1 feature, restricted to safe types, 5 MB max, transient processing, privacy-safe logs

## Product Scope

### Core User

The target user is a bidding company or supplier evaluating a public tender before preparing a proposal.

The app answers:

- Can we bid?
- Should we bid?
- What are the mandatory requirements?
- Which requirements match our company profile?
- Which requirements are hard blockers?
- What evidence supports the recommendation?
- What gaps must we fix before submission?
- What risks or disqualifiers exist?
- What clarification questions should we ask the tender issuer?
- What strategy improves our chance of winning?
- Can I discuss the tender naturally by voice instead of typing?

### Product Boundary

This app is bidder-side. It is not the old buyer-side TenderLens AI workflow where a tender issuer checks submitted vendor bids for compliance after submission.

Compliance checking is still included, but it is one specialist analysis inside bid/no-bid decisioning:

- Mandatory eligibility fit
- Required document checklist
- Submission format checks
- Disqualifier detection
- Gap list before deciding to bid

### Main Screens

- Tender intake cockpit
- Sample tender picker
- Secure upload panel
- Editable bidder profile panel
- Typing chat/input panel
- Voice mode button and voice session overlay
- Live transcript and spoken response status
- Analysis run progress
- Bid/no-bid decision dashboard
- Evidence War Room
- OKF concept graph
- Compliance and gap checklist
- Risk heatmap
- Strategy simulator
- Clarification questions
- A2A audit status and evidence-quality result
- Exportable action plan
- Arabic RTL mode

### UX Requirements

- First screen is the usable product, not a marketing landing page.
- The design should feel like an executive procurement cockpit rather than a generic chatbot.
- Fully responsive across desktop, tablet, and mobile.
- Dense but understandable, with stable dimensions for score panels, evidence cards, transcript panels, toolbars, timelines, and graph views.
- Arabic mode must mirror layout direction, navigation, evidence drawer placement, tables, and reading flow.
- A2A audit is visible as a professional trust signal, not technical clutter.
- Voice mode must make listening, thinking, speaking, muted, interrupted, reconnecting, error, and ended states obvious.
- Voice never starts recording automatically and must always show stop/end controls.
- All tender text, transcripts, and model output are treated as untrusted and sanitized before rendering.

## Required Features

### Tender Analysis

Analyze a curated public sample tender or a user-uploaded tender. The output must include bid/no-bid recommendation, confidence score, eligibility assessment, mandatory requirements, submission requirements, missing documents, key deadlines, evaluation criteria, risks, clarification questions, evidence citations, A2A audit result, and recommended next actions.

### Typing Mode

Typing mode remains available even if voice is unavailable. Users can run analysis, ask follow-up questions, inspect evidence, update strategy assumptions, and switch English/Arabic mode without losing session context.

### Voice Mode

Voice mode is opt-in. The user clicks Voice Mode, grants microphone permission, speaks naturally, receives streamed spoken responses, sees live transcripts, can interrupt, mute, end the session, and continues using the same TenderLense agent workflow.

Voice can:

- Trigger analysis on a selected curated tender.
- Discuss a previously uploaded tender after upload processing completes.
- Ask for tender summary, evidence, bid/no-bid reasoning, top risks, clarification questions, and strategy scenario changes.
- Use English by default and Arabic when supported by the selected Live API model and active app language.

### Company Profile Builder

The app includes a first-class bidder profile because bid/no-bid reasoning depends on bidder capabilities.

Profile fields include company name, industry/services, regions served, certifications, licenses, languages, relevant past projects, team capacity, budget range, delivery constraints, partner network, insurance/bonding readiness, and security/compliance capabilities.

The demo includes a sample profile and an editable profile panel. Profile data stays session-scoped for the public demo unless it is part of checked-in sample fixtures.

### Secure Upload

Upload is included in v1 and is intentionally bounded:

- Accept PDF, TXT, MD, and DOCX only where parser support is stable.
- Reject unsupported file types.
- Enforce 5 MB maximum file size.
- Process server-side only.
- Delete uploaded files and generated upload OKF bundles after analysis.
- Do not persist raw extracted text in durable logs or session state.
- Larger tenders should use curated/preprocessed OKF bundles in v1.
- Curated samples remain the reliable Kaggle demo path.

The 5 MB limit matches the previous TenderLens AI constraint, reduces parsing failures, reduces timeout risk, protects Vercel and Agent Runtime reliability, and keeps the demo predictable.

### OKF + RAG

Every curated sample tender should have a generated OKF bundle under `data/okf/<tender_id>/`. RAG retrieves from OKF concept documents, source tender sections, sample metadata, and bidder profile facts. Agents must cite evidence rather than making unsupported claims.

### Evidence War Room

The Evidence War Room is the primary visual wow feature. It shows key claims, supporting excerpts, OKF concept links, risk/compliance tags, confidence, producing/verifying agent, A2A audit status, filters, Arabic explanations with preserved citations, and highlighted evidence referenced during voice conversations.

### Bid Strategy Simulator

The simulator lets users adjust team capacity, margin, partnership availability, certification readiness, delivery confidence, risk appetite, and bid preparation budget. It updates bid/no-bid score, risk, recommended actions, strategic posture, and evidence-backed explanation. This is a user-driven scenario feature, separate from the ADK quality loop.

### Clarification Question Generator

The Clarification Question Agent generates practical tender issuer questions with category, question, why it matters, citation, priority, and whether it affects bid/no-bid. This must appear in the dashboard, export, README/writeup, and video.

## Architecture

Use a monorepo with microservice-style/component boundaries. The project may deploy as fewer physical services for deadline control, but code must stay separated by responsibility.

Planned structure:

```text
tenderlense-agentic-ai/
  .agents-cli-spec.md
  PLAN.md
  BOOKMARK.md
  README.md
  LICENSE
  DATA_SOURCES.md
  docs/
    SDD.md
    SOFTWARE_DESIGN.md
    ARCHITECTURE.md
    PRIVACY.md
    CONCEPT_MAP.md
    DEPLOYMENT.md
    EVALS.md
    diagrams/
  app/
    agents/
      router/
      specialists/
      a2a_audit/
      voice/
    workflows/
    services/
      okf/
      retrieval/
      scenario/
      profile/
      privacy/
      upload/
      sanitization/
      voice/
    mcp/
    api/
    voice_gateway/
  frontend/
    features/
      cockpit/
      evidence/
      voice/
      rtl/
  data/
    samples/
    okf/
    bidder_profiles/
  tests/
    unit/
    integration/
    conformance/
    eval/
    voice/
  scripts/
```

Exact scaffolded paths can be adjusted to match Agents CLI conventions after scaffolding, but boundaries must remain.

## ADK Agent System

Required concepts:

- ADK agent/multi-agent system
- Mandatory A2A Remote Evidence Audit Agent
- MCP server
- Security features
- Deployability
- Agents CLI lifecycle
- ADK graph workflow
- Router agent/orchestrator
- Parallel specialist analysis
- Bounded Evidence Quality Loop
- ADK Gemini Live API Toolkit voice streaming
- Evals
- Observability/tracing

### Pre-Parallel Agents And Services

- Router / Orchestrator Agent: accepts typed or voice intent, selected tender/profile context, coordinates specialists, enforces schema/citations, routes language mode, sends draft package to A2A audit, triggers the quality loop, and produces voice-suitable summaries.
- Voice Session Adapter: converts voice transcript events into agent turns, handles interruption, keeps spoken answers concise, preserves citations visually, and avoids raw audio retention.
- Intake Agent / Node: validates tender selection/upload metadata, bidder profile completeness, document language, file type, and 5 MB max size.
- OKF Builder / Selector: selects curated OKF bundles or creates transient uploaded-tender concepts, extracts tender entities, creates concept links, adds citations, and preserves OKF conformance.
- Retrieval Agent: queries OKF/RAG evidence, returns cited snippets, avoids unsupported claims, and joins the quality loop only when missing or weak evidence caused audit failure.

### Parallel Specialist Agents

These run over the same evidence package and bidder profile after intake/retrieval:

- Compliance Agent
- Eligibility / Profile Fit Agent
- Commercial Fit Agent
- Risk Agent
- Timeline Agent
- Bid Strategy Agent
- Clarification Question Agent

### Post-Parallel Agents

- Synthesis Agent: combines specialists, resolves conflicts, preserves citations, creates structured dashboard payloads, produces concise voice response payloads, packages evidence for A2A audit, and rebuilds reports after targeted revisions.
- Mandatory A2A Remote Evidence Audit Agent: a separate ADK agent exposed through A2A. It reviews the draft recommendation and evidence package, returns pass/fail, flags missing citations, unsupported claims, weak evidence, schema problems, privacy/logging concerns, Arabic issues, and voice answer issues.

### Bounded Evidence Quality Loop

Plain-English explanation: the system drafts the answer, audits it, fixes weak parts, audits again, and only then releases the final report.

Loop participants:

- Synthesis Agent
- A2A Evidence Audit Agent
- Router / Orchestrator Agent
- Targeted Specialist Agent, meaning whichever existing specialist needs to fix the failed section
- Retrieval Agent, only when missing or weak evidence caused the audit failure

Explicit flow:

```text
Synthesis Agent creates draft
  -> A2A Evidence Audit Agent reviews draft
  -> if passed, release final answer
  -> if failed, Router sends issue to the right specialist or Retrieval Agent
  -> specialist/retrieval fixes that section
  -> Synthesis Agent rebuilds report
  -> A2A Evidence Audit Agent reviews again
  -> stop after pass or max 2 revision rounds
```

Failure examples include missing citation, unsupported claim, weak evidence, invalid schema, Arabic language mismatch, voice response mismatch, privacy/logging concern, contradictory specialist outputs, and unreachable A2A audit. If still failing after max rounds, final output must clearly mark unresolved evidence gaps.

## Voice Mode Architecture

Voice mode is opt-in per session:

1. User clicks Voice Mode.
2. Browser requests microphone permission.
3. UI opens a voice overlay/docked panel.
4. WebSocket connects to the Voice Gateway.
5. Audio streams through ADK Live request queue and `runner.run_live()`.
6. Agent audio, transcript, audit, and dashboard events stream back.
7. User can interrupt, mute, or end.
8. Typing mode remains available.

The Voice Gateway is a thin adapter, not a second product brain. It should enforce duration limits, avoid raw audio logging/storage, and pass voice turns into the same Router workflow.

## MCP Server

Create an app-local MCP server named `tenderlense-mcp`.

Planned tools:

- `list_tenders`
- `get_tender_okf_index`
- `get_okf_concept`
- `search_evidence`
- `get_company_profile`
- `score_profile_against_requirement`
- `get_scoring_rubric`
- `simulate_strategy_overlay`
- `generate_clarification_question_candidates`
- `validate_okf_bundle`
- `get_upload_analysis_status`
- `get_voice_session_context`

Rules: strict tool filtering, schema validation, structured outputs, timeouts, no broad filesystem access, no upload temp path exposure, curated sample read-only access, transient uploaded/voice context, and clean connection lifecycle.

## OKF + RAG

OKF concept types include Tender, Buyer, Eligibility Requirement, Compliance Obligation, Submission Artifact, Evaluation Criterion, Deadline, Risk, Clarification Question, Strategy Lever, Evidence Source, Bidder Capability, and Profile Gap.

Validator checks YAML frontmatter, non-empty `type`, reserved filenames, `index.md` navigation, `log.md` date headings where present, citation sections, internal links, unknown fields as tolerated, and optional field warnings.

RAG chunks by concept/section where possible, preserves citation metadata, avoids mixing tenders, supports English/Arabic generation, supports voice-friendly summaries, and feeds specialists plus A2A audit.

## Security And Privacy

Demonstrated controls:

- File type validation
- 5 MB upload size limit
- Explicit voice start
- Voice session duration limits
- No raw audio retention
- No secrets in code
- `.env.example`
- Server-side env vars
- Vercel server-side proxy
- Sanitized frontend rendering
- Prompt injection guardrails
- Tool input validation
- MCP tool filtering
- Bounded Evidence Quality Loop
- A2A audit before final response
- Citation-required outputs
- Privacy-safe logging
- Safe upload and voice lifecycle

Public upload claim: "We do not save your uploaded files."

Public voice claim: "We only listen when you start voice mode, and we do not save your voice."

## Bilingual English + Arabic

English is default. Arabic is a full UI/content mode with RTL layout, mirrored layouts where appropriate, Arabic navigation and dashboard labels, Arabic explanations/risk/compliance/action plan, Arabic voice labels/transcripts, locale-aware dates/numbers where reasonable, preserved citations, and no session loss when switching languages.

If Arabic spoken output is unreliable, Arabic typed UI remains fully supported and the UI clearly states the voice limitation.

## Deployment

Backend deploys to Agent Runtime after explicit user approval. Voice deploys after typed core is stable. Preferred voice path is ADK Gemini Live API Toolkit with a WebSocket gateway and Vercel WebSockets/Fluid Compute if reliable. Cloud Run voice gateway is a fallback only after explicit approval. Frontend deploys to Vercel with server-side routes/proxy and no browser-exposed credentials.

Antigravity is stretch-only if available before recording.

## Testing And Evaluation

Unit tests cover OKF parser/validator, citations, internal links, metadata loading, bidder profile validation, scenario scoring, upload validation and cleanup, 5 MB rejection, language utilities, sanitization helpers, MCP schemas, voice schema validation, voice state reducer, and transcript sanitization.

Integration tests cover MCP tools, retrieval, profile matching, simulator shape, clarification questions, local A2A reachability, Router-to-A2A before final response, voice gateway start/cleanup, voice transcript routing, API behavior, frontend English/Arabic smoke, and 5 MB rejection before parsing.

Conformance tests verify expected agent paths:

- router -> MCP -> retrieval -> synthesis -> A2A audit -> final
- router -> profile -> compliance -> synthesis -> A2A audit
- router -> risk -> clarification questions -> synthesis -> A2A audit
- intake -> OKF validation -> retrieval
- strategy simulator -> scenario service -> synthesis
- voice transcript -> router -> retrieval -> synthesis -> A2A audit -> voice response
- synthesis -> A2A audit fail -> router -> targeted specialist/retrieval -> synthesis -> A2A audit

Agents CLI evals cover bid/no-bid correctness, citation grounding, tool quality, A2A behavior, quality loop behavior, hallucination resistance, safety, prompt injection resistance, Arabic quality, clarification usefulness, simulator consistency, voice transcript turns, and multi-turn completion.

Frontend QA uses Playwright/responsive checks across desktop/tablet/mobile, English/Arabic, upload errors, A2A status, voice controls, transcript layout, and sanitization.

## Milestones

### Milestone 0: Foundation And Documentation

Create the project folder, repo-ready structure, `PLAN.md`, `BOOKMARK.md`, `.agents-cli-spec.md`, `docs/SDD.md`, `docs/SOFTWARE_DESIGN.md`, `docs/ARCHITECTURE.md`, `docs/PRIVACY.md`, `docs/CONCEPT_MAP.md`, `DATA_SOURCES.md`, license, ADK/Agents CLI/MCP confirmation, Live Toolkit confirmation, and scaffold command plan.

Acceptance: docs define product, architecture, specs, privacy, A2A audit, quality loop, upload, voice, and eval targets before implementation code starts. `BOOKMARK.md` has the first task entry.

### Milestone 0.5: GitHub Repository

Initialize git, add `.gitignore`, commit foundation docs, create public GitHub repo `tenderlense-agentic-ai`, add remote, push initial commit, confirm URL, and add repo URL to README/BOOKMARK.

### Milestone 1: Agents CLI Scaffold

Run `agents-cli info`, scaffold/enhance the project with ADK agent and Agent Runtime target, include or prepare A2A and streaming support, install/sync dependencies, inspect generated structure, preserve scaffold conventions, update docs and bookmark.

### Milestone 2: Data, OKF, And Validator

Add curated sample tender metadata/text, generate OKF bundle, implement upload-to-transient extraction with 5 MB limit, implement OKF parser/validator/link/citation checks, tests, and data source docs.

### Milestone 3: MCP Server

Implement `tenderlense-mcp`, tool schemas/tools, tests, and strict ADK tool filtering.

### Milestone 4: Agent Workflow, A2A Audit, And Loop

Implement router, voice adapter, intake, retrieval, specialists, synthesis, A2A Evidence Audit Agent, A2A exposure/consumption, Bounded Evidence Quality Loop, max 2 revisions, graph wiring, schemas, smoke prompts, and conformance tests.

### Milestone 5: Backend API, Voice Gateway, And Privacy Controls

Define API and voice schemas, add analysis/upload/profile/scenario/language endpoints, upload validation/cleanup/logging controls, voice gateway, voice session limits/cleanup, transcript sanitization, and A2A status payloads.

### Milestone 6: Frontend Cockpit

Build design tokens, shell, tender picker, upload panel, bidder profile editor, typed input, voice panel, transcript, voice states/controls, progress, decision dashboard, Evidence War Room, OKF graph, compliance/risk/missing docs, strategy simulator, clarification questions, A2A audit panel, export/action plan, language switcher, Arabic RTL, sanitization, and responsive polish.

### Milestone 7: Evaluation And QA

Run tests/evals, add A2A, loop, voice, Arabic, and prompt injection cases, run frontend responsive checks, upload >5 MB validation, voice manual QA, build checks, and update docs.

### Milestone 8: Vercel Connection And Deployment

Prepare env vars, dry-run Agent Runtime, deploy backend only after explicit user approval, configure Vercel, test curated flow/upload/voice/Arabic/A2A, promote production, capture trace evidence, update deployment docs.

### Milestone 9: Kaggle Packaging

Finalize README, diagrams, `CONCEPT_MAP.md`, `DATA_SOURCES.md`, privacy docs, Kaggle writeup under 2,500 words, cover image, video under 5 minutes with voice/A2A/demo, project link, final checklist, one-submission rule, and secret check.

## Out Of Scope For V1

- Full BigQuery Agent Analytics
- Persistent user accounts
- Paid production multi-tenant storage
- Complex procurement ERP integrations
- Buyer-side submitted-bid compliance workflow
- Long-term storage of uploaded tenders
- Persistent voice recordings
- Phone-call/PSTN voice support
- Video/camera multimodal mode
- Speaker diarization
- Full Arabic legal translation guarantees
- Complex vector infrastructure unless safe under deadline

The code should remain compatible with adding these later.

## Reference Sources

- ADK Gemini Live API Toolkit: https://adk.dev/streaming/
- ADK streaming quickstart: https://adk.dev/get-started/streaming/quickstart-streaming/
- ADK streaming `run_live()` guide: https://adk.dev/streaming/dev-guide/part3/
- ADK audio/image/video guide: https://adk.dev/streaming/dev-guide/part5/
- ADK A2A docs: https://adk.dev/a2a/
- ADK A2A exposing quickstart: https://adk.dev/a2a/quickstart-exposing/
- Vercel WebSockets docs: https://vercel.com/docs/functions/websockets
- Vercel streaming functions docs: https://vercel.com/docs/functions/streaming-functions
