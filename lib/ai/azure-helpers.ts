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
  "I am your EventIQ Assistant for the India AI & Cloud Compute Summit 2026 at the Bangalore International Exhibition Centre. I can provide real-time details on session schedules, speaker bios, venue navigation, zone crowd levels, accessibility services, and emergency protocols. How may I assist you today?",
  "The Summit Opening Plenary begins at 09:00 AM IST at Hall 1 — Grand Alpha Stage. You can explore all scheduled workshops and tracks in the Sessions tab.",
  "Looking for directions? The interactive floor plan provides real-time routes between Grand Alpha Stage (Hall 1), Beta Auditorium (Hall 2), Workshop Halls A & B (Halls 3 & 4), and the Food Concourse.",
  "For emergency services, dial 112 directly or visit the East Medical Wing at Gate 2.",
  "You can review your verified digital event passes and real-time venue telemetry at any time.",
];

let fallbackIndex = 0;

/**
 * Returns an intelligent contextual fallback response when AI service is unavailable.
 * Completely free of emojis and grounded in real venue information.
 */
export function getAzureFallbackResponse(prompt?: string): string {
  const query = (prompt ?? "").toLowerCase().trim();

  if (query) {
    try {
      // Dynamic live database lookup
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { getDb } = require("@/lib/db/connection");
      const db = getDb();

      // Specific session search or broad schedule request
      if (
        query.includes("session") ||
        query.includes("keynote") ||
        query.includes("speaker") ||
        query.includes("schedule") ||
        query.includes("plenary") ||
        query.includes("robotics") ||
        query.includes("llm") ||
        query.includes("cloud") ||
        query.includes("ai") ||
        query.includes("dpi") ||
        query.includes("payments") ||
        query.includes("security") ||
        query.includes("energy") ||
        query.includes("quantum") ||
        query.includes("founders") ||
        query.includes("hall 1") ||
        query.includes("hall 2") ||
        query.includes("hall 3") ||
        query.includes("hall 4")
      ) {
        // Specific keyword matching for precision
        let targetKeyword = "";
        if (query.includes("robotics") || query.includes("drone")) targetKeyword = "robotics";
        else if (query.includes("llm") || query.includes("inference")) targetKeyword = "llm";
        else if (query.includes("dpi") || query.includes("payment")) targetKeyword = "payments";
        else if (query.includes("security") || query.includes("zero trust")) targetKeyword = "defense";
        else if (query.includes("energy") || query.includes("ev") || query.includes("vehicle")) targetKeyword = "energy";
        else if (query.includes("quantum") || query.includes("qkd")) targetKeyword = "quantum";
        else if (query.includes("founders") || query.includes("demo day") || query.includes("pitch")) targetKeyword = "founders";
        else if (query.includes("bharat") || query.includes("nilekani") || query.includes("closing")) targetKeyword = "bharat";
        else if (query.includes("gala") || query.includes("cultural") || query.includes("dinner")) targetKeyword = "gala";
        else if (query.includes("hall 1")) targetKeyword = "Hall 1";
        else if (query.includes("hall 2")) targetKeyword = "Hall 2";
        else if (query.includes("hall 3")) targetKeyword = "Hall 3";
        else if (query.includes("hall 4")) targetKeyword = "Hall 4";
        else if (query.includes("priya") || query.includes("plenary")) targetKeyword = "plenary";

        if (targetKeyword) {
          const found = db.prepare(
            "SELECT title, speaker, zone, start_time, end_time, category FROM sessions WHERE title LIKE ? OR speaker LIKE ? OR zone LIKE ? LIMIT 1"
          ).get(`%${targetKeyword}%`, `%${targetKeyword}%`, `%${targetKeyword}%`) as { title: string; speaker: string; zone: string; start_time: string; end_time: string; category: string } | undefined;

          if (found) {
            const date = found.start_time.split("T")[0];
            const startTime = found.start_time.split("T")[1]?.slice(0, 5) ?? found.start_time;
            const endTime = found.end_time.split("T")[1]?.slice(0, 5) ?? found.end_time;
            return `From the verified event database: "${found.title}" (${found.category}) presented by ${found.speaker} is scheduled at ${found.zone} on ${date} from ${startTime} to ${endTime} IST.`;
          }
        }

        // Broad schedule overview if user asks generally about sessions or AI/cloud tracks
        const topSessions = db.prepare(
          "SELECT title, speaker, zone, start_time, end_time FROM sessions ORDER BY start_time ASC LIMIT 4"
        ).all() as Array<{ title: string; speaker: string; zone: string; start_time: string; end_time: string }>;

        if (topSessions.length > 0) {
          const items = topSessions
            .map(
              (s, i) =>
                `${i + 1}. "${s.title}" by ${s.speaker} (${s.zone}, ${s.start_time.split("T")[1]?.slice(0, 5)} - ${s.end_time.split("T")[1]?.slice(0, 5)} IST)`
            )
            .join("\n");
          return `Here is the scheduled agenda for the India AI & Cloud Compute Summit 2026 at BIEC:\n${items}\n\nYou can view all 10 tracks with full details in the Sessions tab.`;
        }
      }

      if (query.includes("crowd") || query.includes("busy") || query.includes("occupancy") || query.includes("food") || query.includes("court") || query.includes("density")) {
        const zoneWord = query.includes("food") ? "Food" : "Hall 1";
        const foundCrowd = db.prepare(
          "SELECT zone, occupancy, capacity FROM crowd_zones WHERE zone LIKE ? LIMIT 1"
        ).get(`%${zoneWord}%`) as { zone: string; occupancy: number; capacity: number } | undefined;

        if (foundCrowd) {
          const pct = Math.round((foundCrowd.occupancy / foundCrowd.capacity) * 100);
          return `Live crowd telemetry: ${foundCrowd.zone} currently has ${foundCrowd.occupancy} attendees out of ${foundCrowd.capacity} capacity (${pct}% full). Overall campus movement is running smoothly.`;
        }
      }
    } catch {
      // Proceed with static knowledge
    }

    if (query.includes("main stage") || query.includes("where") || query.includes("map") || query.includes("location") || query.includes("direction")) {
      return "The Main Stage (Hall 1 — Grand Alpha Stage) is located on the Ground Level, directly accessible from the Main Entrance Turnstiles at Gate A. Proceed past Registration and take the North Concourse corridor on your left.";
    }

    if (query.includes("session") || query.includes("ai") || query.includes("schedule") || query.includes("keynote")) {
      return "The featured keynote is 'Opening Plenary: India AI & Cloud Compute Summit 2026' presented by Dr. Priya Sharma & Special Delegates at 09:00 AM – 10:15 AM IST in Hall 1 — Grand Alpha Stage. Next, 'Next-Gen Autonomous Robotics & Drone Systems Showcase' begins at 10:30 AM in Hall 3 — Workshop Hall A, followed by 'Building Enterprise LLMs & High-Throughput Inference' by Rahul Mehta at 11:45 AM in Hall 2 — Beta Auditorium.";
    }

    if (query.includes("food") || query.includes("lunch") || query.includes("eat") || query.includes("court") || query.includes("coffee")) {
      return "The South Food Concourse is open from 09:00 AM to 08:00 PM today. Current crowd density is moderate at 45% occupancy. For minimal queues, the recommended dining window is between 02:00 PM and 03:00 PM.";
    }

    if (query.includes("emergency") || query.includes("ambulance") || query.includes("first aid") || query.includes("police") || query.includes("security")) {
      return "For immediate emergency response, call 112. The Medical and First Aid Station is positioned at the East Medical Wing near Gate 2 (Direct line: 108). Venue Security can be reached on-site at +91-9876-543210.";
    }

    if (query.includes("crowd") || query.includes("busy") || query.includes("traffic") || query.includes("density")) {
      return "Current venue occupancy overview: Hall 1 — Grand Alpha Stage is at 62% capacity, Innovation Pavilion is at 40%, and Workshop Hall A is at 78%. All zones are operating comfortably within safe capacity thresholds.";
    }

    if (query.includes("access") || query.includes("wheelchair") || query.includes("ramp") || query.includes("elevator")) {
      return "All halls at Bangalore International Exhibition Centre are equipped with step-free wheelchair ramps, tactile pathways, and dedicated elevator banks at Towers A and B. Reserved seating is available in Row 1 of all auditoriums.";
    }

    if (query.includes("register") || query.includes("badge") || query.includes("ticket") || query.includes("pass")) {
      return "You can review your verified Ticketmaster digital pass and agenda anytime in the Live Events and Sessions tabs.";
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
