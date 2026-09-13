"use client";
/**
 * App Header — navigation bar with mobile-responsive menu.
 * Emergency contacts visible on header for quick access.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ROUTES, APP_NAME, EMERGENCY_CONTACTS } from "@/lib/constants";

const NAV_LINKS = [
  { href: ROUTES.NAVIGATION, label: "Map", icon: "🗺️" },
  { href: ROUTES.SESSIONS, label: "Sessions", icon: "📅" },
  { href: ROUTES.CROWD, label: "Crowd", icon: "👥" },
  { href: ROUTES.UPDATES, label: "Updates", icon: "📢" },
  { href: ROUTES.EMERGENCY, label: "Emergency", icon: "🚨" },
  { href: ROUTES.CHAT, label: "AI Chat", icon: "🤖" },
  { href: ROUTES.DASHBOARD, label: "Dashboard", icon: "⚡" },
] as const;

/** Main app navigation header. */
export function AppHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: "rgba(10, 10, 15, 0.95)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
      role="banner"
    >
      <div className="container" style={{ display: "flex", alignItems: "center", height: "4.25rem", gap: "1rem" }}>
        {/* Logo */}
        <Link href={ROUTES.HOME} style={{ textDecoration: "none", flexShrink: 0 }}>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "1.25rem",
              background: "var(--gradient-primary)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            ⚡ {APP_NAME}
          </span>
        </Link>

        {/* Desktop nav */}
        <nav
          aria-label="Main navigation"
          style={{ display: "flex", gap: "0.25rem", flex: 1, justifyContent: "center" }}
          className="desktop-nav"
        >
          {NAV_LINKS.map(({ href, label, icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  padding: "0.375rem 0.75rem",
                  borderRadius: "var(--radius-md)",
                  textDecoration: "none",
                  fontSize: "0.85rem",
                  fontWeight: 500,
                  color: isActive ? "var(--color-primary-light)" : "var(--color-text-secondary)",
                  background: isActive ? "rgba(139,92,246,0.15)" : "transparent",
                  border: isActive ? "1px solid rgba(139,92,246,0.3)" : "1px solid transparent",
                  transition: "all 0.15s ease",
                }}
                aria-current={isActive ? "page" : undefined}
              >
                <span aria-hidden="true">{icon}</span>
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Emergency quick-access */}
        <a
          href="tel:112"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.375rem",
            padding: "0.375rem 0.875rem",
            borderRadius: "var(--radius-full)",
            background: "rgba(239,68,68,0.15)",
            border: "1px solid rgba(239,68,68,0.4)",
            color: "#f87171",
            textDecoration: "none",
            fontSize: "0.8rem",
            fontWeight: 700,
            flexShrink: 0,
          }}
          aria-label={`Call emergency services ${EMERGENCY_CONTACTS[0].number}`}
        >
          🚨 <span>112</span>
        </a>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen((o) => !o)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
          className="mobile-menu-btn"
          style={{
            background: "none",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-sm)",
            color: "var(--color-text-primary)",
            cursor: "pointer",
            padding: "0.4rem 0.6rem",
            fontSize: "1.1rem",
            display: "none",
          }}
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <nav
          id="mobile-nav"
          aria-label="Mobile navigation"
          style={{
            background: "var(--color-bg-2)",
            borderTop: "1px solid var(--color-border)",
            padding: "1rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          {NAV_LINKS.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.75rem 1rem",
                borderRadius: "var(--radius-md)",
                textDecoration: "none",
                color: pathname === href ? "var(--color-primary-light)" : "var(--color-text-primary)",
                background: pathname === href ? "rgba(139,92,246,0.1)" : "transparent",
                fontWeight: 500,
              }}
              aria-current={pathname === href ? "page" : undefined}
            >
              <span aria-hidden="true">{icon}</span>
              {label}
            </Link>
          ))}
        </nav>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </header>
  );
}
