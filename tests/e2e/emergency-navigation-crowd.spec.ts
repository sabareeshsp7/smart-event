/**
 * E2E tests for Emergency SOS journey.
 * RULE PA-2: Emergency numbers must appear on ≥3 pages prominently.
 * RULE TST-5: page load, main interaction, accessibility check.
 */
import { test, expect } from "@playwright/test";

test.describe("Emergency SOS Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/emergency");
  });

  test("has correct page title", async ({ page }) => {
    await expect(page).toHaveTitle(/Emergency/);
  });

  test("h1 heading is present", async ({ page }) => {
    await expect(page.locator("h1")).toBeVisible();
  });

  test("SOS call button is prominent and visible", async ({ page }) => {
    const sosBtn = page.locator("#sos-btn");
    await expect(sosBtn).toBeVisible();
    await expect(sosBtn).toContainText("112");
  });

  test("emergency contacts section has at least 4 contacts", async ({ page }) => {
    const emergencyLinks = page.locator('a[href^="tel:"]');
    const count = await emergencyLinks.count();
    expect(count).toBeGreaterThanOrEqual(4);
  });

  test("safety locations list is visible", async ({ page }) => {
    const section = page.getByRole("region", { name: /Safety Locations/ });
    await expect(section).toBeVisible();
  });

  test("emergency procedure steps are listed", async ({ page }) => {
    const section = page.getByRole("region", { name: /Emergency Procedure/ });
    await expect(section).toBeVisible();
  });

  test("SOS button has proper aria-label", async ({ page }) => {
    const sosBtn = page.locator("#sos-btn");
    await expect(sosBtn).toHaveAttribute("aria-label", /emergency/i);
  });

  test("assembly point alert is displayed", async ({ page }) => {
    const note = page.getByRole("note", { name: /Assembly point/ });
    await expect(note).toBeVisible();
  });

  test("emergency numbers contain 112 and 108", async ({ page }) => {
    const pageText = await page.textContent("body");
    expect(pageText).toContain("112");
    expect(pageText).toContain("108");
  });
});

test.describe("Navigation Page Accessibility", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/navigation");
  });

  test("has correct page title", async ({ page }) => {
    await expect(page).toHaveTitle(/Navigation/);
  });

  test("venue SVG map is present with aria-label", async ({ page }) => {
    const map = page.locator('[role="img"][aria-label*="Venue"]');
    await expect(map).toBeVisible();
  });

  test("zone directory lists all items", async ({ page }) => {
    const zoneItems = page.locator('[role="listitem"]');
    const count = await zoneItems.count();
    expect(count).toBeGreaterThan(10);
  });

  test("common routes section is visible", async ({ page }) => {
    const routes = page.getByRole("region", { name: /Common Routes/ });
    await expect(routes).toBeVisible();
  });

  test("emergency contacts visible on navigation page", async ({ page }) => {
    const emergency = page.getByRole("complementary", { name: /Emergency contacts/ });
    await expect(emergency).toBeVisible();
  });
});

test.describe("Crowd Heatmap Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/crowd");
  });

  test("has correct page title", async ({ page }) => {
    await expect(page).toHaveTitle(/Crowd/);
  });

  test("h1 contains Crowd", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Crowd");
  });

  test("zone articles load from API", async ({ page }) => {
    await page.waitForSelector("article.glass-card", { timeout: 15_000 });
    const zones = page.locator("article.glass-card");
    const count = await zones.count();
    expect(count).toBeGreaterThan(5);
  });

  test("risk legend is displayed", async ({ page }) => {
    const legend = page.getByRole("note", { name: /Risk level legend/ });
    await expect(legend).toBeVisible();
  });
});
