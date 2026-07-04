import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const files = {
  html: await readFile(join(root, "index.html"), "utf8"),
  css: await readFile(join(root, "styles.css"), "utf8"),
  js: await readFile(join(root, "app.js"), "utf8"),
};

const requiredHtml = [
  "TenderLens Agentic AI",
  "voiceOverlay",
  "workspace-tabs",
  "scoreRing",
  "checklistRows",
  "activeEvidence",
  "fileInput",
  "langAr",
  "welcomeModal",
  "examplesModal",
  "Upload tender/RFP files",
  "Ask TenderLens",
  "Tender Map",
  "Briefing Deck",
  "Questions to Ask",
  "Run Analysis with preloaded files",
  "View preloaded files",
  "supportingFileInput",
  "tenderMapSvg",
  "deckBullets",
  "runtime-config.js",
];

const requiredJs = [
  "MAX_UPLOAD_BYTES = 4 * 1024 * 1024",
  "calculateComplianceScore",
  "reportToComplianceResult",
  "buildTenderMapSvg",
  "buildBriefingDeck",
  "buildQuestions",
  "switchTab",
  "startVoice",
  "validateSelectedFiles",
  "postJson",
  "runAnalysis",
  "/api/upload/analyze",
  "demoResult",
  "postFormData",
  "configuredBackendUrl",
  "preferBackend",
  "renderDeck",
  "ar: {",
];

const requiredCss = [
  "[dir=\"rtl\"]",
  ".workspace-tabs",
  ".score-ring",
  ".deck-frame",
  ".voice-overlay",
  "@media (max-width: 640px)",
];

function assertIncludes(fileName, content, needle) {
  if (!content.includes(needle)) {
    throw new Error(`${fileName} missing required content: ${needle}`);
  }
}

requiredHtml.forEach((needle) => assertIncludes("index.html", files.html, needle));
requiredJs.forEach((needle) => assertIncludes("app.js", files.js, needle));
requiredCss.forEach((needle) => assertIncludes("styles.css", files.css, needle));

if (files.html.includes('type="module"')) {
  throw new Error("index.html should use a normal script so file:// static mode works.");
}

const oldVisibleLabels = [
  "A2A Evidence Audit",
  "OKF Concept Graph",
  "Evidence War Room",
  "Ask the agent",
  "Questions for issuer",
  "Secure upload",
  "Sample tender",
  "Voice Mode",
  "Typing Mode",
  "Clarifications",
];

for (const label of oldVisibleLabels) {
  if (files.html.includes(label)) {
    throw new Error(`index.html still contains old visible label: ${label}`);
  }
}

console.log("Frontend smoke check passed.");
