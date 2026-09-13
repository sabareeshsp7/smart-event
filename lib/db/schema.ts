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
  { id: "s1", title: "Opening Keynote: The Future of AI", speaker: "Dr. Priya Sharma", bio: "Chief AI Scientist at TechCorp", zone: "Hall 1 — Grand Alpha Stage", category: "Keynote", start: "09:00", end: "09:45", desc: "An inspiring look at where AI is taking us in the next decade.", tags: ["AI & ML", "Leadership"], capacity: 2000, registered: 1800, featured: 1 },
  { id: "s2", title: "Building with LLMs in Production", speaker: "Rahul Mehta", bio: "Staff Engineer at Scale AI", zone: "Hall 2 — Beta Auditorium", category: "Workshop", start: "10:00", end: "11:30", desc: "Practical guide to deploying LLMs in real-world applications with focus on reliability.", tags: ["AI & ML", "Cloud"], capacity: 300, registered: 280, featured: 0 },
  { id: "s3", title: "Next.js 15 Deep Dive", speaker: "Ananya Patel", bio: "Vercel Developer Advocate", zone: "Hall 3 — Workshop Hall A", category: "Workshop", start: "10:00", end: "11:30", desc: "Everything new in Next.js 15: App Router, Server Components, and Streaming.", tags: ["Web Development"], capacity: 200, registered: 195, featured: 0 },
  { id: "s4", title: "Startup Funding Panel", speaker: "Multiple VCs", bio: "Top VCs from Sequoia, Tiger Global, Accel", zone: "Hall 4 — Workshop Hall B", category: "Panel", start: "11:00", end: "12:00", desc: "Real talk from investors about what it takes to raise in 2025.", tags: ["Startup", "Leadership"], capacity: 150, registered: 120, featured: 1 },
  { id: "s5", title: "Design Systems at Scale", speaker: "Meena Krishnamurthy", bio: "Design Lead at Razorpay", zone: "Innovation Hub — Central Atrium", category: "Workshop", start: "11:30", end: "13:00", desc: "How to build and maintain a design system used by hundreds of engineers.", tags: ["Design", "Web Development"], capacity: 100, registered: 85, featured: 0 },
  { id: "s6", title: "Data Science for Impact", speaker: "Vikram Rajan", bio: "Head of Data Science at Swiggy", zone: "Hall 3 — Workshop Hall A", category: "Workshop", start: "13:00", end: "14:30", desc: "Using data science to drive business impact with real case studies.", tags: ["Data Science", "AI & ML"], capacity: 200, registered: 155, featured: 0 },
  { id: "s7", title: "Zero Trust Security", speaker: "Asha Nair", bio: "CISO at PhonePe", zone: "Hall 4 — Workshop Hall B", category: "Workshop", start: "13:00", end: "14:30", desc: "Implementing zero trust security architecture in modern cloud environments.", tags: ["Cybersecurity", "Cloud"], capacity: 150, registered: 140, featured: 0 },
  { id: "s8", title: "Lightning Talks: Indie Hackers", speaker: "Various", bio: "10+ indie hackers sharing 5-min pitches", zone: "Innovation Hub — Central Atrium", category: "Lightning Talk", start: "13:30", end: "14:30", desc: "Rapid-fire presentations from solo founders who built profitable products.", tags: ["Startup"], capacity: 100, registered: 95, featured: 0 },
  { id: "s9", title: "Flutter vs React Native in 2025", speaker: "Arjun Kapoor", bio: "Mobile Lead at Meesho", zone: "Hall 2 — Beta Auditorium", category: "Demo", start: "14:00", end: "15:00", desc: "Side-by-side live demo building the same app in both frameworks.", tags: ["Mobile", "Web Development"], capacity: 300, registered: 210, featured: 0 },
  { id: "s10", title: "Kubernetes for Mere Mortals", speaker: "Sonal Gupta", bio: "DevOps Engineer at Infosys", zone: "Hall 3 — Workshop Hall A", category: "Workshop", start: "15:00", end: "16:30", desc: "Demystifying Kubernetes for developers who just want things to work.", tags: ["DevOps", "Cloud"], capacity: 200, registered: 170, featured: 0 },
  { id: "s11", title: "Closing Keynote: Building for Bharat", speaker: "Nandan Nilekani", bio: "Co-founder of Infosys, Architect of Aadhaar", zone: "Hall 1 — Grand Alpha Stage", category: "Keynote", start: "17:00", end: "18:00", desc: "How technology can reach the next billion users and transform India.", tags: ["Leadership", "Startup"], capacity: 2000, registered: 1950, featured: 1 },
  { id: "s12", title: "Networking Mixer", speaker: "All Attendees", bio: "", zone: "Networking Plaza & Lounge", category: "Networking", start: "18:00", end: "20:00", desc: "Mix, mingle, and make connections with fellow attendees and speakers.", tags: ["Leadership"], capacity: 500, registered: 350, featured: 0 },
  { id: "s13", title: "GenAI Hackathon Kickoff", speaker: "Event Team", bio: "", zone: "Innovation Hub — Central Atrium", category: "Workshop", start: "08:30", end: "09:00", desc: "Rules, themes, and team formation for the 24-hour GenAI Hackathon.", tags: ["AI & ML", "Startup"], capacity: 100, registered: 100, featured: 1 },
  { id: "s14", title: "Web3 & Real-World Assets", speaker: "Crypto Panel", bio: "Founders from top Web3 startups", zone: "Hall 4 — Workshop Hall B", category: "Panel", start: "15:00", end: "16:00", desc: "Practical applications of blockchain beyond speculation.", tags: ["Blockchain", "Startup"], capacity: 150, registered: 80, featured: 0 },
  { id: "s15", title: "Cloud Cost Optimization", speaker: "Deepak Verma", bio: "FinOps Lead at Freshworks", zone: "Hall 2 — Beta Auditorium", category: "Workshop", start: "16:00", end: "17:00", desc: "Cut your AWS/GCP bill by 40% with these battle-tested strategies.", tags: ["Cloud", "DevOps"], capacity: 300, registered: 220, featured: 0 },
];

const SEED_ALERTS = [
  { id: "a1", title: "Main Stage Session Starting", message: "The Opening Keynote begins in 10 minutes at Hall 1 — Grand Alpha Stage.", severity: "low", zone: "Hall 1 — Grand Alpha Stage" },
  { id: "a2", title: "South Food Concourse Open", message: "South Food Concourse is now open. South Indian thali and organic refreshments available.", severity: "low", zone: "South Food Concourse" },
  { id: "a3", title: "Workshop Hall A: Near Capacity", message: "Hall 3 — Workshop Hall A is at 95% capacity. Overflow seating available in Hall 4.", severity: "medium", zone: "Hall 3 — Workshop Hall A" },
  { id: "a4", title: "Schedule Change: Panel Moved", message: "The Startup Funding Panel in Hall 4 has been adjusted to 11:30 AM.", severity: "medium", zone: "Hall 4 — Workshop Hall B" },
  { id: "a5", title: "Routine Safety Inspection", message: "Routine campus safety telemetry check underway across all BIEC pavilions.", severity: "high", zone: "All Areas" },
];

/** Seeds the database with demo data if tables are empty. */
export function seedDatabase(db: Database.Database): void {
  createTables(db);

  const sessionCount = (db.prepare("SELECT COUNT(*) as c FROM sessions").get() as { c: number }).c;
  if (sessionCount > 0) return; // Already seeded

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
        `2025-03-15T${s.start}:00`, `2025-03-15T${s.end}:00`,
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
