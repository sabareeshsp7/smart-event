import type { Metadata } from "next";
import {
  MapPin,
  Mic,
  Building2,
  Coffee,
  Info,
  Navigation,
  ShieldAlert,
  PhoneCall,
  Compass,
  Layers,
  ArrowRight,
} from "lucide-react";
import { VENUE_ZONES, EMERGENCY_CONTACTS, VENUE_NAME, VENUE_ADDRESS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Venue Navigation & Floor Map",
  description: "Interactive floor plan for Bangalore International Exhibition Centre (BIEC) with stages, halls, and dining zones.",
};

type ZoneCategory = "Stage" | "Hall" | "Food" | "Facility" | "Service" | "Other";

function categorizeZone(zone: string): ZoneCategory {
  if (zone.includes("Stage") || zone.includes("Auditorium")) return "Stage";
  if (zone.includes("Hall") || zone.includes("Hub") || zone.includes("Area") && !zone.includes("Parking") || zone.includes("Booth") || zone.includes("Lounge")) return "Hall";
  if (zone.includes("Food")) return "Food";
  if (zone.includes("Restroom") || zone.includes("First Aid") || zone.includes("Parking")) return "Facility";
  if (zone.includes("Registration") || zone.includes("Help") || zone.includes("Press") || zone.includes("Entrance")) return "Service";
  return "Other";
}

const CATEGORY_CONFIG: Record<ZoneCategory, { icon: typeof MapPin; color: string; label: string }> = {
  Stage: { icon: Mic, color: "#d97706", label: "Stage / Auditorium" },
  Hall: { icon: Building2, color: "#4f46e5", label: "Hall / Workshop" },
  Food: { icon: Coffee, color: "#059669", label: "Food Concourse" },
  Facility: { icon: Layers, color: "#0891b2", label: "Facilities" },
  Service: { icon: Info, color: "#2563eb", label: "Attendee Services" },
  Other: { icon: MapPin, color: "#64748b", label: "General Zone" },
};

const DIRECTIONS = [
  { from: "Main Entrance (Gate A)", to: "Grand Alpha Stage (Hall 1)", steps: ["Enter through Turnstiles Gate A", "Proceed straight past Registration Kiosks", "Take North Concourse corridor on left — 2 min walk"] },
  { from: "Main Entrance", to: "South Food Concourse", steps: ["Enter through Turnstiles Gate A", "Turn right along the East Galleria", "South Food Concourse is directly ahead — 3 min walk"] },
  { from: "Grand Alpha Stage", to: "Deep Tech Workshop Hall A", steps: ["Exit Alpha Stage via West Portico", "Follow covered walkway to Hall 3", "Workshop Hall A is on the Mezzanine level — 2 min walk"] },
] as const;

/** Venue Navigation page in clean Light Mode with zero emojis. */
export default function NavigationPage() {
  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              padding: "0.25rem 0.75rem",
              borderRadius: "var(--radius-full)",
              background: "rgba(79, 70, 229, 0.08)",
              color: "var(--color-primary)",
              fontSize: "0.8rem",
              fontWeight: 600,
              marginBottom: "0.75rem",
            }}
          >
            <Compass size={14} /> Interactive Floor Plan
          </div>
          <h1 className="section-title">
            Venue <span className="gradient-text">Navigation</span>
          </h1>
          <p className="section-subtitle" style={{ marginBottom: "0.5rem" }}>
            {VENUE_NAME} • {VENUE_ADDRESS}
          </p>
        </div>

        {/* Interactive Floor Plan SVG */}
        <section aria-labelledby="venue-map-heading" style={{ marginBottom: "3rem" }}>
          <h2 id="venue-map-heading" className="sr-only">Venue Floor Plan</h2>
          <div
            className="glass-card"
            style={{ padding: "2rem", overflow: "hidden", background: "#ffffff" }}
            role="img"
            aria-label="Bangalore International Exhibition Centre complex layout"
          >
            <svg
              viewBox="0 0 900 500"
              style={{ width: "100%", height: "auto", maxHeight: "460px" }}
              aria-hidden="true"
            >
              {/* Outer boundary */}
              <rect x="10" y="10" width="880" height="480" rx="14" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" />

              {/* Main Stage / Hall 1 */}
              <rect x="30" y="30" width="300" height="200" rx="8" fill="#fffbeb" stroke="#fcd34d" strokeWidth="1.5" />
              <text x="180" y="115" textAnchor="middle" fill="#b45309" fontSize="13" fontWeight="800">Grand Alpha Stage (Hall 1)</text>
              <text x="180" y="135" textAnchor="middle" fill="#78350f" fontSize="11">Capacity: 2,000 • Keynotes &amp; Plenaries</text>

              {/* Auditorium / Hall 2 */}
              <rect x="30" y="250" width="300" height="120" rx="8" fill="#fffbeb" stroke="#fcd34d" strokeWidth="1.5" />
              <text x="180" y="312" textAnchor="middle" fill="#b45309" fontSize="12" fontWeight="700">Beta Auditorium</text>
              <text x="180" y="330" textAnchor="middle" fill="#78350f" fontSize="10">Capacity: 300 • Technical Demos</text>

              {/* Workshop Hall A */}
              <rect x="350" y="30" width="200" height="160" rx="8" fill="#eef2ff" stroke="#c7d2fe" strokeWidth="1.5" />
              <text x="450" y="105" textAnchor="middle" fill="#4338ca" fontSize="12" fontWeight="700">Workshop Hall A</text>
              <text x="450" y="123" textAnchor="middle" fill="#6366f1" fontSize="10">Capacity: 200 • AI &amp; Cloud</text>

              {/* Workshop Hall B */}
              <rect x="350" y="210" width="200" height="160" rx="8" fill="#eef2ff" stroke="#c7d2fe" strokeWidth="1.5" />
              <text x="450" y="285" textAnchor="middle" fill="#4338ca" fontSize="12" fontWeight="700">Workshop Hall B</text>
              <text x="450" y="303" textAnchor="middle" fill="#6366f1" fontSize="10">Capacity: 150 • Startup Track</text>

              {/* Innovation Hub */}
              <rect x="570" y="30" width="160" height="120" rx="8" fill="#ecfeff" stroke="#a5f3fc" strokeWidth="1.5" />
              <text x="650" y="88" textAnchor="middle" fill="#0e7490" fontSize="12" fontWeight="700">Innovation Hub</text>
              <text x="650" y="106" textAnchor="middle" fill="#0891b2" fontSize="10">Demo Pods &amp; Lightning</text>

              {/* Food Court */}
              <rect x="570" y="170" width="160" height="100" rx="8" fill="#ecfdf5" stroke="#a7f3d0" strokeWidth="1.5" />
              <text x="650" y="215" textAnchor="middle" fill="#047857" fontSize="12" fontWeight="700">South Food Concourse</text>
              <text x="650" y="233" textAnchor="middle" fill="#059669" fontSize="10">Open 09:00 - 20:00</text>

              {/* Networking Area */}
              <rect x="750" y="30" width="130" height="240" rx="8" fill="#eff6ff" stroke="#bfdbfe" strokeWidth="1.5" />
              <text x="815" y="145" textAnchor="middle" fill="#1d4ed8" fontSize="11" fontWeight="700">Networking</text>
              <text x="815" y="163" textAnchor="middle" fill="#2563eb" fontSize="11" fontWeight="700">Plaza &amp; Lounge</text>

              {/* Registration & First Aid */}
              <rect x="30" y="390" width="200" height="80" rx="8" fill="#fef2f2" stroke="#fecaca" strokeWidth="1.5" />
              <text x="130" y="426" textAnchor="middle" fill="#b91c1c" fontSize="11" fontWeight="700">Registration Desk</text>
              <text x="130" y="444" textAnchor="middle" fill="#dc2626" fontSize="10">&amp; Medical Aid Desk</text>

              {/* Sponsor Expo */}
              <rect x="250" y="390" width="160" height="80" rx="8" fill="#fff7ed" stroke="#fed7aa" strokeWidth="1.5" />
              <text x="330" y="435" textAnchor="middle" fill="#c2410c" fontSize="11" fontWeight="700">Sponsor Pavilion</text>

              {/* Restrooms */}
              <rect x="430" y="390" width="120" height="80" rx="8" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1.5" />
              <text x="490" y="435" textAnchor="middle" fill="#475569" fontSize="11" fontWeight="700">Restrooms (East)</text>

              {/* Main Entrance Gate A */}
              <rect x="570" y="390" width="310" height="80" rx="8" fill="#ecfdf5" stroke="#34d399" strokeWidth="2" />
              <text x="725" y="435" textAnchor="middle" fill="#065f46" fontSize="13" fontWeight="800">Main Entrance — Gate A Turnstiles</text>

              {/* Compass Indicator */}
              <circle cx="860" cy="460" r="18" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
              <text x="860" y="464" textAnchor="middle" fill="#0f172a" fontSize="10" fontWeight="800">N</text>

              {/* Walkway paths */}
              <line x1="330" y1="130" x2="350" y2="130" stroke="#94a3b8" strokeWidth="4" strokeDasharray="4 4" />
              <line x1="550" y1="130" x2="570" y2="130" stroke="#94a3b8" strokeWidth="4" strokeDasharray="4 4" />
              <line x1="450" y1="190" x2="450" y2="210" stroke="#94a3b8" strokeWidth="4" strokeDasharray="4 4" />
            </svg>
          </div>
        </section>

        <div className="grid-2" style={{ gap: "2rem" }}>
          {/* Zone Directory */}
          <section aria-labelledby="zones-heading">
            <h2 id="zones-heading" style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Layers size={18} color="var(--color-primary)" /> All Venue Locations
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", maxHeight: "520px", overflowY: "auto", paddingRight: "0.5rem" }}>
              {VENUE_ZONES.map((zone) => {
                const cat = categorizeZone(zone);
                const config = CATEGORY_CONFIG[cat];
                const Icon = config.icon;
                return (
                  <div
                    key={zone}
                    className="glass-card"
                    style={{
                      padding: "0.875rem 1.25rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.85rem",
                      background: "#ffffff",
                    }}
                    tabIndex={0}
                    role="listitem"
                    aria-label={`${zone} — ${config.label}`}
                  >
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "var(--radius-sm)",
                        background: `${config.color}15`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: config.color,
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={16} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--color-text-primary)" }}>{zone}</div>
                      <div style={{ color: config.color, fontSize: "0.75rem", fontWeight: 500 }}>{config.label}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Turn-by-Turn Navigation */}
          <section aria-labelledby="directions-heading">
            <h2 id="directions-heading" style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Navigation size={18} color="var(--color-secondary)" /> Turn-by-Turn Routes
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {DIRECTIONS.map((dir) => (
                <div key={dir.to} className="glass-card" style={{ padding: "1.35rem", background: "#ffffff" }}>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.85rem" }}>
                    <span style={{ color: "var(--color-text-muted)", fontSize: "0.85rem" }}>{dir.from}</span>
                    <ArrowRight size={14} color="var(--color-primary)" />
                    <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--color-text-primary)" }}>{dir.to}</span>
                  </div>
                  <ol style={{ paddingLeft: "1.25rem" }}>
                    {dir.steps.map((step, i) => (
                      <li key={i} style={{ color: "var(--color-text-secondary)", fontSize: "0.85rem", marginBottom: "0.35rem", lineHeight: 1.5 }}>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>

            {/* Emergency Info Card */}
            <div
              style={{
                marginTop: "1.75rem",
                padding: "1.25rem",
                borderRadius: "var(--radius-md)",
                background: "rgba(220, 38, 38, 0.05)",
                border: "1px solid rgba(220, 38, 38, 0.2)",
              }}
              role="complementary"
              aria-label="Emergency contacts"
            >
              <p style={{ color: "var(--color-danger)", fontWeight: 700, fontSize: "0.85rem", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <ShieldAlert size={16} /> On-Site Emergency Dispatch
              </p>
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                {EMERGENCY_CONTACTS.slice(0, 3).map((c) => (
                  <a
                    key={c.number}
                    href={`tel:${c.number}`}
                    style={{
                      color: "var(--color-danger)",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.35rem",
                    }}
                  >
                    <PhoneCall size={13} /> {c.label}: {c.number}
                  </a>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
