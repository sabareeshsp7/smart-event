import { describe, it, expect } from "vitest";
import {
  calcOccupancyPct,
  getCrowdRiskLevel,
  calcRiskScore,
  getRiskRecommendation,
  analyzeCrowdRisk,
  getTopCrowdedZones,
  type CrowdZoneData,
} from "@/lib/utils/crowd";

describe("calcOccupancyPct", () => {
  it("returns 0 for empty zone", () => expect(calcOccupancyPct(0, 100)).toBe(0));
  it("returns 100 for full zone", () => expect(calcOccupancyPct(100, 100)).toBe(100));
  it("returns 0 for zero capacity", () => expect(calcOccupancyPct(50, 0)).toBe(0));
  it("caps at 100 for overflow", () => expect(calcOccupancyPct(150, 100)).toBe(100));
  it("rounds correctly", () => expect(calcOccupancyPct(1, 3)).toBe(33));
  it("handles 50%", () => expect(calcOccupancyPct(50, 100)).toBe(50));
});

describe("getCrowdRiskLevel", () => {
  it("returns low for 0%", () => expect(getCrowdRiskLevel(0)).toBe("low"));
  it("returns low for 39%", () => expect(getCrowdRiskLevel(39)).toBe("low"));
  it("returns medium for 40%", () => expect(getCrowdRiskLevel(40)).toBe("medium"));
  it("returns medium for 69%", () => expect(getCrowdRiskLevel(69)).toBe("medium"));
  it("returns high for 70%", () => expect(getCrowdRiskLevel(70)).toBe("high"));
  it("returns high for 89%", () => expect(getCrowdRiskLevel(89)).toBe("high"));
  it("returns critical for 90%", () => expect(getCrowdRiskLevel(90)).toBe("critical"));
  it("returns critical for 100%", () => expect(getCrowdRiskLevel(100)).toBe("critical"));
});

describe("calcRiskScore", () => {
  it("returns 0 for 0%", () => expect(calcRiskScore(0)).toBe(0));
  it("returns 100 for 100%", () => expect(calcRiskScore(100)).toBe(100));
  it("is non-linear — 50% gives < 50 score", () => expect(calcRiskScore(50)).toBeLessThan(50));
  it("score increases with pct", () => expect(calcRiskScore(80)).toBeGreaterThan(calcRiskScore(50)));
  it("handles negative input gracefully", () => expect(calcRiskScore(-10)).toBe(0));
  it("handles over 100 gracefully", () => expect(calcRiskScore(110)).toBe(100));
});

describe("getRiskRecommendation", () => {
  it("returns positive message for low risk", () => {
    expect(getRiskRecommendation("low", "Main Stage")).toContain("comfortable");
  });
  it("returns crowd message for medium risk", () => {
    expect(getRiskRecommendation("medium", "Food Court")).toContain("moderately busy");
  });
  it("returns warning for high risk", () => {
    expect(getRiskRecommendation("high", "Workshop Hall A")).toContain("crowded");
  });
  it("returns capacity message for critical", () => {
    expect(getRiskRecommendation("critical", "Main Entrance")).toContain("capacity");
  });
  it("includes zone name in message", () => {
    const zone = "VIP Lounge";
    expect(getRiskRecommendation("low", zone)).toContain(zone);
  });
});

describe("analyzeCrowdRisk", () => {
  const zones: CrowdZoneData[] = [
    { zone: "A", occupancy: 900, capacity: 1000 },
    { zone: "B", occupancy: 100, capacity: 1000 },
    { zone: "C", occupancy: 500, capacity: 1000 },
  ];

  it("returns result for each zone", () => {
    expect(analyzeCrowdRisk(zones)).toHaveLength(3);
  });
  it("sorts by risk score descending", () => {
    const results = analyzeCrowdRisk(zones);
    expect(results[0].riskScore).toBeGreaterThanOrEqual(results[1].riskScore);
    expect(results[1].riskScore).toBeGreaterThanOrEqual(results[2].riskScore);
  });
  it("includes occupancyPct for each result", () => {
    const results = analyzeCrowdRisk(zones);
    expect(results.every((r) => r.occupancyPct >= 0 && r.occupancyPct <= 100)).toBe(true);
  });
  it("handles empty input", () => expect(analyzeCrowdRisk([])).toEqual([]));
  it("critical zone appears first", () => {
    const results = analyzeCrowdRisk(zones);
    expect(results[0].riskLevel).toBe("critical");
  });
});

describe("getTopCrowdedZones", () => {
  const manyZones: CrowdZoneData[] = Array.from({ length: 10 }, (_, i) => ({
    zone: `Zone ${i}`,
    occupancy: i * 10,
    capacity: 100,
  }));

  it("returns at most n zones", () => expect(getTopCrowdedZones(manyZones, 3)).toHaveLength(3));
  it("returns top zones by risk score", () => {
    const top = getTopCrowdedZones(manyZones, 3);
    const others = getTopCrowdedZones(manyZones, 10).slice(3);
    expect(top[0].riskScore).toBeGreaterThanOrEqual(others[0]?.riskScore ?? 0);
  });
  it("handles empty zones", () => expect(getTopCrowdedZones([], 5)).toEqual([]));
  it("defaults to 5 zones", () => expect(getTopCrowdedZones(manyZones)).toHaveLength(5));
});
