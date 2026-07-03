import unittest

from app.services.upload.validation import (
    MAX_TOTAL_UPLOAD_BYTES,
    MAX_UPLOAD_BYTES,
    UploadFileMetadata,
    validate_tender_files_metadata,
    validate_upload_metadata,
)


class UploadValidationTest(unittest.TestCase):
    def test_accepts_supported_file_under_5_mb(self) -> None:
        result = validate_upload_metadata("tender.pdf", MAX_UPLOAD_BYTES)
        self.assertTrue(result.accepted)

    def test_rejects_file_over_5_mb(self) -> None:
        result = validate_upload_metadata("tender.pdf", MAX_UPLOAD_BYTES + 1)
        self.assertFalse(result.accepted)
        self.assertIn("5 MB", result.reason)

    def test_rejects_unsupported_type(self) -> None:
        result = validate_upload_metadata("tender.exe", 1024)
        self.assertFalse(result.accepted)
        self.assertIn("Unsupported", result.reason)

    def test_accepts_valid_tender_files(self) -> None:
        result = validate_tender_files_metadata(
            [
                UploadFileMetadata("main.pdf", 1024, "main"),
                UploadFileMetadata("boq.docx", 2048, "supporting"),
            ]
        )

        self.assertTrue(result.accepted)
        self.assertEqual(result.file_count, 2)

    def test_rejects_missing_main_tender_file(self) -> None:
        result = validate_tender_files_metadata(
            [UploadFileMetadata("boq.docx", 2048, "supporting")]
        )

        self.assertFalse(result.accepted)
        self.assertIn("Main Tender File", result.reason)

    def test_rejects_more_than_five_files(self) -> None:
        files = [UploadFileMetadata("main.pdf", 1024, "main")]
        files.extend(
            UploadFileMetadata(f"supporting-{index}.pdf", 1024, "supporting")
            for index in range(5)
        )

        result = validate_tender_files_metadata(files)

        self.assertFalse(result.accepted)
        self.assertIn("5 files", result.reason)

    def test_rejects_package_file_over_5_mb(self) -> None:
        result = validate_tender_files_metadata(
            [UploadFileMetadata("main.pdf", MAX_UPLOAD_BYTES + 1, "main")]
        )

        self.assertFalse(result.accepted)
        self.assertIn("5 MB", result.reason)

    def test_rejects_total_over_12_mb(self) -> None:
        result = validate_tender_files_metadata(
            [
                UploadFileMetadata("main.pdf", 4 * 1024 * 1024, "main"),
                UploadFileMetadata("one.pdf", 4 * 1024 * 1024, "supporting"),
                UploadFileMetadata("two.pdf", MAX_TOTAL_UPLOAD_BYTES, "supporting"),
            ]
        )

        self.assertFalse(result.accepted)
        self.assertIn("12 MB", result.reason)


if __name__ == "__main__":
    unittest.main()
