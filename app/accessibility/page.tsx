import type { Metadata } from "next";
import { EMERGENCY_CONTACTS, VENUE_NAME } from "@/lib/constants";
import {
  Accessibility,
  Car,
  VolumeX,
  Ear,
  Eye,
  Footprints,
  Check,
  ArrowRight,
  PhoneCall,
  Info,
  ShieldCheck,
  Building,
  HeartPulse
} from "lucide-react";

export const metadata: Metadata = {
  title: "Accessibility & Inclusive Access",
  description: "Accessible routes, wheelchair facilities, quiet zones, and support resources for all event attendees at " + VENUE_NAME,
};

const ACCESSIBLE_FEATURES = [
  {
    icon: Accessibility,
    title: "Wheelchair Accessible Routes",
    desc: "All main conference zones are linked via step-free, smooth concrete and carpeted pathways. Gradient ramps are installed at all stage entries.",
    available: true,
  },
  {
    icon: Car,
    title: "Designated Accessible Parking",
    desc: "Reserved barrier-free parking spaces located adjacent to Gate A and Hall 1. On-demand electric cart shuttle service provided from perimeter lots.",
    available: true,
  },
  {
    icon: HeartPulse,
    title: "Accessible Restroom Facilities",
    desc: "Wide-access restrooms with emergency pull-cords and grab rails located in Restrooms Block A (near Main Stage) and Block B (near Food Court).",
    available: true,
  },
  {
    icon: VolumeX,
    title: "Quiet & Sensory Decompression Zones",
    desc: "Designated low-sensory rest lounges equipped with dimmed lighting and noise-cancelling equipment in VIP Lounge and Workshop Hall B.",
    available: true,
  },
  {
    icon: Ear,
    title: "Sign Language & Live Captioning",
    desc: "Live ASL/ISL interpreters and real-time speech-to-text live captioning projected on screens at all Keynote sessions. Assistive headsets at Info Desk.",
    available: true,
  },
  {
    icon: Ear,
    title: "Induction Hearing Loop System",
    desc: "Direct telecoil (T-coil) hearing induction loops operational across Plenary Hall A, Main Stage, and the Innovation Auditorium.",
    available: true,
  },
  {
    icon: Footprints,
    title: "Tactile Guiding Pathways",
    desc: "High-contrast tactile ground paving strips extending continuously from Main Entrance security check to Main Stage and Dining pavilions.",
    available: true,
  },
  {
    icon: Eye,
    title: "Visual Assistance & Braille Guides",
    desc: "Large-print conference agendas, high-contrast screen reader accessible schedules, and tactile Braille venue navigation maps at Registration.",
    available: true,
  },
];

const ACCESSIBLE_ROUTES = [
  {
    from: "Gate A (Main Entrance)",
    to: "Main Stage (Hall 1)",
    path: "Head north, follow the blue tactile indicator strip. 100% step-free ramped access. Distance: 120m, 3 min.",
    type: "Level Path",
  },
  {
    from: "Gate A (Main Entrance)",
    to: "Food Court & Dining Pavilion",
    path: "Turn right onto the covered promenade. Broad level walkway without threshold bumps. Distance: 180m, 4 min.",
    type: "Level Path",
  },
  {
    from: "Gate A (Main Entrance)",
    to: "Workshop Hall A (Mezzanine)",
    path: "Proceed to Central Atrium near Registration desk. Take passenger elevator 2 to Floor 2. Elevator has Braille controls & voice alerts.",
    type: "Elevator Access",
  },
  {
    from: "Main Stage (Hall 1)",
    to: "Restrooms Block A",
    path: "Exit stage right toward East concourse. Accessible universal stall is the first door on the right with automatic sliding door.",
    type: "Level Path",
  },
];

export default function AccessibilityPage() {
  return (
    <div className="page-wrapper" style={{ background: "var(--color-bg)", minHeight: "100vh" }}>
      <div className="container" style={{ paddingTop: "2.5rem", paddingBottom: "4rem" }}>
        
        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.35rem 0.85rem", borderRadius: "9999px", background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", color: "#4f46e5", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.75rem" }}>
            <Accessibility size={15} />
            <span>Inclusive Venue Standards · {VENUE_NAME}</span>
          </div>
          <h1 className="section-title" style={{ fontSize: "2.2rem", fontWeight: 800, color: "var(--color-text)", letterSpacing: "-0.02em", marginBottom: "0.5rem" }}>
            Accessibility & <span className="gradient-text">Inclusive Access</span>
          </h1>
          <p className="section-subtitle" style={{ color: "var(--color-text-secondary)", fontSize: "1rem" }}>
            EventIQ and {VENUE_NAME} ensure barrier-free, equitable participation for all attendees of all abilities.
          </p>
        </div>

        {/* Quick Assistance Help Banner */}
        <div
          className="glass-card"
          style={{
            padding: "1.25rem 1.5rem",
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            marginBottom: "2.5rem",
            display: "flex",
            alignItems: "flex-start",
            gap: "1rem",
          }}
          role="note"
          aria-label="Accessibility help information"
        >
          <div style={{ padding: "0.5rem", borderRadius: "0.5rem", background: "#dbeafe", color: "#2563eb", flexShrink: 0 }}>
            <Info size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1e40af", marginBottom: "0.25rem" }}>
              Dedicated Accessibility Concierge
            </h2>
            <p style={{ color: "#334155", fontSize: "0.875rem", lineHeight: 1.5, margin: 0 }}>
              Need personal guidance, mobility scooter loan, or interpreter support? Visit the <strong>Inclusive Help Desk</strong> at Central Atrium, or contact Accessibility Support directly at{" "}
              <a href="tel:+919876543210" style={{ color: "#2563eb", fontWeight: 700, textDecoration: "underline" }}>+91-9876-543210</a>. In any safety emergency, dial{" "}
              <a href="tel:112" style={{ color: "#dc2626", fontWeight: 700, textDecoration: "underline" }}>112</a>.
            </p>
          </div>
        </div>

        {/* Accessibility Features Grid */}
        <section aria-labelledby="features-heading" style={{ marginBottom: "3rem" }}>
          <h2 id="features-heading" style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--color-text)", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <ShieldCheck size={20} color="#4f46e5" />
            Active Venue Accessibility Provisions
          </h2>
          <div className="grid-2">
            {ACCESSIBLE_FEATURES.map((f) => {
              const IconComp = f.icon;
              return (
                <div key={f.title} className="glass-card" style={{ padding: "1.5rem", display: "flex", gap: "1.25rem", alignItems: "flex-start" }}>
                  <div
                    style={{
                      width: "3rem",
                      height: "3rem",
                      borderRadius: "0.75rem",
                      background: "rgba(99,102,241,0.08)",
                      border: "1px solid rgba(99,102,241,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#4f46e5",
                      flexShrink: 0,
                    }}
                    aria-hidden="true"
                  >
                    <IconComp size={22} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.35rem" }}>
                      <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--color-text)" }}>{f.title}</h3>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.25rem",
                          background: "#ecfdf5",
                          color: "#059669",
                          border: "1px solid #a7f3d0",
                          borderRadius: "9999px",
                          padding: "0.15rem 0.5rem",
                          fontSize: "0.7rem",
                          fontWeight: 700,
                        }}
                      >
                        <Check size={12} />
                        Active
                      </span>
                    </div>
                    <p style={{ color: "var(--color-text-secondary)", fontSize: "0.85rem", lineHeight: 1.5, margin: 0 }}>
                      {f.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Accessible Routes Section */}
        <section aria-labelledby="routes-heading" style={{ marginBottom: "3rem" }}>
          <h2 id="routes-heading" style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--color-text)", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Building size={20} color="#4f46e5" />
            Step-Free Verified Routes
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {ACCESSIBLE_ROUTES.map((r) => (
              <div key={r.to} className="glass-card" style={{ padding: "1.25rem 1.5rem", display: "flex", gap: "1.25rem", alignItems: "flex-start" }}>
                <span
                  style={{
                    padding: "0.35rem 0.75rem",
                    borderRadius: "0.375rem",
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: "#16a34a",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  {r.type}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.35rem", flexWrap: "wrap" }}>
                    <span style={{ color: "var(--color-text-secondary)", fontSize: "0.85rem", fontWeight: 600 }}>{r.from}</span>
                    <ArrowRight size={14} color="#6366f1" />
                    <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--color-text)" }}>{r.to}</span>
                  </div>
                  <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", margin: 0 }}>{r.path}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Emergency Contact Bar */}
        <div
          style={{
            padding: "1rem 1.5rem",
            borderRadius: "0.5rem",
            background: "#fff1f2",
            border: "1px solid #fecdd3",
            display: "flex",
            gap: "1.5rem",
            flexWrap: "wrap",
            alignItems: "center"
          }}
          role="complementary"
          aria-label="Emergency contacts for accessibility assistance"
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#e11d48", fontWeight: 700, fontSize: "0.85rem" }}>
            <PhoneCall size={16} />
            <span>Emergency Assistance Contacts:</span>
          </div>
          {EMERGENCY_CONTACTS.slice(0, 4).map((c) => (
            <a key={c.number} href={`tel:${c.number}`} style={{ color: "#be123c", fontWeight: 600, fontSize: "0.85rem", textDecoration: "none" }}>
              {c.label}: {c.number}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
