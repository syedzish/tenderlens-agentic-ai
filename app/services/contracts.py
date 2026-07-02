"""Shared domain contracts for TenderLens deterministic services."""

from __future__ import annotations

from dataclasses import asdict, dataclass, field
from typing import Literal

LanguageMode = Literal["en", "ar"]
Recommendation = Literal["bid", "no_bid", "conditional_bid"]
AuditStatus = Literal["pass", "fail", "unavailable"]
VoiceState = Literal[
    "idle",
    "connecting",
    "listening",
    "thinking",
    "speaking",
    "interrupted",
    "muted",
    "reconnecting",
    "error",
    "ended",
]


@dataclass(frozen=True)
class TenderMetadata:
    id: str
    title: str
    buyer: str
    source_type: str
    language: str
    region: str
    published_date: str
    submission_deadline: str
    description: str
    okf_bundle: str
    estimated_value_sar: int
    required_services: list[str]
    mandatory_requirements: list[str]

    @classmethod
    def from_dict(cls, data: dict) -> "TenderMetadata":
        return cls(
            id=str(data["id"]),
            title=str(data["title"]),
            buyer=str(data["buyer"]),
            source_type=str(data["source_type"]),
            language=str(data["language"]),
            region=str(data["region"]),
            published_date=str(data["published_date"]),
            submission_deadline=str(data["submission_deadline"]),
            description=str(data["description"]),
            okf_bundle=str(data["okf_bundle"]),
            estimated_value_sar=int(data["estimated_value_sar"]),
            required_services=list(data["required_services"]),
            mandatory_requirements=list(data["mandatory_requirements"]),
        )


@dataclass(frozen=True)
class BidderProfile:
    id: str
    company_name: str
    industry_services: list[str]
    regions_served: list[str]
    certifications: list[str]
    licenses: list[str]
    languages: list[str]
    past_projects: list[dict]
    team_capacity: int
    budget_range_sar: dict
    delivery_constraints: list[str]
    partner_network: list[str]
    insurance_bonding_readiness: dict
    security_compliance_capabilities: list[str]

    @classmethod
    def from_dict(cls, data: dict) -> "BidderProfile":
        return cls(
            id=str(data["id"]),
            company_name=str(data["company_name"]),
            industry_services=list(data["industry_services"]),
            regions_served=list(data["regions_served"]),
            certifications=list(data["certifications"]),
            licenses=list(data["licenses"]),
            languages=list(data["languages"]),
            past_projects=list(data["past_projects"]),
            team_capacity=int(data["team_capacity"]),
            budget_range_sar=dict(data["budget_range_sar"]),
            delivery_constraints=list(data["delivery_constraints"]),
            partner_network=list(data["partner_network"]),
            insurance_bonding_readiness=dict(data["insurance_bonding_readiness"]),
            security_compliance_capabilities=list(
                data["security_compliance_capabilities"]
            ),
        )


@dataclass(frozen=True)
class EvidenceItem:
    id: str
    tender_id: str
    concept_id: str
    title: str
    excerpt: str
    citation: str
    tags: list[str]
    score: float = 0.0


@dataclass(frozen=True)
class SpecialistFinding:
    agent: str
    summary: str
    status: Literal["pass", "watch", "fail"]
    confidence: float
    evidence_ids: list[str]
    actions: list[str] = field(default_factory=list)


@dataclass(frozen=True)
class AuditIssue:
    code: str
    severity: Literal["low", "medium", "high"]
    message: str
    revision_target: str


@dataclass(frozen=True)
class AuditResult:
    status: AuditStatus
    round_count: int
    issues: list[AuditIssue]
    audited_claims: int
    missing_citation_count: int
    unsupported_claim_count: int


@dataclass(frozen=True)
class StrategyAssumptions:
    team_capacity: int
    estimated_margin_percent: float
    partnership_available: bool
    certification_ready: bool
    delivery_timeline_confidence: float
    risk_appetite: Literal["low", "medium", "high"]
    bid_preparation_budget_sar: int


@dataclass(frozen=True)
class DecisionReport:
    tender_id: str
    tender_title: str
    bidder_profile_id: str
    language: LanguageMode
    recommendation: Recommendation
    confidence: float
    executive_summary: str
    findings: list[SpecialistFinding]
    evidence: list[EvidenceItem]
    missing_documents: list[str]
    risks: list[dict]
    clarification_questions: list[dict]
    next_actions: list[str]
    audit: AuditResult
    voice_summary: str | None = None
    unresolved_evidence_gaps: list[str] = field(default_factory=list)

    def to_dict(self) -> dict:
        return asdict(self)
