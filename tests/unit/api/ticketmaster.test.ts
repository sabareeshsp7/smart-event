/**
 * Unit tests for Ticketmaster Events API Route.
 * Tests querying, normalization, caching, and fallback handling.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/ticketmaster/events/route";

describe("GET /api/ticketmaster/events", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns normalized events on successful Ticketmaster API response", async () => {
    const mockApiResponse = {
      _embedded: {
        events: [
          {
            id: "tm123",
            name: "World Tech Symphony",
            url: "https://www.ticketmaster.com/event/tm123",
            images: [
              {
                ratio: "16_9",
                url: "https://images.ticketmaster.com/test.jpg",
                width: 1024,
              },
            ],
            dates: {
              start: {
                localDate: "2026-10-20",
                localTime: "19:30:00",
              },
              timezone: "America/New_York",
              status: { code: "onsale" },
            },
            _embedded: {
              venues: [
                {
                  name: "Madison Square Garden",
                  city: { name: "New York" },
                  country: { name: "United States" },
                },
              ],
            },
            classifications: [
              {
                segment: { name: "Music" },
                genre: { name: "Rock" },
              },
            ],
          },
        ],
      },
      page: { totalElements: 1 },
    };

    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify(mockApiResponse), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    const req = new NextRequest("http://localhost:3000/api/ticketmaster/events?keyword=Symphony");
    const res = await GET(req);

    expect(res.status).toBe(200);
    const json = (await res.json()) as { events: unknown[]; total: number; source: string };
    expect(json.events).toHaveLength(1);
    expect(json.total).toBe(1);
    expect(json.source).toBe("ticketmaster_live");
  });

  it("returns fallback events gracefully when Ticketmaster API returns non-200", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "Internal Error" }), {
        status: 500,
      })
    );

    const req = new NextRequest("http://localhost:3000/api/ticketmaster/events?keyword=ErrorTest");
    const res = await GET(req);

    expect(res.status).toBe(200);
    const json = (await res.json()) as { events: unknown[]; total: number; source: string };
    expect(json.events.length).toBeGreaterThan(0);
    expect(json.source).toBe("fallback");
  });
});
