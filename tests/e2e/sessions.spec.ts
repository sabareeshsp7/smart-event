/**
 * E2E tests for the sessions discovery journey.
 * RULE TST-5: page load, main interaction, accessibility check.
 */
import { test, expect } from "@playwright/test";

test.describe("Sessions Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/sessions");
  });

  test("has correct page title", async ({ page }) => {
    await expect(page).toHaveTitle(/Session/);
  });

  test("h1 heading contains 'Session'", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Session");
  });

  test("search input is present and accessible", async ({ page }) => {
    const input = page.getByLabel(/Search sessions/i);
    await expect(input).toBeVisible();
  });

  test("category filter dropdown is present", async ({ page }) => {
    const select = page.getByLabel(/Filter by category/i);
    await expect(select).toBeVisible();
  });

  test("session cards load from API", async ({ page }) => {
    // Wait for loading to complete
    await page.waitForSelector("article.glass-card", { timeout: 10_000 });
    const cards = page.locator("article.glass-card");
    await expect(cards.first()).toBeVisible();
  });

  test("search filters sessions", async ({ page }) => {
    await page.waitForSelector("article.glass-card", { timeout: 10_000 });
    const searchInput = page.getByLabel(/Search sessions/i);
    await searchInput.fill("Keynote");
    // Wait for debounce
    await page.waitForTimeout(400);
    const cards = page.locator("article.glass-card");
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });

  test("clicking a session card opens modal", async ({ page }) => {
    await page.waitForSelector("article.glass-card", { timeout: 10_000 });
    await page.locator("article.glass-card").first().click();
    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible();
  });

  test("modal can be closed", async ({ page }) => {
    await page.waitForSelector("article.glass-card", { timeout: 10_000 });
    await page.locator("article.glass-card").first().click();
    await page.getByRole("button", { name: /Close session details/i }).click();
    const modal = page.getByRole("dialog");
    await expect(modal).not.toBeVisible();
  });

  test("capacity progress bar has aria attributes", async ({ page }) => {
    await page.waitForSelector("[role='progressbar']", { timeout: 10_000 });
    const progressBar = page.locator("[role='progressbar']").first();
    await expect(progressBar).toHaveAttribute("aria-valuenow");
    await expect(progressBar).toHaveAttribute("aria-valuemin", "0");
    await expect(progressBar).toHaveAttribute("aria-valuemax", "100");
  });

  test("emergency contact link is visible in header", async ({ page }) => {
    const emergencyLink = page.getByRole("link", { name: /Call emergency/ });
    await expect(emergencyLink).toBeVisible();
  });
});
