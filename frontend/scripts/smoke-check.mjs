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
  "voiceButton",
  "voiceOverlay",
  "evidenceList",
  "capacitySlider",
  "fileInput",
  "langAr",
  "auditStatus",
  "stageAudit",
  "How to Use",
  "Discuss with TenderLens",
  "Tender Map",
  "Briefing Deck",
  "Tender Questions",
  "Use Preloaded Example Files",
  "Pre-generated example result",
  "supportingFileInput",
  "briefing-deck",
  "sourceDocuments",
];

const requiredJs = [
  "MAX_UPLOAD_BYTES = 5 * 1024 * 1024",
  "applyLanguage",
  "startVoice",
  "validateUpload",
  "validateUploadWithBackend",
  "postJson",
  "runAnalysis",
  "renderWorkflowTrace",
  "workflow_trace",
  "/api/upload/tender-files/validate",
  "/api/upload/analyze",
  "renderEvidence",
  "preparedExampleReport",
  "validateTenderFiles",
  "postFormData",
  "renderSourceDocuments",
  "renderDeck",
  "ar: {",
];

const requiredCss = [
  "[dir=\"rtl\"]",
  ".evidence-war-room",
  ".voice-overlay",
  "@media (max-width: 760px)",
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
