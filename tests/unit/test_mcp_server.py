import asyncio
import json
import unittest

from app.mcp.server import mcp_server
from app.mcp.toolset import TENDERLENS_MCP_TOOL_FILTER, create_tenderlens_mcp_toolset


class TenderLensMCPServerTest(unittest.TestCase):
    def test_server_exposes_expected_tools(self) -> None:
        tools = asyncio.run(mcp_server.list_tools())
        names = {tool.name for tool in tools}

        self.assertTrue(set(TENDERLENS_MCP_TOOL_FILTER).issubset(names))
        self.assertIn("search_evidence", names)
        self.assertIn("validate_upload", names)
        self.assertIn("validate_tender_files", names)

    def test_server_tool_call_returns_structured_data(self) -> None:
        result = asyncio.run(
            mcp_server.call_tool(
                "validate_upload",
                {"filename": "oversized.pdf", "size_bytes": 5 * 1024 * 1024 + 1},
            )
        )

        payload = json.loads(result[0].text)

        self.assertFalse(payload["accepted"])
        self.assertIn("4 MB", payload["reason"])

    def test_tender_files_tool_call_returns_structured_data(self) -> None:
        result = asyncio.run(
            mcp_server.call_tool(
                "validate_tender_files",
                {
                    "files": [
                        {
                            "filename": "main.pdf",
                            "size_bytes": 1024,
                            "role": "main",
                        },
                        {
                            "filename": "appendix.docx",
                            "size_bytes": 2048,
                            "role": "supporting",
                        },
                    ]
                },
            )
        )

        payload = json.loads(result[0].text)

        self.assertTrue(payload["accepted"])
        self.assertEqual(payload["file_count"], 2)

    def test_adk_toolset_uses_strict_filter(self) -> None:
        toolset = create_tenderlens_mcp_toolset(timeout=1.0)

        self.assertEqual(toolset.tool_filter, TENDERLENS_MCP_TOOL_FILTER)


if __name__ == "__main__":
    unittest.main()
