"""Deterministic Evidence Audit Agent logic.

The production plan exposes this reviewer as a remote A2A agent. This module is
the deterministic core used by tests and by the current local workflow. The ADK
agent wrapper in ``agent.py`` can call the same functions once the remote A2A
surface is enabled.
"""

from __future__ import annotations

from app.services.contracts import AuditIssue, AuditResult, SpecialistFinding

MAX_REVISION_ROUNDS = 2


def _build_result(
    issues: list[AuditIssue],
    audited_claims: int,
    round_count: int,
) -> AuditResult:
    return AuditResult(
        status="pass" if not issues else "fail",
        round_count=round_count,
        issues=issues,
        audited_claims=audited_claims,
        missing_citation_count=sum(
            1 for issue in issues if issue.code == "missing_citation"
        ),
        unsupported_claim_count=sum(
            1 for issue in issues if issue.code == "unknown_evidence"
        ),
    )


def audit_findings(
    findings: list[SpecialistFinding],
    evidence_ids: set[str],
    *,
    language: str = "en",
    voice: bool = False,
    round_count: int = 1,
) -> AuditResult:
    """Audit specialist findings for grounded, schema-shaped output."""
    issues: list[AuditIssue] = []
    if not findings:
        issues.append(
            AuditIssue(
                code="invalid_schema",
                severity="high",
                message="Synthesis package did not include specialist findings.",
                revision_target="synthesis-agent",
            )
        )

    for finding in findings:
        if not finding.summary.strip():
            issues.append(
                AuditIssue(
                    code="invalid_schema",
                    severity="high",
                    message=f"{finding.agent} returned an empty finding summary.",
                    revision_target=finding.agent,
                )
            )
        if not finding.evidence_ids:
            issues.append(
                AuditIssue(
                    code="missing_citation",
                    severity="high",
                    message=f"{finding.agent} has no evidence citations.",
                    revision_target=finding.agent,
                )
            )
        missing = [
            evidence_id
            for evidence_id in finding.evidence_ids
            if evidence_id not in evidence_ids
        ]
        if missing:
            issues.append(
                AuditIssue(
                    code="unknown_evidence",
                    severity="medium",
                    message=(
                        f"{finding.agent} cited unknown evidence ids: "
                        f"{', '.join(missing)}."
                    ),
                    revision_target="retrieval-agent",
                )
            )
        if voice and len(finding.summary) > 480:
            issues.append(
                AuditIssue(
                    code="voice_response_mismatch",
                    severity="medium",
                    message=(
                        f"{finding.agent} finding is too long for a voice-first turn."
                    ),
                    revision_target="synthesis-agent",
                )
            )

    if language == "ar":
        # Arabic final-response checks happen in synthesis/UI tests; specialist
        # findings may stay internal English for deterministic audit tests.
        pass
    return _build_result(issues, len(findings), round_count)


def run_bounded_evidence_quality_loop(
    findings: list[SpecialistFinding],
    evidence_ids: set[str],
    *,
    language: str = "en",
    voice: bool = False,
    max_revision_rounds: int = MAX_REVISION_ROUNDS,
) -> AuditResult:
    """Run the bounded review loop before releasing a final report.

    The deterministic v1 implementation performs the same audit after each
    simulated revision round. LLM specialists can later use the returned issue
    targets to revise the failed section, while the current code still proves
    that unresolved issues cannot silently pass.
    """
    audit = audit_findings(findings, evidence_ids, language=language, voice=voice)
    if audit.status == "pass":
        return audit

    for revision_round in range(1, max_revision_rounds + 1):
        audit = audit_findings(
            findings,
            evidence_ids,
            language=language,
            voice=voice,
            round_count=revision_round + 1,
        )
        if audit.status == "pass":
            return audit
    return audit


def _coerce_finding(data: dict) -> SpecialistFinding:
    return SpecialistFinding(
        agent=str(data.get("agent", "Unknown Specialist")),
        summary=str(data.get("summary", "")),
        status=data.get("status", "watch"),
        confidence=float(data.get("confidence", 0.0)),
        evidence_ids=[str(item) for item in data.get("evidence_ids", [])],
        actions=[str(item) for item in data.get("actions", [])],
    )


def audit_draft_report(
    findings: list[dict],
    evidence_ids: list[str],
    language: str = "en",
    voice: bool = False,
) -> dict:
    """Tool-shaped wrapper for the A2A Evidence Audit Agent."""
    audit = run_bounded_evidence_quality_loop(
        [_coerce_finding(item) for item in findings],
        set(evidence_ids),
        language=language,
        voice=voice,
    )
    return {
        "status": audit.status,
        "round_count": audit.round_count,
        "audited_claims": audit.audited_claims,
        "missing_citation_count": audit.missing_citation_count,
        "unsupported_claim_count": audit.unsupported_claim_count,
        "issues": [issue.__dict__ for issue in audit.issues],
    }
