# Data Sources

This file records every public, generated, synthetic, uploaded, and external data source used by TenderLens Agentic AI.

## Source Policy

- Curated demo tenders must be public, synthetic, or clearly licensed for public demonstration.
- User-uploaded tenders are transient and are not stored in this repository.
- Generated uploaded OKF bundles are transient and must be deleted after analysis.
- Raw extracted uploaded text must not be persisted in durable logs or session state.
- Voice audio is transient and must not be stored.
- Voice transcripts are session-scoped unless visible in the user's final report.

## Current Sources

### Synthetic Curated Tender Fixture

- File: `data/samples/smart_city_maintenance_tender.json`
- OKF bundle: `data/okf/smart-city-maintenance-2026/`
- Title: Smart City Facilities Maintenance Tender 2026
- Buyer: Riyadh Smart District Authority
- Source type: synthetic public-demo fixture
- Created: 2026-07-02
- License/usage basis: project-authored synthetic content for the public demo
- Purpose: reliable Kaggle demo path for OKF, RAG, specialist analysis, A2A audit, upload-independent judging, and voice follow-up.

### Synthetic Sample Bidder Profile

- File: `data/bidder_profiles/default_profile.json`
- Company: Nexa Facilities Solutions
- Source type: synthetic public-demo fixture
- Created: 2026-07-02
- License/usage basis: project-authored synthetic content for the public demo
- Purpose: bidder capability data for eligibility/profile-fit decisioning.

## Planned Source Strategy

- Add only public, synthetic, or clearly licensed tender examples.
- If a real public tender is added, record URL, retrieval date, license/usage basis, and any extracted sections.

## External Documentation And Standards

- ADK Gemini Live API Toolkit: https://adk.dev/streaming/
- ADK streaming quickstart: https://adk.dev/get-started/streaming/quickstart-streaming/
- ADK streaming `run_live()` guide: https://adk.dev/streaming/dev-guide/part3/
- ADK audio/image/video guide: https://adk.dev/streaming/dev-guide/part5/
- ADK A2A docs: https://adk.dev/a2a/
- ADK A2A exposing quickstart: https://adk.dev/a2a/quickstart-exposing/
- OKF repository: https://github.com/GoogleCloudPlatform/knowledge-catalog/tree/main/okf
- OKF blog: https://cloud.google.com/blog/products/data-analytics/how-the-open-knowledge-format-can-improve-data-sharing
- Vercel WebSockets docs: https://vercel.com/docs/functions/websockets
- Vercel streaming functions docs: https://vercel.com/docs/functions/streaming-functions

## Models And Tools

To be finalized after Agents CLI scaffold and current ADK model guidance are verified.

Planned:

- Gemini model for typed analysis through ADK/Agent Runtime.
- Gemini Live API-compatible model configured by `VOICE_AGENT_MODEL`.
- Agents CLI for scaffold/evals/deployment lifecycle.
- App-local MCP server for tender evidence and profile tools.

## License Notes

Code is Apache-2.0 unless otherwise noted. Third-party dependencies and sample assets must be reviewed before final Kaggle submission.
