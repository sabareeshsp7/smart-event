"use client";
/**
 * Crowd Heatmap page — real-time crowd levels with Gemini risk assessment.
 * RULE GS-1: Gemini used for crowd risk scoring (Feature 2).
 * RULE INN-1: Animated risk score counter.
 */

import { useState, useEffect } from "react";
import { animate } from "framer-motion";
import { API_ROUTES } from "@/lib/constants";
import type { CrowdRiskLevel } from "@/lib/utils/crowd";

interface CrowdZone {
  id: string;
  zone: string;
  occupancy: number;
  capacity: number;
}

interface GeminiRiskAssessment {
  overallRisk: CrowdRiskLevel;
  riskScore: number;
  hotspots: string[];
  recommendation: string;
  alternativeZones: string[];
  poweredByGemini: boolean;
}

const RISK_COLORS: Record<string, string> = {
  low: "#10b981",
  medium: "#f59e0b",
  high: "#ef4444",
  critical: "#dc2626",
};

function OccupancyBar({ pct, risk }: { pct: number; risk: string }) {
  const color = RISK_COLORS[risk] ?? "#8b5cf6";
  return (
    <div
      style={{ height: "6px", background: "rgba(255,255,255,0.08)", borderRadius: "3px", overflow: "hidden" }}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${pct}% occupancy`}
    >
      <div
        style={{
          height: "100%",
          width: `${pct}%`,
          background: color,
          borderRadius: "3px",
          transition: "width 0.8s ease",
        }}
      />
    </div>
  );
}

/** Crowd heatmap page. */
export default function CrowdPage() {
  const [zones, setZones] = useState<CrowdZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [riskData, setRiskData] = useState<GeminiRiskAssessment | null>(null);
  const [riskLoading, setRiskLoading] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    void loadCrowdData();
    const interval = setInterval(() => void loadCrowdData(), 30_000);
    return () => clearInterval(interval);
  }, []);

  const loadCrowdData = async () => {
    try {
      const res = await fetch(API_ROUTES.CROWD);
      if (!res.ok) return;
      const data = await res.json() as { zones: CrowdZone[] };
      setZones(data.zones);
      void loadRiskAssessment(data.zones);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  const loadRiskAssessment = async (crowdZones: CrowdZone[]) => {
    setRiskLoading(true);
    try {
      const res = await fetch(API_ROUTES.CROWD_RISK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          zones: crowdZones.slice(0, 10).map((z) => ({
            zone: z.zone,
            occupancy: z.occupancy,
            capacity: z.capacity,
          })),
        }),
      });
      if (res.ok) {
        const data = await res.json() as GeminiRiskAssessment;
        setRiskData(data);
        // Animate score counter using Framer Motion
        animate(0, data.riskScore, {
          duration: 1.5,
          ease: "easeOut",
          onUpdate: (latest) => setAnimatedScore(Math.round(latest)),
        });
      }
    } catch {
      /* ignore */
    } finally {
      setRiskLoading(false);
    }
  };

  const getZoneRisk = (z: CrowdZone): CrowdRiskLevel => {
    const pct = (z.occupancy / z.capacity) * 100;
    if (pct >= 90) return "critical";
    if (pct >= 70) return "high";
    if (pct >= 40) return "medium";
    return "low";
  };

  return (
    <div className="page-wrapper">
      <div className="container" style={{ paddingTop: "2rem" }}>
        <h1 className="section-title">
          👥 Crowd <span className="gradient-text">Heatmap</span>
        </h1>
        <p className="section-subtitle">
          Real-time occupancy levels across all venue zones · Auto-refreshes every 30s
        </p>

        {/* Gemini Risk Overview */}
        {(riskLoading || riskData) && (
          <div
            style={{
              padding: "1.5rem",
              borderRadius: "var(--radius-lg)",
              background:
                "linear-gradient(135deg,rgba(66,133,244,0.08),rgba(52,168,83,0.08),rgba(251,188,5,0.08),rgba(234,67,53,0.08))",
              border: "1px solid rgba(255,255,255,0.1)",
              marginBottom: "2rem",
              display: "flex",
              gap: "2rem",
              flexWrap: "wrap",
              alignItems: "center",
            }}
            aria-live="polite"
            aria-label="AI crowd risk assessment"
          >
            {/* Risk score dial */}
            <div style={{ textAlign: "center", minWidth: "120px" }}>
              <div
                style={{
                  fontSize: "3.5rem",
                  fontWeight: 900,
                  lineHeight: 1,
                  fontFamily: "var(--font-display)",
                  color: riskData ? RISK_COLORS[riskData.overallRisk] : "var(--color-text-muted)",
                }}
                aria-label={`Risk score: ${animatedScore} out of 100`}
              >
                {riskLoading ? "—" : animatedScore}
              </div>
              <div style={{ color: "var(--color-text-muted)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Risk Score
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                <span className="badge badge-gemini">✦ Google Gemini Analysis</span>
                {riskData && (
                  <span
                    style={{
                      padding: "0.2rem 0.75rem",
                      borderRadius: "var(--radius-full)",
                      background: `${RISK_COLORS[riskData.overallRisk]}20`,
                      color: RISK_COLORS[riskData.overallRisk],
                      fontWeight: 700,
                      fontSize: "0.8rem",
                      textTransform: "uppercase",
                      border: `1px solid ${RISK_COLORS[riskData.overallRisk]}40`,
                    }}
                    aria-label={`Overall risk level: ${riskData.overallRisk}`}
                  >
                    {riskData.overallRisk.toUpperCase()} RISK
                  </span>
                )}
              </div>
              {riskLoading ? (
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <div className="spinner" role="status" aria-label="Loading AI risk assessment" />
                  <span style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>Gemini is analyzing crowd data...</span>
                </div>
              ) : riskData ? (
                <>
                  <p style={{ color: "var(--color-text-secondary)", marginBottom: "0.75rem", fontSize: "0.9rem" }}>
                    {riskData.recommendation}
                  </p>
                  {riskData.hotspots.length > 0 && (
                    <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                      🔥 Hotspots: <strong style={{ color: "#f87171" }}>{riskData.hotspots.join(", ")}</strong>
                    </div>
                  )}
                  {riskData.alternativeZones.length > 0 && (
                    <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
                      ✅ Quieter zones: <strong style={{ color: "#34d399" }}>{riskData.alternativeZones.join(", ")}</strong>
                    </div>
                  )}
                </>
              ) : null}
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: "4rem" }}>
            <div className="spinner" style={{ width: "2rem", height: "2rem", margin: "0 auto" }} role="status" aria-label="Loading crowd data" />
            <p style={{ color: "var(--color-text-muted)", marginTop: "1rem" }}>Loading crowd data...</p>
          </div>
        )}

        {/* Zone grid */}
        {!loading && (
          <div className="grid-4">
            {zones.map((zone) => {
              const pct = Math.round((zone.occupancy / zone.capacity) * 100);
              const risk = getZoneRisk(zone);
              const color = RISK_COLORS[risk] ?? "#8b5cf6";

              return (
                <article
                  key={zone.id}
                  className="glass-card"
                  style={{
                    padding: "1.25rem",
                    borderColor: `${color}30`,
                  }}
                  aria-label={`${zone.zone}: ${pct}% full, ${risk} risk`}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                    <h2 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--color-text-primary)", lineHeight: 1.3 }}>
                      {zone.zone}
                    </h2>
                    <span
                      style={{
                        padding: "0.15rem 0.5rem",
                        borderRadius: "var(--radius-full)",
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        background: `${color}20`,
                        color,
                        border: `1px solid ${color}30`,
                        textTransform: "uppercase",
                        flexShrink: 0,
                      }}
                    >
                      {risk}
                    </span>
                  </div>

                  <div style={{ fontSize: "2rem", fontWeight: 900, color, lineHeight: 1, marginBottom: "0.5rem", fontFamily: "var(--font-display)" }}>
                    {pct}<span style={{ fontSize: "1rem", fontWeight: 600 }}>%</span>
                  </div>

                  <OccupancyBar pct={pct} risk={risk} />

                  <div style={{ color: "var(--color-text-muted)", fontSize: "0.75rem", marginTop: "0.5rem" }}>
                    {zone.occupancy.toLocaleString()} / {zone.capacity.toLocaleString()} people
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Legend */}
        <div
          style={{
            marginTop: "2rem",
            padding: "1.25rem",
            borderRadius: "var(--radius-md)",
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            display: "flex",
            gap: "1.5rem",
            flexWrap: "wrap",
            alignItems: "center",
          }}
          role="note"
          aria-label="Risk level legend"
        >
          <strong style={{ fontSize: "0.85rem" }}>Legend:</strong>
          {Object.entries(RISK_COLORS).map(([level, color]) => (
            <div key={level} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{ width: "12px", height: "12px", borderRadius: "3px", background: color }} aria-hidden="true" />
              <span style={{ fontSize: "0.8rem", textTransform: "capitalize", color: "var(--color-text-secondary)" }}>{level}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
