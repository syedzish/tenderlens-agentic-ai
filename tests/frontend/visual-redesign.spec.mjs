import { mkdirSync } from "node:fs";
import { expect, test } from "@playwright/test";

const outputDir = "artifacts/visual-checks";

async function suppressWelcome(page) {
  await page.addInitScript(() => {
    window.localStorage.setItem("tenderlens-welcome-dismissed", "yes");
  });
}

async function capture(page, name) {
  mkdirSync(outputDir, { recursive: true });
  await page.screenshot({ path: `${outputDir}/${name}.png`, fullPage: false });
}

async function scrollTo(page, selector) {
  await page.evaluate((target) => {
    document.querySelector(target)?.scrollIntoView({ block: "start" });
  }, selector);
  await page.waitForTimeout(350);
}

test("captures premium desktop cockpit screens", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium-desktop", "visual screenshots are captured once with explicit viewports");
  await page.setViewportSize({ width: 1680, height: 945 });
  await suppressWelcome(page);
  await page.goto("/");

  await expect(page.locator(".topbar")).toBeVisible();
  await expect(page.locator(".feature-nav")).toBeVisible();
  await expect(page.locator(".how-to-use-section")).toContainText("Start with files, then follow the evidence");
  await capture(page, "desktop-01-how-to-use");

  await scrollTo(page, "#analysis");
  await expect(page.locator("#recommendation")).toHaveText("BID");
  await expect(page.locator(".decision-band")).toBeVisible();
  await capture(page, "desktop-02-analysis");

  await scrollTo(page, "#tender-map");
  await expect(page.locator("#tender-map .concept-graph")).toBeVisible();
  await expect(page.locator("#sourceDocuments")).toContainText("Preloaded Example Files");
  await capture(page, "desktop-03-tender-map");

  await scrollTo(page, "#briefing-deck");
  await expect(page.locator("#briefing-deck .deck-slide")).toBeVisible();
  await expect(page.locator("#slideCount")).toContainText("1 / 8");
  await capture(page, "desktop-04-briefing-deck");

  await scrollTo(page, "#tender-questions");
  await expect(page.locator("#tender-questions")).toContainText("Ask the Issuer");
  await expect(page.locator("#tender-questions")).toContainText("Prepare to Answer");
  await capture(page, "desktop-05-tender-questions");
});

test("captures mobile responsive cockpit", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium-desktop", "visual screenshots are captured once with explicit viewports");
  await page.setViewportSize({ width: 390, height: 844 });
  await suppressWelcome(page);
  await page.goto("/");

  await expect(page.locator(".feature-nav")).toContainText("Tender Questions");
  await expect(page.locator(".how-to-use-section")).toBeVisible();
  await capture(page, "mobile-01-how-to-use");
});
