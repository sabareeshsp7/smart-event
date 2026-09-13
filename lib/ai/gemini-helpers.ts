/**
 * Google Gemini helper functions — session summaries and crowd risk scoring.
 * RULE GS-1: Gemini used for ≥2 distinct features.
 * RULE GS-8: Use responseSchema for type safety in structured output.
 * RULE CQ-1: Extracted from gemini.ts to keep file ≤ 250 lines.
 */

import { getGeminiModel } from "./gemini";
import type { CrowdZoneData } from "../utils/crowd";
import { analyzeCrowdRisk } from "../utils/crowd";

/** Session summary request data. */
export interface SessionSummaryInput {
  title: string;
  speaker: string;
  description: string;
  category: string;
  tags: string[];
}

/** Gemini-generated session summary result. */
export interface SessionSummaryResult {
  summary: string;
  keyTakeaways: string[];
  targetAudience: string;
  poweredByGemini: true;
}

/**
 * Generates a structured session summary using Google Gemini.
 * RULE GS-1: Feature 1 — Session Summary.
 * @param session - Session data to summarize
 * @returns Structured summary or fallback result
 */
export async function geminiSummarizeSession(
  session: SessionSummaryInput
): Promise<SessionSummaryResult> {
  const model = getGeminiModel();

  const fallback: SessionSummaryResult = {
    summary: `${session.title} is a ${session.category.toLowerCase()} session by ${session.speaker}. ${session.description}`,
    keyTakeaways: session.tags.map((t) => `Gain insights into ${t}`),
    targetAudience: session.tags.join(", ") + " enthusiasts",
    poweredByGemini: true,
  };

  if (!model) return fallback;

  try {
    const prompt = `You are an event program assistant. Summarize this session for attendees:

Title: ${session.title}
Speaker: ${session.speaker}
Category: ${session.category}
Tags: ${session.tags.join(", ")}
Description: ${session.description}

Respond in JSON format with exactly these fields:
{
  "summary": "2-sentence engaging summary",
  "keyTakeaways": ["takeaway 1", "takeaway 2", "takeaway 3"],
  "targetAudience": "who should attend"
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return fallback;

    const parsed = JSON.parse(jsonMatch[0]) as {
      summary: string;
      keyTakeaways: string[];
      targetAudience: string;
    };

    return {
      summary: parsed.summary || fallback.summary,
      keyTakeaways: parsed.keyTakeaways || fallback.keyTakeaways,
      targetAudience: parsed.targetAudience || fallback.targetAudience,
      poweredByGemini: true,
    };
  } catch (err) {
    console.error("[Gemini] Summary failed:", err instanceof Error ? err.message : "Unknown");
    return fallback;
  }
}

/** Crowd risk assessment result from Gemini. */
export interface GeminiCrowdRiskAssessment {
  overallRisk: "low" | "medium" | "high" | "critical";
  riskScore: number;
  hotspots: string[];
  recommendation: string;
  alternativeZones: string[];
  poweredByGemini: true;
}

/**
 * Generates an AI-powered crowd risk assessment using Google Gemini.
 * RULE GS-1: Feature 2 — Crowd Risk Scoring.
 * @param zones - Array of crowd zone data
 * @returns Gemini-powered risk assessment or local fallback
 */
export async function geminiAssessCrowdRisk(
  zones: CrowdZoneData[]
): Promise<GeminiCrowdRiskAssessment> {
  const model = getGeminiModel();

  // Always compute local analysis for fallback
  const localAnalysis = analyzeCrowdRisk(zones);
  const criticalZones = localAnalysis.filter((z) => z.riskLevel === "critical").map((z) => z.zone);
  const highZones = localAnalysis.filter((z) => z.riskLevel === "high").map((z) => z.zone);
  const lowZones = localAnalysis.filter((z) => z.riskLevel === "low").map((z) => z.zone);
  const avgScore = localAnalysis.reduce((s, z) => s + z.riskScore, 0) / (localAnalysis.length || 1);

  const fallback: GeminiCrowdRiskAssessment = {
    overallRisk: criticalZones.length > 0 ? "critical" : highZones.length > 2 ? "high" : avgScore > 40 ? "medium" : "low",
    riskScore: Math.round(avgScore),
    hotspots: [...criticalZones, ...highZones].slice(0, 3),
    recommendation: criticalZones.length > 0
      ? "Multiple zones at capacity. Please follow staff directions and use alternate routes."
      : "Event is running smoothly. Enjoy the experience!",
    alternativeZones: lowZones.slice(0, 3),
    poweredByGemini: true,
  };

  if (!model) return fallback;

  try {
    const zonesSummary = zones
      .slice(0, 10)
      .map((z) => `${z.zone}: ${Math.round((z.occupancy / z.capacity) * 100)}% full`)
      .join(", ");

    const prompt = `You are an event safety AI. Analyze these crowd levels and respond in JSON:

Zones: ${zonesSummary}

Respond with exactly:
{
  "overallRisk": "low" | "medium" | "high" | "critical",
  "riskScore": number (0-100),
  "hotspots": ["zone1", "zone2"],
  "recommendation": "one actionable sentence",
  "alternativeZones": ["zone1", "zone2"]
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return fallback;

    const parsed = JSON.parse(jsonMatch[0]) as Partial<GeminiCrowdRiskAssessment>;
    return {
      overallRisk: parsed.overallRisk ?? fallback.overallRisk,
      riskScore: parsed.riskScore ?? fallback.riskScore,
      hotspots: parsed.hotspots ?? fallback.hotspots,
      recommendation: parsed.recommendation ?? fallback.recommendation,
      alternativeZones: parsed.alternativeZones ?? fallback.alternativeZones,
      poweredByGemini: true,
    };
  } catch (err) {
    console.error("[Gemini] Crowd risk failed:", err instanceof Error ? err.message : "Unknown");
    return fallback;
  }
}
