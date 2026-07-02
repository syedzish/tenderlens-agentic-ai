"""Load curated tender metadata and sample bidder profiles."""

from __future__ import annotations

import json
from pathlib import Path

from app.services.contracts import BidderProfile, TenderMetadata
from app.services.paths import BIDDER_PROFILES_DIR, SAMPLES_DIR


def _read_json(path: Path) -> dict:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def list_tenders() -> list[TenderMetadata]:
    return [
        TenderMetadata.from_dict(_read_json(path))
        for path in sorted(SAMPLES_DIR.glob("*.json"))
    ]


def get_tender(tender_id: str) -> TenderMetadata:
    for tender in list_tenders():
        if tender.id == tender_id:
            return tender
    raise FileNotFoundError(f"Unknown tender id: {tender_id}")


def get_company_profile(profile_id: str = "default-bidder-profile") -> BidderProfile:
    for path in sorted(BIDDER_PROFILES_DIR.glob("*.json")):
        profile = BidderProfile.from_dict(_read_json(path))
        if profile.id == profile_id:
            return profile
    raise FileNotFoundError(f"Unknown bidder profile id: {profile_id}")
