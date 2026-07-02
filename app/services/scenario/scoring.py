"""Lightweight bid strategy simulator."""

from __future__ import annotations

from app.services.contracts import StrategyAssumptions


DEFAULT_ASSUMPTIONS = StrategyAssumptions(
    team_capacity=24,
    estimated_margin_percent=14.0,
    partnership_available=True,
    certification_ready=True,
    delivery_timeline_confidence=0.78,
    risk_appetite="medium",
    bid_preparation_budget_sar=85000,
)


def simulate_strategy_overlay(
    base_score: float, assumptions: StrategyAssumptions = DEFAULT_ASSUMPTIONS
) -> dict:
    score = base_score
    changes: list[str] = []

    if assumptions.team_capacity < 18:
        score -= 0.12
        changes.append("Capacity below preferred threshold weakens delivery confidence.")
    elif assumptions.team_capacity >= 24:
        score += 0.04
        changes.append("Capacity supports 24x7 support and mobilization.")

    if assumptions.partnership_available:
        score += 0.05
        changes.append("Confirmed partner coverage reduces specialized delivery risk.")
    else:
        score -= 0.08
        changes.append("No partner coverage increases specialized HVAC risk.")

    if not assumptions.certification_ready:
        score -= 0.25
        changes.append("Certification readiness is a hard eligibility risk.")

    if assumptions.delivery_timeline_confidence < 0.55:
        score -= 0.1
        changes.append("Low delivery confidence makes mobilization risky.")

    if assumptions.estimated_margin_percent < 8:
        score -= 0.05
        changes.append("Low margin could make the bid commercially unattractive.")

    score = max(0.0, min(1.0, score))
    posture = "selective_bid" if score < 0.72 else "strong_bid"
    if score < 0.55:
        posture = "no_bid_or_partner_first"

    return {
        "score": round(score, 2),
        "posture": posture,
        "changed_risks": changes,
        "explanation": "Scenario score reflects capacity, partner coverage, certification readiness, delivery confidence, and margin pressure.",
    }
