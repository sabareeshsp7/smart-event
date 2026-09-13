import { describe, it, expect } from "vitest";
import {
  scoreSessionByInterests,
  generateRecommendationReason,
  getLocalRecommendations,
  type SessionForRec,
} from "@/lib/utils/recommendations";

const mockSession = (overrides: Partial<SessionForRec> = {}): SessionForRec => ({
  id: "s1",
  title: "Building AI Apps",
  speaker: "Test Speaker",
  zone: "Main Stage",
  category: "Workshop",
  startTime: "2025-03-15T10:00:00",
  tags: ["AI & ML", "Web Development"],
  registered: 80,
  capacity: 100,
  ...overrides,
});

describe("scoreSessionByInterests", () => {
  it("returns 0 for empty interests", () => {
    expect(scoreSessionByInterests(mockSession(), [])).toBe(0);
  });
  it("returns positive score for matching interest", () => {
    expect(scoreSessionByInterests(mockSession(), ["AI & ML"])).toBeGreaterThan(0);
  });
  it("returns higher score for multiple matches", () => {
    const single = scoreSessionByInterests(mockSession(), ["AI & ML"]);
    const multi = scoreSessionByInterests(mockSession(), ["AI & ML", "Web Development"]);
    expect(multi).toBeGreaterThan(single);
  });
  it("is case insensitive", () => {
    const lower = scoreSessionByInterests(mockSession(), ["ai & ml"]);
    const upper = scoreSessionByInterests(mockSession(), ["AI & ML"]);
    expect(lower).toBe(upper);
  });
  it("caps at 100", () => {
    const many = Array.from({ length: 20 }, () => "AI & ML");
    expect(scoreSessionByInterests(mockSession(), many)).toBeLessThanOrEqual(100);
  });
  it("includes popularity bonus for popular sessions", () => {
    const popular = mockSession({ registered: 99, capacity: 100 });
    const unpopular = mockSession({ registered: 1, capacity: 100 });
    const scoreP = scoreSessionByInterests(popular, ["AI & ML"]);
    const scoreU = scoreSessionByInterests(unpopular, ["AI & ML"]);
    expect(scoreP).toBeGreaterThan(scoreU);
  });
  it("handles zero capacity gracefully", () => {
    const session = mockSession({ capacity: 0 });
    expect(() => scoreSessionByInterests(session, ["AI & ML"])).not.toThrow();
  });
});

describe("generateRecommendationReason", () => {
  it("returns matched tag reason for direct match", () => {
    const reason = generateRecommendationReason(mockSession(), ["AI & ML"]);
    expect(reason).toContain("AI & ML");
  });
  it("returns popularity reason for popular unmatched session", () => {
    const session = mockSession({ tags: ["Blockchain"], registered: 95, capacity: 100 });
    const reason = generateRecommendationReason(session, ["AI & ML"]);
    expect(reason).toContain("popular");
  });
  it("falls back to trends for low match", () => {
    const session = mockSession({ tags: ["Blockchain"], registered: 10, capacity: 100 });
    const reason = generateRecommendationReason(session, ["AI & ML"]);
    expect(typeof reason).toBe("string");
    expect(reason.length).toBeGreaterThan(0);
  });
});

describe("getLocalRecommendations", () => {
  const sessions: SessionForRec[] = [
    mockSession({ id: "s1", tags: ["AI & ML", "Web Development"], registered: 80, capacity: 100 }),
    mockSession({ id: "s2", tags: ["Design"], registered: 50, capacity: 100 }),
    mockSession({ id: "s3", tags: ["AI & ML", "Data Science"], registered: 70, capacity: 100 }),
    mockSession({ id: "s4", tags: ["Startup"], registered: 30, capacity: 100 }),
  ];

  it("returns sessions matching interests", () => {
    const recs = getLocalRecommendations(sessions, ["AI & ML"]);
    expect(recs.length).toBeGreaterThan(0);
    expect(recs.every((r) => r.matchScore > 0)).toBe(true);
  });
  it("respects limit", () => {
    const recs = getLocalRecommendations(sessions, ["AI & ML"], 1);
    expect(recs.length).toBeLessThanOrEqual(1);
  });
  it("sorts by match score descending", () => {
    const recs = getLocalRecommendations(sessions, ["AI & ML", "Data Science"]);
    for (let i = 0; i < recs.length - 1; i++) {
      expect(recs[i].matchScore).toBeGreaterThanOrEqual(recs[i + 1].matchScore);
    }
  });
  it("returns empty for no matches", () => {
    const recs = getLocalRecommendations(sessions, ["Gaming"]);
    expect(recs).toHaveLength(0);
  });
  it("filters out invalid interest tags", () => {
    const recs = getLocalRecommendations(sessions, ["InvalidTag", "AI & ML"]);
    expect(recs.length).toBeGreaterThan(0);
  });
  it("handles empty sessions array", () => {
    expect(getLocalRecommendations([], ["AI & ML"])).toEqual([]);
  });
});
