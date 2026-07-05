import { mkdirSync } from "node:fs";
import { expect, test } from "@playwright/test";

const outputDir = "artifacts/visual-checks";

async function suppressWelcome(page) {
  await page.addInitScript(() => {
    window.localStorage.setItem("tenderlens-welcome-dismissed-v3", "yes");
  });
}

async function capture(page, name) {
  mkdirSync(outputDir, { recursive: true });
  await page.screenshot({ path: `${outputDir}/${name}.png`, fullPage: false });
}

test("captures reference-style desktop workspace screens", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium-desktop", "visual screenshots are captured once with explicit viewports");
  await page.setViewportSize({ width: 1680, height: 945 });
  await suppressWelcome(page);
  await page.goto("/");

  await expect(page.locator(".app-header")).toContainText("TenderLens Agentic AI");
  await expect(page.locator(".start-hero")).toContainText("Start your analysis");
  await capture(page, "desktop-01-start");

  await page.getByRole("button", { name: "Run Analysis with example files" }).first().click();
  await expect(page.locator("#scoreValue")).toHaveText("78");
  await expect(page.locator("#checklistRows .checklist-row")).toHaveCount(10);
  await capture(page, "desktop-02-analysis");

  await page.getByRole("button", { name: "Tender Map" }).click();
  await expect(page.locator("#tenderMapSvg svg")).toBeVisible();
  await capture(page, "desktop-03-tender-map");

  await page.getByRole("button", { name: "Briefing Deck" }).click();
  await expect(page.locator("#deckTitle")).toHaveText("Overall result");
  await capture(page, "desktop-04-briefing-deck");

  await page.getByRole("button", { name: "Questions to Ask" }).click();
  await expect(page.locator("#questionsList .question-card")).toHaveCount(8);
  await capture(page, "desktop-05-questions");
});

test("captures mobile responsive start screen", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium-desktop", "visual screenshots are captured once with explicit viewports");
  await page.setViewportSize({ width: 390, height: 844 });
  await suppressWelcome(page);
  await page.goto("/");

  await expect(page.locator(".left-rail")).toContainText("Upload tender/RFP files");
  await expect(page.locator(".start-hero")).toBeVisible();
  await capture(page, "mobile-01-start");
});
