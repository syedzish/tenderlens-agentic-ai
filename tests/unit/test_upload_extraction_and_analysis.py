import io
import unittest
import zipfile

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

    def test_pdf_analysis_is_explicitly_not_enabled(self) -> None:
        with self.assertRaises(UploadExtractionError) as context:
            extract_uploaded_document("tender.pdf", b"%PDF-1.4", "main", 1)

        self.assertIn("PDF text analysis is not enabled", str(context.exception))

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

        self.assertIn(report.recommendation, {"bid", "conditional_bid", "no_bid"})
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
