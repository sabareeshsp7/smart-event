"use client";
/**
 * Attendee Registration & Digital Pass Page.
 * Real-time form submission stored in SQLite DB.
 * Clean light mode aesthetic with Lucide icons and zero emojis.
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  UserCheck,
  QrCode,
  Sparkles,
  ShieldCheck,
  Printer,
  CheckCircle2,
  AlertCircle,
  Users,
  MapPin,
  Calendar,
  Ticket,
} from "lucide-react";
import { INTEREST_TAGS, VENUE_NAME, ROUTES } from "@/lib/constants";
import { useUserProfile } from "@/lib/hooks/useUserProfile";

interface RegisteredBadge {
  id: string;
  name: string;
  email: string;
  company: string;
  role: string;
  badgeType: string;
  interests: string[];
  qrCode: string;
  venue: string;
}

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    role: "",
    badgeType: "General Attendee",
    interests: [] as string[],
    dietaryPref: "Standard",
    accessibilityNeeds: "None",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [badge, setBadge] = useState<RegisteredBadge | null>(null);
  const [totalRegistered, setTotalRegistered] = useState<number>(1420);

  const { profile, saveProfile } = useUserProfile();

  useEffect(() => {
    void fetchStats();
  }, []);

  useEffect(() => {
    if (profile.name || profile.phone || profile.email) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || profile.name,
        phone: prev.phone || profile.phone,
        email: prev.email || profile.email,
      }));
    }
  }, [profile]);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/attendees");
      if (res.ok) {
        const data = (await res.json()) as { total: number };
        setTotalRegistered(data.total);
      }
    } catch {
      /* ignore fallback */
    }
  };

  const handleInterestToggle = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(tag)
        ? prev.interests.filter((t) => t !== tag)
        : [...prev.interests, tag],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/attendees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Registration could not be completed.");
      }

      setBadge(json.attendee);
      setTotalRegistered((prev) => prev + 1);
      saveProfile({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        company: formData.company,
        role: formData.role,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to register.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: "1000px" }}>
        {/* Ticketmaster Live Hub Prompt */}
        <div
          className="glass-card"
          style={{
            padding: "1.25rem 1.5rem",
            marginBottom: "2.5rem",
            background: "linear-gradient(135deg, rgba(79, 70, 229, 0.06), rgba(8, 145, 178, 0.04))",
            border: "1px solid rgba(79, 70, 229, 0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem",
            borderRadius: "0.75rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "0.5rem",
                background: "#4f46e5",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Ticket size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "1rem", color: "#0f172a" }}>
                Looking for Real Live Events &amp; Concerts?
              </div>
              <div style={{ fontSize: "0.85rem", color: "#475569" }}>
                Browse 10,000+ real-time events powered by the Ticketmaster Discovery API with 1-click digital pass claiming.
              </div>
            </div>
          </div>
          <Link
            href={ROUTES.EVENTS}
            className="btn btn-primary btn-sm"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", whiteSpace: "nowrap" }}
          >
            <Sparkles size={14} />
            <span>Explore Ticketmaster Live Hub</span>
          </Link>
        </div>

        {/* Header Header */}
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.375rem 1rem",
              borderRadius: "var(--radius-full)",
              background: "rgba(79, 70, 229, 0.08)",
              border: "1px solid rgba(79, 70, 229, 0.2)",
              color: "var(--color-primary)",
              fontSize: "0.85rem",
              fontWeight: 600,
              marginBottom: "1rem",
            }}
          >
            <UserCheck size={16} /> Official Attendee Accreditation
          </div>
          <h1 className="section-title">
            Event Registration &amp; <span className="gradient-text">Digital Badge</span>
          </h1>
          <p className="section-subtitle" style={{ maxWidth: "650px", margin: "0 auto" }}>
            Register your credentials for instant check-in, personalized session matching, and RFID access at {VENUE_NAME}.
          </p>

          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", marginTop: "1rem" }} className="badge badge-primary">
            <Users size={14} /> <strong>{totalRegistered.toLocaleString()}</strong> Registered Attendees Confirmed
          </div>
        </div>

        {badge ? (
          /* Digital Badge Success Card */
          <div className="fade-in-up" style={{ maxWidth: "550px", margin: "0 auto" }}>
            <div
              className="glass-card"
              style={{
                background: "#ffffff",
                borderRadius: "var(--radius-xl)",
                border: "1px solid var(--color-border)",
                overflow: "hidden",
                boxShadow: "var(--shadow-lg)",
              }}
            >
              {/* Badge Lanyard Hole & Header */}
              <div
                style={{
                  background: "var(--gradient-primary)",
                  padding: "1.75rem",
                  color: "#ffffff",
                  textAlign: "center",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "8px",
                    borderRadius: "4px",
                    background: "rgba(255, 255, 255, 0.4)",
                    margin: "0 auto 1rem",
                  }}
                />
                <h3 style={{ fontSize: "1.35rem", fontWeight: 800, letterSpacing: "-0.01em", color: "#ffffff" }}>
                  SMART EVENT 2025
                </h3>
                <p style={{ fontSize: "0.8rem", opacity: 0.9, marginTop: "0.25rem" }}>
                  {badge.venue}
                </p>
                <span
                  style={{
                    display: "inline-block",
                    marginTop: "0.75rem",
                    padding: "0.25rem 0.85rem",
                    borderRadius: "var(--radius-full)",
                    background: "rgba(255, 255, 255, 0.25)",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {badge.badgeType}
                </span>
              </div>

              {/* Badge Body */}
              <div style={{ padding: "2rem", textAlign: "center" }}>
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    background: "rgba(79, 70, 229, 0.1)",
                    border: "2px solid rgba(79, 70, 229, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 1.25rem",
                    color: "var(--color-primary)",
                    fontWeight: 800,
                    fontSize: "1.75rem",
                  }}
                >
                  {badge.name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")}
                </div>

                <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.25rem" }}>
                  {badge.name}
                </h2>
                <p style={{ color: "var(--color-text-secondary)", fontSize: "0.95rem", fontWeight: 500 }}>
                  {badge.role}
                </p>
                <p style={{ color: "var(--color-primary)", fontSize: "0.9rem", fontWeight: 600, marginTop: "0.15rem" }}>
                  {badge.company}
                </p>

                {/* Simulated QR Code */}
                <div
                  style={{
                    marginTop: "1.75rem",
                    padding: "1.25rem",
                    background: "var(--color-bg-3)",
                    borderRadius: "var(--radius-lg)",
                    border: "1px dashed var(--color-border-hover)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                >
                  <QrCode size={96} color="var(--color-text-primary)" strokeWidth={1.5} />
                  <div style={{ fontFamily: "monospace", fontSize: "0.85rem", fontWeight: 700, color: "var(--color-text-secondary)" }}>
                    {badge.qrCode}
                  </div>
                  <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                    Scan at Entrance Gates, Kiosks &amp; Keynote Access Points
                  </span>
                </div>

                {/* Badge Meta Details */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                    marginTop: "1.5rem",
                    textAlign: "left",
                    fontSize: "0.85rem",
                    padding: "1rem",
                    background: "#f8fafc",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <div>
                    <span style={{ color: "var(--color-text-muted)", display: "block" }}>Delegate ID</span>
                    <strong style={{ fontFamily: "monospace" }}>{badge.id.substring(0, 12)}</strong>
                  </div>
                  <div>
                    <span style={{ color: "var(--color-text-muted)", display: "block" }}>Access Tier</span>
                    <strong>{badge.badgeType}</strong>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
                  <button
                    onClick={() => window.print()}
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                  >
                    <Printer size={16} /> Print Badge Pass
                  </button>
                  <button
                    onClick={() => setBadge(null)}
                    className="btn btn-ghost"
                    style={{ flex: 1 }}
                  >
                    Register Another
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Registration Form Grid */
          <div className="grid-3" style={{ gap: "2rem" }}>
            {/* Left Column: Form */}
            <div style={{ gridColumn: "span 2" }}>
              <form
                onSubmit={handleSubmit}
                className="glass-card"
                style={{ padding: "2.25rem", background: "#ffffff" }}
              >
                <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <ShieldCheck size={20} color="var(--color-primary)" /> Attendee Information
                </h2>

                {error && (
                  <div className="alert-banner" style={{ background: "rgba(220, 38, 38, 0.08)", borderColor: "rgba(220, 38, 38, 0.25)", color: "#b91c1c", marginBottom: "1.5rem" }}>
                    <AlertCircle size={18} />
                    <span style={{ fontSize: "0.875rem" }}>{error}</span>
                  </div>
                )}

                <div className="grid-2" style={{ gap: "1.25rem", marginBottom: "1.25rem" }}>
                  <div>
                    <label className="input-label" htmlFor="reg-name">
                      Full Name *
                    </label>
                    <input
                      id="reg-name"
                      type="text"
                      className="input"
                      placeholder="e.g. Dr. Priya Sharma"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="input-label" htmlFor="reg-email">
                      Official Email *
                    </label>
                    <input
                      id="reg-email"
                      type="email"
                      className="input"
                      placeholder="name@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid-2" style={{ gap: "1.25rem", marginBottom: "1.25rem" }}>
                  <div>
                    <label className="input-label" htmlFor="reg-company">
                      Organization / Company
                    </label>
                    <input
                      id="reg-company"
                      type="text"
                      className="input"
                      placeholder="e.g. TechCorp Labs"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="input-label" htmlFor="reg-role">
                      Professional Role / Title
                    </label>
                    <input
                      id="reg-role"
                      type="text"
                      className="input"
                      placeholder="e.g. Staff AI Engineer"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid-2" style={{ gap: "1.25rem", marginBottom: "1.5rem" }}>
                  <div>
                    <label className="input-label" htmlFor="reg-phone">
                      Mobile Number
                    </label>
                    <input
                      id="reg-phone"
                      type="tel"
                      className="input"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="input-label" htmlFor="reg-badge">
                      Badge Pass Tier
                    </label>
                    <select
                      id="reg-badge"
                      className="input"
                      value={formData.badgeType}
                      onChange={(e) => setFormData({ ...formData, badgeType: e.target.value })}
                    >
                      <option value="General Attendee">General Attendee Pass</option>
                      <option value="Delegate">Full Conference Delegate</option>
                      <option value="VIP / Speaker">VIP &amp; Speaker Pass</option>
                      <option value="Student / Researcher">Academic &amp; Student Pass</option>
                      <option value="Media / Press">Press &amp; Media Pass</option>
                    </select>
                  </div>
                </div>

                {/* Track Interests */}
                <div style={{ marginBottom: "1.5rem" }}>
                  <label className="input-label">Track Interests (For AI Recommendations)</label>
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
                    {INTEREST_TAGS.map((tag) => {
                      const selected = formData.interests.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleInterestToggle(tag)}
                          style={{
                            padding: "0.35rem 0.85rem",
                            borderRadius: "var(--radius-full)",
                            fontSize: "0.8rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            border: selected ? "1px solid var(--color-primary)" : "1px solid var(--color-border)",
                            background: selected ? "rgba(79, 70, 229, 0.1)" : "#ffffff",
                            color: selected ? "var(--color-primary)" : "var(--color-text-secondary)",
                            transition: "all 0.15s ease",
                          }}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid-2" style={{ gap: "1.25rem", marginBottom: "2rem" }}>
                  <div>
                    <label className="input-label" htmlFor="reg-diet">
                      Dietary Preference
                    </label>
                    <select
                      id="reg-diet"
                      className="input"
                      value={formData.dietaryPref}
                      onChange={(e) => setFormData({ ...formData, dietaryPref: e.target.value })}
                    >
                      <option value="Standard">Standard</option>
                      <option value="Vegetarian">Vegetarian</option>
                      <option value="Vegan">Vegan</option>
                      <option value="Gluten-Free">Gluten-Free</option>
                      <option value="Jain Meal">Jain Meal</option>
                    </select>
                  </div>

                  <div>
                    <label className="input-label" htmlFor="reg-a11y">
                      Accessibility Needs
                    </label>
                    <select
                      id="reg-a11y"
                      className="input"
                      value={formData.accessibilityNeeds}
                      onChange={(e) => setFormData({ ...formData, accessibilityNeeds: e.target.value })}
                    >
                      <option value="None">None</option>
                      <option value="Wheelchair Access">Wheelchair Accessible Routes</option>
                      <option value="Hearing Assistance">Hearing Loop / Assistive Audio</option>
                      <option value="Braille / Vision Support">Vision / Screen Reader Support</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary btn-lg"
                  style={{ width: "100%" }}
                >
                  {loading ? (
                    <div className="spinner" />
                  ) : (
                    <>
                      <CheckCircle2 size={18} /> Confirm Registration &amp; Generate Pass
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Right Column: Venue & Accreditation Info */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div className="glass-card" style={{ padding: "1.75rem", background: "#ffffff" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <MapPin size={18} color="var(--color-primary)" /> Venue Location
                </h3>
                <p style={{ fontWeight: 600, fontSize: "0.95rem", color: "var(--color-text-primary)", marginBottom: "0.25rem" }}>
                  {VENUE_NAME}
                </p>
                <p style={{ color: "var(--color-text-secondary)", fontSize: "0.85rem", lineHeight: 1.6, marginBottom: "1rem" }}>
                  10th Mile, Tumkur Road, Madavara Post, Bengaluru, Karnataka 562123
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                  <Calendar size={16} /> March 15–16, 2025 • 09:00 AM IST
                </div>
              </div>

              <div className="glass-card" style={{ padding: "1.75rem", background: "#ffffff" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Sparkles size={18} color="var(--color-secondary)" /> Badge Benefits
                </h3>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.65rem", fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>
                  <li style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
                    <CheckCircle2 size={16} color="var(--color-success)" style={{ flexShrink: 0, marginTop: "2px" }} />
                    Fast-track NFC/QR entry through all 4 hall turnstiles.
                  </li>
                  <li style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
                    <CheckCircle2 size={16} color="var(--color-success)" style={{ flexShrink: 0, marginTop: "2px" }} />
                    AI personalized session recommendations based on interests.
                  </li>
                  <li style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
                    <CheckCircle2 size={16} color="var(--color-success)" style={{ flexShrink: 0, marginTop: "2px" }} />
                    Real-time crowd occupancy notifications for your registered tracks.
                  </li>
                  <li style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
                    <CheckCircle2 size={16} color="var(--color-success)" style={{ flexShrink: 0, marginTop: "2px" }} />
                    Instant access to live emergency alerts and assistance dispatch.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
