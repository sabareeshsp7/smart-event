/**
 * POST /api/chat — SSE streaming AI chat endpoint.
 * RULE EFF-1: All AI chat must use SSE streaming.
 * RULE SEC-1: Zod validation on all routes.
 * RULE SEC-5: Rate limiting on AI routes.
 */

import { type NextRequest } from "next/server";
import { ChatRequestSchema } from "@/lib/validations/recommendations";
import { azureStreamChat } from "@/lib/ai/azure-helpers";
import { checkRateLimit, getClientIp } from "@/lib/utils/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const abortController = new AbortController();

      try {
        await azureStreamChat(
          messages,
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
