import type { Metadata } from "next";
import { EMERGENCY_CONTACTS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Accessibility & Inclusive Access",
  description: "Accessible routes, wheelchair facilities, quiet zones, and support resources for all event attendees.",
};

const ACCESSIBLE_FEATURES = [
  { icon: "♿", title: "Wheelchair Accessible Routes", desc: "All main zones connected via smooth, level paths. Ramps at all stage entrances.", available: true },
  { icon: "🅿️", title: "Accessible Parking", desc: "Dedicated spaces near Gate A (Parking Zone). Shuttle service from far lots.", available: true },
  { icon: "🚻", title: "Accessible Restrooms", desc: "Available at Restrooms Block A (near Main Stage) and Block B (near Food Court).", available: true },
  { icon: "🔇", title: "Quiet Zones", desc: "Designated low-stimulation rest areas in VIP Lounge and Workshop Hall B corner.", available: true },
  { icon: "👋", title: "Sign Language Interpreting", desc: "ASL/ISL interpreters available at all Keynote sessions. Request at Help Desk.", available: true },
  { icon: "📻", title: "Hearing Loop System", desc: "Induction loop installed at Main Stage and Auditorium for hearing aid users.", available: true },
  { icon: "🦯", title: "Tactile Pathways", desc: "Tactile ground indicators from Main Entrance to Main Stage and Food Court.", available: true },
  { icon: "👀", title: "Visual Aids Available", desc: "Large print programs and signage throughout. Braille maps at Registration.", available: true },
] as const;

const ACCESSIBLE_ROUTES = [
  { from: "Gate A (Main Entrance)", to: "Main Stage", path: "Turn left, follow the blue tactile strip. Fully ramped. 3 min.", type: "Level path" },
  { from: "Gate A (Main Entrance)", to: "Food Court", path: "Turn right, straight path with no steps. 4 min.", type: "Level path" },
  { from: "Gate A (Main Entrance)", to: "Workshop Hall A", path: "Take the elevator near Registration (marked with ♿). 2nd floor.", type: "Elevator" },
  { from: "Gate A (Main Entrance)", to: "Restrooms Block A", path: "Left at Main Stage, 50m ahead. Accessible stall on right.", type: "Level path" },
] as const;

/** Accessibility page. */
export default function AccessibilityPage() {
  return (
    <div className="page-wrapper">
      <div className="container" style={{ paddingTop: "2rem" }}>
        <h1 className="section-title">
          ♿ Accessibility & <span className="gradient-text">Inclusive Access</span>
        </h1>
        <p className="section-subtitle">
          EventIQ is committed to an inclusive experience for all attendees
        </p>

        {/* Quick Help Banner */}
        <div
          className="alert-banner"
          style={{ background: "rgba(59,130,246,0.1)", borderColor: "rgba(59,130,246,0.3)", marginBottom: "2.5rem" }}
          role="note"
          aria-label="Accessibility help information"
        >
          <span aria-hidden="true" style={{ fontSize: "1.25rem" }}>ℹ️</span>
          <div>
            <strong style={{ color: "#60a5fa" }}>Need assistance?</strong>
            <span style={{ color: "var(--color-text-secondary)", marginLeft: "0.5rem" }}>
              Visit the <strong>Help Desk</strong> at the Main Lobby, call Event Security at{" "}
              <a href="tel:+91-9876-543210" style={{ color: "#f87171", fontWeight: 700 }}>+91-9876-543210</a>, or call{" "}
              <a href="tel:112" style={{ color: "#f87171", fontWeight: 700 }}>112</a> for emergencies.
            </span>
          </div>
        </div>

        {/* Accessible Features */}
        <section aria-labelledby="features-heading" style={{ marginBottom: "3rem" }}>
          <h2 id="features-heading" style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1.25rem" }}>
            Available Accessibility Features
          </h2>
          <div className="grid-2">
            {ACCESSIBLE_FEATURES.map((f) => (
              <div key={f.title} className="glass-card" style={{ padding: "1.25rem", display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                <div
                  style={{
                    width: "2.75rem",
                    height: "2.75rem",
                    borderRadius: "var(--radius-md)",
                    background: "rgba(59,130,246,0.15)",
                    border: "1px solid rgba(59,130,246,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.25rem",
                    flexShrink: 0,
                  }}
                  aria-hidden="true"
                >
                  {f.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.3rem" }}>
                    <h3 style={{ fontSize: "0.9rem", fontWeight: 700 }}>{f.title}</h3>
                    <span className="badge badge-success" aria-label="Available">✓</span>
                  </div>
                  <p style={{ color: "var(--color-text-muted)", fontSize: "0.8rem", lineHeight: 1.5 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Accessible Routes */}
        <section aria-labelledby="routes-heading" style={{ marginBottom: "3rem" }}>
          <h2 id="routes-heading" style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1.25rem" }}>
            ♿ Accessible Route Guide
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {ACCESSIBLE_ROUTES.map((r) => (
              <div key={r.to} className="glass-card" style={{ padding: "1.25rem", display: "flex", gap: "1.25rem", alignItems: "flex-start" }}>
                <div
                  style={{
                    padding: "0.375rem 0.625rem",
                    borderRadius: "var(--radius-sm)",
                    background: "rgba(16,185,129,0.15)",
                    border: "1px solid rgba(16,185,129,0.3)",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    color: "#34d399",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  {r.type}
                </div>
                <div>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.4rem", flexWrap: "wrap" }}>
                    <span style={{ color: "var(--color-text-muted)", fontSize: "0.8rem" }}>{r.from}</span>
                    <span style={{ color: "var(--color-primary)" }}>→</span>
                    <span style={{ fontWeight: 700, fontSize: "0.875rem" }}>{r.to}</span>
                  </div>
                  <p style={{ color: "var(--color-text-secondary)", fontSize: "0.8rem" }}>{r.path}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Emergency strip */}
        <div
          style={{ padding: "1.25rem 1.5rem", borderRadius: "var(--radius-md)", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}
          role="complementary"
          aria-label="Emergency contacts for accessibility assistance"
        >
          <span style={{ color: "#f87171", fontWeight: 700, fontSize: "0.85rem" }}>🚨 Emergency Contacts:</span>
          {EMERGENCY_CONTACTS.slice(0, 4).map((c) => (
            <a key={c.number} href={`tel:${c.number}`} style={{ color: "#f87171", fontWeight: 700, fontSize: "0.875rem", textDecoration: "none" }}>
              {c.icon} {c.label}: {c.number}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
