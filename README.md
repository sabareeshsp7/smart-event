# 🎪 Smart Event Navigator (EventIQ)

> AI-Powered Multimodal Smart Event Management, Crowd Analytics & Real-Time Navigation Platform.

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict%20100%25-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/Vitest-174%20Passing-brightgreen?logo=vitest)](https://vitest.dev/)
[![AI Models](https://img.shields.io/badge/AI-Azure%20OpenAI%20%7C%20Gemini%20%7C%20Sarvam-purple)](#ai-architecture)

---

## 🌟 Key Highlights

- **🧠 Multi-Model AI Orchestration:**
  - **Azure OpenAI** (GPT-5.4-mini / GPT-4o-mini) for high-speed streaming event concierge & schedule advice.
  - **Google Gemini** for intelligent multimodal reasoning, schedule summarization, and tag analysis.
  - **Sarvam AI** for native Indian-language Text-to-Speech (TTS) & Speech-to-Text (STT) across Hindi, Tamil, Telugu, Kannada, Bengali, and more.
  - **Keyless Fallback Engine:** 100% functional with zero downtime even without API keys or during upstream outages.

- **📊 Real-Time Operations & Crowd Safety:**
  - Dynamic zone crowd density monitoring and real-time congestion heatmaps.
  - AI risk assessment scoring with automated bottleneck alerts.
  - Emergency services dispatch protocol with 1-click speed dial.

- **♿ Universal Accessibility & Inclusivity:**
  - Built-in High Contrast mode, font scaling, and reduce motion support.
  - Screen reader optimized ARIA semantic markup.
  - Voice-driven hands-free navigation.

- **🛡️ Enterprise-Grade Security & Performance:**
  - In-memory sliding window rate limiting on all public API endpoints.
  - Strict Zod validation schemas for all inputs.
  - OWASP compliant security headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options).
  - High-performance SQLite database with prepared statements and transactions.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or 20.x
- npm / yarn / pnpm

### 1. Installation
```bash
git clone https://github.com/sabareeshsp7/smart-event.git
cd smart-event
npm install
```

### 2. Environment Setup
Copy the example environment file:
```bash
cp .env.example .env.local
```
Fill in your API credentials:
```ini
GEMINI_API_KEY=your_gemini_key
AZURE_OPENAI_API_KEY=your_azure_key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/openai/v1
AZURE_OPENAI_DEPLOYMENT=gpt-5.4-mini
SARVAM_API_KEY=your_sarvam_key
ADMIN_KEY=your_admin_secret
```
*(Note: If keys are omitted, the application automatically switches to local intelligent fallbacks)*.

### 3. Development Server
```bash
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🧪 Testing & Validation

```bash
# Run 174 Unit & Integration Tests
npm test

# Run Type Checking
npm run type-check

# Run Production Build
npm run build
```

---

## 🏗️ Architecture

```
smart-event/
├── app/
│   ├── api/             # Secure Next.js route handlers (AI, crowd, sessions, health)
│   ├── chat/            # Streaming AI concierge assistant
│   ├── crowd/           # Live crowd density heatmaps & safety alerts
│   ├── dashboard/       # Organizer command center & health diagnostics
│   ├── emergency/       # Rapid response & safety protocols
│   ├── navigation/      # Interactive 3D/2D venue map
│   ├── recommendations/ # Personalized agenda suggestions
│   └── sessions/        # Schedule planner & bookmarking
├── components/          # Reusable accessible UI components
├── lib/
│   ├── ai/              # Azure, Gemini, and Sarvam AI clients & fallbacks
│   ├── db/              # SQLite database layer with migrations
│   └── utils/           # Rate limiting, caching, security sanitizers
└── tests/               # Comprehensive Vitest test suite
```

---

## 🌐 Deploy to Vercel

1. Push your repository to GitHub.
2. Import the repository in [Vercel](https://vercel.com/new).
3. Set your environment variables (`GEMINI_API_KEY`, `AZURE_OPENAI_API_KEY`, `SARVAM_API_KEY`, etc.).
4. Deploy!
