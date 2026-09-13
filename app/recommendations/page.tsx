"use client";
/**
 * AI Recommendations page — personalized session suggestions powered by AI.
 * Light mode design with Lucide icons and zero emojis.
 */

import { useState } from "react";
import { INTEREST_TAGS, API_ROUTES, EMERGENCY_CONTACTS, VENUE_NAME } from "@/lib/constants";
import { Sparkles, Cpu, Check, MapPin, Clock, User, PhoneCall, AlertCircle, Bookmark, Compass } from "lucide-react";

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
      const data = (await res.json()) as RecommendationsResponse;
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
    <div className="page-wrapper" style={{ background: "var(--color-bg)", minHeight: "100vh" }}>
      <div className="container" style={{ paddingTop: "2.5rem", paddingBottom: "4rem" }}>
        
        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.35rem 0.85rem", borderRadius: "9999px", background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", color: "#4f46e5", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.75rem" }}>
            <Cpu size={15} />
            <span>AI Neural Matching Engine · {VENUE_NAME}</span>
          </div>
          <h1 className="section-title" style={{ fontSize: "2.2rem", fontWeight: 800, color: "var(--color-text)", letterSpacing: "-0.02em", marginBottom: "0.5rem" }}>
            Personalized <span className="gradient-text">Recommendations</span>
          </h1>
          <p className="section-subtitle" style={{ color: "var(--color-text-secondary)", fontSize: "1rem" }}>
            Select your professional focus areas and let our AI engine curate your ideal conference schedule
          </p>
        </div>

        {/* Interest Selector Card */}
        <div className="glass-card" style={{ padding: "1.75rem", marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--color-text)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Compass size={18} color="#4f46e5" />
            Select Your Interests & Tech Stack
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem", marginBottom: "1.5rem" }} role="group" aria-label="Interest tags">
            {INTEREST_TAGS.map((tag) => {
              const selected = selectedInterests.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleInterest(tag)}
                  className={`btn btn-sm ${selected ? "btn-primary" : "btn-ghost"}`}
                  aria-pressed={selected}
                  aria-label={`${selected ? "Remove" : "Add"} interest: ${tag}`}
                  style={{
                    borderRadius: "9999px",
                    padding: "0.45rem 1rem",
                    fontSize: "0.85rem",
                    transition: "all 0.15s ease",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem"
                  }}
                >
                  {selected && <Check size={14} />}
                  {tag}
                </button>
              );
            })}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            <button
              onClick={() => void getRecommendations()}
              disabled={loading || selectedInterests.length === 0}
              className="btn btn-primary"
              id="get-recommendations-btn"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.75rem 1.5rem",
                fontWeight: 600,
                borderRadius: "0.5rem"
              }}
            >
              {loading ? (
                <>
                  <div className="spinner" role="status" aria-label="Loading recommendations" />
                  Generating Schedule Matches...
                </>
              ) : (
                <>
                  <Sparkles size={17} />
                  Generate AI Recommendations
                </>
              )}
            </button>
            {selectedInterests.length === 0 && (
              <span style={{ color: "var(--color-text-muted)", fontSize: "0.85rem" }}>
                Select one or more topics above to generate matching sessions
              </span>
            )}
          </div>
        </div>

        {/* Error notice */}
        {error && (
          <div className="alert-banner" style={{ background: "#fef2f2", borderColor: "#fecaca", marginBottom: "1.5rem", color: "#b91c1c", display: "flex", alignItems: "center", gap: "0.75rem" }} role="alert">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* AI Insight Box */}
        {aiInsight && (
          <div
            style={{
              padding: "1.5rem",
              borderRadius: "0.75rem",
              background: "linear-gradient(135deg, rgba(99,102,241,0.06), rgba(6,182,212,0.04))",
              border: "1px solid rgba(99,102,241,0.2)",
              marginBottom: "2rem",
            }}
            aria-live="polite"
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <Sparkles size={18} color="#4f46e5" />
              <strong style={{ fontSize: "0.9rem", color: "#4f46e5", fontWeight: 700 }}>Azure OpenAI Schedule Intelligence</strong>
            </div>
            <p style={{ color: "var(--color-text)", fontSize: "0.95rem", lineHeight: 1.6, margin: 0 }}>
              {aiInsight}
            </p>
          </div>
        )}

        {/* Recommendations Grid */}
        {hasSearched && (
          <section aria-labelledby="recs-heading">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h2 id="recs-heading" style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--color-text)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Bookmark size={20} color="#4f46e5" />
                {recommendations.length > 0
                  ? `${recommendations.length} Recommended Sessions For You`
                  : "No exact matches found — try adjusting your interests"}
              </h2>
            </div>

            <div className="grid-3">
              {recommendations.map(({ session, matchScore, reason }) => (
                <article key={session.id} className="glass-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                      <span className="badge badge-primary">{session.category}</span>
                      <span
                        style={{
                          fontSize: "0.8rem",
                          fontWeight: 700,
                          color: matchScore > 70 ? "#059669" : matchScore > 40 ? "#d97706" : "var(--color-text-muted)",
                          background: matchScore > 70 ? "#ecfdf5" : matchScore > 40 ? "#fffbeb" : "#f1f5f9",
                          padding: "0.2rem 0.6rem",
                          borderRadius: "9999px",
                          border: `1px solid ${matchScore > 70 ? "#a7f3d0" : matchScore > 40 ? "#fde68a" : "#e2e8f0"}`,
                        }}
                      >
                        {matchScore}% Match
                      </span>
                    </div>

                    <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--color-text)", marginBottom: "0.4rem", lineHeight: 1.4 }}>
                      {session.title}
                    </h3>
                    
                    <p style={{ color: "var(--color-text-secondary)", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.6rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                      <User size={14} color="#64748b" />
                      {session.speaker}
                    </p>

                    <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", marginBottom: "1rem", lineHeight: 1.5, background: "#f8fafc", padding: "0.6rem 0.8rem", borderRadius: "0.375rem", borderLeft: "3px solid #6366f1" }}>
                      {reason}
                    </p>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--color-text-secondary)", borderTop: "1px solid var(--color-border)", paddingTop: "0.75rem" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                      <MapPin size={14} color="#6366f1" />
                      {session.zone}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                      <Clock size={14} color="#0891b2" />
                      {formatTime(session.startTime)}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Emergency Contact Bar */}
        <div
          style={{
            marginTop: "3rem",
            padding: "1rem 1.5rem",
            borderRadius: "0.5rem",
            background: "#fff1f2",
            border: "1px solid #fecdd3",
            display: "flex",
            gap: "1.5rem",
            flexWrap: "wrap",
            alignItems: "center"
          }}
          role="complementary"
          aria-label="Emergency contacts"
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#e11d48", fontWeight: 700, fontSize: "0.85rem" }}>
            <PhoneCall size={16} />
            <span>Emergency Rapid Contacts:</span>
          </div>
          {EMERGENCY_CONTACTS.slice(0, 3).map((c) => (
            <a key={c.number} href={`tel:${c.number}`} style={{ color: "#be123c", fontWeight: 600, fontSize: "0.85rem", textDecoration: "none" }}>
              {c.label}: {c.number}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
