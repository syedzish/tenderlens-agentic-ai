# Deployment

TenderLens is designed for a production setup, not a preloaded-files-only demo.
The public frontend can show the prepared example, but uploaded tender files must
be analyzed by the backend runtime.

## Backend Runtime

Target: Google Cloud Agent Runtime or another HTTPS FastAPI host running
`app.fast_api_app:app`.

Required backend environment:

```text
GOOGLE_CLOUD_PROJECT=
GOOGLE_CLOUD_LOCATION=
GOOGLE_GENAI_USE_VERTEXAI=true
ALLOW_ORIGINS=https://tenderlens-agentic-ai.vercel.app
VOICE_AGENT_MODEL=
TENDERLENS_VISION_MODEL=
VOICE_SESSION_MAX_SECONDS=300
```

Use valid Gemini or Vertex credentials in the runtime environment. Do not commit
API keys, private keys, passwords, or service-account JSON.

Backend expectations:

- `/api/health` returns service health.
- `/api/analyze` supports typed curated-tender analysis.
- `/api/upload/analyze` accepts multipart uploads for one Main Tender File plus
  optional Supporting Files.
- `/api/upload/tender-files/validate` validates metadata before parsing.
- TXT, MD, DOCX, and text-based PDF files are parsed transiently.
- JPG, PNG, and WEBP files use Gemini/Vertex vision text extraction when live credentials are configured.
- Scanned or image-only PDFs fail with a clear extractable-text error.
- Scores are recalculated deterministically from findings, not sampled from model
  prose.

## Frontend Runtime

Target: Vercel static frontend from `frontend/dist`.

Vercel build settings when the project root is the repository root:

```text
Install command: npm --prefix frontend install
Build command: npm --prefix frontend run build
Output directory: frontend/dist
```

Vercel build settings when the project root is `frontend`:

```text
Install command: npm install
Build command: npm run build
Output directory: dist
```

Required Vercel environment:

```text
TENDERLENS_PUBLIC_BACKEND_URL=https://<deployed-backend-host>
AGENT_RUNTIME_ENDPOINT=https://<deployed-backend-host>
TENDERLENS_BACKEND_URL=https://<deployed-backend-host>
```

`TENDERLENS_PUBLIC_BACKEND_URL` is intentionally public and is used by the
browser for uploaded-file analysis. Vercel Functions currently have a 4.5 MB
request/response body limit, so multi-file uploads cannot reliably pass through
the Vercel `/api/upload/analyze` proxy. Keep `AGENT_RUNTIME_ENDPOINT` or
`TENDERLENS_BACKEND_URL` for lightweight JSON proxy routes such as health and
typed analysis.

Reference: Vercel's function limits document the 4.5 MB payload cap:
https://vercel.com/docs/functions/limitations#request-body-size

## Deploy Steps

1. Deploy the backend runtime.
2. Set backend `ALLOW_ORIGINS` to the public Vercel origin.
3. Verify backend health:

   ```bash
   curl https://<deployed-backend-host>/api/health
   ```

4. Set Vercel `TENDERLENS_PUBLIC_BACKEND_URL`, `AGENT_RUNTIME_ENDPOINT`, and
   `TENDERLENS_BACKEND_URL`.
5. Redeploy Vercel.
6. Open the public Vercel URL.
7. Run the preloaded example and confirm score `75`.
8. Upload a new TXT/MD/DOCX/text-based PDF tender file and confirm the result is
   marked as uploaded files, not prepared example.
9. Upload a JPG/PNG/WEBP tender page and confirm live vision extraction works when credentials are configured.
10. Upload an over-4-MB file and confirm the client blocks it before analysis.
11. Upload a scanned/image-only PDF and confirm the backend returns a clear
    extractable-text error.
12. Test Tender Map, Briefing Deck, Questions to Ask, Ask TenderLens, and Arabic
    RTL on the deployed URL.

## Local Verification

```bash
npm test
npm run build
npx playwright test --reporter=line
.venv\Scripts\python.exe -m unittest discover -s tests/unit -p "test_*.py"
.venv\Scripts\python.exe -m unittest discover -s tests/conformance -p "test_*.py"
.venv\Scripts\python.exe -m pytest tests/integration -q
.venv\Scripts\python.exe -m compileall app tests/unit tests/conformance tests/integration
```

## Voice

Voice remains explicitly user-started. Deploy it only with server-side Live API
credentials and no raw audio retention.

Primary path:

- ADK Gemini Live API Toolkit.
- WebSocket-based Voice Gateway.
- Secure `wss://` browser connection.
- Server-side Live API credentials only.
- `VOICE_AGENT_MODEL`.
- `VOICE_SESSION_MAX_SECONDS=300`.
- Minimal/no voice content logging.

Fallback requiring explicit approval:

- Cloud Run FastAPI voice gateway.
- Frontend remains Vercel.
- README and docs explain the extra service.

## Risk Controls

- Keep public demo sample docs small.
- Use loading states for long analysis.
- Gracefully handle backend timeouts.
- Gracefully handle voice limitations.
- Surface A2A audit unavailable state.
- Keep typed mode usable if voice fails.
- Smoke test deployed public link without login.
