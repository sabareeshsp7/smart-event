/**
 * Central constants file — all magic strings, numbers, and config values.
 * RULE CQ-5: No magic strings/numbers outside this file.
 */

// ─── App metadata ────────────────────────────────────────────────────────────
export const APP_NAME = "EventIQ" as const;
export const APP_DESCRIPTION =
  "Smart Event Experience Platform — Navigate, Discover, Stay Safe" as const;
export const APP_VERSION = "1.0.0" as const;

// ─── Emergency contacts ───────────────────────────────────────────────────────
export const EMERGENCY_CONTACTS = [
  { label: "Emergency Services", number: "112", icon: "🚨" },
  { label: "Medical / Ambulance", number: "108", icon: "🏥" },
  { label: "Police", number: "100", icon: "👮" },
  { label: "Fire Brigade", number: "101", icon: "🔥" },
  { label: "Event Security", number: "+91-9876-543210", icon: "🛡️" },
  { label: "First Aid Desk", number: "+91-9876-543211", icon: "💊" },
] as const;

// ─── AI model names ──────────────────────────────────────────────────────────
/** Azure OpenAI model name — set via AZURE_OPENAI_DEPLOYMENT env var */
export const AZURE_MODEL: string = process.env.AZURE_OPENAI_DEPLOYMENT ?? "gpt-5.4-mini";
export const GEMINI_MODEL = "gemini-1.5-flash" as const;

// ─── Rate limiting ───────────────────────────────────────────────────────────
export const RATE_LIMIT_WINDOW_MS = 60_000 as const;
export const RATE_LIMIT_MAX_REQUESTS = 20 as const;

// ─── Cache TTL values (ms) ───────────────────────────────────────────────────
export const CACHE_TTL_SESSIONS = 300000;   // 5 min
export const CACHE_TTL_CROWD = 30000;           // 30 sec
export const CACHE_TTL_AI = 600000;         // 10 min

// ─── Crowd thresholds ────────────────────────────────────────────────────────
export const CROWD_LOW_THRESHOLD = 40 as const;
export const CROWD_MEDIUM_THRESHOLD = 70 as const;
export const CROWD_HIGH_THRESHOLD = 90 as const;

// ─── Pagination ──────────────────────────────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 12 as const;
export const MAX_PAGE_SIZE = 50 as const;

// ─── Navigation routes ───────────────────────────────────────────────────────
export const ROUTES = {
  HOME: "/",
  NAVIGATION: "/navigation",
  SESSIONS: "/sessions",
  RECOMMENDATIONS: "/recommendations",
  CROWD: "/crowd",
  EMERGENCY: "/emergency",
  ACCESSIBILITY: "/accessibility",
  UPDATES: "/updates",
  DASHBOARD: "/dashboard",
  CHAT: "/chat",
} as const;

// ─── Venue zones ─────────────────────────────────────────────────────────────
export const VENUE_ZONES = [
  "Main Stage",
  "Workshop Hall A",
  "Workshop Hall B",
  "Innovation Hub",
  "Food Court",
  "Registration",
  "VIP Lounge",
  "Networking Area",
  "Restrooms Block A",
  "Restrooms Block B",
  "First Aid Station",
  "Help Desk",
  "Exhibition Area",
  "Parking Zone",
  "Main Entrance",
  "Side Entrance",
  "Auditorium",
  "Press Room",
  "Sponsor Booths",
  "Merchandise Zone",
] as const;

// ─── Session categories ───────────────────────────────────────────────────────
export const SESSION_CATEGORIES = [
  "Keynote",
  "Workshop",
  "Panel",
  "Lightning Talk",
  "Demo",
  "Networking",
  "Awards",
] as const;

// ─── Interest tags ────────────────────────────────────────────────────────────
export const INTEREST_TAGS = [
  "AI & ML",
  "Web Development",
  "Startup",
  "Design",
  "Data Science",
  "Cloud",
  "Cybersecurity",
  "Mobile",
  "DevOps",
  "Blockchain",
  "Gaming",
  "Leadership",
] as const;

// ─── Debounce delays (ms) ────────────────────────────────────────────────────
export const DEBOUNCE_SEARCH_MS = 300 as const;
export const DEBOUNCE_LOCATION_MS = 500 as const;

// ─── Image upload ────────────────────────────────────────────────────────────
export const MAX_IMAGE_WIDTH_PX = 1024 as const;
export const MAX_IMAGE_SIZE_BYTES = 5242880; // 5MB
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

// ─── API route paths ─────────────────────────────────────────────────────────
export const API_ROUTES = {
  SESSIONS: "/api/sessions",
  CROWD: "/api/crowd",
  ALERTS: "/api/alerts",
  RECOMMENDATIONS: "/api/recommendations",
  CHAT: "/api/chat",
  SUMMARY: "/api/summary",
  CROWD_RISK: "/api/crowd-risk",
  HEALTH: "/api/health",
  SPEECH_TTS: "/api/speech-tts",
} as const;

// ─── Sarvam AI supported languages ───────────────────────────────────────────
export const SARVAM_LANGUAGES = [
  { code: "en-IN", label: "English (India)" },
  { code: "hi-IN", label: "Hindi" },
  { code: "ta-IN", label: "Tamil" },
  { code: "te-IN", label: "Telugu" },
  { code: "kn-IN", label: "Kannada" },
  { code: "ml-IN", label: "Malayalam" },
  { code: "bn-IN", label: "Bengali" },
  { code: "gu-IN", label: "Gujarati" },
  { code: "mr-IN", label: "Marathi" },
] as const;
