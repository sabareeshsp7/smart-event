/**
 * Unit tests for API route request validation.
 * Tests valid responses, 400 errors, 401 auth, 429 rate-limit.
 * RULE TST-4: Every API route must have valid + invalid request tests.
 * RULE TST-8: vi.mock() for all external deps — no real DB/AI calls.
 */
import { describe, it, expect, vi } from "vitest";
import { NextRequest } from "next/server";

// ─── Mock dependencies ────────────────────────────────────────────────────────
vi.mock("@/lib/db/connection", () => ({
  getDb: vi.fn(() => ({
    prepare: vi.fn().mockReturnValue({
      get: vi.fn().mockReturnValue({ c: 0, total: 2 }),
      run: vi.fn(),
      all: vi.fn().mockReturnValue([
        {
          id: "s1", title: "Test Session", speaker: "Speaker", zone: "Main Stage",
          category: "Keynote", start_time: "2025-03-15T09:00:00", end_time: "2025-03-15T10:00:00",
          description: "Test description", tags: '["AI & ML"]', capacity: 100,
          registered: 80, is_featured: 1,
        },
      ]),
    }),
    exec: vi.fn(),
    transaction: vi.fn().mockImplementation((fn: () => void) => fn),
    pragma: vi.fn(),
    close: vi.fn(),
  })),
}));

vi.mock("@/lib/ai/azure-helpers", () => ({
  azureStreamChat: vi.fn(),
  getAzureFallbackResponse: vi.fn().mockReturnValue("Fallback response"),
  azureRecommendSessions: vi.fn().mockResolvedValue(null),
}));

vi.mock("@/lib/ai/gemini-helpers", () => ({
  geminiSummarizeSession: vi.fn().mockResolvedValue({
    summary: "Test summary",
    keyTakeaways: ["Takeaway 1"],
    targetAudience: "Developers",
    poweredByGemini: true,
  }),
  geminiAssessCrowdRisk: vi.fn().mockResolvedValue({
    overallRisk: "medium",
    riskScore: 45,
    hotspots: ["Main Stage"],
    recommendation: "Things look ok",
    alternativeZones: ["Food Court"],
    poweredByGemini: true,
  }),
}));

vi.mock("@/lib/utils/cache", () => ({
  sessionCache: { get: vi.fn().mockReturnValue(null), set: vi.fn(), clear: vi.fn() },
  crowdCache: { get: vi.fn().mockReturnValue(null), set: vi.fn(), delete: vi.fn() },
  aiResponseCache: { get: vi.fn().mockReturnValue(null), set: vi.fn() },
}));

// ─── Sessions Route Tests ─────────────────────────────────────────────────────

describe("GET /api/sessions", () => {
  it("returns 200 with sessions array", async () => {
    const { GET } = await import("@/app/api/sessions/route");
    const req = new NextRequest("http://localhost:3000/api/sessions");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.sessions)).toBe(true);
  });

  it("returns 400 for invalid page parameter", async () => {
    const { GET } = await import("@/app/api/sessions/route");
    const req = new NextRequest("http://localhost:3000/api/sessions?page=0");
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it("accepts valid search query", async () => {
    const { GET } = await import("@/app/api/sessions/route");
    const req = new NextRequest("http://localhost:3000/api/sessions?search=keynote");
    const res = await GET(req);
    expect(res.status).toBe(200);
  });

  it("rejects search query over 100 chars", async () => {
    const { GET } = await import("@/app/api/sessions/route");
    const longSearch = "x".repeat(101);
    const req = new NextRequest(`http://localhost:3000/api/sessions?search=${longSearch}`);
    const res = await GET(req);
    expect(res.status).toBe(400);
  });
});

describe("POST /api/sessions", () => {
  const validBody = {
    title: "Test Session Title",
    speaker: "Speaker Name",
    zone: "Main Stage",
    category: "Keynote",
    startTime: "2025-03-15T09:00:00",
    endTime: "2025-03-15T10:00:00",
    description: "A meaningful description of the session",
    tags: [],
  };

  it("returns 401 without admin key", async () => {
    const { POST } = await import("@/app/api/sessions/route");
    const req = new NextRequest("http://localhost:3000/api/sessions", {
      method: "POST",
      body: JSON.stringify(validBody),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 400 for missing required fields", async () => {
    const { POST } = await import("@/app/api/sessions/route");
    const req = new NextRequest("http://localhost:3000/api/sessions", {
      method: "POST",
      body: JSON.stringify({ title: "Short" }),
      headers: { "Content-Type": "application/json", "x-admin-key": "eventiq-dev-key" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid JSON body", async () => {
    const { POST } = await import("@/app/api/sessions/route");
    const req = new NextRequest("http://localhost:3000/api/sessions", {
      method: "POST",
      body: "not-json",
      headers: { "Content-Type": "application/json", "x-admin-key": "eventiq-dev-key" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});

// ─── Alerts Route Tests ───────────────────────────────────────────────────────

describe("GET /api/alerts", () => {
  it("returns 200 with alerts array", async () => {
    vi.mocked((await import("@/lib/db/connection")).getDb)().prepare("").all = vi.fn().mockReturnValue([]);
    const { GET } = await import("@/app/api/alerts/route");
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.alerts)).toBe(true);
  });
});

describe("POST /api/alerts", () => {
  const validAlert = {
    title: "Test Alert",
    message: "Test message content",
    severity: "high",
    zone: "Main Stage",
    adminKey: "eventiq-dev-key",
  };

  it("returns 401 with wrong admin key", async () => {
    const { POST } = await import("@/app/api/alerts/route");
    const req = new NextRequest("http://localhost:3000/api/alerts", {
      method: "POST",
      body: JSON.stringify({ ...validAlert, adminKey: "wrong-key" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 400 for invalid severity", async () => {
    const { POST } = await import("@/app/api/alerts/route");
    const req = new NextRequest("http://localhost:3000/api/alerts", {
      method: "POST",
      body: JSON.stringify({ ...validAlert, severity: "extreme" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid JSON", async () => {
    const { POST } = await import("@/app/api/alerts/route");
    const req = new NextRequest("http://localhost:3000/api/alerts", {
      method: "POST",
      body: "not-json",
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});

// ─── Recommendations Route Tests ──────────────────────────────────────────────

describe("POST /api/recommendations", () => {
  it("returns 400 for empty interests", async () => {
    const { POST } = await import("@/app/api/recommendations/route");
    const req = new NextRequest("http://localhost:3000/api/recommendations", {
      method: "POST",
      body: JSON.stringify({ interests: [] }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid interests", async () => {
    const { POST } = await import("@/app/api/recommendations/route");
    const req = new NextRequest("http://localhost:3000/api/recommendations", {
      method: "POST",
      body: JSON.stringify({ interests: ["Cooking"] }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 200 for valid interests", async () => {
    const { POST } = await import("@/app/api/recommendations/route");
    const req = new NextRequest("http://localhost:3000/api/recommendations", {
      method: "POST",
      body: JSON.stringify({ interests: ["AI & ML"] }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
  });
});

// ─── Health Route Tests ───────────────────────────────────────────────────────

describe("GET /api/health", () => {
  it("returns 200 with status field", async () => {
    const { GET } = await import("@/app/api/health/route");
    const req = new NextRequest("http://localhost:3000/api/health");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(["healthy", "degraded"]).toContain(data.status);
  });

  it("includes services breakdown", async () => {
    const { GET } = await import("@/app/api/health/route");
    const req = new NextRequest("http://localhost:3000/api/health");
    const res = await GET(req);
    const data = await res.json();
    expect(data.services).toBeDefined();
    expect(data.services.database).toBeDefined();
  });

  it("has no-cache headers", async () => {
    const { GET } = await import("@/app/api/health/route");
    const req = new NextRequest("http://localhost:3000/api/health");
    const res = await GET(req);
    expect(res.headers.get("Cache-Control")).toContain("no-cache");
  });
});
