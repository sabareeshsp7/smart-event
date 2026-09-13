/**
 * Unit tests for rate limiter utility.
 * Tests: RULE TST-3, RULE TST-6
 */
import { describe, it, expect, beforeEach } from "vitest";
import { checkRateLimit, getClientIp } from "@/lib/utils/rate-limit";

describe("checkRateLimit", () => {
  beforeEach(() => {
    // Clear the global rate limit store before each test
    if (global.rateLimitStore) {
      global.rateLimitStore.clear();
    }
  });

  it("allows first request", () => {
    const result = checkRateLimit("test-ip-1", 5, 60_000);
    expect(result.allowed).toBe(true);
  });

  it("decrements remaining on each request", () => {
    checkRateLimit("test-ip-2", 5, 60_000);
    const result = checkRateLimit("test-ip-2", 5, 60_000);
    expect(result.remaining).toBe(3);
  });

  it("blocks after max requests", () => {
    const id = "test-ip-3";
    for (let i = 0; i < 5; i++) checkRateLimit(id, 5, 60_000);
    const result = checkRateLimit(id, 5, 60_000);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("allows request after window resets", async () => {
    const id = "test-ip-4";
    for (let i = 0; i < 5; i++) checkRateLimit(id, 5, 1); // 1ms window
    await new Promise((r) => setTimeout(r, 10));
    const result = checkRateLimit(id, 5, 1);
    expect(result.allowed).toBe(true);
  });

  it("treats different identifiers independently", () => {
    for (let i = 0; i < 5; i++) checkRateLimit("user-a", 5, 60_000);
    const resultA = checkRateLimit("user-a", 5, 60_000);
    const resultB = checkRateLimit("user-b", 5, 60_000);
    expect(resultA.allowed).toBe(false);
    expect(resultB.allowed).toBe(true);
  });

  it("includes resetAt timestamp", () => {
    const before = Date.now();
    const result = checkRateLimit("test-ip-5", 5, 60_000);
    expect(result.resetAt).toBeGreaterThan(before);
  });

  it("respects custom maxRequests", () => {
    const id = "test-ip-6";
    const result1 = checkRateLimit(id, 1, 60_000);
    expect(result1.remaining).toBe(0);
    const result2 = checkRateLimit(id, 1, 60_000);
    expect(result2.allowed).toBe(false);
  });
});

describe("getClientIp", () => {
  it("reads x-forwarded-for header", () => {
    const headers = new Headers({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" });
    expect(getClientIp(headers)).toBe("1.2.3.4");
  });

  it("falls back to x-real-ip", () => {
    const headers = new Headers({ "x-real-ip": "9.10.11.12" });
    expect(getClientIp(headers)).toBe("9.10.11.12");
  });

  it("returns unknown when no headers present", () => {
    expect(getClientIp(new Headers())).toBe("unknown");
  });

  it("trims spaces from x-forwarded-for", () => {
    const headers = new Headers({ "x-forwarded-for": "  1.2.3.4  , 5.6.7.8" });
    expect(getClientIp(headers)).toBe("1.2.3.4");
  });
});
