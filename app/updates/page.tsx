"use client";
/**
 * Real-time Updates page — live alerts and announcements with aria-live.
 * RULE A11Y-9: Dynamic content updates use aria-live="polite".
 */

import { useState, useEffect } from "react";
import { API_ROUTES, EMERGENCY_CONTACTS } from "@/lib/constants";

interface Alert {
  id: string;
  title: string;
  message: string;
  severity: "low" | "medium" | "high" | "critical";
  zone: string;
  is_active: number;
  created_at: string;
}

const SEVERITY_CONFIG = {
  low: { color: "#10b981", bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.3)", icon: "ℹ️", label: "Info" },
  medium: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)", icon: "⚠️", label: "Warning" },
  high: { color: "#ef4444", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.3)", icon: "🔴", label: "High" },
  critical: { color: "#dc2626", bg: "rgba(220,38,38,0.15)", border: "rgba(220,38,38,0.5)", icon: "🚨", label: "Critical" },
} as const;

/** Real-time updates page. */
export default function UpdatesPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  useEffect(() => {
    void loadAlerts();
    const interval = setInterval(() => void loadAlerts(), 15_000);
    return () => clearInterval(interval);
  }, []);

  const loadAlerts = async () => {
    try {
      const res = await fetch(API_ROUTES.ALERTS);
      if (!res.ok) return;
      const data = await res.json() as { alerts: Alert[] };
      setAlerts(data.alerts);
      setLastUpdated(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleString("en-IN", {
        month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="page-wrapper">
      <div className="container" style={{ paddingTop: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
          <h1 className="section-title">
            📢 Real-Time <span className="gradient-text">Updates</span>
          </h1>
          <button onClick={() => void loadAlerts()} className="btn btn-ghost btn-sm" aria-label="Refresh alerts">
            🔄 Refresh
          </button>
        </div>
        <p className="section-subtitle">
          Live announcements, schedule changes, and safety alerts · Auto-refreshes every 15s
          {lastUpdated && <span style={{ marginLeft: "0.5rem", color: "var(--color-text-muted)" }}>· Updated: {lastUpdated}</span>}
        </p>

        {/* Live indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "2rem" }}>
          <div
            style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981", animation: "pulse-ring 1.5s ease-in-out infinite" }}
            aria-hidden="true"
          />
          <span style={{ color: "#34d399", fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>
            LIVE
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem" }}>
            <div className="spinner" style={{ width: "2rem", height: "2rem", margin: "0 auto" }} role="status" aria-label="Loading alerts" />
            <p style={{ color: "var(--color-text-muted)", marginTop: "1rem" }}>Loading updates...</p>
          </div>
        ) : (
          <section
            aria-labelledby="alerts-heading"
            aria-live="polite"
            aria-atomic="false"
            aria-relevant="additions"
          >
            <h2 id="alerts-heading" className="sr-only">Live alerts and announcements</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {alerts.length === 0 ? (
                <div style={{ textAlign: "center", padding: "4rem", color: "var(--color-text-muted)" }}>
                  <div style={{ fontSize: "3rem", marginBottom: "1rem" }} aria-hidden="true">✅</div>
                  <p style={{ fontWeight: 600 }}>No active alerts</p>
                  <p style={{ fontSize: "0.875rem", marginTop: "0.5rem" }}>The event is running smoothly!</p>
                </div>
              ) : (
                alerts.map((alert) => {
                  const config = SEVERITY_CONFIG[alert.severity] ?? SEVERITY_CONFIG.low;
                  return (
                    <article
                      key={alert.id}
                      className="alert-banner"
                      style={{ background: config.bg, borderColor: config.border }}
                      role="alert"
                      aria-label={`${config.label} alert: ${alert.title}`}
                    >
                      <span style={{ fontSize: "1.5rem", flexShrink: 0 }} aria-hidden="true">{config.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.375rem", flexWrap: "wrap", gap: "0.5rem" }}>
                          <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: config.color }}>{alert.title}</h3>
                          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexShrink: 0 }}>
                            <span
                              style={{
                                padding: "0.15rem 0.5rem",
                                borderRadius: "var(--radius-full)",
                                background: `${config.color}20`,
                                color: config.color,
                                fontSize: "0.7rem",
                                fontWeight: 700,
                                textTransform: "uppercase",
                                border: `1px solid ${config.color}40`,
                              }}
                            >
                              {config.label}
                            </span>
                            <span style={{ color: "var(--color-text-muted)", fontSize: "0.75rem" }}>{formatTime(alert.created_at)}</span>
                          </div>
                        </div>
                        <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem", marginBottom: "0.375rem" }}>
                          {alert.message}
                        </p>
                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                          <span style={{ color: "var(--color-text-muted)", fontSize: "0.75rem" }}>📍 {alert.zone}</span>
                          {alert.severity === "critical" || alert.severity === "high" ? (
                            <a href="tel:112" style={{ color: "#f87171", fontSize: "0.75rem", fontWeight: 700, textDecoration: "none" }}>
                              🚨 Call 112 if emergency
                            </a>
                          ) : null}
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </section>
        )}

        {/* Emergency strip */}
        <div
          style={{ marginTop: "2.5rem", padding: "1rem 1.5rem", borderRadius: "var(--radius-md)", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}
          role="complementary"
          aria-label="Emergency contacts"
        >
          <span style={{ color: "#f87171", fontWeight: 700, fontSize: "0.85rem" }}>🚨 Emergency:</span>
          {EMERGENCY_CONTACTS.slice(0, 4).map((c) => (
            <a key={c.number} href={`tel:${c.number}`} style={{ color: "#f87171", fontWeight: 700, fontSize: "0.875rem", textDecoration: "none" }}>
              {c.icon} {c.number}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
