"use client";
/**
 * Organizer Dashboard — manage sessions, alerts, and view crowd overview.
 */

import { useState, useEffect } from "react";
import { API_ROUTES, EMERGENCY_CONTACTS } from "@/lib/constants";

interface DashboardStats {
  totalSessions: number;
  activeAlerts: number;
  avgOccupancy: number;
  crowdZones: number;
}

interface Alert {
  id: string;
  title: string;
  severity: string;
  zone: string;
  created_at: string;
}

/** Organizer Dashboard page. */
export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({ totalSessions: 0, activeAlerts: 0, avgOccupancy: 0, crowdZones: 0 });
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAlert, setNewAlert] = useState({ title: "", message: "", severity: "medium", zone: "All Areas" });
  const [posting, setPosting] = useState(false);
  const [postResult, setPostResult] = useState<string | null>(null);
  const [healthData, setHealthData] = useState<{
    services?: Record<string, { status: string; note?: string }>;
  } | null>(null);

  useEffect(() => {
    void loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [sessionsRes, alertsRes, crowdRes, healthRes] = await Promise.all([
        fetch(`${API_ROUTES.SESSIONS}?limit=50`),
        fetch(API_ROUTES.ALERTS),
        fetch(API_ROUTES.CROWD),
        fetch(API_ROUTES.HEALTH),
      ]);

      const [sessions, alertsData, crowdData, health] = await Promise.all([
        sessionsRes.json() as Promise<{ total: number }>,
        alertsRes.json() as Promise<{ alerts: Alert[] }>,
        crowdRes.json() as Promise<{ zones: Array<{ occupancy: number; capacity: number }> }>,
        healthRes.json() as Promise<Record<string, unknown>>,
      ]);

      const avgOcc = crowdData.zones.length > 0
        ? Math.round(crowdData.zones.reduce((s, z) => s + (z.occupancy / z.capacity) * 100, 0) / crowdData.zones.length)
        : 0;

      setStats({
        totalSessions: sessions.total,
        activeAlerts: alertsData.alerts.length,
        avgOccupancy: avgOcc,
        crowdZones: crowdData.zones.length,
      });
      setAlerts(alertsData.alerts.slice(0, 5));
      setHealthData(health);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  const postAlert = async () => {
    if (!newAlert.title || !newAlert.message) return;
    setPosting(true);
    setPostResult(null);
    try {
      const res = await fetch(API_ROUTES.ALERTS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newAlert, adminKey: "eventiq-dev-key" }),
      });
      if (res.ok) {
        setPostResult("✅ Alert published successfully!");
        setNewAlert({ title: "", message: "", severity: "medium", zone: "All Areas" });
        void loadDashboardData();
      } else {
        setPostResult("❌ Failed to publish alert.");
      }
    } catch {
      setPostResult("❌ Network error");
    } finally {
      setPosting(false);
    }
  };

  const STAT_CARDS = [
    { label: "Total Sessions", value: stats.totalSessions, icon: "📅", color: "#8b5cf6" },
    { label: "Active Alerts", value: stats.activeAlerts, icon: "🚨", color: "#ef4444" },
    { label: "Avg Occupancy", value: `${stats.avgOccupancy}%`, icon: "👥", color: "#f59e0b" },
    { label: "Monitored Zones", value: stats.crowdZones, icon: "🗺️", color: "#10b981" },
  ] as const;

  return (
    <div className="page-wrapper">
      <div className="container" style={{ paddingTop: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
          <div>
            <h1 className="section-title">
              ⚡ Organizer <span className="gradient-text">Dashboard</span>
            </h1>
            <p className="section-subtitle" style={{ marginBottom: 0 }}>
              Event command center — monitor, manage, and control
            </p>
          </div>
          <button onClick={() => void loadDashboardData()} className="btn btn-ghost btn-sm" aria-label="Refresh dashboard data">
            🔄 Refresh
          </button>
        </div>

        {/* Stats */}
        <section aria-labelledby="stats-heading" style={{ marginBottom: "2.5rem" }}>
          <h2 id="stats-heading" className="sr-only">Dashboard Statistics</h2>
          <div className="grid-4">
            {STAT_CARDS.map((card) => (
              <div key={card.label} className="glass-card" style={{ padding: "1.5rem", textAlign: "center" }}>
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }} aria-hidden="true">{card.icon}</div>
                <div
                  style={{ fontSize: "2.25rem", fontWeight: 900, color: card.color, fontFamily: "var(--font-display)", lineHeight: 1 }}
                  aria-label={`${card.label}: ${card.value}`}
                >
                  {loading ? "—" : card.value}
                </div>
                <div style={{ color: "var(--color-text-muted)", fontSize: "0.8rem", marginTop: "0.375rem" }}>{card.label}</div>
              </div>
            ))}
          </div>
        </section>

        <div className="grid-2">
          {/* Publish Alert */}
          <section aria-labelledby="publish-alert-heading">
            <h2 id="publish-alert-heading" style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>
              📢 Publish New Alert
            </h2>
            <div className="glass-card" style={{ padding: "1.5rem" }}>
              <div style={{ marginBottom: "1rem" }}>
                <label htmlFor="alert-title" className="input-label">Alert Title *</label>
                <input
                  id="alert-title"
                  type="text"
                  className="input"
                  placeholder="e.g., Session Starting Soon"
                  value={newAlert.title}
                  onChange={(e) => setNewAlert((a) => ({ ...a, title: e.target.value }))}
                  aria-required="true"
                />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label htmlFor="alert-message" className="input-label">Message *</label>
                <textarea
                  id="alert-message"
                  className="input"
                  placeholder="Alert message..."
                  rows={3}
                  style={{ resize: "vertical" }}
                  value={newAlert.message}
                  onChange={(e) => setNewAlert((a) => ({ ...a, message: e.target.value }))}
                  aria-required="true"
                />
              </div>
              <div style={{ display: "flex", gap: "1rem", marginBottom: "1.25rem" }}>
                <div style={{ flex: 1 }}>
                  <label htmlFor="alert-severity" className="input-label">Severity</label>
                  <select
                    id="alert-severity"
                    className="input"
                    value={newAlert.severity}
                    onChange={(e) => setNewAlert((a) => ({ ...a, severity: e.target.value }))}
                    aria-label="Alert severity"
                  >
                    <option value="low">ℹ️ Low</option>
                    <option value="medium">⚠️ Medium</option>
                    <option value="high">🔴 High</option>
                    <option value="critical">🚨 Critical</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label htmlFor="alert-zone" className="input-label">Zone</label>
                  <input
                    id="alert-zone"
                    type="text"
                    className="input"
                    value={newAlert.zone}
                    onChange={(e) => setNewAlert((a) => ({ ...a, zone: e.target.value }))}
                    aria-label="Alert zone"
                  />
                </div>
              </div>

              <button
                onClick={() => void postAlert()}
                disabled={posting || !newAlert.title || !newAlert.message}
                className="btn btn-primary"
                id="publish-alert-btn"
                aria-label="Publish new alert"
              >
                {posting ? <><div className="spinner" role="status" aria-label="Publishing alert" /> Publishing...</> : "📢 Publish Alert"}
              </button>

              {postResult && (
                <p style={{ marginTop: "0.75rem", fontSize: "0.875rem", color: postResult.startsWith("✅") ? "#34d399" : "#f87171" }} aria-live="polite">
                  {postResult}
                </p>
              )}
            </div>
          </section>

          {/* Recent Alerts */}
          <section aria-labelledby="recent-alerts-heading">
            <h2 id="recent-alerts-heading" style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>
              📋 Recent Alerts
            </h2>
            {loading ? (
              <div className="glass-card" style={{ padding: "3rem", textAlign: "center" }}>
                <div className="spinner" style={{ margin: "0 auto" }} role="status" aria-label="Loading alerts" />
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {alerts.map((a) => (
                  <div key={a.id} className="glass-card" style={{ padding: "1rem 1.25rem", display: "flex", gap: "0.75rem", alignItems: "center" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>{a.title}</div>
                      <div style={{ color: "var(--color-text-muted)", fontSize: "0.75rem" }}>
                        {a.zone} · {a.severity.toUpperCase()}
                      </div>
                    </div>
                    <span className={`badge badge-${a.severity === "critical" || a.severity === "high" ? "danger" : a.severity === "medium" ? "warning" : "success"}`}>
                      {a.severity}
                    </span>
                  </div>
                ))}
                {alerts.length === 0 && (
                  <div className="glass-card" style={{ padding: "2rem", textAlign: "center", color: "var(--color-text-muted)" }}>
                    No active alerts
                  </div>
                )}
              </div>
            )}
          </section>
        </div>

        {/* Health Status */}
        {healthData && (
          <section aria-labelledby="health-heading" style={{ marginTop: "2rem" }}>
            <h2 id="health-heading" style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>
              ❤️ System Health
            </h2>
            <div className="glass-card" style={{ padding: "1rem 1.5rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "0.75rem" }}>
                {healthData.services &&
                  Object.entries(healthData.services).map(([svc, info]) => (
                    <div key={svc} style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>
                      <strong style={{ textTransform: "capitalize" }}>{svc}:</strong>{" "}
                      <span style={{ color: info.status === "healthy" ? "#34d399" : "#fbbf24" }}>{info.status}</span>
                      {info.note && <span style={{ color: "var(--color-text-muted)" }}> ({info.note})</span>}
                    </div>
                  ))
                }
              </div>
            </div>
          </section>
        )}

        {/* Emergency */}
        <div style={{ marginTop: "2rem", padding: "1rem 1.5rem", borderRadius: "var(--radius-md)", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }} role="complementary" aria-label="Emergency contacts">
          <span style={{ color: "#f87171", fontWeight: 700, fontSize: "0.85rem" }}>🚨 Emergency:</span>
          {EMERGENCY_CONTACTS.slice(0, 3).map((c) => (
            <a key={c.number} href={`tel:${c.number}`} style={{ color: "#f87171", fontWeight: 700, fontSize: "0.875rem", textDecoration: "none" }}>
              {c.icon} {c.number}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
