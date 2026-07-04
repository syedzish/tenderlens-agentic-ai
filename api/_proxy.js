const ALLOWED_METHODS = new Set(["GET", "POST", "OPTIONS"]);

function backendBase() {
  return (process.env.AGENT_RUNTIME_ENDPOINT || process.env.TENDERLENS_BACKEND_URL || "").replace(/\/+$/, "");
}

function copyHeaders(req) {
  const headers = {};
  for (const [key, value] of Object.entries(req.headers || {})) {
    const lower = key.toLowerCase();
    if (["host", "connection", "content-length"].includes(lower)) continue;
    if (value) headers[key] = Array.isArray(value) ? value.join(",") : value;
  }
  return headers;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

async function proxy(req, res, path) {
  if (!ALLOWED_METHODS.has(req.method)) {
    res.status(405).json({ detail: "Method not allowed." });
    return;
  }

  res.setHeader("access-control-allow-origin", "*");
  res.setHeader("access-control-allow-methods", "GET,POST,OPTIONS");
  res.setHeader("access-control-allow-headers", "content-type,authorization");
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  const base = backendBase();
  if (!base) {
    res.status(503).json({
      detail: "AGENT_RUNTIME_ENDPOINT is not configured for this Vercel deployment.",
    });
    return;
  }

  try {
    const body = req.method === "GET" ? undefined : await readBody(req);
    const upstream = await fetch(`${base}${path}`, {
      method: req.method,
      headers: copyHeaders(req),
      body,
    });
    const contentType = upstream.headers.get("content-type") || "application/json";
    const buffer = Buffer.from(await upstream.arrayBuffer());
    res.status(upstream.status);
    res.setHeader("content-type", contentType);
    res.send(buffer);
  } catch (error) {
    res.status(502).json({
      detail: "TenderLens backend proxy failed.",
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

module.exports = proxy;
