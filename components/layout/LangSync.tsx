"use client";
/**
 * LangSync component — synchronizes document lang attribute.
 * RULE A11Y-2: Dynamic lang attribute update on language switch.
 */
import { useEffect } from "react";

export function LangSync({ lang = "en" }: { lang?: string }) {
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  return null;
}
