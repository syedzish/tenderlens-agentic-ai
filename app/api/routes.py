"""FastAPI routes for the TenderLens cockpit.

These routes are thin adapters over deterministic services. They are designed
to run locally, inside Agent Runtime passthrough, or behind Vercel server routes.
"""

from __future__ import annotations

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


def attach_tenderlens_api_routes(app: FastAPI) -> None:
    @app.get("/api/health")
    def health() -> dict:
        return {
            "status": "ok",
            "service": "TenderLens Agentic AI",
            "upload_max_mb": 5,
            "voice_mode": "explicit_start_only",
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

    @app.get("/api/okf/{tender_id}/validate")
    def validate_okf(tender_id: str) -> dict:
        try:
            return validate_okf_bundle_tool(tender_id)
        except FileNotFoundError as exc:
            raise HTTPException(status_code=404, detail=str(exc)) from exc
