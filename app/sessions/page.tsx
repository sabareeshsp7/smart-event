"use client";
/**
 * Sessions Discovery page — Searchable, filterable session schedule.
 * Light mode theme with Lucide icons and zero emojis.
 * RULE EFF-10: useDebounce on search input.
 */

import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Star,
  Sparkles,
  Target,
  X,
  Search,
} from "lucide-react";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { API_ROUTES, SESSION_CATEGORIES } from "@/lib/constants";

interface Session {
  id: string;
  title: string;
  speaker: string;
  zone: string;
  category: string;
  start_time: string;
  end_time: string;
  description: string;
  tags: string[];
  capacity: number;
  registered: number;
  isFeatured: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  Keynote: "#d97706",
  Workshop: "#4f46e5",
  Panel: "#0891b2",
  "Lightning Talk": "#059669",
  Demo: "#2563eb",
  Networking: "#7c3aed",
  Awards: "#ea580c",
};

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso.split("T")[0] || iso;
  }
}

function formatClockTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return iso.split("T")[1]?.slice(0, 5) || iso;
  }
}

function formatTimeRange(startIso: string, endIso?: string): string {
  const startStr = formatClockTime(startIso);
  if (!endIso) return `${startStr} IST`;
  const endStr = formatClockTime(endIso);
  return `${startStr} – ${endStr} IST`;
}

/** Sessions discovery page in Light Mode with zero emojis. */
export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [selectedDay, setSelectedDay] = useState<"all" | "2026-09-18" | "2026-09-19">("all");
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [summary, setSummary] = useState<{ summary: string; keyTakeaways: string[]; targetAudience: string } | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (debouncedSearch) params.set("search", debouncedSearch);
        if (category) params.set("category", category);
        params.set("limit", "15");

        const res = await fetch(`${API_ROUTES.SESSIONS}?${params}`);
        if (!res.ok) throw new Error("Failed");
        const data = await res.json() as { sessions: Session[]; total: number };
        setSessions(data.sessions);
        setTotal(data.total);
      } catch {
        /* Fallback */
      } finally {
        setLoading(false);
      }
    };
    void fetchSessions();
  }, [debouncedSearch, category]);

  const handleSessionClick = async (session: Session) => {
    setSelectedSession(session);
    setSummary(null);
    setSummaryLoading(true);
    try {
      const res = await fetch(API_ROUTES.SUMMARY, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: session.id }),
      });
      if (res.ok) {
        const data = await res.json() as { summary: string; keyTakeaways: string[]; targetAudience: string };
        setSummary(data);
      }
    } catch {
      /* ignore */
    } finally {
      setSummaryLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              padding: "0.25rem 0.75rem",
              borderRadius: "var(--radius-full)",
              background: "rgba(79, 70, 229, 0.08)",
              color: "var(--color-primary)",
              fontSize: "0.8rem",
              fontWeight: 600,
              marginBottom: "0.75rem",
            }}
          >
            <Calendar size={14} /> Schedule &amp; Keynotes
          </div>
          <h1 className="section-title">
            Session <span className="gradient-text">Discovery</span>
          </h1>
          <p className="section-subtitle" style={{ marginBottom: "0.5rem" }}>
            Browse, filter, and summarize {total} conference tracks and live workshops
          </p>
        </div>

        {/* Filters and Day Selector */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
          {/* Day Selector Pills */}
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => setSelectedDay("all")}
              style={{
                padding: "0.45rem 1rem",
                borderRadius: "9999px",
                fontSize: "0.85rem",
                fontWeight: 700,
                cursor: "pointer",
                border: "1px solid",
                transition: "all 0.15s ease",
                background: selectedDay === "all" ? "var(--color-primary)" : "#ffffff",
                color: selectedDay === "all" ? "#ffffff" : "var(--color-text-secondary)",
                borderColor: selectedDay === "all" ? "var(--color-primary)" : "#cbd5e1",
              }}
            >
              All Days (10 Sessions)
            </button>
            <button
              type="button"
              onClick={() => setSelectedDay("2026-09-18")}
              style={{
                padding: "0.45rem 1rem",
                borderRadius: "9999px",
                fontSize: "0.85rem",
                fontWeight: 700,
                cursor: "pointer",
                border: "1px solid",
                transition: "all 0.15s ease",
                background: selectedDay === "2026-09-18" ? "var(--color-primary)" : "#ffffff",
                color: selectedDay === "2026-09-18" ? "#ffffff" : "var(--color-text-secondary)",
                borderColor: selectedDay === "2026-09-18" ? "var(--color-primary)" : "#cbd5e1",
              }}
            >
              Day 1 — Fri, 18 Sep 2026
            </button>
            <button
              type="button"
              onClick={() => setSelectedDay("2026-09-19")}
              style={{
                padding: "0.45rem 1rem",
                borderRadius: "9999px",
                fontSize: "0.85rem",
                fontWeight: 700,
                cursor: "pointer",
                border: "1px solid",
                transition: "all 0.15s ease",
                background: selectedDay === "2026-09-19" ? "var(--color-primary)" : "#ffffff",
                color: selectedDay === "2026-09-19" ? "#ffffff" : "var(--color-text-secondary)",
                borderColor: selectedDay === "2026-09-19" ? "var(--color-primary)" : "#cbd5e1",
              }}
            >
              Day 2 — Sat, 19 Sep 2026
            </button>
          </div>

          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: "220px", position: "relative" }}>
              <label htmlFor="session-search" className="input-label">
                Search Agenda
              </label>
              <div style={{ position: "relative" }}>
                <Search size={16} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} />
                <input
                  id="session-search"
                  type="search"
                  className="input"
                  style={{ paddingLeft: "2.4rem" }}
                  placeholder="Search by topic, speaker, or hall..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Search sessions"
                />
              </div>
            </div>

            <div style={{ minWidth: "180px" }}>
              <label htmlFor="category-filter" className="input-label">
                Format / Category
              </label>
              <select
                id="category-filter"
                className="input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                aria-label="Filter by category"
              >
                <option value="">All Categories</option>
                {SESSION_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div style={{ textAlign: "center", padding: "4rem" }}>
            <div className="spinner" style={{ width: "2rem", height: "2rem", margin: "0 auto" }} role="status" aria-label="Loading sessions" />
            <p style={{ color: "var(--color-text-muted)", marginTop: "1rem", fontSize: "0.9rem" }}>Loading agenda...</p>
          </div>
        )}        {/* Session Grid */}
        {!loading && (
          <div className="grid-3" style={{ gap: "1.5rem" }}>
            {sessions
              .filter((session) => selectedDay === "all" || session.start_time.startsWith(selectedDay))
              .map((session) => {
                const fillPct = Math.round((session.registered / session.capacity) * 100);
                const color = CATEGORY_COLORS[session.category] ?? "var(--color-primary)";
                return (
                  <article
                    key={session.id}
                    className="glass-card"
                    style={{
                      padding: "1.6rem 1.75rem",
                      cursor: "pointer",
                      background: "#ffffff",
                      display: "flex",
                      flexDirection: "column",
                      border: "1px solid #cbd5e1",
                      borderRadius: "0.75rem",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                      transition: "all 0.2s ease",
                    }}
                    onClick={() => void handleSessionClick(session)}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") void handleSessionClick(session); }}
                    tabIndex={0}
                    role="button"
                    aria-label={`View details for ${session.title}`}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem", flexWrap: "wrap", gap: "0.5rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <span
                          style={{
                            padding: "0.2rem 0.65rem",
                            borderRadius: "var(--radius-full)",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            background: `${color}12`,
                            color,
                            border: `1px solid ${color}30`,
                          }}
                        >
                          {session.category}
                        </span>
                        {session.isFeatured && (
                          <span className="badge badge-warning" style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                            <Star size={11} fill="currentColor" /> Featured
                          </span>
                        )}
                      </div>

                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.3rem",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          color: "#4f46e5",
                          background: "rgba(79, 70, 229, 0.08)",
                          padding: "0.2rem 0.6rem",
                          borderRadius: "9999px",
                          border: "1px solid rgba(79, 70, 229, 0.2)",
                        }}
                      >
                        <Calendar size={12} /> {formatDate(session.start_time)}
                      </span>
                    </div>

                    <h2 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "0.4rem", color: "var(--color-text-primary)", lineHeight: 1.4 }}>
                      {session.title}
                    </h2>

                    <p style={{ color: "var(--color-primary)", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.6rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <User size={14} /> {session.speaker}
                    </p>

                    <p style={{ color: "var(--color-text-secondary)", fontSize: "0.85rem", marginBottom: "1rem", lineHeight: 1.6, flex: 1 }}>
                      {session.description.slice(0, 110)}...
                    </p>

                    {/* Hall and Clock Time Banner */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: "0.8rem",
                        color: "var(--color-text-muted)",
                        marginBottom: "0.85rem",
                        flexWrap: "wrap",
                        gap: "0.5rem",
                        padding: "0.5rem 0.65rem",
                        background: "#f8fafc",
                        borderRadius: "0.5rem",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontWeight: 600, color: "#1e293b" }}>
                        <MapPin size={13} color="#4f46e5" /> {session.zone}
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontWeight: 600, color: "#0891b2" }}>
                        <Clock size={13} /> {formatTimeRange(session.start_time, session.end_time)}
                      </span>
                    </div>

                    {/* Capacity Meter */}
                    <div>
                      <div style={{ height: "5px", background: "var(--color-bg-3)", borderRadius: "3px", overflow: "hidden" }} role="progressbar" aria-valuenow={fillPct} aria-valuemin={0} aria-valuemax={100} aria-label={`${fillPct}% capacity`}>
                        <div
                          style={{
                            height: "100%",
                            width: `${fillPct}%`,
                            background: fillPct > 90 ? "var(--color-danger)" : fillPct > 70 ? "var(--color-warning)" : "var(--color-success)",
                            borderRadius: "3px",
                          }}
                        />
                      </div>
                      <div style={{ color: "var(--color-text-muted)", fontSize: "0.75rem", marginTop: "0.35rem", display: "flex", justifyContent: "space-between" }}>
                        <span>{session.registered} registered</span>
                        <span>{fillPct}% full</span>
                      </div>
                    </div>
                  </article>
                );
              })}
          </div>
        )}

        {/* Session Detail Modal */}
        {selectedSession && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15, 23, 42, 0.6)",
              backdropFilter: "blur(4px)",
              zIndex: 200,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "1.5rem",
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="session-modal-title"
            onClick={(e) => { if (e.target === e.currentTarget) setSelectedSession(null); }}
          >
            <div
              className="glass-card fade-in-up"
              style={{
                maxWidth: "600px",
                width: "100%",
                padding: "2.25rem",
                maxHeight: "85vh",
                overflowY: "auto",
                background: "#ffffff",
                boxShadow: "var(--shadow-lg)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
                <h2 id="session-modal-title" style={{ fontSize: "1.35rem", fontWeight: 800, flex: 1, paddingRight: "1rem" }}>
                  {selectedSession.title}
                </h2>
                <button
                  onClick={() => setSelectedSession(null)}
                  className="btn btn-ghost btn-sm"
                  style={{ borderRadius: "50%", width: "32px", height: "32px", padding: 0 }}
                  aria-label="Close session details"
                >
                  <X size={16} />
                </button>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1.25rem" }}>
                <span className="badge badge-primary">{selectedSession.category}</span>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    color: "#4f46e5",
                    background: "rgba(79, 70, 229, 0.08)",
                    padding: "0.25rem 0.65rem",
                    borderRadius: "9999px",
                    border: "1px solid rgba(79, 70, 229, 0.2)",
                  }}
                >
                  <Calendar size={12} /> {formatDate(selectedSession.start_time)}
                </span>
                <span className="badge badge-info" style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  <MapPin size={12} /> {selectedSession.zone}
                </span>
                <span className="badge badge-success" style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  <Clock size={12} /> {formatTimeRange(selectedSession.start_time, selectedSession.end_time)}
                </span>
              </div>

              <p style={{ color: "var(--color-primary)", fontWeight: 700, fontSize: "0.95rem", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <User size={16} /> {selectedSession.speaker}
              </p>
              <p style={{ color: "var(--color-text-secondary)", marginBottom: "1.5rem", lineHeight: 1.7, fontSize: "0.925rem" }}>
                {selectedSession.description}
              </p>

              {/* Gemini AI Summary Card */}
              <div
                style={{
                  padding: "1.35rem",
                  borderRadius: "var(--radius-lg)",
                  background: "rgba(79, 70, 229, 0.04)",
                  border: "1px solid rgba(79, 70, 229, 0.15)",
                  marginBottom: "1.5rem",
                }}
                aria-live="polite"
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                  <span className="badge badge-gemini" style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <Sparkles size={12} /> Google Gemini Summary
                  </span>
                </div>
                {summaryLoading ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.5rem 0" }}>
                    <div className="spinner" role="status" aria-label="Loading Gemini summary" />
                    <span style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
                      Generating intelligent session takeaways...
                    </span>
                  </div>
                ) : summary ? (
                  <div>
                    <p style={{ color: "var(--color-text-primary)", marginBottom: "1rem", lineHeight: 1.65, fontSize: "0.9rem" }}>
                      {summary.summary}
                    </p>
                    <div style={{ marginBottom: "0.75rem" }}>
                      <strong style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Key Takeaways
                      </strong>
                      <ul style={{ marginTop: "0.4rem", paddingLeft: "1.25rem" }}>
                        {summary.keyTakeaways.map((t, i) => (
                          <li key={i} style={{ color: "var(--color-text-secondary)", fontSize: "0.85rem", marginBottom: "0.25rem" }}>
                            {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                      <Target size={14} color="var(--color-primary)" /> Ideal for: {summary.targetAudience}
                    </div>
                  </div>
                ) : (
                  <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem" }}>Summary unavailable at this moment</p>
                )}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  onClick={() => setSelectedSession(null)}
                  className="btn btn-primary"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
