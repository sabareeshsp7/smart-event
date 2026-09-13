"use client";
/**
 * Live Events Directory — Real-time event intelligence powered by Ticketmaster Discovery API.
 * Clean, image-free layout focusing on verified event details: exact clock time, date, venue place, and status.
 * Clean light mode aesthetic with Lucide icons and zero emojis.
 */

import { useState, useEffect } from "react";
import {
  Ticket,
  Search,
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  Sparkles,
  X,
  Tag,
  DollarSign,
  Compass,
} from "lucide-react";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { API_ROUTES } from "@/lib/constants";
import type { NormalizedTicketmasterEvent } from "@/app/api/ticketmaster/events/route";

const CATEGORIES = [
  "All",
  "Music",
  "Sports",
  "Arts & Theatre",
  "Miscellaneous",
] as const;

export default function EventsPage() {
  const [events, setEvents] = useState<NormalizedTicketmasterEvent[]>([]);
  const [totalEvents, setTotalEvents] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const debouncedQuery = useDebounce(searchQuery, 400);

  useEffect(() => {
    void loadEvents();
  }, [debouncedQuery, selectedCategory]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedQuery.trim()) params.set("keyword", debouncedQuery.trim());
      if (selectedCategory !== "All") params.set("classification", selectedCategory);
      params.set("size", "24");

      const res = await fetch(`${API_ROUTES.TICKETMASTER_EVENTS}?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load events");
      const data = (await res.json()) as {
        events: NormalizedTicketmasterEvent[];
        total: number;
      };
      setEvents(data.events || []);
      setTotalEvents(data.total || data.events.length);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const formatClockTime = (timeStr: string) => {
    if (!timeStr) return "TBD";
    try {
      const [hours, minutes] = timeStr.split(":");
      const h = parseInt(hours, 10);
      const ampm = h >= 12 ? "PM" : "AM";
      const formattedHours = h % 12 || 12;
      return `${formattedHours}:${minutes} ${ampm}`;
    } catch {
      return timeStr;
    }
  };

  return (
    <div className="page-wrapper" style={{ background: "var(--color-bg)", minHeight: "100vh" }}>
      <div className="container" style={{ paddingTop: "2.5rem", paddingBottom: "4rem" }}>
        
        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.35rem 0.85rem",
              borderRadius: "9999px",
              background: "rgba(99,102,241,0.08)",
              border: "1px solid rgba(99,102,241,0.2)",
              color: "#4f46e5",
              fontSize: "0.8rem",
              fontWeight: 700,
              marginBottom: "0.75rem",
            }}
          >
            <Sparkles size={15} />
            <span>Ticketmaster Discovery API · Live Event Feed</span>
          </div>

          <h1
            className="section-title"
            style={{
              fontSize: "2.2rem",
              fontWeight: 800,
              color: "var(--color-text)",
              letterSpacing: "-0.02em",
              marginBottom: "0.5rem",
            }}
          >
            Live Events <span className="gradient-text">Directory</span>
          </h1>
          <p className="section-subtitle" style={{ color: "var(--color-text-secondary)", fontSize: "1rem" }}>
            Real-time verified event schedules, exact clock times, venues, and ticket information worldwide.
          </p>
        </div>

        {/* Search & Filter Toolbar */}
        <div
          className="glass-card"
          style={{
            padding: "1.25rem 1.5rem",
            marginBottom: "2rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            background: "#ffffff",
          }}
        >
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
            {/* Search Input */}
            <div
              style={{
                flex: 1,
                minWidth: "260px",
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                background: "#f8fafc",
                border: "1px solid #cbd5e1",
                borderRadius: "0.5rem",
                padding: "0.55rem 0.85rem",
              }}
            >
              <Search size={18} color="#64748b" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events by artist, conference title, venue, or city..."
                style={{
                  width: "100%",
                  border: "none",
                  background: "transparent",
                  outline: "none",
                  fontSize: "0.95rem",
                  color: "#0f172a",
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  style={{ background: "transparent", border: "none", cursor: "pointer", color: "#64748b" }}
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Total Count Badge */}
            <div
              style={{
                fontSize: "0.85rem",
                color: "#64748b",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                background: "#f1f5f9",
                padding: "0.55rem 0.85rem",
                borderRadius: "0.5rem",
                border: "1px solid #e2e8f0",
              }}
            >
              <Ticket size={16} color="#4f46e5" />
              <strong style={{ color: "#0f172a" }}>{totalEvents.toLocaleString()}</strong> Events Live
            </div>
          </div>

          {/* Category Filters */}
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: "0.4rem 0.95rem",
                    borderRadius: "9999px",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    border: active ? "1px solid #4f46e5" : "1px solid #e2e8f0",
                    background: active ? "#4f46e5" : "#ffffff",
                    color: active ? "#ffffff" : "#334155",
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Events Grid (Clean, Image-Free, Typography & Info Focused) */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "5rem 2rem" }}>
            <div className="spinner" style={{ width: "2.5rem", height: "2.5rem", margin: "0 auto" }} />
            <p style={{ color: "#64748b", marginTop: "1rem", fontWeight: 500 }}>
              Retrieving live events telemetry from Ticketmaster API...
            </p>
          </div>
        ) : events.length === 0 ? (
          <div
            className="glass-card"
            style={{ textAlign: "center", padding: "4rem 2rem", background: "#ffffff" }}
          >
            <Ticket size={36} color="#94a3b8" style={{ margin: "0 auto 1rem auto" }} />
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.5rem" }}>
              No events matched your search
            </h3>
            <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
              Try adjusting your search terms or select "All" categories.
            </p>
          </div>
        ) : (
          <div className="grid-3" style={{ gap: "1.25rem" }}>
            {events.map((event) => (
              <article
                key={event.id}
                className="glass-card"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  background: "#ffffff",
                  borderRadius: "0.75rem",
                  padding: "1.5rem",
                  border: "1px solid #e2e8f0",
                  transition: "all 0.15s ease",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                }}
              >
                {/* Header: Category & Sale Status */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.3rem",
                      background: "rgba(79, 70, 229, 0.08)",
                      color: "#4f46e5",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      padding: "0.2rem 0.6rem",
                      borderRadius: "0.375rem",
                      textTransform: "uppercase",
                    }}
                  >
                    <Tag size={12} /> {event.category} {event.genre && `· ${event.genre}`}
                  </span>

                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      background: event.status === "onsale" ? "#ecfdf5" : "#f1f5f9",
                      color: event.status === "onsale" ? "#059669" : "#64748b",
                      border: `1px solid ${event.status === "onsale" ? "#a7f3d0" : "#e2e8f0"}`,
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      padding: "0.15rem 0.5rem",
                      borderRadius: "9999px",
                      textTransform: "uppercase",
                    }}
                  >
                    {event.status === "onsale" ? "On Sale" : event.status}
                  </span>
                </div>

                {/* Event Name */}
                <h3
                  style={{
                    fontSize: "1.15rem",
                    fontWeight: 700,
                    color: "#0f172a",
                    marginBottom: "1rem",
                    lineHeight: 1.35,
                    minHeight: "2.7rem",
                  }}
                >
                  {event.name}
                </h3>

                {/* Event Info Details: Date, Clock Time, Place */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.65rem",
                    background: "#f8fafc",
                    padding: "1rem",
                    borderRadius: "0.5rem",
                    border: "1px solid #e2e8f0",
                    marginBottom: "1.25rem",
                    fontSize: "0.85rem",
                  }}
                >
                  {/* Calendar Date */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <div style={{ width: "24px", height: "24px", borderRadius: "0.375rem", background: "rgba(79, 70, 229, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#4f46e5", flexShrink: 0 }}>
                      <Calendar size={14} />
                    </div>
                    <div>
                      <span style={{ color: "#64748b", fontSize: "0.75rem", display: "block" }}>Date</span>
                      <strong style={{ color: "#0f172a" }}>{formatDate(event.date)}</strong>
                    </div>
                  </div>

                  {/* Clock Time */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <div style={{ width: "24px", height: "24px", borderRadius: "0.375rem", background: "rgba(8, 145, 178, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#0891b2", flexShrink: 0 }}>
                      <Clock size={14} />
                    </div>
                    <div>
                      <span style={{ color: "#64748b", fontSize: "0.75rem", display: "block" }}>Clock Time</span>
                      <strong style={{ color: "#0f172a" }}>
                        {formatClockTime(event.time)}
                        {event.timezone && (
                          <span style={{ fontWeight: 500, color: "#64748b", marginLeft: "0.35rem", fontSize: "0.75rem" }}>
                            ({event.timezone.replace("_", " ")})
                          </span>
                        )}
                      </strong>
                    </div>
                  </div>

                  {/* Place & Venue */}
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem" }}>
                    <div style={{ width: "24px", height: "24px", borderRadius: "0.375rem", background: "rgba(220, 38, 38, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#dc2626", flexShrink: 0, marginTop: "0.1rem" }}>
                      <MapPin size={14} />
                    </div>
                    <div>
                      <span style={{ color: "#64748b", fontSize: "0.75rem", display: "block" }}>Place &amp; Venue</span>
                      <strong style={{ color: "#0f172a", display: "block" }}>{event.venue.name}</strong>
                      <span style={{ color: "#475569", fontSize: "0.8rem", display: "block" }}>
                        {event.venue.address ? `${event.venue.address}, ` : ""}
                        {event.venue.city}
                        {event.venue.state ? `, ${event.venue.state}` : ""}
                        {event.venue.country ? `, ${event.venue.country}` : ""}
                      </span>
                    </div>
                  </div>

                  {/* Price Tier (if available) */}
                  {event.priceRange && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", borderTop: "1px dashed #e2e8f0", paddingTop: "0.5rem", marginTop: "0.1rem" }}>
                      <div style={{ width: "24px", height: "24px", borderRadius: "0.375rem", background: "rgba(5, 150, 105, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#059669", flexShrink: 0 }}>
                        <DollarSign size={14} />
                      </div>
                      <div>
                        <span style={{ color: "#64748b", fontSize: "0.75rem", display: "block" }}>Pricing Tier</span>
                        <strong style={{ color: "#059669" }}>
                          {event.priceRange.min} - {event.priceRange.max} {event.priceRange.currency}
                        </strong>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Action: Official Ticketmaster Details */}
                <div style={{ marginTop: "auto", display: "flex", gap: "0.5rem" }}>
                  <a
                    href={event.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                    style={{
                      flex: 1,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.4rem",
                      fontSize: "0.85rem",
                      padding: "0.6rem 1rem",
                      borderRadius: "0.5rem",
                    }}
                  >
                    <span>View Ticketmaster Event Details</span>
                    <ExternalLink size={15} />
                  </a>

                  {event.venue.latitude && event.venue.longitude && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        `${event.venue.name} ${event.venue.city}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-ghost"
                      style={{
                        padding: "0.6rem 0.8rem",
                        border: "1px solid #cbd5e1",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      title="Open in Google Maps"
                      aria-label="Open in Google Maps"
                    >
                      <Compass size={16} color="#6366f1" />
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
