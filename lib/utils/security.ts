/**
 * Security utilities — timing-safe comparisons and input sanitization.
 * RULE SEC-4: Use crypto.timingSafeEqual for all secret key comparisons.
 */

import { createHash, timingSafeEqual } from "crypto";

/**
 * Compares two strings in constant time to prevent timing attacks.
 * @param a - The first string (e.g., provided secret)
 * @param b - The second string (e.g., stored secret)
 * @returns true if strings are equal, false otherwise
 */
export function timingSafeStringEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(createHash("sha256").update(a).digest("hex"));
  const bufB = Buffer.from(createHash("sha256").update(b).digest("hex"));
  try {
    return timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

/**
 * Sanitizes a string for safe HTML rendering (prevents XSS).
 * @param input - Raw user input string
 * @returns Sanitized string
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Validates that a string is a safe alphanumeric ID (prevents injection).
 * @param id - The ID string to validate
 * @returns true if the ID is safe
 */
export function isSafeId(id: string): boolean {
  return /^[a-zA-Z0-9_-]{1,64}$/.test(id);
}

/**
 * Strips any keys not defined in the allowlist from an object.
 * @param obj - The input object
 * @param allowedKeys - Array of permitted keys
 */
export function filterKeys<T extends Record<string, unknown>>(
  obj: T,
  allowedKeys: (keyof T)[]
): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([k]) => allowedKeys.includes(k as keyof T))
  ) as Partial<T>;
}
