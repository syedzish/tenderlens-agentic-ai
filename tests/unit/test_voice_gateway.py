import unittest

from fastapi.testclient import TestClient

from app.fast_api_app import app


class TenderLensVoiceGatewayTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.client = TestClient(app)

    def test_voice_gateway_transcript_turn(self) -> None:
        with self.client.websocket_connect("/api/voice") as websocket:
            ready = websocket.receive_json()
            self.assertEqual(ready["type"], "session.ready")
            self.assertEqual(ready["payload"]["max_seconds"], 300)

            websocket.send_json(
                {
                    "type": "session.start",
                    "payload": {
                        "language": "ar",
                        "tender_id": "smart-city-maintenance-2026",
                        "profile_id": "default-bidder-profile",
                    },
                }
            )
            start_ready = websocket.receive_json()
            self.assertEqual(start_ready["payload"]["language"], "ar")

            websocket.send_json(
                {
                    "type": "transcript.final",
                    "payload": {"text": "هل يمكننا التقديم؟"},
                }
            )
            events = [websocket.receive_json() for _ in range(6)]
            event_types = [event["type"] for event in events]

            self.assertEqual(event_types[0], "transcript.final")
            self.assertIn("agent.text.partial", event_types)
            self.assertIn("audit.status", event_types)
            self.assertEqual(event_types[-1], "agent.turn.complete")
            voice_event = next(
                event for event in events if event["type"] == "agent.text.partial"
            )
            self.assertIn("نعم", voice_event["payload"]["text"])
            self.assertTrue(voice_event["payload"]["evidence_ids"])

            websocket.send_json({"type": "session.end", "payload": {}})
            end = websocket.receive_json()
            self.assertEqual(end["type"], "session.end")

    def test_voice_gateway_unknown_event_returns_error(self) -> None:
        with self.client.websocket_connect("/api/voice") as websocket:
            websocket.receive_json()
            websocket.send_json({"type": "unknown.event", "payload": {}})
            error = websocket.receive_json()

            self.assertEqual(error["type"], "error")
            self.assertIn("Unknown voice event", error["payload"]["message"])


if __name__ == "__main__":
    unittest.main()
