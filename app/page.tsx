import type { Metadata } from "next";
import Link from "next/link";
import { ROUTES, EMERGENCY_CONTACTS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "EventIQ — Smart Event Experience Platform",
  description:
    "Navigate events smartly. Find sessions, check crowd levels, get AI recommendations, and stay safe with real-time updates.",
};

const FEATURES = [
  {
    icon: "🗺️",
    title: "Interactive Navigation",
    desc: "Locate stages, booths, food courts, restrooms, and help desks with our interactive venue map.",
    href: ROUTES.NAVIGATION,
    color: "#8b5cf6",
  },
  {
    icon: "📅",
    title: "Session Discovery",
    desc: "Browse the full schedule, search sessions, and add them to your personal agenda.",
    href: ROUTES.SESSIONS,
    color: "#06b6d4",
  },
  {
    icon: "🤖",
    title: "AI Recommendations",
    desc: "Get personalized session suggestions powered by Azure OpenAI based on your interests.",
    href: ROUTES.RECOMMENDATIONS,
    color: "#f59e0b",
  },
  {
    icon: "👥",
    title: "Crowd Heatmap",
    desc: "See real-time crowd levels, find less crowded zones, and get alternate route suggestions.",
    href: ROUTES.CROWD,
    color: "#10b981",
  },
  {
    icon: "🚨",
    title: "Emergency SOS",
    desc: "Quick access to emergency contacts (112, 108, 100), first aid locations, and security.",
    href: ROUTES.EMERGENCY,
    color: "#ef4444",
  },
  {
    icon: "♿",
    title: "Accessibility",
    desc: "Accessible routes, wheelchair zones, quiet areas, and support for all attendees.",
    href: ROUTES.ACCESSIBILITY,
    color: "#3b82f6",
  },
  {
    icon: "📢",
    title: "Real-Time Updates",
    desc: "Live announcements, schedule changes, and important alerts delivered instantly.",
    href: ROUTES.UPDATES,
    color: "#ec4899",
  },
  {
    icon: "⚡",
    title: "Organizer Dashboard",
    desc: "Manage sessions, publish alerts, and monitor crowd levels from one command center.",
    href: ROUTES.DASHBOARD,
    color: "#8b5cf6",
  },
] as const;

/** Landing page — hero, features, emergency contacts. */
export default function HomePage() {
  return (
    <div className="page-wrapper">
      {/* ── Hero Section ── */}
      <section
        aria-labelledby="hero-heading"
        style={{
          minHeight: "90vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "4rem 1.5rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background orbs */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: "20%",
            left: "15%",
            width: "400px",
            height: "400px",
            background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)",
            borderRadius: "50%",
            pointerEvents: "none",
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: "20%",
            right: "15%",
            width: "350px",
            height: "350px",
            background: "radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)",
            borderRadius: "50%",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", maxWidth: "800px" }} className="fade-in-up">
          {/* Gemini Badge — hero */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 1.25rem",
              borderRadius: "var(--radius-full)",
              background:
                "linear-gradient(135deg,rgba(66,133,244,0.2),rgba(52,168,83,0.2),rgba(251,188,5,0.2),rgba(234,67,53,0.2))",
              border: "1px solid rgba(255,255,255,0.15)",
              fontSize: "0.85rem",
              fontWeight: 700,
              color: "white",
              marginBottom: "1.5rem",
            }}
            aria-label="Powered by Google Gemini AI"
          >
            <span aria-hidden="true">✦</span>
            Powered by Google Gemini AI
          </div>

          <h1
            id="hero-heading"
            style={{
              fontSize: "clamp(2.5rem, 7vw, 5rem)",
              fontWeight: 900,
              lineHeight: 1.1,
              marginBottom: "1.5rem",
              letterSpacing: "-0.03em",
            }}
          >
            Your{" "}
            <span className="gradient-text">Smarter Event</span>
            <br />
            Experience Starts Here
          </h1>

          <p
            style={{
              fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
              color: "var(--color-text-secondary)",
              marginBottom: "2.5rem",
              lineHeight: 1.7,
            }}
          >
            Navigate venues, discover sessions, check crowd levels, get AI-powered
            recommendations, and stay safe — all in one platform.
          </p>

          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href={ROUTES.SESSIONS} className="btn btn-primary btn-lg" id="cta-sessions">
              📅 Explore Sessions
            </Link>
            <Link href={ROUTES.NAVIGATION} className="btn btn-ghost btn-lg" id="cta-map">
              🗺️ View Venue Map
            </Link>
            <Link href={ROUTES.EMERGENCY} className="btn btn-lg" id="cta-emergency"
              style={{
                background: "rgba(239,68,68,0.15)",
                border: "1px solid rgba(239,68,68,0.4)",
                color: "#f87171",
              }}
            >
              🚨 Emergency: 112
            </Link>
          </div>

          {/* Live stats */}
          <div
            style={{
              display: "flex",
              gap: "2rem",
              justifyContent: "center",
              marginTop: "3rem",
              flexWrap: "wrap",
            }}
          >
            {[
              { value: "15+", label: "Sessions" },
              { value: "20", label: "Venue Zones" },
              { value: "AI", label: "Powered Recs" },
              { value: "24/7", label: "Safety Support" },
            ].map((stat) => (
              <div key={stat.label} style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "2rem",
                    fontWeight: 900,
                    background: "var(--gradient-primary)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  {stat.value}
                </div>
                <div style={{ color: "var(--color-text-muted)", fontSize: "0.8rem", marginTop: "0.25rem" }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Emergency Alert Strip ── */}
      <section
        role="region"
        aria-label="Emergency contacts"
        style={{
          background: "rgba(239,68,68,0.08)",
          borderTop: "1px solid rgba(239,68,68,0.2)",
          borderBottom: "1px solid rgba(239,68,68,0.2)",
          padding: "1rem 0",
        }}
      >
        <div
          className="container"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1.5rem",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <span style={{ color: "#f87171", fontWeight: 700, fontSize: "0.85rem" }}>
            🚨 EMERGENCY CONTACTS:
          </span>
          {EMERGENCY_CONTACTS.slice(0, 4).map((c) => (
            <a
              key={c.number}
              href={`tel:${c.number}`}
              style={{
                color: "#f87171",
                fontWeight: 700,
                fontSize: "0.875rem",
                textDecoration: "none",
                padding: "0.25rem 0.75rem",
                borderRadius: "var(--radius-full)",
                border: "1px solid rgba(239,68,68,0.3)",
                background: "rgba(239,68,68,0.1)",
              }}
              aria-label={`${c.label}: ${c.number}`}
            >
              {c.icon} {c.label}: <strong>{c.number}</strong>
            </a>
          ))}
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section
        aria-labelledby="features-heading"
        style={{ padding: "5rem 0" }}
      >
        <div className="container">
          <h2 id="features-heading" className="section-title" style={{ textAlign: "center" }}>
            Everything You Need at <span className="gradient-text">One Event</span>
          </h2>
          <p className="section-subtitle" style={{ textAlign: "center" }}>
            8 powerful features to make your event experience extraordinary
          </p>

          <div className="grid-4">
            {FEATURES.map((f) => (
              <Link
                key={f.href}
                href={f.href}
                style={{ textDecoration: "none" }}
                id={`feature-${f.title.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <article
                  className="glass-card"
                  style={{ padding: "1.75rem", height: "100%" }}
                >
                  <div
                    style={{
                      width: "3rem",
                      height: "3rem",
                      borderRadius: "var(--radius-md)",
                      background: `${f.color}20`,
                      border: `1px solid ${f.color}40`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.4rem",
                      marginBottom: "1rem",
                    }}
                    aria-hidden="true"
                  >
                    {f.icon}
                  </div>
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.5rem", color: "var(--color-text-primary)" }}>
                    {f.title}
                  </h3>
                  <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", lineHeight: 1.6 }}>
                    {f.desc}
                  </p>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Google AI Section ── */}
      <section
        aria-labelledby="ai-section-heading"
        style={{
          padding: "4rem 0",
          background: "var(--color-bg-2)",
          borderTop: "1px solid var(--color-border)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <div className="container" style={{ textAlign: "center" }}>
          <h2 id="ai-section-heading" className="section-title">
            Powered by{" "}
            <span className="gradient-text-gemini">Google AI</span>
          </h2>
          <p className="section-subtitle">
            World-class AI technology working behind the scenes for you
          </p>

          <div className="grid-2" style={{ maxWidth: "700px", margin: "0 auto" }}>
            <div
              className="glass-card"
              style={{
                padding: "2rem",
                textAlign: "center",
                borderColor: "rgba(66,133,244,0.3)",
              }}
            >
              <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }} aria-hidden="true">✦</div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem" }} className="gradient-text-gemini">
                Google Gemini
              </h3>
              <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
                Session summaries &amp; crowd risk assessment using Gemini 1.5 Flash
              </p>
              <div className="badge badge-gemini" style={{ marginTop: "1rem" }}>
                Powered by Google Gemini
              </div>
            </div>

            <div
              className="glass-card"
              style={{
                padding: "2rem",
                textAlign: "center",
                borderColor: "rgba(139,92,246,0.3)",
              }}
            >
              <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }} aria-hidden="true">⚡</div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem" }} className="gradient-text">
                Azure OpenAI
              </h3>
              <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
                Streaming AI chat assistant &amp; personalized session recommendations
              </p>
              <div className="badge badge-primary" style={{ marginTop: "1rem" }}>
                GPT-4o Powered
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
