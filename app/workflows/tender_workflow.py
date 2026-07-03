"""Deterministic TenderLens analysis workflow.

This module gives the app a reliable, testable path before live model credentials
are available. ADK agents can wrap these functions as tools while richer LLM
specialists are implemented.
"""

from __future__ import annotations

from app.agents.a2a_audit.audit import run_bounded_evidence_quality_loop
from app.services.contracts import (
    DecisionReport,
    LanguageMode,
    SourceDocument,
    SpecialistFinding,
    StrategyAssumptions,
)
from app.services.data_loader import get_company_profile, get_tender
from app.services.paths import OKF_DIR
from app.services.profile.matcher import score_profile_against_requirements
from app.services.retrieval.retriever import profile_fact_evidence, search_okf_evidence
from app.services.scenario.scoring import DEFAULT_ASSUMPTIONS, simulate_strategy_overlay


def _finding(
    agent: str,
    summary: str,
    status: str,
    evidence_ids: list[str],
    confidence: float = 0.84,
    actions: list[str] | None = None,
) -> SpecialistFinding:
    return SpecialistFinding(
        agent=agent,
        summary=summary,
        status=status,  # type: ignore[arg-type]
        confidence=confidence,
        evidence_ids=evidence_ids,
        actions=actions or [],
    )


def run_tender_analysis(
    tender_id: str = "smart-city-maintenance-2026",
    profile_id: str = "default-bidder-profile",
    language: LanguageMode = "en",
    assumptions: StrategyAssumptions = DEFAULT_ASSUMPTIONS,
    voice: bool = False,
) -> DecisionReport:
    workflow_trace = [
        "router.accept_input",
        "intake.validate_tender",
        "profile.validate_profile",
        "okf.select_bundle",
        "mcp.validate_okf_contract",
        "retrieval.plan_queries",
    ]
    if voice:
        workflow_trace.insert(0, "voice_session_adapter.transcript_turn")

    tender = get_tender(tender_id)
    profile = get_company_profile(profile_id)
    bundle_dir = OKF_DIR / tender.okf_bundle

    evidence = []
    for query in [
        "mandatory eligibility ISO certifications bilingual support similar projects",
        "submission artifacts bid bond insurance method statement",
        "evaluation technical quality price localization scoring",
        "deadlines clarification submission late disqualified",
        "security access control incident reporting data handling",
        "delivery commercial risk mobilization HVAC partner",
    ]:
        evidence.extend(search_okf_evidence(bundle_dir, tender.id, query, limit=2))
    evidence.extend(profile_fact_evidence(profile, tender.id))
    workflow_trace.append("retrieval.search_evidence")

    evidence_by_id = {item.id: item for item in evidence}
    workflow_trace.append("parallel.start_specialists")
    profile_scores = score_profile_against_requirements(
        tender.mandatory_requirements, profile
    )
    hard_fails = [item for item in profile_scores if item["status"] == "fail"]
    base_score = 0.86 if not hard_fails else 0.52
    strategy = simulate_strategy_overlay(base_score, assumptions)
    recommendation = "bid" if strategy["score"] >= 0.72 and not hard_fails else "conditional_bid"
    if strategy["score"] < 0.55 or len(hard_fails) >= 2:
        recommendation = "no_bid"

    findings = [
        _finding(
            "Compliance Agent",
            "Mandatory certifications, operating permit, bilingual support, bid bond, and insurance appear satisfiable from the sample bidder profile.",
            "pass" if not hard_fails else "fail",
            ["eligibility-1", "submission-1", "profile-certifications"],
            actions=["Prepare copies of certifications, permit, bid bond, and insurance certificate."],
        ),
        _finding(
            "Eligibility / Profile Fit Agent",
            "The bidder has Riyadh coverage and two relevant smart-facilities references, which supports eligibility fit.",
            "pass",
            ["eligibility-1", "profile-regions", "profile-past-projects"],
            actions=["Attach two project references with scope, dates, and buyer contact details."],
        ),
        _finding(
            "Commercial Fit Agent",
            f"Estimated value is within the sample bidder budget range; scenario posture is {strategy['posture']}.",
            "pass",
            ["evaluation-1"],
            actions=["Keep pricing disciplined because price is 20 percent of scoring."],
        ),
        _finding(
            "Risk Agent",
            "Main delivery risk is specialized HVAC coverage and 21-day mobilization pressure; partner confirmation mitigates this.",
            "watch",
            ["risks-1"],
            actions=["Secure subcontractor commitment before final bid approval."],
        ),
        _finding(
            "Timeline Agent",
            "Clarification questions are due on 2026-07-08 and final submission is due on 2026-07-18.",
            "watch",
            ["deadlines-1"],
            actions=["Finalize clarification questions before the clarification deadline."],
        ),
        _finding(
            "Bid Strategy Agent",
            "Bid as a technically strong supplier, emphasizing bilingual SLA operations, ISO governance, and smart-facilities references.",
            "pass",
            ["evaluation-1", "security-1", "profile-past-projects"],
            actions=["Lead with technical quality and localization strengths rather than lowest price."],
        ),
        _finding(
            "Clarification Question Agent",
            "Ask targeted questions about HVAC asset inventory, dashboard data boundaries, and SLA measurement rules.",
            "pass",
            ["risks-1", "security-1", "evaluation-1"],
            actions=["Send clarification questions as a tracked pre-bid action."],
        ),
    ]
    workflow_trace.extend(
        [
            "parallel.compliance",
            "parallel.eligibility_profile_fit",
            "parallel.commercial_fit",
            "parallel.risk",
            "parallel.timeline",
            "parallel.bid_strategy",
            "parallel.clarification_questions",
            "synthesis.create_draft",
            "a2a.evidence_audit",
        ]
    )

    audit = run_bounded_evidence_quality_loop(
        findings,
        set(evidence_by_id),
        language=language,
        voice=voice,
    )
    workflow_trace.append(
        "bounded_quality_loop.pass"
        if audit.status == "pass"
        else "bounded_quality_loop.unresolved"
    )
    workflow_trace.append("final.structured_report")
    executive_summary = (
        "Bid recommended: the sample bidder profile appears to meet the core eligibility requirements, "
        "the opportunity is inside budget range, and the main risks are manageable with partner confirmation."
    )
    if recommendation == "conditional_bid":
        executive_summary = (
            "Conditional bid recommended: eligibility is mostly aligned, but the team should close listed gaps before final approval."
        )
    if recommendation == "no_bid":
        executive_summary = (
            "No-bid recommended unless hard blockers are resolved before the submission deadline."
        )

    if language == "ar":
        executive_summary = (
            "يوصي النظام بالمضي في العرض بشرط إغلاق المخاطر التشغيلية وتوثيق الأدلة المطلوبة قبل الموعد النهائي."
        )

    voice_summary = None
    if voice:
        voice_summary = (
            "Yes. Based on the sample profile, this is a strong bid candidate, with HVAC partner confirmation as the main watch item."
        )
        if language == "ar":
            voice_summary = "نعم، يبدو العرض مناسبا، مع ضرورة تأكيد شريك التغطية الفنية قبل التقديم."

    return DecisionReport(
        tender_id=tender.id,
        tender_title=tender.title,
        bidder_profile_id=profile.id,
        language=language,
        recommendation=recommendation,  # type: ignore[arg-type]
        confidence=float(strategy["score"]),
        executive_summary=executive_summary,
        findings=findings,
        evidence=evidence,
        missing_documents=[
            "Signed method statement",
            "Updated staffing plan with named bilingual support leads",
            "Subcontractor confirmation letter for specialized HVAC coverage",
        ],
        risks=[
            {
                "title": "Specialized HVAC coverage",
                "severity": "medium",
                "mitigation": "Confirm subcontractor availability before bid gate.",
                "evidence_id": "risks-1",
            },
            {
                "title": "Short mobilization window",
                "severity": "medium",
                "mitigation": "Prepare mobilization plan and named team roster.",
                "evidence_id": "risks-1",
            },
        ],
        clarification_questions=[
            {
                "question": "Please confirm the complete HVAC asset inventory and required specialist certifications.",
                "why_it_matters": "Specialized HVAC scope affects delivery risk and partner planning.",
                "priority": "high",
                "affects_bid_no_bid": True,
                "evidence_id": "risks-1",
            },
            {
                "question": "How will SLA response time be measured for incidents logged outside business hours?",
                "why_it_matters": "24x7 support design depends on the SLA measurement rule.",
                "priority": "medium",
                "affects_bid_no_bid": False,
                "evidence_id": "eligibility-1",
            },
            {
                "question": "Can the buyer clarify which dashboard data may be shared with subcontractors?",
                "why_it_matters": "Data handling boundaries affect cybersecurity controls and subcontractor operations.",
                "priority": "medium",
                "affects_bid_no_bid": False,
                "evidence_id": "security-1",
            },
        ],
        next_actions=[
            "Confirm HVAC subcontractor coverage.",
            "Prepare bid bond and insurance documents.",
            "Draft clarification questions before 2026-07-08.",
            "Build technical proposal around SLA operations, ISO governance, and Arabic reporting.",
        ],
        audit=audit,
        source_documents=[
            SourceDocument(
                id="sample-main-tender",
                role="sample",
                filename="smart_city_maintenance_tender.json",
                file_type=".json",
                size_bytes=0,
                parser_status="preloaded_example",
                text_char_count=0,
            )
        ],
        voice_summary=voice_summary,
        unresolved_evidence_gaps=[] if audit.status == "pass" else [issue.message for issue in audit.issues],
        workflow_trace=workflow_trace,
    )
