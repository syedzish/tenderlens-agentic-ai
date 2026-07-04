"""Privacy-safe upload validation helpers."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

MAX_UPLOAD_BYTES = 4 * 1024 * 1024
MAX_UPLOAD_FILES = 5
MAX_TOTAL_UPLOAD_BYTES = 12 * 1024 * 1024
SUPPORTED_EXTENSIONS = {".pdf", ".txt", ".md", ".docx", ".jpg", ".jpeg", ".png", ".webp"}


@dataclass(frozen=True)
class UploadValidationResult:
    accepted: bool
    reason: str
    max_size_bytes: int = MAX_UPLOAD_BYTES


@dataclass(frozen=True)
class UploadFileMetadata:
    filename: str
    size_bytes: int
    role: str


@dataclass(frozen=True)
class TenderFilesValidationResult:
    accepted: bool
    reason: str
    file_count: int
    total_size_bytes: int
    max_file_count: int = MAX_UPLOAD_FILES
    max_file_size_bytes: int = MAX_UPLOAD_BYTES
    max_total_size_bytes: int = MAX_TOTAL_UPLOAD_BYTES


def validate_upload_metadata(filename: str, size_bytes: int) -> UploadValidationResult:
    suffix = Path(filename).suffix.lower()
    if suffix not in SUPPORTED_EXTENSIONS:
        return UploadValidationResult(
            accepted=False,
            reason="Unsupported file type. Upload PDF, DOCX, TXT, MD, JPG, PNG, or WEBP.",
        )
    if size_bytes > MAX_UPLOAD_BYTES:
        return UploadValidationResult(
            accepted=False,
            reason="File is larger than the 4 MB limit.",
        )
    if size_bytes <= 0:
        return UploadValidationResult(
            accepted=False,
            reason="Uploaded file is empty.",
        )
    return UploadValidationResult(accepted=True, reason="Upload metadata accepted.")


def validate_tender_files_metadata(
    files: Iterable[UploadFileMetadata],
) -> TenderFilesValidationResult:
    documents = list(files)
    total_size = sum(max(0, document.size_bytes) for document in documents)

    if not documents:
        return TenderFilesValidationResult(
            accepted=False,
            reason="Main Tender File is required.",
            file_count=0,
            total_size_bytes=0,
        )
    if len(documents) > MAX_UPLOAD_FILES:
        return TenderFilesValidationResult(
            accepted=False,
            reason="Tender Files are limited to 5 files total.",
            file_count=len(documents),
            total_size_bytes=total_size,
        )
    main_files = [document for document in documents if document.role == "main"]
    if len(main_files) != 1:
        return TenderFilesValidationResult(
            accepted=False,
            reason="Exactly one Main Tender File is required.",
            file_count=len(documents),
            total_size_bytes=total_size,
        )
    if total_size > MAX_TOTAL_UPLOAD_BYTES:
        return TenderFilesValidationResult(
            accepted=False,
            reason="Tender Files are larger than the 12 MB total limit.",
            file_count=len(documents),
            total_size_bytes=total_size,
        )
    for document in documents:
        if document.role not in {"main", "supporting"}:
            return TenderFilesValidationResult(
                accepted=False,
                reason="File role must be Main Tender File or Supporting File.",
                file_count=len(documents),
                total_size_bytes=total_size,
            )
        result = validate_upload_metadata(document.filename, document.size_bytes)
        if not result.accepted:
            prefix = "Main Tender File" if document.role == "main" else "Supporting File"
            return TenderFilesValidationResult(
                accepted=False,
                reason=f"{prefix} {document.filename}: {result.reason}",
                file_count=len(documents),
                total_size_bytes=total_size,
            )
    return TenderFilesValidationResult(
        accepted=True,
        reason="Tender Files accepted. We do not save your files.",
        file_count=len(documents),
        total_size_bytes=total_size,
    )
