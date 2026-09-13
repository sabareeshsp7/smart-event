/**
 * Unit tests for BIEC Venue Programs API Route.
 * Tests querying, hall/topic filtering, and venue metadata for Bangalore International Exhibition Centre.
 */

import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/ticketmaster/events/route";
import { VENUE_NAME, VENUE_ADDRESS } from "@/lib/constants";

describe("GET /api/ticketmaster/events", () => {
  it("returns verified venue programs for Bangalore International Exhibition Centre (BIEC)", async () => {
    const req = new NextRequest("http://localhost:3000/api/ticketmaster/events");
    const res = await GET(req);

    expect(res.status).toBe(200);
    const json = (await res.json()) as {
      events: { name: string; venue: { name: string; address: string; hall: string } }[];
      total: number;
      venue: { name: string; address: string };
      source: string;
    };

    expect(json.events.length).toBeGreaterThan(0);
    expect(json.venue.name).toBe(VENUE_NAME);
    expect(json.venue.address).toBe(VENUE_ADDRESS);
    expect(json.events[0].venue.name).toBe(VENUE_NAME);
    expect(json.source).toBe("biec_verified_telemetry");
  });

  it("filters BIEC venue programs by keyword", async () => {
    const req = new NextRequest("http://localhost:3000/api/ticketmaster/events?keyword=Robotics");
    const res = await GET(req);

    expect(res.status).toBe(200);
    const json = (await res.json()) as {
      events: { name: string; venue: { hall: string } }[];
      total: number;
    };

    expect(json.events.length).toBeGreaterThan(0);
    expect(json.events.some((e) => e.name.includes("Robotics") || e.venue.hall.includes("Robotics"))).toBe(true);
  });
});
