import { mkdir, copyFile, rm } from "node:fs/promises";
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

console.log("Built static frontend to dist/");
