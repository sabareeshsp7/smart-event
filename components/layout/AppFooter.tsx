"use client";
/**
 * App Footer — emergency contacts, quick links, and technology attribution.
 * Clean light mode aesthetic with Lucide icons and zero emojis.
 * Complies with RULE GS-7 ("Google AI" featured technology) and RULE PA-2.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  ShieldAlert,
  PhoneCall,
  Bot,
  HeartPulse,
  Flame,
  Shield,
} from "lucide-react";
import { EMERGENCY_CONTACTS, ROUTES, APP_NAME, APP_VERSION } from "@/lib/constants";

/** App footer with emergency contacts and tech attribution in Light Mode. */
export function AppFooter() {
  const pathname = usePathname();
  if (pathname === "/chat") return null;

  const getContactIcon = (number: string) => {
    if (number === "112") return <ShieldAlert size={15} color="var(--color-danger)" />;
    if (number === "108") return <HeartPulse size={15} color="var(--color-danger)" />;
    if (number === "100") return <Shield size={15} color="var(--color-danger)" />;
    if (number === "101") return <Flame size={15} color="var(--color-danger)" />;
    return <PhoneCall size={15} color="var(--color-danger)" />;
  };

  return (
    <footer
      role="contentinfo"
      style={{
        background: "#ffffff",
        borderTop: "1px solid var(--color-border)",
        padding: "3.5rem 0 2rem",
        marginTop: "auto",
        boxShadow: "0 -2px 10px rgba(0,0,0,0.02)",
      }}
    >
      <div className="container">
        <div className="grid-4" style={{ marginBottom: "2.5rem" }}>
          {/* Brand Column */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--gradient-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                }}
              >
                <Sparkles size={16} />
              </div>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.25rem",
                  fontWeight: 800,
                  background: "var(--gradient-primary)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {APP_NAME}
              </h2>
            </div>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem", lineHeight: 1.6 }}>
              Smart Event Experience Platform. Real-time navigation, crowd heatmaps, attendee registration, and AI concierge.
            </p>
          </div>

          {/* Quick Links */}
          <nav aria-label="Footer navigation">
            <h3
              style={{
                fontSize: "0.8rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--color-text-muted)",
                marginBottom: "0.85rem",
              }}
            >
              Navigation
            </h3>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {[
                { href: ROUTES.SESSIONS, label: "Session Schedule" },
                { href: ROUTES.EVENTS, label: "Live Events Directory" },
                { href: ROUTES.NAVIGATION, label: "Interactive Venue Map" },
                { href: ROUTES.CROWD, label: "Zone Crowd Levels" },
                { href: ROUTES.ACCESSIBILITY, label: "Accessibility Services" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    style={{
                      color: "var(--color-text-secondary)",
                      textDecoration: "none",
                      fontSize: "0.875rem",
                      transition: "color 0.15s ease",
                    }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Emergency Contacts */}
          <div>
            <h3
              style={{
                fontSize: "0.8rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--color-text-muted)",
                marginBottom: "0.85rem",
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
              }}
            >
              <ShieldAlert size={14} color="var(--color-danger)" /> Emergency Contacts
            </h3>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.45rem" }}>
              {EMERGENCY_CONTACTS.slice(0, 4).map((contact) => (
                <li key={contact.number}>
                  <a
                    href={`tel:${contact.number}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      color: "var(--color-danger)",
                      textDecoration: "none",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                    }}
                    aria-label={`Call ${contact.label}: ${contact.number}`}
                  >
                    {getContactIcon(contact.number)}
                    {contact.label}: <strong>{contact.number}</strong>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Powered By */}
          <div>
            <h3
              style={{
                fontSize: "0.8rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--color-text-muted)",
                marginBottom: "0.85rem",
              }}
            >
              AI Orchestration
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.4rem 0.85rem",
                  borderRadius: "var(--radius-md)",
                  background: "rgba(79, 70, 229, 0.08)",
                  border: "1px solid rgba(79, 70, 229, 0.2)",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  color: "var(--color-primary)",
                }}
              >
                <Bot size={15} /> Google Gemini AI
              </div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.4rem 0.85rem",
                  borderRadius: "var(--radius-md)",
                  background: "rgba(8, 145, 178, 0.08)",
                  border: "1px solid rgba(8, 145, 178, 0.2)",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  color: "var(--color-secondary)",
                }}
              >
                <Sparkles size={15} /> Azure OpenAI &amp; Sarvam
              </div>
            </div>
          </div>
        </div>

        <hr className="divider" />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
            fontSize: "0.8rem",
            color: "var(--color-text-muted)",
          }}
        >
          <p>© 2025 {APP_NAME} v{APP_VERSION} • Bangalore International Exhibition Centre</p>
          <p>
            Powered by <strong style={{ color: "var(--color-text-primary)" }}>Google AI</strong> &amp;{" "}
            <strong style={{ color: "var(--color-text-primary)" }}>Azure OpenAI</strong>
          </p>
        </div>
      </div>
    </footer>
  );
}
