import { type NextRequest } from "next/server";
import { ChatRequestSchema } from "@/lib/validations/recommendations";
import { azureStreamChat, type ChatMessage } from "@/lib/ai/azure-helpers";
import { checkRateLimit, getClientIp } from "@/lib/utils/rate-limit";
import { getDb } from "@/lib/db/connection";
import { VENUE_NAME, VENUE_ADDRESS, EMERGENCY_CONTACTS } from "@/lib/constants";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Fetches real-time database snapshot for AI grounding. */
function getLiveDatabaseContext(): string {
  try {
    const db = getDb();
    const sessions = db.prepare(
      "SELECT title, speaker, zone, category, start_time, end_time, capacity, registered FROM sessions ORDER BY start_time ASC LIMIT 15"
    ).all() as Array<{
      title: string;
      speaker: string;
      zone: string;
      category: string;
      start_time: string;
      end_time: string;
      capacity: number;
      registered: number;
    }>;

    const crowd = db.prepare(
      "SELECT zone, occupancy, capacity FROM crowd_zones ORDER BY occupancy DESC LIMIT 10"
    ).all() as Array<{ zone: string; occupancy: number; capacity: number }>;

    const alerts = db.prepare(
      "SELECT title, message, severity, zone FROM alerts WHERE is_active = 1"
    ).all() as Array<{ title: string; message: string; severity: string; zone: string }>;

    const sessionList = sessions
      .map(
        (s) =>
          `- "${s.title}" (${s.category}) by ${s.speaker} | Hall: ${s.zone} | Time: ${s.start_time.split("T")[1]?.slice(0, 5) ?? s.start_time} - ${s.end_time.split("T")[1]?.slice(0, 5) ?? s.end_time} | Reg: ${s.registered}/${s.capacity}`
      )
      .join("\n");

    const crowdList = crowd
      .map(
        (c) =>
          `- ${c.zone}: ${c.occupancy}/${c.capacity} attendees (${Math.round((c.occupancy / (c.capacity || 1)) * 100)}% full)`
      )
      .join("\n");

    const alertList = alerts
      .map((a) => `- [${a.severity.toUpperCase()}] ${a.title}: ${a.message} (Zone: ${a.zone})`)
      .join("\n");

    return `LIVE DATABASE CONTEXT:
VENUE: ${VENUE_NAME}
ADDRESS: ${VENUE_ADDRESS}

SCHEDULED SESSIONS:
${sessionList || "No sessions found."}

LIVE CROWD TELEMETRY:
${crowdList || "Normal occupancy across all pavilions."}

ACTIVE SAFETY ADVISORIES:
${alertList || "No critical advisories."}

EMERGENCY CONTACTS:
${EMERGENCY_CONTACTS.map((c) => `- ${c.label}: ${c.number}`).join("\n")}`;
  } catch {
    return `VENUE: ${VENUE_NAME}, ${VENUE_ADDRESS}.`;
  }
}

/** POST /api/chat — Returns SSE stream */
export async function POST(request: NextRequest): Promise<Response> {
  const ip = getClientIp(request.headers);
  const rateCheck = checkRateLimit(`chat:${ip}`, 15, 60_000);

  if (!rateCheck.allowed) {
    return new Response("data: [RATE_LIMITED]\n\n", {
      status: 429,
      headers: { "Content-Type": "text/event-stream" },
    });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response("data: [INVALID_JSON]\n\n", {
      status: 400,
      headers: { "Content-Type": "text/event-stream" },
    });
  }

  const parsed = ChatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return new Response("data: [VALIDATION_ERROR]\n\n", {
      status: 400,
      headers: { "Content-Type": "text/event-stream" },
    });
  }

  const { messages } = parsed.data;
  const dbContext = getLiveDatabaseContext();
  const systemPrompt = `You are EventIQ Concierge, an AI assistant for ${VENUE_NAME} (${VENUE_ADDRESS}).
You are grounded in the live event database and real-time telemetry.

RULES:
1. Base all answers strictly on the verified database context below.
2. Provide exact session titles, presenter names, BIEC hall names, and start times.
3. Provide exact live crowd numbers and percentages when asked about congestion, food courts, or zone traffic.
4. For directions, guide attendees between Gate A Turnstiles, Hall 1 (Grand Alpha Stage), Hall 2 (Beta Auditorium), Hall 3 (Workshop Hall A), Hall 4 (Workshop Hall B), Innovation Hub (Central Atrium), and South Food Concourse.
5. In emergencies, advise calling 112 or visiting the East Medical Wing at Gate 2.
6. ZERO EMOJIS: Do not output any emojis under any circumstance.

${dbContext}`;

  const userMessages = messages.filter((m) => m.role !== "system");
  const enrichedMessages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    ...userMessages,
  ];

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const abortController = new AbortController();

      try {
        await azureStreamChat(
          enrichedMessages,
          (token: string) => {
            // Escape token for SSE
            const escaped = token.replace(/\n/g, "\\n");
            controller.enqueue(encoder.encode(`data: ${escaped}\n\n`));
          },
          abortController.signal
        );

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        console.error("[chat SSE]", msg);
        controller.enqueue(encoder.encode("data: [ERROR]\n\n"));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
