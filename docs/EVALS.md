# Evaluation Plan

## Goals

Evals should prove the agent is grounded, useful, safe, and clearly agentic.

## Deterministic Tests

Unit tests:

- OKF parser
- OKF validator
- Citation extraction
- Internal link scanning
- Tender metadata loading
- Bidder profile validation
- Scenario scoring
- Upload validation
- Rejecting files over 5 MB
- Upload cleanup
- Language utilities
- Sanitization helpers
- MCP schemas
- Voice WebSocket schema validation
- Voice session reducer
- Transcript sanitization

Integration tests:

- MCP tools return expected structures.
- Retrieval works over sample OKF.
- Bidder profile matching works against requirements.
- Strategy simulator output shape is stable.
- Clarification question output shape is stable.
- A2A Evidence Audit Agent is reachable locally.
- Router calls A2A before final response.
- Voice gateway accepts session start and cleanup.
- Voice transcript routes to Router workflow.
- Upload endpoint rejects >5 MB before parsing.
- Frontend smoke renders English and Arabic.

## Trajectory Tests

Expected paths:

- router -> MCP -> retrieval -> synthesis -> A2A audit -> final
- router -> profile -> compliance -> synthesis -> A2A audit
- router -> risk -> clarification questions -> synthesis -> A2A audit
- intake -> OKF validation -> retrieval
- strategy simulator -> scenario service -> synthesis
- voice transcript -> router -> retrieval -> synthesis -> A2A audit -> voice response
- synthesis -> A2A audit fail -> router -> targeted specialist/retrieval -> synthesis -> A2A audit

Assertions:

- Expected tools are called.
- A2A audit is called before final output.
- Evidence is retrieved before claims.
- Unsupported claims are rejected or revised.
- Missing citations trigger the loop.
- Retrieval only rejoins loop for missing/weak evidence.
- Max loop count is respected.
- Voice responses remain concise and grounded.

## Agents CLI Eval Cases

Start with 1-2 and expand:

- Clear bid
- Clear no-bid
- Missing certification
- Ambiguous eligibility
- Timeline too tight
- High commercial risk
- Missing citation triggers A2A revision
- A2A audit fails unresolved claim after max loop
- Prompt injection in tender text
- Arabic mode report
- Clarification questions required
- Scenario change flips recommendation
- Voice transcript asks "Can we bid?"
- Voice transcript asks for top three risks
- Voice transcript asks to switch to Arabic

## Frontend QA

Use Playwright or equivalent for:

- Desktop, tablet, mobile
- English LTR
- Arabic RTL
- No text overlap
- No button overflow
- Evidence drawer usability
- OKF/cockpit sections visible
- Language switch preserves state
- Upload validation errors
- Clear 5 MB upload error
- A2A audit status visible
- Voice button visible
- Voice permission/error states
- Voice transcript layout
- Voice end/mute/interrupt controls
- Sanitization render test

## Manual Voice QA

Because real microphone/audio can be difficult to automate fully, manually verify:

- Voice mode starts only after button click.
- Browser permission prompt appears.
- User speaks a tender question.
- Transcript appears.
- Agent speaks response.
- User interrupts response.
- Evidence panel highlights relevant sources.
- User ends voice mode.
- Microphone stops.
- Typing remains usable.
- No raw audio files are created.
