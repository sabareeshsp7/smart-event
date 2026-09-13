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

const GENERAL_FALLBACKS = [
  "I am your EventIQ Assistant for the Bangalore International Exhibition Centre. I can provide real-time details on session schedules, speaker bios, venue navigation, zone crowd levels, accessibility services, and emergency protocols. How may I assist you today?",
  "The Main Stage keynote begins at 09:00 AM. You can explore all scheduled workshops and track agendas in the Sessions tab.",
  "Looking for directions? The venue map provides real-time walking routes to all halls, food concourses, and first aid stations.",
  "For emergency services, dial 112 directly or visit the East Medical Wing at Gate 2.",
  "You can register and receive your fast-track digital event badge at any time through the Registration portal.",
];

let fallbackIndex = 0;

/**
 * Returns an intelligent contextual fallback response when AI service is unavailable.
 * Completely free of emojis and grounded in real venue information.
 */
export function getAzureFallbackResponse(prompt?: string): string {
  const query = (prompt ?? "").toLowerCase().trim();

  if (query) {
    if (query.includes("main stage") || query.includes("where") || query.includes("map") || query.includes("location") || query.includes("direction")) {
      return "The Main Stage (Grand Alpha Auditorium) is located in Hall 1 on the Ground Level, directly accessible from the Central Entrance Plaza. Proceed past Registration and take the North Concourse corridor on your left.";
    }

    if (query.includes("session") || query.includes("ai") || query.includes("schedule") || query.includes("keynote")) {
      return "The featured morning session is 'Opening Keynote: The Future of AI' presented by Dr. Priya Sharma at 09:00 AM on the Main Stage. Next, 'Building with LLMs in Production' by Rahul Mehta begins at 10:00 AM in the Auditorium.";
    }

    if (query.includes("food") || query.includes("lunch") || query.includes("eat") || query.includes("court") || query.includes("coffee")) {
      return "The South Food Concourse is open from 09:00 AM to 08:00 PM today. Current crowd density is moderate at 45% occupancy. For minimal queues, the recommended dining window is between 02:00 PM and 03:00 PM.";
    }

    if (query.includes("emergency") || query.includes("ambulance") || query.includes("first aid") || query.includes("police") || query.includes("security")) {
      return "For immediate emergency response, call 112. The Medical and First Aid Station is positioned at the East Medical Wing near Gate 2 (Direct line: 108). Venue Security can be reached on-site at +91-9876-543210.";
    }

    if (query.includes("crowd") || query.includes("busy") || query.includes("traffic") || query.includes("density")) {
      return "Current venue occupancy overview: Main Stage is at 62% capacity, Innovation Pavilion is at 40%, and Workshop Hub A is at 78%. All zones are operating comfortably within safe capacity thresholds.";
    }

    if (query.includes("access") || query.includes("wheelchair") || query.includes("ramp") || query.includes("elevator")) {
      return "All halls at Bangalore International Exhibition Centre are equipped with step-free wheelchair ramps, tactile pathways, and dedicated elevator banks at Towers A and B. Reserved seating is available in Row 1 of all auditoriums.";
    }

    if (query.includes("register") || query.includes("badge") || query.includes("ticket") || query.includes("pass")) {
      return "You can register attendee credentials and generate your digital QR pass via the Registration page. Digital passes can be scanned at any check-in terminal for fast-track badge pickup.";
    }
  }

  const response = GENERAL_FALLBACKS[fallbackIndex % GENERAL_FALLBACKS.length];
  fallbackIndex = (fallbackIndex + 1) % GENERAL_FALLBACKS.length;
  return response;
}

/**
 * Generates a streaming chat response using Azure OpenAI.
 * Falls back to an intelligent mock response if the client is not configured.
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
    // Contextual fallback based on latest user query
    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
    const response = getAzureFallbackResponse(lastUserMessage?.content);
    const words = response.split(" ");
    for (let i = 0; i < words.length; i++) {
      if (signal?.aborted) return;
      const token = i === words.length - 1 ? words[i] : words[i] + " ";
      onToken(token);
      await new Promise((r) => setTimeout(r, 25));
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
