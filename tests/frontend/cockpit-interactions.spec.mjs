import { expect, test } from "@playwright/test";
import JSZip from "../../frontend/node_modules/jszip/dist/jszip.min.js";

const port = Number(process.env.PORT || 3000);

async function readDownloadHead(download, length = 4) {
  const stream = await download.createReadStream();
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks).subarray(0, length).toString("binary")));
    stream.on("error", reject);
  });
}

async function readDownloadBuffer(download) {
  const stream = await download.createReadStream();
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}

async function readZipEntry(download, entryName) {
  const zip = await JSZip.loadAsync(await readDownloadBuffer(download));
  const entry = zip.file(entryName);
  expect(entry, `${entryName} should exist in downloaded zip`).toBeTruthy();
  return entry.async("string");
}

async function ask(page, question) {
  const before = await page.locator("#chatLog .message.agent").count();
  await page.locator("#chatInput").fill(question);
  await expect(page.locator("#sendChat")).toBeEnabled();
  await page.locator("#sendChat").click();
  await expect(page.locator("#chatLog .message.user").last()).toHaveText(question);
  await page.waitForFunction((count) => document.querySelectorAll("#chatLog .message.agent").length > count, before);
  return page.locator("#chatLog .message.agent").last();
}

async function suppressWelcome(page) {
  await page.addInitScript(() => {
    window.localStorage.setItem("tenderlens-welcome-dismissed-v3", "yes");
  });
}

test("old onboarding dismissal key does not hide updated onboarding slides", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("tenderlens-welcome-dismissed", "yes");
  });

  await page.goto("/");

  await expect(page.locator("#welcomeModal")).not.toHaveClass(/hidden/);
  await expect(page.locator("#welcomeBody")).toContainText("Use example files to explore prepared results");
});

test("onboarding popup walks through both reference slides", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("#welcomeModal")).not.toHaveClass(/hidden/);
  await expect(page.locator("#welcomeTitle")).toHaveText("Explore prepared results");
  await expect(page.locator("#welcomeBody")).toContainText("Use example files to explore prepared results");

  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.locator("#welcomeTitle")).toHaveText("Discuss the analysis");
  await expect(page.locator("#welcomeBody")).toContainText("Discuss with TenderLens by chat or voice");

  await page.getByRole("button", { name: "Get started" }).click();
  await expect(page.locator("#welcomeModal")).toHaveClass(/hidden/);
});

test("how-to actions open the guide page instead of the onboarding modal or pdf", async ({ page }) => {
  await suppressWelcome(page);
  await page.goto("/");

  await page.getByRole("button", { name: "How to use" }).click();

  await expect(page).toHaveURL(/#how-to-use$/);
  await expect(page.locator("#guidePage")).toBeVisible();
  await expect(page.locator("#welcomeModal")).toHaveClass(/hidden/);
  await expect(page.locator("#guidePage")).toContainText("How to use TenderLens Agentic AI");
  await expect(page.locator("#guidePage")).toContainText("Discuss with TenderLens");
  await expect(page.getByRole("link", { name: "Back to workspace" })).toBeVisible();

  await page.getByRole("link", { name: "Back to workspace" }).click();
  await expect(page).toHaveURL(/#workspace$/);
  await expect(page.locator("#workspace")).toBeVisible();
});

test("how-to guide localizes cleanly in Arabic", async ({ page }) => {
  await suppressWelcome(page);
  await page.goto("/#how-to-use");

  await page.locator("#langAr").click();

  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.locator("#guidePage")).toBeVisible();
  await expect(page.locator("#guidePage")).toContainText("طريقة استخدام TenderLens Agentic AI");
  await expect(page.locator("#guideTitle")).toContainText("راجع ملفات المناقصة");
  await expect(page.locator("#guidePage")).toContainText("ناقش مع TenderLens");
  await expect(page.locator("#guidePage")).not.toContainText("Review tender documents");
});

test("onboarding guide link opens the guide page and does not navigate to a pdf", async ({ page }) => {
  await page.goto("/");

  const guideLink = page.getByRole("link", { name: "How to use TenderLens Agentic AI" });
  await expect(guideLink).toHaveAttribute("href", "#how-to-use");
  await guideLink.click();

  await expect(page).toHaveURL(/#how-to-use$/);
  await expect(page.locator("#guidePage")).toBeVisible();
  await expect(page).not.toHaveURL(/\.pdf/i);
});

test("pre-analysis workspace keeps tabs and empty states visible", async ({ page }) => {
  await suppressWelcome(page);
  await page.goto("/");

  await expect(page.locator("#startHero")).toBeVisible();
  await expect(page.locator("#emptyResult")).toBeVisible();
  await expect(page.locator("#resultShell")).toBeVisible();
  await expect(page.locator(".result-summary")).toHaveClass(/hidden/);
  await expect(page.locator(".workspace-tabs")).toContainText("Discuss with TenderLens");
  await expect(page.locator("#checklistRows")).toContainText("No requirements checked yet");
  await expect(page.locator("#activeEvidence")).toContainText("Evidence will appear after analysis");

  await page.getByRole("button", { name: "Discuss with TenderLens" }).click();
  await expect(page.locator("#askPanel")).not.toHaveClass(/hidden/);
  await page.locator("#chatInput").fill("What are the biggest risks?");
  await page.locator("#sendChat").click();
  await expect(page.locator("#chatLog")).toContainText("Run an analysis first");

  await page.getByRole("button", { name: "Start voice mode" }).click();
  await expect(page.locator("#voiceStateLabel")).toHaveText("Analysis needed");
  await page.locator("#endVoice").click();

  await page.getByRole("button", { name: "Tender Map" }).click();
  await expect(page.locator("#tenderMapSvg")).toContainText("Tender Map will appear after analysis");

  await page.getByRole("button", { name: "Briefing Deck" }).click();
  await expect(page.locator("#deckTitle")).toHaveText("Briefing Deck will appear after analysis");

  await page.getByRole("button", { name: "Questions to Ask" }).click();
  await expect(page.locator("#questionsList")).toContainText("Questions will appear after analysis");
});

test("runs example analysis with deterministic displayed score", async ({ page }) => {
  await suppressWelcome(page);
  await page.goto("/");

  await page.getByRole("button", { name: "Run Analysis with example files" }).first().click();

  await expect(page.locator("#scoreValue")).toHaveText("78");
  await expect(page.locator("#preparedBadge")).toHaveText("Prepared example");
  await expect(page.locator("#resultTitle")).toHaveText("Conditional bid with risks to resolve");
  await expect(page.locator("#checklistRows .checklist-row")).toHaveCount(10);
  await expect(page.locator("#compliantRows")).toContainText("6 compliant rows");
  await expect(page.locator("#riskRows")).toContainText("4 items need attention");
});

test("tabs render map, deck, questions, and chat without navigation jumps", async ({ page }) => {
  await suppressWelcome(page);
  await page.route("**/api/discuss", async (route) => {
    const payload = route.request().postDataJSON();
    let answer = "The current go-live plan misses the mandatory deadline.";
    if (payload.message.includes("missing")) answer = "Missing documents include the 120-day bid bond letter.";
    if (payload.message.includes("evidence")) answer = "Evidence is cited from bid-readiness-notes.docx.";
    if (payload.message.includes("next")) answer = "Revise the delivery plan before bid approval.";
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ answer, citations: ["bid-readiness-notes.docx"], followups: [] }),
    });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Run Analysis with example files" }).first().click();

  await page.getByRole("button", { name: "Tender Map" }).click();
  await expect(page.locator("#mapPanel")).not.toHaveClass(/hidden/);
  await expect(page.locator("#tenderMapSvg svg")).toBeVisible();

  await page.getByRole("button", { name: "Briefing Deck" }).click();
  await expect(page.locator("#deckPanel")).not.toHaveClass(/hidden/);
  await expect(page.locator("#deckCounter")).toHaveText("1/5");
  await page.getByRole("button", { name: "Next slide" }).click();
  await expect(page.locator("#deckCounter")).toHaveText("2/5");

  await page.getByRole("button", { name: "Questions to Ask" }).click();
  await expect(page.locator("#questionsList .question-card").first()).toContainText("Can you clarify");

  await page.getByRole("button", { name: "Discuss with TenderLens" }).click();
  await expect(page.getByRole("button", { name: "Start voice mode" })).toBeVisible();
  await page.locator("#chatInput").fill("What are the biggest risks?");
  await page.locator("#sendChat").click();
  await expect(page.locator("#chatLog")).toContainText("What are the biggest risks?");
  await expect(page.locator("#chatLog")).toContainText("The current go-live plan");

  await page.locator("#chatInput").fill("Which documents are missing?");
  await page.locator("#sendChat").click();
  await expect(page.locator("#chatLog")).toContainText("120-day bid bond letter");

  await page.locator("#chatInput").fill("What evidence supports the active checklist item?");
  await page.locator("#sendChat").click();
  await expect(page.locator("#chatLog")).toContainText("bid-readiness-notes.docx");

  await page.locator("#chatInput").fill("What next actions should we take?");
  await page.locator("#sendChat").click();
  await expect(page.locator("#chatLog")).toContainText("Revise the delivery plan");
});

test("rejects oversized uploads before analysis", async ({ page }) => {
  await suppressWelcome(page);
  await page.goto("/");

  await page.locator("#fileInput").setInputFiles({
    name: "oversized-tender.txt",
    mimeType: "text/plain",
    buffer: Buffer.alloc(4 * 1024 * 1024 + 1),
  });

  await expect(page.locator("#uploadStatus")).toHaveClass(/error/);
  await expect(page.locator("#uploadStatus")).toContainText("4 MB limit");
});

test("analysis shows a blocking premium progress state while upload review is running", async ({ page }) => {
  await suppressWelcome(page);
  await page.route("**/runtime-config.js", async (route) => {
    await route.fulfill({
      contentType: "application/javascript",
      body: 'window.TENDERLENS_CONFIG = { backendUrl: "https://backend.example" };',
    });
  });
  await page.route("https://backend.example/api/upload/analyze", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    await route.fulfill({
      status: 200,
      headers: { "access-control-allow-origin": "*", "content-type": "application/json" },
      body: JSON.stringify({
        report: {
          executive_summary: "Delayed backend analysis finished.",
          score: 80,
          findings: [],
          evidence: [],
          risks: [],
          missing_documents: [],
          next_actions: ["Review final submission."],
          source_documents: [{ filename: "slow-live-test.md" }],
          workflow_trace: ["backend.upload_analyze"],
        },
      }),
    });
  });

  await page.goto("/");
  await page.locator("#fileInput").setInputFiles({
    name: "slow-live-test.md",
    mimeType: "text/markdown",
    buffer: Buffer.from("Submission deadline and cyber insurance are mandatory."),
  });

  await expect(page.locator("#analysisOverlay")).toBeVisible();
  await expect(page.locator("#analysisOverlay")).toContainText("TenderLens is reviewing evidence");
  await expect(page.locator("#useSampleButton")).toBeDisabled();
  await expect(page.locator("#langAr")).toBeDisabled();
  await expect(page.locator("#uploadRunButton")).toBeDisabled();
  await expect(page.locator("#analysisOverlay")).toBeHidden({ timeout: 5000 });
  await expect(page.locator("#useSampleButton")).toBeEnabled();
  await expect(page.locator("#scoreValue")).toHaveText("80");
});

test("uploaded-file analysis shows a friendly retry state when the model backend is unavailable", async ({ page }) => {
  await suppressWelcome(page);

  await page.route("**/runtime-config.js", async (route) => {
    await route.fulfill({
      contentType: "application/javascript",
      body: 'window.TENDERLENS_CONFIG = { backendUrl: "https://offline.backend" };',
    });
  });
  await page.route("https://offline.backend/api/upload/analyze", async (route) => {
    await route.fulfill({ status: 503, contentType: "application/json", body: '{"detail":"backend offline"}' });
  });

  await page.goto("/");

  await page.locator("#fileInput").setInputFiles({
    name: "main-tender.md",
    mimeType: "text/markdown",
    buffer: Buffer.from("Eligibility requires ISO 9001. Submission deadline is 30 September. Bid security is mandatory."),
  });

  await expect(page.locator("#uploadStatus")).toContainText("Please try again after some time");
  await expect(page.locator("#uploadStatus")).toHaveClass(/error/);
  await expect(page.locator("#emptyResult")).toBeVisible();
  await expect(page.locator("#checklistRows")).toContainText("No requirements checked yet");
});

test("configured backend URL receives production uploaded-file analysis directly", async ({ page }) => {
  await suppressWelcome(page);

  let backendCalls = 0;
  let localProxyCalls = 0;
  await page.route("**/runtime-config.js", async (route) => {
    await route.fulfill({
      contentType: "application/javascript",
      body: 'window.TENDERLENS_CONFIG = { backendUrl: "https://backend.example" };',
    });
  });
  await page.route("https://backend.example/api/upload/analyze", async (route) => {
    backendCalls += 1;
    await route.fulfill({
      status: 200,
      headers: {
        "access-control-allow-origin": "*",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        report: {
          executive_summary: "Live upload backend succeeded for the generated ZebraDock tender.",
          score: 15,
          findings: [
            {
              agent: "Evidence Agent",
              status: "pass",
              summary: "ZebraDock renewal deadline is 12 August.",
              actions: ["Collect the ZebraDock permit renewal letter."],
              evidence_ids: ["e1"],
            },
          ],
          evidence: [{ id: "e1", citation: "uploaded:zebradock-live-test.md", excerpt: "ZebraDock renewal deadline is 12 August and the permit letter is mandatory." }],
          risks: [],
          missing_documents: ["ZebraDock permit renewal letter"],
          next_actions: ["Collect the ZebraDock permit renewal letter."],
          source_documents: [{ filename: "zebradock-live-test.md" }],
          workflow_trace: ["backend.upload_analyze"],
        },
      }),
    });
  });
  await page.route(`http://127.0.0.1:${port}/api/upload/analyze`, async (route) => {
    localProxyCalls += 1;
    await route.fulfill({ status: 500, contentType: "application/json", body: '{"detail":"local proxy used"}' });
  });
  await page.route("**/api/discuss", async (route) => {
    const payload = route.request().postDataJSON();
    const answer = payload.message.includes("missing")
      ? "The missing document is the ZebraDock permit renewal letter."
      : "ZebraDock renewal deadline is 12 August, and the permit renewal letter is mandatory.";
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ answer, citations: ["uploaded:zebradock-live-test.md"], followups: [] }),
    });
  });

  await page.goto("/");
  await page.locator("#fileInput").setInputFiles({
    name: "zebradock-live-test.md",
    mimeType: "text/markdown",
    buffer: Buffer.from("ZebraDock renewal deadline is 12 August. The permit renewal letter is mandatory."),
  });

  await expect(page.locator("#uploadStatus")).toContainText("1 file accepted");
  await expect(page.locator("#scoreValue")).toHaveText("15");
  await page.getByRole("button", { name: "Discuss with TenderLens" }).click();
  await page.locator("#chatInput").fill("What does ZebraDock require?");
  await page.locator("#sendChat").click();
  await expect(page.locator("#chatLog")).toContainText("ZebraDock renewal deadline is 12 August");
  await page.locator("#chatInput").fill("Which documents are missing?");
  await page.locator("#sendChat").click();
  await expect(page.locator("#chatLog")).toContainText("ZebraDock permit renewal letter");
  expect(backendCalls).toBe(1);
  expect(localProxyCalls).toBe(0);
});

test("discuss sends active analysis context to backend and renders grounded model response", async ({ page }) => {
  await suppressWelcome(page);

  let discussPayload;
  await page.route("**/api/discuss", async (route) => {
    discussPayload = route.request().postDataJSON();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        answer: "The biggest risk is the ZebraDock permit renewal letter, grounded in the active checklist evidence.",
        citations: ["uploaded:zebradock-live-test.md"],
        followups: ["Which evidence supports this?", "What should I do next?"],
      }),
    });
  });
  await page.route("**/runtime-config.js", async (route) => {
    await route.fulfill({
      contentType: "application/javascript",
      body: 'window.TENDERLENS_CONFIG = { backendUrl: "https://backend.example" };',
    });
  });
  await page.route("https://backend.example/api/upload/analyze", async (route) => {
    await route.fulfill({
      status: 200,
      headers: { "access-control-allow-origin": "*", "content-type": "application/json" },
      body: JSON.stringify({
        report: {
          executive_summary: "ZebraDock live upload result.",
          score: 55,
          findings: [{ agent: "Risk Agent", status: "watch", summary: "Permit letter is missing.", actions: ["Collect permit letter."], evidence_ids: ["e1"] }],
          evidence: [{ id: "e1", citation: "uploaded:zebradock-live-test.md", excerpt: "The permit renewal letter is mandatory." }],
          risks: [{ title: "Permit gap", severity: "high", mitigation: "Collect permit renewal letter.", evidence_id: "e1" }],
          missing_documents: ["ZebraDock permit renewal letter"],
          next_actions: ["Collect permit renewal letter."],
          source_documents: [{ filename: "zebradock-live-test.md" }],
          workflow_trace: ["backend.upload_analyze"],
        },
      }),
    });
  });

  await page.goto("/");
  await page.locator("#fileInput").setInputFiles({
    name: "zebradock-live-test.md",
    mimeType: "text/markdown",
    buffer: Buffer.from("The ZebraDock permit renewal letter is mandatory."),
  });
  await expect(page.locator("#scoreValue")).toHaveText("55");

  await page.getByRole("button", { name: "Discuss with TenderLens" }).click();
  const response = await ask(page, "What are the biggest risks?");

  await expect(response).toContainText("ZebraDock permit renewal letter");
  expect(discussPayload.message).toBe("What are the biggest risks?");
  expect(discussPayload.mode).toBe("text");
  expect(discussPayload.report.executive_summary).toContain("ZebraDock");
  expect(discussPayload.report.missing_documents).toContain("ZebraDock permit renewal letter");
});

test("discuss shows a friendly retry message instead of a canned answer when the model is unavailable", async ({ page }) => {
  await suppressWelcome(page);

  let calls = 0;
  await page.route("**/api/discuss", async (route) => {
    calls += 1;
    await route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({
        detail: "TenderLens could not reach the discussion model right now. Please try again after some time.",
      }),
    });
  });

  await page.goto("/");
  await page.getByRole("button", { name: "Run Analysis with example files" }).first().click();
  await page.getByRole("button", { name: "Discuss with TenderLens" }).click();

  const response = await ask(page, "can you summarize in two points?");

  await expect(response).toContainText("Please try again after some time");
  await expect(response).not.toContainText("Conditional bid with risks");
  expect(calls).toBe(1);
});

test("voice mode captures speech, sends transcript to discuss, and speaks the model answer", async ({ page }) => {
  await suppressWelcome(page);

  await page.addInitScript(() => {
    window.__spokenText = [];
    window.speechSynthesis = {
      speak(utterance) {
        window.__spokenText.push(utterance.text);
        setTimeout(() => utterance.onend && utterance.onend(), 0);
      },
      cancel() {},
    };
    window.SpeechSynthesisUtterance = class {
      constructor(text) {
        this.text = text;
        this.lang = "";
      }
    };
    window.webkitSpeechRecognition = class {
      constructor() {
        this.continuous = false;
        this.interimResults = false;
        this.lang = "en-US";
      }
      start() {
        setTimeout(() => {
          this.onresult &&
            this.onresult({
              results: [[{ transcript: "Which document is missing?" }]],
            });
        }, 0);
      }
      stop() {}
      abort() {}
    };
  });
  await page.route("**/api/discuss", async (route) => {
    const payload = route.request().postDataJSON();
    expect(payload.mode).toBe("voice");
    expect(payload.message).toBe("Which document is missing?");
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        answer: "The missing document is the 120-day bid bond letter.",
        citations: ["bid-readiness-notes.docx"],
        followups: [],
      }),
    });
  });

  await page.goto("/");
  await page.getByRole("button", { name: "Run Analysis with example files" }).first().click();
  await page.getByRole("button", { name: "Discuss with TenderLens" }).click();
  await page.getByRole("button", { name: "Start voice mode" }).click();

  await expect(page.locator("#voiceStateLabel")).toHaveText(/Listening|Processing|Speaking|Ready/, { timeout: 5000 });
  await expect(page.locator("#transcript")).toContainText("Which document is missing?", { timeout: 5000 });
  await expect(page.locator("#transcript")).toContainText("120-day bid bond letter", { timeout: 5000 });
  await expect.poll(() => page.evaluate(() => window.__spokenText.join(" "))).toContain("120-day bid bond letter");
});

test("voice mode can run more than one user-started conversation turn", async ({ page }) => {
  await suppressWelcome(page);

  await page.addInitScript(() => {
    window.__spokenText = [];
    window.__voiceTurns = ["Which document is missing?", "What should we do next?"];
    window.speechSynthesis = {
      speak(utterance) {
        window.__spokenText.push(utterance.text);
        setTimeout(() => utterance.onend && utterance.onend(), 0);
      },
      cancel() {},
    };
    window.SpeechSynthesisUtterance = class {
      constructor(text) {
        this.text = text;
        this.lang = "";
      }
    };
    window.webkitSpeechRecognition = class {
      constructor() {
        this.continuous = false;
        this.interimResults = false;
        this.lang = "en-US";
      }
      start() {
        const transcript = window.__voiceTurns.shift() || "No question";
        setTimeout(() => {
          this.onresult && this.onresult({ results: [[{ transcript }]] });
        }, 0);
      }
      stop() {}
      abort() {}
    };
  });

  const messages = [];
  await page.route("**/api/discuss", async (route) => {
    const payload = route.request().postDataJSON();
    messages.push(payload.message);
    const answer = payload.message.includes("next")
      ? "Next action: collect the signed bid bond confirmation."
      : "Missing document: the 120-day bid bond letter.";
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ answer, citations: ["bid-readiness-notes.docx"], followups: [] }),
    });
  });

  await page.goto("/");
  await page.getByRole("button", { name: "Run Analysis with example files" }).first().click();
  await page.getByRole("button", { name: "Discuss with TenderLens" }).click();
  await page.getByRole("button", { name: "Start voice mode" }).click();

  await expect(page.locator("#transcript")).toContainText("120-day bid bond letter", { timeout: 5000 });
  await page.getByRole("button", { name: "Listen again" }).click();
  await expect(page.locator("#transcript")).toContainText("signed bid bond confirmation", { timeout: 5000 });

  expect(messages).toEqual(["Which document is missing?", "What should we do next?"]);
  await expect.poll(() => page.evaluate(() => window.__spokenText.join(" "))).toContain("signed bid bond confirmation");
});

test("exports create valid pptx docx pdf txt files after analysis", async ({ page }) => {
  await suppressWelcome(page);
  await page.goto("/");
  await page.getByRole("button", { name: "Run Analysis with example files" }).first().click();

  await page.getByRole("button", { name: "Briefing Deck" }).click();
  {
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "PPTX" }).click();
    const download = await downloadPromise;
    expect(await readDownloadHead(download)).toBe("PK\u0003\u0004");
    const slideXml = await readZipEntry(download, "ppt/slides/slide1.xml");
    expect(slideXml).toContain('srgbClr val="0B302F"');
    expect(slideXml).toContain('srgbClr val="F8F2E6"');
  }

  for (const [name, magic] of [
    ["PDF", "%PDF"],
    ["DOCX", "PK\u0003\u0004"],
    ["TXT", "Tend"],
  ]) {
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name }).click();
    const download = await downloadPromise;
    expect(await readDownloadHead(download)).toBe(magic);
  }
});

test("map wraps labels and downloaded svg keeps text inside cards", async ({ page }) => {
  await suppressWelcome(page);
  await page.goto("/");
  await page.getByRole("button", { name: "Run Analysis with example files" }).first().click();
  await page.getByRole("button", { name: "Tender Map" }).click();

  await expect(page.locator("#tenderMapSvg svg text").first()).toBeVisible();
  await expect(page.locator("#tenderMapSvg svg tspan")).not.toHaveCount(0);
  const overflowingText = await page.locator("#tenderMapSvg svg text").evaluateAll((nodes) =>
    nodes.filter((node) => {
      const box = node.getBBox();
      const parent = node.closest("g[data-card]");
      if (!parent) return false;
      const rect = parent.querySelector("rect");
      const rectBox = rect.getBBox();
      return box.x < rectBox.x - 1 || box.x + box.width > rectBox.x + rectBox.width + 1;
    }).length,
  );
  expect(overflowingText).toBe(0);
  const mappedFiles = await page.locator("#tenderMapSvg svg g[data-source-file]").evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute("data-source-file")),
  );
  const fileCardCount = await page.locator("#tenderMapSvg svg g[data-card^='file-']").count();
  expect(mappedFiles.length).toBeGreaterThanOrEqual(5);
  expect(new Set(mappedFiles).size).toBe(fileCardCount);

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "SVG" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("tenderlens-map.svg");
  const svg = (await readDownloadBuffer(download)).toString("utf8");
  expect(svg).toContain("data-source-file");
});

test("switches to Arabic RTL without losing result state", async ({ page }) => {
  await suppressWelcome(page);
  await page.goto("/");
  await page.getByRole("button", { name: "Run Analysis with example files" }).first().click();

  await page.locator("#langAr").click();

  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.locator("#scoreValue")).toHaveText("78");
  await expect(page.locator(".workspace-tabs")).toContainText("خريطة المناقصة");
  await expect(page.locator("#compliantRows")).toContainText("بنود ممتثلة");
});
test("Arabic mode uses valid Arabic labels across result surfaces", async ({ page }) => {
  await suppressWelcome(page);
  await page.goto("/");
  await page.getByRole("button", { name: "Run Analysis with example files" }).first().click();

  await page.locator("#langAr").click();

  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.locator("#scoreValue")).toHaveText("78");
  await expect(page.locator(".workspace-tabs")).toContainText("خريطة المناقصة");
  await expect(page.locator("#compliantRows")).toContainText("بنود ممتثلة");
  await expect(page.locator("body")).not.toContainText("Ø");
  await expect(page.locator("#questionsList")).not.toContainText("Can you clarify");
  await page.getByRole("button", { name: "خريطة المناقصة" }).click();
  await expect(page.locator("#tenderMapSvg")).toContainText("المتطلبات");
  await page.getByRole("button", { name: "ملخص العرض" }).click();
  await expect(page.locator("#deckTitle")).not.toHaveText("Overall result");
});

test("Arabic uploaded-file model failure stays friendly and translated", async ({ page }) => {
  await suppressWelcome(page);
  await page.route("**/api/upload/analyze", async (route) => route.abort());

  await page.goto("/");
  await page.locator("#fileInput").setInputFiles({
    name: "arabic-local-test.md",
    mimeType: "text/markdown",
    buffer: Buffer.from(
      "Submission deadline is 12 August. Bid security and commercial insurance attachments are mandatory. Delivery SLA risk needs clarification.",
    ),
  });

  await expect(page.locator("#uploadStatus")).toContainText("Please try again after some time");
  await page.locator("#langAr").click();

  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.locator("#uploadStatus")).toContainText("يرجى المحاولة بعد بعض الوقت");
  await expect(page.locator("#emptyResult")).toBeVisible();
  await expect(page.locator("#checklistRows")).toContainText("لم يتم فحص المتطلبات بعد");
});
