/**
 * App Footer — emergency contacts, quick links, Google Gemini badge.
 * RULE PA-2: Emergency numbers (112, 1078) must appear on ≥3 pages prominently.
 * RULE GS-7: Add "Google AI" to site footer as a featured technology.
 */

import Link from "next/link";
import { EMERGENCY_CONTACTS, ROUTES, APP_NAME, APP_VERSION } from "@/lib/constants";

/** App footer with emergency contacts and tech attribution. */
export function AppFooter() {
  return (
    <footer
      role="contentinfo"
      style={{
        background: "var(--color-bg-2)",
        borderTop: "1px solid var(--color-border)",
        padding: "3rem 0 1.5rem",
        marginTop: "auto",
      }}
    >
      <div className="container">
        <div className="grid-4" style={{ marginBottom: "2rem" }}>
          {/* Brand */}
          <div>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.25rem",
                fontWeight: 800,
                background: "var(--gradient-primary)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                marginBottom: "0.75rem",
              }}
            >
              ⚡ {APP_NAME}
            </h2>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", lineHeight: 1.6 }}>
              Smart Event Experience Platform. Navigate, discover, and stay safe at any event.
            </p>
          </div>

          {/* Quick Links */}
          <nav aria-label="Footer navigation">
            <h3
              style={{
                fontSize: "0.8rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "var(--color-text-muted)",
                marginBottom: "0.75rem",
              }}
            >
              Quick Links
            </h3>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {[
                { href: ROUTES.SESSIONS, label: "Sessions" },
                { href: ROUTES.NAVIGATION, label: "Venue Map" },
                { href: ROUTES.CROWD, label: "Crowd Levels" },
                { href: ROUTES.ACCESSIBILITY, label: "Accessibility" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    style={{
                      color: "var(--color-text-secondary)",
                      textDecoration: "none",
                      fontSize: "0.875rem",
                      transition: "color 0.15s",
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
                letterSpacing: "0.1em",
                color: "var(--color-text-muted)",
                marginBottom: "0.75rem",
              }}
            >
              🚨 Emergency Contacts
            </h3>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              {EMERGENCY_CONTACTS.slice(0, 4).map((contact) => (
                <li key={contact.number}>
                  <a
                    href={`tel:${contact.number}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      color: "#f87171",
                      textDecoration: "none",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                    }}
                    aria-label={`Call ${contact.label}: ${contact.number}`}
                  >
                    <span aria-hidden="true">{contact.icon}</span>
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
                letterSpacing: "0.1em",
                color: "var(--color-text-muted)",
                marginBottom: "0.75rem",
              }}
            >
              Powered By
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.375rem 0.75rem",
                  borderRadius: "var(--radius-md)",
                  background: "linear-gradient(135deg,rgba(66,133,244,0.15),rgba(52,168,83,0.15),rgba(251,188,5,0.15),rgba(234,67,53,0.15))",
                  border: "1px solid rgba(255,255,255,0.1)",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  color: "white",
                }}
                aria-label="Powered by Google AI and Google Gemini"
              >
                <span aria-hidden="true">✦</span> Google Gemini AI
              </div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.375rem 0.75rem",
                  borderRadius: "var(--radius-md)",
                  background: "rgba(139,92,246,0.15)",
                  border: "1px solid rgba(139,92,246,0.3)",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  color: "var(--color-primary-light)",
                }}
              >
                ⚡ Azure OpenAI
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
          }}
        >
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.8rem" }}>
            © 2025 {APP_NAME} v{APP_VERSION}. All rights reserved.
          </p>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.8rem" }}>
            🤖 AI-powered by <strong style={{ color: "white" }}>Google AI</strong> &amp;{" "}
            <strong style={{ color: "white" }}>Azure OpenAI</strong>
          </p>
        </div>
      </div>
    </footer>
  );
}
