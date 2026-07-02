"""Escape untrusted content before browser rendering."""

from __future__ import annotations

import html
import re

SCRIPT_BLOCK_RE = re.compile(r"<\s*script[^>]*>.*?<\s*/\s*script\s*>", re.I | re.S)


def escape_untrusted_text(value: str) -> str:
    without_scripts = SCRIPT_BLOCK_RE.sub("", value)
    return html.escape(without_scripts, quote=True)


def sanitize_link_href(href: str) -> str:
    stripped = href.strip()
    if stripped.lower().startswith(("javascript:", "data:", "vbscript:")):
        return "#"
    return html.escape(stripped, quote=True)
