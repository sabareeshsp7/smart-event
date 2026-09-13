/**
 * Unit tests for AI client initialization (Azure + Gemini).
 * Tests: RULE TST-3, RULE TST-6, RULE SEC-8
 * Uses vi.mock() for all external calls — no real HTTP requests.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ─── Azure Client Tests ───────────────────────────────────────────────────────

vi.mock("openai", () => {
  class MockOpenAI {
    chat = { completions: { create: vi.fn() } };
  }
  return { default: MockOpenAI, OpenAI: MockOpenAI };
});

describe("getAzureClient", () => {
  beforeEach(async () => {
    vi.resetModules();
    delete process.env.AZURE_OPENAI_API_KEY;
    delete process.env.AZURE_OPENAI_ENDPOINT;
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("returns null when API key is missing", async () => {
    const { getAzureClient } = await import("@/lib/ai/azure");
    expect(getAzureClient()).toBeNull();
  });

  it("returns null when endpoint is missing", async () => {
    process.env.AZURE_OPENAI_API_KEY = "test-key";
    const { getAzureClient } = await import("@/lib/ai/azure");
    expect(getAzureClient()).toBeNull();
  });

  it("returns client when both key and endpoint set", async () => {
    process.env.AZURE_OPENAI_API_KEY = "test-key";
    process.env.AZURE_OPENAI_ENDPOINT = "https://test.endpoint.com";
    const { getAzureClient } = await import("@/lib/ai/azure");
    expect(getAzureClient()).not.toBeNull();
  });

  it("returns cached client on second call", async () => {
    process.env.AZURE_OPENAI_API_KEY = "test-key";
    process.env.AZURE_OPENAI_ENDPOINT = "https://test.endpoint.com";
    const { getAzureClient } = await import("@/lib/ai/azure");
    const client1 = getAzureClient();
    const client2 = getAzureClient();
    expect(client1).toBe(client2);
  });

  it("resetAzureClient allows re-initialization", async () => {
    process.env.AZURE_OPENAI_API_KEY = "test-key";
    process.env.AZURE_OPENAI_ENDPOINT = "https://test.endpoint.com";
    const { getAzureClient, resetAzureClient } = await import("@/lib/ai/azure");
    const client1 = getAzureClient();
    resetAzureClient();
    const client2 = getAzureClient();
    expect(client1).not.toBe(client2);
  });
});

// ─── Gemini Client Tests ──────────────────────────────────────────────────────

vi.mock("@google/generative-ai", () => {
  class GoogleGenerativeAI {
    getGenerativeModel = vi.fn().mockReturnValue({ generateContent: vi.fn() });
  }
  return { GoogleGenerativeAI };
});

describe("getGeminiClient", () => {
  beforeEach(async () => {
    vi.resetModules();
    delete process.env.GEMINI_API_KEY;
  });

  it("returns null when GEMINI_API_KEY is missing", async () => {
    const { getGeminiClient } = await import("@/lib/ai/gemini");
    expect(getGeminiClient()).toBeNull();
  });

  it("returns client when GEMINI_API_KEY is set", async () => {
    process.env.GEMINI_API_KEY = "test-gemini-key";
    const { getGeminiClient } = await import("@/lib/ai/gemini");
    expect(getGeminiClient()).not.toBeNull();
  });

  it("getGeminiModel returns null without API key", async () => {
    const { getGeminiModel } = await import("@/lib/ai/gemini");
    expect(getGeminiModel()).toBeNull();
  });

  it("resetGeminiClient clears cached client", async () => {
    process.env.GEMINI_API_KEY = "test-key";
    const { getGeminiClient, resetGeminiClient } = await import("@/lib/ai/gemini");
    const c1 = getGeminiClient();
    expect(c1).toBeTruthy();
    resetGeminiClient();
    delete process.env.GEMINI_API_KEY;
    vi.resetModules();
    const { getGeminiClient: fresh } = await import("@/lib/ai/gemini");
    expect(fresh()).toBeNull();
  });
});

// ─── Azure Helpers Tests ──────────────────────────────────────────────────────

describe("getAzureFallbackResponse", () => {
  it("returns a non-empty string", async () => {
    const { getAzureFallbackResponse } = await import("@/lib/ai/azure-helpers");
    expect(getAzureFallbackResponse()).toBeTruthy();
  });

  it("cycles through different responses", async () => {
    const { getAzureFallbackResponse } = await import("@/lib/ai/azure-helpers");
    const responses = new Set(Array.from({ length: 5 }, () => getAzureFallbackResponse()));
    expect(responses.size).toBeGreaterThan(1);
  });
});

describe("azureStreamChat (fallback mode)", () => {
  it("calls onToken with fallback text when client is null", async () => {
    vi.resetModules();
    delete process.env.AZURE_OPENAI_API_KEY;
    const { azureStreamChat } = await import("@/lib/ai/azure-helpers");
    const tokens: string[] = [];
    await azureStreamChat([{ role: "user", content: "Hi" }], (t) => tokens.push(t));
    expect(tokens.length).toBeGreaterThan(0);
    expect(tokens.join("").length).toBeGreaterThan(0);
  });

  it("respects AbortController abort", async () => {
    vi.resetModules();
    delete process.env.AZURE_OPENAI_API_KEY;
    const { azureStreamChat } = await import("@/lib/ai/azure-helpers");
    const controller = new AbortController();
    controller.abort();
    const tokens: string[] = [];
    await azureStreamChat([{ role: "user", content: "Hi" }], (t) => tokens.push(t), controller.signal);
    expect(tokens.length).toBe(0);
  });
});
