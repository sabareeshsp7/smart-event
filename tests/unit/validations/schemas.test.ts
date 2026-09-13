/**
 * Unit tests for Zod validation schemas.
 * Tests: RULE TST-3, RULE TST-4, RULE SEC-1
 */
import { describe, it, expect } from "vitest";
import { CreateSessionSchema, SessionQuerySchema } from "@/lib/validations/sessions";
import { CreateAlertSchema } from "@/lib/validations/alerts";
import { RecommendationSchema, ChatRequestSchema } from "@/lib/validations/recommendations";

// ─── Session Schemas ──────────────────────────────────────────────────────────

describe("CreateSessionSchema", () => {
  const validSession = {
    title: "Test Session Title",
    speaker: "Test Speaker",
    zone: "Main Stage",
    category: "Keynote",
    startTime: "2025-03-15T09:00:00",
    endTime: "2025-03-15T10:00:00",
    description: "A meaningful description of the session content",
    tags: ["AI & ML"],
    capacity: 100,
  };

  it("accepts valid session", () => {
    expect(CreateSessionSchema.safeParse(validSession).success).toBe(true);
  });

  it("rejects title shorter than 3 chars", () => {
    expect(CreateSessionSchema.safeParse({ ...validSession, title: "Hi" }).success).toBe(false);
  });

  it("rejects invalid zone", () => {
    expect(CreateSessionSchema.safeParse({ ...validSession, zone: "Invalid Zone" }).success).toBe(false);
  });

  it("rejects invalid category", () => {
    expect(CreateSessionSchema.safeParse({ ...validSession, category: "BadCat" }).success).toBe(false);
  });

  it("rejects invalid startTime format", () => {
    expect(CreateSessionSchema.safeParse({ ...validSession, startTime: "not-a-date" }).success).toBe(false);
  });

  it("rejects description shorter than 10 chars", () => {
    expect(CreateSessionSchema.safeParse({ ...validSession, description: "Too short" }).success).toBe(false);
  });

  it("rejects capacity over 10000", () => {
    expect(CreateSessionSchema.safeParse({ ...validSession, capacity: 10001 }).success).toBe(false);
  });

  it("accepts zero tags (defaults to [])", () => {
    const { tags: _, ...withoutTags } = validSession;
    const result = CreateSessionSchema.safeParse(withoutTags);
    expect(result.success).toBe(true);
  });

  it("rejects more than 10 tags", () => {
    const tooManyTags = Array.from({ length: 11 }, () => "AI & ML");
    expect(CreateSessionSchema.safeParse({ ...validSession, tags: tooManyTags }).success).toBe(false);
  });
});

describe("SessionQuerySchema", () => {
  it("accepts empty query (all defaults)", () => {
    expect(SessionQuerySchema.safeParse({}).success).toBe(true);
  });

  it("coerces page string to number", () => {
    const result = SessionQuerySchema.safeParse({ page: "2" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.page).toBe(2);
  });

  it("rejects page below 1", () => {
    expect(SessionQuerySchema.safeParse({ page: "0" }).success).toBe(false);
  });

  it("rejects limit above 50", () => {
    expect(SessionQuerySchema.safeParse({ limit: "51" }).success).toBe(false);
  });

  it("rejects search over 100 chars", () => {
    expect(SessionQuerySchema.safeParse({ search: "x".repeat(101) }).success).toBe(false);
  });

  it("accepts valid optional filters", () => {
    const result = SessionQuerySchema.safeParse({ category: "Keynote", zone: "Main Stage" });
    expect(result.success).toBe(true);
  });
});

// ─── Alert Schemas ────────────────────────────────────────────────────────────

describe("CreateAlertSchema", () => {
  const validAlert = {
    title: "Test Alert",
    message: "This is an important message",
    severity: "high",
    zone: "Main Stage",
    adminKey: "secret-key",
  };

  it("accepts valid alert", () => {
    expect(CreateAlertSchema.safeParse(validAlert).success).toBe(true);
  });

  it("rejects invalid severity", () => {
    expect(CreateAlertSchema.safeParse({ ...validAlert, severity: "extreme" }).success).toBe(false);
  });

  it("rejects empty adminKey", () => {
    expect(CreateAlertSchema.safeParse({ ...validAlert, adminKey: "" }).success).toBe(false);
  });

  it("rejects short title", () => {
    expect(CreateAlertSchema.safeParse({ ...validAlert, title: "Hi" }).success).toBe(false);
  });

  it("rejects message under 5 chars", () => {
    expect(CreateAlertSchema.safeParse({ ...validAlert, message: "Hi" }).success).toBe(false);
  });

  it("accepts all severity levels", () => {
    for (const sev of ["low", "medium", "high", "critical"]) {
      expect(CreateAlertSchema.safeParse({ ...validAlert, severity: sev }).success).toBe(true);
    }
  });

  it("uses All Areas as default zone", () => {
    const { zone: _, ...noZone } = validAlert;
    const result = CreateAlertSchema.safeParse(noZone);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.zone).toBe("All Areas");
  });
});

// ─── Recommendation Schemas ───────────────────────────────────────────────────

describe("RecommendationSchema", () => {
  it("accepts valid interests", () => {
    const result = RecommendationSchema.safeParse({ interests: ["AI & ML", "Cloud"] });
    expect(result.success).toBe(true);
  });

  it("rejects empty interests array", () => {
    expect(RecommendationSchema.safeParse({ interests: [] }).success).toBe(false);
  });

  it("rejects invalid interest tag", () => {
    expect(RecommendationSchema.safeParse({ interests: ["Cooking"] }).success).toBe(false);
  });

  it("rejects more than 12 interests", () => {
    const tooMany = Array.from({ length: 13 }, () => "AI & ML");
    expect(RecommendationSchema.safeParse({ interests: tooMany }).success).toBe(false);
  });
});

describe("ChatRequestSchema", () => {
  const validMsg = { role: "user" as const, content: "Hello" };

  it("accepts valid chat request", () => {
    expect(ChatRequestSchema.safeParse({ messages: [validMsg] }).success).toBe(true);
  });

  it("rejects empty messages array", () => {
    expect(ChatRequestSchema.safeParse({ messages: [] }).success).toBe(false);
  });

  it("rejects invalid role", () => {
    expect(ChatRequestSchema.safeParse({ messages: [{ role: "admin", content: "hi" }] }).success).toBe(false);
  });

  it("rejects empty content", () => {
    expect(ChatRequestSchema.safeParse({ messages: [{ role: "user", content: "" }] }).success).toBe(false);
  });

  it("rejects more than 20 messages", () => {
    const tooMany = Array.from({ length: 21 }, () => validMsg);
    expect(ChatRequestSchema.safeParse({ messages: tooMany }).success).toBe(false);
  });

  it("accepts system/assistant roles", () => {
    const msgs = [
      { role: "system" as const, content: "You are helpful" },
      { role: "assistant" as const, content: "Hello!" },
    ];
    expect(ChatRequestSchema.safeParse({ messages: msgs }).success).toBe(true);
  });
});
