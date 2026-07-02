import unittest

from app.workflows.tender_workflow import run_tender_analysis


class ToolTrajectoryConformanceTest(unittest.TestCase):
    def test_core_analysis_path_reaches_a2a_before_final(self) -> None:
        report = run_tender_analysis()
        trace = report.workflow_trace

        self.assertIn("router.accept_input", trace)
        self.assertIn("mcp.validate_okf_contract", trace)
        self.assertIn("retrieval.search_evidence", trace)
        self.assertIn("synthesis.create_draft", trace)
        self.assertIn("a2a.evidence_audit", trace)
        self.assertIn("bounded_quality_loop.pass", trace)
        self.assertLess(
            trace.index("a2a.evidence_audit"),
            trace.index("final.structured_report"),
        )

    def test_parallel_specialists_are_all_traced(self) -> None:
        trace = run_tender_analysis().workflow_trace
        expected_parallel_steps = {
            "parallel.compliance",
            "parallel.eligibility_profile_fit",
            "parallel.commercial_fit",
            "parallel.risk",
            "parallel.timeline",
            "parallel.bid_strategy",
            "parallel.clarification_questions",
        }

        self.assertTrue(expected_parallel_steps.issubset(set(trace)))
        self.assertLess(
            trace.index("parallel.start_specialists"),
            trace.index("synthesis.create_draft"),
        )

    def test_voice_path_routes_through_same_evidence_gate(self) -> None:
        trace = run_tender_analysis(voice=True).workflow_trace

        self.assertEqual(trace[0], "voice_session_adapter.transcript_turn")
        self.assertIn("retrieval.search_evidence", trace)
        self.assertIn("a2a.evidence_audit", trace)
        self.assertIn("bounded_quality_loop.pass", trace)


if __name__ == "__main__":
    unittest.main()
