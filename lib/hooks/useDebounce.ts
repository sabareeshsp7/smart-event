"use client";
/**
 * useDebounce hook — throttles expensive API calls.
 * RULE EFF-10: Use useDebounce on any input that triggers API calls.
 */

import { useState, useEffect } from "react";
import { DEBOUNCE_SEARCH_MS } from "../constants";

/**
 * Returns a debounced version of the input value.
 * @param value - The value to debounce
 * @param delayMs - Debounce delay in milliseconds (default: DEBOUNCE_SEARCH_MS)
 * @returns Debounced value
 */
export function useDebounce<T>(value: T, delayMs: number = DEBOUNCE_SEARCH_MS): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delayMs]);

  return debouncedValue;
}
