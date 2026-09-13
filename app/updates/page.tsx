"use client";
/**
 * Real-time Updates page — live alerts and announcements with aria-live.
 * Clean light mode aesthetic with Lucide icons and zero emojis.
 */

import { useState, useEffect } from "react";
import { API_ROUTES, EMERGENCY_CONTACTS, VENUE_NAME } from "@/lib/constants";
import {
  RefreshCw,
  Info,
  AlertTriangle,
  AlertOctagon,
  ShieldAlert,
  CheckCircle2,
  MapPin,
  PhoneCall,
  Radio,
} from "lucide-react";

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
  low: {
    color: "#059669",
    bg: "#ecfdf5",
    border: "#a7f3d0",
    icon: Info,
    label: "Notice",
  },
  medium: {
    color: "#d97706",
    bg: "#fffbeb",
    border: "#fde68a",
    icon: AlertTriangle,
    label: "Advisory",
  },
  high: {
    color: "#e11d48",
    bg: "#fff1f2",
    border: "#fecdd3",
    icon: AlertOctagon,
    label: "High Priority",
  },
  critical: {
    color: "#b91c1c",
    bg: "#fef2f2",
    border: "#fca5a5",
    icon: ShieldAlert,
    label: "Critical Alert",
  },
} as const;

export default function UpdatesPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    void loadAlerts();
    const interval = setInterval(() => void loadAlerts(), 15_000);
    return () => clearInterval(interval);
  }, []);

  const loadAlerts = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(API_ROUTES.ALERTS);
      if (!res.ok) return;
      const data = (await res.json()) as { alerts: Alert[] };
      setAlerts(data.alerts);
      setLastUpdated(
        new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const formatTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleString("en-IN", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="page-wrapper" style={{ background: "var(--color-bg)", minHeight: "100vh" }}>
      <div className="container" style={{ paddingTop: "2.5rem", paddingBottom: "4rem" }}>
        
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.35rem 0.85rem", borderRadius: "9999px", background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", color: "#4f46e5", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.75rem" }}>
              <Radio size={15} className="animate-pulse" />
              <span>Real-Time Broadcast Dispatch · {VENUE_NAME}</span>
            </div>
            <h1 className="section-title" style={{ fontSize: "2.2rem", fontWeight: 800, color: "var(--color-text)", letterSpacing: "-0.02em", marginBottom: "0.5rem" }}>
              Live Announcements & <span className="gradient-text">Updates</span>
            </h1>
            <p className="section-subtitle" style={{ color: "var(--color-text-secondary)", fontSize: "1rem" }}>
              Verified schedule announcements, corridor congestion alerts, and security advisories · Syncs every 15s
            </p>
          </div>

          <button
            onClick={() => void loadAlerts()}
            disabled={isRefreshing}
            className="btn btn-ghost"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "#ffffff",
              border: "1px solid var(--color-border)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
            aria-label="Refresh alerts"
          >
            <RefreshCw size={16} className={isRefreshing ? "spin-animation" : ""} />
            <span>{isRefreshing ? "Refreshing..." : "Refresh Feed"}</span>
          </button>
        </div>

        {/* Live sync pulse strip */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "2rem", padding: "0.5rem 1rem", background: "#f8fafc", borderRadius: "0.5rem", border: "1px solid #e2e8f0" }}>
          <div
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              background: "#10b981",
              boxShadow: "0 0 0 4px rgba(16,185,129,0.2)",
            }}
            aria-hidden="true"
          />
          <span style={{ color: "#059669", fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Live Stream Active
          </span>
          {lastUpdated && (
            <span style={{ color: "var(--color-text-muted)", fontSize: "0.8rem", marginLeft: "auto" }}>
              Last synchronized at {lastUpdated}
            </span>
          )}
        </div>

        {/* Alerts Content */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem" }}>
            <div className="spinner" style={{ width: "2rem", height: "2rem", margin: "0 auto" }} role="status" aria-label="Loading alerts" />
            <p style={{ color: "var(--color-text-muted)", marginTop: "1rem" }}>Polling venue broadcast nodes...</p>
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
                <div className="glass-card" style={{ textAlign: "center", padding: "4rem 2rem", color: "var(--color-text-muted)" }}>
                  <div style={{ width: "3.5rem", height: "3.5rem", borderRadius: "50%", background: "#ecfdf5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem auto", color: "#059669" }}>
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--color-text)", marginBottom: "0.25rem" }}>
                    All Systems Normal
                  </h3>
                  <p style={{ fontSize: "0.9rem", color: "var(--color-text-secondary)", margin: 0 }}>
                    No urgent advisories or session delays currently reported. Enjoy your experience at {VENUE_NAME}!
                  </p>
                </div>
              ) : (
                alerts.map((alert) => {
                  const config = SEVERITY_CONFIG[alert.severity] ?? SEVERITY_CONFIG.low;
                  const IconComp = config.icon;
                  return (
                    <article
                      key={alert.id}
                      className="glass-card"
                      style={{
                        padding: "1.25rem 1.5rem",
                        background: config.bg,
                        border: `1px solid ${config.border}`,
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "1.25rem",
                      }}
                      role="alert"
                      aria-label={`${config.label} alert: ${alert.title}`}
                    >
                      <div
                        style={{
                          width: "2.75rem",
                          height: "2.75rem",
                          borderRadius: "0.5rem",
                          background: "#ffffff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: config.color,
                          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                          flexShrink: 0,
                        }}
                        aria-hidden="true"
                      >
                        <IconComp size={22} />
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.35rem", flexWrap: "wrap", gap: "0.5rem" }}>
                          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: config.color, margin: 0 }}>
                            {alert.title}
                          </h3>
                          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexShrink: 0 }}>
                            <span
                              style={{
                                padding: "0.15rem 0.55rem",
                                borderRadius: "9999px",
                                background: "#ffffff",
                                color: config.color,
                                fontSize: "0.7rem",
                                fontWeight: 700,
                                textTransform: "uppercase",
                                border: `1px solid ${config.border}`,
                              }}
                            >
                              {config.label}
                            </span>
                            <span style={{ color: "var(--color-text-muted)", fontSize: "0.75rem" }}>
                              {formatTime(alert.created_at)}
                            </span>
                          </div>
                        </div>

                        <p style={{ color: "var(--color-text)", fontSize: "0.9rem", lineHeight: 1.5, marginBottom: "0.5rem" }}>
                          {alert.message}
                        </p>

                        <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
                          <span style={{ color: "var(--color-text-secondary)", fontSize: "0.8rem", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                            <MapPin size={13} color="#6366f1" />
                            {alert.zone}
                          </span>
                          {(alert.severity === "critical" || alert.severity === "high") && (
                            <a
                              href="tel:112"
                              style={{
                                color: "#b91c1c",
                                fontSize: "0.8rem",
                                fontWeight: 700,
                                textDecoration: "none",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.3rem",
                              }}
                            >
                              <PhoneCall size={13} />
                              Dial 112 for Security Dispatch
                            </a>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </section>
        )}

        {/* Emergency Contact Bar */}
        <div
          style={{
            marginTop: "3rem",
            padding: "1rem 1.5rem",
            borderRadius: "0.5rem",
            background: "#fff1f2",
            border: "1px solid #fecdd3",
            display: "flex",
            gap: "1.5rem",
            flexWrap: "wrap",
            alignItems: "center"
          }}
          role="complementary"
          aria-label="Emergency contacts"
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#e11d48", fontWeight: 700, fontSize: "0.85rem" }}>
            <PhoneCall size={16} />
            <span>Emergency Rapid Line:</span>
          </div>
          {EMERGENCY_CONTACTS.slice(0, 4).map((c) => (
            <a key={c.number} href={`tel:${c.number}`} style={{ color: "#be123c", fontWeight: 600, fontSize: "0.85rem", textDecoration: "none" }}>
              {c.label}: {c.number}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
