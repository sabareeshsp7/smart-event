"use client";
/**
 * HeaderLiveClock — Real-time clock and live sync telemetry badge.
 * Displays live IST time (ticking every 1s), current date, and an animated pulsing beacon.
 * Zero emojis, accessible, and handles SSR hydration cleanly.
 */

import { useState, useEffect } from "react";
import { Clock, Radio } from "lucide-react";

export function HeaderLiveClock() {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setMounted(true);
    setNow(new Date());

    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format time in Indian Standard Time (IST)
  const formatTime = (d: Date) => {
    return d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    });
  };

  const formatDate = (d: Date) => {
    return d.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    });
  };

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.65rem",
        background: "#ffffff",
        border: "1px solid #cbd5e1",
        borderRadius: "9999px",
        padding: "0.3rem 0.75rem",
        fontSize: "0.78rem",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
        flexShrink: 0,
      }}
      title="Synchronized in real-time with BIEC Venue Telemetry (IST)"
      aria-label="Venue real-time clock and synchronization status"
    >
      {/* Live Sync Beacon with Pulse Animation */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
        <span
          className="live-beacon-dot"
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: "#10b981",
            boxShadow: "0 0 0 0 rgba(16, 185, 129, 0.7)",
            display: "inline-block",
          }}
        />
        <span
          style={{
            fontSize: "0.7rem",
            fontWeight: 800,
            letterSpacing: "0.04em",
            color: "#059669",
            textTransform: "uppercase",
            display: "flex",
            alignItems: "center",
            gap: "0.2rem",
          }}
        >
          <Radio size={11} color="#059669" /> LIVE SYNC
        </span>
      </div>

      <div style={{ width: "1px", height: "14px", background: "#cbd5e1" }} />

      {/* Clock & Date */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", color: "#0f172a" }}>
        <Clock size={13} color="#4f46e5" />
        <span style={{ fontWeight: 700, fontFamily: "var(--font-sans)", minWidth: "82px" }} suppressHydrationWarning>
          {mounted && now ? formatTime(now) : "--:--:-- --"}
        </span>
        <span
          className="desktop-only-date"
          style={{ color: "#64748b", fontSize: "0.74rem", fontWeight: 500 }}
          suppressHydrationWarning
        >
          · {mounted && now ? formatDate(now) : "Loading..."}
        </span>
      </div>
    </div>
  );
}
