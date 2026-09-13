/**
 * In-memory TTL cache for AI responses and expensive computations.
 * RULE EFF-2: Cache all AI-generated JSON with TTL.
 * RULE EFF-9: Never make duplicate AI API calls — always check cache first.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

/** Generic in-memory TTL cache with type safety. */
export class TtlCache<T> {
  private readonly store = new Map<string, CacheEntry<T>>();

  /**
   * Gets a value from cache if it exists and hasn't expired.
   * @param key - Cache key
   * @returns The cached value or undefined
   */
  get(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  /**
   * Sets a value in cache with a TTL.
   * @param key - Cache key
   * @param value - Value to cache
   * @param ttlMs - Time-to-live in milliseconds
   */
  set(key: string, value: T, ttlMs: number): void {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  /** Removes a specific key from cache. */
  delete(key: string): void {
    this.store.delete(key);
  }

  /** Clears all entries from cache. */
  clear(): void {
    this.store.clear();
  }

  /** Returns the number of non-expired entries in cache. */
  size(): number {
    let count = 0;
    const now = Date.now();
    for (const entry of this.store.values()) {
      if (now <= entry.expiresAt) count++;
    }
    return count;
  }
}

// Singleton caches for different data types
export const aiResponseCache = new TtlCache<string>();
export const sessionCache = new TtlCache<unknown>();
export const crowdCache = new TtlCache<unknown>();
