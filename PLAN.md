# TenderLens Agentic AI Capstone Plan

## Summary

TenderLens Agentic AI is a production-grade Kaggle Agents for Business capstone project for bidder-side tender decisioning.

The application helps a supplier decide whether they can and should bid for a tender by analyzing tender requirements against a bidder profile, extracting structured tender knowledge into Google Open Knowledge Format (OKF), retrieving cited evidence with RAG, coordinating specialist agents through ADK 2.0 multi-agent workflows, using a mandatory A2A Remote Evidence Audit Agent as an independent reviewer, and producing a clear bid/no-bid recommendation, compliance gaps, risks, clarification questions, and action plan.

The app supports both typing mode and voice mode as v1 interaction paths. Voice mode starts only when the user chooses the voice option inside Discuss with TenderLens. It streams speech through the ADK Gemini Live API Toolkit, shows transcripts, returns concise spoken answers, and keeps citations and detailed tables visible in the cockpit.

The user-facing product language must feel like TenderLens AI, not like an engineering tool. The main UI should use clear labels such as How to Use, Analysis, Discuss with TenderLens, Tender Map, Briefing Deck, Tender Questions, Proof Behind This Recommendation, Evidence Checked, Gaps to Fix, Risks to Watch, and Next Actions. Technical terms such as ADK, A2A, MCP, OKF, RAG, graph workflow, synthesis agent, and bounded loop remain important in code, documentation, tests, README, `docs/CONCEPT_MAP.md`, Kaggle writeup, and optional "how it works" explanations, but they should not dominate the primary user interface.

For preloaded example files, the UI must be transparent without using wording that feels fake or confusing. Use product copy such as Preloaded Example Files, Pre-generated Example Results, Prepared example result, and Conserves API calls. Avoid user-facing phrases such as demo result, production result, fallback result, fake result, or mock result in the main UI. Technical deployment/production terminology can remain in developer docs where unavoidable.

The hero of the project is the agentic system: ADK agents, router behavior, mandatory A2A collaboration, MCP tools, graph workflow, parallel specialists, bounded evidence quality loop, voice streaming, evals, security, deployability, and observability. OKF + RAG is the evidence foundation that makes the agents grounded, inspectable, and useful.

- Track: Agents for Business
- Project name: TenderLens Agentic AI
- Workspace root: `D:\Projects\kaggle\tenderlens-agentic-ai`
- Repository: new public GitHub repo named `tenderlens-agentic-ai`
- Frontend: Vercel
- Backend: ADK 2.0 / Agents CLI / Agent Runtime
- Voice: ADK Gemini Live API Toolkit through a thin WebSocket voice gateway
- Default language: English
- Second full mode: Arabic with RTL layout and Arabic-native UI/content
- Upload: v1 Tender Files feature with one Main Tender File and optional Supporting Files, up to 5 files total, 5 MB per file, 12 MB total, transient processing, privacy-safe logs

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
- What Tender Questions should we ask the tender issuer?
- What questions might the tender issuer ask us after reviewing our bid?
- What answers, documents, and proof should we prepare before submission?
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

- How to Use
- Analysis
- Discuss with TenderLens
- Tender Map
- Briefing Deck
- Tender Questions
- Tender intake cockpit
- Preloaded Example Files picker
- Tender Files upload panel
- Main Tender File upload area
- Supporting Files upload area
- Use Preloaded Example Files action
- Replace file / remove supporting file controls
- Editable bidder profile panel
- Discuss with TenderLens typed chat/input panel
- Discuss with TenderLens voice button and voice session overlay/dock
- Live transcript and spoken response status
- Analysis run progress
- Bid/no-bid decision dashboard
- Proof Behind This Recommendation
- Tender Map backed by OKF concept graph data
- Compliance and gap checklist
- Risk heatmap
- Strategy simulator
- Tender Questions: Ask the Issuer
- Tender Questions: Prepare to Answer
- Evidence Checked / Independent Review status backed by A2A audit
- Briefing Deck with exportable action plan content
- Arabic RTL mode
- First-time help popup / onboarding guide

Primary navigation order:

1. How to Use
2. Analysis
3. Discuss with TenderLens
4. Tender Map
5. Briefing Deck
6. Tender Questions

### UX Requirements

- First screen is the usable product, not a marketing landing page.
- The design should feel like an executive procurement cockpit rather than a generic chatbot.
- Main navigation and section labels must use user-friendly TenderLens AI wording, not implementation jargon.
- Technical concepts should be translated into helpful product language in the primary UI: Evidence Checked instead of A2A Evidence Audit, Tender Map instead of OKF Concept Graph, Proof Behind This Recommendation instead of Evidence War Room, Discuss with TenderLens instead of Ask the agent, and Tender Questions instead of Clarification Questions.
- Fully responsive across desktop, tablet, and mobile.
- Dense but understandable, with stable dimensions for score panels, evidence cards, transcript panels, toolbars, timelines, and graph views.
- Arabic mode must mirror layout direction, navigation, evidence drawer placement, tables, and reading flow.
- The A2A audit is visible to users as Evidence Checked or Independent Review, a professional trust signal rather than technical clutter.
- Voice mode must make listening, thinking, speaking, muted, interrupted, reconnecting, error, and ended states obvious.
- Voice never starts recording automatically and must always show stop/end controls.
- Voice controls belong inside Discuss with TenderLens, beside the typed input, not in the global header.
- The app must include a friendly How to Use TenderLens page and first-time help popup similar to the previous TenderLens AI app.
- The help experience must explain what to do next in plain business language, without exposing technical labels as the main teaching path.
- All tender text, transcripts, and model output are treated as untrusted and sanitized before rendering.

## Required Features

### User-Friendly Product Language And Navigation

The UI must preserve the familiar TenderLens AI product language while the underlying implementation remains agentic and technically rigorous.

Primary user-facing feature labels:

- How to Use
- Analysis
- Discuss with TenderLens
- Tender Map
- Briefing Deck
- Tender Questions

The primary navigation order is fixed:

1. How to Use
2. Analysis
3. Discuss with TenderLens
4. Tender Map
5. Briefing Deck
6. Tender Questions

Technical-to-friendly label mapping:

- OKF Concept Graph -> Tender Map
- Clarification Questions / Questions for issuer -> Tender Questions > Ask the Issuer
- TenderLens AI-style evaluator questions -> Tender Questions > Prepare to Answer
- A2A Evidence Audit -> Evidence Checked or Independent Review
- Evidence War Room -> Proof Behind This Recommendation
- Typing Mode / Ask the agent / earlier chat-label wording -> Discuss with TenderLens
- Export/action plan -> Briefing Deck plus action plan content

Implementation rule:

- The primary UI must lead with friendly product wording.
- Technical labels may appear in developer docs, concept evidence docs, architecture diagrams, Kaggle writeup, and optional "how it works" details.
- Technical labels should not be the dominant wording on dashboard tabs, major headings, primary actions, or empty/error states.
- The product should feel like a polished procurement assistant that a business user can operate without knowing ADK, MCP, OKF, RAG, or A2A terminology.

Dedicated main-section icon direction:

- How to Use: compass / guide icon in warm brass.
- Analysis: lens or decision gauge icon in forest green.
- Discuss with TenderLens: chat bubble with microphone accent in deep teal.
- Tender Map: connected map nodes icon in blueprint blue.
- Briefing Deck: slide stack / presentation icon in plum or aubergine.
- Tender Questions: question cards / checklist-question icon in amber or copper.

Icon rules:

- Every main section gets a unique premium icon, not repeated generic symbols.
- Each icon has a dedicated color while staying inside one coherent palette.
- Icons should help users recognize destinations quickly without needing technical labels.
- Icon style should be refined, geometric, procurement-grade, and compatible with lucide-style UI icons if implemented in code.

Brand logo direction:

- Create a proper TenderLens brand mark, not a plain `TL` box.
- Preferred concept: a refined lens shape around a folded tender page, with a subtle check path, signal line, or map node inside.
- The logo should communicate seeing through tender complexity, evidence clarity, and bid decision confidence.
- The logo should feel premium procurement/AI, not playful, not generic chatbot, and not dependent on English-only lettering.
- It must work at small sizes for app chrome, favicon/app icon, deck cover, and Arabic UI.
- Avoid generic AI sparkles, random magic marks, overused chatbot bubbles, and overly complex seals.

Visual design direction:

- The app should not feel plain white, empty, or sterile.
- Use a warm ivory or paper base rather than pure white.
- Use rich dark green/ink for header, sidebar, or major framing surfaces.
- Use subtle tinted panels, brass accents, blueprint/document texture, fine grid lines, and strong contrast blocks for important areas.
- The mood should be polished, warm, rich, professional, and boardroom-ready.
- The app should feel like a premium procurement cockpit with clear scan paths, not a generic SaaS template.
- UI implementation may proceed after the user explicitly approves or instructs Codex to start working from the approved direction.

### How to Use TenderLens And First-Time Help Popup

The app must include a user-friendly How to Use TenderLens page or view and a first-time help popup similar to the previous TenderLens AI app.

Purpose:

- Help a new user understand the product in under one minute.
- Make the app approachable for non-technical users.
- Explain the workflow with TenderLens product language rather than implementation terms.
- Reduce confusion around Analysis, Discuss with TenderLens, Tender Map, Briefing Deck, and Tender Questions.

How to Use TenderLens page:

- Accessible from the app header or a clearly visible help button.
- Uses the label How to Use TenderLens.
- Explains the primary workflow:
  - Choose Preloaded Example Files or upload your Tender Files.
  - Review Analysis.
  - Discuss with TenderLens by typing or talking.
  - Explore Tender Map to understand connected requirements, risks, deadlines, and gaps.
  - Review Proof Behind This Recommendation.
  - Use Tender Questions before submitting.
  - Generate a Briefing Deck for the internal bid decision meeting.
- Explains Tender Map clearly:
  - Tender Map is the visual map of the tender, not a technical graph for engineers.
  - It connects eligibility, required documents, deadlines, risks, evaluation criteria, gaps, evidence, and actions so the user can see why the recommendation was made.
  - It should use friendly node labels and citations, while OKF remains the hidden evidence structure behind it.
- Explains Tender Questions clearly:
  - Ask the Issuer means questions the bidder may send to the tender-releasing organization before submission.
  - Prepare to Answer means questions the tender-releasing organization or evaluation committee may ask the bidder after reviewing the proposal.
  - The How to Use page must make this difference obvious so users do not confuse Tender Questions with asking app support or the developer.
- Explains Briefing Deck clearly:
  - Briefing Deck is a boardroom-ready slide carousel for the internal bid/no-bid meeting.
  - The slides summarize the decision, tender fit, gaps, risks, proof, Tender Questions, and action plan.
  - The How to Use page should show that Briefing Deck is not just a download button; it is a prominent in-app executive preview.
- Includes a "What you will get" section:
  - Bid/no-bid recommendation
  - Confidence score
  - Gaps to fix
  - Risks to watch
  - Proof Behind This Recommendation
  - Tender Map
  - Tender Questions
  - Briefing Deck
  - Action plan
- Includes an example output preview:
  - Decision example, such as Bid with watch item.
  - Confidence example, such as 90%.
  - Top gaps example, such as Confirm HVAC subcontractor capacity.
  - Evidence quote example with source file/section citation.
  - Tender Map preview with a few connected nodes.
  - Sample Tender Questions split into Ask the Issuer and Prepare to Answer.
  - Briefing Deck preview showing a few slide titles.
- Includes short, business-friendly examples of what a user can ask.
- Example Discuss with TenderLens questions should include:
  - Can we bid for this tender?
  - What are the top three risks?
  - Which missing items could disqualify us?
  - Show me the proof behind the recommendation.
  - What should we ask the issuer before submitting?
  - What questions should we be ready to answer?
  - What changes if we add a local subcontractor?
- Includes a sample files section:
  - Uses the label Preloaded Example Files.
  - Explains that preloaded example files help users explore the workflow quickly.
  - Explains that preloaded example files use pre-generated example results to conserve API calls.
  - Explains that uploaded Tender Files are analyzed when the user runs them.
- Includes upload privacy wording: "We do not save your uploaded files."
- Includes voice privacy wording: "We only listen when you start voice mode, and we do not save your voice."
- Includes this exact preloaded-file privacy/transparency note in friendly wording:
  - "The preloaded example shows prepared results from a sample tender so you can understand the workflow without waiting or using API quota. When you upload your own Tender Files, TenderLens analyzes those files for your session."
- Avoids dominant technical labels such as ADK, A2A, MCP, OKF, RAG, graph workflow, synthesis agent, and bounded loop.
- May include a small optional "How the evidence is checked" explanation, but the main content remains user-friendly.

First-time help popup:

- Appears when the user first opens the app.
- Uses concise onboarding copy, ideally 3 to 5 steps.
- Offers clear actions:
  - Start with Preloaded Example Files
  - Upload my tender
  - Open How to Use
  - Don't show again
- "Don't show again" should be stored locally in the browser, for example with `localStorage`, because the public demo has no user accounts.
- Popup must be dismissible and must not block keyboard or screen-reader users from leaving it.
- Popup must not start voice recording or analysis automatically.
- Popup should be helpful without feeling like a marketing modal.

Contextual help:

- Key areas should include small, unobtrusive help affordances where useful:
  - Analysis
  - Discuss with TenderLens
  - Tender Map
  - Briefing Deck
  - Tender Questions
  - Upload
  - Voice
- Help copy must be short, practical, and action-oriented.
- Tooltips or help panels should not hide required controls or overlap content on mobile.

### Preloaded Example Files And Pre-generated Example Results

The app should preserve the transparent TenderLens AI pattern for preloaded files while adapting it to TenderLens Agentic AI.

User-facing labels:

- Preloaded Example Files
- Pre-generated Example Results
- Prepared example result
- Conserves API calls

Primary action:

- Use Preloaded Example Files

Result badge:

- Pre-generated example result

Short note:

- "Preloaded example files use pre-generated example results so you can explore TenderLens quickly and conserve API calls. Your uploaded Tender Files are analyzed when you run them."

How to Use copy:

- "The preloaded example shows prepared results from a sample tender so you can understand the workflow without waiting or using API quota. When you upload your own Tender Files, TenderLens analyzes those files for your session."

Analysis page transparency banner:

- "You are viewing pre-generated example results for the preloaded files. Upload your own Tender Files to run a new analysis."

Behavior:

- The Use Preloaded Example Files action should load the prepared sample result by default.
- The prepared sample result should include Analysis, Proof Behind This Recommendation, Tender Map, Briefing Deck, Tender Questions, and Discuss with TenderLens context.
- The prepared sample result should be clearly marked with the Pre-generated example result badge.
- Preloaded files conserve API calls and keep the public sample experience reliable.
- Uploaded Tender Files still use live analysis when the user runs them.
- If live analysis is temporarily unavailable, the UI should explain the issue in friendly language without pretending that a live run succeeded.
- Do not use user-facing labels such as demo result, production result, fallback result, fake result, or mock result in the main UI.
- Technical docs may still use deployment, production, or fallback language where needed for engineering clarity, but not as primary product wording.

### Tender Analysis

Analyze a curated public sample tender or a user-uploaded tender. The output must include bid/no-bid recommendation, confidence score, eligibility assessment, mandatory requirements, submission requirements, missing documents, key deadlines, evaluation criteria, risks, clarification questions, evidence citations, A2A audit result, and recommended next actions.

### Typing Mode

Typing mode remains available even if voice is unavailable. Users can run analysis, ask follow-up questions, inspect evidence, update strategy assumptions, and switch English/Arabic mode without losing session context.

Typing mode appears inside Discuss with TenderLens. Users should experience it as a conversation with TenderLens about the selected or uploaded tender files, not as a generic chatbot panel.

### Voice Mode

Voice mode is opt-in and lives inside Discuss with TenderLens, beside the typed question input. The user clicks the voice option in Discuss with TenderLens, grants microphone permission, speaks naturally, receives streamed spoken responses, sees live transcripts, can interrupt, mute, end the session, and continues using the same TenderLens agent workflow.

Voice can:

- Trigger analysis on a selected curated tender.
- Discuss a previously uploaded tender after upload processing completes.
- Ask for tender summary, evidence, bid/no-bid reasoning, top risks, clarification questions, and strategy scenario changes.
- Use English by default and Arabic when supported by the selected Live API model and active app language.
- Use the same tender evidence, bidder profile, analysis result, Proof Behind This Recommendation, Tender Map, Tender Questions, and Briefing Deck context as typed Discuss with TenderLens turns.

Voice placement requirements:

- No voice button in the global header.
- The voice button/control appears inside Discuss with TenderLens as an alternate input mode.
- Voice should clearly explain if upload processing is incomplete and should not discuss an uploaded tender until its analysis context is ready.
- Typing remains usable if voice permission, Live API, WebSocket, or microphone access fails.

### Company Profile Builder

The app includes a first-class bidder profile because bid/no-bid reasoning depends on bidder capabilities.

Profile fields include company name, industry/services, regions served, certifications, licenses, languages, relevant past projects, team capacity, budget range, delivery constraints, partner network, insurance/bonding readiness, and security/compliance capabilities.

The demo includes a sample profile and an editable profile panel. Profile data stays session-scoped for the public demo unless it is part of checked-in sample fixtures.

### Tender Files Upload

Upload is included in v1 and is intentionally bounded. The user-facing label should be Tender Files, not a technical package label.

Tender Files has two upload areas:

- Main Tender File
- Supporting Files

Main Tender File:

- Exactly one Main Tender File is required for an uploaded analysis.
- It should be the tender/RFP/RFQ/solicitation document that defines the opportunity.
- The Main Tender File is the authoritative source for the analysis.
- The user can replace the Main Tender File before running or rerunning analysis.

Supporting Files:

- Supporting Files are optional.
- Supporting Files can include addenda, BOQ, scope appendix, evaluation appendix, pricing schedule, drawings, terms, SLA appendix, compliance appendix, or other tender-issued attachments.
- Supporting Files add evidence and context but do not override the Main Tender File unless clearly labeled as an addendum, clarification, revised version, or later-dated official document.
- The user can add, remove, or replace supporting files before rerunning analysis.

User-facing upload actions:

- Use Preloaded Example Files
- Upload Main Tender File
- Add Supporting Files
- Replace file
- Remove file
- Run Analysis

File rules:

- Up to 5 files total.
- 5 MB maximum per file.
- 12 MB maximum total upload size.
- Accept PDF, DOCX, TXT, and MD only where parser support is stable.
- Images such as JPG, PNG, and WEBP are stretch-only and should be enabled only if parser/OCR support is stable.
- Reject unsupported file types.
- Reject empty files.
- Reject fake/malformed files when signature/content validation is available.
- Process files server-side only.
- Do not expose upload temp paths to the browser.
- Larger or complex tender file sets should use curated/preprocessed OKF bundles in v1.
- Curated sample files remain the reliable Kaggle demo path.

Source precedence:

- Main Tender File is authoritative.
- Supporting Files add evidence, detail, attachments, and context.
- Addenda or revised documents can override earlier content only when clearly labeled/versioned.
- If sources conflict, the app must show the conflict rather than silently choosing one.
- The A2A Evidence Audit Agent should flag unsupported overrides, weak evidence, or conflicting source precedence.

Citations by file:

- Every evidence item should show source file name.
- Every evidence item should show section, page, clause, heading, or excerpt location when available.
- Evidence cards should clearly distinguish Main Tender File evidence from Supporting Files evidence.
- Discuss with TenderLens, Tender Map, Briefing Deck, and Tender Questions must preserve file-level citations.

OKF/RAG upload behavior:

- Uploaded files create a transient OKF bundle for the active analysis only.
- Transient OKF includes `source_documents` metadata for the Main Tender File and each Supporting File.
- OKF concepts link back to the source document role, file name, and section/page metadata where available.
- RAG retrieval must not mix evidence across different uploaded file sets or curated samples.
- The Retrieval Agent should prefer Main Tender File evidence for core eligibility and submission requirements, then use Supporting Files for detail and clarification.

Privacy:

- All uploaded Main Tender File and Supporting Files are transient.
- Delete uploaded files after analysis.
- Delete generated upload OKF bundles after analysis.
- Do not persist raw extracted text in durable logs or session state.
- Do not include raw tender text in telemetry.
- Keep only user-visible derived analysis in the active session when needed.
- The public copy remains: "We do not save your uploaded files."

The 5 MB per-file limit and 12 MB total limit intentionally reuse the spirit of the previous TenderLens AI guardrails while giving this bidder-side app enough room for realistic tender attachments. These limits reduce parsing failures, reduce timeout risk, protect Vercel and Agent Runtime reliability, and keep the Kaggle demo predictable.

### OKF + RAG

Every curated sample tender should have a generated OKF bundle under `data/okf/<tender_id>/`. RAG retrieves from OKF concept documents, source tender sections, sample metadata, and bidder profile facts. Agents must cite evidence rather than making unsupported claims.

### Evidence War Room

The Evidence War Room is the primary visual wow feature. It shows key claims, supporting excerpts, OKF concept links, risk/compliance tags, confidence, producing/verifying agent, A2A audit status, filters, Arabic explanations with preserved citations, and highlighted evidence referenced during voice conversations.

User-facing naming:

- The primary UI label should be Proof Behind This Recommendation.
- Evidence War Room can remain a technical/product-internal name in docs, writeup, and handoff notes.
- A2A audit status inside this feature should appear as Evidence Checked or Independent Review.

### Tender Map

Tender Map is the user-facing version of the OKF concept graph.

It should help business users understand the tender as connected parts:

- Eligibility
- Required documents
- Deadlines
- Pricing/commercial terms
- Evaluation criteria
- Risks
- Our fit
- Gaps to fix
- Tender Questions

Internally, Tender Map is backed by OKF concept graph data and RAG evidence metadata. The primary UI should not require users to understand OKF. Technical OKF details can appear in docs, concept evidence, and optional implementation explanations.

### Bid Strategy Simulator

The simulator lets users adjust team capacity, margin, partnership availability, certification readiness, delivery confidence, risk appetite, and bid preparation budget. It updates bid/no-bid score, risk, recommended actions, strategic posture, and evidence-backed explanation. This is a user-driven scenario feature, separate from the ADK quality loop.

### Tender Questions

Tender Questions is a first-class bidder-side feature. It should not be confused with the old buyer-side TenderLens AI use case where the tender-releasing company evaluates submitted bids. In TenderLens Agentic AI, the feature helps a bidding company prepare before submission and reduce surprises during evaluation.

The Tender Questions page has two clear sections:

- Ask the Issuer
- Prepare to Answer

Ask the Issuer:

- Generates clarification questions the bidding company should send to the tender issuer before submission.
- Questions should cover ambiguous scope, missing SLA detail, unclear scoring rules, eligibility uncertainty, submission format ambiguity, contract/commercial risk, and security/compliance requirement ambiguity.
- Each question should include why it matters, source evidence/citation, suggested priority, and whether the answer could change bid/no-bid.
- The technical Clarification Question Agent name remains in code, docs, and concept evidence.

Prepare to Answer:

- Generates likely questions the tender issuer or evaluation committee may ask the bidding company after reviewing the bid.
- This preserves the spirit of the previous TenderLens AI "Questions to Ask" feature while adapting it to the bidder-side product.
- Questions should identify weak spots, missing proof, likely evaluator concerns, and documents or talking points the bidder should prepare.
- Examples include:
  - Can you prove two similar smart facilities projects?
  - Who is your confirmed HVAC subcontractor?
  - How will you mobilize within 21 days?
  - Where is your ISO 27001 certificate?
  - How will you meet SLA response times outside business hours?
  - Is pricing dependent on unconfirmed subcontractor capacity?
- Each item should include likely evaluator intent, recommended answer angle, evidence/proof to prepare, source citation, priority, and bid impact.

Placement:

- Tender Questions is its own main feature/page.
- Briefing Deck can include a Tender Questions summary slide, but the full Tender Questions feature must not live only inside Briefing Deck.
- Discuss with TenderLens can answer follow-up questions about both Ask the Issuer and Prepare to Answer.

### Briefing Deck

Briefing Deck is a first-class feature, not only a generic export.

It generates an executive go/no-go briefing that can be used in an internal bid decision meeting.

The Briefing Deck UI should prominently display the slides because the slides are the core purpose of this feature. It should feel similar in spirit to the previous TenderLens AI app's beautiful carousel, but upgraded for the bidder-side agentic workflow.

Carousel requirements:

- Large central slide preview.
- Slide thumbnails or carousel rail.
- Previous and next controls.
- Slide count, for example `2 / 8`.
- Export, download, and copy actions.
- Boardroom-ready visual styling for each slide.
- Responsive behavior that keeps the active slide readable on mobile.
- Arabic RTL slide navigation and slide content direction in Arabic mode.

Deck content should include:

- Decision summary
- Tender fit
- Missing items
- Risks
- Tender Questions summary, including Ask the Issuer and Prepare to Answer highlights
- Action plan

Recommended slide sequence:

1. Decision Summary
2. Tender Fit
3. Eligibility & Gaps
4. Risks to Watch
5. Proof Behind Recommendation
6. Tender Questions: Ask the Issuer
7. Tender Questions: Prepare to Answer
8. Action Plan

Expected behavior:

- The deck uses the same analysis, evidence citations, profile fit, risk findings, Tender Questions, and recommended actions as the dashboard.
- It should be concise enough for executives while preserving visible evidence references.
- It summarizes Tender Questions for a management meeting, but does not replace the full Tender Questions page.
- It can begin as a structured in-app preview/export in v1; richer slide generation can be added later if time allows.
- Arabic mode should generate Arabic briefing labels and content direction while preserving source citations.
- The deck should be visually central in its page, not hidden as a secondary export panel.
- The slide carousel must not bury Tender Questions; it can summarize Tender Questions while the full Tender Questions page remains a main navigation item.

## Architecture

Use a monorepo with microservice-style/component boundaries. The project may deploy as fewer physical services for deadline control, but code must stay separated by responsibility.

Planned structure:

```text
tenderlens-agentic-ai/
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
- Intake Agent / Node: validates tender selection/upload metadata, bidder profile completeness, document language, Main Tender File presence, optional Supporting Files, safe file types, 5 MB per-file max, 12 MB total max, and 5-file total max.
- OKF Builder / Selector: selects curated OKF bundles or creates transient uploaded-tender concepts, records `source_documents` metadata for Main Tender File and Supporting Files, extracts tender entities, creates concept links, adds file-level citations, and preserves OKF conformance.
- Retrieval Agent: queries OKF/RAG evidence, returns cited snippets with file/source location, avoids unsupported claims, respects Main Tender File versus Supporting Files precedence, and joins the quality loop only when missing or weak evidence caused audit failure.

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

Create an app-local MCP server named `tenderlens-mcp`.

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
- `validate_tender_files`
- `get_uploaded_source_documents`
- `get_voice_session_context`

Rules: strict tool filtering, schema validation, structured outputs, timeouts, no broad filesystem access, no upload temp path exposure, curated sample read-only access, transient uploaded/voice context, and clean connection lifecycle.

## OKF + RAG

OKF concept types include Tender, Buyer, Eligibility Requirement, Compliance Obligation, Submission Artifact, Evaluation Criterion, Deadline, Risk, Clarification Question, Strategy Lever, Evidence Source, Bidder Capability, Profile Gap, Source Document, Addendum, and Attachment.

Validator checks YAML frontmatter, non-empty `type`, reserved filenames, `index.md` navigation, `log.md` date headings where present, citation sections, internal links, unknown fields as tolerated, and optional field warnings.

For uploaded Tender Files, transient OKF bundles must include `source_documents` metadata. Each source document should record a friendly role such as Main Tender File or Supporting File, safe file name, file type, size, upload-session reference, and any section/page metadata discovered during extraction. Concepts created from uploaded files must link back to their source document so users and judges can trace claims by file.

RAG chunks by concept/section where possible, preserves citation metadata, avoids mixing tenders or uploaded file sets, supports English/Arabic generation, supports voice-friendly summaries, and feeds specialists plus A2A audit. Retrieval should prefer Main Tender File evidence for core requirements and use Supporting Files for appendices, details, addenda, and clarifications.

## Security And Privacy

Demonstrated controls:

- File type validation
- 5 MB per-file upload size limit
- 12 MB total Tender Files upload limit
- 5-file total upload limit
- Main Tender File required for uploaded analysis
- Supporting Files bounded and optional
- File-level citations and source precedence checks
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

Upload privacy details:

- The Main Tender File is transient.
- All Supporting Files are transient.
- Uploaded file bytes are processed only for the active analysis.
- Generated transient OKF for uploaded Tender Files is deleted after analysis.
- Raw extracted text from uploaded files is not retained in durable logs, telemetry, or session state.
- File names shown in the UI should be sanitized.
- Upload temp paths must never be exposed to the browser.
- Curated sample files are public fixtures and may be retained; uploaded user files are not retained.

Public voice claim: "We only listen when you start voice mode, and we do not save your voice."

## Bilingual English + Arabic

English is default. Arabic is a full UI/content mode with RTL layout, mirrored layouts where appropriate, Arabic navigation and dashboard labels, Arabic explanations/risk/compliance/action plan, Arabic voice labels/transcripts, locale-aware dates/numbers where reasonable, preserved citations, and no session loss when switching languages.

Arabic mode must follow the same user-friendly product language rule as English. Primary Arabic UI should use business-friendly labels for How to Use, Analysis, Discuss with TenderLens, Tender Map, Briefing Deck, Tender Questions, Proof Behind This Recommendation, Evidence Checked / Independent Review, Gaps to Fix, Risks to Watch, and Next Actions. The Tender Questions feature must clearly distinguish Arabic labels/content for Ask the Issuer and Prepare to Answer. Technical terms such as ADK, A2A, MCP, OKF, RAG, graph workflow, synthesis agent, and bounded loop should remain in docs, technical evidence, and optional "how it works" explanations rather than dominant Arabic dashboard labels.

The How to Use TenderLens page, first-time help popup, contextual help, upload privacy copy, and voice privacy copy must support Arabic RTL mode. Arabic help content should read naturally as app-native guidance, not as a literal technical translation.

If Arabic spoken output is unreliable, Arabic typed UI remains fully supported and the UI clearly states the voice limitation.

## Deployment

Backend deploys to Agent Runtime after explicit user approval. Voice deploys after typed core is stable. Preferred voice path is ADK Gemini Live API Toolkit with a WebSocket gateway and Vercel WebSockets/Fluid Compute if reliable. Cloud Run voice gateway is a fallback only after explicit approval. Frontend deploys to Vercel with server-side routes/proxy and no browser-exposed credentials.

Antigravity is stretch-only if available before recording.

## Testing And Evaluation

Unit tests cover OKF parser/validator, citations, internal links, metadata loading, bidder profile validation, scenario scoring, upload validation and cleanup, 5 MB per-file rejection, 12 MB total rejection, over-5-file rejection, missing Main Tender File rejection, unsupported/fake file rejection, language utilities, sanitization helpers, MCP schemas, voice schema validation, voice state reducer, and transcript sanitization.

Integration tests cover MCP tools, retrieval, profile matching, simulator shape, Ask the Issuer clarification questions, Prepare to Answer evaluator-question outputs, local A2A reachability, Router-to-A2A before final response, voice gateway start/cleanup, voice transcript routing, API behavior, frontend English/Arabic smoke, Tender Files upload validation before parsing, per-file citations, source document metadata, and cleanup.

Tender Files upload tests must verify:

- Accepts a valid Main Tender File plus valid Supporting Files.
- Rejects upload with no Main Tender File.
- Rejects more than 5 files total.
- Rejects any file over 5 MB.
- Rejects total upload size over 12 MB.
- Rejects unsupported file types.
- Rejects fake/malformed files when content validation is implemented.
- Verifies every cited evidence item includes a source file name.
- Verifies source precedence when addenda/supporting files conflict with the Main Tender File.
- Verifies uploaded files and transient OKF bundles are cleaned up.

Conformance tests verify expected agent paths:

- router -> MCP -> retrieval -> synthesis -> A2A audit -> final
- router -> profile -> compliance -> synthesis -> A2A audit
- router -> risk -> clarification questions -> synthesis -> A2A audit
- intake -> OKF validation -> retrieval
- strategy simulator -> scenario service -> synthesis
- voice transcript -> router -> retrieval -> synthesis -> A2A audit -> voice response
- synthesis -> A2A audit fail -> router -> targeted specialist/retrieval -> synthesis -> A2A audit

Agents CLI evals cover bid/no-bid correctness, citation grounding, tool quality, A2A behavior, quality loop behavior, hallucination resistance, safety, prompt injection resistance, Arabic quality, Ask the Issuer usefulness, Prepare to Answer usefulness, simulator consistency, voice transcript turns, and multi-turn completion.

Frontend QA uses Playwright/responsive checks across desktop/tablet/mobile, English/Arabic, upload errors, A2A status, voice controls, transcript layout, Tender Files add/remove/replace controls, Main Tender File required error, 5 MB per-file error, 12 MB total error, over-5-file error, and sanitization.

User-facing language QA must verify:

- Friendly product labels are visible in the correct order: How to Use, Analysis, Discuss with TenderLens, Tender Map, Briefing Deck, and Tender Questions.
- Main section icons are unique and use the approved dedicated colors.
- The app uses richer procurement-cockpit styling and does not read as a plain white generic SaaS page.
- The approved TenderLens logo direction is visible in app chrome and/or onboarding.
- The Tender Questions page has two visible sections: Ask the Issuer and Prepare to Answer.
- Ask the Issuer questions are framed as bidder-to-tender-issuer clarification questions.
- Prepare to Answer questions are framed as likely tender-issuer/evaluator questions for the bidding company, with evidence/proof to prepare.
- Tender Questions appears as its own feature/page and is not hidden only inside Briefing Deck.
- Technical labels are not dominant in the primary UI: OKF, RAG, A2A, MCP, ADK, graph workflow, synthesis agent, and bounded loop should not be the main navigation or major dashboard headings.
- Voice controls are inside Discuss with TenderLens, not in the global header.
- Discuss with TenderLens offers both typed and voice interaction for the current tender context.
- Proof Behind This Recommendation appears as the primary evidence area label, with technical evidence/audit detail available only as supporting context if needed.
- Evidence Checked or Independent Review appears as the user-facing audit/trust signal.
- Arabic RTL mode uses Arabic-friendly product wording and keeps technical labels out of dominant dashboard positions.
- How to Use TenderLens is reachable from a clear help affordance.
- The first-time help popup appears on first visit, can be dismissed, and does not reappear after the user chooses Don't show again.
- Popup state is stored locally only and does not require login or backend persistence.
- The popup and How to Use content work in English and Arabic RTL.
- The popup never starts voice recording, upload, or analysis automatically.
- The Briefing Deck page prominently displays a large slide carousel with thumbnails/rail, previous/next controls, slide count, and export/download/copy actions.
- The Briefing Deck carousel remains readable on mobile and mirrored appropriately in Arabic RTL mode.

## Milestones

### Milestone 0: Foundation And Documentation

Create the project folder, repo-ready structure, `PLAN.md`, `BOOKMARK.md`, `.agents-cli-spec.md`, `docs/SDD.md`, `docs/SOFTWARE_DESIGN.md`, `docs/ARCHITECTURE.md`, `docs/PRIVACY.md`, `docs/CONCEPT_MAP.md`, `DATA_SOURCES.md`, license, ADK/Agents CLI/MCP confirmation, Live Toolkit confirmation, and scaffold command plan.

Acceptance: docs define product, architecture, specs, privacy, A2A audit, quality loop, upload, voice, and eval targets before implementation code starts. `BOOKMARK.md` has the first task entry.

### Milestone 0.5: GitHub Repository

Initialize git, add `.gitignore`, commit foundation docs, create public GitHub repo `tenderlens-agentic-ai`, add remote, push initial commit, confirm URL, and add repo URL to README/BOOKMARK.

### Milestone 1: Agents CLI Scaffold

Run `agents-cli info`, scaffold/enhance the project with ADK agent and Agent Runtime target, include or prepare A2A and streaming support, install/sync dependencies, inspect generated structure, preserve scaffold conventions, update docs and bookmark.

### Milestone 2: Data, OKF, And Validator

Add curated sample tender metadata/text, generate OKF bundle, implement upload-to-transient extraction for Tender Files with Main Tender File, optional Supporting Files, 5 MB per-file limit, 12 MB total limit, 5-file total limit, source document metadata, implement OKF parser/validator/link/citation checks, tests, and data source docs.

### Milestone 3: MCP Server

Implement `tenderlens-mcp`, tool schemas/tools, tests, and strict ADK tool filtering.

### Milestone 4: Agent Workflow, A2A Audit, And Loop

Implement router, voice adapter, intake, retrieval, specialists, synthesis, A2A Evidence Audit Agent, A2A exposure/consumption, Bounded Evidence Quality Loop, max 2 revisions, graph wiring, schemas, smoke prompts, and conformance tests.

### Milestone 5: Backend API, Voice Gateway, And Privacy Controls

Define API and voice schemas, add analysis/upload/profile/scenario/language endpoints, Tender Files validation for Main Tender File and Supporting Files, source precedence handling, upload cleanup/logging controls, voice gateway, voice session limits/cleanup, transcript sanitization, and A2A status payloads.

### Milestone 6: Frontend Cockpit

Build design tokens, shell, tender picker, Tender Files upload panel, Main Tender File area, Supporting Files area, Use Preloaded Example Files action, replace/remove file controls, bidder profile editor, typed input, voice panel, transcript, voice states/controls, progress, decision dashboard, Proof Behind This Recommendation, Tender Map, compliance/risk/missing docs, strategy simulator, Tender Questions with Ask the Issuer and Prepare to Answer sections, Evidence Checked panel, Briefing Deck slide carousel, export/action plan, language switcher, Arabic RTL, sanitization, and responsive polish.

Add the TenderLens AI product-language refinement without replacing the technical architecture:

- Use How to Use, Analysis, Discuss with TenderLens, Tender Map, Briefing Deck, and Tender Questions as first-class user-facing navigation/help labels in that exact order.
- Move voice from the global header into Discuss with TenderLens as an alternate input mode beside typing.
- Rename the primary evidence area to Proof Behind This Recommendation while preserving Evidence War Room as an internal/writeup concept if useful.
- Rename the OKF concept graph UI to Tender Map while preserving OKF as the implementation/evidence layer.
- Implement Tender Questions as its own feature/page with Ask the Issuer and Prepare to Answer sections.
- Preserve the Clarification Question Agent in code/docs as the technical path behind Ask the Issuer.
- Add Prepare to Answer outputs that predict likely evaluator/tender-issuer questions for the bidding company, recommended answer angle, proof to prepare, source citation, priority, and bid impact.
- Present A2A audit to users as Evidence Checked or Independent Review while preserving mandatory A2A implementation and concept evidence.
- Add a Briefing Deck page with a prominent slide carousel, thumbnails/rail, previous/next controls, slide count, export/download/copy actions, and slides for decision summary, tender fit, eligibility/gaps, risks, proof, Tender Questions, and action plan.
- Ensure Briefing Deck summarizes Tender Questions but does not replace or hide the full Tender Questions page.
- Apply the same friendly-label standard to Arabic RTL mode.
- Add dedicated premium icons/colors for How to Use, Analysis, Discuss with TenderLens, Tender Map, Briefing Deck, and Tender Questions.
- Add the approved premium TenderLens logo direction to app chrome and onboarding after visual approval.
- Apply the rich procurement-cockpit visual direction: warm ivory base, dark green/ink framing, subtle tinted panels, brass accents, blueprint/document texture, and strong contrast blocks.
- Add a How to Use TenderLens page or view with plain-language steps for the main workflow.
- Add a first-time help popup similar to the previous TenderLens AI app with Start with Preloaded Example Files, Upload my Tender Files, Open How to Use, and Don't show again actions.
- Store Don't show again locally in the browser and keep onboarding independent of backend accounts.
- Add contextual help affordances for Analysis, Discuss with TenderLens, Tender Map, Briefing Deck, Tender Questions, upload, and voice without cluttering the interface.

### Milestone 7: Evaluation And QA

Run tests/evals, add A2A, loop, voice, Arabic, and prompt injection cases, run frontend responsive checks, Tender Files validation checks, Main Tender File required check, over-5-file rejection, per-file >5 MB rejection, total >12 MB rejection, source citation checks, Briefing Deck carousel checks, premium label/icon checks, voice manual QA, build checks, and update docs.

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
