"""Small OKF markdown parser for deterministic validation and retrieval."""

from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path

FRONTMATTER_BOUNDARY = "---"
LINK_RE = re.compile(r"\[[^\]]+\]\(([^)]+)\)")


@dataclass(frozen=True)
class OkfDocument:
    path: Path
    frontmatter: dict[str, object]
    body: str
    links: list[str]
    citations: list[str]

    @property
    def concept_id(self) -> str:
        return self.path.stem

    @property
    def title(self) -> str:
        return str(self.frontmatter.get("title") or self.path.stem)

    @property
    def concept_type(self) -> str:
        return str(self.frontmatter.get("type") or "")

    @property
    def tags(self) -> list[str]:
        tags = self.frontmatter.get("tags", [])
        return tags if isinstance(tags, list) else []


def parse_frontmatter_value(raw: str) -> object:
    value = raw.strip()
    if value.startswith("[") and value.endswith("]"):
        inner = value[1:-1].strip()
        if not inner:
            return []
        return [item.strip().strip('"').strip("'") for item in inner.split(",")]
    if value.lower() in {"true", "false"}:
        return value.lower() == "true"
    return value.strip('"').strip("'")


def parse_markdown_file(path: Path) -> OkfDocument:
    text = path.read_text(encoding="utf-8")
    frontmatter: dict[str, object] = {}
    body = text

    if text.startswith(FRONTMATTER_BOUNDARY):
        lines = text.splitlines()
        try:
            end_index = lines[1:].index(FRONTMATTER_BOUNDARY) + 1
        except ValueError:
            end_index = -1
        if end_index > 0:
            for line in lines[1:end_index]:
                if ":" not in line or line.strip().startswith("#"):
                    continue
                key, value = line.split(":", 1)
                frontmatter[key.strip()] = parse_frontmatter_value(value)
            body = "\n".join(lines[end_index + 1 :])

    links = LINK_RE.findall(body)
    citations = extract_citations(body)
    return OkfDocument(path=path, frontmatter=frontmatter, body=body, links=links, citations=citations)


def extract_citations(body: str) -> list[str]:
    citations: list[str] = []
    in_citations = False
    for line in body.splitlines():
        stripped = line.strip()
        if stripped.lower() == "# citations":
            in_citations = True
            continue
        if in_citations and stripped.startswith("# "):
            break
        if in_citations and stripped.startswith("- "):
            citations.append(stripped[2:].strip())
    return citations


def load_okf_bundle(bundle_dir: Path) -> list[OkfDocument]:
    return [parse_markdown_file(path) for path in sorted(bundle_dir.glob("*.md"))]
