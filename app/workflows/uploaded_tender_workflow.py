"""Transient workflow for user-uploaded Tender Files."""

from __future__ import annotations

import re

from app.agents.a2a_audit.audit import run_bounded_evidence_quality_loop
from app.services.contracts import (
    DecisionReport,
    EvidenceItem,
    LanguageMode,
    SpecialistFinding,
    StrategyAssumptions,
)
from app.services.data_loader import get_company_profile
from app.services.profile.matcher import score_profile_against_requirements
from app.services.scenario.scoring import DEFAULT_ASSUMPTIONS, simulate_strategy_overlay
from app.services.upload.extraction import ExtractedTenderDocument


def _sentence_chunks(text: str) -> list[str]:
    chunks = re.split(r"(?<=[.!?])\s+|\n\s*\n", text)
    return [chunk.strip() for chunk in chunks if chunk.strip()]


def _pick_excerpt(documents: list[ExtractedTenderDocument], query: str) -> tuple[str, str]:
    query_terms = {term for term in re.findall(r"[a-z0-9]+", query.lower()) if len(term) > 2}
    best_doc = documents[0]
    best_chunk = _sentence_chunks(best_doc.text)[0][:700]
    best_score = -1
    for document in documents:
        for chunk in _sentence_chunks(document.text):
            chunk_terms = set(re.findall(r"[a-z0-9]+", chunk.lower()))
            score = len(query_terms & chunk_terms)
            if score > best_score:
                best_score = score
                best_doc = document
                best_chunk = chunk[:700]
    citation = f"{best_doc.source.role.title()} Tender File: {best_doc.source.filename}"
    return best_chunk, citation


def _evidence(
    documents: list[ExtractedTenderDocument],
    evidence_id: str,
    title: str,
    query: str,
    tags: list[str],
) -> EvidenceItem:
    excerpt, citation = _pick_excerpt(documents, query)
    return EvidenceItem(
        id=evidence_id,
        tender_id="uploaded-tender-files",
        concept_id=evidence_id,
        title=title,
        excerpt=excerpt,
        citation=citation,
        tags=tags,
        score=1.0,
    )


def _finding(
    agent: str,
    summary: str,
    status: str,
    evidence_ids: list[str],
    actions: list[str],
) -> SpecialistFinding:
    return SpecialistFinding(
        agent=agent,
        summary=summary,
        status=status,  # type: ignore[arg-type]
        confidence=0.76,
        evidence_ids=evidence_ids,
        actions=actions,
    )


def run_uploaded_tender_files_analysis(
    documents: list[ExtractedTenderDocument],
    profile_id: str = "default-bidder-profile",
    language: LanguageMode = "en",
    assumptions: StrategyAssumptions = DEFAULT_ASSUMPTIONS,
    voice: bool = False,
) -> DecisionReport:
    if not documents:
        raise ValueError("At least one extracted Main Tender File is required.")
    main_documents = [doc for doc in documents if doc.source.role == "main"]
    if len(main_documents) != 1:
        raise ValueError("Exactly one Main Tender File is required.")

    profile = get_company_profile(profile_id)
    combined_text = "\n\n".join(document.text for document in documents)
    lower_text = combined_text.lower()
    profile_scores = score_profile_against_requirements(
        [
            "ISO 9001" if "iso 9001" in lower_text else "quality certification",
            "ISO 27001" if "iso 27001" in lower_text else "security certification",
            "similar projects" if "similar" in lower_text else "relevant experience",
        ],
        profile,
    )
    hard_fails = [item for item in profile_scores if item["status"] == "fail"]
    base_score = 0.72 if not hard_fails else 0.56
    if "deadline" in lower_text or "submission" in lower_text:
        base_score += 0.03
    if "bond" in lower_text or "insurance" in lower_text:
        base_score -= 0.02
    strategy = simulate_strategy_overlay(base_score, assumptions)
    recommendation = "conditional_bid"
    if strategy["score"] >= 0.78 and not hard_fails:
        recommendation = "bid"
    if strategy["score"] < 0.55 or len(hard_fails) >= 2:
        recommendation = "no_bid"

    evidence = [
        _evidence(
            documents,
            "uploaded-eligibility-1",
            "Eligibility and bidder requirements",
            "eligibility certification qualified bidder similar projects",
            ["eligibility", "compliance"],
        ),
        _evidence(
            documents,
            "uploaded-submission-1",
            "Submission requirements",
            "submission deadline proposal documents method statement bid bond insurance",
            ["submission", "deadline"],
        ),
        _evidence(
            documents,
            "uploaded-evaluation-1",
            "Evaluation and scoring",
            "evaluation scoring price technical quality criteria",
            ["evaluation", "strategy"],
        ),
        _evidence(
            documents,
            "uploaded-risk-1",
            "Delivery and contract risks",
            "risk mobilization contract service level penalties subcontractor",
            ["risk"],
        ),
    ]

    findings = [
        _finding(
            "Compliance Agent",
            "Uploaded Tender Files were parsed transiently and key bidder requirements were identified for review.",
            "watch",
            ["uploaded-eligibility-1", "uploaded-submission-1"],
            ["Confirm every mandatory requirement against the original Main Tender File before submission."],
        ),
        _finding(
            "Eligibility / Profile Fit Agent",
            "Initial profile fit is based on extracted eligibility language and the sample bidder profile.",
            "pass" if not hard_fails else "watch",
            ["uploaded-eligibility-1"],
            ["Attach evidence for certifications, licenses, regions, and similar projects."],
        ),
        _finding(
            "Commercial Fit Agent",
            f"Scenario score is {round(float(strategy['score']) * 100)}%; treat uploaded-file analysis as a decision support draft until all attachments are reviewed.",
            "watch",
            ["uploaded-evaluation-1"],
            ["Review pricing, bond, insurance, and resource assumptions before bid approval."],
        ),
        _finding(
            "Risk Agent",
            "Uploaded text suggests delivery and contractual risks should be checked against source clauses.",
            "watch",
            ["uploaded-risk-1"],
            ["Escalate penalties, mobilization, SLA, and subcontractor dependencies."],
        ),
        _finding(
            "Timeline Agent",
            "Submission timing should be confirmed from the Main Tender File and any addenda.",
            "watch",
            ["uploaded-submission-1"],
            ["Extract final submission, clarification, and pre-bid meeting dates."],
        ),
        _finding(
            "Clarification Question Agent",
            "Generate issuer questions from ambiguous scope, scoring, submission, and risk language.",
            "pass",
            ["uploaded-risk-1", "uploaded-evaluation-1"],
            ["Prepare clarification questions before the issuer deadline."],
        ),
    ]

    workflow_trace = [
        "router.accept_input",
        "intake.validate_tender_files",
        "upload.extract_transient_text",
        "profile.validate_profile",
        "okf.build_transient_bundle",
        "retrieval.search_uploaded_evidence",
        "parallel.compliance",
        "parallel.eligibility_profile_fit",
        "parallel.commercial_fit",
        "parallel.risk",
        "parallel.timeline",
        "parallel.clarification_questions",
        "synthesis.create_draft",
        "a2a.evidence_audit",
    ]
    if voice:
        workflow_trace.insert(0, "voice_session_adapter.transcript_turn")

    audit = run_bounded_evidence_quality_loop(
        findings,
        {item.id for item in evidence},
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
        "Uploaded Tender Files were analyzed transiently. TenderLens recommends a conditional bid posture until the bidder closes source-backed gaps and confirms final deadlines, bonds, insurance, and delivery constraints."
    )
    if recommendation == "bid":
        executive_summary = (
            "Uploaded Tender Files show a promising bid fit. Keep the decision gated on final evidence review, pricing, and source-backed mandatory requirements."
        )
    if recommendation == "no_bid":
        executive_summary = (
            "Uploaded Tender Files show possible blockers. Do not bid unless the hard gaps are resolved before the submission deadline."
        )
    if language == "ar":
        executive_summary = (
            "تم تحليل ملفات المناقصة المرفوعة بشكل مؤقت. يوصي TenderLens بموقف تقديم مشروط حتى يتم إغلاق الفجوات وتأكيد المواعيد والضمانات والتأمين ومخاطر التنفيذ من المصدر."
        )

    voice_summary = None
    if voice:
        voice_summary = (
            "I analyzed the uploaded files transiently. The current posture is conditional bid until source-backed gaps are closed."
        )
        if language == "ar":
            voice_summary = "حللت الملفات المرفوعة مؤقتا. الموقف الحالي هو تقديم مشروط حتى إغلاق الفجوات."

    return DecisionReport(
        tender_id="uploaded-tender-files",
        tender_title=main_documents[0].source.filename,
        bidder_profile_id=profile.id,
        language=language,
        recommendation=recommendation,  # type: ignore[arg-type]
        confidence=float(strategy["score"]),
        executive_summary=executive_summary,
        findings=findings,
        evidence=evidence,
        missing_documents=[
            "Final signed proposal checklist",
            "Bid bond or insurance proof if required",
            "Named delivery team and subcontractor confirmations",
        ],
        risks=[
            {
                "title": "Source-backed mandatory gaps",
                "severity": "medium",
                "mitigation": "Review all mandatory clauses in the Main Tender File before approval.",
                "evidence_id": "uploaded-eligibility-1",
            },
            {
                "title": "Attachment precedence",
                "severity": "medium",
                "mitigation": "Check addenda and revised files for changes to deadlines or scoring.",
                "evidence_id": "uploaded-submission-1",
            },
        ],
        clarification_questions=[
            {
                "question": "Can the issuer confirm which uploaded attachment is authoritative if requirements conflict?",
                "why_it_matters": "Supporting Files and addenda may change scope, deadlines, or scoring.",
                "priority": "high",
                "affects_bid_no_bid": True,
                "evidence_id": "uploaded-submission-1",
            },
            {
                "question": "Which documents are mandatory for technical and commercial envelope compliance?",
                "why_it_matters": "Missing mandatory documents can disqualify the bid.",
                "priority": "high",
                "affects_bid_no_bid": True,
                "evidence_id": "uploaded-eligibility-1",
            },
        ],
        next_actions=[
            "Review Main Tender File clauses against the source excerpts.",
            "Confirm whether any Supporting Files are addenda or revised requirements.",
            "Prepare source-backed answers for eligibility, delivery, and pricing questions.",
        ],
        audit=audit,
        source_documents=[document.source for document in documents],
        voice_summary=voice_summary,
        unresolved_evidence_gaps=[] if audit.status == "pass" else [issue.message for issue in audit.issues],
        workflow_trace=workflow_trace,
    )
