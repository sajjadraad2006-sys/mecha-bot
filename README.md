# Mecha Bot / Mechatronics Academic Assistant

**Mechatronics Engineering Department — University of Basrah**

Mecha Bot is a Telegram-based academic assistant and student companion built specifically for the Mechatronics Engineering Department at the University of Basrah. It is designed from the ground up as a zero-cost, local-first, privacy-respecting system supporting undergraduate students across all four academic stages.

---

## Milestone M0: Technical Foundation

> [!NOTE]
> This repository currently implements **Milestone M0 — Technical Foundation**.
> Academic syllabus content is being researched and cataloged in parallel.
> In accordance with project rules, all test data strictly uses synthetic fixtures (`TEST101`, etc.) and no real academic data is fabricated.

### What M0 Delivers

- **Monorepo Architecture**: Modular workspace (`apps/*`, `packages/*`, `tools/*`).
- **Database Layer**: SQLite & Cloudflare D1 compatible migration runner (`0001_initial_schema.sql`) and domain repositories.
- **Academic Model**: 4 stages, 8 program semesters, Course vs. CourseOffering separation, dynamic calendar week derivation, and course pulse foundations.
- **Contextual Source Authority**: Dynamic retrieval priority policy and provenance tracking (`evidence_scope`).
- **Telegram Transport**: grammY bot runtime with long polling, `/start`, `/help`, and `/health` handlers, update deduplication middleware, and error boundaries.
- **AI & Retrieval Contracts**: Type-safe Zod contracts, `FakeAIProvider`, `FakeRetrievalProvider`, and zero-PII privacy boundaries.
- **Time & Clock Engine**: UTC timestamp storage with `Asia/Baghdad` local academic date conversions and `FakeClock` for testing.
- **Automated Testing & Quality Suite**: Strict TypeScript, ESLint, Prettier, and Vitest test suite.

### Canonical Milestone Roadmap (M0 through M16)

- **M0**: Technical Foundation & Architectural Hardening _(Current — Complete)_
- **M1**: Student Onboarding (Stage 1..4 & Semester 1..8 Selection)
- **M2**: Academic Core (University of Basrah Curriculum Ingestion)
- **M3**: Timetable (Weekly Schedule & Lecture Room Navigator)
- **M4**: Reminders (Deadlines & Quiz Alerts Dispatcher)
- **M5**: Daily Companion (Study Check-ins & Session Logging)
- **M6**: Sources / Ingestion (Verified Course Materials & Provenance)
- **M7**: Search / RAG (Intent-Aware Contextual Search)
- **M8**: AI Brain (Zero-Cost Free Tier Provider Routing & Privacy by Architecture)
- **M9**: Study Navigator (Topic Hierarchy & Prerequisites Visualizer)
- **M10**: Exams & Quizzes (Past Exams Archive & Practice Quizzes)
- **M11**: Admin / Course Editors (Course Pulse & Faculty Roster Tools)
- **M12**: File Distribution (Native Telegram Documents & Zero-Egress Storage)
- **M13**: Student Dashboard (Academic Summary & Mastery Metrics)
- **M14**: Mini App (Interactive Timetable & Syllabus Web App)
- **M15**: Hardening (Performance, Rate Limiting & Cloudflare Workers / D1)
- **M16**: Production Release (Department Handover & Official Launch)

---

## Prerequisites

- **Node.js**: `v22.0.0` or `v24.0.0+` (Node 24 LTS recommended, includes built-in `node:sqlite`)
- **pnpm**: `v10.0.0+` or `v12.0.0+`
- **Git**: Installed and on system PATH

---

## Quick Start & Local Setup

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/sajjadraad2006-sys/mecha-bot.git
cd mecha-bot
pnpm install
```

### 2. Configure Environment Variables

Copy the environment template to `.env`:

```bash
cp .env.example .env
```

Edit `.env` to provide your Telegram bot token obtained from [@BotFather](https://t.me/BotFather):

```ini
NODE_ENV=development
LOG_LEVEL=info
TELEGRAM_BOT_TOKEN=<your-dev-bot-token>
DATABASE_PATH=./data/mecha_bot.sqlite
DEFAULT_TIMEZONE=Asia/Baghdad
ALLOW_PAID_AI=false
ALLOW_PAID_STORAGE=false
ALLOW_BILLING_FALLBACK=false
```

### 3. Initialize the Database

Run migrations from empty database:

```bash
pnpm db:migrate
```

_(Optional)_ Seed synthetic academic test fixtures (`TEST101`, `TEST102`, etc.):

```bash
pnpm db:seed:test
```

### 4. Run the Development Bot

Start the bot locally using grammY long polling (no webhooks or tunnels required):

```bash
pnpm bot:dev
```

Open Telegram, locate your bot, and send:

- `/start` — Welcome message and introduction to Mecha Bot.
- `/help` — Overview of commands and roadmap.
- `/health` — Real-time diagnostic status (database connectivity, uptime, UTC time, Basrah academic date).

---

## Database Management Commands

| Command             | Description                                                                    |
| ------------------- | ------------------------------------------------------------------------------ |
| `pnpm db:migrate`   | Applies pending migrations to the local SQLite database.                       |
| `pnpm db:reset`     | Wipes the local database and re-runs all migrations from scratch.              |
| `pnpm db:seed:test` | Seeds synthetic test courses (`TEST101`, etc.) for local inspection.           |
| `pnpm db:compat:d1` | Runs local-only Cloudflare D1 migration compatibility smoke test via Wrangler. |

---

## Quality & Testing Gate

Run the automated test suite:

```bash
pnpm test
```

Generate code coverage report:

```bash
pnpm test:coverage
```

Run typechecking:

```bash
pnpm typecheck
```

Run linting & formatting checks:

```bash
pnpm lint
pnpm format:check
```

Run the complete verification gate (Lint + Format + Typecheck + Test + Build):

```bash
pnpm verify
```

---

## Project Structure

```
mecha-bot/
├── apps/
│   └── bot/                  # Bot entrypoint & local long-polling runner
├── packages/
│   ├── shared/               # Config, Clock, Logger, Errors, Idempotency, Date-Time
│   ├── academic/             # Stage/Semester, Calendar, Course/Offering, Authority, Evidence
│   ├── database/             # SQLite/D1 abstraction, migration runner, repositories
│   ├── ai/                   # AIProvider interface, AIRouter, FakeAIProvider, Zod schemas
│   ├── retrieval/            # RetrievalProvider, RetrievalPolicy, FakeRetrievalProvider
│   ├── scheduler/            # Scheduler contracts & reminder interfaces
│   └── telegram/             # grammY bot, handlers (/start, /help, /health), middleware
├── tools/
│   └── ingestion/            # Reserved for future document/PDF extraction tools
├── curriculum/
│   ├── stage1/               # Reserved for verified Stage 1 data
│   ├── stage2/               # Reserved for verified Stage 2 data
│   ├── stage3/               # Reserved for verified Stage 3 data
│   └── stage4/               # Reserved for verified Stage 4 data
├── migrations/               # SQL migrations (0001_initial_schema.sql)
├── tests/                    # Vitest automated test suite
├── docs/
│   ├── ARCHITECTURE.md       # Detailed technical architecture specification
│   ├── MILESTONES.md         # Full 17-milestone project roadmap
│   └── M0_REPORT.md          # Milestone M0 completion report
├── .github/
│   └── workflows/ci.yml      # GitHub Actions CI workflow
├── pnpm-workspace.yaml       # Workspace definition
├── package.json              # Monorepo root scripts & dev dependencies
├── tsconfig.base.json        # Base TypeScript configuration
├── tsconfig.json             # Root TypeScript project references & paths
├── wrangler.toml             # Local Cloudflare D1 compatibility config
└── README.md
```

---

## Architectural Principles

1. **Zero Cost**: Built entirely on free-tier infrastructure. Safe defaults (`ALLOW_PAID_AI=false`) prevent unexpected billing.
2. **Local-First Development**: Runs 100% locally with Node.js and SQLite. No cloud account or remote deployment required for development.
3. **Privacy by Design**: AI models never receive student IDs, usernames, or contact details. Only academic context is processed.
4. **No Fabricated Academic Content**: Schema is ready for real curriculum data, but M0 uses only synthetic test fixtures (`TEST101`).
5. **Separation of Concerns**: Domain logic is completely independent of Telegram transport, database engine, or specific AI providers.
