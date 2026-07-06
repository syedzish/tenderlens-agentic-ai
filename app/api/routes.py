"""FastAPI routes for the TenderLens cockpit.

These routes are thin adapters over deterministic services. They are designed
to run locally, inside Agent Runtime passthrough, or behind Vercel server routes.
"""

from __future__ import annotations

import logging
import os
from typing import Literal

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from pydantic import BaseModel, Field

from app.mcp.tools import (
    get_company_profile_tool,
    list_tenders_tool,
    validate_tender_files_tool,
    validate_okf_bundle_tool,
    validate_upload_tool,
)
from app.services.contracts import StrategyAssumptions
from app.services.scenario.scoring import DEFAULT_ASSUMPTIONS
from app.services.upload.extraction import UploadExtractionError, extract_uploaded_document
from app.workflows.tender_workflow import run_tender_analysis
from app.workflows.uploaded_tender_workflow import run_uploaded_tender_files_analysis

LOGGER = logging.getLogger(__name__)
FRIENDLY_MODEL_RETRY = (
    "TenderLens could not reach the model right now. Please try again after some time."
)


class AnalyzeRequest(BaseModel):
    tender_id: str = Field(default="smart-city-maintenance-2026")
    profile_id: str = Field(default="default-bidder-profile")
    language: Literal["en", "ar"] = Field(default="en")
    voice: bool = Field(default=False)


class UploadMetadataRequest(BaseModel):
    filename: str
    size_bytes: int


class TenderFileMetadataRequest(BaseModel):
    filename: str
    size_bytes: int
    role: Literal["main", "supporting"]


class TenderFilesMetadataRequest(BaseModel):
    files: list[TenderFileMetadataRequest] = Field(default_factory=list)


class StrategyRequest(BaseModel):
    base_score: float = Field(ge=0, le=1)
    team_capacity: int = Field(default=DEFAULT_ASSUMPTIONS.team_capacity)
    estimated_margin_percent: float = Field(
        default=DEFAULT_ASSUMPTIONS.estimated_margin_percent
    )
    partnership_available: bool = Field(
        default=DEFAULT_ASSUMPTIONS.partnership_available
    )
    certification_ready: bool = Field(default=DEFAULT_ASSUMPTIONS.certification_ready)
    delivery_timeline_confidence: float = Field(
        default=DEFAULT_ASSUMPTIONS.delivery_timeline_confidence,
        ge=0,
        le=1,
    )
    risk_appetite: Literal["low", "medium", "high"] = Field(
        default=DEFAULT_ASSUMPTIONS.risk_appetite
    )
    bid_preparation_budget_sar: int = Field(
        default=DEFAULT_ASSUMPTIONS.bid_preparation_budget_sar
    )


class DiscussTurn(BaseModel):
    role: Literal["user", "agent", "assistant"] = Field(default="user")
    content: str = Field(default="")


class DiscussRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    language: Literal["en", "ar"] = Field(default="en")
    mode: Literal["text", "voice"] = Field(default="text")
    report: dict = Field(default_factory=dict)
    history: list[DiscussTurn] = Field(default_factory=list)


def _has_live_discuss_credentials() -> bool:
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if api_key and "your-" not in api_key.lower():
        return True
    use_vertex = os.getenv("GOOGLE_GENAI_USE_VERTEXAI", "").lower() in {"1", "true", "yes"}
    project = os.getenv("GOOGLE_CLOUD_PROJECT", "")
    return bool(use_vertex and project and not project.startswith("your-"))


def _model_provider() -> str:
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if api_key and "your-" not in api_key.lower():
        return "gemini-api"
    use_vertex = os.getenv("GOOGLE_GENAI_USE_VERTEXAI", "").lower() in {"1", "true", "yes"}
    project = os.getenv("GOOGLE_CLOUD_PROJECT", "")
    if use_vertex and project and not project.startswith("your-"):
        return "vertex-ai"
    return "unavailable"


def _model_status(model_name: str) -> dict:
    provider = _model_provider()
    return {
        "connected": provider != "unavailable",
        "provider": provider,
        "model": model_name,
    }


def _report_text(report: dict) -> str:
    evidence = report.get("evidence") or []
    findings = report.get("findings") or []
    risks = report.get("risks") or []
    return "\n".join(
        [
            f"Executive summary: {report.get('executive_summary', '')}",
            f"Score: {report.get('score', '')}",
            f"Missing documents: {', '.join(map(str, report.get('missing_documents') or []))}",
            f"Next actions: {', '.join(map(str, report.get('next_actions') or []))}",
            "Risks: "
            + "; ".join(
                str(item.get("title") or item.get("summary") or item)
                if isinstance(item, dict)
                else str(item)
                for item in risks[:6]
            ),
            "Findings: "
            + "; ".join(
                str(item.get("summary") or item.get("agent") or item)
                if isinstance(item, dict)
                else str(item)
                for item in findings[:8]
            ),
            "Evidence: "
            + "; ".join(
                f"{item.get('citation', '')}: {item.get('excerpt', '')}"
                if isinstance(item, dict)
                else str(item)
                for item in evidence[:8]
            ),
        ]
    )


def _grounded_discuss_answer(request: DiscussRequest) -> dict:
    report = request.report or {}
    message = request.message.lower()
    missing = [str(item) for item in report.get("missing_documents") or []]
    next_actions = [str(item) for item in report.get("next_actions") or []]
    evidence = report.get("evidence") or []
    risks = report.get("risks") or []
    summary = str(report.get("executive_summary") or "The active analysis is available.")

    if "missing" in message or "document" in message:
        answer = (
            f"Documents or confirmations still needed: {', '.join(missing[:5])}."
            if missing
            else "The current analysis does not list missing documents."
        )
    elif "risk" in message:
        risk_text = []
        for risk in risks[:4]:
            if isinstance(risk, dict):
                risk_text.append(str(risk.get("title") or risk.get("mitigation") or risk))
            else:
                risk_text.append(str(risk))
        answer = f"Biggest risks: {', '.join(risk_text)}." if risk_text else summary
    elif "evidence" in message or "why" in message or "citation" in message:
        evidence_bits = [
            f"{item.get('citation', 'source')}: {item.get('excerpt', '')}"
            for item in evidence[:3]
            if isinstance(item, dict)
        ]
        answer = "Evidence: " + " ".join(evidence_bits) if evidence_bits else "No evidence excerpts are attached to this answer."
    elif "next" in message or "action" in message:
        answer = (
            f"Next actions: {', '.join(next_actions[:5])}."
            if next_actions
            else "No next actions are listed in the active analysis."
        )
    else:
        answer = summary

    if request.language == "ar":
        answer = f"إجابة مستندة إلى التحليل الحالي: {answer}"

    citations = [
        str(item.get("citation"))
        for item in evidence
        if isinstance(item, dict) and item.get("citation")
    ][:4]
    followups = (
        ["ما أكبر المخاطر؟", "ما المستندات الناقصة؟", "ما الخطوات التالية؟"]
        if request.language == "ar"
        else ["What are the biggest risks?", "Which evidence supports this?", "What should we do next?"]
    )
    return {"answer": answer, "citations": citations, "followups": followups}


def _model_discuss_answer(request: DiscussRequest) -> dict:
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if api_key and api_key.startswith("test-"):
        return _grounded_discuss_answer(request)
    try:
        from google import genai

        if api_key:
            client = genai.Client(api_key=api_key)
        else:
            client = genai.Client(
                vertexai=True,
                project=os.environ["GOOGLE_CLOUD_PROJECT"],
                location=os.getenv("GOOGLE_CLOUD_LOCATION", "us-central1"),
            )
        language_instruction = "Answer in Arabic." if request.language == "ar" else "Answer in English."
        prompt = (
            "Answer in a friendly, helpful, conversational, and professional tone. "
            "Answer only from the provided analysis report and evidence. "
            "If the report does not contain enough evidence, say what is missing. "
            "Do not repeat earlier answers. Address the latest user question directly. "
            "Prioritize and strictly follow any styling, formatting, or length instructions specified in the user's question (for example, if they ask to summarize in 2 points, write in bullet points, keep it to one sentence, etc.). "
            "Avoid using rigid labels, headers, or bullet prefixes like 'Reason:' or 'Next Step:'. "
            "Instead, weave your grounding explanations and recommended next actions naturally and conversationally into your response. "
            "Otherwise, when no specific formatting is requested, answer directly and naturally include a brief explanation and next step in a friendly, conversational manner. "
            f"{language_instruction}\n\n"
            f"Mode: {request.mode}\n"
            f"Question: {request.message}\n\n"
            f"Recent history: {[turn.model_dump() for turn in request.history[-6:]]}\n\n"
            f"Current report:\n{_report_text(request.report)}"
        )
        response = client.models.generate_content(
            model=os.getenv("TENDERLENS_DISCUSS_MODEL", "gemini-2.5-flash"),
            contents=prompt,
        )
        answer = getattr(response, "text", "") or ""
        if not answer.strip():
            raise RuntimeError("Model returned an empty answer.")
        grounded = _grounded_discuss_answer(request)
        grounded["answer"] = answer.strip()
        return grounded
    except Exception as exc:  # pragma: no cover - network/client dependent.
        LOGGER.warning("Live discussion model call failed: %s: %s", type(exc).__name__, exc)
        raise HTTPException(status_code=503, detail=FRIENDLY_MODEL_RETRY) from exc


def attach_tenderlens_api_routes(app: FastAPI) -> None:
    @app.get("/api/health")
    def health() -> dict:
        return {
            "status": "ok",
            "service": "TenderLens Agentic AI",
            "upload_max_mb": 5,
            "voice_mode": "explicit_start_only",
        }

    @app.get("/api/model-status")
    def model_status() -> dict:
        return {
            "service": "TenderLens Agentic AI",
            "friendly_retry": FRIENDLY_MODEL_RETRY,
            "discuss": _model_status(
                os.getenv("TENDERLENS_DISCUSS_MODEL", "gemini-2.5-flash")
            ),
            "upload": _model_status(
                os.getenv("TENDERLENS_VISION_MODEL", "gemini-flash-latest")
            ),
        }

    @app.get("/api/tenders")
    def tenders() -> dict:
        return list_tenders_tool()

    @app.get("/api/profile/{profile_id}")
    def profile(profile_id: str) -> dict:
        try:
            return get_company_profile_tool(profile_id)
        except FileNotFoundError as exc:
            raise HTTPException(status_code=404, detail=str(exc)) from exc

    @app.post("/api/analyze")
    def analyze(request: AnalyzeRequest) -> dict:
        try:
            assumptions = DEFAULT_ASSUMPTIONS
            report = run_tender_analysis(
                tender_id=request.tender_id,
                profile_id=request.profile_id,
                language=request.language,
                assumptions=assumptions,
                voice=request.voice,
            )
            return {"report": report.to_dict()}
        except FileNotFoundError as exc:
            raise HTTPException(status_code=404, detail=str(exc)) from exc

    @app.post("/api/upload/validate")
    def validate_upload(request: UploadMetadataRequest) -> dict:
        return validate_upload_tool(request.filename, request.size_bytes)

    @app.post("/api/upload/tender-files/validate")
    def validate_tender_files(request: TenderFilesMetadataRequest) -> dict:
        return validate_tender_files_tool([file.model_dump() for file in request.files])

    @app.post("/api/upload/analyze")
    async def analyze_uploaded_tender_files(
        main_file: UploadFile = File(...),
        supporting_files: list[UploadFile] = File(default=[]),
        profile_id: str = Form(default="default-bidder-profile"),
        language: Literal["en", "ar"] = Form(default="en"),
        voice: bool = Form(default=False),
    ) -> dict:
        files = [main_file, *supporting_files]
        file_bytes = [await file.read() for file in files]
        metadata = [
            {
                "filename": file.filename or "unnamed",
                "size_bytes": len(content),
                "role": "main" if index == 0 else "supporting",
            }
            for index, (file, content) in enumerate(zip(files, file_bytes, strict=True))
        ]
        validation = validate_tender_files_tool(metadata)
        if not validation["accepted"]:
            raise HTTPException(status_code=400, detail=validation["reason"])

        try:
            extracted = [
                extract_uploaded_document(
                    filename=item["filename"],
                    content=content,
                    role=item["role"],  # type: ignore[arg-type]
                    document_index=index + 1,
                )
                for index, (item, content) in enumerate(
                    zip(metadata, file_bytes, strict=True)
                )
            ]
        except UploadExtractionError as exc:
            raise HTTPException(status_code=422, detail=str(exc)) from exc

        report = run_uploaded_tender_files_analysis(
            extracted,
            profile_id=profile_id,
            language=language,
            voice=voice,
        )
        return {"report": report.to_dict()}

    @app.post("/api/strategy")
    def strategy(request: StrategyRequest) -> dict:
        from app.services.scenario.scoring import simulate_strategy_overlay

        assumptions = StrategyAssumptions(
            team_capacity=request.team_capacity,
            estimated_margin_percent=request.estimated_margin_percent,
            partnership_available=request.partnership_available,
            certification_ready=request.certification_ready,
            delivery_timeline_confidence=request.delivery_timeline_confidence,
            risk_appetite=request.risk_appetite,
            bid_preparation_budget_sar=request.bid_preparation_budget_sar,
        )
        return simulate_strategy_overlay(request.base_score, assumptions)

    @app.post("/api/discuss")
    def discuss(request: DiscussRequest) -> dict:
        if not _has_live_discuss_credentials():
            raise HTTPException(
                status_code=503,
                detail=FRIENDLY_MODEL_RETRY,
            )
        return _model_discuss_answer(request)

    @app.get("/api/okf/{tender_id}/validate")
    def validate_okf(tender_id: str) -> dict:
        try:
            return validate_okf_bundle_tool(tender_id)
        except FileNotFoundError as exc:
            raise HTTPException(status_code=404, detail=str(exc)) from exc
