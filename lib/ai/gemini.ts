/**
 * Google Gemini AI client — used for 2 distinct features:
 * 1. Session Summary (text generation)
 * 2. Crowd Risk Scoring (structured JSON output with responseSchema)
 * RULE GS-1: Google Gemini must be used for ≥2 distinct features.
 * RULE GS-6: Use the official @google/generative-ai SDK.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_MODEL } from "../constants";

/** Gemini client instance or null if not configured. */
let geminiClient: GoogleGenerativeAI | null = null;
let initialized = false;

/**
 * Returns the Gemini client, lazily initialized.
 * Returns null if GEMINI_API_KEY is not set.
 */
export function getGeminiClient(): GoogleGenerativeAI | null {
  if (initialized) return geminiClient;
  initialized = true;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("[Gemini] API key not configured — using fallback mode");
    geminiClient = null;
    return null;
  }

  geminiClient = new GoogleGenerativeAI(apiKey);
  return geminiClient;
}

/**
 * Returns a Gemini GenerativeModel instance for a given task.
 * @param modelName - Optional model name override
 * @returns GenerativeModel or null
 */
export function getGeminiModel(modelName: string = GEMINI_MODEL) {
  const client = getGeminiClient();
  if (!client) return null;
  return client.getGenerativeModel({ model: modelName });
}

/** Resets the client for testing purposes. */
export function resetGeminiClient(): void {
  geminiClient = null;
  initialized = false;
}
