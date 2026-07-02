"""OKF conformance checks used by tests, agents, and UI badges."""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path

from app.services.okf.parser import load_okf_bundle, parse_markdown_file

RESERVED_FILENAMES = {"index.md", "log.md"}


@dataclass(frozen=True)
class OkfValidationIssue:
    severity: str
    file: str
    message: str


@dataclass(frozen=True)
class OkfValidationReport:
    bundle: str
    valid: bool
    errors: list[OkfValidationIssue] = field(default_factory=list)
    warnings: list[OkfValidationIssue] = field(default_factory=list)

    def to_dict(self) -> dict:
        return {
            "bundle": self.bundle,
            "valid": self.valid,
            "errors": [issue.__dict__ for issue in self.errors],
            "warnings": [issue.__dict__ for issue in self.warnings],
        }


def validate_okf_bundle(bundle_dir: Path) -> OkfValidationReport:
    errors: list[OkfValidationIssue] = []
    warnings: list[OkfValidationIssue] = []

    if not bundle_dir.exists():
        return OkfValidationReport(
            bundle=str(bundle_dir),
            valid=False,
            errors=[
                OkfValidationIssue("error", str(bundle_dir), "Bundle directory does not exist")
            ],
        )

    index_path = bundle_dir / "index.md"
    if not index_path.exists():
        errors.append(OkfValidationIssue("error", "index.md", "Missing OKF index.md"))

    docs = load_okf_bundle(bundle_dir)
    doc_names = {doc.path.name for doc in docs}

    for doc in docs:
        rel_name = doc.path.name
        if rel_name not in RESERVED_FILENAMES:
            if not doc.frontmatter:
                errors.append(
                    OkfValidationIssue("error", rel_name, "Missing YAML frontmatter")
                )
            if not doc.concept_type:
                errors.append(
                    OkfValidationIssue("error", rel_name, "Missing required type")
                )
            if not doc.citations:
                warnings.append(
                    OkfValidationIssue("warning", rel_name, "No citations section entries")
                )
        else:
            parsed = parse_markdown_file(doc.path)
            if not parsed.frontmatter:
                warnings.append(
                    OkfValidationIssue("warning", rel_name, "Reserved file has no frontmatter")
                )

        for link in doc.links:
            if link.startswith(("http://", "https://", "#")):
                continue
            target = link.split("#", 1)[0]
            if target and Path(target).name not in doc_names:
                errors.append(
                    OkfValidationIssue(
                        "error", rel_name, f"Broken internal link: {link}"
                    )
                )

    log_path = bundle_dir / "log.md"
    if log_path.exists():
        for line in log_path.read_text(encoding="utf-8").splitlines():
            if line.startswith("## ") and len(line) >= 13:
                date_text = line[3:13]
                if date_text.count("-") != 2:
                    warnings.append(
                        OkfValidationIssue(
                            "warning", "log.md", "Log heading should use ISO-style date"
                        )
                    )

    return OkfValidationReport(
        bundle=str(bundle_dir),
        valid=not errors,
        errors=errors,
        warnings=warnings,
    )
