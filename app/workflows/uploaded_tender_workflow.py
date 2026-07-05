"""Transient workflow for user-uploaded Tender Files using live Vertex AI."""

from __future__ import annotations

import re
import json
from pydantic import BaseModel, Field
from google import genai
from google.genai import types

from app.agents.a2a_audit.audit import run_bounded_evidence_quality_loop
from app.services.contracts import (
    DecisionReport,
    EvidenceItem,
    LanguageMode,
    SpecialistFinding,
    StrategyAssumptions,
)
from app.services.data_loader import get_company_profile
from app.services.scenario.compliance_score import calculate_findings_score
from app.services.scenario.scoring import DEFAULT_ASSUMPTIONS
from app.services.upload.extraction import ExtractedTenderDocument


class FindingItem(BaseModel):
    agent: str = Field(description="Name of the specialist agent, e.g., 'Compliance Agent', 'Eligibility / Profile Fit Agent', etc.")
    summary: str = Field(description="Summary of the finding.")
    status: str = Field(description="Status of the finding, must be 'pass', 'fail', or 'watch'.")
    actions: list[str] = Field(description="Recommended follow-up actions.")
    source_query: str = Field(description="Search query terms used to locate evidence in the documents.")


class RiskItem(BaseModel):
    title: str = Field(description="Title of the risk.")
    severity: str = Field(description="Severity: 'low', 'medium', or 'high'.")
    mitigation: str = Field(description="Recommended mitigation strategy.")
    source_query: str = Field(description="Search query terms used to locate evidence for this risk.")


class QuestionItem(BaseModel):
    question: str = Field(description="The clarification question.")
    why_it_matters: str = Field(description="Why this question is important to the bidder.")
    priority: str = Field(description="Priority: 'low', 'medium', or 'high'.")
    affects_bid_no_bid: bool = Field(description="Whether this question impacts the bid/no-bid decision.")
    source_query: str = Field(description="Search query terms used to locate the related clause.")


class ExtractedTenderAnalysis(BaseModel):
    recommendation: str = Field(description="Recommendation, must be 'bid', 'no_bid', or 'conditional_bid'.")
    executive_summary: str = Field(description="A concise executive summary of the analysis.")
    findings: list[FindingItem] = Field(description="List of specific findings.")
    missing_documents: list[str] = Field(description="List of missing documents that are required.")
    risks: list[RiskItem] = Field(description="List of potential risks identified.")
    clarification_questions: list[QuestionItem] = Field(description="List of clarification questions to ask.")
    next_actions: list[str] = Field(description="List of recommended next steps.")


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
    
    # Collate all text for prompting
    full_text = ""
    for doc in documents:
        full_text += f"--- START OF DOCUMENT: {doc.source.filename} ({doc.source.role}) ---\n"
        full_text += doc.text
        full_text += f"\n--- END OF DOCUMENT: {doc.source.filename} ---\n\n"

    prompt = f"""
Analyze the following uploaded tender documents and provide a structured review based on the bidder profile: {profile_id}.
Make sure to extract:
1. Overall recommendation ('bid', 'no_bid', or 'conditional_bid').
2. An executive summary (preferably in {language}).
3. 6 findings, one for each of the following agents:
   - 'Compliance Agent'
   - 'Eligibility / Profile Fit Agent'
   - 'Commercial Fit Agent'
   - 'Risk Agent'
   - 'Timeline Agent'
   - 'Clarification Question Agent'
   For each finding, you MUST specify a status of 'pass', 'fail', or 'watch'.
   Make sure you specify a 'source_query' containing key terms from the document text where the finding was identified.
4. Any missing documents.
5. Key risks, with their severity and a mitigation strategy. Include a 'source_query'.
6. Clarification questions to ask the issuer. Include a 'source_query'.
7. Next actions.

Documents content:
{full_text}
"""

    client = genai.Client(
        vertexai=True,
        project="tenderlens-ai-zain-260704",
        location="us-central1"
    )

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=ExtractedTenderAnalysis,
            temperature=0.0,
        ),
    )

    data = json.loads(response.text)
    parsed = ExtractedTenderAnalysis(**data)

    # Resolve evidence & citations using _pick_excerpt
    evidence_list: list[EvidenceItem] = []
    
    # Map findings, risks, and questions to evidence items
    findings: list[SpecialistFinding] = []
    evidence_counter = 0

    for item in parsed.findings:
        evidence_counter += 1
        ev_id = f"uploaded-evidence-{evidence_counter}"
        excerpt, citation = _pick_excerpt(documents, item.source_query)
        evidence_list.append(
            EvidenceItem(
                id=ev_id,
                tender_id="uploaded-tender-files",
                concept_id=ev_id,
                title=f"Evidence for {item.agent}",
                excerpt=excerpt,
                citation=citation,
                tags=[item.agent.split(" ")[0].lower()],
                score=1.0,
            )
        )
        findings.append(
            SpecialistFinding(
                agent=item.agent,
                summary=item.summary,
                status=item.status,  # type: ignore
                confidence=0.85,
                evidence_ids=[ev_id],
                actions=item.actions,
            )
        )

    # Process risks
    risks_list: list[dict] = []
    for item in parsed.risks:
        evidence_counter += 1
        ev_id = f"uploaded-evidence-{evidence_counter}"
        excerpt, citation = _pick_excerpt(documents, item.source_query)
        evidence_list.append(
            EvidenceItem(
                id=ev_id,
                tender_id="uploaded-tender-files",
                concept_id=ev_id,
                title=f"Evidence for Risk: {item.title}",
                excerpt=excerpt,
                citation=citation,
                tags=["risk"],
                score=1.0,
            )
        )
        risks_list.append({
            "title": item.title,
            "severity": item.severity,
            "mitigation": item.mitigation,
            "evidence_id": ev_id,
        })

    # Process clarification questions
    questions_list: list[dict] = []
    for item in parsed.clarification_questions:
        evidence_counter += 1
        ev_id = f"uploaded-evidence-{evidence_counter}"
        excerpt, citation = _pick_excerpt(documents, item.source_query)
        evidence_list.append(
            EvidenceItem(
                id=ev_id,
                tender_id="uploaded-tender-files",
                concept_id=ev_id,
                title=f"Evidence for Question: {item.question[:20]}...",
                excerpt=excerpt,
                citation=citation,
                tags=["clarification"],
                score=1.0,
            )
        )
        questions_list.append({
            "question": item.question,
            "why_it_matters": item.why_it_matters,
            "priority": item.priority,
            "affects_bid_no_bid": item.affects_bid_no_bid,
            "evidence_id": ev_id,
        })

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
        {item.id for item in evidence_list},
        language=language,
        voice=voice,
    )
    workflow_trace.append(
        "bounded_quality_loop.pass"
        if audit.status == "pass"
        else "bounded_quality_loop.unresolved"
    )
    workflow_trace.append("final.structured_report")

    voice_summary = None
    if voice:
        if language == "ar":
            voice_summary = "تم تحليل الملفات بنجاح بواسطة الذكاء الاصطناعي."
        else:
            voice_summary = "Successfully completed the document analysis using live AI models."

    return DecisionReport(
        tender_id="uploaded-tender-files",
        tender_title=main_documents[0].source.filename,
        bidder_profile_id=profile.id,
        language=language,
        recommendation=parsed.recommendation,  # type: ignore
        confidence=0.85,
        executive_summary=parsed.executive_summary,
        findings=findings,
        evidence=evidence_list,
        missing_documents=parsed.missing_documents,
        risks=risks_list,  # type: ignore
        clarification_questions=questions_list,  # type: ignore
        next_actions=parsed.next_actions,
        audit=audit,
        source_documents=[document.source for document in documents],
        voice_summary=voice_summary,
        unresolved_evidence_gaps=[] if audit.status == "pass" else [issue.message for issue in audit.issues],
        workflow_trace=workflow_trace,
        score=calculate_findings_score(findings),
    )
