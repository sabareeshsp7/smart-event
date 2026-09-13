"use client";
/**
 * App Header — Modern Light Mode Navigation with Lucide Icons.
 * Zero emojis, accessible semantics, responsive mobile drawer, public advisories, and attendee profile.
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
  Ticket,
  PhoneCall,
  Menu,
  X,
  User,
  Check,
} from "lucide-react";
import { ROUTES, APP_NAME } from "@/lib/constants";
import { PublicAdvisoryBanner } from "@/components/layout/PublicAdvisoryBanner";
import { useUserProfile } from "@/lib/hooks/useUserProfile";

const NAV_LINKS = [
  { href: ROUTES.EVENTS, label: "Live Events & Passes", icon: Ticket },
  { href: ROUTES.NAVIGATION, label: "Map", icon: MapPin },
  { href: ROUTES.SESSIONS, label: "Sessions", icon: Calendar },
  { href: ROUTES.CROWD, label: "Crowd", icon: Users },
  { href: ROUTES.UPDATES, label: "Updates", icon: Bell },
  { href: ROUTES.EMERGENCY, label: "Emergency", icon: ShieldAlert },
  { href: ROUTES.CHAT, label: "AI Chat", icon: Bot },
] as const;

/** Main app navigation header in clean Light Mode with Attendee Profile and Advisory Banner. */
export function AppHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const { profile, saveProfile } = useUserProfile();

  const [inputName, setInputName] = useState(profile.name);
  const [inputPhone, setInputPhone] = useState(profile.phone);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    saveProfile({ name: inputName.trim(), phone: inputPhone.trim() });
    setProfileModalOpen(false);
  };

  return (
    <>
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: "rgba(255, 255, 255, 0.96)",
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

          {/* Attendee Profile Button */}
          <button
            onClick={() => {
              setInputName(profile.name);
              setInputPhone(profile.phone);
              setProfileModalOpen(true);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              padding: "0.35rem 0.75rem",
              borderRadius: "9999px",
              background: "#f1f5f9",
              border: "1px solid #cbd5e1",
              color: "#334155",
              fontSize: "0.8rem",
              fontWeight: 600,
              cursor: "pointer",
              flexShrink: 0,
            }}
            title="Set your attendee name & phone"
            aria-label="Attendee profile"
          >
            <User size={14} color="#6366f1" />
            <span style={{ maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {profile.name ? profile.name : "My Profile"}
            </span>
          </button>

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
            className="mobile-toggle"
            style={{
              display: "none",
              background: "transparent",
              border: "none",
              color: "var(--color-text-primary)",
              cursor: "pointer",
              padding: "0.5rem",
            }}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Global Public Advisory Banner */}
        <PublicAdvisoryBanner />

        {/* Mobile navigation drawer */}
        {mobileOpen && (
          <div
            style={{
              background: "#ffffff",
              borderTop: "1px solid var(--color-border)",
              padding: "1rem 1.5rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
              boxShadow: "var(--shadow-md)",
            }}
            role="dialog"
            aria-label="Mobile navigation"
          >
            {NAV_LINKS.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
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
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    color: isActive ? "var(--color-primary)" : "var(--color-text-primary)",
                    background: isActive ? "rgba(79, 70, 229, 0.08)" : "transparent",
                  }}
                >
                  <Icon size={18} color={isActive ? "var(--color-primary)" : "currentColor"} />
                  {label}
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* Attendee Profile Modal */}
      {profileModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            background: "rgba(15, 23, 42, 0.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="profile-modal-title"
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "0.75rem",
              border: "1px solid #e2e8f0",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
              maxWidth: "420px",
              width: "100%",
              padding: "1.75rem",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h2 id="profile-modal-title" style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>
                Attendee Profile Details
              </h2>
              <button
                onClick={() => setProfileModalOpen(false)}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: "#64748b" }}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "1.25rem", lineHeight: 1.5 }}>
              Your name and phone number will be automatically used to pre-fill event digital pass reservations and attach to emergency SOS requests.
            </p>

            <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                  Your Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Verma"
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.6rem 0.85rem",
                    borderRadius: "0.5rem",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.9rem",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91-9876543210"
                  value={inputPhone}
                  onChange={(e) => setInputPhone(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.6rem 0.85rem",
                    borderRadius: "0.5rem",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.9rem",
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => setProfileModalOpen(false)}
                  className="btn btn-ghost"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}
                >
                  <Check size={16} /> Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
