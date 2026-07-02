"""Deterministic OKF evidence retrieval for tests and first demo path."""

from __future__ import annotations

import re
from pathlib import Path

from app.services.contracts import BidderProfile, EvidenceItem
from app.services.okf.parser import OkfDocument, load_okf_bundle

TOKEN_RE = re.compile(r"[a-z0-9]+", re.IGNORECASE)


def tokenize(text: str) -> set[str]:
    return {token.lower() for token in TOKEN_RE.findall(text) if len(token) > 2}


def _best_excerpt(doc: OkfDocument, query_tokens: set[str]) -> str:
    paragraphs = [
        paragraph.strip()
        for paragraph in re.split(r"\n\s*\n", doc.body)
        if paragraph.strip() and not paragraph.strip().startswith("# Citations")
    ]
    if not paragraphs:
        return doc.body[:400].strip()
    ranked = sorted(
        paragraphs,
        key=lambda paragraph: len(tokenize(paragraph) & query_tokens),
        reverse=True,
    )
    return ranked[0][:700]


def search_okf_evidence(
    bundle_dir: Path, tender_id: str, query: str, limit: int = 5
) -> list[EvidenceItem]:
    docs = [doc for doc in load_okf_bundle(bundle_dir) if doc.path.name != "log.md"]
    query_tokens = tokenize(query)
    scored: list[tuple[float, OkfDocument]] = []
    for doc in docs:
        haystack = " ".join(
            [
                doc.title,
                doc.concept_type,
                " ".join(doc.tags),
                doc.body,
            ]
        )
        score = float(len(tokenize(haystack) & query_tokens))
        if query.lower() in haystack.lower():
            score += 3.0
        if score > 0:
            scored.append((score, doc))

    scored.sort(key=lambda item: item[0], reverse=True)
    results: list[EvidenceItem] = []
    for rank, (score, doc) in enumerate(scored[:limit], start=1):
        citation = doc.citations[0] if doc.citations else f"OKF concept {doc.path.name}"
        results.append(
            EvidenceItem(
                id=f"{doc.concept_id}-{rank}",
                tender_id=tender_id,
                concept_id=doc.concept_id,
                title=doc.title,
                excerpt=_best_excerpt(doc, query_tokens),
                citation=citation,
                tags=doc.tags,
                score=score,
            )
        )
    return results


def profile_fact_evidence(profile: BidderProfile, tender_id: str) -> list[EvidenceItem]:
    facts = [
        (
            "profile-certifications",
            "Bidder certifications",
            ", ".join(profile.certifications),
            "Sample bidder profile certifications.",
            ["profile", "certifications"],
        ),
        (
            "profile-regions",
            "Bidder service regions",
            ", ".join(profile.regions_served),
            "Sample bidder profile regions served.",
            ["profile", "region"],
        ),
        (
            "profile-past-projects",
            "Bidder similar projects",
            "; ".join(project["name"] for project in profile.past_projects),
            "Sample bidder profile past projects.",
            ["profile", "experience"],
        ),
    ]
    return [
        EvidenceItem(
            id=fact_id,
            tender_id=tender_id,
            concept_id="bidder-profile",
            title=title,
            excerpt=excerpt,
            citation=citation,
            tags=tags,
            score=1.0,
        )
        for fact_id, title, excerpt, citation, tags in facts
    ]
