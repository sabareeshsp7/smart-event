/**
 * GET /api/ticketmaster/events
 * Real-time event discovery proxy powered by Ticketmaster Discovery API.
 * Features: in-memory caching, rate-limiting, and keyless fallback.
 */

import { type NextRequest, NextResponse } from "next/server";
import { TICKETMASTER_API_KEY, TICKETMASTER_BASE_URL } from "@/lib/constants";
import { checkRateLimit, getClientIp } from "@/lib/utils/rate-limit";

export interface NormalizedTicketmasterEvent {
  id: string;
  name: string;
  url: string;
  imageUrl: string;
  date: string;
  time: string;
  timezone?: string;
  venue: {
    name: string;
    city: string;
    state?: string;
    country: string;
    address?: string;
    latitude?: string;
    longitude?: string;
  };
  category: string;
  genre: string;
  priceRange?: {
    min: number;
    max: number;
    currency: string;
  };
  seatmapUrl?: string;
  status: string;
}

// In-memory cache for 5-minute TTL
interface CacheEntry {
  data: { events: NormalizedTicketmasterEvent[]; total: number };
  expiresAt: number;
}
const cache = new Map<string, CacheEntry>();

// Fallback events in case of API downtime or quota exhaustion
const FALLBACK_EVENTS: NormalizedTicketmasterEvent[] = [
  {
    id: "fb-1",
    name: "Global AI & Cloud Summit 2026",
    url: "https://www.ticketmaster.com",
    imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80",
    date: "2026-09-24",
    time: "09:30:00",
    timezone: "Asia/Kolkata",
    venue: {
      name: "Bangalore International Exhibition Centre (BIEC)",
      city: "Bengaluru",
      state: "Karnataka",
      country: "India",
      address: "10th Mile, Tumkur Road",
      latitude: "13.0617",
      longitude: "77.4727",
    },
    category: "Technology",
    genre: "Conference",
    priceRange: { min: 2499, max: 8999, currency: "INR" },
    status: "onsale",
  },
  {
    id: "fb-2",
    name: "Neon Horizon Symphony & Live Orchestra",
    url: "https://www.ticketmaster.com",
    imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80",
    date: "2026-10-15",
    time: "19:00:00",
    timezone: "Asia/Kolkata",
    venue: {
      name: "BIEC Arena Pavilion",
      city: "Bengaluru",
      state: "Karnataka",
      country: "India",
      address: "Madavara Post, Bengaluru",
      latitude: "13.0617",
      longitude: "77.4727",
    },
    category: "Music",
    genre: "Classical & Electronic",
    priceRange: { min: 1499, max: 4999, currency: "INR" },
    status: "onsale",
  },
];

export async function GET(request: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(request.headers);
  const rateCheck = checkRateLimit(`tm-events:${ip}`, 40, 60_000);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please try again in a moment." },
      { status: 429, headers: { "Retry-After": "30" } }
    );
  }

  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get("keyword") ?? "";
  const city = searchParams.get("city") ?? "";
  const classification = searchParams.get("classification") ?? "";
  const size = Math.min(Number(searchParams.get("size") ?? "16"), 40);
  const page = Number(searchParams.get("page") ?? "0");

  const cacheKey = `tm:${keyword}:${city}:${classification}:${size}:${page}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt) {
    return NextResponse.json(cached.data, {
      headers: { "X-Cache": "HIT", "Cache-Control": "public, s-maxage=300" },
    });
  }

  try {
    const url = new URL(`${TICKETMASTER_BASE_URL}/events.json`);
    url.searchParams.set("apikey", TICKETMASTER_API_KEY);
    url.searchParams.set("size", String(size));
    url.searchParams.set("page", String(page));
    url.searchParams.set("sort", "date,asc");

    if (keyword.trim()) url.searchParams.set("keyword", keyword.trim());
    if (city.trim()) url.searchParams.set("city", city.trim());
    if (classification.trim() && classification !== "All") {
      url.searchParams.set("classificationName", classification.trim());
    }

    const res = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      console.warn(`[Ticketmaster API] Status ${res.status} — Using fallback`);
      return NextResponse.json({
        events: FALLBACK_EVENTS,
        total: FALLBACK_EVENTS.length,
        source: "fallback",
      });
    }

    const data = (await res.json()) as {
      _embedded?: { events?: Record<string, unknown>[] };
      page?: { totalElements?: number };
    };

    const rawEvents = data._embedded?.events ?? [];
    const totalElements = data.page?.totalElements ?? rawEvents.length;

    const normalizedEvents: NormalizedTicketmasterEvent[] = rawEvents.map((e) => {
      // Safe type extraction
      const id = String(e.id ?? `tm-${Math.random()}`);
      const name = String(e.name ?? "Live Event");
      const eventUrl = String(e.url ?? "https://www.ticketmaster.com");

      // Images
      const images = Array.isArray(e.images) ? (e.images as Record<string, unknown>[]) : [];
      const bestImage =
        images.find((img) => img.ratio === "16_9" && Number(img.width ?? 0) >= 640)?.url ??
        images[0]?.url ??
        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80";

      // Dates
      const datesObj = (e.dates as Record<string, unknown>) ?? {};
      const startObj = (datesObj.start as Record<string, unknown>) ?? {};
      const localDate = String(startObj.localDate ?? "2026-09-20");
      const localTime = String(startObj.localTime ?? "10:00:00");
      const timezone = String(datesObj.timezone ?? "UTC");

      // Venue
      const embedded = (e._embedded as Record<string, unknown>) ?? {};
      const venues = Array.isArray(embedded.venues) ? (embedded.venues as Record<string, unknown>[]) : [];
      const primaryVenue = venues[0] ?? {};
      const venueCity = (primaryVenue.city as Record<string, unknown>)?.name ?? "Bengaluru";
      const venueState = (primaryVenue.state as Record<string, unknown>)?.name ?? "";
      const venueCountry = (primaryVenue.country as Record<string, unknown>)?.name ?? "India";
      const venueAddress = (primaryVenue.address as Record<string, unknown>)?.line1 ?? "";
      const venueLocation = (primaryVenue.location as Record<string, unknown>) ?? {};

      // Classifications
      const classifications = Array.isArray(e.classifications)
        ? (e.classifications as Record<string, unknown>[])
        : [];
      const primaryClass = classifications[0] ?? {};
      const segment = (primaryClass.segment as Record<string, unknown>)?.name ?? "Event";
      const genre = (primaryClass.genre as Record<string, unknown>)?.name ?? "General";

      // Price
      const priceRanges = Array.isArray(e.priceRanges)
        ? (e.priceRanges as Record<string, unknown>[])
        : [];
      const priceObj = priceRanges[0];
      const priceRange = priceObj
        ? {
            min: Number(priceObj.min ?? 0),
            max: Number(priceObj.max ?? 0),
            currency: String(priceObj.currency ?? "USD"),
          }
        : undefined;

      // Seatmap
      const seatmapObj = (e.seatmap as Record<string, unknown>) ?? {};
      const seatmapUrl = seatmapObj.staticUrl ? String(seatmapObj.staticUrl) : undefined;

      // Status
      const statusObj = (datesObj.status as Record<string, unknown>) ?? {};
      const status = String(statusObj.code ?? "onsale");

      return {
        id,
        name,
        url: eventUrl,
        imageUrl: String(bestImage),
        date: localDate,
        time: localTime,
        timezone,
        venue: {
          name: String(primaryVenue.name ?? "Main Auditorium"),
          city: String(venueCity),
          state: venueState ? String(venueState) : undefined,
          country: String(venueCountry),
          address: venueAddress ? String(venueAddress) : undefined,
          latitude: venueLocation.latitude ? String(venueLocation.latitude) : undefined,
          longitude: venueLocation.longitude ? String(venueLocation.longitude) : undefined,
        },
        category: String(segment),
        genre: String(genre),
        priceRange,
        seatmapUrl,
        status,
      };
    });

    const responsePayload = {
      events: normalizedEvents.length > 0 ? normalizedEvents : FALLBACK_EVENTS,
      total: totalElements,
      source: "ticketmaster_live",
    };

    cache.set(cacheKey, {
      data: responsePayload,
      expiresAt: Date.now() + 5 * 60_000,
    });

    return NextResponse.json(responsePayload, {
      headers: { "X-Cache": "MISS", "Cache-Control": "public, s-maxage=300" },
    });
  } catch (err) {
    console.error("[Ticketmaster API Exception]", err instanceof Error ? err.message : err);
    return NextResponse.json({
      events: FALLBACK_EVENTS,
      total: FALLBACK_EVENTS.length,
      source: "fallback",
    });
  }
}
