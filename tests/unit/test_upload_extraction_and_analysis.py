import io
import unittest
import zlib
import zipfile
from types import SimpleNamespace
from unittest import mock

from app.services.upload.extraction import (
    UploadExtractionError,
    extract_uploaded_document,
)
from app.workflows.uploaded_tender_workflow import run_uploaded_tender_files_analysis


def make_docx(text: str) -> bytes:
    document_xml = (
        '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
        "<w:body>"
        f"<w:p><w:r><w:t>{text}</w:t></w:r></w:p>"
        "</w:body></w:document>"
    )
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w") as archive:
        archive.writestr("word/document.xml", document_xml)
    return buffer.getvalue()


def make_pdf(text: str) -> bytes:
    stream = zlib.compress(f"BT ({text}) Tj ET".encode("utf-8"))
    return (
        b"%PDF-1.4\n"
        b"1 0 obj\n<< /Length "
        + str(len(stream)).encode("ascii")
        + b" /Filter /FlateDecode >>\nstream\n"
        + stream
        + b"\nendstream\nendobj\n%%EOF"
    )


class UploadExtractionAndAnalysisTest(unittest.TestCase):
    def test_extracts_main_text_file(self) -> None:
        document = extract_uploaded_document(
            "main.md",
            b"Eligibility requires ISO 9001 and similar projects.",
            "main",
            1,
        )

        self.assertEqual(document.source.role, "main")
        self.assertEqual(document.source.parser_status, "parsed_text")
        self.assertIn("ISO 9001", document.text)

    def test_extracts_docx_supporting_file(self) -> None:
        document = extract_uploaded_document(
            "appendix.docx",
            make_docx("Submission deadline and bid bond are mandatory."),
            "supporting",
            2,
        )

        self.assertEqual(document.source.role, "supporting")
        self.assertEqual(document.source.parser_status, "parsed_docx")
        self.assertIn("bid bond", document.text)

    def test_extracts_text_pdf_file(self) -> None:
        document = extract_uploaded_document(
            "tender.pdf",
            make_pdf("Bid security must remain valid for 120 days."),
            "main",
            1,
        )

        self.assertEqual(document.source.parser_status, "parsed_pdf")
        self.assertIn("Bid security", document.text)

    def test_pdf_without_text_fails_clearly(self) -> None:
        with self.assertRaises(UploadExtractionError) as context:
            extract_uploaded_document("scan.pdf", b"%PDF-1.4", "main", 1)

        self.assertIn("did not contain extractable text", str(context.exception))

    def test_image_without_live_credentials_fails_clearly(self) -> None:
        with mock.patch.dict("os.environ", {}, clear=True):
            with self.assertRaises(UploadExtractionError) as context:
                extract_uploaded_document("tender-page.png", b"fake-image", "main", 1)

        self.assertIn("requires live Gemini or Vertex AI credentials", str(context.exception))

    def test_image_extraction_uses_live_vision_client_when_available(self) -> None:
        class FakeModels:
            def generate_content(self, **kwargs):
                self.kwargs = kwargs
                return SimpleNamespace(text="Bid deadline is 30 September 2026.")

        fake_models = FakeModels()
        fake_client = SimpleNamespace(models=fake_models)
        with (
            mock.patch("app.services.upload.extraction._has_live_vision_credentials", return_value=True),
            mock.patch("app.services.upload.extraction._vision_client", return_value=fake_client),
        ):
            document = extract_uploaded_document("tender-page.webp", b"fake-image", "main", 1)

        self.assertEqual(document.source.parser_status, "parsed_image")
        self.assertIn("30 September", document.text)
        self.assertEqual(fake_models.kwargs["model"], "gemini-flash-latest")

    def test_uploaded_workflow_returns_source_documents_and_citations(self) -> None:
        main = extract_uploaded_document(
            "main.md",
            (
                b"Eligibility requires ISO 9001, ISO 27001, and similar projects. "
                b"Submission deadline is 2026-07-18. Evaluation favors technical quality."
            ),
            "main",
            1,
        )
        supporting = extract_uploaded_document(
            "appendix.txt",
            b"Mobilization risks include subcontractor capacity and service levels.",
            "supporting",
            2,
        )

        report = run_uploaded_tender_files_analysis([main, supporting])
        repeat_report = run_uploaded_tender_files_analysis([main, supporting])

        self.assertIn(report.recommendation, {"bid", "conditional_bid", "no_bid"})
        self.assertEqual(report.score, repeat_report.score)
        self.assertGreater(report.score, 0)
        self.assertEqual(report.audit.status, "pass")
        self.assertEqual(len(report.source_documents), 2)
        self.assertTrue(
            all(
                "Tender File:" in item.citation
                for item in report.evidence
            )
        )


if __name__ == "__main__":
    unittest.main()
