# Privacy

TenderLens Agentic AI uses precise privacy claims. These claims must be implemented in code and reflected in UI copy.

## Upload Claim

"We do not save your uploaded files."

Meaning:

- Uploaded file bytes are processed transiently.
- Upload processing is bounded by Tender Files limits: exactly one Main Tender File for uploaded analysis, optional Supporting Files, up to 5 files total, 4 MB per file, and 12 MB total.
- TXT, MD, DOCX, and text-based PDF files can be parsed transiently for uploaded-file analysis.
- JPG, PNG, and WEBP files can be processed through live Gemini/Vertex vision text extraction when credentials are configured.
- Scanned or image-only PDFs are not treated as analyzed content; the API returns a clear extractable-text error.
- Uploaded files are not committed, stored in the repo, or stored in durable object storage for v1.
- Generated upload OKF bundles are not retained.
- Raw extracted text from uploads is not retained.
- Logs must not include uploaded document text.
- Prompt-response content logging for upload sessions should be disabled or avoided.
- ADK session/event state must not persist raw uploaded document text.
- Curated sample tenders are public or synthetic fixtures and can be retained.
- The public sample experience should clearly separate Preloaded Example Files and Pre-generated Example Results from uploaded user data.

## Voice Claim

"We only listen when you start voice mode, and we do not save your voice."

Meaning:

- Microphone starts only after the user explicitly chooses Talk to TenderLens.
- Microphone remains visibly active only during voice mode.
- Mute and end controls remain visible.
- Microphone stops when the user ends voice mode.
- Raw audio files are not stored.
- Audio chunks are not logged.
- Raw transcripts are session-scoped unless visible in the user's conversation/final report.
- Voice data is not used as sample fixtures.
- Voice buffers are cleared when the session ends.

## Logging Rules

Allowed:

- Request ids
- High-level status
- Error codes
- Timing metrics
- Selected curated tender id
- Non-sensitive derived summary fields needed for visible UI

Not allowed:

- Raw uploaded document text
- Upload temp file paths exposed to the browser
- Raw audio chunks
- Raw voice recordings
- Hidden transcripts beyond active session
- API keys or credentials

## ADK Session State

ADK session/event handling must be designed carefully:

- Store references to curated sample IDs and evidence IDs.
- Avoid storing raw uploaded text.
- Store derived non-sensitive summaries only when needed for the user-visible report.
- Keep voice transcripts session-scoped.
- Avoid content logging for upload and voice sessions when possible.

## User-Facing Boundaries

The demo should communicate:

- Preloaded Example Files are public/synthetic fixtures.
- Pre-generated Example Results are prepared so users can explore TenderLens quickly and conserve API calls.
- Uploaded Tender Files are transient.
- Voice starts only after user action.
- Typed mode remains available if voice fails.
- Larger tenders should use curated/preprocessed OKF bundles in v1.
