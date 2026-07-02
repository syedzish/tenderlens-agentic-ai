import unittest

from app.services.sanitization.html import escape_untrusted_text, sanitize_link_href
from app.services.voice.session import VoiceSessionState, reduce_voice_state


class SanitizationAndVoiceTest(unittest.TestCase):
    def test_escapes_script_content(self) -> None:
        escaped = escape_untrusted_text("<script>alert(1)</script><b>risk</b>")
        self.assertNotIn("script", escaped.lower())
        self.assertIn("&lt;b&gt;risk&lt;/b&gt;", escaped)

    def test_blocks_javascript_href(self) -> None:
        self.assertEqual(sanitize_link_href("javascript:alert(1)"), "#")

    def test_voice_state_reducer(self) -> None:
        state = VoiceSessionState()
        state = reduce_voice_state(state, "session.start")
        self.assertEqual(state.state, "connecting")
        state = reduce_voice_state(state, "session.ready")
        self.assertEqual(state.state, "listening")
        state = reduce_voice_state(state, "transcript.final", {"text": "Can we bid?"})
        self.assertEqual(state.transcript[-1], "Can we bid?")
        state = reduce_voice_state(state, "microphone.mute")
        self.assertTrue(state.muted)
        state = reduce_voice_state(state, "session.end")
        self.assertEqual(state.state, "ended")


if __name__ == "__main__":
    unittest.main()
