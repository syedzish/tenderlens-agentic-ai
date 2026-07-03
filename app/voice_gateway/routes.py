"""WebSocket voice gateway skeleton.

This is a privacy-safe adapter into the same TenderLens workflow. The first
implementation handles transcript-style messages deterministically; ADK Live
audio streaming will replace the internal turn handling once dependencies and
credentials are available.
"""

from __future__ import annotations

import json
import time
from dataclasses import asdict

from fastapi import FastAPI, WebSocket, WebSocketDisconnect

from app.services.voice.session import VALID_EVENTS
from app.workflows.tender_workflow import run_tender_analysis

VOICE_SESSION_MAX_SECONDS = 300


async def _send(websocket: WebSocket, event_type: str, payload: dict) -> None:
    await websocket.send_text(json.dumps({"type": event_type, "payload": payload}))


def attach_voice_gateway_routes(app: FastAPI) -> None:
    @app.websocket("/api/voice")
    async def voice_socket(websocket: WebSocket) -> None:
        await websocket.accept()
        started_at = time.monotonic()
        language = "en"
        tender_id = "smart-city-maintenance-2026"
        profile_id = "default-bidder-profile"
        await _send(
            websocket,
            "session.ready",
            {
                "message": "Voice gateway ready. Microphone must be started by the browser UI.",
                "max_seconds": VOICE_SESSION_MAX_SECONDS,
            },
        )
        try:
            while True:
                if time.monotonic() - started_at > VOICE_SESSION_MAX_SECONDS:
                    await _send(
                        websocket,
                        "session.end",
                        {"reason": "Voice session duration limit reached."},
                    )
                    await websocket.close()
                    return

                raw = await websocket.receive_text()
                try:
                    message = json.loads(raw)
                except json.JSONDecodeError:
                    await _send(websocket, "error", {"message": "Invalid JSON message."})
                    continue

                event_type = str(message.get("type", ""))
                payload = message.get("payload") or {}
                if event_type not in VALID_EVENTS:
                    await _send(
                        websocket,
                        "error",
                        {"message": f"Unknown voice event type: {event_type}"},
                    )
                    continue

                if event_type == "session.end":
                    await _send(websocket, "session.end", {"reason": "User ended voice mode."})
                    await websocket.close()
                    return

                if event_type == "session.start":
                    language = "ar" if str(payload.get("language", "en")).startswith("ar") else "en"
                    tender_id = str(payload.get("tender_id", tender_id))
                    profile_id = str(payload.get("profile_id", profile_id))
                    await _send(websocket, "session.ready", {"language": language})
                    continue

                if event_type == "transcript.final":
                    transcript = str(payload.get("text", ""))
                    await _send(websocket, "transcript.final", {"text": transcript})
                    await _send(websocket, "audit.status", {"status": "running"})
                    report = run_tender_analysis(
                        tender_id=tender_id,
                        profile_id=profile_id,
                        language=language,  # type: ignore[arg-type]
                        voice=True,
                    )
                    await _send(
                        websocket,
                        "agent.text.partial",
                        {
                            "text": report.voice_summary or report.executive_summary,
                            "evidence_ids": [item.id for item in report.evidence[:3]],
                        },
                    )
                    await _send(
                        websocket,
                        "audit.status",
                        asdict(report.audit),
                    )
                    await _send(
                        websocket,
                        "dashboard.patch",
                        {
                            "recommendation": report.recommendation,
                            "confidence": report.confidence,
                            "highlight_evidence_id": "eligibility-1",
                        },
                    )
                    await _send(websocket, "agent.turn.complete", {"ok": True})
        except WebSocketDisconnect:
            return
