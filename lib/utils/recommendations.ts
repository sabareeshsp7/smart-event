/**
 * Local recommendation algorithm — deterministic fallback when AI is unavailable.
 * RULE PA-4: Preparedness plans must be personalized (take user inputs like interests).
 * RULE EFF-9: Never make duplicate AI API calls — always check cache first.
 */

import { INTEREST_TAGS } from "../constants";

/** A session record for recommendation purposes. */
export interface SessionForRec {
  id: string;
  title: string;
  speaker: string;
  zone: string;
  category: string;
  startTime: string;
  tags: string[];
  registered: number;
  capacity: number;
}

/** A recommendation result with match score and reason. */
export interface RecommendationResult {
  session: SessionForRec;
  matchScore: number;
  reason: string;
}

/**
 * Scores a session based on how well it matches the user's interest tags.
 * @param session - Session to score
 * @param interests - Array of user interest tags
 * @returns Match score (0–100)
 */
export function scoreSessionByInterests(
  session: SessionForRec,
  interests: string[]
): number {
  if (interests.length === 0) return 0;
  const normalizedInterests = interests.map((i) => i.toLowerCase());
  const normalizedTags = session.tags.map((t) => t.toLowerCase());

  let score = 0;
  for (const interest of normalizedInterests) {
    if (normalizedTags.includes(interest)) {
      score += 30;
    }
    // Partial match bonus
    if (normalizedTags.some((t) => t.includes(interest) || interest.includes(t))) {
      score += 10;
    }
  }

  if (score === 0) return 0;

  // Popularity bonus (up to 10 points) only applied if there's a match
  const fillRate = session.capacity > 0 ? session.registered / session.capacity : 0;
  score += Math.round(fillRate * 10);

  return Math.min(100, score);
}


/**
 * Generates a human-readable reason for a recommendation.
 * @param session - The recommended session
 * @param interests - User interest tags
 * @returns Reason string
 */
export function generateRecommendationReason(
  session: SessionForRec,
  interests: string[]
): string {
  const matchedTags = session.tags.filter((t) =>
    interests.some((i) => i.toLowerCase() === t.toLowerCase())
  );

  if (matchedTags.length > 0) {
    return `Matches your interest in ${matchedTags.join(" & ")}`;
  }

  const fillPct = Math.round((session.registered / session.capacity) * 100);
  if (fillPct > 80) {
    return `Highly popular session — ${fillPct}% capacity filled`;
  }

  return `Recommended based on overall event trends`;
}

/**
 * Returns personalized session recommendations based on user interests.
 * @param sessions - All available sessions
 * @param interests - User's interest tags (from INTEREST_TAGS)
 * @param limit - Max number of recommendations to return
 * @returns Sorted recommendation results
 */
export function getLocalRecommendations(
  sessions: SessionForRec[],
  interests: string[],
  limit: number = 6
): RecommendationResult[] {
  const validInterests = interests.filter((i) =>
    (INTEREST_TAGS as readonly string[]).includes(i)
  );

  return sessions
    .map((session) => ({
      session,
      matchScore: scoreSessionByInterests(session, validInterests),
      reason: generateRecommendationReason(session, validInterests),
    }))
    .filter((r) => r.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);
}
