"use client";
/**
 * Public Advisory Banner — Prominently displays live safety and schedule advisories.
 * Displayed globally across the application so attendees never miss critical notices.
 * Light mode aesthetic with Lucide icons and zero emojis.
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Info,
  PhoneCall,
  ArrowRight,
  X,
} from "lucide-react";
import { API_ROUTES, ROUTES } from "@/lib/constants";

interface Alert {
  id: string;
  title: string;
  message: string;
  severity: "low" | "medium" | "high" | "critical";
  zone: string;
  is_active?: number;
  created_at?: string;
}

export function PublicAdvisoryBanner() {
  const [activeAlerts, setActiveAlerts] = useState<Alert[]>([]);
  const [isDismissed, setIsDismissed] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    void fetchAlerts();
    const interval = setInterval(() => void fetchAlerts(), 30_000);
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await fetch(API_ROUTES.ALERTS);
      if (!res.ok) return;
      const data = (await res.json()) as { alerts: Alert[] };
      // Filter active alerts
      if (Array.isArray(data.alerts)) {
        setActiveAlerts(data.alerts.slice(0, 5));
      }
    } catch {
      /* ignore */
    }
  };

  if (isDismissed || activeAlerts.length === 0) {
    return null;
  }

  const alert = activeAlerts[currentIndex] ?? activeAlerts[0];
  if (!alert) return null;

  const isCritical = alert.severity === "critical" || alert.severity === "high";

  return (
    <aside
      aria-label="Public Event Advisory"
      style={{
        background: isCritical ? "#fff1f2" : "#f0fdf4",
        borderBottom: `1px solid ${isCritical ? "#fecdd3" : "#bbf7d0"}`,
        padding: "0.6rem 1rem",
        fontSize: "0.85rem",
        position: "relative",
        zIndex: 50,
        boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
        transition: "all 0.2s ease",
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.75rem",
        }}
      >
        {/* Left message area */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flex: 1, minWidth: "260px" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0.25rem 0.5rem",
              borderRadius: "0.375rem",
              background: isCritical ? "#fee2e2" : "#dcfce7",
              color: isCritical ? "#b91c1c" : "#15803d",
              fontWeight: 800,
              fontSize: "0.7rem",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              gap: "0.3rem",
              flexShrink: 0,
            }}
          >
            {isCritical ? <ShieldAlert size={14} /> : <Info size={14} />}
            {alert.severity.toUpperCase()} ADVISORY
          </span>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
            <strong style={{ color: isCritical ? "#991b1b" : "#166534", fontWeight: 700 }}>
              {alert.title}:
            </strong>
            <span style={{ color: "#334155" }}>{alert.message}</span>
            {alert.zone && (
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "#64748b",
                  background: "#ffffff",
                  padding: "0.1rem 0.45rem",
                  borderRadius: "9999px",
                  border: "1px solid #e2e8f0",
                }}
              >
                Zone: {alert.zone}
              </span>
            )}
          </div>
        </div>

        {/* Right action controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexShrink: 0 }}>
          {isCritical && (
            <a
              href="tel:112"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                color: "#b91c1c",
                fontWeight: 700,
                fontSize: "0.8rem",
                textDecoration: "none",
                background: "#fee2e2",
                padding: "0.25rem 0.65rem",
                borderRadius: "9999px",
                border: "1px solid #fca5a5",
              }}
            >
              <PhoneCall size={13} />
              <span>Call 112 SOS</span>
            </a>
          )}

          <Link
            href={ROUTES.UPDATES}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.25rem",
              color: isCritical ? "#b91c1c" : "#15803d",
              fontWeight: 600,
              fontSize: "0.8rem",
              textDecoration: "underline",
            }}
          >
            <span>All Updates</span>
            <ArrowRight size={13} />
          </Link>

          {activeAlerts.length > 1 && (
            <button
              onClick={() => setCurrentIndex((prev) => (prev + 1) % activeAlerts.length)}
              style={{
                background: "transparent",
                border: "none",
                color: "#64748b",
                fontSize: "0.75rem",
                cursor: "pointer",
                padding: "0.1rem 0.4rem",
                textDecoration: "underline",
              }}
              aria-label="Next advisory"
            >
              Next ({currentIndex + 1}/{activeAlerts.length})
            </button>
          )}

          <button
            onClick={() => setIsDismissed(true)}
            style={{
              background: "transparent",
              border: "none",
              color: "#94a3b8",
              cursor: "pointer",
              padding: "0.2rem",
              display: "flex",
              alignItems: "center",
              borderRadius: "0.25rem",
            }}
            title="Dismiss advisory"
            aria-label="Dismiss advisory"
          >
            <X size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
