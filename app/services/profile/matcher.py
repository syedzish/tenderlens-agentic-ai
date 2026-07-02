"""Compare bidder profile facts against tender requirements."""

from __future__ import annotations

from app.services.contracts import BidderProfile


def normalize(value: str) -> str:
    return " ".join(value.lower().replace("-", " ").split())


def profile_has_text(values: list[str], expected: str) -> bool:
    expected_norm = normalize(expected)
    return any(expected_norm in normalize(value) for value in values)


def score_requirement(requirement: str, profile: BidderProfile) -> dict:
    req = normalize(requirement)
    status = "watch"
    score = 0.5
    evidence: list[str] = []

    if "iso 9001" in req:
        status = "pass" if profile_has_text(profile.certifications, "ISO 9001") else "fail"
        score = 1.0 if status == "pass" else 0.0
        evidence.append("profile-certifications")
    elif "iso 27001" in req:
        status = "pass" if profile_has_text(profile.certifications, "ISO 27001") else "fail"
        score = 1.0 if status == "pass" else 0.0
        evidence.append("profile-certifications")
    elif "riyadh operating permit" in req:
        status = "pass" if profile_has_text(profile.licenses, "Riyadh operating permit") else "fail"
        score = 1.0 if status == "pass" else 0.0
        evidence.append("profile-regions")
    elif "two similar" in req:
        status = "pass" if len(profile.past_projects) >= 2 else "fail"
        score = 1.0 if status == "pass" else 0.0
        evidence.append("profile-past-projects")
    elif "24x7 bilingual" in req or "arabic and english" in req:
        has_languages = {"arabic", "english"}.issubset(
            {normalize(language) for language in profile.languages}
        )
        status = "pass" if has_languages else "fail"
        score = 1.0 if status == "pass" else 0.0
        evidence.append("profile-languages")
    elif "bid bond" in req:
        ready = bool(profile.insurance_bonding_readiness.get("bid_bond_ready"))
        status = "pass" if ready else "fail"
        score = 1.0 if ready else 0.0
        evidence.append("profile-bonding")
    elif "professional liability" in req:
        ready = bool(
            profile.insurance_bonding_readiness.get(
                "professional_liability_insurance"
            )
        )
        status = "pass" if ready else "fail"
        score = 1.0 if ready else 0.0
        evidence.append("profile-insurance")

    return {
        "requirement": requirement,
        "status": status,
        "score": score,
        "evidence_ids": evidence,
    }


def score_profile_against_requirements(
    requirements: list[str], profile: BidderProfile
) -> list[dict]:
    return [score_requirement(requirement, profile) for requirement in requirements]
