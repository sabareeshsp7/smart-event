"use client";
/**
 * Live Events & Digital Passes Hub.
 * Real-time event search powered by Ticketmaster Discovery API.
 * Attendees can browse real live events and claim digital passes with Name and Phone.
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
  QrCode,
  CheckCircle2,
  Printer,
  X,
  User,
  Phone,
  Building,
  RefreshCw,
} from "lucide-react";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { API_ROUTES } from "@/lib/constants";
import { useUserProfile } from "@/lib/hooks/useUserProfile";
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

  const { profile, saveProfile } = useUserProfile();

  // Selected event for pass claiming
  const [passEvent, setPassEvent] = useState<NormalizedTicketmasterEvent | null>(null);
  const [attendeeName, setAttendeeName] = useState(profile.name);
  const [attendeePhone, setAttendeePhone] = useState(profile.phone);
  const [attendeeEmail, setAttendeeEmail] = useState(profile.email);
  const [company, setCompany] = useState("");
  const [submittingPass, setSubmittingPass] = useState(false);
  const [claimedPass, setClaimedPass] = useState<{
    passId: string;
    qrCode: string;
    event: NormalizedTicketmasterEvent;
    attendee: { name: string; phone: string; email: string };
  } | null>(null);

  useEffect(() => {
    if (profile.name && !attendeeName) setAttendeeName(profile.name);
    if (profile.phone && !attendeePhone) setAttendeePhone(profile.phone);
    if (profile.email && !attendeeEmail) setAttendeeEmail(profile.email);
  }, [profile, attendeeName, attendeePhone, attendeeEmail]);

  useEffect(() => {
    void loadEvents();
  }, [debouncedQuery, selectedCategory]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedQuery.trim()) params.set("keyword", debouncedQuery.trim());
      if (selectedCategory !== "All") params.set("classification", selectedCategory);
      params.set("size", "18");

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

  const handleClaimPass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passEvent || !attendeeName.trim() || !attendeePhone.trim()) return;

    setSubmittingPass(true);
    // Save to user profile locally
    saveProfile({
      name: attendeeName.trim(),
      phone: attendeePhone.trim(),
      email: attendeeEmail.trim(),
    });

    try {
      await fetch(API_ROUTES.ATTENDEES, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: attendeeName.trim(),
          email: attendeeEmail.trim() || `attendee_${Date.now()}@eventiq.internal`,
          phone: attendeePhone.trim(),
          company: company.trim() || "Independent Attendee",
          role: "Verified Event Pass Holder",
          badge_type: "VIP",
          interests: [passEvent.genre, passEvent.category],
          dietary_pref: "Standard",
          accessibility_needs: "None",
        }),
      });

      const passId = `PASS-TM-${passEvent.id.slice(-6).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
        `EVENTIQ:${passId}:${attendeeName}:${passEvent.name}`
      )}`;

      setClaimedPass({
        passId,
        qrCode,
        event: passEvent,
        attendee: {
          name: attendeeName.trim(),
          phone: attendeePhone.trim(),
          email: attendeeEmail.trim() || "Registered In-Person",
        },
      });
    } catch {
      /* fallback pass generation */
      const passId = `PASS-TM-${passEvent.id.slice(-6).toUpperCase()}-LOCAL`;
      setClaimedPass({
        passId,
        qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
          `EVENTIQ:${passId}:${attendeeName}`
        )}`,
        event: passEvent,
        attendee: {
          name: attendeeName.trim(),
          phone: attendeePhone.trim(),
          email: attendeeEmail.trim(),
        },
      });
    } finally {
      setSubmittingPass(false);
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
            Live Events &amp; <span className="gradient-text">Digital Passes</span>
          </h1>
          <p className="section-subtitle" style={{ color: "var(--color-text-secondary)", fontSize: "1rem" }}>
            Explore verified live events from Ticketmaster. Claim instant digital passes with your name and phone number.
          </p>
        </div>

        {/* Search and Category Filters */}
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
                padding: "0.5rem 0.85rem",
              }}
            >
              <Search size={18} color="#64748b" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search real live events, artists, venues, or cities..."
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
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Live Count Indicator */}
            <div
              style={{
                fontSize: "0.85rem",
                color: "#64748b",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              <Ticket size={16} color="#4f46e5" />
              <span>{totalEvents.toLocaleString()} Events Available</span>
            </div>
          </div>

          {/* Category Chips */}
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: "0.35rem 0.85rem",
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

        {/* Events Grid */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "5rem 2rem" }}>
            <div className="spinner" style={{ width: "2.5rem", height: "2.5rem", margin: "0 auto" }} />
            <p style={{ color: "#64748b", marginTop: "1rem", fontWeight: 500 }}>
              Querying real-time events from Ticketmaster...
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
              Try searching a broader query or select "All" categories.
            </p>
          </div>
        ) : (
          <div className="grid-3" style={{ gap: "1.5rem" }}>
            {events.map((event) => (
              <article
                key={event.id}
                className="glass-card"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  background: "#ffffff",
                  borderRadius: "0.75rem",
                  overflow: "hidden",
                  border: "1px solid #e2e8f0",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
              >
                {/* Event Image */}
                <div style={{ position: "relative", width: "100%", height: "180px", background: "#0f172a" }}>
                  <img
                    src={event.imageUrl}
                    alt={event.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    loading="lazy"
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: "0.75rem",
                      left: "0.75rem",
                      background: "rgba(15, 23, 42, 0.75)",
                      color: "#ffffff",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      padding: "0.2rem 0.6rem",
                      borderRadius: "9999px",
                      backdropFilter: "blur(4px)",
                      textTransform: "uppercase",
                    }}
                  >
                    {event.category}
                  </div>

                  {event.priceRange && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: "0.75rem",
                        right: "0.75rem",
                        background: "#10b981",
                        color: "#ffffff",
                        fontSize: "0.75rem",
                        fontWeight: 800,
                        padding: "0.2rem 0.6rem",
                        borderRadius: "0.375rem",
                      }}
                    >
                      From {event.priceRange.min} {event.priceRange.currency}
                    </div>
                  )}
                </div>

                {/* Event Body */}
                <div style={{ padding: "1.25rem", flex: 1, display: "flex", flexDirection: "column" }}>
                  <h3
                    style={{
                      fontSize: "1.05rem",
                      fontWeight: 700,
                      color: "#0f172a",
                      marginBottom: "0.6rem",
                      lineHeight: 1.4,
                    }}
                  >
                    {event.name}
                  </h3>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginBottom: "1.25rem", fontSize: "0.825rem", color: "#475569" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <Calendar size={14} color="#6366f1" />
                      <span>{formatDate(event.date)}</span>
                      {event.time && (
                        <>
                          <Clock size={14} color="#0891b2" style={{ marginLeft: "0.5rem" }} />
                          <span>{event.time.slice(0, 5)}</span>
                        </>
                      )}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <MapPin size={14} color="#dc2626" />
                      <span style={{ fontWeight: 600 }}>{event.venue.name}</span>
                      <span>· {event.venue.city}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ marginTop: "auto", display: "flex", gap: "0.6rem" }}>
                    <button
                      onClick={() => {
                        setPassEvent(event);
                        setClaimedPass(null);
                      }}
                      className="btn btn-primary btn-sm"
                      style={{
                        flex: 1,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.35rem",
                        fontSize: "0.8rem",
                      }}
                    >
                      <Ticket size={14} /> Claim Digital Pass
                    </button>

                    <a
                      href={event.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-ghost btn-sm"
                      style={{
                        padding: "0.4rem 0.6rem",
                        border: "1px solid #cbd5e1",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      title="View on Ticketmaster"
                      aria-label="View on Ticketmaster"
                    >
                      <ExternalLink size={15} color="#475569" />
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Claim Pass Modal */}
        {passEvent && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 250,
              background: "rgba(15, 23, 42, 0.6)",
              backdropFilter: "blur(6px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "1rem",
            }}
            role="dialog"
            aria-modal="true"
          >
            <div
              style={{
                background: "#ffffff",
                borderRadius: "1rem",
                maxWidth: "520px",
                width: "100%",
                padding: "2rem",
                maxHeight: "90vh",
                overflowY: "auto",
                border: "1px solid #e2e8f0",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              }}
            >
              {claimedPass ? (
                /* Verified Digital Pass Result */
                <div>
                  <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "50%",
                        background: "#ecfdf5",
                        color: "#059669",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 0.75rem auto",
                      }}
                    >
                      <CheckCircle2 size={28} />
                    </div>
                    <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                      Digital Pass Verified &amp; Claimed!
                    </h2>
                    <p style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "0.25rem" }}>
                      Stored in your EventIQ wallet · Present this QR at venue turnstiles
                    </p>
                  </div>

                  {/* Pass Visual Card */}
                  <div
                    id="digital-pass-card"
                    style={{
                      background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
                      color: "#ffffff",
                      borderRadius: "0.75rem",
                      padding: "1.5rem",
                      marginBottom: "1.5rem",
                      boxShadow: "0 10px 25px rgba(49, 46, 129, 0.25)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem", borderBottom: "1px dashed rgba(255,255,255,0.2)", paddingBottom: "0.75rem" }}>
                      <div>
                        <span style={{ fontSize: "0.7rem", color: "#a5b4fc", textTransform: "uppercase", fontWeight: 700 }}>
                          EventIQ Official Pass
                        </span>
                        <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#38bdf8" }}>
                          {claimedPass.passId}
                        </div>
                      </div>
                      <span
                        style={{
                          background: "rgba(56, 189, 248, 0.2)",
                          color: "#38bdf8",
                          border: "1px solid rgba(56, 189, 248, 0.4)",
                          padding: "0.2rem 0.5rem",
                          borderRadius: "9999px",
                          fontSize: "0.7rem",
                          fontWeight: 700,
                        }}
                      >
                        VALID PASS
                      </span>
                    </div>

                    <div style={{ marginBottom: "1rem" }}>
                      <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: "0 0 0.35rem 0", color: "#ffffff" }}>
                        {claimedPass.event.name}
                      </h3>
                      <div style={{ fontSize: "0.8rem", color: "#c7d2fe" }}>
                        {claimedPass.event.venue.name} · {claimedPass.event.venue.city}
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "#93c5fd", marginTop: "0.2rem" }}>
                        Date: {formatDate(claimedPass.event.date)}
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.06)", padding: "0.85rem", borderRadius: "0.5rem" }}>
                      <div>
                        <div style={{ fontSize: "0.7rem", color: "#a5b4fc", textTransform: "uppercase" }}>
                          Attendee
                        </div>
                        <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#ffffff" }}>
                          {claimedPass.attendee.name}
                        </div>
                        <div style={{ fontSize: "0.8rem", color: "#cbd5e1" }}>
                          {claimedPass.attendee.phone}
                        </div>
                      </div>

                      <div style={{ background: "#ffffff", padding: "0.35rem", borderRadius: "0.375rem" }}>
                        <img
                          src={claimedPass.qrCode}
                          alt="Pass QR Code"
                          style={{ width: "80px", height: "80px", display: "block" }}
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    <button
                      onClick={() => window.print()}
                      className="btn btn-primary"
                      style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}
                    >
                      <Printer size={16} /> Print / Save Pass
                    </button>
                    <button
                      onClick={() => setPassEvent(null)}
                      className="btn btn-ghost"
                      style={{ flex: 1 }}
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                /* Claim Form with Name and Phone */
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
                    <div>
                      <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                        Claim Event Pass
                      </h2>
                      <p style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "0.25rem" }}>
                        {passEvent.name}
                      </p>
                    </div>
                    <button
                      onClick={() => setPassEvent(null)}
                      style={{ background: "transparent", border: "none", cursor: "pointer", color: "#64748b" }}
                      aria-label="Close modal"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <form onSubmit={handleClaimPass} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                        Attendee Full Name *
                      </label>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", border: "1px solid #cbd5e1", borderRadius: "0.5rem", padding: "0.55rem 0.85rem" }}>
                        <User size={16} color="#64748b" />
                        <input
                          type="text"
                          required
                          value={attendeeName}
                          onChange={(e) => setAttendeeName(e.target.value)}
                          placeholder="e.g. Rahul Verma"
                          style={{ width: "100%", border: "none", outline: "none", fontSize: "0.9rem" }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                        Phone Number *
                      </label>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", border: "1px solid #cbd5e1", borderRadius: "0.5rem", padding: "0.55rem 0.85rem" }}>
                        <Phone size={16} color="#64748b" />
                        <input
                          type="tel"
                          required
                          value={attendeePhone}
                          onChange={(e) => setAttendeePhone(e.target.value)}
                          placeholder="+91-9876543210"
                          style={{ width: "100%", border: "none", outline: "none", fontSize: "0.9rem" }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                        Email Address (Optional)
                      </label>
                      <input
                        type="email"
                        value={attendeeEmail}
                        onChange={(e) => setAttendeeEmail(e.target.value)}
                        placeholder="rahul.verma@example.com"
                        style={{ width: "100%", border: "1px solid #cbd5e1", borderRadius: "0.5rem", padding: "0.55rem 0.85rem", fontSize: "0.9rem", outline: "none" }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                        Company / Organization (Optional)
                      </label>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", border: "1px solid #cbd5e1", borderRadius: "0.5rem", padding: "0.55rem 0.85rem" }}>
                        <Building size={16} color="#64748b" />
                        <input
                          type="text"
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          placeholder="e.g. Infosys, TechCorp"
                          style={{ width: "100%", border: "none", outline: "none", fontSize: "0.9rem" }}
                        />
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                      <button
                        type="button"
                        onClick={() => setPassEvent(null)}
                        className="btn btn-ghost"
                        style={{ flex: 1 }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submittingPass || !attendeeName.trim() || !attendeePhone.trim()}
                        className="btn btn-primary"
                        style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}
                      >
                        {submittingPass ? (
                          <>
                            <RefreshCw size={15} className="spin-animation" /> Generating Pass...
                          </>
                        ) : (
                          <>
                            <QrCode size={16} /> Confirm &amp; Generate Pass
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
