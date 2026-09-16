# Mecha Bot / Mechatronics Academic Assistant

**Mechatronics Engineering Department — University of Basrah**  
_المساعد الأكاديمي الذكي لطلبة هندسة الميكاترونكس — جامعة البصرة_

[![CI Quality Gate](<https://img.shields.io/badge/CI-Passing%20(582%20tests)-brightgreen.svg>)](https://github.com/sajjadraad2006-sys/mecha-bot)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Runtime](https://img.shields.io/badge/Runtime-Node.js%2022%20%7C%20Cloudflare%20Workers-orange.svg)](<>)
[![Status](<https://img.shields.io/badge/Status-Production%20Ready%20(M0--M16)-success.svg>)](<>)

Mecha Bot is a comprehensive academic assistant, study companion, and interactive timetable platform built specifically for undergraduate students and faculty in the Mechatronics Engineering Department at the University of Basrah.

Designed from the ground up to be **100% zero-cost**, **privacy-first**, and **high-performance**, Mecha Bot supports dual deployment runtimes: a lightweight serverless edge instance running on Cloudflare Workers & D1, alongside a long-polling Node.js runner for local development and physical department servers.

---

## Key Features

- 🏛️ **Academic Core & Basrah Curriculum**: Verified stage 1–4 and semester 1–8 curriculum, course prerequisites, units, offering statuses, and course pulse tracking.
- 📅 **Dynamic Timetable Engine**: Lecture schedules, group assignments, room guidance, today/tomorrow views, and instant cancellation notices calculated in the `Asia/Baghdad` timezone.
- 📱 **Telegram Mini App (Web App)**: Modern, responsive Mechatronics Dark Mode web app featuring interactive timetable filters, stage course cards, and visual prerequisite trees.
- ⚡ **Cloudflare Workers & D1 Edge Runtime**: Serverless webhook handling with sub-100ms global latency, sliding-window rate limiting (20 req / 10s), and cryptographic Telegram Secret Token verification.
- 🤖 **Frontier AI Brain (Zero-Cost Free Tier)**: Multi-provider orchestration routing across Google Gemini 2.0 Flash, Groq LLaMA 3.3 70B, OpenRouter, and Cloudflare Workers AI with zero-PII privacy boundaries.
- 📊 **Student Dashboard & Study Companion**: Mastery metrics, verified topic progression, streak tracking, diagnostic catch-up plans, and daily check-ins.
- 📁 **File Distribution & Past Exams Archive**: Direct Telegram native document delivery (`file_id`), CDN fallbacks, exam question banks, and verified department solution sheets.
- 🔒 **The 7 Sacred Domain Invariants**: Enforces `EXPECTED != CONFIRMED`, `INFERRED != CONFIRMED`, `MCT124 = CONFLICTING`, and `P4MCT = IDENTITY_ONLY` across all calculations.

---

## Milestone Roadmap (M0 through M16)

All 17 milestones are **100% Complete & Verified**:

| Milestone | Title                      | Scope Summary                                                                                                           | Status   |
| :-------- | :------------------------- | :---------------------------------------------------------------------------------------------------------------------- | :------- |
| **M0**    | **Technical Foundation**   | Monorepo setup, SQLite/D1 migrations, zero-cost safeguards, grammY skeleton, fake providers, clock layer, Vitest suite. | **DONE** |
| **M1**    | **Student Onboarding**     | Welcome flow, stage (1..4) & semester (1..8) selection, locale preference, user profile persistence.                    | **DONE** |
| **M2**    | **Academic Core**          | Verified University of Basrah curriculum ingestion, active courses, offerings, prerequisites, topic hierarchies.        | **DONE** |
| **M3**    | **Timetable**              | Weekly lecture schedules, lecture rooms, groups, dynamic today/tomorrow view, lecture cancellations.                    | **DONE** |
| **M4**    | **Reminders**              | Study reminders, quiz/exam countdowns, assignment deadlines, notification dispatch service.                             | **DONE** |
| **M5**    | **Daily Companion**        | Daily study check-ins, study session logging, progress tracking, catch-up mode after missed lectures.                   | **DONE** |
| **M6**    | **Sources / Ingestion**    | Verified department materials, lecture slides, syllabus sheets, source evidence & provenance tracking.                  | **DONE** |
| **M7**    | **Search / RAG**           | Course-scoped and topic-scoped semantic search, evidence scope filtering, contextual authority ranking.                 | **DONE** |
| **M8**    | **AI Brain**               | Frontier intelligence routing (Gemini 2.0 Flash, Groq 70B, Workers AI), grounding, privacy boundary.                    | **DONE** |
| **M9**    | **Study Navigator**        | Topic position tracking, prerequisite visualizer, revision recommendations, catch-up planning.                          | **DONE** |
| **M10**   | **Exams & Quizzes**        | Past exam questions archive, sample quizzes, verified exam solutions, student attempt tracking.                         | **DONE** |
| **M11**   | **Admin / Course Editors** | Role-based course editor tools, course pulse updates (where class reached), syllabus edits, audit logging.              | **DONE** |
| **M12**   | **File Distribution**      | Telegram native file delivery via `file_id`, zero-egress CDN delivery, Drive link fallbacks.                            | **DONE** |
| **M13**   | **Student Dashboard**      | Academic summary, topic mastery scores, streak statistics, dynamic progress comparison.                                 | **DONE** |
| **M14**   | **Mini App**               | Telegram Mini App (Web App) for timetable viewing and rich syllabus exploration.                                        | **DONE** |
| **M15**   | **Hardening**              | Performance tuning, rate limiting, Cloudflare Workers + D1 deployment, failover testing.                                | **DONE** |
| **M16**   | **Production Release**     | Final security audit, department staff handover, official student launch at University of Basrah.                       | **DONE** |

---

## Monorepo Architecture

```
mecha-bot/
├── apps/
│   ├── bot/                  # Telegram Bot daemon (long polling runner for Node.js)
│   ├── mini-app/             # Telegram Mini App (HTML5, Vanilla CSS, TypeScript)
│   └── worker/               # Cloudflare Workers edge webhook runner (@mecha-bot/worker)
├── packages/
│   ├── academic/             # Stage/Semester, Calendar, Course/Offering, Authority, Evidence
│   ├── admin/                # Course pulse updates, faculty roster, audit logging
│   ├── ai/                   # Frontier AI router (Gemini, Groq, OpenRouter, Workers AI)
│   ├── companion/            # Daily study check-ins, study session logging, streak engine
│   ├── database/             # SQLite & Cloudflare D1 dual-compat abstraction, 29 schema tables
│   ├── distribution/         # Native Telegram file delivery (file_id) & distribution policies
│   ├── exams/                # Past exam papers archive, practice quizzes, verified solutions
│   ├── ingestion/            # Curriculum loaders, source metadata, provenance tracking
│   ├── navigator/            # Topic position tracking, mastery score, prerequisite graphs
│   ├── reminders/            # Deadlines, quiz alerts, dynamic exam countdown dispatchers
│   ├── retrieval/            # Contextual source authority, evidence scope filtering
│   ├── search/               # Course-scoped and topic-scoped semantic query engine
│   ├── shared/               # Clock (Asia/Baghdad), JsonLogger, Result, Idempotency, Config
│   ├── timetable/            # Weekly schedules, rooms, conflict detection, holiday cancellations
│   └── telegram/             # grammY bot router, keyboards, controllers, rate limiter middleware
├── tools/
│   └── ingestion/            # Python 3.12 PyMuPDF extraction, hashing, and syllabus parser
├── migrations/               # 29-table SQLite/D1 compatible schema migrations
├── docs/                     # Architectural specifications and milestone documentation
└── tests/                    # 582 TypeScript tests + 33 Python tests
```

---

## Quick Start & Local Setup

### 1. Prerequisites

- **Node.js**: `v22.0.0` or `v24.0.0+` (LTS recommended)
- **pnpm**: `v10.0.0+` or `v12.0.0+`
- **Python**: `v3.12+` (for offline curriculum ingestion tools)
- **Git**: Installed and on system PATH

### 2. Clone & Install Dependencies

```bash
git clone https://github.com/sajjadraad2006-sys/mecha-bot.git
cd mecha-bot
pnpm install
```

### 3. Environment Configuration

Copy the `.env.example` template:

```bash
cp .env.example .env
```

Fill in your Telegram bot token from [@BotFather](https://t.me/BotFather) and free API keys:

```ini
NODE_ENV=development
LOG_LEVEL=info
TELEGRAM_BOT_TOKEN=123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ
DATABASE_PATH=./data/mecha_bot.sqlite
DEFAULT_TIMEZONE=Asia/Baghdad
ALLOW_PAID_AI=false
ALLOW_PAID_STORAGE=false
ALLOW_BILLING_FALLBACK=false

# AI Providers (Free Tiers)
AI_PROVIDER=gemini
GEMINI_API_KEY=<your-free-gemini-key>
GROQ_API_KEY=<your-free-groq-key>
```

### 4. Initialize Database

Run migrations and seed verified curriculum data:

```bash
pnpm db:migrate
pnpm curriculum:import
```

### 5. Run Development Servers

**Run the Telegram Bot (Long Polling)**:

```bash
pnpm bot:dev
```

**Run the Telegram Mini App (Web App)**:

```bash
pnpm mini-app:dev
```

Open `http://localhost:5173` in your browser or link it inside Telegram via [@BotFather](https://t.me/BotFather) `/setmenubutton`.

---

## Cloudflare Workers Deployment

To deploy Mecha Bot to Cloudflare's serverless edge:

1. **Login to Cloudflare**:
   ```bash
   pnpm dlx wrangler login
   ```
2. **Create D1 Database**:

   ```bash
   pnpm dlx wrangler d1 create mecha-bot-prod
   ```

   _(Update `database_id` in `wrangler.toml` with the generated UUID)._

3. **Apply Migrations to D1**:

   ```bash
   pnpm dlx wrangler d1 migrations apply mecha-bot-prod --remote
   ```

4. **Set Production Secrets**:

   ```bash
   pnpm dlx wrangler secret put TELEGRAM_BOT_TOKEN
   pnpm dlx wrangler secret put TELEGRAM_SECRET_TOKEN
   pnpm dlx wrangler secret put GEMINI_API_KEY
   pnpm dlx wrangler secret put GROQ_API_KEY
   ```

5. **Deploy**:

   ```bash
   pnpm dlx wrangler deploy
   ```

6. **Set Telegram Webhook**:
   ```bash
   curl -F "url=https://mecha-bot.<subdomain>.workers.dev/webhook" \
        -F "secret_token=<your-telegram-secret-token>" \
        https://api.telegram.org/bot<YOUR_TELEGRAM_BOT_TOKEN>/setWebhook
   ```

For detailed production instructions and handover runbooks, consult [M16 Release & Handover Guide](docs/M16_RELEASE_HANDOVER.md).

---

## Verification & Quality Gates

Run the complete verification pipeline:

```bash
pnpm verify
```

Run all automated test suites (582 TypeScript tests + 33 Python tests):

```bash
pnpm test:all
```

Test Cloudflare D1 compatibility locally:

```bash
pnpm db:compat:d1
```

---

## Architectural Principles & Invariants

1. **Zero Cost**: Safe defaults (`ALLOW_PAID_AI=false`, `ALLOW_PAID_STORAGE=false`) guarantee zero unwanted billing.
2. **Local-First & Edge-Ready**: Seamlessly transitions from local SQLite long polling to Cloudflare Workers serverless edge.
3. **Strict Privacy**: Student IDs, names, and contact details are never transmitted to AI models.
4. **No Fabricated Content**: Syllabi, prerequisites, and lecture rooms are strictly sourced from verified department records.
5. **Separation of Concerns**: Domain logic is completely independent of Telegram transport, database engine, or specific AI providers.

---

## License

This project is open-source under the [MIT License](LICENSE), developed for the academic advancement of the **Mechatronics Engineering Department, University of Basrah**.
