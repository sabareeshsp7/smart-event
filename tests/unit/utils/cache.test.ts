import { describe, it, expect, beforeEach } from "vitest";
import { TtlCache } from "@/lib/utils/cache";

describe("TtlCache", () => {
  let cache: TtlCache<string>;

  beforeEach(() => {
    cache = new TtlCache<string>();
  });

  it("stores and retrieves a value", () => {
    cache.set("key1", "value1", 60_000);
    expect(cache.get("key1")).toBe("value1");
  });

  it("returns undefined for missing key", () => {
    expect(cache.get("nonexistent")).toBeUndefined();
  });

  it("returns undefined for expired entry", async () => {
    cache.set("key1", "value1", 1);
    await new Promise((r) => setTimeout(r, 10));
    expect(cache.get("key1")).toBeUndefined();
  });

  it("returns value for non-expired entry", async () => {
    cache.set("key1", "value1", 60_000);
    await new Promise((r) => setTimeout(r, 10));
    expect(cache.get("key1")).toBe("value1");
  });

  it("deletes a key", () => {
    cache.set("key1", "value1", 60_000);
    cache.delete("key1");
    expect(cache.get("key1")).toBeUndefined();
  });

  it("clears all keys", () => {
    cache.set("a", "1", 60_000);
    cache.set("b", "2", 60_000);
    cache.clear();
    expect(cache.get("a")).toBeUndefined();
    expect(cache.get("b")).toBeUndefined();
  });

  it("overwrites existing key", () => {
    cache.set("key1", "v1", 60_000);
    cache.set("key1", "v2", 60_000);
    expect(cache.get("key1")).toBe("v2");
  });

  it("size returns correct count", () => {
    cache.set("a", "1", 60_000);
    cache.set("b", "2", 60_000);
    expect(cache.size()).toBe(2);
  });

  it("size excludes expired entries", async () => {
    cache.set("a", "1", 1);
    cache.set("b", "2", 60_000);
    await new Promise((r) => setTimeout(r, 10));
    cache.get("a"); // trigger cleanup
    expect(cache.size()).toBeLessThanOrEqual(1);
  });

  it("handles different value types", () => {
    const numCache = new TtlCache<number>();
    numCache.set("n", 42, 60_000);
    expect(numCache.get("n")).toBe(42);
  });

  it("handles object values", () => {
    const objCache = new TtlCache<{ name: string }>();
    objCache.set("obj", { name: "test" }, 60_000);
    expect(objCache.get("obj")).toEqual({ name: "test" });
  });
});
