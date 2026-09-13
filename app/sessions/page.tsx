"use client";
/**
 * Sessions page — searchable, filterable session grid.
 * RULE EFF-10: useDebounce on search input.
 */

import { useState, useEffect } from "react";
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
  Keynote: "#f59e0b",
  Workshop: "#8b5cf6",
  Panel: "#06b6d4",
  "Lightning Talk": "#10b981",
  Demo: "#ec4899",
  Networking: "#3b82f6",
  Awards: "#f97316",
};

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  } catch {
    return iso;
  }
}

/** Sessions discovery page with search and filtering. */
export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
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
        // Fallback to empty
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
      <div className="container" style={{ paddingTop: "2rem" }}>
        <h1 className="section-title">
          📅 Session <span className="gradient-text">Discovery</span>
        </h1>
        <p className="section-subtitle">Browse and search all {total} sessions</p>

        {/* Filters */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <label htmlFor="session-search" className="input-label">Search sessions</label>
            <input
              id="session-search"
              type="search"
              className="input"
              placeholder="Search by title, speaker, or topic..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search sessions"
            />
          </div>
          <div style={{ minWidth: "160px" }}>
            <label htmlFor="category-filter" className="input-label">Category</label>
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

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: "4rem" }}>
            <div className="spinner" style={{ width: "2rem", height: "2rem", margin: "0 auto" }} role="status" aria-label="Loading sessions" />
            <p style={{ color: "var(--color-text-muted)", marginTop: "1rem" }}>Loading sessions...</p>
          </div>
        )}

        {/* Session Grid */}
        {!loading && (
          <div className="grid-3">
            {sessions.map((session) => {
              const fillPct = Math.round((session.registered / session.capacity) * 100);
              const color = CATEGORY_COLORS[session.category] ?? "#8b5cf6";
              return (
                <article
                  key={session.id}
                  className="glass-card"
                  style={{ padding: "1.5rem", cursor: "pointer" }}
                  onClick={() => void handleSessionClick(session)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") void handleSessionClick(session); }}
                  tabIndex={0}
                  role="button"
                  aria-label={`View details for ${session.title}`}
                >
                  {session.isFeatured && (
                    <div className="badge badge-warning" style={{ marginBottom: "0.75rem" }}>⭐ Featured</div>
                  )}
                  <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
                    <span
                      style={{
                        padding: "0.2rem 0.6rem",
                        borderRadius: "var(--radius-full)",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        background: `${color}20`,
                        color,
                        border: `1px solid ${color}40`,
                      }}
                    >
                      {session.category}
                    </span>
                  </div>
                  <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.4rem", color: "var(--color-text-primary)" }}>
                    {session.title}
                  </h2>
                  <p style={{ color: "var(--color-primary-light)", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                    👤 {session.speaker}
                  </p>
                  <p style={{ color: "var(--color-text-muted)", fontSize: "0.8rem", marginBottom: "1rem", lineHeight: 1.5 }}>
                    {session.description.slice(0, 80)}...
                  </p>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>
                    <span>📍 {session.zone}</span>
                    <span>🕐 {formatTime(session.start_time)}</span>
                  </div>
                  {/* Capacity bar */}
                  <div style={{ marginTop: "0.75rem" }}>
                    <div style={{ height: "4px", background: "rgba(255,255,255,0.1)", borderRadius: "2px", overflow: "hidden" }} role="progressbar" aria-valuenow={fillPct} aria-valuemin={0} aria-valuemax={100} aria-label={`${fillPct}% full`}>
                      <div
                        style={{
                          height: "100%",
                          width: `${fillPct}%`,
                          background: fillPct > 90 ? "var(--color-danger)" : fillPct > 70 ? "var(--color-warning)" : "var(--color-success)",
                          borderRadius: "2px",
                        }}
                      />
                    </div>
                    <div style={{ color: "var(--color-text-muted)", fontSize: "0.75rem", marginTop: "0.25rem" }}>
                      {session.registered}/{session.capacity} registered ({fillPct}%)
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
              background: "rgba(0,0,0,0.8)",
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
              className="glass-card"
              style={{ maxWidth: "600px", width: "100%", padding: "2rem", maxHeight: "80vh", overflowY: "auto" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
                <h2 id="session-modal-title" style={{ fontSize: "1.25rem", fontWeight: 700, flex: 1 }}>
                  {selectedSession.title}
                </h2>
                <button onClick={() => setSelectedSession(null)} className="btn btn-ghost btn-sm" aria-label="Close session details">✕</button>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
                <span className="badge badge-primary">{selectedSession.category}</span>
                <span className="badge badge-info">📍 {selectedSession.zone}</span>
                <span className="badge badge-success">🕐 {formatTime(selectedSession.start_time)}</span>
              </div>

              <p style={{ color: "var(--color-primary-light)", fontWeight: 600, marginBottom: "0.5rem" }}>
                👤 {selectedSession.speaker}
              </p>
              <p style={{ color: "var(--color-text-secondary)", marginBottom: "1.5rem", lineHeight: 1.7 }}>
                {selectedSession.description}
              </p>

              {/* Gemini Summary */}
              <div
                style={{
                  padding: "1.25rem",
                  borderRadius: "var(--radius-md)",
                  background:
                    "linear-gradient(135deg,rgba(66,133,244,0.1),rgba(52,168,83,0.1),rgba(251,188,5,0.1),rgba(234,67,53,0.1))",
                  border: "1px solid rgba(255,255,255,0.1)",
                  marginBottom: "1rem",
                }}
                aria-live="polite"
                aria-label="Gemini AI session summary"
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                  <span className="badge badge-gemini">✦ Powered by Google Gemini</span>
                </div>
                {summaryLoading ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div className="spinner" role="status" aria-label="Loading Gemini summary" />
                    <span style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
                      Generating AI summary...
                    </span>
                  </div>
                ) : summary ? (
                  <div>
                    <p style={{ color: "var(--color-text-secondary)", marginBottom: "1rem", lineHeight: 1.7 }}>
                      {summary.summary}
                    </p>
                    <div style={{ marginBottom: "0.75rem" }}>
                      <strong style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Key Takeaways
                      </strong>
                      <ul style={{ marginTop: "0.5rem", paddingLeft: "1.25rem" }}>
                        {summary.keyTakeaways.map((t, i) => (
                          <li key={i} style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem", marginBottom: "0.3rem" }}>{t}</li>
                        ))}
                      </ul>
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                      🎯 Best for: {summary.targetAudience}
                    </div>
                  </div>
                ) : (
                  <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>Summary unavailable</p>
                )}
              </div>

              <div style={{ display: "flex", gap: "0.75rem" }}>
                <a
                  href={`tel:+91-9876-543210`}
                  className="btn btn-ghost btn-sm"
                  aria-label="Contact event security"
                >
                  🛡️ Need Help? Call Security
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
