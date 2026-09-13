/**
 * POST /api/summary — Gemini-powered session summary (Feature 1).
 * RULE GS-1: Gemini used for ≥2 distinct features.
 * RULE GS-2: "Powered by Google Gemini" badge on every page that uses Gemini.
 */

import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db/connection";
import { geminiSummarizeSession } from "@/lib/ai/gemini-helpers";
import { aiResponseCache } from "@/lib/utils/cache";
import { CACHE_TTL_AI } from "@/lib/constants";
import { checkRateLimit, getClientIp } from "@/lib/utils/rate-limit";

const SummarySchema = z.object({
  sessionId: z.string().min(1).max(64),
});

/** POST /api/summary */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(request.headers);
  const rateCheck = checkRateLimit(`summary:${ip}`, 10, 60_000);
  if (!rateCheck.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = SummarySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { sessionId } = parsed.data;
  const cacheKey = `summary:${sessionId}`;
  const cached = aiResponseCache.get(cacheKey);
  if (cached) return NextResponse.json(JSON.parse(cached));

  try {
    const db = getDb();
    const session = db.prepare("SELECT * FROM sessions WHERE id = ?").get(sessionId) as Record<string, unknown> | undefined;

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const result = await geminiSummarizeSession({
      title: session.title as string,
      speaker: session.speaker as string,
      description: session.description as string,
      category: session.category as string,
      tags: JSON.parse((session.tags as string) || "[]") as string[],
    });

    aiResponseCache.set(cacheKey, JSON.stringify(result), CACHE_TTL_AI);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[summary POST]", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 });
  }
}
