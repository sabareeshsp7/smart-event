/**
 * POST & GET /api/attendees — Real-time attendee registration and badge directory.
 * Stores attendee profiles in SQLite database.
 * RULE SEC-1: Zod validation on all API requests.
 * RULE SEC-5: Rate limiting on public registration endpoint.
 */

import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db/connection";
import { checkRateLimit, getClientIp } from "@/lib/utils/rate-limit";

export const runtime = "nodejs";

const AttendeeRegistrationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Please provide a valid email address"),
  phone: z.string().max(20).optional().default(""),
  company: z.string().max(100).optional().default("Independent"),
  role: z.string().max(100).optional().default("Attendee"),
  badgeType: z
    .enum(["General Attendee", "VIP / Speaker", "Delegate", "Student / Researcher", "Media / Press"])
    .default("General Attendee"),
  interests: z.array(z.string()).default([]),
  dietaryPref: z.string().max(50).default("Standard"),
  accessibilityNeeds: z.string().max(100).default("None"),
});

/** GET /api/attendees — Return directory of registered attendees */
export async function GET(): Promise<NextResponse> {
  try {
    const db = getDb();
    const countRow = db.prepare("SELECT COUNT(*) as total FROM attendees").get() as { total: number };
    const rows = db.prepare(`
      SELECT id, name, company, role, badge_type, interests, registered_at, qr_code
      FROM attendees
      ORDER BY registered_at DESC
      LIMIT 50
    `).all() as Array<{
      id: string;
      name: string;
      company: string;
      role: string;
      badge_type: string;
      interests: string;
      registered_at: string;
      qr_code: string;
    }>;

    const attendees = rows.map((r) => ({
      ...r,
      interests: JSON.parse(r.interests || "[]") as string[],
    }));

    return NextResponse.json({
      total: countRow.total,
      attendees,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load attendees";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** POST /api/attendees — Register new attendee */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(request.headers);
  const rateCheck = checkRateLimit(`reg:${ip}`, 10, 60_000);
  if (!rateCheck.allowed) {
    return NextResponse.json({ error: "Too many registrations. Please wait." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = AttendeeRegistrationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const db = getDb();

  // Check if email is already registered
  const existing = db.prepare("SELECT id FROM attendees WHERE email = ?").get(data.email) as { id: string } | undefined;
  if (existing) {
    return NextResponse.json(
      { error: "An attendee with this email is already registered.", existingId: existing.id },
      { status: 409 }
    );
  }

  const id = `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const qrCode = `PASS-${id.toUpperCase()}-${data.badgeType.substring(0, 3).toUpperCase()}`;

  try {
    db.prepare(`
      INSERT INTO attendees (id, name, email, phone, company, role, badge_type, interests, dietary_pref, accessibility_needs, qr_code)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      data.name,
      data.email,
      data.phone,
      data.company,
      data.role,
      data.badgeType,
      JSON.stringify(data.interests),
      data.dietaryPref,
      data.accessibilityNeeds,
      qrCode
    );

    return NextResponse.json(
      {
        success: true,
        message: "Registration successful! Your digital badge is ready.",
        attendee: {
          id,
          name: data.name,
          email: data.email,
          company: data.company,
          role: data.role,
          badgeType: data.badgeType,
          interests: data.interests,
          qrCode,
          venue: "Bangalore International Exhibition Centre (BIEC)",
        },
      },
      { status: 201 }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Database write failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
