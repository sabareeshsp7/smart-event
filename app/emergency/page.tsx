"use client";
/**
 * Emergency SOS & Safety Page.
 * Rapid speed dial directory, medical posts, and caller identity integration.
 * Light mode aesthetic with Lucide icons and zero emojis.
 */

import { useState } from "react";
import {
  ShieldAlert,
  PhoneCall,
  HeartPulse,
  Shield,
  Flame,
  Info,
  Search,
  Building2,
  Phone,
  CheckCircle2,
  User,
  Check,
} from "lucide-react";
import { EMERGENCY_CONTACTS, VENUE_NAME } from "@/lib/constants";
import { useUserProfile } from "@/lib/hooks/useUserProfile";

const SAFETY_LOCATIONS = [
  { name: "Primary First Aid Wing", zone: "East Wing near Gate 2", icon: HeartPulse, available: true },
  { name: "Medical Aid Post B", zone: "South Food Concourse", icon: HeartPulse, available: true },
  { name: "Central Security Control", zone: "Main Galleria Turnstiles", icon: Shield, available: true },
  { name: "Attendee Information Hub", zone: "Central Entrance Plaza", icon: Info, available: true },
  { name: "Lost & Found Centre", zone: "Registration Hall A", icon: Search, available: true },
  { name: "Emergency Dispatch Bay", zone: "Gate 1 Logistics Bay", icon: Building2, available: true },
] as const;

const EMERGENCY_STEPS = [
  { step: "1", title: "Stay Calm & Assess", desc: "Evaluate immediate danger before acting. Avoid crowding corridors." },
  { step: "2", title: "Dial 112 Speedline", desc: "Integrated police, medical, and fire emergency dispatch. 24/7 on-site response." },
  { step: "3", title: "Notify Floor Marshals", desc: "Locate venue staff wearing high-visibility orange safety lanyards." },
  { step: "4", title: "Follow Illuminated Exits", desc: "Follow green emergency exit markers. Do not use passenger elevators during an alarm." },
  { step: "5", title: "Proceed to Assembly Zone", desc: "Assemble at the open paved plaza situated outside Main Entrance Gate A." },
] as const;

export default function EmergencyPage() {
  const { profile, saveProfile } = useUserProfile();
  const [editingProfile, setEditingProfile] = useState(false);
  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone);

  const getContactIcon = (number: string) => {
    if (number === "112") return <ShieldAlert size={22} color="var(--color-danger)" />;
    if (number === "108") return <HeartPulse size={22} color="var(--color-danger)" />;
    if (number === "100") return <Shield size={22} color="var(--color-danger)" />;
    if (number === "101") return <Flame size={22} color="var(--color-danger)" />;
    return <PhoneCall size={22} color="var(--color-danger)" />;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveProfile({ name: name.trim(), phone: phone.trim() });
    setEditingProfile(false);
  };

  return (
    <div className="page-wrapper">
      <div className="container" style={{ paddingTop: "2rem", paddingBottom: "4rem" }}>
        {/* Header */}
        <div style={{ marginBottom: "2.5rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              padding: "0.25rem 0.75rem",
              borderRadius: "var(--radius-full)",
              background: "rgba(220, 38, 38, 0.08)",
              color: "var(--color-danger)",
              fontSize: "0.8rem",
              fontWeight: 600,
              marginBottom: "0.75rem",
            }}
          >
            <ShieldAlert size={14} /> Immediate Incident Response
          </div>
          <h1 className="section-title">
            Emergency <span className="gradient-text" style={{ background: "linear-gradient(135deg, #dc2626, #ea580c)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>SOS &amp; Safety</span>
          </h1>
          <p className="section-subtitle" style={{ marginBottom: "0.5rem" }}>
            24/7 rapid dispatch contacts, first aid posts, and evacuation procedures for {VENUE_NAME}
          </p>
        </div>

        {/* Attendee Emergency Identity Banner */}
        <div
          className="glass-card"
          style={{
            padding: "1.25rem 1.5rem",
            marginBottom: "2rem",
            background: "#ffffff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
            border: "1px solid #e2e8f0",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#64748b", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>
              <User size={13} color="#4f46e5" />
              <span>Attendee Caller Identity for Dispatchers</span>
            </div>
            <div style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>
              {profile.name ? profile.name : "Name not registered yet"} · {profile.phone ? profile.phone : "No phone number attached"}
            </div>
          </div>

          <button
            onClick={() => {
              setName(profile.name);
              setPhone(profile.phone);
              setEditingProfile(!editingProfile);
            }}
            className="btn btn-ghost btn-sm"
            style={{ border: "1px solid #cbd5e1" }}
          >
            {editingProfile ? "Close" : "Update My SOS Contact Info"}
          </button>
        </div>

        {editingProfile && (
          <form
            onSubmit={handleSave}
            className="glass-card"
            style={{
              padding: "1.5rem",
              marginBottom: "2rem",
              background: "#f8fafc",
              border: "1px solid #cbd5e1",
              display: "flex",
              flexWrap: "wrap",
              gap: "1rem",
              alignItems: "flex-end",
            }}
          >
            <div style={{ flex: 1, minWidth: "220px" }}>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rahul Verma"
                style={{ width: "100%", padding: "0.55rem 0.85rem", borderRadius: "0.375rem", border: "1px solid #cbd5e1" }}
              />
            </div>

            <div style={{ flex: 1, minWidth: "220px" }}>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                Phone Number
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91-9876543210"
                style={{ width: "100%", padding: "0.55rem 0.85rem", borderRadius: "0.375rem", border: "1px solid #cbd5e1" }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-sm"
              style={{ padding: "0.6rem 1.25rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
            >
              <Check size={15} /> Save Contact Info
            </button>
          </form>
        )}

        {/* SOS Emergency Speed Dial */}
        <section aria-labelledby="sos-heading" style={{ marginBottom: "3.5rem" }}>
          <h2 id="sos-heading" style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <PhoneCall size={18} color="var(--color-danger)" /> Rapid Speed Dial Directory
          </h2>

          <div className="grid-2" style={{ gap: "1.25rem", marginBottom: "2.5rem" }}>
            {EMERGENCY_CONTACTS.map((contact) => (
              <a
                key={contact.number}
                href={`tel:${contact.number}`}
                className="glass-card"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1.25rem",
                  padding: "1.5rem",
                  textDecoration: "none",
                  border: "1px solid rgba(220, 38, 38, 0.2)",
                  background: "#ffffff",
                }}
                aria-label={`Call ${contact.label}: ${contact.number}`}
              >
                <div
                  style={{
                    width: "3.25rem",
                    height: "3.25rem",
                    borderRadius: "var(--radius-md)",
                    background: "rgba(220, 38, 38, 0.08)",
                    border: "1px solid rgba(220, 38, 38, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                  aria-hidden="true"
                >
                  {getContactIcon(contact.number)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: "var(--color-text-secondary)", fontSize: "0.85rem", fontWeight: 500 }}>
                    {contact.label}
                  </div>
                  <div style={{ color: "var(--color-danger)", fontWeight: 800, fontSize: "1.45rem", lineHeight: 1.2 }}>
                    {contact.number}
                  </div>
                </div>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: "rgba(220, 38, 38, 0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--color-danger)",
                  }}
                  aria-hidden="true"
                >
                  <Phone size={16} />
                </div>
              </a>
            ))}
          </div>

          {/* Primary SOS Action Dial Button */}
          <div style={{ textAlign: "center" }}>
            <a
              href="tel:112"
              id="sos-btn"
              className="pulse-danger"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "1.15rem 3.5rem",
                borderRadius: "var(--radius-full)",
                background: "var(--color-danger)",
                color: "#ffffff",
                fontWeight: 800,
                fontSize: "1.35rem",
                textDecoration: "none",
                boxShadow: "0 10px 30px rgba(220, 38, 38, 0.35)",
              }}
              aria-label="Call national emergency helpline 112"
            >
              <ShieldAlert size={26} /> CALL 112 DISPATCH
            </a>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", marginTop: "0.85rem" }}>
              Direct connection to medical, police, and disaster response authorities.
            </p>
          </div>
        </section>

        <div className="grid-2" style={{ gap: "2rem" }}>
          {/* First Aid & Safety Stations */}
          <section aria-labelledby="safety-locations-heading">
            <h2 id="safety-locations-heading" style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <HeartPulse size={18} color="var(--color-danger)" /> On-Site Medical &amp; Safety Posts
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              {SAFETY_LOCATIONS.map((loc) => {
                const Icon = loc.icon;
                return (
                  <div
                    key={loc.name}
                    className="glass-card"
                    style={{
                      padding: "1.15rem 1.25rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      background: "#ffffff",
                    }}
                  >
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "var(--radius-sm)",
                        background: "rgba(220, 38, 38, 0.08)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--color-danger)",
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={18} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--color-text-primary)" }}>
                        {loc.name}
                      </div>
                      <div style={{ color: "var(--color-text-secondary)", fontSize: "0.825rem" }}>
                        {loc.zone}
                      </div>
                    </div>
                    <span className="badge badge-success" style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <CheckCircle2 size={12} /> Staffed
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Incident Protocol Checklist */}
          <section aria-labelledby="protocol-heading">
            <h2 id="protocol-heading" style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Shield size={18} color="var(--color-primary)" /> Evacuation &amp; Safety Protocol
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {EMERGENCY_STEPS.map((s) => (
                <div
                  key={s.step}
                  className="glass-card"
                  style={{
                    padding: "1rem 1.25rem",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "1rem",
                    background: "#ffffff",
                  }}
                >
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      background: "rgba(79, 70, 229, 0.1)",
                      color: "var(--color-primary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      fontSize: "0.85rem",
                      flexShrink: 0,
                    }}
                  >
                    {s.step}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--color-text-primary)", marginBottom: "0.2rem" }}>
                      {s.title}
                    </div>
                    <div style={{ color: "var(--color-text-muted)", fontSize: "0.825rem", lineHeight: 1.5 }}>
                      {s.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
