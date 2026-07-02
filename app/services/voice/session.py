"""Small voice session state reducer used by UI and gateway tests."""

from __future__ import annotations

from dataclasses import dataclass, replace

from app.services.contracts import VoiceState

VALID_EVENTS = {
    "session.start",
    "session.ready",
    "audio.chunk",
    "audio.end",
    "transcript.partial",
    "transcript.final",
    "agent.text.partial",
    "agent.audio.chunk",
    "agent.turn.complete",
    "agent.interrupted",
    "dashboard.patch",
    "audit.status",
    "error",
    "session.end",
    "microphone.mute",
    "microphone.unmute",
}


@dataclass(frozen=True)
class VoiceSessionState:
    state: VoiceState = "idle"
    muted: bool = False
    transcript: list[str] = None  # type: ignore[assignment]
    error: str | None = None

    def __post_init__(self) -> None:
        if self.transcript is None:
            object.__setattr__(self, "transcript", [])


def reduce_voice_state(
    current: VoiceSessionState, event_type: str, payload: dict | None = None
) -> VoiceSessionState:
    payload = payload or {}
    if event_type not in VALID_EVENTS:
        return replace(current, state="error", error=f"Unknown voice event: {event_type}")
    if event_type == "session.start":
        return replace(current, state="connecting", error=None)
    if event_type == "session.ready":
        return replace(current, state="listening", error=None)
    if event_type == "audio.end":
        return replace(current, state="thinking")
    if event_type == "agent.audio.chunk":
        return replace(current, state="speaking")
    if event_type == "agent.interrupted":
        return replace(current, state="interrupted")
    if event_type == "agent.turn.complete":
        return replace(current, state="listening")
    if event_type == "microphone.mute":
        return replace(current, state="muted", muted=True)
    if event_type == "microphone.unmute":
        return replace(current, state="listening", muted=False)
    if event_type == "session.end":
        return replace(current, state="ended", muted=False)
    if event_type == "error":
        return replace(current, state="error", error=str(payload.get("message", "Voice error")))
    if event_type == "transcript.final":
        transcript = [*current.transcript, str(payload.get("text", ""))]
        return replace(current, transcript=transcript)
    return current
