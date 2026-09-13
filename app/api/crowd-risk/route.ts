/**
 * POST /api/crowd-risk — Gemini-powered crowd risk assessment (Feature 2).
 * RULE GS-1: Gemini used for ≥2 distinct features.
 */

import { type NextRequest, NextResponse } from "next/server";
import { CrowdRiskSchema } from "@/lib/validations/recommendations";
import { geminiAssessCrowdRisk } from "@/lib/ai/gemini-helpers";
import { aiResponseCache } from "@/lib/utils/cache";
import { CACHE_TTL_CROWD } from "@/lib/constants";
import { checkRateLimit, getClientIp } from "@/lib/utils/rate-limit";

/** POST /api/crowd-risk */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(request.headers);
  const rateCheck = checkRateLimit(`crowd-risk:${ip}`, 10, 60_000);
  if (!rateCheck.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = CrowdRiskSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { zones } = parsed.data;
  const cacheKey = `crowd-risk:${zones.map((z) => `${z.zone}:${z.occupancy}`).join("|")}`;
  const cached = aiResponseCache.get(cacheKey);
  if (cached) return NextResponse.json(JSON.parse(cached));

  try {
    const result = await geminiAssessCrowdRisk(zones);
    aiResponseCache.set(cacheKey, JSON.stringify(result), CACHE_TTL_CROWD);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[crowd-risk POST]", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Failed to assess crowd risk" }, { status: 500 });
  }
}
