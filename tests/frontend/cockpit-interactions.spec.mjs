import { expect, test } from "@playwright/test";

const port = Number(process.env.PORT || 3000);

async function suppressWelcome(page) {
  await page.addInitScript(() => {
    window.localStorage.setItem("tenderlens-welcome-dismissed", "yes");
  });
}

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

test("uploaded text files get a bounded deterministic analysis when backend is unavailable", async ({ page }) => {
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

  await page.locator("#fileInput").setInputFiles([
    {
      name: "main-tender.md",
      mimeType: "text/markdown",
      buffer: Buffer.from("Eligibility requires ISO 9001. Submission deadline is 30 September. Bid security is mandatory."),
    },
    {
      name: "proposal-response.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("Delivery risk includes mobilization and service levels. The proposal includes ISO certification evidence."),
    },
  ]);

  await expect(page.locator("#preparedBadge")).toHaveText("Uploaded files");
  await expect(page.locator("#scoreValue")).not.toHaveText("78");
  await expect(page.locator("#checklistRows .checklist-row")).toHaveCount(4);
  await expect(page.locator("#uploadStatus")).toContainText("bounded local text review");
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

  await page.goto("/");
  await page.locator("#fileInput").setInputFiles({
    name: "zebradock-live-test.md",
    mimeType: "text/markdown",
    buffer: Buffer.from("ZebraDock renewal deadline is 12 August. The permit renewal letter is mandatory."),
  });

  await expect(page.locator("#uploadStatus")).toContainText("1 file accepted");
  await expect(page.locator("#scoreValue")).toHaveText("100");
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
