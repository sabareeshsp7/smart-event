"use client";
/**
 * HeaderLiveClock — Real-time clock and live sync telemetry badge.
 * Displays live IST time (ticking every 1s), current date, and an animated pulsing beacon.
 * Zero emojis, accessible, and handles SSR hydration cleanly.
 */

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";


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
        gap: "0.5rem",
        background: "#ffffff",
        border: "1px solid #cbd5e1",
        borderRadius: "9999px",
        padding: "0.25rem 0.65rem",
        fontSize: "0.78rem",
        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
        flexShrink: 0,
      }}
      title="Indian Standard Time (IST)"
      aria-label="Venue real-time clock"
    >
      <Clock size={13} color="#4f46e5" />
      <span style={{ fontWeight: 700, fontFamily: "var(--font-sans)", color: "#0f172a" }} suppressHydrationWarning>
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
  );
}

