"""Filesystem paths for app-local deterministic services."""

from __future__ import annotations

from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = PROJECT_ROOT / "data"
SAMPLES_DIR = DATA_DIR / "samples"
OKF_DIR = DATA_DIR / "okf"
BIDDER_PROFILES_DIR = DATA_DIR / "bidder_profiles"
