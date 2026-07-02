# Specification-Driven Development

This SDD defines expected behavior before implementation. In this project, SDD means Specification-Driven Development, not Software Design Document.

## Product Objective

TenderLens Agentic AI helps a supplier decide whether to bid for a tender by combining structured tender evidence, bidder profile fit, ADK multi-agent analysis, mandatory A2A audit, and typed/voice interaction.

## Primary User Stories

### Bidder Decisioning

As a bidding manager, I want to select a sample tender and analyze it against my company profile so that I can decide whether to bid.

Acceptance:

- User can pick a curated tender without logging in.
- User can edit the sample bidder profile before analysis.
- Analysis returns a bid/no-bid recommendation, confidence, key reasons, risks, gaps, deadlines, clarification questions, and action plan.
- Material claims include citations.
- A2A audit status is visible before the final report is shown.

### Secure Upload

As a bidding manager, I want to upload a small tender document so that I can test my own opportunity without the app storing my file.

Acceptance:

- Upload accepts only supported extensions where parser support exists.
- Files over 5 MB are rejected before parsing.
- Unsupported files show a clear error.
- Uploaded file bytes and transient OKF are deleted after analysis.
- Raw uploaded text is not logged or persisted.
- Voice can discuss uploaded results only after upload processing completes.

### Evidence War Room

As a decision maker, I want to inspect the evidence behind claims so that I can trust or challenge the recommendation.

Acceptance:

- Claims show supporting excerpts and citations.
- Claims show producing or verifying agent.
- Filters cover eligibility, compliance, risk, deadline, pricing, and strategy.
- A2A audit status is visible per claim when available.
- Arabic mode renders explanations in Arabic while preserving source citations.

### Voice Mode

As a user, I want to talk to the agent naturally so that I can explore a tender hands-free.

Acceptance:

- Microphone starts only after Voice Mode button click.
- Browser permission handling is clear.
- User sees listening, thinking, speaking, muted, interrupted, reconnecting, error, and ended states.
- User sees live transcript.
- User can mute, interrupt, and end.
- Voice routes to the same Router workflow as typing.
- Voice responses are concise and grounded.
- Detailed tables remain visual rather than spoken.
- Raw audio is not stored or logged.

### Arabic Mode

As an Arabic-speaking user, I want the app to work as an Arabic-native procurement cockpit.

Acceptance:

- English is default.
- Arabic mode uses RTL layout.
- Navigation, panels, transcript, risk labels, compliance labels, clarification questions, and action plan render in Arabic.
- Layout mirrors meaningfully.
- No content overlaps on mobile.
- A2A audit flags language mismatches.

## Core Input Contracts

### Analysis Request

- `tender_id` or uploaded tender reference
- bidder profile
- language mode: `en` or `ar`
- interaction mode: `typing` or `voice`
- optional user question
- optional scenario assumptions

### Bidder Profile

Required fields:

- company name
- services
- regions served
- certifications/licenses
- languages
- past projects
- capacity
- budget range
- delivery constraints
- partner network
- insurance/bonding readiness
- security/compliance capabilities

### Voice Turn

- session id
- transcript text
- language mode
- selected tender/profile context
- interruption/mute state
- optional active dashboard state

## Core Output Contracts

### Decision Report

- recommendation: `bid`, `no_bid`, or `conditional_bid`
- confidence score
- executive summary
- eligibility result
- compliance checklist
- missing documents
- deadline summary
- risks
- clarification questions
- strategy recommendations
- evidence items
- A2A audit result
- unresolved evidence gaps, if any
- voice response summary when relevant

### A2A Audit Result

- status: `pass`, `fail`, or `unavailable`
- issue list
- revision instructions
- audited claims
- missing citation count
- unsupported claim count
- language issues
- voice grounding issues
- privacy/logging concerns

## Non-Functional Requirements

- Public demo opens without login or paywall.
- Curated sample path is reliable.
- Upload max is 5 MB.
- Typed mode works even if voice fails.
- Voice session duration default is 300 seconds.
- No secrets in repo.
- No browser-exposed backend credentials.
- All browser-rendered model/tender/transcript content is sanitized.
- The agent loop is bounded to max 2 revision rounds.
- Tests and evals cover happy paths, failures, language mode, and prompt injection.

## Kaggle Concept Coverage Targets

- ADK multi-agent system: code and video
- MCP server: code
- Mandatory A2A Remote Evidence Audit Agent: code and visible UI status
- Security features: code and video
- Deployability: docs/video/deployment config
- Agent skills / Agents CLI: repo scaffold and evals
- Graph workflow: code/docs
- Parallel workflow: specialist block
- Loop workflow: Bounded Evidence Quality Loop
- Voice streaming: ADK Gemini Live API Toolkit path
- OKF + RAG: evidence foundation
- Observability/evals: docs and test artifacts
