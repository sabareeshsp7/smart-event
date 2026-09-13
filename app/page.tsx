import type { Metadata } from "next";
import Link from "next/link";
import {
  MapPin,
  Calendar,
  Sparkles,
  Users,
  ShieldAlert,
  Accessibility,
  Bell,
  LayoutDashboard,
  UserCheck,
  HeartPulse,
  Shield,
  Flame,
  PhoneCall,
  Bot,
  ArrowRight,
} from "lucide-react";
import { ROUTES, EMERGENCY_CONTACTS, VENUE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "EventIQ — Smart Event Experience Platform",
  description:
    "Navigate events smartly. Find sessions, check crowd levels, get AI recommendations, and stay safe with real-time updates.",
};

const FEATURES = [
  {
    icon: MapPin,
    title: "Interactive Navigation",
    desc: "Locate stages, booths, food courts, restrooms, and help desks with our interactive BIEC venue map.",
    href: ROUTES.NAVIGATION,
    color: "#4f46e5",
  },
  {
    icon: Calendar,
    title: "Session Discovery",
    desc: "Browse the full summit schedule, filter by technical track, and build your personalized agenda.",
    href: ROUTES.SESSIONS,
    color: "#0891b2",
  },
  {
    icon: Sparkles,
    title: "AI Recommendations",
    desc: "Receive customized session matching powered by Azure OpenAI and Gemini based on your interests.",
    href: ROUTES.RECOMMENDATIONS,
    color: "#d97706",
  },
  {
    icon: Users,
    title: "Crowd Heatmap",
    desc: "Monitor real-time zone congestion, find uncrowded lounges, and take automated alternate routes.",
    href: ROUTES.CROWD,
    color: "#059669",
  },
  {
    icon: UserCheck,
    title: "Digital Accreditation",
    desc: "Register credentials, save profile details to the database, and generate instant printable passes.",
    href: ROUTES.REGISTER,
    color: "#2563eb",
  },
  {
    icon: ShieldAlert,
    title: "Emergency Protocols",
    desc: "1-click access to emergency services (112, 108, 100), medical stations, and security dispatch.",
    href: ROUTES.EMERGENCY,
    color: "#dc2626",
  },
  {
    icon: Accessibility,
    title: "Universal Accessibility",
    desc: "Step-free wheelchair routes, tactile paths, quiet break areas, and assistive voice technologies.",
    href: ROUTES.ACCESSIBILITY,
    color: "#4f46e5",
  },
  {
    icon: Bell,
    title: "Real-Time Updates",
    desc: "Live announcements, room changes, and safety advisories delivered directly to your device.",
    href: ROUTES.UPDATES,
    color: "#0891b2",
  },
  {
    icon: LayoutDashboard,
    title: "Organizer Command",
    desc: "Oversee zone occupancy thresholds, publish emergency alerts, and view system diagnostics.",
    href: ROUTES.DASHBOARD,
    color: "#3730a3",
  },
] as const;

/** Landing page — light mode hero, features, and emergency strip with zero emojis. */
export default function HomePage() {
  const getContactIcon = (number: string) => {
    if (number === "112") return <ShieldAlert size={15} />;
    if (number === "108") return <HeartPulse size={15} />;
    if (number === "100") return <Shield size={15} />;
    if (number === "101") return <Flame size={15} />;
    return <PhoneCall size={15} />;
  };

  return (
    <div className="page-wrapper">
      {/* ── Hero Section ── */}
      <section
        aria-labelledby="hero-heading"
        style={{
          minHeight: "85vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "4rem 1.5rem 3rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "relative", maxWidth: "850px" }} className="fade-in-up">
          {/* AI Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.4rem 1.15rem",
              borderRadius: "var(--radius-full)",
              background: "rgba(79, 70, 229, 0.08)",
              border: "1px solid rgba(79, 70, 229, 0.22)",
              fontSize: "0.85rem",
              fontWeight: 700,
              color: "var(--color-primary)",
              marginBottom: "1.5rem",
            }}
            aria-label="Powered by Google Gemini AI and Azure OpenAI"
          >
            <Sparkles size={16} />
            Powered by Google Gemini &amp; Azure OpenAI
          </div>

          <h1
            id="hero-heading"
            style={{
              fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
              fontWeight: 900,
              lineHeight: 1.15,
              marginBottom: "1.5rem",
              letterSpacing: "-0.03em",
              color: "var(--color-text-primary)",
            }}
          >
            Smart Venue Navigation &amp; <span className="gradient-text">Event Intelligence</span>
          </h1>

          <p
            style={{
              fontSize: "clamp(1rem, 2.2vw, 1.25rem)",
              color: "var(--color-text-secondary)",
              marginBottom: "2.5rem",
              lineHeight: 1.7,
              maxWidth: "700px",
              margin: "0 auto 2.5rem",
            }}
          >
            Navigate {VENUE_NAME}, explore sessions, monitor live crowd density, and interact with the AI event concierge.
          </p>

          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href={ROUTES.SESSIONS} className="btn btn-primary btn-lg" id="cta-sessions">
              <Calendar size={18} /> Explore Sessions
            </Link>
            <Link href={ROUTES.REGISTER} className="btn btn-ghost btn-lg" id="cta-register">
              <UserCheck size={18} /> Register &amp; Get Badge
            </Link>
            <Link href={ROUTES.NAVIGATION} className="btn btn-ghost btn-lg" id="cta-map">
              <MapPin size={18} /> Venue Map
            </Link>
            <Link
              href={ROUTES.EMERGENCY}
              className="btn btn-lg"
              id="cta-emergency"
              style={{
                background: "rgba(220, 38, 38, 0.08)",
                border: "1px solid rgba(220, 38, 38, 0.25)",
                color: "var(--color-danger)",
              }}
            >
              <ShieldAlert size={18} /> Emergency: 112
            </Link>
          </div>

          {/* Live summit stats */}
          <div
            style={{
              display: "flex",
              gap: "2.5rem",
              justifyContent: "center",
              marginTop: "3.5rem",
              flexWrap: "wrap",
            }}
          >
            {[
              { value: "15+", label: "Keynotes & Workshops" },
              { value: "20", label: "BIEC Venue Zones" },
              { value: "1,400+", label: "Registered Delegates" },
              { value: "24/7", label: "Live Safety Protocol" },
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
                <div style={{ color: "var(--color-text-secondary)", fontSize: "0.85rem", marginTop: "0.25rem", fontWeight: 500 }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Emergency Strip ── */}
      <section
        role="region"
        aria-label="Emergency contacts"
        style={{
          background: "rgba(220, 38, 38, 0.05)",
          borderTop: "1px solid rgba(220, 38, 38, 0.15)",
          borderBottom: "1px solid rgba(220, 38, 38, 0.15)",
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
          <span style={{ color: "var(--color-danger)", fontWeight: 700, fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <ShieldAlert size={16} /> EMERGENCY ASSISTANCE:
          </span>
          {EMERGENCY_CONTACTS.slice(0, 4).map((c) => (
            <a
              key={c.number}
              href={`tel:${c.number}`}
              style={{
                color: "var(--color-danger)",
                fontWeight: 600,
                fontSize: "0.85rem",
                textDecoration: "none",
                padding: "0.3rem 0.85rem",
                borderRadius: "var(--radius-full)",
                border: "1px solid rgba(220, 38, 38, 0.25)",
                background: "#ffffff",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
              aria-label={`${c.label}: ${c.number}`}
            >
              {getContactIcon(c.number)}
              {c.label}: <strong>{c.number}</strong>
            </a>
          ))}
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section aria-labelledby="features-heading" style={{ padding: "5rem 0" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2 id="features-heading" className="section-title">
              Complete Event Navigation &amp; <span className="gradient-text">Operations Platform</span>
            </h2>
            <p className="section-subtitle">
              Comprehensive multimodal tools built for attendees, speakers, and event coordinators
            </p>
          </div>

          <div className="grid-3" style={{ gap: "1.5rem" }}>
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <Link
                  key={f.href}
                  href={f.href}
                  style={{ textDecoration: "none" }}
                  id={`feature-${f.title.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <article
                    className="glass-card"
                    style={{
                      padding: "1.75rem",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      background: "#ffffff",
                    }}
                  >
                    <div
                      style={{
                        width: "3rem",
                        height: "3rem",
                        borderRadius: "var(--radius-md)",
                        background: `${f.color}15`,
                        border: `1px solid ${f.color}30`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: f.color,
                        marginBottom: "1.25rem",
                      }}
                      aria-hidden="true"
                    >
                      <Icon size={22} />
                    </div>
                    <h3
                      style={{
                        fontSize: "1.1rem",
                        fontWeight: 700,
                        marginBottom: "0.5rem",
                        color: "var(--color-text-primary)",
                      }}
                    >
                      {f.title}
                    </h3>
                    <p
                      style={{
                        color: "var(--color-text-secondary)",
                        fontSize: "0.875rem",
                        lineHeight: 1.6,
                        flex: 1,
                      }}
                    >
                      {f.desc}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.35rem",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        color: f.color,
                        marginTop: "1.25rem",
                      }}
                    >
                      Open {f.title} <ArrowRight size={14} />
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── AI Technology Section ── */}
      <section
        aria-labelledby="ai-section-heading"
        style={{
          padding: "4.5rem 0",
          background: "#ffffff",
          borderTop: "1px solid var(--color-border)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <div className="container" style={{ textAlign: "center" }}>
          <h2 id="ai-section-heading" className="section-title">
            Powered by <span className="gradient-text">World-Class AI</span>
          </h2>
          <p className="section-subtitle">
            Multimodal intelligence orchestrating voice, crowd risk analysis, and streaming responses
          </p>

          <div className="grid-2" style={{ maxWidth: "800px", margin: "0 auto", gap: "1.5rem" }}>
            <div
              className="glass-card"
              style={{
                padding: "2rem",
                textAlign: "left",
                background: "var(--color-bg)",
                border: "1px solid var(--color-border)",
              }}
            >
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "var(--radius-md)",
                  background: "rgba(79, 70, 229, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--color-primary)",
                  marginBottom: "1rem",
                }}
              >
                <Bot size={22} />
              </div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                Google Gemini
              </h3>
              <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem", lineHeight: 1.6 }}>
                Session summarization, semantic agenda tagging, and crowd risk assessment scoring.
              </p>
              <div className="badge badge-primary" style={{ marginTop: "1rem" }}>
                Gemini 1.5 Flash
              </div>
            </div>

            <div
              className="glass-card"
              style={{
                padding: "2rem",
                textAlign: "left",
                background: "var(--color-bg)",
                border: "1px solid var(--color-border)",
              }}
            >
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "var(--radius-md)",
                  background: "rgba(8, 145, 178, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--color-secondary)",
                  marginBottom: "1rem",
                }}
              >
                <Sparkles size={22} />
              </div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                Azure OpenAI
              </h3>
              <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem", lineHeight: 1.6 }}>
                High-speed streaming event concierge, question answering, and schedule guidance.
              </p>
              <div className="badge badge-info" style={{ marginTop: "1rem" }}>
                GPT-4o / GPT-5.4 Architecture
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
