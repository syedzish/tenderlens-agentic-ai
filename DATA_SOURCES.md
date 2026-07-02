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

No curated tender source files have been added yet.

Planned v1 source strategy:

- Start with one synthetic public-demo tender fixture written specifically for this capstone.
- Add provenance fields that clearly mark the fixture as synthetic.
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
