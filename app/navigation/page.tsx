import type { Metadata } from "next";
import { VENUE_ZONES, EMERGENCY_CONTACTS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Venue Navigation & Map",
  description: "Interactive venue map to find stages, workshops, food courts, restrooms, and all event locations.",
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

const CATEGORY_CONFIG: Record<ZoneCategory, { icon: string; color: string; label: string }> = {
  Stage: { icon: "🎤", color: "#f59e0b", label: "Stage / Auditorium" },
  Hall: { icon: "🏛️", color: "#8b5cf6", label: "Hall / Workshop" },
  Food: { icon: "🍽️", color: "#10b981", label: "Food & Beverage" },
  Facility: { icon: "🚻", color: "#06b6d4", label: "Facilities" },
  Service: { icon: "ℹ️", color: "#3b82f6", label: "Services" },
  Other: { icon: "📍", color: "#6b7280", label: "Other" },
};

const DIRECTIONS = [
  { from: "Main Entrance", to: "Main Stage", steps: ["Enter through Gate A", "Turn left at Registration", "Follow signs to Main Stage — 2 min walk"] },
  { from: "Main Entrance", to: "Food Court", steps: ["Enter through Gate A", "Turn right past Registration", "Food Court is straight ahead — 3 min walk"] },
  { from: "Main Stage", to: "Workshop Hall A", steps: ["Exit Main Stage area", "Take the corridor on your left", "Workshop Hall A is the first door — 1 min walk"] },
] as const;

/** Venue Navigation page. */
export default function NavigationPage() {
  return (
    <div className="page-wrapper">
      <div className="container" style={{ paddingTop: "2rem" }}>
        <h1 className="section-title">
          🗺️ Venue <span className="gradient-text">Navigation</span>
        </h1>
        <p className="section-subtitle">
          Find any location in the venue instantly
        </p>

        {/* Interactive SVG Venue Map */}
        <section aria-labelledby="venue-map-heading" style={{ marginBottom: "3rem" }}>
          <h2 id="venue-map-heading" className="sr-only">Venue Map</h2>
          <div
            className="glass-card"
            style={{ padding: "2rem", overflow: "hidden" }}
            role="img"
            aria-label="Venue floor plan showing main areas"
          >
            <svg
              viewBox="0 0 900 500"
              style={{ width: "100%", height: "auto", maxHeight: "450px" }}
              aria-hidden="true"
            >
              {/* Outer boundary */}
              <rect x="10" y="10" width="880" height="480" rx="12" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />

              {/* Main Stage */}
              <rect x="30" y="30" width="300" height="200" rx="8" fill="rgba(245,158,11,0.15)" stroke="rgba(245,158,11,0.5)" strokeWidth="1.5" />
              <text x="180" y="115" textAnchor="middle" fill="#fbbf24" fontSize="13" fontWeight="700">🎤 Main Stage</text>
              <text x="180" y="133" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="10">Capacity: 2,000</text>

              {/* Auditorium */}
              <rect x="30" y="250" width="300" height="120" rx="8" fill="rgba(245,158,11,0.1)" stroke="rgba(245,158,11,0.3)" strokeWidth="1.5" />
              <text x="180" y="316" textAnchor="middle" fill="#fbbf24" fontSize="12" fontWeight="700">🎭 Auditorium</text>
              <text x="180" y="332" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="10">Capacity: 300</text>

              {/* Workshop Hall A */}
              <rect x="350" y="30" width="200" height="160" rx="8" fill="rgba(139,92,246,0.12)" stroke="rgba(139,92,246,0.4)" strokeWidth="1.5" />
              <text x="450" y="105" textAnchor="middle" fill="#a78bfa" fontSize="12" fontWeight="700">🏛️ Workshop</text>
              <text x="450" y="121" textAnchor="middle" fill="#a78bfa" fontSize="12" fontWeight="700">Hall A</text>

              {/* Workshop Hall B */}
              <rect x="350" y="210" width="200" height="160" rx="8" fill="rgba(139,92,246,0.1)" stroke="rgba(139,92,246,0.3)" strokeWidth="1.5" />
              <text x="450" y="285" textAnchor="middle" fill="#a78bfa" fontSize="12" fontWeight="700">🏛️ Workshop</text>
              <text x="450" y="301" textAnchor="middle" fill="#a78bfa" fontSize="12" fontWeight="700">Hall B</text>

              {/* Innovation Hub */}
              <rect x="570" y="30" width="160" height="120" rx="8" fill="rgba(6,182,212,0.12)" stroke="rgba(6,182,212,0.4)" strokeWidth="1.5" />
              <text x="650" y="90" textAnchor="middle" fill="#22d3ee" fontSize="12" fontWeight="700">💡 Innovation</text>
              <text x="650" y="106" textAnchor="middle" fill="#22d3ee" fontSize="12" fontWeight="700">Hub</text>

              {/* Food Court */}
              <rect x="570" y="170" width="160" height="100" rx="8" fill="rgba(16,185,129,0.12)" stroke="rgba(16,185,129,0.4)" strokeWidth="1.5" />
              <text x="650" y="220" textAnchor="middle" fill="#34d399" fontSize="12" fontWeight="700">🍽️ Food Court</text>

              {/* Networking Area */}
              <rect x="750" y="30" width="130" height="240" rx="8" fill="rgba(59,130,246,0.1)" stroke="rgba(59,130,246,0.3)" strokeWidth="1.5" />
              <text x="815" y="155" textAnchor="middle" fill="#60a5fa" fontSize="11" fontWeight="700">🤝 Networking</text>

              {/* Registration / First Aid */}
              <rect x="30" y="390" width="200" height="80" rx="8" fill="rgba(239,68,68,0.1)" stroke="rgba(239,68,68,0.4)" strokeWidth="1.5" />
              <text x="130" y="425" textAnchor="middle" fill="#f87171" fontSize="11" fontWeight="700">📋 Registration</text>
              <text x="130" y="442" textAnchor="middle" fill="#f87171" fontSize="10">& First Aid 💊</text>

              {/* Sponsors */}
              <rect x="250" y="390" width="160" height="80" rx="8" fill="rgba(249,115,22,0.1)" stroke="rgba(249,115,22,0.3)" strokeWidth="1.5" />
              <text x="330" y="435" textAnchor="middle" fill="#fb923c" fontSize="11" fontWeight="700">🏢 Sponsor Booths</text>

              {/* Restrooms */}
              <rect x="430" y="390" width="120" height="80" rx="8" fill="rgba(6,182,212,0.1)" stroke="rgba(6,182,212,0.3)" strokeWidth="1.5" />
              <text x="490" y="425" textAnchor="middle" fill="#22d3ee" fontSize="11" fontWeight="700">🚻 Restrooms</text>

              {/* Main Entrance */}
              <rect x="570" y="390" width="310" height="80" rx="8" fill="rgba(16,185,129,0.15)" stroke="rgba(16,185,129,0.5)" strokeWidth="2" />
              <text x="725" y="435" textAnchor="middle" fill="#34d399" fontSize="13" fontWeight="700">🚪 Main Entrance — Gate A</text>

              {/* Compass */}
              <circle cx="860" cy="460" r="18" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" />
              <text x="860" y="464" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="10" fontWeight="700">N↑</text>

              {/* Walkways */}
              <line x1="330" y1="130" x2="350" y2="130" stroke="rgba(255,255,255,0.15)" strokeWidth="8" strokeDasharray="4 4" />
              <line x1="550" y1="130" x2="570" y2="130" stroke="rgba(255,255,255,0.15)" strokeWidth="8" strokeDasharray="4 4" />
              <line x1="450" y1="190" x2="450" y2="210" stroke="rgba(255,255,255,0.15)" strokeWidth="8" strokeDasharray="4 4" />
            </svg>
          </div>
        </section>

        <div className="grid-2">
          {/* Zone Directory */}
          <section aria-labelledby="zones-heading">
            <h2 id="zones-heading" style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>
              📋 All Venue Locations
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: "500px", overflowY: "auto" }}>
              {VENUE_ZONES.map((zone) => {
                const cat = categorizeZone(zone);
                const config = CATEGORY_CONFIG[cat];
                return (
                  <div
                    key={zone}
                    className="glass-card"
                    style={{ padding: "0.875rem 1.125rem", display: "flex", alignItems: "center", gap: "0.75rem" }}
                    tabIndex={0}
                    role="listitem"
                    aria-label={`${zone} — ${config.label}`}
                  >
                    <span style={{ fontSize: "1.25rem" }} aria-hidden="true">{config.icon}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>{zone}</div>
                      <div style={{ color: config.color, fontSize: "0.75rem" }}>{config.label}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Getting There */}
          <section aria-labelledby="directions-heading">
            <h2 id="directions-heading" style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>
              🧭 Common Routes
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {DIRECTIONS.map((dir) => (
                <div key={dir.to} className="glass-card" style={{ padding: "1.25rem" }}>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.75rem" }}>
                    <span style={{ color: "var(--color-text-muted)", fontSize: "0.85rem" }}>{dir.from}</span>
                    <span style={{ color: "var(--color-primary)" }}>→</span>
                    <span style={{ fontWeight: 700, fontSize: "0.85rem" }}>{dir.to}</span>
                  </div>
                  <ol style={{ paddingLeft: "1.25rem" }}>
                    {dir.steps.map((step, i) => (
                      <li key={i} style={{ color: "var(--color-text-secondary)", fontSize: "0.8rem", marginBottom: "0.3rem" }}>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>

            {/* Emergency */}
            <div
              style={{ marginTop: "1.5rem", padding: "1rem", borderRadius: "var(--radius-md)", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}
              role="complementary"
              aria-label="Emergency contacts"
            >
              <p style={{ color: "#f87171", fontWeight: 700, fontSize: "0.85rem", marginBottom: "0.5rem" }}>🚨 Emergency</p>
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                {EMERGENCY_CONTACTS.slice(0, 3).map((c) => (
                  <a key={c.number} href={`tel:${c.number}`} style={{ color: "#f87171", fontWeight: 700, fontSize: "0.875rem", textDecoration: "none" }}>
                    {c.icon} {c.number}
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
