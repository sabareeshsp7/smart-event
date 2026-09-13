/**
 * Rate limiting utility using in-memory sliding window algorithm.
 * RULE SEC-5: Rate limiting must cover all routes that call external AI APIs.
 */

import {
  RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX_REQUESTS,
} from "../constants";

/** Initializes the rate limit store if it doesn't exist. */
function getStore(): Map<string, { count: number; resetAt: number }> {
  if (!global.rateLimitStore) {
    global.rateLimitStore = new Map();
  }
  return global.rateLimitStore;
}

/** Result of a rate limit check. */
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Checks if a given identifier (IP, user ID) is within the rate limit.
 * @param identifier - Unique identifier for the requester
 * @param maxRequests - Maximum requests allowed in the window (default: RATE_LIMIT_MAX_REQUESTS)
 * @param windowMs - Time window in milliseconds (default: RATE_LIMIT_WINDOW_MS)
 * @returns RateLimitResult with allowed status and remaining count
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number = RATE_LIMIT_MAX_REQUESTS,
  windowMs: number = RATE_LIMIT_WINDOW_MS
): RateLimitResult {
  const store = getStore();
  const now = Date.now();
  const existing = store.get(identifier);

  if (!existing || now > existing.resetAt) {
    const resetAt = now + windowMs;
    store.set(identifier, { count: 1, resetAt });
    return { allowed: true, remaining: maxRequests - 1, resetAt };
  }

  if (existing.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: maxRequests - existing.count,
    resetAt: existing.resetAt,
  };
}

/**
 * Gets the client IP address from request headers.
 * @param headers - Request headers object
 * @returns IP address string or 'unknown'
 */
export function getClientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headers.get("x-real-ip") ??
    "unknown"
  );
}
