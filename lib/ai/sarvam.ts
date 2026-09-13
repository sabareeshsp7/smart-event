/**
 * Sarvam AI client — Indian language TTS and STT.
 * RULE CQ-1: Kept under 250 lines.
 * RULE SEC-8: API key never exposed to client bundles.
 * Used in: /api/speech-tts and /api/speech-stt routes.
 */

import { SarvamAIClient } from "sarvamai";

/** Supported Sarvam AI TTS speaker codes. */
export const SARVAM_SPEAKERS = {
  "en-IN": "meera",
  "hi-IN": "amartya",
  "ta-IN": "pavithra",
  "te-IN": "arvind",
  "kn-IN": "amol",
  "ml-IN": "iniya",
  "bn-IN": "bani",
  "gu-IN": "diya",
  "mr-IN": "maya",
  "od-IN": "arjun",
} as const;

export type SarvamLanguageCode = keyof typeof SARVAM_SPEAKERS;

/** Sarvam client singleton or null if not configured. */
let sarvamClient: SarvamAIClient | null = null;
let initialized = false;

/**
 * Returns the Sarvam AI client, lazily initialized.
 * Returns null if SARVAM_API_KEY is not set.
 */
export function getSarvamClient(): SarvamAIClient | null {
  if (initialized) return sarvamClient;
  initialized = true;

  const apiKey = process.env.SARVAM_API_KEY;
  if (!apiKey) {
    console.warn("[Sarvam] API key not configured — voice features use browser fallback");
    return null;
  }

  // Disable rule for 'any' since sarvamai typescript types are messy
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sarvamClient = new (SarvamAIClient as any)({ apiSubscriptionKey: apiKey });
  return sarvamClient;
}

/** Resets the client for testing. */
export function resetSarvamClient(): void {
  sarvamClient = null;
  initialized = false;
}
