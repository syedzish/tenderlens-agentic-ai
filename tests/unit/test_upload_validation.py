import unittest

from app.services.upload.validation import MAX_UPLOAD_BYTES, validate_upload_metadata


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


if __name__ == "__main__":
    unittest.main()
