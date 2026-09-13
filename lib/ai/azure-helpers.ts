/**
 * Azure OpenAI helper functions for streaming chat and JSON generation.
 * Extracted from azure.ts to keep each file ≤ 250 lines (RULE CQ-1).
 */

import { getAzureClient } from "./azure";
import { AZURE_MODEL } from "../constants";

/** A single chat message. */
export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/** Fallback responses for when AI is unavailable. */
const FALLBACK_RESPONSES = [
  "I'm here to help you navigate EventIQ! You can ask me about sessions, crowd levels, the schedule, or accessibility options.",
  "Great question! The Main Stage keynote starts at 9:00 AM. Would you like details on other sessions?",
  "For emergency assistance, please call 112 or visit the First Aid Station near the Main Entrance.",
  "The Food Court is open 9 AM – 8 PM today. Current crowd level: Moderate. Best time to visit: 2–3 PM.",
  "I can help you find sessions matching your interests! Tell me what topics you're passionate about.",
];

let fallbackIndex = 0;

/**
 * Returns a deterministic fallback response when AI is unavailable.
 * @returns A fallback response string
 */
export function getAzureFallbackResponse(): string {
  const response = FALLBACK_RESPONSES[fallbackIndex % FALLBACK_RESPONSES.length];
  fallbackIndex = (fallbackIndex + 1) % FALLBACK_RESPONSES.length;
  return response;
}

/**
 * Generates a streaming chat response using Azure OpenAI.
 * Falls back to a mock response if the client is not configured.
 * @param messages - Array of chat messages
 * @param onToken - Callback called for each streaming token
 * @param signal - AbortController signal to cancel the request
 */
export async function azureStreamChat(
  messages: ChatMessage[],
  onToken: (token: string) => void,
  signal?: AbortSignal
): Promise<void> {
  const client = getAzureClient();

  if (!client) {
    // Fallback: simulate streaming with mock response
    const response = getAzureFallbackResponse();
    const words = response.split(" ");
    for (const word of words) {
      if (signal?.aborted) return;
      onToken(word + " ");
      await new Promise((r) => setTimeout(r, 50));
    }
    return;
  }

  const stream = await client.chat.completions.create(
    {
      model: AZURE_MODEL,
      messages,
      stream: true,
      temperature: 0.7,
      max_tokens: 500,
    },
    { signal }
  );

  for await (const chunk of stream) {
    if (signal?.aborted) break;
    const token = chunk.choices[0]?.delta?.content;
    if (token) onToken(token);
  }
}

/**
 * Generates a structured JSON response using Azure OpenAI.
 * Falls back to null if the client is not configured.
 * @param systemPrompt - System instruction
 * @param userPrompt - User prompt
 * @returns Parsed JSON object or null on failure/fallback
 */
export async function azureGenerateJSON<T>(
  systemPrompt: string,
  userPrompt: string
): Promise<T | null> {
  const client = getAzureClient();
  if (!client) return null;

  try {
    const response = await client.chat.completions.create({
      model: AZURE_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return null;
    return JSON.parse(content) as T;
  } catch (err) {
    console.error("[Azure] JSON generation failed:", err instanceof Error ? err.message : "Unknown error");
    return null;
  }
}

/**
 * Generates AI-powered session recommendations using Azure OpenAI.
 * @param interests - User interest tags
 * @param sessionTitles - Available session titles for context
 * @returns Recommendation text or null
 */
export async function azureRecommendSessions(
  interests: string[],
  sessionTitles: string[]
): Promise<string | null> {
  const client = getAzureClient();
  if (!client) return null;

  try {
    const response = await client.chat.completions.create({
      model: AZURE_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are an event assistant helping attendees find the best sessions. Respond with a concise, enthusiastic 2-3 sentence recommendation.",
        },
        {
          role: "user",
          content: `My interests are: ${interests.join(", ")}. Available sessions: ${sessionTitles.slice(0, 10).join("; ")}. Which should I prioritize and why?`,
        },
      ],
      temperature: 0.7,
      max_tokens: 200,
    });
    return response.choices[0]?.message?.content ?? null;
  } catch (err) {
    console.error("[Azure] Recommendation failed:", err instanceof Error ? err.message : "Unknown error");
    return null;
  }
}
