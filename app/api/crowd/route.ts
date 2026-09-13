/**
 * GET /api/crowd — Get current crowd levels for all zones.
 * POST /api/crowd — Update crowd occupancy for a zone (organizer only).
 */

import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db/connection";
import { crowdCache } from "@/lib/utils/cache";
import { CACHE_TTL_CROWD } from "@/lib/constants";
import { timingSafeStringEqual } from "@/lib/utils/security";
import { checkRateLimit, getClientIp } from "@/lib/utils/rate-limit";

const CrowdUpdateSchema = z.object({
  zone: z.string().min(1).max(100),
  occupancy: z.number().int().min(0),
  adminKey: z.string().min(1).max(256),
});

/** GET /api/crowd */
export async function GET(): Promise<NextResponse> {
  const cached = crowdCache.get("all-zones");
  if (cached) {
    return NextResponse.json(cached, {
      headers: {
        "Cache-Control": "s-maxage=15, stale-while-revalidate=30",
        "X-Cache": "HIT",
      },
    });
  }

  try {
    const db = getDb();
    const zones = db
      .prepare("SELECT * FROM crowd_zones ORDER BY zone ASC")
      .all() as Record<string, unknown>[];

    const result = {
      zones,
      updatedAt: new Date().toISOString(),
    };

    crowdCache.set("all-zones", result, CACHE_TTL_CROWD);
    return NextResponse.json(result, {
      headers: { "Cache-Control": "s-maxage=15, stale-while-revalidate=30" },
    });
  } catch (err) {
    console.error("[crowd GET]", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Failed to fetch crowd data" }, { status: 500 });
  }
}

/** POST /api/crowd */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(request.headers);
  const rateCheck = checkRateLimit(`crowd-post:${ip}`, 30, 60_000);
  if (!rateCheck.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = CrowdUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { adminKey, zone, occupancy } = parsed.data;
  const expectedKey = process.env.ADMIN_KEY ?? "eventiq-dev-key";
  if (!timingSafeStringEqual(adminKey, expectedKey)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = getDb();
    db.prepare(
      "UPDATE crowd_zones SET occupancy = ?, updated_at = datetime('now') WHERE zone = ?"
    ).run(occupancy, zone);

    crowdCache.delete("all-zones");
    return NextResponse.json({ message: "Crowd updated", zone, occupancy });
  } catch (err) {
    console.error("[crowd POST]", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Failed to update crowd" }, { status: 500 });
  }
}
