import { expect, test } from "@playwright/test";

async function suppressWelcome(page) {
  await page.addInitScript(() => {
    window.localStorage.setItem("tenderlens-welcome-dismissed", "yes");
  });
}

test("welcome popup explains preloaded files and can be dismissed", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("#welcomeModal")).not.toHaveClass(/hidden/);
  await expect(page.locator("#welcomeModal")).toContainText("Use Preloaded Example Files");
  await expect(page.locator("#welcomeModal")).toContainText("Voice starts only when you choose Talk to TenderLens");

  await page.locator("#welcomeDismiss").click();

  await expect(page.locator("#welcomeModal")).toHaveClass(/hidden/);
});

test("runs preloaded example analysis and shows checked evidence", async ({ page }) => {
  await suppressWelcome(page);
  await page.goto("/");

  await page.getByRole("button", { name: "Run analysis" }).click();

  await expect(page.locator(".feature-nav")).toContainText("Tender Questions");
  await expect(page.locator("header #voiceButton")).toHaveCount(0);
  await expect(page.locator("#discuss #voiceButton")).toHaveText("Talk to TenderLens");
  await expect(page.locator(".transparency-banner")).toContainText("Pre-generated example result");
  await expect(page.locator("#chatLog")).toContainText("Pre-generated example results");
  await expect(page.locator("#recommendation")).toHaveText("BID");
  await expect(page.locator("#auditStatus")).toHaveText("Passed");
  await expect(page.locator("#stageAudit")).toHaveClass(/done/);
  await expect(page.locator("#evidenceList .evidence-card")).toHaveCount(4);
  await expect(page.locator("#sourceDocuments")).toContainText("Preloaded Example Files");
});

test("rejects oversized uploads before backend validation", async ({ page }) => {
  await suppressWelcome(page);
  await page.goto("/");

  await page.locator("#fileInput").setInputFiles({
    name: "oversized-tender.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.alloc(5 * 1024 * 1024 + 1),
  });

  await expect(page.locator("#uploadStatus")).toHaveClass(/error/);
  await expect(page.locator("#uploadStatus")).toContainText("5 MB limit");
});

test("switches to Arabic RTL without losing cockpit state", async ({ page }) => {
  await suppressWelcome(page);
  await page.goto("/");
  await page.getByRole("button", { name: "Run analysis" }).click();

  await page.locator("#langAr").click();

  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.locator("#stageParallel")).toContainText("تم فحص التخصصات");
  await expect(page.locator("#auditStatus")).toContainText("ناجح");
  await expect(page.locator("#evidenceList .evidence-card").first()).toContainText("الأهلية");
  await expect(page.locator("#recommendation")).toHaveText("BID");
});

test("filters evidence cards by risk", async ({ page }) => {
  await suppressWelcome(page);
  await page.goto("/");

  await page.locator("#filters [data-filter='risk']").click();

  await expect(page.locator("#evidenceList .evidence-card")).toHaveCount(1);
  await expect(page.locator("#evidenceList")).toContainText("HVAC partner confirmation");
});

test("voice permission failure is visible while typing mode remains usable", async ({ page }) => {
  await suppressWelcome(page);
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "mediaDevices", {
      value: {
        getUserMedia: () => Promise.reject(new Error("Microphone denied by test")),
      },
      configurable: true,
    });
  });
  await page.goto("/");

  await expect(page.locator("#voiceOverlay")).toHaveClass(/hidden/);
  await page.locator("#discuss #voiceButton").click();

  await expect(page.locator("#voiceOverlay")).not.toHaveClass(/hidden/);
  await expect(page.locator("#voiceStateLabel")).toHaveText("Error");
  await expect(page.locator("#voiceHelp")).toContainText("Typing mode remains available");

  await page.locator("#chatInput").fill("What is the main risk?");
  await page.getByRole("button", { name: "Send" }).click();

  await expect(page.locator("#chatLog")).toContainText("You: What is the main risk?");
  await expect(page.locator("#chatLog")).toContainText("The strongest evidence is eligibility fit");
});
