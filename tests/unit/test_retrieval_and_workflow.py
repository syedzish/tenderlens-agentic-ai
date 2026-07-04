import unittest

from app.services.data_loader import get_company_profile, get_tender
from app.services.paths import OKF_DIR
from app.services.profile.matcher import score_profile_against_requirements
from app.services.retrieval.retriever import search_okf_evidence
from app.workflows.tender_workflow import run_tender_analysis


class RetrievalAndWorkflowTest(unittest.TestCase):
    def test_retrieval_returns_cited_evidence(self) -> None:
        tender = get_tender("smart-city-maintenance-2026")
        evidence = search_okf_evidence(
            OKF_DIR / tender.okf_bundle,
            tender.id,
            "ISO 27001 eligibility bilingual support",
            limit=3,
        )
        self.assertGreaterEqual(len(evidence), 1)
        self.assertTrue(all(item.citation for item in evidence))

    def test_profile_matches_mandatory_requirements(self) -> None:
        tender = get_tender("smart-city-maintenance-2026")
        profile = get_company_profile()
        scores = score_profile_against_requirements(
            tender.mandatory_requirements, profile
        )
        self.assertTrue(scores)
        self.assertFalse([item for item in scores if item["status"] == "fail"])

    def test_workflow_returns_audited_bid_report(self) -> None:
        report = run_tender_analysis()
        self.assertEqual(report.recommendation, "bid")
        self.assertEqual(report.audit.status, "pass", report.audit)
        self.assertGreaterEqual(report.confidence, 0.7)
        self.assertGreater(report.score, 0)
        self.assertTrue(report.evidence)
        self.assertTrue(report.clarification_questions)

    def test_workflow_voice_summary_available(self) -> None:
        report = run_tender_analysis(voice=True)
        self.assertIsNotNone(report.voice_summary)
        self.assertLess(len(report.voice_summary or ""), 220)


if __name__ == "__main__":
    unittest.main()
