import unittest

from app.agents.a2a_audit.audit import (
    audit_draft_report,
    run_bounded_evidence_quality_loop,
)
from app.services.contracts import SpecialistFinding


class A2AEvidenceAuditLoopTest(unittest.TestCase):
    def test_missing_citation_fails_after_bounded_rounds(self) -> None:
        finding = SpecialistFinding(
            agent="Risk Agent",
            summary="Risk claim without citation.",
            status="watch",
            confidence=0.7,
            evidence_ids=[],
        )
        audit = run_bounded_evidence_quality_loop([finding], {"risk-1"})

        self.assertEqual(audit.status, "fail")
        self.assertEqual(audit.round_count, 3)
        self.assertEqual(audit.missing_citation_count, 1)
        self.assertEqual(audit.issues[0].revision_target, "Risk Agent")

    def test_unknown_evidence_routes_to_retrieval_agent(self) -> None:
        finding = SpecialistFinding(
            agent="Compliance Agent",
            summary="Claim cites missing evidence.",
            status="pass",
            confidence=0.8,
            evidence_ids=["missing-evidence-id"],
        )
        audit = run_bounded_evidence_quality_loop([finding], {"eligibility-1"})

        self.assertEqual(audit.status, "fail")
        self.assertEqual(audit.unsupported_claim_count, 1)
        self.assertEqual(audit.issues[0].revision_target, "retrieval-agent")

    def test_tool_wrapper_returns_serializable_audit(self) -> None:
        result = audit_draft_report(
            findings=[
                {
                    "agent": "Timeline Agent",
                    "summary": "Submission is due soon.",
                    "status": "watch",
                    "confidence": 0.9,
                    "evidence_ids": ["deadlines-1"],
                }
            ],
            evidence_ids=["deadlines-1"],
            language="en",
            voice=True,
        )

        self.assertEqual(result["status"], "pass")
        self.assertEqual(result["round_count"], 1)
        self.assertEqual(result["audited_claims"], 1)


if __name__ == "__main__":
    unittest.main()
