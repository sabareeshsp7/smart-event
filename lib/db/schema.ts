/**
 * Database schema definitions and seed data.
 * Creates all tables and populates with realistic demo data on first run.
 */

import type Database from "better-sqlite3";
import { VENUE_ZONES, SESSION_CATEGORIES } from "../constants";

/** Creates all database tables if they don't already exist. */
function createTables(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      speaker TEXT NOT NULL,
      speaker_bio TEXT DEFAULT '',
      zone TEXT NOT NULL,
      category TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      description TEXT NOT NULL,
      tags TEXT NOT NULL DEFAULT '[]',
      capacity INTEGER NOT NULL DEFAULT 100,
      registered INTEGER NOT NULL DEFAULT 0,
      is_featured INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS alerts (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      severity TEXT NOT NULL CHECK(severity IN ('low','medium','high','critical')),
      zone TEXT NOT NULL DEFAULT 'All Areas',
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS crowd_zones (
      id TEXT PRIMARY KEY,
      zone TEXT NOT NULL UNIQUE,
      occupancy INTEGER NOT NULL DEFAULT 0,
      capacity INTEGER NOT NULL DEFAULT 500,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS recommendations_cache (
      id TEXT PRIMARY KEY,
      tags_key TEXT NOT NULL UNIQUE,
      result TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS attendees (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT,
      company TEXT,
      role TEXT,
      badge_type TEXT NOT NULL DEFAULT 'General Attendee',
      interests TEXT NOT NULL DEFAULT '[]',
      dietary_pref TEXT DEFAULT 'Standard',
      accessibility_needs TEXT DEFAULT 'None',
      qr_code TEXT,
      registered_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

const SEED_SESSIONS = [
  {
    id: "biec-prog-1",
    title: "Opening Plenary: India AI & Cloud Compute Summit 2026",
    speaker: "Dr. Priya Sharma & Special Delegates",
    bio: "Chief AI Scientist & Government Steering Committee",
    zone: "Hall 1 — Grand Alpha Stage",
    category: "Keynote",
    date: "2026-09-18",
    start: "09:00",
    end: "10:15",
    desc: "Official opening plenary inaugurating the India AI & Cloud Compute Summit at BIEC, featuring national technology strategy and compute architecture.",
    tags: ["AI & ML", "Cloud", "Leadership"],
    capacity: 2000,
    registered: 1850,
    featured: 1,
  },
  {
    id: "biec-prog-2",
    title: "Next-Gen Autonomous Robotics & Drone Systems Showcase",
    speaker: "Robotics Research Group & Industry Partners",
    bio: "Autonomous Systems Laboratory & Industry Consortium",
    zone: "Hall 3 — Workshop Hall A",
    category: "Workshop",
    date: "2026-09-18",
    start: "10:30",
    end: "11:30",
    desc: "Live industrial robotics and drone demonstration with hardware-in-the-loop and edge AI telemetry at the Robotics Pavilion.",
    tags: ["AI & ML", "Startup"],
    capacity: 800,
    registered: 760,
    featured: 0,
  },
  {
    id: "biec-prog-3",
    title: "Building Enterprise LLMs & High-Throughput Inference",
    speaker: "Rahul Mehta (Staff AI Engineer)",
    bio: "Staff AI Engineer at Scale AI",
    zone: "Hall 2 — Beta Auditorium",
    category: "Workshop",
    date: "2026-09-18",
    start: "11:45",
    end: "13:00",
    desc: "End-to-end technical guide to deploying production-grade large language models with KV-cache optimization, tensor parallelism, and low-latency inference.",
    tags: ["AI & ML", "Cloud"],
    capacity: 400,
    registered: 385,
    featured: 1,
  },
  {
    id: "biec-prog-4",
    title: "Digital Public Infrastructure (DPI) & Next-Gen Payments",
    speaker: "National FinTech Council Panelists",
    bio: "Architects of UPI, ONDC, and Open Financial Exchange",
    zone: "Hall 4 — Workshop Hall B",
    category: "Panel",
    date: "2026-09-18",
    start: "14:00",
    end: "15:15",
    desc: "High-level panel discussing the global adoption of India's DPI stack, real-time cross-border settlements, and CBDC integration.",
    tags: ["Startup", "Leadership"],
    capacity: 350,
    registered: 330,
    featured: 0,
  },
  {
    id: "biec-prog-5",
    title: "Zero Trust Cloud Defense & Infrastructure Resilience",
    speaker: "Asha Nair (Chief Security Officer)",
    bio: "Chief Security Officer at PhonePe",
    zone: "Hall 4 — Workshop Hall B",
    category: "Workshop",
    date: "2026-09-18",
    start: "15:30",
    end: "16:45",
    desc: "Hands-on implementation of Zero Trust Architecture, identity-aware proxies, and automated threat response across multi-cloud environments.",
    tags: ["Cybersecurity", "Cloud"],
    capacity: 300,
    registered: 285,
    featured: 0,
  },
  {
    id: "biec-prog-6",
    title: "Clean Energy Grid & Electric Vehicle Mobility Conclave",
    speaker: "EV Consortium Leaders",
    bio: "Pioneers in Battery Technology and Renewable Grid Integration",
    zone: "Hall 2 — Beta Auditorium",
    category: "Panel",
    date: "2026-09-19",
    start: "09:30",
    end: "10:45",
    desc: "Strategic conclave analyzing smart EV charging grids, battery swapping networks, and sustainable renewable energy storage architectures.",
    tags: ["Design", "Startup"],
    capacity: 600,
    registered: 540,
    featured: 0,
  },
  {
    id: "biec-prog-7",
    title: "Quantum Computing & Quantum Key Distribution (QKD) Forum",
    speaker: "Quantum Physics Lab Researchers",
    bio: "Principal Scientists from National Quantum Mission",
    zone: "Hall 3 — Workshop Hall A",
    category: "Keynote",
    date: "2026-09-19",
    start: "11:15",
    end: "12:30",
    desc: "In-depth briefing on photonic qubits, topological quantum states, and post-quantum cryptographic standards protecting digital infrastructure.",
    tags: ["Data Science", "AI & ML"],
    capacity: 250,
    registered: 240,
    featured: 1,
  },
  {
    id: "biec-prog-8",
    title: "Indie Founders & Venture Capital Demo Day",
    speaker: "Top 12 Early-Stage Founders & VCs",
    bio: "Investors from Peak XV, Accel, Lightspeed & High-Growth Founders",
    zone: "Innovation Hub — Central Atrium",
    category: "Lightning Talk",
    date: "2026-09-19",
    start: "14:00",
    end: "15:45",
    desc: "Rapid-fire 5-minute pitches from top 12 AI and deep-tech startups followed by live investor Q&A and term sheet negotiations.",
    tags: ["Startup", "Leadership"],
    capacity: 450,
    registered: 440,
    featured: 1,
  },
  {
    id: "biec-prog-9",
    title: "Closing Keynote: Digital Transformation of Bharat",
    speaker: "Nandan Nilekani & Distinguished Tech Leaders",
    bio: "Co-founder of Infosys & National Digital Infrastructure Architect",
    zone: "Hall 1 — Grand Alpha Stage",
    category: "Keynote",
    date: "2026-09-19",
    start: "16:30",
    end: "17:45",
    desc: "Grand closing keynote addressing the monumental societal impact of technology reaching India's next billion users.",
    tags: ["Leadership", "Startup"],
    capacity: 2000,
    registered: 1980,
    featured: 1,
  },
  {
    id: "biec-prog-10",
    title: "BIEC Networking Gala & Grand Cultural Evening",
    speaker: "All Summit Delegates & Performers",
    bio: "Hosted by EventIQ & BIEC Organizing Committee",
    zone: "Networking Plaza & Lounge",
    category: "Networking",
    date: "2026-09-19",
    start: "18:30",
    end: "21:00",
    desc: "Executive gala dinner, high-level networking mixer, and traditional cultural performance celebrating summit achievements.",
    tags: ["Leadership"],
    capacity: 1500,
    registered: 1450,
    featured: 1,
  },
];

const SEED_ALERTS = [
  { id: "a1", title: "Opening Plenary Starting", message: "India AI & Cloud Compute Summit 2026 Opening Plenary starts in 10 minutes at Hall 1 — Grand Alpha Stage.", severity: "low", zone: "Hall 1 — Grand Alpha Stage" },
  { id: "a2", title: "South Food Concourse Open", message: "South Food Concourse is now open. South Indian thali and organic refreshments available.", severity: "low", zone: "South Food Concourse" },
  { id: "a3", title: "Workshop Hall A: Near Capacity", message: "Hall 3 — Workshop Hall A is at 95% capacity for the Autonomous Robotics showcase. Overflow in Hall 4.", severity: "medium", zone: "Hall 3 — Workshop Hall A" },
  { id: "a4", title: "Schedule Notice: FinTech Panel", message: "Digital Public Infrastructure Panel begins promptly at 14:00 in Hall 4 — Workshop Hall B.", severity: "medium", zone: "Hall 4 — Workshop Hall B" },
  { id: "a5", title: "Campus Safety Telemetry Active", message: "BIEC campus safety telemetry and automated hall dispatch active across all pavilions.", severity: "high", zone: "All Areas" },
];

/** Seeds the database with demo data if tables are empty. */
export function seedDatabase(db: Database.Database): void {
  createTables(db);

  const sessionCount = (db.prepare("SELECT COUNT(*) as c FROM sessions").get() as { c: number }).c;
  const hasLegacy = Boolean(
    db.prepare("SELECT 1 FROM sessions WHERE id NOT LIKE 'biec-prog-%' OR start_time NOT LIKE '2026-09%' LIMIT 1").get()
  );

  if (sessionCount > 0 && !hasLegacy && sessionCount === SEED_SESSIONS.length) {
    return; // Already up to date with verified 2026 Summit data
  }

  // Delete legacy/mismatched sessions to reseed latest 2026 data
  db.exec("DELETE FROM sessions; DELETE FROM alerts; DELETE FROM crowd_zones;");

  const insertSession = db.prepare(`
    INSERT INTO sessions (id, title, speaker, speaker_bio, zone, category, start_time, end_time, description, tags, capacity, registered, is_featured)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertAlert = db.prepare(`
    INSERT INTO alerts (id, title, message, severity, zone) VALUES (?, ?, ?, ?, ?)
  `);

  const insertCrowd = db.prepare(`
    INSERT OR IGNORE INTO crowd_zones (id, zone, occupancy, capacity) VALUES (?, ?, ?, ?)
  `);

  const seedAll = db.transaction(() => {
    for (const s of SEED_SESSIONS) {
      insertSession.run(
        s.id, s.title, s.speaker, s.bio, s.zone, s.category,
        `${s.date}T${s.start}:00`, `${s.date}T${s.end}:00`,
        s.desc, JSON.stringify(s.tags), s.capacity, s.registered, s.featured
      );
    }
    for (const a of SEED_ALERTS) {
      insertAlert.run(a.id, a.title, a.message, a.severity, a.zone);
    }

    VENUE_ZONES.forEach((zone, i) => {
      const capacity = zone.includes("Stage") ? 2000 : zone.includes("Hall") ? 300 : 500;
      const occupancy = Math.floor(Math.random() * capacity * 0.85);
      insertCrowd.run(`cz${i + 1}`, zone, occupancy, capacity);
    });

    const insertAttendee = db.prepare(`
      INSERT OR IGNORE INTO attendees (id, name, email, phone, company, role, badge_type, interests, dietary_pref, accessibility_needs, qr_code)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const DEMO_ATTENDEES = [
      { id: "att_101", name: "Dr. Aditi Rao", email: "aditi.rao@iisc.ac.in", phone: "+91 98860 12345", company: "IISc Bangalore", role: "AI Research Lead", badge: "VIP / Speaker", interests: ["AI & ML", "Data Science"], diet: "Vegetarian", a11y: "None", qr: "QR-ATT-101-VIP" },
      { id: "att_102", name: "Karthik Venkat", email: "karthik.v@infosys.com", phone: "+91 99000 54321", company: "Infosys Labs", role: "Principal Architect", badge: "Delegate", interests: ["Cloud", "DevOps"], diet: "Standard", a11y: "None", qr: "QR-ATT-102-DEL" },
      { id: "att_103", name: "Sneha Murthy", email: "sneha.m@phonepe.com", phone: "+91 97400 98765", company: "PhonePe", role: "VP of Product", badge: "VIP / Speaker", interests: ["Fintech", "Leadership"], diet: "Vegan", a11y: "Wheelchair Ramp Access", qr: "QR-ATT-103-VIP" },
      { id: "att_104", name: "Tanmay Joshi", email: "tanmay@neuralstack.io", phone: "+91 98450 11223", company: "NeuralStack AI", role: "Founder & CEO", badge: "All-Access Pass", interests: ["AI & ML", "Startup"], diet: "Standard", a11y: "None", qr: "QR-ATT-104-ALL" },
    ];

    for (const a of DEMO_ATTENDEES) {
      insertAttendee.run(a.id, a.name, a.email, a.phone, a.company, a.role, a.badge, JSON.stringify(a.interests), a.diet, a.a11y, a.qr);
    }
  });

  seedAll();
}

export { SESSION_CATEGORIES };
