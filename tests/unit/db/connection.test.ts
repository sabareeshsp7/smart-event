/**
 * Unit tests for SQLite database connection singleton.
 * RULE TST-3: Every lib/ module needs tests.
 * RULE TST-8: Use vi.mock() — no real filesystem writes.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// We test the connection module using a mock of better-sqlite3
vi.mock("better-sqlite3", () => {
  class Database {
    pragma = vi.fn();
    prepare = vi.fn().mockReturnValue({
      get: vi.fn().mockReturnValue({ c: 0, total: 0, "COUNT(*) as c": 0 }),
      run: vi.fn(),
      all: vi.fn().mockReturnValue([]),
    });
    exec = vi.fn();
    transaction = vi.fn().mockImplementation((fn: () => void) => fn);
    close = vi.fn();
  }
  return { default: Database };
});

vi.mock("fs", () => {
  const mockFs = {
    existsSync: vi.fn().mockReturnValue(true),
    mkdirSync: vi.fn(),
  };
  return {
    default: mockFs,
    ...mockFs
  };
});

describe("getDb", () => {
  beforeEach(() => {
    vi.resetModules();
    // Clear the global singleton
    global.__db = undefined;
  });

  afterEach(() => {
    global.__db = undefined;
    vi.resetModules();
  });

  it("returns a database instance", async () => {
    const { getDb } = await import("@/lib/db/connection");
    const db = getDb();
    expect(db).toBeDefined();
  });

  it("returns the same instance on repeated calls (singleton)", async () => {
    const { getDb } = await import("@/lib/db/connection");
    const db1 = getDb();
    const db2 = getDb();
    expect(db1).toBe(db2);
  });

  it("calls pragma for WAL mode and foreign keys", async () => {
    const { getDb } = await import("@/lib/db/connection");
    const db = getDb();
    expect(db.pragma).toHaveBeenCalledWith("journal_mode = WAL");
    expect(db.pragma).toHaveBeenCalledWith("foreign_keys = ON");
  });
});

describe("closeDb", () => {
  beforeEach(() => {
    vi.resetModules();
    global.__db = undefined;
  });

  it("closes the connection and clears singleton", async () => {
    const { getDb, closeDb } = await import("@/lib/db/connection");
    const db = getDb();
    expect(db).toBeDefined();
    expect(global.__db).toBeDefined();
    closeDb();
    expect(global.__db).toBeUndefined();
  });

  it("does not throw when called with no active connection", async () => {
    const { closeDb } = await import("@/lib/db/connection");
    global.__db = undefined;
    expect(() => closeDb()).not.toThrow();
  });
});
