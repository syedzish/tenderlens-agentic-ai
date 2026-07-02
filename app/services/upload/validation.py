"""Privacy-safe upload validation helpers."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

MAX_UPLOAD_BYTES = 5 * 1024 * 1024
SUPPORTED_EXTENSIONS = {".pdf", ".txt", ".md", ".docx"}


@dataclass(frozen=True)
class UploadValidationResult:
    accepted: bool
    reason: str
    max_size_bytes: int = MAX_UPLOAD_BYTES


def validate_upload_metadata(filename: str, size_bytes: int) -> UploadValidationResult:
    suffix = Path(filename).suffix.lower()
    if suffix not in SUPPORTED_EXTENSIONS:
        return UploadValidationResult(
            accepted=False,
            reason="Unsupported file type. Upload PDF, TXT, MD, or DOCX.",
        )
    if size_bytes > MAX_UPLOAD_BYTES:
        return UploadValidationResult(
            accepted=False,
            reason="File is larger than the 5 MB limit.",
        )
    if size_bytes <= 0:
        return UploadValidationResult(
            accepted=False,
            reason="Uploaded file is empty.",
        )
    return UploadValidationResult(accepted=True, reason="Upload metadata accepted.")
