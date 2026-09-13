/**
 * E2E tests for the home page journey.
 * RULE TST-5: Every E2E spec must include page load, main interaction, accessibility check.
 */
import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("loads with correct title", async ({ page }) => {
    await expect(page).toHaveTitle(/EventIQ/);
  });

  test("hero heading is visible", async ({ page }) => {
    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toBeVisible();
  });

  test("all 8 feature cards are rendered", async ({ page }) => {
    const featureCards = page.locator("article.glass-card");
    await expect(featureCards).toHaveCount(8);
  });

  test("emergency contacts strip is visible", async ({ page }) => {
    const emergencySection = page.getByRole("region", { name: /Emergency contacts/ });
    await expect(emergencySection).toBeVisible();
  });

  test("skip navigation link is present", async ({ page }) => {
    const skipLink = page.locator(".skip-nav");
    await expect(skipLink).toBeAttached();
  });

  test("CTA buttons navigate correctly", async ({ page }) => {
    await page.getByRole("link", { name: /Explore Sessions/ }).click();
    await expect(page).toHaveURL(/\/sessions/);
  });

  test("Google Gemini badge is visible in hero", async ({ page }) => {
    const badge = page.getByLabel(/Powered by Google Gemini/i);
    await expect(badge).toBeVisible();
  });

  test("has valid meta description", async ({ page }) => {
    const meta = page.locator('meta[name="description"]');
    const content = await meta.getAttribute("content");
    expect(content?.length).toBeGreaterThan(20);
  });

  test("nav links are accessible via keyboard", async ({ page }) => {
    await page.keyboard.press("Tab");
    const focusedEl = await page.evaluate(() => document.activeElement?.tagName);
    expect(["A", "BUTTON"]).toContain(focusedEl);
  });
});
