# Steps To Finish TenderLens Agentic AI

This file is the simple final checklist for getting the project ready for Kaggle submission.

## What Is Ready

- Public GitHub repo: https://github.com/syedzish/tenderlens-agentic-ai
- Public app URL: https://tenderlens-agentic-ai.vercel.app
- Vercel is connected to GitHub, so pushing to `main` should trigger a new deployment.
- The app has the approved user-friendly sections:
  - How to Use
  - Analysis
  - Ask TenderLens
  - Tender Map
  - Briefing Deck
  - Questions to Ask
- Preloaded Example Files use pre-generated example results so the app can be explored quickly and API calls are conserved.
- Uploaded Tender Files are analyzed when you run them.
- Live uploaded-file analysis currently supports TXT, MD, DOCX, text-based PDF files, and JPG/PNG/WEBP files when Gemini/Vertex vision credentials are configured.
- Scanned or image-only PDFs fail clearly instead of being treated as analyzed text.
- Tender Files rules are implemented:
  - 1 Main Tender File is required.
  - Supporting Files are optional.
  - Up to 5 files total.
  - 4 MB per file.
  - 12 MB total.
- The project includes OKF/RAG services, MCP tools, A2A audit foundation, bounded evidence quality loop, API routes, voice gateway skeleton, tests, docs, and the Vercel frontend.

## What You Need To Do

### 1. Deploy The Backend Runtime And Set Vercel Env

This is required for a production app. Uploaded-file analysis should not be
limited to preloaded examples.

1. Deploy the backend runtime from `app.fast_api_app:app`.
2. Set backend `ALLOW_ORIGINS=https://tenderlens-agentic-ai.vercel.app`.
3. In Vercel, set:
   - `TENDERLENS_PUBLIC_BACKEND_URL=https://<deployed-backend-host>`
   - `AGENT_RUNTIME_ENDPOINT=https://<deployed-backend-host>`
   - `TENDERLENS_BACKEND_URL=https://<deployed-backend-host>`
4. Redeploy Vercel.
5. Confirm uploaded-file analysis uses the backend, not the prepared example.

### 2. Wait For Vercel To Deploy The Latest Push

After the final commit is pushed:

1. Open https://vercel.com/dashboard.
2. Open the `tenderlens-agentic-ai` project.
3. Go to **Deployments**.
4. Wait until the latest deployment shows **Ready**.
5. Open https://tenderlens-agentic-ai.vercel.app.
6. Check these screens:
   - How to Use
   - Analysis
   - Ask TenderLens
   - Tender Map
   - Briefing Deck
   - Questions to Ask

If Vercel does not deploy automatically:

1. Open the latest deployment in Vercel.
2. Click **Redeploy**.
3. Keep the default settings.
4. Wait until it shows **Ready**.

### 3. Record The Kaggle Video

Kaggle requires a YouTube video of 5 minutes or less.

Suggested video flow:

1. Problem: companies need a faster way to decide if they should bid.
2. Show the app with Preloaded Example Files.
3. Show Analysis and the bid/no-bid recommendation.
4. Show Ask TenderLens.
5. Show Tender Map.
6. Show Briefing Deck carousel.
7. Show Questions to Ask.
8. Mention evidence checking, A2A audit, MCP, OKF/RAG, security/privacy, and deployability.
9. Keep it under 5 minutes.

Simple video line for the preloaded files:

> Preloaded Example Files use pre-generated example results so users can explore TenderLens quickly and conserve API calls. Uploaded Tender Files are analyzed when the user runs them.

### 4. Create The Kaggle Writeup

Kaggle writeup limit: 2,500 words.

Suggested sections:

1. Problem
2. Why agents
3. Solution overview
4. Architecture
5. ADK multi-agent workflow
6. A2A evidence review
7. MCP tools
8. OKF + RAG evidence foundation
9. Security and privacy
10. Demo results
11. Future work

Use `docs/CONCEPT_MAP.md`, `docs/ARCHITECTURE.md`, and `docs/PRIVACY.md` as source material.

### 5. Add Kaggle Submission Assets

In the Kaggle Writeup:

1. Add a cover image.
2. Attach the YouTube video.
3. Add the public app link:
   - https://tenderlens-agentic-ai.vercel.app
4. Add the public GitHub link:
   - https://github.com/syedzish/tenderlens-agentic-ai
5. Select the **Agents for Business** track.
6. Submit before **July 6, 2026 at 11:59 PM PT**.

### 6. Required: Enable Live Cloud Agent Runtime

The public app should be reliable with Preloaded Example Files, but production uploaded-file analysis requires a deployed backend runtime.

For the live cloud agent setup, you need Google Cloud credentials and environment variables:

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

Simple steps:

1. Create or choose a Google Cloud project.
2. Enable the required Agent Runtime / Vertex AI services.
3. Deploy the backend agent after reviewing `docs/DEPLOYMENT.md`.
4. Add the backend endpoint, public backend URL, CORS origin, and model settings to Vercel/backend environment variables.
5. Redeploy Vercel.
6. Test Analysis, Ask TenderLens, uploaded-file analysis, and voice flow.

Do not put API keys, private keys, passwords, or service account JSON files in GitHub.

## Quick Final Check

Before submitting on Kaggle, confirm:

- The Vercel app opens without login.
- GitHub repo is public.
- No secrets are committed.
- The video is under 5 minutes.
- The writeup is under 2,500 words.
- The submission includes the video, project link, and GitHub link.
- The deadline is still before July 6, 2026 at 11:59 PM PT.
