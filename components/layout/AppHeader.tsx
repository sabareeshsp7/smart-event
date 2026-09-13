"use client";
/**
 * App Header — Modern Light Mode Navigation with Lucide Icons.
 * Zero emojis, accessible semantics, responsive mobile drawer.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Sparkles,
  MapPin,
  Calendar,
  Users,
  Bell,
  ShieldAlert,
  Bot,
  LayoutDashboard,
  UserCheck,
  PhoneCall,
  Menu,
  X,
} from "lucide-react";
import { ROUTES, APP_NAME } from "@/lib/constants";

const NAV_LINKS = [
  { href: ROUTES.NAVIGATION, label: "Map", icon: MapPin },
  { href: ROUTES.SESSIONS, label: "Sessions", icon: Calendar },
  { href: ROUTES.CROWD, label: "Crowd", icon: Users },
  { href: ROUTES.REGISTER, label: "Register", icon: UserCheck },
  { href: ROUTES.UPDATES, label: "Updates", icon: Bell },
  { href: ROUTES.EMERGENCY, label: "Emergency", icon: ShieldAlert },
  { href: ROUTES.CHAT, label: "AI Chat", icon: Bot },
  { href: ROUTES.DASHBOARD, label: "Dashboard", icon: LayoutDashboard },
] as const;

/** Main app navigation header in clean Light Mode. */
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
        background: "rgba(255, 255, 255, 0.95)",
        borderBottom: "1px solid var(--color-border)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        boxShadow: "var(--shadow-sm)",
      }}
      role="banner"
    >
      <div className="container" style={{ display: "flex", alignItems: "center", height: "4.5rem", gap: "1rem" }}>
        {/* Logo */}
        <Link href={ROUTES.HOME} style={{ textDecoration: "none", flexShrink: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "var(--radius-md)",
              background: "var(--gradient-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
            }}
          >
            <Sparkles size={18} />
          </div>
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
            {APP_NAME}
          </span>
        </Link>

        {/* Desktop nav */}
        <nav
          aria-label="Main navigation"
          style={{ display: "flex", gap: "0.25rem", flex: 1, justifyContent: "center" }}
          className="desktop-nav"
        >
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  padding: "0.4rem 0.75rem",
                  borderRadius: "var(--radius-md)",
                  textDecoration: "none",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: isActive ? "var(--color-primary)" : "var(--color-text-secondary)",
                  background: isActive ? "rgba(79, 70, 229, 0.08)" : "transparent",
                  border: isActive ? "1px solid rgba(79, 70, 229, 0.25)" : "1px solid transparent",
                  transition: "all 0.15s ease",
                }}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon size={15} color={isActive ? "var(--color-primary)" : "currentColor"} />
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
            gap: "0.4rem",
            padding: "0.35rem 0.85rem",
            borderRadius: "var(--radius-full)",
            background: "rgba(220, 38, 38, 0.08)",
            border: "1px solid rgba(220, 38, 38, 0.25)",
            color: "var(--color-danger)",
            textDecoration: "none",
            fontSize: "0.8rem",
            fontWeight: 700,
            flexShrink: 0,
          }}
          aria-label="Call emergency services 112"
        >
          <PhoneCall size={14} /> <span>112</span>
        </a>

        {/* Mobile menu toggle */}
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
            padding: "0.4rem 0.5rem",
            display: "none",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <nav
          id="mobile-nav"
          aria-label="Mobile navigation"
          style={{
            background: "#ffffff",
            borderTop: "1px solid var(--color-border)",
            padding: "1rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          {NAV_LINKS.map(({ href, label, icon: Icon }) => (
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
                color: pathname === href ? "var(--color-primary)" : "var(--color-text-primary)",
                background: pathname === href ? "rgba(79, 70, 229, 0.08)" : "transparent",
                fontWeight: 600,
                fontSize: "0.9rem",
              }}
              aria-current={pathname === href ? "page" : undefined}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>
      )}

      <style>{`
        @media (max-width: 900px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </header>
  );
}
