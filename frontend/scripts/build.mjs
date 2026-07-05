import { cp, mkdir, copyFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const frontendRoot = dirname(root);
const dist = join(frontendRoot, "dist");

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

for (const file of ["index.html", "styles.css", "app.js"]) {
  await copyFile(join(frontendRoot, file), join(dist, file));
}

const publicBackendUrl = (
  process.env.TENDERLENS_PUBLIC_BACKEND_URL ||
  "https://tenderlens-agentic-ai-668759684658.us-east1.run.app"
).replace(/\/+$/, "");
await writeFile(
  join(dist, "runtime-config.js"),
  `window.TENDERLENS_CONFIG = ${JSON.stringify({ backendUrl: publicBackendUrl })};\n`,
);

const vendor = join(dist, "vendor");
await mkdir(vendor, { recursive: true });
await copyFile(join(frontendRoot, "node_modules", "jszip", "dist", "jszip.min.js"), join(vendor, "jszip.min.js"));
await copyFile(join(frontendRoot, "node_modules", "jspdf", "dist", "jspdf.umd.min.js"), join(vendor, "jspdf.umd.min.js"));
await copyFile(join(frontendRoot, "node_modules", "pptxgenjs", "dist", "pptxgen.bundle.js"), join(vendor, "pptxgen.bundle.js"));

for (const dir of ["brand", "example-files"]) {
  await cp(join(frontendRoot, dir), join(dist, dir), { recursive: true });
}

console.log("Built static frontend to dist/");
