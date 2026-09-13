/**
 * GET /api/sessions — List sessions with filtering and pagination.
 * POST /api/sessions — Create a new session (organizer only).
 */

import { type NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/connection";
import { SessionQuerySchema, CreateSessionSchema } from "@/lib/validations/sessions";
import { timingSafeStringEqual } from "@/lib/utils/security";
import { sessionCache } from "@/lib/utils/cache";
import { CACHE_TTL_SESSIONS, DEFAULT_PAGE_SIZE } from "@/lib/constants";

/** GET /api/sessions */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = request.nextUrl;
  const parseResult = SessionQuerySchema.safeParse(
    Object.fromEntries(searchParams.entries())
  );

  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Invalid query parameters", issues: parseResult.error.flatten() },
      { status: 400 }
    );
  }

  const q = parseResult.data;
  const cacheKey = JSON.stringify(q);
  const cached = sessionCache.get(cacheKey);
  if (cached) {
    return NextResponse.json(cached, {
      headers: {
        "Cache-Control": "s-maxage=60, stale-while-revalidate=300",
        "X-Cache": "HIT",
      },
    });
  }

  try {
    const db = getDb();
    let sql = "SELECT * FROM sessions WHERE 1=1";
    const params: (string | number)[] = [];

    if (q.category) {
      sql += " AND category = ?";
      params.push(q.category);
    }
    if (q.zone) {
      sql += " AND zone = ?";
      params.push(q.zone);
    }
    if (q.search) {
      sql += " AND (title LIKE ? OR speaker LIKE ? OR description LIKE ?)";
      const term = `%${q.search}%`;
      params.push(term, term, term);
    }
    if (q.tag) {
      sql += " AND tags LIKE ?";
      params.push(`%${q.tag}%`);
    }

    const countSql = sql.replace("SELECT *", "SELECT COUNT(*) as total");
    const { total } = db.prepare(countSql).get(...params) as { total: number };

    const limit = q.limit ?? DEFAULT_PAGE_SIZE;
    const offset = ((q.page ?? 1) - 1) * limit;
    sql += " ORDER BY is_featured DESC, start_time ASC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const rows = db.prepare(sql).all(...params) as Record<string, unknown>[];
    const sessions = rows.map((r) => ({
      ...r,
      tags: JSON.parse((r.tags as string) || "[]") as string[],
      isFeatured: Boolean(r.is_featured),
    }));

    const result = { sessions, total, page: q.page, limit };
    sessionCache.set(cacheKey, result, CACHE_TTL_SESSIONS);

    return NextResponse.json(result, {
      headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=300" },
    });
  } catch (err) {
    console.error("[sessions GET]", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
  }
}

/** POST /api/sessions */
export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = CreateSessionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const adminKey = request.headers.get("x-admin-key") ?? "";
  const expectedKey = process.env.ADMIN_KEY ?? "eventiq-dev-key";
  if (!timingSafeStringEqual(adminKey, expectedKey)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = getDb();
    const d = parsed.data;
    const id = `s-${Date.now()}`;

    db.prepare(`
      INSERT INTO sessions (id, title, speaker, speaker_bio, zone, category, start_time, end_time, description, tags, capacity, is_featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, d.title, d.speaker, d.speakerBio, d.zone, d.category,
      d.startTime, d.endTime, d.description, JSON.stringify(d.tags),
      d.capacity, d.isFeatured ? 1 : 0
    );

    sessionCache.clear();
    return NextResponse.json({ id, message: "Session created" }, { status: 201 });
  } catch (err) {
    console.error("[sessions POST]", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}
