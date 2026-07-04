"""Transient text extraction for uploaded Tender Files.

The functions in this module keep uploaded content in memory only. Callers are
responsible for avoiding durable logs/session state for raw extracted text.
"""

from __future__ import annotations

import os
import re
import zlib
import zipfile
from dataclasses import dataclass
from html import unescape
from io import BytesIO
from pathlib import Path

from google import genai
from google.genai import types

from app.services.contracts import SourceDocument, SourceRole
from app.services.upload.validation import UploadFileMetadata, validate_upload_metadata


class UploadExtractionError(ValueError):
    """Raised when a validated file cannot be safely parsed."""


@dataclass(frozen=True)
class ExtractedTenderDocument:
    source: SourceDocument
    text: str


IMAGE_MIME_TYPES = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
}


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
            "DOCX file could not be read. Please upload a valid DOCX, TXT, MD, PDF, or image file."
        ) from exc

    paragraphs = re.findall(r"<w:p\b[^>]*>(.*?)</w:p>", document_xml, flags=re.DOTALL)
    lines: list[str] = []
    for paragraph in paragraphs:
        text_runs = re.findall(r"<w:t\b[^>]*>(.*?)</w:t>", paragraph, flags=re.DOTALL)
        line = unescape("".join(text_runs)).strip()
        if line:
            lines.append(line)
    return "\n\n".join(lines)


def _decode_pdf_literal(value: bytes) -> str:
    for encoding in ("utf-8", "latin-1"):
        decoded = value.decode(encoding, errors="ignore").strip()
        if decoded:
            return decoded
    return ""


def _extract_pdf_literal_strings(data: bytes) -> list[str]:
    strings: list[str] = []
    index = 0
    length = len(data)
    while index < length:
        if data[index] != ord("("):
            index += 1
            continue

        index += 1
        depth = 1
        buffer = bytearray()
        escaped = False
        while index < length and depth > 0:
            byte = data[index]
            if escaped:
                if byte in b"nrtbf":
                    buffer.append(
                        {
                            ord("n"): 10,
                            ord("r"): 13,
                            ord("t"): 9,
                            ord("b"): 8,
                            ord("f"): 12,
                        }[byte]
                    )
                elif ord("0") <= byte <= ord("7"):
                    digits = bytes([byte])
                    lookahead = index + 1
                    while (
                        lookahead < length
                        and len(digits) < 3
                        and ord("0") <= data[lookahead] <= ord("7")
                    ):
                        digits += bytes([data[lookahead]])
                        lookahead += 1
                    buffer.append(int(digits, 8) & 0xFF)
                    index = lookahead - 1
                else:
                    buffer.append(byte)
                escaped = False
            elif byte == ord("\\"):
                escaped = True
            elif byte == ord("("):
                depth += 1
                buffer.append(byte)
            elif byte == ord(")"):
                depth -= 1
                if depth:
                    buffer.append(byte)
            else:
                buffer.append(byte)
            index += 1

        text = _decode_pdf_literal(bytes(buffer))
        if len(text) > 1 and any(character.isalpha() for character in text):
            strings.append(text)

    return strings


def _extract_pdf_hex_strings(data: bytes) -> list[str]:
    strings: list[str] = []
    for match in re.finditer(rb"<([0-9A-Fa-f\s]{4,})>", data):
        hex_text = re.sub(rb"\s+", b"", match.group(1))
        if len(hex_text) % 2:
            continue
        try:
            decoded_bytes = bytes.fromhex(hex_text.decode("ascii"))
        except ValueError:
            continue
        text = _decode_pdf_literal(decoded_bytes)
        if len(text) > 1 and any(character.isalpha() for character in text):
            strings.append(text)
    return strings


def _pdf_stream_chunks(content: bytes) -> list[bytes]:
    chunks = [content]
    for match in re.finditer(rb"stream\r?\n(.*?)\r?\nendstream", content, re.DOTALL):
        stream = match.group(1).strip(b"\r\n")
        chunks.append(stream)
        try:
            chunks.append(zlib.decompress(stream))
        except zlib.error:
            continue
    return chunks


def _extract_pdf_text(content: bytes) -> str:
    strings: list[str] = []
    for chunk in _pdf_stream_chunks(content):
        strings.extend(_extract_pdf_literal_strings(chunk))
        strings.extend(_extract_pdf_hex_strings(chunk))

    seen: set[str] = set()
    lines: list[str] = []
    for value in strings:
        normalized = re.sub(r"\s+", " ", value).strip()
        if normalized and normalized not in seen:
            seen.add(normalized)
            lines.append(normalized)

    return "\n\n".join(lines)


def _has_live_vision_credentials() -> bool:
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if api_key and not api_key.lower().startswith("your-"):
        return True

    use_vertex = os.getenv("GOOGLE_GENAI_USE_VERTEXAI", "").lower() in {
        "1",
        "true",
        "yes",
    }
    project = os.getenv("GOOGLE_CLOUD_PROJECT", "")
    return bool(use_vertex and project and not project.startswith("your-"))


def _vision_client() -> genai.Client:
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if api_key and not api_key.lower().startswith("your-"):
        return genai.Client(api_key=api_key)

    return genai.Client(
        vertexai=True,
        project=os.getenv("GOOGLE_CLOUD_PROJECT"),
        location=os.getenv("GOOGLE_CLOUD_LOCATION") or "global",
    )


def _extract_image_text(content: bytes, mime_type: str) -> str:
    if not _has_live_vision_credentials():
        raise UploadExtractionError(
            "Image upload analysis requires live Gemini or Vertex AI credentials. "
            "Upload TXT, MD, DOCX, or text-based PDF files, or deploy the cloud runtime."
        )

    prompt = (
        "Extract visible tender, RFP, proposal, contract, deadline, eligibility, "
        "commercial, compliance, and evidence text from this image. Return plain "
        "text only. If no legible procurement text is present, return EMPTY."
    )
    try:
        response = _vision_client().models.generate_content(
            model=os.getenv("TENDERLENS_VISION_MODEL", "gemini-flash-latest"),
            contents=[
                prompt,
                types.Part.from_bytes(data=content, mime_type=mime_type),
            ],
            config=types.GenerateContentConfig(temperature=0),
        )
    except Exception as exc:  # pragma: no cover - depends on external credentials.
        raise UploadExtractionError(
            "Image text extraction failed. Check Gemini or Vertex AI runtime configuration."
        ) from exc

    text = getattr(response, "text", "") or ""
    if text.strip().upper() == "EMPTY":
        return ""
    return text


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
        text = _extract_pdf_text(content)
        parser_status = "parsed_pdf"
    elif suffix in IMAGE_MIME_TYPES:
        text = _extract_image_text(content, IMAGE_MIME_TYPES[suffix])
        parser_status = "parsed_image"
    else:
        raise UploadExtractionError(
            "Unsupported file type. Upload PDF, DOCX, TXT, MD, JPG, PNG, WEBP, or use Preloaded Example Files."
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
