/**
 * Azure OpenAI client initialization (server-side only).
 * RULE SEC-8: All env vars that are secret must NEVER appear in client-side bundles.
 * Keyless fallback: returns null if env vars are missing — app continues with mock data.
 */

import OpenAI from "openai";

/** Azure OpenAI client instance or null if not configured. */
let azureClient: OpenAI | null = null;
let initialized = false;

/**
 * Returns the Azure OpenAI client, lazily initialized.
 * Returns null if AZURE_OPENAI_API_KEY or AZURE_OPENAI_ENDPOINT is not set.
 */
export function getAzureClient(): OpenAI | null {
  if (initialized) return azureClient;
  initialized = true;

  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;

  if (!apiKey || !endpoint) {
    console.warn("[Azure] API key or endpoint not configured — using fallback mode");
    azureClient = null;
    return null;
  }

  azureClient = new OpenAI({
    apiKey,
    baseURL: endpoint,
  });

  return azureClient;
}

/** Resets the client for testing purposes. */
export function resetAzureClient(): void {
  azureClient = null;
  initialized = false;
}
