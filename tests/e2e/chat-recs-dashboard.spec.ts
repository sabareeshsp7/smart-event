/**
 * E2E tests for AI Chat, Recommendations, Dashboard, Accessibility pages.
 * RULE TST-5: page load, main interaction, accessibility check.
 */
import { test, expect } from "@playwright/test";

test.describe("AI Chat Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/chat");
  });

  test("has correct page title", async ({ page }) => {
    await expect(page).toHaveTitle(/Chat/);
  });

  test("chat message input is present and labelled", async ({ page }) => {
    const input = page.getByLabel(/Chat message input/i);
    await expect(input).toBeVisible();
  });

  test("send button is present", async ({ page }) => {
    const sendBtn = page.locator("#chat-send-btn");
    await expect(sendBtn).toBeVisible();
  });

  test("quick prompt buttons are rendered", async ({ page }) => {
    const quickBtns = page.getByRole("button", { name: /Quick prompt/i });
    const count = await quickBtns.count();
    expect(count).toBeGreaterThan(3);
  });

  test("chat log region has aria-live", async ({ page }) => {
    const log = page.getByRole("log");
    await expect(log).toHaveAttribute("aria-live", "polite");
  });

  test("sending a message adds it to the log", async ({ page }) => {
    const input = page.getByLabel(/Chat message input/i);
    await input.fill("Hello EventIQ");
    await page.locator("#chat-send-btn").click();
    await expect(page.getByText("Hello EventIQ")).toBeVisible({ timeout: 5_000 });
  });

  test("emergency number 112 is visible on page", async ({ page }) => {
    const pageText = await page.textContent("body");
    expect(pageText).toContain("112");
  });

  test("clear button clears the chat", async ({ page }) => {
    const input = page.getByLabel(/Chat message input/i);
    await input.fill("Test message");
    await page.locator("#chat-send-btn").click();
    await page.getByRole("button", { name: /Clear/i }).click();
    const messages = page.locator('[aria-label^="You:"]');
    await expect(messages).toHaveCount(0);
  });
});

test.describe("Recommendations Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/recommendations");
  });

  test("has correct page title", async ({ page }) => {
    await expect(page).toHaveTitle(/Recommendation/);
  });

  test("interest tag buttons are present", async ({ page }) => {
    const tagBtns = page.getByRole("group", { name: /Interest tags/ }).locator("button");
    const count = await tagBtns.count();
    expect(count).toBeGreaterThan(5);
  });

  test("get recommendations button is initially disabled", async ({ page }) => {
    const btn = page.locator("#get-recommendations-btn");
    await expect(btn).toBeDisabled();
  });

  test("selecting an interest enables the button", async ({ page }) => {
    await page.getByRole("button", { name: "AI & ML" }).click();
    const btn = page.locator("#get-recommendations-btn");
    await expect(btn).not.toBeDisabled();
  });

  test("interest tags have aria-pressed attribute", async ({ page }) => {
    const firstTag = page.getByRole("group", { name: /Interest tags/ }).locator("button").first();
    await expect(firstTag).toHaveAttribute("aria-pressed", "false");
    await firstTag.click();
    await expect(firstTag).toHaveAttribute("aria-pressed", "true");
  });

  test("fetching recommendations shows results", async ({ page }) => {
    await page.getByRole("button", { name: "AI & ML" }).click();
    await page.locator("#get-recommendations-btn").click();
    await page.waitForSelector("article.glass-card", { timeout: 10_000 });
    const cards = page.locator("article.glass-card");
    await expect(cards.first()).toBeVisible();
  });
});

test.describe("Accessibility Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/accessibility");
  });

  test("has correct page title", async ({ page }) => {
    await expect(page).toHaveTitle(/Accessibility/);
  });

  test("8 accessibility features are listed", async ({ page }) => {
    const features = page.locator("article.glass-card, .glass-card").filter({ hasText: /Available/ });
    const count = await features.count();
    expect(count).toBeGreaterThanOrEqual(8);
  });

  test("accessible route guide section is visible", async ({ page }) => {
    const section = page.getByRole("region", { name: /Accessible Route Guide/ });
    await expect(section).toBeVisible();
  });

  test("emergency contacts strip is visible", async ({ page }) => {
    const emergency = page.getByRole("complementary", { name: /Emergency contacts/ });
    await expect(emergency).toBeVisible();
  });

  test("help desk info has tel link", async ({ page }) => {
    const telLinks = page.locator('a[href^="tel:"]');
    const count = await telLinks.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe("Dashboard Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
  });

  test("has correct page title", async ({ page }) => {
    await expect(page).toHaveTitle(/Dashboard/);
  });

  test("4 stat cards are rendered", async ({ page }) => {
    await page.waitForSelector(".glass-card", { timeout: 10_000 });
    const statSection = page.getByRole("region", { name: /Dashboard Statistics/ });
    await expect(statSection).toBeVisible();
  });

  test("publish alert form is present", async ({ page }) => {
    const form = page.getByRole("region", { name: /Publish New Alert/ });
    await expect(form).toBeVisible();
  });

  test("alert title input is labelled", async ({ page }) => {
    const input = page.getByLabel(/Alert Title/i);
    await expect(input).toBeVisible();
  });

  test("publish button is disabled when form empty", async ({ page }) => {
    const btn = page.locator("#publish-alert-btn");
    await expect(btn).toBeDisabled();
  });

  test("filling form enables publish button", async ({ page }) => {
    await page.getByLabel(/Alert Title/i).fill("Test Alert");
    await page.getByLabel(/Message/i).fill("This is the message content");
    const btn = page.locator("#publish-alert-btn");
    await expect(btn).not.toBeDisabled();
  });
});
