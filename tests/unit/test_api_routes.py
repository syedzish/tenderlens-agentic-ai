import unittest

from fastapi.testclient import TestClient

from app.fast_api_app import app


class TenderLensAPIRoutesTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.client = TestClient(app)

    def test_health_route(self) -> None:
        response = self.client.get("/api/health")

        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertEqual(body["status"], "ok")
        self.assertEqual(body["upload_max_mb"], 5)

    def test_analyze_route_returns_audited_report(self) -> None:
        response = self.client.post(
            "/api/analyze",
            json={
                "tender_id": "smart-city-maintenance-2026",
                "profile_id": "default-bidder-profile",
                "language": "en",
            },
        )

        self.assertEqual(response.status_code, 200)
        report = response.json()["report"]
        self.assertEqual(report["recommendation"], "bid")
        self.assertEqual(report["audit"]["status"], "pass")
        self.assertIn("a2a.evidence_audit", report["workflow_trace"])

    def test_arabic_analyze_route(self) -> None:
        response = self.client.post(
            "/api/analyze",
            json={
                "tender_id": "smart-city-maintenance-2026",
                "profile_id": "default-bidder-profile",
                "language": "ar",
            },
        )

        self.assertEqual(response.status_code, 200)
        report = response.json()["report"]
        self.assertEqual(report["language"], "ar")
        self.assertIn("يوصي", report["executive_summary"])

    def test_upload_validation_rejects_over_5mb(self) -> None:
        response = self.client.post(
            "/api/upload/validate",
            json={"filename": "large.pdf", "size_bytes": 5 * 1024 * 1024 + 1},
        )

        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertFalse(body["accepted"])
        self.assertIn("5 MB", body["reason"])

    def test_tender_files_validation_accepts_main_and_supporting(self) -> None:
        response = self.client.post(
            "/api/upload/tender-files/validate",
            json={
                "files": [
                    {"filename": "main.pdf", "size_bytes": 1024, "role": "main"},
                    {
                        "filename": "appendix.docx",
                        "size_bytes": 2048,
                        "role": "supporting",
                    },
                ]
            },
        )

        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertTrue(body["accepted"])
        self.assertEqual(body["file_count"], 2)

    def test_tender_files_validation_rejects_missing_main(self) -> None:
        response = self.client.post(
            "/api/upload/tender-files/validate",
            json={
                "files": [
                    {
                        "filename": "appendix.docx",
                        "size_bytes": 2048,
                        "role": "supporting",
                    },
                ]
            },
        )

        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertFalse(body["accepted"])
        self.assertIn("Main Tender File", body["reason"])

    def test_uploaded_tender_files_analysis_route(self) -> None:
        response = self.client.post(
            "/api/upload/analyze",
            data={"profile_id": "default-bidder-profile", "language": "en"},
            files=[
                (
                    "main_file",
                    (
                        "main.md",
                        b"Eligibility requires ISO 9001, ISO 27001, similar projects, and a proposal submission deadline.",
                        "text/markdown",
                    ),
                ),
                (
                    "supporting_files",
                    (
                        "appendix.txt",
                        b"Delivery risk includes mobilization and subcontractor capacity.",
                        "text/plain",
                    ),
                ),
            ],
        )

        self.assertEqual(response.status_code, 200)
        report = response.json()["report"]
        self.assertEqual(report["tender_id"], "uploaded-tender-files")
        self.assertEqual(len(report["source_documents"]), 2)
        self.assertEqual(report["audit"]["status"], "pass")
        self.assertIn("upload.extract_transient_text", report["workflow_trace"])

    def test_uploaded_pdf_analysis_is_clear_not_fake(self) -> None:
        response = self.client.post(
            "/api/upload/analyze",
            data={"profile_id": "default-bidder-profile", "language": "en"},
            files=[
                (
                    "main_file",
                    ("main.pdf", b"%PDF-1.4", "application/pdf"),
                )
            ],
        )

        self.assertEqual(response.status_code, 422)
        self.assertIn("PDF text analysis is not enabled", response.json()["detail"])

    def test_strategy_route_returns_score(self) -> None:
        response = self.client.post(
            "/api/strategy",
            json={
                "base_score": 0.8,
                "team_capacity": 24,
                "estimated_margin_percent": 14,
                "partnership_available": True,
                "certification_ready": True,
                "delivery_timeline_confidence": 0.8,
                "risk_appetite": "medium",
                "bid_preparation_budget_sar": 120000,
            },
        )

        self.assertEqual(response.status_code, 200)
        self.assertIn("score", response.json())


if __name__ == "__main__":
    unittest.main()
