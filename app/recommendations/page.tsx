"use client";
/**
 * AI Recommendations page — personalized session suggestions.
 */

import { useState } from "react";
import { INTEREST_TAGS, API_ROUTES, EMERGENCY_CONTACTS } from "@/lib/constants";

interface RecommendationSession {
  id: string;
  title: string;
  speaker: string;
  zone: string;
  category: string;
  startTime: string;
}

interface Recommendation {
  session: RecommendationSession;
  matchScore: number;
  reason: string;
}

interface RecommendationsResponse {
  recommendations: Recommendation[];
  aiInsight: string | null;
  poweredByAI: boolean;
}

/** Personalized AI recommendations page. */
export default function RecommendationsPage() {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const toggleInterest = (tag: string) => {
    setSelectedInterests((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const getRecommendations = async () => {
    if (selectedInterests.length === 0) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(API_ROUTES.RECOMMENDATIONS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interests: selectedInterests, limit: 6 }),
      });
      if (!res.ok) throw new Error("Failed to get recommendations");
      const data = await res.json() as RecommendationsResponse;
      setRecommendations(data.recommendations);
      setAiInsight(data.aiInsight);
      setHasSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load recommendations");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
    } catch {
      return iso;
    }
  };

  return (
    <div className="page-wrapper">
      <div className="container" style={{ paddingTop: "2rem" }}>
        <h1 className="section-title">
          🤖 AI <span className="gradient-text">Recommendations</span>
        </h1>
        <p className="section-subtitle">
          Tell us your interests and get personalized session suggestions
        </p>

        {/* Interest selector */}
        <section aria-labelledby="interests-heading" style={{ marginBottom: "2rem" }}>
          <h2 id="interests-heading" style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>
            Select your interests:
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1.5rem" }} role="group" aria-label="Interest tags">
            {INTEREST_TAGS.map((tag) => {
              const selected = selectedInterests.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleInterest(tag)}
                  className={`btn btn-sm ${selected ? "btn-primary" : "btn-ghost"}`}
                  aria-pressed={selected}
                  aria-label={`${selected ? "Remove" : "Add"} interest: ${tag}`}
                >
                  {tag}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => void getRecommendations()}
            disabled={loading || selectedInterests.length === 0}
            className="btn btn-primary"
            id="get-recommendations-btn"
            aria-label="Get AI-powered recommendations"
          >
            {loading ? (
              <>
                <div className="spinner" role="status" aria-label="Loading recommendations" />
                Getting recommendations...
              </>
            ) : (
              "✨ Get AI Recommendations"
            )}
          </button>
          {selectedInterests.length === 0 && (
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.8rem", marginTop: "0.5rem" }}>
              Select at least one interest above
            </p>
          )}
        </section>

        {error && (
          <div className="alert-banner" style={{ background: "rgba(239,68,68,0.1)", borderColor: "rgba(239,68,68,0.3)", marginBottom: "1.5rem" }} role="alert">
            <span aria-hidden="true">❌</span>
            <span>{error}</span>
          </div>
        )}

        {/* AI Insight */}
        {aiInsight && (
          <div
            style={{
              padding: "1.25rem",
              borderRadius: "var(--radius-md)",
              background: "linear-gradient(135deg,rgba(139,92,246,0.1),rgba(6,182,212,0.05))",
              border: "1px solid rgba(139,92,246,0.3)",
              marginBottom: "2rem",
            }}
            aria-live="polite"
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "1.1rem" }} aria-hidden="true">⚡</span>
              <strong style={{ fontSize: "0.85rem", color: "var(--color-primary-light)" }}>Azure OpenAI Insight</strong>
            </div>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9rem", lineHeight: 1.7 }}>{aiInsight}</p>
          </div>
        )}

        {/* Recommendations */}
        {hasSearched && (
          <section aria-labelledby="recs-heading">
            <h2 id="recs-heading" style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1.25rem" }}>
              {recommendations.length > 0
                ? `🎯 ${recommendations.length} Sessions Recommended for You`
                : "No matches found — try different interests"}
            </h2>

            <div className="grid-3">
              {recommendations.map(({ session, matchScore, reason }) => (
                <article key={session.id} className="glass-card" style={{ padding: "1.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                    <span className="badge badge-primary">{session.category}</span>
                    <span
                      style={{
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        color: matchScore > 70 ? "#34d399" : matchScore > 40 ? "#fbbf24" : "var(--color-text-muted)",
                      }}
                      aria-label={`Match score: ${matchScore}%`}
                    >
                      {matchScore}% match
                    </span>
                  </div>
                  <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.4rem" }}>{session.title}</h3>
                  <p style={{ color: "var(--color-primary-light)", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                    👤 {session.speaker}
                  </p>
                  <p style={{ color: "var(--color-text-muted)", fontSize: "0.8rem", marginBottom: "0.75rem", fontStyle: "italic" }}>
                    {reason}
                  </p>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                    <span>📍 {session.zone}</span>
                    <span>🕐 {formatTime(session.startTime)}</span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Emergency strip */}
        <div
          style={{ marginTop: "3rem", padding: "1rem 1.5rem", borderRadius: "var(--radius-md)", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}
          role="complementary"
          aria-label="Emergency contacts"
        >
          <span style={{ color: "#f87171", fontWeight: 700, fontSize: "0.85rem" }}>🚨 Emergency:</span>
          {EMERGENCY_CONTACTS.slice(0, 3).map((c) => (
            <a key={c.number} href={`tel:${c.number}`} style={{ color: "#f87171", fontWeight: 700, fontSize: "0.875rem", textDecoration: "none" }}>
              {c.icon} {c.number}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
