import unittest

from app.services.okf.validator import validate_okf_bundle
from app.services.paths import OKF_DIR


class OkfValidatorTest(unittest.TestCase):
    def test_sample_bundle_validates(self) -> None:
        report = validate_okf_bundle(OKF_DIR / "smart-city-maintenance-2026")
        self.assertTrue(report.valid, report.to_dict())
        self.assertEqual(report.errors, [])


if __name__ == "__main__":
    unittest.main()
