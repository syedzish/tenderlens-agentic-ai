"""Transient text extraction for uploaded Tender Files.

The functions in this module keep uploaded content in memory only. Callers are
responsible for avoiding durable logs/session state for raw extracted text.
"""

from __future__ import annotations

import re
import zipfile
from dataclasses import dataclass
from html import unescape
from io import BytesIO
from pathlib import Path

from app.services.contracts import SourceDocument, SourceRole
from app.services.upload.validation import UploadFileMetadata, validate_upload_metadata


class UploadExtractionError(ValueError):
    """Raised when a validated file cannot be safely parsed."""


@dataclass(frozen=True)
class ExtractedTenderDocument:
    source: SourceDocument
    text: str


def _decode_text(content: bytes) -> str:
    for encoding in ("utf-8-sig", "utf-8", "cp1256", "latin-1"):
        try:
            return content.decode(encoding)
        except UnicodeDecodeError:
            continue
    return content.decode("utf-8", errors="replace")


def _extract_docx_text(content: bytes) -> str:
    try:
        with zipfile.ZipFile(BytesIO(content)) as archive:
            document_xml = archive.read("word/document.xml").decode(
                "utf-8", errors="replace"
            )
    except (KeyError, zipfile.BadZipFile) as exc:
        raise UploadExtractionError(
            "DOCX file could not be read. Please upload a valid DOCX, TXT, or MD file."
        ) from exc

    paragraphs = re.findall(r"<w:p\b[^>]*>(.*?)</w:p>", document_xml, flags=re.DOTALL)
    lines: list[str] = []
    for paragraph in paragraphs:
        text_runs = re.findall(r"<w:t\b[^>]*>(.*?)</w:t>", paragraph, flags=re.DOTALL)
        line = unescape("".join(text_runs)).strip()
        if line:
            lines.append(line)
    return "\n\n".join(lines)


def extract_uploaded_document(
    filename: str,
    content: bytes,
    role: SourceRole,
    document_index: int,
) -> ExtractedTenderDocument:
    metadata = UploadFileMetadata(filename=filename, size_bytes=len(content), role=role)
    validation = validate_upload_metadata(metadata.filename, metadata.size_bytes)
    if not validation.accepted:
        raise UploadExtractionError(validation.reason)

    suffix = Path(filename).suffix.lower()
    if suffix in {".txt", ".md"}:
        text = _decode_text(content)
        parser_status = "parsed_text"
    elif suffix == ".docx":
        text = _extract_docx_text(content)
        parser_status = "parsed_docx"
    elif suffix == ".pdf":
        raise UploadExtractionError(
            "PDF text analysis is not enabled yet. Use TXT, MD, or DOCX for uploaded Tender Files, or use Preloaded Example Files."
        )
    else:
        raise UploadExtractionError(
            "Unsupported file type. Upload TXT, MD, DOCX, or use Preloaded Example Files."
        )

    normalized = "\n".join(line.rstrip() for line in text.splitlines()).strip()
    if not normalized:
        raise UploadExtractionError(
            f"{filename} did not contain extractable text. Please upload a text-readable Tender File."
        )

    return ExtractedTenderDocument(
        source=SourceDocument(
            id=f"upload-{role}-{document_index}",
            role=role,
            filename=filename,
            file_type=suffix,
            size_bytes=len(content),
            parser_status=parser_status,
            text_char_count=len(normalized),
        ),
        text=normalized,
    )
