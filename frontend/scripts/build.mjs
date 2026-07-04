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

const publicBackendUrl = (process.env.TENDERLENS_PUBLIC_BACKEND_URL || "").replace(/\/+$/, "");
await writeFile(
  join(dist, "runtime-config.js"),
  `window.TENDERLENS_CONFIG = ${JSON.stringify({ backendUrl: publicBackendUrl })};\n`,
);

for (const dir of ["brand", "example-files"]) {
  await cp(join(frontendRoot, dir), join(dist, dir), { recursive: true });
}

console.log("Built static frontend to dist/");
