/**
 * Crowd analysis algorithms for zone occupancy scoring and risk assessment.
 * All functions are pure and deterministic — safe to use as fallback.
 */

import {
  CROWD_LOW_THRESHOLD,
  CROWD_MEDIUM_THRESHOLD,
  CROWD_HIGH_THRESHOLD,
} from "../constants";

/** Crowd risk level labels. */
export type CrowdRiskLevel = "low" | "medium" | "high" | "critical";

/** Crowd zone data for analysis. */
export interface CrowdZoneData {
  zone: string;
  occupancy: number;
  capacity: number;
}

/** Result of a crowd risk analysis. */
export interface CrowdRiskResult {
  zone: string;
  occupancyPct: number;
  riskLevel: CrowdRiskLevel;
  riskScore: number;
  recommendation: string;
}

/**
 * Calculates occupancy percentage for a zone.
 * @param occupancy - Current number of people
 * @param capacity - Maximum capacity
 * @returns Percentage from 0–100
 */
export function calcOccupancyPct(occupancy: number, capacity: number): number {
  if (capacity <= 0) return 0;
  return Math.min(100, Math.round((occupancy / capacity) * 100));
}

/**
 * Determines the risk level based on occupancy percentage.
 * @param pct - Occupancy percentage (0–100)
 * @returns CrowdRiskLevel
 */
export function getCrowdRiskLevel(pct: number): CrowdRiskLevel {
  if (pct >= CROWD_HIGH_THRESHOLD) return "critical";
  if (pct >= CROWD_MEDIUM_THRESHOLD) return "high";
  if (pct >= CROWD_LOW_THRESHOLD) return "medium";
  return "low";
}

/**
 * Returns a numeric risk score (0–100) for a given occupancy percentage.
 * Uses an exponential curve to emphasize danger at high occupancies.
 * @param pct - Occupancy percentage (0–100)
 * @returns Risk score (0–100)
 */
export function calcRiskScore(pct: number): number {
  if (pct <= 0) return 0;
  if (pct >= 100) return 100;
  // Exponential risk curve: grows slowly then sharply
  return Math.min(100, Math.round(Math.pow(pct / 100, 1.5) * 100));
}

/**
 * Generates a human-readable recommendation based on risk level.
 * @param riskLevel - The calculated risk level
 * @param zone - Zone name for context
 * @returns Recommendation string
 */
export function getRiskRecommendation(
  riskLevel: CrowdRiskLevel,
  zone: string
): string {
  const recommendations: Record<CrowdRiskLevel, string> = {
    low: `${zone} is comfortable. Enjoy your visit!`,
    medium: `${zone} is moderately busy. Consider visiting during off-peak hours.`,
    high: `${zone} is crowded. We recommend using an alternate route or waiting 15–20 minutes.`,
    critical: `${zone} is at capacity. Please avoid this area and use the alternative space provided by staff.`,
  };
  return recommendations[riskLevel];
}

/**
 * Analyzes crowd data for all zones and returns risk results.
 * @param zones - Array of zone crowd data
 * @returns Array of risk results, sorted by risk score descending
 */
export function analyzeCrowdRisk(zones: CrowdZoneData[]): CrowdRiskResult[] {
  return zones
    .map((z) => {
      const pct = calcOccupancyPct(z.occupancy, z.capacity);
      const riskLevel = getCrowdRiskLevel(pct);
      const riskScore = calcRiskScore(pct);
      return {
        zone: z.zone,
        occupancyPct: pct,
        riskLevel,
        riskScore,
        recommendation: getRiskRecommendation(riskLevel, z.zone),
      };
    })
    .sort((a, b) => b.riskScore - a.riskScore);
}

/**
 * Returns the top N most crowded zones.
 * @param zones - Array of zone crowd data
 * @param n - Number of top zones to return
 * @returns Sorted array of top N risk results
 */
export function getTopCrowdedZones(
  zones: CrowdZoneData[],
  n: number = 5
): CrowdRiskResult[] {
  return analyzeCrowdRisk(zones).slice(0, n);
}
