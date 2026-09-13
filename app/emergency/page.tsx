import type { Metadata } from "next";
import { EMERGENCY_CONTACTS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Emergency SOS & Safety",
  description:
    "Quick access to emergency contacts (112, 108, 100), first aid locations, security, and safety information.",
};

const SAFETY_LOCATIONS = [
  { name: "First Aid Station A", zone: "Near Main Entrance", icon: "💊", available: true },
  { name: "First Aid Station B", zone: "Food Court Area", icon: "💊", available: true },
  { name: "Security Desk", zone: "Registration Area", icon: "🛡️", available: true },
  { name: "Help Desk", zone: "Main Lobby", icon: "ℹ️", available: true },
  { name: "Lost & Found", zone: "Registration Area", icon: "🔍", available: true },
  { name: "Medical Bay", zone: "VIP Lounge (Staff)", icon: "🏥", available: true },
] as const;

const EMERGENCY_STEPS = [
  { step: "1", title: "Stay Calm", desc: "Take a breath. Assess the situation before acting." },
  { step: "2", title: "Call 112", desc: "For medical, fire, or police emergencies. Available 24/7." },
  { step: "3", title: "Alert Staff", desc: "Find the nearest event staff member (identified by orange vest)." },
  { step: "4", title: "Go to Safety", desc: "Follow emergency exit signs. Do not use elevators during fire." },
  { step: "5", title: "Assemble Point", desc: "Meet at the designated assembly point near the Main Entrance." },
] as const;

/** Emergency & SOS page. */
export default function EmergencyPage() {
  return (
    <div className="page-wrapper">
      <div className="container" style={{ paddingTop: "2rem" }}>
        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <h1 className="section-title">
            🚨 Emergency <span className="gradient-text" style={{ background: "linear-gradient(135deg,#ef4444,#f97316)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>SOS & Safety</span>
          </h1>
          <p className="section-subtitle">
            Quick access to emergency contacts, first aid, and safety procedures
          </p>
        </div>

        {/* SOS Quick Dial */}
        <section aria-labelledby="sos-heading" style={{ marginBottom: "3rem" }}>
          <h2 id="sos-heading" style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1rem" }}>
            ☎️ Emergency Quick Dial
          </h2>
          <div className="grid-2" style={{ marginBottom: "1.5rem" }}>
            {EMERGENCY_CONTACTS.map((contact) => (
              <a
                key={contact.number}
                href={`tel:${contact.number}`}
                className="glass-card"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  padding: "1.25rem 1.5rem",
                  textDecoration: "none",
                  borderColor: "rgba(239,68,68,0.3)",
                  background: "rgba(239,68,68,0.06)",
                }}
                aria-label={`Call ${contact.label}: ${contact.number}`}
              >
                <div
                  style={{
                    width: "3rem",
                    height: "3rem",
                    borderRadius: "var(--radius-md)",
                    background: "rgba(239,68,68,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.5rem",
                    flexShrink: 0,
                  }}
                  aria-hidden="true"
                >
                  {contact.icon}
                </div>
                <div>
                  <div style={{ color: "var(--color-text-secondary)", fontSize: "0.8rem" }}>{contact.label}</div>
                  <div style={{ color: "#f87171", fontWeight: 800, fontSize: "1.4rem", lineHeight: 1.2 }}>
                    {contact.number}
                  </div>
                </div>
                <div style={{ marginLeft: "auto", color: "#f87171", fontSize: "1.25rem" }} aria-hidden="true">📞</div>
              </a>
            ))}
          </div>

          {/* SOS Button */}
          <div style={{ textAlign: "center" }}>
            <a
              href="tel:112"
              id="sos-btn"
              className="pulse-danger"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "1.25rem 3rem",
                borderRadius: "var(--radius-full)",
                background: "var(--color-danger)",
                color: "white",
                fontWeight: 900,
                fontSize: "1.5rem",
                textDecoration: "none",
                boxShadow: "0 0 40px rgba(239,68,68,0.4)",
              }}
              aria-label="Call SOS emergency services 112"
            >
              🚨 SOS — CALL 112
            </a>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.8rem", marginTop: "0.75rem" }}>
              Tap to call emergency services immediately
            </p>
          </div>
        </section>

        <div className="grid-2">
          {/* Safety Locations */}
          <section aria-labelledby="safety-locations-heading">
            <h2 id="safety-locations-heading" style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>
              📍 Safety Locations
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {SAFETY_LOCATIONS.map((loc) => (
                <div key={loc.name} className="glass-card" style={{ padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span style={{ fontSize: "1.4rem" }} aria-hidden="true">{loc.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{loc.name}</div>
                    <div style={{ color: "var(--color-text-muted)", fontSize: "0.8rem" }}>{loc.zone}</div>
                  </div>
                  <span className="badge badge-success" aria-label="Available">Available</span>
                </div>
              ))}
            </div>
          </section>

          {/* Emergency Steps */}
          <section aria-labelledby="emergency-steps-heading">
            <h2 id="emergency-steps-heading" style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>
              📋 Emergency Procedure
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {EMERGENCY_STEPS.map((s) => (
                <div key={s.step} className="glass-card" style={{ padding: "1rem 1.25rem", display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                  <div
                    style={{
                      width: "2rem",
                      height: "2rem",
                      borderRadius: "50%",
                      background: "var(--gradient-primary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      fontSize: "0.85rem",
                      flexShrink: 0,
                    }}
                    aria-hidden="true"
                  >
                    {s.step}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>{s.title}</div>
                    <div style={{ color: "var(--color-text-muted)", fontSize: "0.8rem", marginTop: "0.2rem" }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Assembly point notice */}
        <div
          className="alert-banner"
          style={{
            marginTop: "2rem",
            background: "rgba(245,158,11,0.1)",
            borderColor: "rgba(245,158,11,0.3)",
          }}
          role="note"
          aria-label="Assembly point information"
        >
          <span aria-hidden="true" style={{ fontSize: "1.25rem" }}>⚠️</span>
          <div>
            <strong style={{ color: "#fbbf24" }}>Emergency Assembly Point:</strong>
            <span style={{ color: "var(--color-text-secondary)", marginLeft: "0.5rem" }}>
              Proceed to the open area near the <strong>Main Entrance (Gate A)</strong>. Follow staff in orange vests.
              Emergency number: <a href="tel:112" style={{ color: "#f87171", fontWeight: 700 }}>112</a>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
