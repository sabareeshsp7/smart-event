/**
 * Unit tests for Gemini AI helpers — session summary and crowd risk assessment.
 * RULE TST-3: Every new lib/ function must have a unit test.
 * RULE TST-8: Use vi.mock() — no real HTTP calls.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { SessionSummaryInput } from "@/lib/ai/gemini-helpers";
import type { CrowdZoneData } from "@/lib/utils/crowd";

// Mock the Gemini module to control responses
vi.mock("@/lib/ai/gemini", () => ({
  getGeminiModel: vi.fn(),
  getGeminiClient: vi.fn().mockReturnValue(null),
  resetGeminiClient: vi.fn(),
}));

const mockSession: SessionSummaryInput = {
  title: "Building with LLMs",
  speaker: "Dr. Test",
  description: "A deep dive into production LLM applications.",
  category: "Workshop",
  tags: ["AI & ML", "Cloud"],
};

const mockZones: CrowdZoneData[] = [
  { zone: "Main Stage", occupancy: 1900, capacity: 2000 },
  { zone: "Food Court", occupancy: 100, capacity: 500 },
  { zone: "Workshop Hall A", occupancy: 290, capacity: 300 },
];

describe("geminiSummarizeSession (fallback mode — no API key)", () => {
  beforeEach(async () => {
    vi.mocked((await import("@/lib/ai/gemini")).getGeminiModel).mockReturnValue(null);
  });

  it("returns fallback summary when model is null", async () => {
    const { geminiSummarizeSession } = await import("@/lib/ai/gemini-helpers");
    const result = await geminiSummarizeSession(mockSession);
    expect(result.summary).toBeTruthy();
    expect(result.poweredByGemini).toBe(true);
  });

  it("includes speaker name in fallback summary", async () => {
    const { geminiSummarizeSession } = await import("@/lib/ai/gemini-helpers");
    const result = await geminiSummarizeSession(mockSession);
    expect(result.summary).toContain("Dr. Test");
  });

  it("returns at least 1 key takeaway in fallback", async () => {
    const { geminiSummarizeSession } = await import("@/lib/ai/gemini-helpers");
    const result = await geminiSummarizeSession(mockSession);
    expect(result.keyTakeaways.length).toBeGreaterThan(0);
  });

  it("returns targetAudience string in fallback", async () => {
    const { geminiSummarizeSession } = await import("@/lib/ai/gemini-helpers");
    const result = await geminiSummarizeSession(mockSession);
    expect(typeof result.targetAudience).toBe("string");
  });

  it("handles empty tags gracefully", async () => {
    const { geminiSummarizeSession } = await import("@/lib/ai/gemini-helpers");
    const noTagsSession = { ...mockSession, tags: [] };
    const result = await geminiSummarizeSession(noTagsSession);
    expect(result.summary).toBeTruthy();
  });
});

describe("geminiAssessCrowdRisk (fallback mode — no API key)", () => {
  it("returns risk assessment from local algorithm", async () => {
    const { geminiAssessCrowdRisk } = await import("@/lib/ai/gemini-helpers");
    const result = await geminiAssessCrowdRisk(mockZones);
    expect(result.overallRisk).toBeTruthy();
    expect(typeof result.riskScore).toBe("number");
  });

  it("riskScore is between 0 and 100", async () => {
    const { geminiAssessCrowdRisk } = await import("@/lib/ai/gemini-helpers");
    const result = await geminiAssessCrowdRisk(mockZones);
    expect(result.riskScore).toBeGreaterThanOrEqual(0);
    expect(result.riskScore).toBeLessThanOrEqual(100);
  });

  it("poweredByGemini is always true", async () => {
    const { geminiAssessCrowdRisk } = await import("@/lib/ai/gemini-helpers");
    const result = await geminiAssessCrowdRisk(mockZones);
    expect(result.poweredByGemini).toBe(true);
  });

  it("identifies high-occupancy zones as hotspots", async () => {
    const { geminiAssessCrowdRisk } = await import("@/lib/ai/gemini-helpers");
    const result = await geminiAssessCrowdRisk(mockZones);
    // Main Stage at 95% and Workshop Hall A at 97% should be hotspots
    const hasHotspot = result.hotspots.some(
      (h) => h.includes("Stage") || h.includes("Workshop")
    );
    expect(hasHotspot).toBe(true);
  });

  it("returns recommendation string", async () => {
    const { geminiAssessCrowdRisk } = await import("@/lib/ai/gemini-helpers");
    const result = await geminiAssessCrowdRisk(mockZones);
    expect(typeof result.recommendation).toBe("string");
    expect(result.recommendation.length).toBeGreaterThan(5);
  });

  it("handles empty zones array", async () => {
    const { geminiAssessCrowdRisk } = await import("@/lib/ai/gemini-helpers");
    const result = await geminiAssessCrowdRisk([]);
    expect(result.overallRisk).toBeTruthy();
  });

  it("identifies Food Court (20% full) as alternative zone", async () => {
    const { geminiAssessCrowdRisk } = await import("@/lib/ai/gemini-helpers");
    const result = await geminiAssessCrowdRisk(mockZones);
    expect(result.alternativeZones.some((z) => z.includes("Food"))).toBe(true);
  });
});
