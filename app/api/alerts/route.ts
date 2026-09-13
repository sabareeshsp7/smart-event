/**
 * GET /api/alerts — List active alerts.
 * POST /api/alerts — Create a new alert (organizer only, admin key required).
 * RULE SEC-1: Zod validation on all routes.
 * RULE SEC-4: crypto.timingSafeEqual for admin key comparison.
 */

import { type NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/connection";
import { CreateAlertSchema } from "@/lib/validations/alerts";
import { timingSafeStringEqual } from "@/lib/utils/security";
import { checkRateLimit, getClientIp } from "@/lib/utils/rate-limit";

/** GET /api/alerts */
export async function GET(): Promise<NextResponse> {
  try {
    const db = getDb();
    const alerts = db
      .prepare("SELECT * FROM alerts WHERE is_active = 1 ORDER BY created_at DESC LIMIT 20")
      .all() as Record<string, unknown>[];

    return NextResponse.json(
      { alerts: alerts.map((a) => ({ ...a, isActive: Boolean(a.is_active) })) },
      { headers: { "Cache-Control": "s-maxage=10, stale-while-revalidate=30" } }
    );
  } catch (err) {
    console.error("[alerts GET]", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 });
  }
}

/** POST /api/alerts */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(request.headers);
  const rateCheck = checkRateLimit(`alerts-post:${ip}`, 10, 60_000);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rateCheck.resetAt - Date.now()) / 1000)) } }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // RULE SEC-1 & CQ-6: Zod parse instead of type cast
  const parsed = CreateAlertSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { adminKey, ...alertData } = parsed.data;
  const expectedKey = process.env.ADMIN_KEY ?? "eventiq-dev-key";

  // RULE SEC-4: Timing-safe comparison
  if (!timingSafeStringEqual(adminKey, expectedKey)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = getDb();
    const id = `a-${Date.now()}`;
    db.prepare(
      "INSERT INTO alerts (id, title, message, severity, zone) VALUES (?, ?, ?, ?, ?)"
    ).run(id, alertData.title, alertData.message, alertData.severity, alertData.zone);

    return NextResponse.json({ id, message: "Alert created" }, { status: 201 });
  } catch (err) {
    console.error("[alerts POST]", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Failed to create alert" }, { status: 500 });
  }
}
