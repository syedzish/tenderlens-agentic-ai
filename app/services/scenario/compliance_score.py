"""Deterministic displayed-score helpers.

The model/workflow may expose confidence for decision posture, but the UI score
must be derived from checked rows so repeated analysis of the same files does
not produce drifting numbers.
"""

from __future__ import annotations

import re

from app.services.contracts import SpecialistFinding

STATUS_SCORES = {
    "pass": 100,
    "watch": 55,
    "fail": 0,
}

RISK_PENALTIES = {
    "low": 0,
    "medium": 5,
    "high": 10,
}


def _risk_level(finding: SpecialistFinding) -> str:
    if finding.status == "pass":
        return "low"

    text = f"{finding.agent} {finding.summary} {' '.join(finding.actions)}".lower()
    if re.search(r"deadline|late|delay|mandatory|security|bond|penalt|blocker", text):
        return "high"
    return "medium"


def calculate_findings_score(findings: list[SpecialistFinding]) -> int:
    if not findings:
        return 0

    total = 0
    for finding in findings:
        penalty = RISK_PENALTIES[_risk_level(finding)]
        if finding.status == "pass":
            penalty = 0
        total += max(0, STATUS_SCORES[finding.status] - penalty)

    return min(100, max(0, round(total / len(findings) / 5) * 5))
