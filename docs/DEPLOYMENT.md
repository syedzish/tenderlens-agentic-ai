# Deployment

Deployment happens only after explicit user approval.

## Backend

Target: Agent Runtime.

Requirements:

- Use Agents CLI deployment flow.
- Configure Agent Runtime target.
- Keep credentials out of the repo.
- Scope service identity minimally.
- Ensure MCP deployment pattern is compatible with Agent Runtime.
- Ensure A2A Evidence Audit Agent is reachable by Router/Synthesis.
- Enable Cloud Trace where supported.
- Run dry run before real deploy.

## Voice

Deploy voice after typed core is stable.

Primary path:

- ADK Gemini Live API Toolkit.
- WebSocket-based Voice Gateway.
- Vercel WebSockets with Fluid Compute if reliable.
- Secure `wss://` browser connection.
- Server-side Live API credentials only.
- `VOICE_AGENT_MODEL`.
- `VOICE_SESSION_MAX_SECONDS=300`.
- Minimal/no voice content logging.

Fallback requiring explicit approval:

- Cloud Run FastAPI voice gateway.
- Frontend remains Vercel.
- README and docs explain the extra service.

## Frontend

Target: Vercel.

Current status:

- The GitHub repository has been connected to Vercel by the user.
- Root `vercel.json` builds the static cockpit from `frontend/` and publishes `frontend/dist`.
- If Vercel project settings already set the monorepo root to `frontend`, keep install command `npm install`, build command `npm run build`, and output directory `dist`.
- If Vercel project settings use the repository root, the checked-in `vercel.json` should be used.

Connection steps:

1. Open Vercel dashboard.
2. Choose Add New Project.
3. Import GitHub repo `tenderlens-agentic-ai`.
4. Set monorepo root to `frontend` if the frontend lives there.
5. Set install command, likely `npm install`.
6. Set build command, likely `npm run build`.
7. Configure framework output settings.
8. Enable Fluid Compute if using Vercel WebSockets.
9. Add server-side env vars:
   - `AGENT_RUNTIME_ENDPOINT`
   - `GOOGLE_CLOUD_PROJECT`
   - `GOOGLE_CLOUD_LOCATION`
   - `VOICE_AGENT_MODEL`
   - `VOICE_SESSION_MAX_SECONDS`
10. Do not expose Agent Runtime or Live API credentials through `NEXT_PUBLIC_*`.
11. Browser calls `/api/analyze` for typed analysis.
12. Browser opens a `wss://` voice route only after Voice Mode click.
13. Deploy preview.
14. Test curated sample tender flow.
15. Test over-5-MB upload rejection.
16. Test voice button, microphone permission, transcript, interrupt, mute, and end.
17. Test Arabic RTL.
18. Promote production.
19. Add production URL to README and Kaggle submission.

## Deployment Risk Controls

- Keep public demo sample docs small.
- Use progress/loading states for long analysis.
- Gracefully handle Agent Runtime timeouts.
- Gracefully handle Vercel WebSocket limitations.
- Surface A2A audit unavailable state.
- Keep typed mode usable if voice fails.
- Smoke test deployed public link without login.
