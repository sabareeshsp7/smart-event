import { describe, it, expect } from "vitest";
import { timingSafeStringEqual, sanitizeString, isSafeId } from "@/lib/utils/security";

describe("timingSafeStringEqual", () => {
  it("returns true for equal strings", () => {
    expect(timingSafeStringEqual("hello", "hello")).toBe(true);
  });
  it("returns false for different strings", () => {
    expect(timingSafeStringEqual("hello", "world")).toBe(false);
  });
  it("is case sensitive", () => {
    expect(timingSafeStringEqual("Hello", "hello")).toBe(false);
  });
  it("handles empty strings", () => {
    expect(timingSafeStringEqual("", "")).toBe(true);
  });
  it("handles empty vs non-empty", () => {
    expect(timingSafeStringEqual("", "a")).toBe(false);
  });
  it("handles long strings", () => {
    const long = "x".repeat(1000);
    expect(timingSafeStringEqual(long, long)).toBe(true);
  });
  it("handles special characters", () => {
    const key = "key-@#$%^&*()!123";
    expect(timingSafeStringEqual(key, key)).toBe(true);
  });
});

describe("sanitizeString", () => {
  it("escapes < and >", () => {
    expect(sanitizeString("<script>")).toBe("&lt;script&gt;");
  });
  it("escapes &", () => {
    expect(sanitizeString("a & b")).toBe("a &amp; b");
  });
  it("escapes double quotes", () => {
    expect(sanitizeString('"hello"')).toBe("&quot;hello&quot;");
  });
  it("escapes single quotes", () => {
    expect(sanitizeString("it's")).toBe("it&#039;s");
  });
  it("returns safe string unchanged", () => {
    expect(sanitizeString("Hello World 123")).toBe("Hello World 123");
  });
  it("handles empty string", () => {
    expect(sanitizeString("")).toBe("");
  });
  it("handles XSS payload", () => {
    const xss = '<img src=x onerror="alert(1)">';
    const sanitized = sanitizeString(xss);
    expect(sanitized).not.toContain("<");
    expect(sanitized).not.toContain(">");
  });
});

describe("isSafeId", () => {
  it("returns true for simple alphanumeric ID", () => {
    expect(isSafeId("abc123")).toBe(true);
  });
  it("returns true for ID with dashes", () => {
    expect(isSafeId("session-1")).toBe(true);
  });
  it("returns true for ID with underscores", () => {
    expect(isSafeId("session_abc")).toBe(true);
  });
  it("returns false for empty string", () => {
    expect(isSafeId("")).toBe(false);
  });
  it("returns false for ID with spaces", () => {
    expect(isSafeId("id with spaces")).toBe(false);
  });
  it("returns false for SQL injection attempt", () => {
    expect(isSafeId("'; DROP TABLE--")).toBe(false);
  });
  it("returns false for ID longer than 64 chars", () => {
    expect(isSafeId("a".repeat(65))).toBe(false);
  });
  it("returns true for 64 char ID", () => {
    expect(isSafeId("a".repeat(64))).toBe(true);
  });
  it("returns false for XSS attempt", () => {
    expect(isSafeId("<script>")).toBe(false);
  });
});
