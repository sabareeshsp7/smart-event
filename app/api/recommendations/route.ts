/**
 * POST /api/recommendations — AI-powered session recommendations.
 * Falls back to local algorithm if AI is unavailable.
 */

import { type NextRequest, NextResponse } from "next/server";
import { RecommendationSchema } from "@/lib/validations/recommendations";
import { getLocalRecommendations } from "@/lib/utils/recommendations";
import { azureRecommendSessions } from "@/lib/ai/azure-helpers";
import { getDb } from "@/lib/db/connection";
import { aiResponseCache } from "@/lib/utils/cache";
import { CACHE_TTL_AI } from "@/lib/constants";
import { checkRateLimit, getClientIp } from "@/lib/utils/rate-limit";

/** POST /api/recommendations */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(request.headers);
  const rateCheck = checkRateLimit(`recs:${ip}`, 10, 60_000);
  if (!rateCheck.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = RecommendationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { interests, limit } = parsed.data;
  const cacheKey = `recs:${interests.sort().join(",")}:${limit}`;
  const cached = aiResponseCache.get(cacheKey);
  if (cached) {
    return NextResponse.json(JSON.parse(cached));
  }

  try {
    const db = getDb();
    const rows = db.prepare("SELECT * FROM sessions ORDER BY is_featured DESC").all() as Record<string, unknown>[];
    const sessions = rows.map((r) => ({
      id: r.id as string,
      title: r.title as string,
      speaker: r.speaker as string,
      zone: r.zone as string,
      category: r.category as string,
      startTime: r.start_time as string,
      tags: JSON.parse((r.tags as string) || "[]") as string[],
      registered: r.registered as number,
      capacity: r.capacity as number,
    }));

    const localRecs = getLocalRecommendations(sessions, interests, limit);

    // Enhance with AI context (non-blocking, best-effort)
    const [aiInsight] = await Promise.all([
      azureRecommendSessions(interests, sessions.map((s) => s.title)),
    ]);

    const result = {
      recommendations: localRecs,
      aiInsight: aiInsight ?? null,
      interests,
      poweredByAI: Boolean(aiInsight),
    };

    aiResponseCache.set(cacheKey, JSON.stringify(result), CACHE_TTL_AI);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[recommendations POST]", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Failed to get recommendations" }, { status: 500 });
  }
}
