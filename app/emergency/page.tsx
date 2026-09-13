import type { Metadata } from "next";
import {
  ShieldAlert,
  PhoneCall,
  HeartPulse,
  Shield,
  Flame,
  Info,
  Search,
  Building2,
  AlertTriangle,
  Phone,
  CheckCircle2,
} from "lucide-react";
import { EMERGENCY_CONTACTS, VENUE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Emergency SOS & Venue Safety",
  description:
    "Direct speed dial for emergency services (112, 108, 100), medical first aid locations, security dispatch, and evacuation protocols.",
};

const SAFETY_LOCATIONS = [
  { name: "Primary First Aid Wing", zone: "East Wing near Gate 2", icon: HeartPulse, available: true },
  { name: "Medical Aid Post B", zone: "South Food Concourse", icon: HeartPulse, available: true },
  { name: "Central Security Control", zone: "Main Galleria Turnstiles", icon: Shield, available: true },
  { name: "Attendee Information Hub", zone: "Central Entrance Plaza", icon: Info, available: true },
  { name: "Lost & Found Centre", zone: "Registration Hall A", icon: Search, available: true },
  { name: "Emergency Dispatch Bay", zone: "Gate 1 Logistics Bay", icon: Building2, available: true },
] as const;

const EMERGENCY_STEPS = [
  { step: "1", title: "Stay Calm & Assess", desc: "Evaluate immediate danger before acting. Avoid crowding corridors." },
  { step: "2", title: "Dial 112 Speedline", desc: "Integrated police, medical, and fire emergency dispatch. 24/7 on-site response." },
  { step: "3", title: "Notify Floor Marshals", desc: "Locate venue staff wearing high-visibility orange safety lanyards." },
  { step: "4", title: "Follow Illuminated Exits", desc: "Follow green emergency exit markers. Do not use passenger elevators during an alarm." },
  { step: "5", title: "Proceed to Assembly Zone", desc: "Assemble at the open paved plaza situated outside Main Entrance Gate A." },
] as const;

/** Emergency & SOS page in Light Mode with zero emojis. */
export default function EmergencyPage() {
  const getContactIcon = (number: string) => {
    if (number === "112") return <ShieldAlert size={22} color="var(--color-danger)" />;
    if (number === "108") return <HeartPulse size={22} color="var(--color-danger)" />;
    if (number === "100") return <Shield size={22} color="var(--color-danger)" />;
    if (number === "101") return <Flame size={22} color="var(--color-danger)" />;
    return <PhoneCall size={22} color="var(--color-danger)" />;
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: "2.5rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              padding: "0.25rem 0.75rem",
              borderRadius: "var(--radius-full)",
              background: "rgba(220, 38, 38, 0.08)",
              color: "var(--color-danger)",
              fontSize: "0.8rem",
              fontWeight: 600,
              marginBottom: "0.75rem",
            }}
          >
            <ShieldAlert size={14} /> Immediate Incident Response
          </div>
          <h1 className="section-title">
            Emergency <span className="gradient-text" style={{ background: "linear-gradient(135deg, #dc2626, #ea580c)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>SOS &amp; Safety</span>
          </h1>
          <p className="section-subtitle" style={{ marginBottom: "0.5rem" }}>
            24/7 rapid dispatch contacts, first aid posts, and evacuation procedures for {VENUE_NAME}
          </p>
        </div>

        {/* SOS Emergency Speed Dial */}
        <section aria-labelledby="sos-heading" style={{ marginBottom: "3.5rem" }}>
          <h2 id="sos-heading" style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <PhoneCall size={18} color="var(--color-danger)" /> Rapid Speed Dial Directory
          </h2>

          <div className="grid-2" style={{ gap: "1.25rem", marginBottom: "2.5rem" }}>
            {EMERGENCY_CONTACTS.map((contact) => (
              <a
                key={contact.number}
                href={`tel:${contact.number}`}
                className="glass-card"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1.25rem",
                  padding: "1.5rem",
                  textDecoration: "none",
                  border: "1px solid rgba(220, 38, 38, 0.2)",
                  background: "#ffffff",
                }}
                aria-label={`Call ${contact.label}: ${contact.number}`}
              >
                <div
                  style={{
                    width: "3.25rem",
                    height: "3.25rem",
                    borderRadius: "var(--radius-md)",
                    background: "rgba(220, 38, 38, 0.08)",
                    border: "1px solid rgba(220, 38, 38, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                  aria-hidden="true"
                >
                  {getContactIcon(contact.number)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: "var(--color-text-secondary)", fontSize: "0.85rem", fontWeight: 500 }}>
                    {contact.label}
                  </div>
                  <div style={{ color: "var(--color-danger)", fontWeight: 800, fontSize: "1.45rem", lineHeight: 1.2 }}>
                    {contact.number}
                  </div>
                </div>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: "rgba(220, 38, 38, 0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--color-danger)",
                  }}
                  aria-hidden="true"
                >
                  <Phone size={16} />
                </div>
              </a>
            ))}
          </div>

          {/* Primary SOS Action Dial Button */}
          <div style={{ textAlign: "center" }}>
            <a
              href="tel:112"
              id="sos-btn"
              className="pulse-danger"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "1.15rem 3.5rem",
                borderRadius: "var(--radius-full)",
                background: "var(--color-danger)",
                color: "#ffffff",
                fontWeight: 800,
                fontSize: "1.35rem",
                textDecoration: "none",
                boxShadow: "0 10px 30px rgba(220, 38, 38, 0.35)",
              }}
              aria-label="Call national emergency helpline 112"
            >
              <ShieldAlert size={26} /> CALL 112 DISPATCH
            </a>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", marginTop: "0.85rem" }}>
              Direct connection to medical, police, and disaster response authorities.
            </p>
          </div>
        </section>

        <div className="grid-2" style={{ gap: "2rem" }}>
          {/* First Aid & Safety Stations */}
          <section aria-labelledby="safety-locations-heading">
            <h2 id="safety-locations-heading" style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <HeartPulse size={18} color="var(--color-danger)" /> On-Site Medical &amp; Safety Posts
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              {SAFETY_LOCATIONS.map((loc) => {
                const Icon = loc.icon;
                return (
                  <div
                    key={loc.name}
                    className="glass-card"
                    style={{
                      padding: "1.15rem 1.25rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      background: "#ffffff",
                    }}
                  >
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "var(--radius-sm)",
                        background: "rgba(220, 38, 38, 0.08)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--color-danger)",
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={18} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--color-text-primary)" }}>
                        {loc.name}
                      </div>
                      <div style={{ color: "var(--color-text-secondary)", fontSize: "0.825rem" }}>
                        {loc.zone}
                      </div>
                    </div>
                    <span className="badge badge-success" style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <CheckCircle2 size={12} /> Staffed
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Emergency Evacuation Protocol */}
          <section aria-labelledby="emergency-steps-heading">
            <h2 id="emergency-steps-heading" style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Shield size={18} color="var(--color-primary)" /> Evacuation Guidelines
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              {EMERGENCY_STEPS.map((s) => (
                <div
                  key={s.step}
                  className="glass-card"
                  style={{
                    padding: "1.15rem 1.25rem",
                    display: "flex",
                    gap: "1rem",
                    alignItems: "flex-start",
                    background: "#ffffff",
                  }}
                >
                  <div
                    style={{
                      width: "2rem",
                      height: "2rem",
                      borderRadius: "50%",
                      background: "var(--gradient-primary)",
                      color: "#ffffff",
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
                    <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--color-text-primary)" }}>
                      {s.title}
                    </div>
                    <div style={{ color: "var(--color-text-secondary)", fontSize: "0.85rem", marginTop: "0.2rem", lineHeight: 1.5 }}>
                      {s.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Assembly Point Alert Strip */}
        <div
          className="alert-banner"
          style={{
            marginTop: "2.5rem",
            background: "rgba(217, 119, 6, 0.08)",
            borderColor: "rgba(217, 119, 6, 0.25)",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
          }}
          role="note"
          aria-label="Assembly point notification"
        >
          <AlertTriangle size={22} color="var(--color-warning)" style={{ flexShrink: 0 }} />
          <div>
            <strong style={{ color: "var(--color-warning)" }}>Designated Emergency Assembly Ground:</strong>
            <span style={{ color: "var(--color-text-secondary)", marginLeft: "0.5rem", fontSize: "0.9rem" }}>
              Proceed immediately to the open paved concourse situated outside <strong>Main Entrance (Gate A)</strong>. Follow instructions from Floor Marshals in orange vests.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
