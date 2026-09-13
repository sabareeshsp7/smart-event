"use client";
/**
 * Crowd Heatmap page — Real-time crowd levels with Gemini risk assessment.
 * Light mode theme with Lucide icons and zero emojis.
 * Auto-refreshes every 30s.
 */

import { useState, useEffect } from "react";
import { animate } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  PhoneCall,
  ShieldAlert,
} from "lucide-react";
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
  low: "#059669",
  medium: "#d97706",
  high: "#dc2626",
  critical: "#b91c1c",
};

function OccupancyBar({ pct, risk }: { pct: number; risk: string }) {
  const color = RISK_COLORS[risk] ?? "var(--color-primary)";
  return (
    <div
      style={{ height: "6px", background: "var(--color-bg-3)", borderRadius: "3px", overflow: "hidden" }}
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

/** Crowd heatmap page in Light Mode with zero emojis. */
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
      const data = (await res.json()) as { zones: CrowdZone[] };
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
        const data = (await res.json()) as GeminiRiskAssessment;
        setRiskData(data);
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
              background: "rgba(5, 150, 105, 0.08)",
              color: "var(--color-success)",
              fontSize: "0.8rem",
              fontWeight: 600,
              marginBottom: "0.75rem",
            }}
          >
            <Activity size={14} /> Real-Time Telemetry
          </div>
          <h1 className="section-title">
            Crowd <span className="gradient-text">Heatmap</span>
          </h1>
          <p className="section-subtitle" style={{ marginBottom: "0.5rem" }}>
            Real-time venue density analytics across all 20 zones • Auto-refreshes every 30s
          </p>
        </div>

        {/* Gemini AI Risk Overview Card */}
        {(riskLoading || riskData) && (
          <div
            className="glass-card fade-in-up"
            style={{
              padding: "2rem",
              background: "#ffffff",
              border: "1px solid var(--color-border)",
              marginBottom: "2.5rem",
              display: "flex",
              gap: "2.5rem",
              flexWrap: "wrap",
              alignItems: "center",
            }}
            aria-live="polite"
          >
            {/* Risk Score Gauge */}
            <div style={{ textAlign: "center", minWidth: "130px" }}>
              <div
                style={{
                  fontSize: "3.75rem",
                  fontWeight: 900,
                  lineHeight: 1,
                  fontFamily: "var(--font-display)",
                  color: riskData ? RISK_COLORS[riskData.overallRisk] : "var(--color-text-muted)",
                }}
                aria-label={`Risk score: ${animatedScore} out of 100`}
              >
                {riskLoading ? "—" : animatedScore}
              </div>
              <div style={{ color: "var(--color-text-muted)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: "0.25rem" }}>
                Congestion Index
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                <span className="badge badge-gemini" style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  <Sparkles size={13} /> Google Gemini Safety Assessment
                </span>
                {riskData && (
                  <span
                    style={{
                      padding: "0.2rem 0.75rem",
                      borderRadius: "var(--radius-full)",
                      background: `${RISK_COLORS[riskData.overallRisk]}15`,
                      color: RISK_COLORS[riskData.overallRisk],
                      fontWeight: 700,
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      border: `1px solid ${RISK_COLORS[riskData.overallRisk]}35`,
                    }}
                  >
                    {riskData.overallRisk.toUpperCase()} CONGESTION
                  </span>
                )}
              </div>

              {riskLoading ? (
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <div className="spinner" role="status" aria-label="Loading AI risk assessment" />
                  <span style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>Gemini is computing zone bottlenecks...</span>
                </div>
              ) : riskData ? (
                <>
                  <p style={{ color: "var(--color-text-primary)", marginBottom: "0.85rem", fontSize: "0.925rem", lineHeight: 1.6 }}>
                    {riskData.recommendation}
                  </p>
                  <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", fontSize: "0.85rem" }}>
                    {riskData.hotspots.length > 0 && (
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--color-danger)" }}>
                        <AlertTriangle size={15} />
                        <span>High Traffic: <strong>{riskData.hotspots.join(", ")}</strong></span>
                      </div>
                    )}
                    {riskData.alternativeZones.length > 0 && (
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--color-success)" }}>
                        <CheckCircle2 size={15} />
                        <span>Low Density: <strong>{riskData.alternativeZones.join(", ")}</strong></span>
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </div>
          </div>
        )}

        {/* Zones Grid */}
        {loading && zones.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem" }}>
            <div className="spinner" style={{ width: "2rem", height: "2rem", margin: "0 auto" }} role="status" aria-label="Loading crowd telemetry" />
            <p style={{ color: "var(--color-text-muted)", marginTop: "1rem" }}>Streaming real-time telemetry from 20 venue zones...</p>
          </div>
        ) : (
          <div className="grid-3" style={{ gap: "1.25rem" }}>
          {zones.map((zone) => {
            const pct = Math.round((zone.occupancy / zone.capacity) * 100);
            const risk = getZoneRisk(zone);
            const color = RISK_COLORS[risk];

            return (
              <div
                key={zone.id}
                className="glass-card"
                style={{
                  padding: "1.5rem",
                  background: "#ffffff",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.85rem",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "0.2rem" }}>
                      {zone.zone}
                    </h3>
                    <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                      Capacity: {zone.capacity.toLocaleString()} attendees
                    </span>
                  </div>
                  <span
                    style={{
                      padding: "0.15rem 0.55rem",
                      borderRadius: "var(--radius-full)",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      background: `${color}15`,
                      color: color,
                      border: `1px solid ${color}35`,
                    }}
                  >
                    {risk}
                  </span>
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "0.35rem", fontWeight: 600 }}>
                    <span style={{ color: "var(--color-text-secondary)" }}>{zone.occupancy} present</span>
                    <span style={{ color }}>{pct}%</span>
                  </div>
                  <OccupancyBar pct={pct} risk={risk} />
                </div>
              </div>
            );
          })}
        </div>
        )}

        {/* Emergency Footnote */}
        <div
          style={{
            marginTop: "2.5rem",
            padding: "1.25rem",
            background: "rgba(220, 38, 38, 0.05)",
            border: "1px solid rgba(220, 38, 38, 0.2)",
            borderRadius: "var(--radius-md)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--color-danger)", fontWeight: 700, fontSize: "0.875rem" }}>
            <ShieldAlert size={18} /> Venue Safety Protocol: Automatic bottleneck alerts are relayed to Hall Marshals in real-time.
          </div>
          <a
            href="tel:112"
            style={{
              color: "var(--color-danger)",
              fontWeight: 700,
              fontSize: "0.85rem",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "0.35rem",
            }}
          >
            <PhoneCall size={14} /> Immediate Assistance: 112
          </a>
        </div>
      </div>
    </div>
  );
}
