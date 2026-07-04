import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || "127.0.0.1";

const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".pdf": "application/pdf",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

createServer(async (req, res) => {
  try {
    const rawPath = new URL(req.url || "/", `http://${host}:${port}`).pathname;
    const safePath = rawPath === "/" ? "index.html" : rawPath.slice(1);
    const filePath = normalize(join(root, safePath));
    if (!filePath.startsWith(root)) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }
    const content = await readFile(filePath);
    res.writeHead(200, { "content-type": mime[extname(filePath)] || "text/plain" });
    res.end(content);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
}).listen(port, host, () => {
  console.log(`TenderLens frontend running at http://${host}:${port}`);
});
