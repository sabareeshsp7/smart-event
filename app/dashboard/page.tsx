"use client";
/**
 * Organizer Dashboard — Command center for sessions, alerts, attendee metrics, and health.
 * Clean light mode aesthetic with Lucide icons and zero emojis.
 */

import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Calendar,
  ShieldAlert,
  Users,
  Bell,
  RefreshCw,
  Send,
  CheckCircle2,
  AlertCircle,
  Activity,
  PhoneCall,
  UserCheck,
} from "lucide-react";
import { API_ROUTES, EMERGENCY_CONTACTS } from "@/lib/constants";

interface DashboardStats {
  totalSessions: number;
  activeAlerts: number;
  avgOccupancy: number;
  crowdZones: number;
  totalAttendees: number;
}

interface Alert {
  id: string;
  title: string;
  severity: string;
  zone: string;
  created_at: string;
}

/** Organizer Dashboard page in Light Mode with zero emojis. */
export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalSessions: 0,
    activeAlerts: 0,
    avgOccupancy: 0,
    crowdZones: 0,
    totalAttendees: 1420,
  });
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAlert, setNewAlert] = useState({ title: "", message: "", severity: "medium", zone: "All Areas" });
  const [posting, setPosting] = useState(false);
  const [postResult, setPostResult] = useState<{ success: boolean; message: string } | null>(null);
  const [healthData, setHealthData] = useState<{
    services?: Record<string, { status: string; note?: string }>;
  } | null>(null);

  useEffect(() => {
    void loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [sessionsRes, alertsRes, crowdRes, healthRes, attendeesRes] = await Promise.all([
        fetch(`${API_ROUTES.SESSIONS}?limit=50`),
        fetch(API_ROUTES.ALERTS),
        fetch(API_ROUTES.CROWD),
        fetch(API_ROUTES.HEALTH),
        fetch("/api/attendees"),
      ]);

      const [sessions, alertsData, crowdData, health, attendeesData] = await Promise.all([
        sessionsRes.json() as Promise<{ total: number }>,
        alertsRes.json() as Promise<{ alerts: Alert[] }>,
        crowdRes.json() as Promise<{ zones: Array<{ occupancy: number; capacity: number }> }>,
        healthRes.json() as Promise<Record<string, unknown>>,
        attendeesRes.ok ? (attendeesRes.json() as Promise<{ total: number }>) : Promise.resolve({ total: 1420 }),
      ]);

      const avgOcc = crowdData.zones.length > 0
        ? Math.round(crowdData.zones.reduce((s, z) => s + (z.occupancy / z.capacity) * 100, 0) / crowdData.zones.length)
        : 0;

      setStats({
        totalSessions: sessions.total,
        activeAlerts: alertsData.alerts.length,
        avgOccupancy: avgOcc,
        crowdZones: crowdData.zones.length,
        totalAttendees: attendeesData.total,
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
        setPostResult({ success: true, message: "Alert published successfully to all delegate feeds." });
        setNewAlert({ title: "", message: "", severity: "medium", zone: "All Areas" });
        void loadDashboardData();
      } else {
        setPostResult({ success: false, message: "Failed to publish alert. Check admin authorization." });
      }
    } catch {
      setPostResult({ success: false, message: "Network connection error while broadcasting alert." });
    } finally {
      setPosting(false);
    }
  };

  const STAT_CARDS = [
    { label: "Active Sessions", value: stats.totalSessions, icon: Calendar, color: "#4f46e5" },
    { label: "Registered Attendees", value: stats.totalAttendees.toLocaleString(), icon: UserCheck, color: "#0891b2" },
    { label: "Live Active Alerts", value: stats.activeAlerts, icon: Bell, color: "#dc2626" },
    { label: "Average Density", value: `${stats.avgOccupancy}%`, icon: Users, color: "#d97706" },
  ] as const;

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
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
              <LayoutDashboard size={14} /> Operations Command
            </div>
            <h1 className="section-title">
              Organizer <span className="gradient-text">Dashboard</span>
            </h1>
            <p className="section-subtitle" style={{ marginBottom: 0 }}>
              Live telemetry, session logistics, and safety dispatch monitoring
            </p>
          </div>

          <button onClick={() => void loadDashboardData()} className="btn btn-ghost" aria-label="Refresh dashboard data">
            <RefreshCw size={15} /> Refresh Data
          </button>
        </div>

        {/* Statistics Grid */}
        <section aria-labelledby="stats-heading" style={{ marginBottom: "2.5rem" }}>
          <h2 id="stats-heading" className="sr-only">Dashboard Metrics</h2>
          <div className="grid-4" style={{ gap: "1.25rem" }}>
            {STAT_CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.label}
                  className="glass-card"
                  style={{
                    padding: "1.5rem",
                    background: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    gap: "1.25rem",
                  }}
                >
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "var(--radius-md)",
                      background: `${card.color}12`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: card.color,
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={22} />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "1.75rem",
                        fontWeight: 900,
                        color: "var(--color-text-primary)",
                        fontFamily: "var(--font-display)",
                        lineHeight: 1.1,
                      }}
                    >
                      {loading ? "—" : card.value}
                    </div>
                    <div style={{ color: "var(--color-text-secondary)", fontSize: "0.825rem", fontWeight: 500, marginTop: "0.25rem" }}>
                      {card.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <div className="grid-2" style={{ gap: "2rem" }}>
          {/* Publish Alert Form */}
          <section aria-labelledby="publish-alert-heading">
            <h2 id="publish-alert-heading" style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Bell size={18} color="var(--color-primary)" /> Broadcast Public Advisory
            </h2>
            <div className="glass-card" style={{ padding: "1.75rem", background: "#ffffff" }}>
              <div style={{ marginBottom: "1rem" }}>
                <label htmlFor="alert-title" className="input-label">Advisory Headline *</label>
                <input
                  id="alert-title"
                  type="text"
                  className="input"
                  placeholder="e.g. Keynote Hall Turnstiles Open"
                  value={newAlert.title}
                  onChange={(e) => setNewAlert((a) => ({ ...a, title: e.target.value }))}
                />
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label htmlFor="alert-message" className="input-label">Advisory Details *</label>
                <textarea
                  id="alert-message"
                  className="input"
                  placeholder="Enter detailed message for attendees..."
                  rows={3}
                  style={{ resize: "vertical" }}
                  value={newAlert.message}
                  onChange={(e) => setNewAlert((a) => ({ ...a, message: e.target.value }))}
                />
              </div>

              <div className="grid-2" style={{ gap: "1rem", marginBottom: "1.5rem" }}>
                <div>
                  <label htmlFor="alert-severity" className="input-label">Urgency Level</label>
                  <select
                    id="alert-severity"
                    className="input"
                    value={newAlert.severity}
                    onChange={(e) => setNewAlert((a) => ({ ...a, severity: e.target.value }))}
                  >
                    <option value="low">Standard Notice (Low)</option>
                    <option value="medium">Important Advisory (Medium)</option>
                    <option value="high">High Priority (High)</option>
                    <option value="critical">Critical Emergency</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="alert-zone" className="input-label">Targeted Venue Zone</label>
                  <input
                    id="alert-zone"
                    type="text"
                    className="input"
                    value={newAlert.zone}
                    onChange={(e) => setNewAlert((a) => ({ ...a, zone: e.target.value }))}
                  />
                </div>
              </div>

              <button
                onClick={() => void postAlert()}
                disabled={posting || !newAlert.title || !newAlert.message}
                className="btn btn-primary"
                id="publish-alert-btn"
                style={{ width: "100%" }}
              >
                {posting ? (
                  <div className="spinner" />
                ) : (
                  <>
                    <Send size={16} /> Broadcast Advisory
                  </>
                )}
              </button>

              {postResult && (
                <div
                  style={{
                    marginTop: "1rem",
                    padding: "0.75rem 1rem",
                    borderRadius: "var(--radius-md)",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontSize: "0.85rem",
                    background: postResult.success ? "rgba(5, 150, 105, 0.08)" : "rgba(220, 38, 38, 0.08)",
                    border: postResult.success ? "1px solid rgba(5, 150, 105, 0.25)" : "1px solid rgba(220, 38, 38, 0.25)",
                    color: postResult.success ? "var(--color-success)" : "var(--color-danger)",
                  }}
                >
                  {postResult.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  <span>{postResult.message}</span>
                </div>
              )}
            </div>
          </section>

          {/* Recent Alerts Feed */}
          <section aria-labelledby="recent-alerts-heading">
            <h2 id="recent-alerts-heading" style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <ShieldAlert size={18} color="var(--color-danger)" /> Active Advisories
            </h2>
            {loading ? (
              <div className="glass-card" style={{ padding: "3rem", textAlign: "center", background: "#ffffff" }}>
                <div className="spinner" style={{ margin: "0 auto" }} role="status" aria-label="Loading alerts" />
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                {alerts.map((a) => (
                  <div
                    key={a.id}
                    className="glass-card"
                    style={{
                      padding: "1rem 1.25rem",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      background: "#ffffff",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--color-text-primary)" }}>{a.title}</div>
                      <div style={{ color: "var(--color-text-secondary)", fontSize: "0.75rem", marginTop: "0.2rem" }}>
                        {a.zone} • Published {new Date(a.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                    <span className={`badge badge-${a.severity === "critical" || a.severity === "high" ? "danger" : a.severity === "medium" ? "warning" : "success"}`}>
                      {a.severity}
                    </span>
                  </div>
                ))}
                {alerts.length === 0 && (
                  <div className="glass-card" style={{ padding: "2.5rem", textAlign: "center", color: "var(--color-text-muted)", background: "#ffffff" }}>
                    No active broadcast alerts currently active
                  </div>
                )}
              </div>
            )}
          </section>
        </div>

        {/* System Health Status */}
        {healthData && (
          <section aria-labelledby="health-heading" style={{ marginTop: "2.5rem" }}>
            <h2 id="health-heading" style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Activity size={18} color="var(--color-success)" /> Infrastructure Health Status
            </h2>
            <div className="glass-card" style={{ padding: "1.5rem", background: "#ffffff" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem" }}>
                {healthData.services &&
                  Object.entries(healthData.services).map(([svc, info]) => (
                    <div
                      key={svc}
                      style={{
                        padding: "0.85rem 1rem",
                        background: "var(--color-bg)",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--color-border)",
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: "0.85rem", textTransform: "capitalize", color: "var(--color-text-primary)" }}>
                        {svc}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", marginTop: "0.35rem" }}>
                        <div
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            background: info.status === "healthy" ? "var(--color-success)" : "var(--color-warning)",
                          }}
                        />
                        <span style={{ fontSize: "0.8rem", fontWeight: 600, color: info.status === "healthy" ? "var(--color-success)" : "var(--color-warning)" }}>
                          {info.status}
                        </span>
                        {info.note && <span style={{ color: "var(--color-text-muted)", fontSize: "0.75rem" }}> ({info.note})</span>}
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          </section>
        )}

        {/* Emergency Footnote */}
        <div
          style={{
            marginTop: "2rem",
            padding: "1rem 1.25rem",
            borderRadius: "var(--radius-md)",
            background: "rgba(220, 38, 38, 0.05)",
            border: "1px solid rgba(220, 38, 38, 0.2)",
            display: "flex",
            gap: "1.5rem",
            flexWrap: "wrap",
            alignItems: "center",
          }}
          role="complementary"
        >
          <span style={{ color: "var(--color-danger)", fontWeight: 700, fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <ShieldAlert size={16} /> Security Speedline:
          </span>
          {EMERGENCY_CONTACTS.slice(0, 3).map((c) => (
            <a key={c.number} href={`tel:${c.number}`} style={{ color: "var(--color-danger)", fontWeight: 600, fontSize: "0.85rem", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <PhoneCall size={13} /> {c.label}: {c.number}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
