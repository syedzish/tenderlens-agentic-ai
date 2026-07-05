import json

from fastapi.testclient import TestClient

from app.fast_api_app import app


def test_discuss_grounds_answer_in_report_context(monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEY", "test-live-key")

    client = TestClient(app)
    response = client.post(
        "/api/discuss",
        json={
            "message": "Which document is missing?",
            "language": "en",
            "mode": "text",
            "history": [],
            "report": {
                "executive_summary": "ZebraDock is a conditional bid.",
                "missing_documents": ["ZebraDock permit renewal letter"],
                "next_actions": ["Collect the ZebraDock permit renewal letter."],
                "risks": [{"title": "Permit gap", "mitigation": "Collect the letter."}],
                "evidence": [
                    {
                        "citation": "uploaded:zebradock-live-test.md",
                        "excerpt": "The permit renewal letter is mandatory.",
                    }
                ],
            },
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert "ZebraDock permit renewal letter" in body["answer"]
    assert body["citations"]
    assert body["followups"]


def test_discuss_without_live_credentials_is_explicit(monkeypatch):
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)
    monkeypatch.delenv("GOOGLE_API_KEY", raising=False)
    monkeypatch.delenv("GOOGLE_GENAI_USE_VERTEXAI", raising=False)
    monkeypatch.delenv("GOOGLE_CLOUD_PROJECT", raising=False)

    client = TestClient(app)
    response = client.post(
        "/api/discuss",
        json={
            "message": "Summarize risks",
            "language": "en",
            "mode": "text",
            "report": {"executive_summary": "Uploaded report."},
        },
    )

    assert response.status_code == 503
    assert "please try again after some time" in response.json()["detail"].lower()


def test_model_status_reports_safe_connectivity_without_secret_values(monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEY", "super-secret-test-value")
    monkeypatch.setenv("TENDERLENS_DISCUSS_MODEL", "gemini-test-discuss")
    monkeypatch.setenv("TENDERLENS_VISION_MODEL", "gemini-test-vision")

    client = TestClient(app)
    response = client.get("/api/model-status")

    assert response.status_code == 200
    body = response.json()
    assert body["service"] == "TenderLens Agentic AI"
    assert body["discuss"]["connected"] is True
    assert body["upload"]["connected"] is True
    assert body["discuss"]["model"] == "gemini-test-discuss"
    assert body["upload"]["model"] == "gemini-test-vision"
    serialized = json.dumps(body)
    assert "super-secret-test-value" not in serialized
    assert "GEMINI_API_KEY" not in serialized
