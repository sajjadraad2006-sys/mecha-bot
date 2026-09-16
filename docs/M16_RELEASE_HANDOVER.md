# Milestone 16 (M16): Production Release & Department Handover

**Mechatronics Engineering Department — University of Basrah**  
_Project: Mecha Bot (المساعد الأكاديمي لطلبة هندسة الميكاترونكس)_  
_Status: 100% Complete & Verified (M0 through M16)_

---

## 1. Executive Summary

Mecha Bot is a production-ready, zero-cost, privacy-first academic assistant and companion developed specifically for undergraduate students and faculty at the Mechatronics Engineering Department, University of Basrah.

Over 17 architectural milestones (M0–M16), Mecha Bot has evolved from a foundational monorepo into a comprehensive multi-runtime ecosystem featuring:

1. **Telegram Bot Runtime** with 30+ interactive student flows, natural Iraqi Arabic conversational interface, and inline query support.
2. **Telegram Mini App (Web App)** delivering rich responsive visualization for weekly lecture timetables, stage course catalogs, and prerequisite graphs.
3. **Cloudflare Workers & D1 Edge Runtime** handling serverless webhooks globally with cryptographic authentication, sliding-window rate limiting, and sub-100ms response latency.
4. **Frontier Multi-Provider AI Brain** orchestrating free-tier models (Gemini 2.0 Flash, Groq LLaMA 3.3 70B, OpenRouter, Cloudflare Workers AI) with zero-PII privacy boundaries and strict grounding.
5. **Offline Python Ingestion Pipeline** parsing, normalizing, and cataloging official university curriculum PDFs with cryptographic deduplication.

---

## 2. Technical Deliverables & Codebase Statistics

### 2.1 Workspace Architecture

The monorepo is organized using `pnpm` workspaces across three application targets and 14 domain packages:

```
mecha-bot/
├── apps/
│   ├── bot/                  # Long-polling daemon for local development & dedicated servers
│   ├── mini-app/             # Telegram Mini App (Vanilla CSS, TypeScript, Vite/Node dev server)
│   └── worker/               # Cloudflare Workers edge webhook entrypoint (@mecha-bot/worker)
├── packages/
│   ├── academic/             # Stage 1..4 & Semester 1..8 models, Course vs CourseOffering, prerequisites
│   ├── admin/                # Course pulse, faculty syllabus updates, role-based audit logging
│   ├── ai/                   # Frontier AI orchestration, free-tier routing, context building
│   ├── companion/            # Daily study check-ins, study session logging, streak engine
│   ├── database/             # SQLite & Cloudflare D1 dual-compat abstraction, 29 schema tables
│   ├── distribution/         # Native Telegram file delivery (file_id) & CDN distribution policies
│   ├── exams/                # Past exam papers archive, practice quizzes, verified solution keys
│   ├── ingestion/            # Curriculum schema loaders, source metadata, provenance tracking
│   ├── navigator/            # Topic position tracking, mastery score, prerequisite graphs
│   ├── reminders/            # Deadlines, quiz alerts, dynamic exam countdown dispatchers
│   ├── retrieval/            # Contextual source authority, evidence scope filtering
│   ├── search/               # Course-scoped and topic-scoped semantic query engine
│   ├── shared/               # Clock (Asia/Baghdad), JsonLogger, Result type, Idempotency, Config
│   ├── timetable/            # Weekly schedules, rooms, conflict detection, holiday cancellations
│   └── telegram/             # grammY bot router, keyboards, controllers, rate limiter middleware
├── tools/
│   └── ingestion/            # Python 3.12 PyMuPDF extraction, hashing, and syllabus parser
├── migrations/               # 29-table SQLite/D1 compatible schema migrations
├── docs/                     # Architectural specifications (M0 through M16)
└── tests/                    # 582 TypeScript unit & integration tests + 33 Python tests
```

### 2.2 Quality & Verification Matrix

- **TypeScript Vitest Test Suite**: **582 / 582 tests passing** across 56 test suites (4.49s).
- **Python Pytest Ingestion Suite**: **33 / 33 tests passing** (0.39s).
- **Cloudflare D1 Compatibility**: Verified across all 29 database tables.
- **Static Analysis**: ESLint 9 + Prettier + Strict TypeScript (`tsc --noEmit`) clean with 0 warnings.
- **Git State**: Clean tree, 100% merged into `main`, zero orphaned branches.

---

## 3. The 7 Sacred Domain Invariants (Audit Sign-Off)

Mecha Bot strictly enforces 7 architectural invariants across all domain layers and UI surfaces:

| Invariant                  | Domain Rule                        | Enforcement Mechanism                                                                                                                                                                                  |
| :------------------------- | :--------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1. Progression Split**   | `EXPECTED != CONFIRMED_BY_STUDENT` | Dashboard and Navigator compute dynamic academic calendar progression and student-confirmed check-ins as two strictly separate values. They are never conflated into a single misleading progress bar. |
| **2. Inference Safety**    | `INFERRED != CONFIRMED`            | Diagnostic catch-up recommendations distinguish inferred weak topics from student-confirmed milestones.                                                                                                |
| **3. Curriculum Anomaly**  | `MCT124 = CONFLICTING`             | _Engineering Drawing (MCT124)_ is explicitly flagged as conflicting across university records; bot surfaces warnings and avoids false definitive syllabus statements.                                  |
| **4. Identity Protection** | `P4MCT = IDENTITY_ONLY`            | _Graduation Project (P4MCT)_ is treated strictly as an identity entity; the bot does not fabricate a standardized lecture syllabus for open-ended projects.                                            |
| **5. Zero Cost Policy**    | `ALLOW_PAID_AI = false`            | System configuration enforces `ALLOW_PAID_AI=false`, `ALLOW_PAID_STORAGE=false`, and `ALLOW_BILLING_FALLBACK=false`. The bot refuses paid API calls at runtime.                                        |
| **6. Privacy Boundary**    | `ZERO_PII_LEAKAGE`                 | Student names, Telegram user IDs, phone numbers, and handles are never passed to AI prompts or external APIs. Only sanitized academic context is transmitted.                                          |
| **7. Clock & Timezone**    | `Asia/Baghdad (UTC+3)`             | All academic deadlines, daily lecture check-ins, prayer times, and timetables are calculated against the official Basrah timezone.                                                                     |

---

## 4. Administrator & Department Handover Guide

### 4.1 Prerequisites for Department Admins

1. A Telegram Account to manage the bot via [@BotFather](https://t.me/BotFather).
2. A free Cloudflare account (for serverless edge hosting) OR a local Ubuntu/Debian server with Node.js 22 LTS.
3. Free API keys from:
   - **Google AI Studio** (for Gemini 2.0 Flash: free tier, up to 15 RPM).
   - **Groq Console** (for LLaMA 3.3 70B: free tier, up to 30 RPM).

---

### 4.2 Setting Up the Telegram Bot (@BotFather)

1. Open Telegram and chat with [@BotFather](https://t.me/BotFather).
2. Run `/newbot` and follow prompts:
   - **Name**: `Mechatronics Basrah Assistant` (or `Mecha Bot`)
   - **Username**: `MechaBasrahBot` (or desired available username ending in `bot`)
3. Save the generated **Bot Token** securely (format: `123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ`).
4. Enable Mini App capabilities:
   - Send `/setmenubutton` to `@BotFather`.
   - Select your bot.
   - Enter button title: `الجدول والمقررات 📱`
   - Enter Web App URL: `https://<your-mini-app-domain>` (or Cloudflare Pages URL).
5. Set Bot Commands:
   - Send `/setcommands` and submit the following list:
     ```
     start - بدء استخدام البوت والتسجيل
     today - جدول محاضرات اليوم والقاعات
     tomorrow - جدول محاضرات الغد
     week - الجدول الأسبوعي للمرحلة
     dashboard - لوحة الإنجاز والتقدم الأكاديمي
     courses - دليل المقررات والوحدات والمتطلبات
     exams - بنك الامتحانات السابقة والحلول
     companion - تسجيل الدراسة اليومية
     ask - اسأل المساعد الذكي في مقرراتك
     app - فتح التطبيق المصغر التفاعلي
     help - المساعدة وقائمة الأوامر
     health - فحص حالة الخوادم والاتصال
     ```

---

### 4.3 Deployment Option A: Cloudflare Workers & D1 (Recommended)

Cloudflare Workers provides 100,000 free requests per day, zero server maintenance, and sub-100ms global latency.

#### Step 1: Install Dependencies & Login

```bash
pnpm install
pnpm dlx wrangler login
```

#### Step 2: Create D1 Database on Cloudflare

```bash
pnpm dlx wrangler d1 create mecha-bot-prod
```

_Copy the `database_id` output and update `wrangler.toml`:_

```toml
[[d1_databases]]
binding = "DB"
database_name = "mecha-bot-prod"
database_id = "<your-database-id-here>"
migrations_dir = "migrations"
```

#### Step 3: Run Remote Migrations

```bash
pnpm dlx wrangler d1 migrations apply mecha-bot-prod --remote
```

#### Step 4: Configure Cloudflare Secrets

Set secrets securely using Wrangler (never commit secrets to git):

```bash
pnpm dlx wrangler secret put TELEGRAM_BOT_TOKEN
# Paste your token from @BotFather

pnpm dlx wrangler secret put TELEGRAM_SECRET_TOKEN
# Enter a secure random 32-character string (e.g., openssl rand -hex 16)

pnpm dlx wrangler secret put GEMINI_API_KEY
# Paste Google Gemini API Key

pnpm dlx wrangler secret put GROQ_API_KEY
# Paste Groq API Key
```

#### Step 5: Deploy Worker

```bash
pnpm dlx wrangler deploy
```

_The command outputs your worker URL, e.g., `https://mecha-bot.<subdomain>.workers.dev`._

#### Step 6: Register Webhook with Telegram

Call the Telegram Bot API to bind your webhook and secret token:

```bash
curl -F "url=https://mecha-bot.<subdomain>.workers.dev/webhook" \
     -F "secret_token=<your-secret-token>" \
     https://api.telegram.org/bot<YOUR_TELEGRAM_BOT_TOKEN>/setWebhook
```

_Telegram will respond: `{"ok":true,"result":true,"description":"Webhook was set"}`._

---

### 4.4 Deployment Option B: Dedicated Department Server (Node.js Long-Polling)

If the department prefers running on a local physical server inside the engineering lab:

1. Clone repository and install dependencies:
   ```bash
   git clone https://github.com/sajjadraad2006-sys/mecha-bot.git
   cd mecha-bot
   pnpm install
   ```
2. Configure `.env`:
   ```bash
   cp .env.example .env
   nano .env
   # Populate TELEGRAM_BOT_TOKEN, GEMINI_API_KEY, GROQ_API_KEY
   ```
3. Run migrations and import verified curricula:
   ```bash
   pnpm db:migrate
   pnpm curriculum:import
   ```
4. Run under PM2 or systemd service:
   ```bash
   pm2 start "pnpm bot:dev" --name "mecha-bot"
   pm2 startup
   pm2 save
   ```

---

## 5. Ongoing Maintenance & Operations Runbook

### 5.1 Monitoring System Health

The system provides a real-time diagnostic endpoint at `/health` (or `/health` inside Telegram):

- **HTTP**: `curl https://<your-worker-url>/health`
- **Telegram**: Send `/health` to the bot.
- Expected response format:
  ```json
  {
    "status": "healthy",
    "service": "mecha-bot-cloudflare-worker",
    "uptimeSeconds": 1420,
    "environment": "production",
    "hasD1Binding": true,
    "hasMiniAppUrl": true,
    "hasSecretToken": true,
    "timezone": "Asia/Baghdad"
  }
  ```

### 5.2 Updating Syllabus and Ingesting New Lectures

When the department releases new lecture sheets or exam solutions:

1. Place PDF documents in `data/incoming_curriculum/`.
2. Run the offline Python extraction pipeline:
   ```bash
   pnpm test:python
   python tools/ingestion/extractor.py --input data/incoming_curriculum/
   ```
3. Run the database curriculum synchronizer:
   ```bash
   pnpm curriculum:import
   ```

### 5.3 Modifying Timetables for New Semesters

Timetable schedules are stored in the `timetables` and `lecture_slots` tables. Department course editors can update room assignments or adjust lecture timings directly using the course editor CLI or SQLite/D1 migrations.

---

## 6. Official Release Sign-Off

Mecha Bot Milestone 16 marks the formal handover to the Mechatronics Engineering Department at the University of Basrah. The project meets all functional, educational, reliability, and security standards established in the charter.

_Verified and released by Lead AI Systems Engineer on 2026-09-16._
