# Milestone M0 Verification & Architecture Report

## Mechatronics Academic Assistant (Mecha Bot) — University of Basrah

**Date**: September 14, 2026  
**Milestone**: M0 — Technical Foundation & Architectural Hardening  
**Target Repository**: `https://github.com/sajjadraad2006-sys/mecha-bot`  
**Git Branch**: `feature/m0-foundation`  
**Status**: **COMPLETE & VERIFIED (0 Failures, 0 Skipped Tests, 100% Quality Gates Passed)**

---

## 1. Executive Summary

- **Project Name & Purpose**: Mecha Bot is a dedicated, production-quality academic companion and study assistant for the undergraduate students of the Mechatronics Engineering Department, College of Engineering, University of Basrah. It is not a generic AI wrapper; it models the academic reality of the curriculum, stage progression, semester calendars, and course authority.
- **Scope Delivered**: Milestone M0 (Technical Foundation only). Zero business logic from M1 (no onboarding state machine, no live curriculum ingestion, no active student dialogs). Pure, robust infrastructure, typed domain models, database schema with migrations, unit/integration test suite, local D1 compatibility harness, and long-polling runner.
- **Zero-Cost Architecture**: Built strictly on zero-cost infrastructure. Enforced at runtime via schema validation (`ALLOW_PAID_AI=false`, `ALLOW_PAID_STORAGE=false`, `ALLOW_BILLING_FALLBACK=false`). Local runtime runs entirely on Node 24 built-in `node:sqlite` and local long-polling. Production architecture is structured for free-tier Cloudflare Workers and D1.
- **Privacy Statement**: Privacy by Architecture + Defense in Depth. Student Telegram IDs, usernames, phone numbers, and emails are strictly excluded from AI prompts and payloads by structural design via the allowlisted `AcademicAiContextDTO`. Backed by secondary defense-in-depth best-effort PII pattern inspection (`assertNoStudentPii`). Machine logs automatically redact all bot tokens, API keys, and sensitive fields.

---

## 2. Verification Matrix

All commands were executed in the project root on Node.js v24.19.0 and pnpm v12.4.1.

| Check / Command      | Expected Outcome                                                     | Actual Outcome                                                                       | Status   |
| :------------------- | :------------------------------------------------------------------- | :----------------------------------------------------------------------------------- | :------- |
| `pnpm lint`          | ESLint passes with 0 errors and 0 warnings                           | 0 errors, 0 warnings across all packages, apps, scripts, and tests                   | **PASS** |
| `pnpm format:check`  | Prettier validates all source files match formatting rules           | All matched files use Prettier code style                                            | **PASS** |
| `pnpm typecheck`     | TypeScript compiler (`tsc --noEmit`) passes with 0 type errors       | Strict typechecking completed with 0 errors across 9 workspaces                      | **PASS** |
| `pnpm test`          | All Vitest test suites execute and pass (0 failed, 0 skipped)        | 15 test files passed, 53 total unit/integration tests passed                         | **PASS** |
| `pnpm test:coverage` | Statement coverage meets or exceeds 80% threshold                    | **84.97%** statements, 79.84% branches, 83.45% functions, 84.97% lines               | **PASS** |
| `pnpm db:migrate`    | Forward-only SQL migrations apply idempotently to SQLite DB          | Migration `0001_initial_schema.sql` applied cleanly with SHA-256 checksum recorded   | **PASS** |
| `pnpm db:seed:test`  | Seeds synthetic test fixtures (`TEST101`, `TEST102`, `TEST402_PROJ`) | Seeded academic years, curriculum versions, courses, offerings, and calendar periods | **PASS** |
| `pnpm db:reset`      | Drops and rebuilds database from scratch via migration runner        | Database reset and reconstructed cleanly with 29 tables                              | **PASS** |
| `pnpm db:compat:d1`  | Wrangler local D1 migration execution without remote connections     | 41 D1 SQL statements executed; smoke test confirmed 29 tables created                | **PASS** |
| `pnpm build`         | Project builds cleanly (`tsc --noEmit`)                              | Completed with code 0 and 0 diagnostics                                              | **PASS** |
| `pnpm verify`        | Master gate running lint, format, typecheck, test, and build         | All verification steps passed in sequence with zero failures                         | **PASS** |

---

## 3. Repository & Package Structure

### Directory Tree

```
mecha-bot/
├── .env.example                  # Validated environment configuration template
├── .github/
│   └── workflows/
│       └── ci.yml                # CI automation for lint, typecheck, tests, D1 compat
├── .gitignore                    # Git exclusions (data, node_modules, keys)
├── .npmrc                        # Package manager config (hoisted linker for Windows/OneDrive)
├── .prettierignore               # Prettier ignore paths
├── .prettierrc                   # Prettier code formatting rules
├── README.md                     # High-level developer documentation
├── apps/
│   └── bot/                      # Long-polling application entry point
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           └── index.ts          # Process lifecycle, graceful shutdown, bot wiring
├── curriculum/
│   └── synthetic-fixtures.json   # Synthetic test curriculum fixtures (TEST101..TEST402)
├── docs/
│   ├── ARCHITECTURE.md           # System architecture, boundaries, zero-cost principles
│   ├── MILESTONES.md             # Complete M0 -> M16 canonical milestone roadmap
│   └── M0_REPORT.md              # Milestone M0 verification and architecture report
├── eslint.config.mjs             # ESLint 9 flat config (TypeScript-ESLint strict)
├── migrations/
│   └── 0001_initial_schema.sql   # Initial SQLite/D1 forward-only schema migration
├── packages/
│   ├── academic/                 # Stage, semester, calendar, pulse, authority models
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── authority.ts      # Contextual RetrievalPolicy and source authority
│   │       ├── calendar.ts       # AcademicCalendarService and week derivation
│   │       ├── course-pulse.ts   # Class progress tracking and student baseline models
│   │       ├── course.ts         # Course vs CourseOffering separation
│   │       ├── evidence.ts       # EvidenceScope and provenance models
│   │       ├── fixtures.ts       # Synthetic curriculum data loaders
│   │       ├── index.ts          # Package public interface exports
│   │       ├── staff.ts          # Faculty course assignment models
│   │       └── stage-semester.ts # 4 stages, 8 semesters validation logic
│   ├── ai/                       # AI abstraction layer, router, schemas, privacy guards
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── fake-provider.ts  # Deterministic fake AI provider for local/test
│   │       ├── index.ts          # Package public interface exports
│   │       ├── interfaces.ts     # AIProvider contracts and tokens
│   │       ├── privacy.ts        # PII inspection and sanitization checks
│   │       ├── router.ts         # Zero-cost AI routing orchestrator
│   │       └── schemas.ts        # Zod validation schemas for AI payloads
│   ├── database/                 # Database connection, repositories, migration runner
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── connection.ts     # IDatabaseConnection interface
│   │       ├── index.ts          # Package public interface exports
│   │       ├── migration-runner.ts # Checksum-validated schema migration runner
│   │       ├── repositories/
│   │       │   ├── academic-repository.ts
│   │       │   ├── audit-repository.ts
│   │       │   ├── event-repository.ts
│   │       │   ├── idempotency-repository.ts
│   │       │   ├── source-repository.ts
│   │       │   └── student-repository.ts
│   │       └── sqlite-connection.ts # Node 24 native node:sqlite connection adapter
│   ├── retrieval/                # Document retrieval and vector/hybrid search interfaces
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── fake-provider.ts  # Deterministic retrieval mock provider
│   │       ├── index.ts          # Package public interface exports
│   │       └── interfaces.ts     # IRetrievalProvider contracts and search filters
│   ├── scheduler/                # Reminder and study schedule abstractions
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts          # Package public interface exports
│   │       └── interfaces.ts     # IScheduler contracts
│   ├── shared/                   # Common utilities: config, logger, datetime, clock, errors
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── clock.ts          # SystemClock and controllable FakeClock
│   │       ├── config.ts         # Zod environment config with zero-cost validation
│   │       ├── datetime.ts       # Local Asia/Baghdad academic calendar date handling
│   │       ├── errors.ts         # Domain error hierarchy
│   │       ├── idempotency.ts    # Telegram update deduplication token generator
│   │       ├── index.ts          # Package public interface exports
│   │       └── logger.ts         # Redacting structured JSON logger
│   └── telegram/                 # grammY bot setup, handlers, and middleware
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── bot.ts            # Bot factory and middleware composition
│           ├── handlers/
│           │   ├── health.ts     # /health diagnostics command
│           │   ├── help.ts       # /help guide command
│           │   └── start.ts      # /start welcome handler
│           ├── index.ts          # Package public interface exports
│           └── middleware/
│               ├── error-boundary.ts # Graceful failure catching and Arabic feedback
│               ├── idempotency.ts    # Telegram update deduplication middleware
│               └── logging.ts        # Inbound update telemetry
├── package.json                  # Monorepo root package.json with verification scripts
├── pnpm-lock.yaml                # Deterministic dependency lockfile
├── pnpm-workspace.yaml           # pnpm monorepo workspace definition
├── scripts/                      # Operational and database administration scripts
│   ├── d1-compat.ts              # Local Wrangler D1 compatibility harness
│   ├── migrate.ts                # Standalone migration script
│   ├── reset-db.ts               # Database drop-and-rebuild script
│   └── seed-test.ts              # Synthetic fixture database seeder
├── tests/                        # 15 Vitest integration and unit test suites (53 tests)
├── tsconfig.base.json            # Shared TypeScript 5.8 base compiler options
├── tsconfig.json                 # Root TypeScript solution project configuration
├── vitest.config.ts              # Vitest test runner configuration with v8 coverage
├── wrangler.toml                 # Cloudflare D1 local configuration file
└── مصادر/                        # Preserved user academic PDF research files
```

### Workspace Dependency Rules

1. `packages/shared`: Zero internal dependencies. Base utility layer.
2. `packages/academic`: Depends only on `shared`. Pure domain logic with no database or external I/O imports.
3. `packages/ai` & `packages/retrieval`: Depend on `shared` and `academic`. Strictly isolated from UI and database layers.
4. `packages/database`: Depends on `shared` and `academic`. Encapsulates `node:sqlite` behind `IDatabaseConnection`. The domain layer never imports `node:sqlite`.
5. `packages/telegram`: Depends on `shared`, `academic`, `database`, and `grammy`.
6. `apps/bot`: Top-level composition root; wires all packages together.

---

## 4. Database & Migrations

### Migration Strategy

- **Forward-Only SQL**: All migrations reside in `migrations/` as numbered, sequential `.sql` files (`0001_initial_schema.sql`). No dynamic ORM generators.
- **Checksum Verification**: The `_migrations` table records `id`, `name`, `applied_at`, and a `SHA-256` checksum of the migration file. Tampered or out-of-order migrations are rejected with `MigrationError`.
- **Database Abstraction**: All database interaction passes through `IDatabaseConnection`. In local development, the Node 24 standard library `node:sqlite` driver executes migrations. In production, Cloudflare D1 executes the identical SQL statements.

### Complete Schema Summary (29 Tables)

1. `_migrations`: Records schema migration history and SHA-256 verification hashes.
2. `academic_years`: Holds academic session ranges (e.g. `2026-2027`), active state, and date boundaries.
3. `curriculum_versions`: Version-controlled syllabus releases (`cv_synthetic_v1`).
4. `courses`: Canonical, offering-independent course definitions (code, name en/ar, credit hours, stage).
5. `course_offerings`: Concrete instances of a course in an academic year and specific program semester (1..8). Supports multi-semester courses (e.g. graduation project in semesters 7 and 8).
6. `topics`: Course topic syllabus breakdown with order index and nominal week.
7. `subtopics`: Granular subtopics within a topic.
8. `topic_prerequisites`: Explicit directed acyclic prerequisite relationships between topics.
9. `course_staff_assignments`: Decouples faculty roster from actual yearly course assignments.
10. `academic_calendar_periods`: Models academic phases (`TEACHING`, `EXAMS`, `BREAK`, `SUMMER_TRAINING`) with stage-scoped applicability (e.g. Stage 1 starting later than senior stages).
11. `course_pulses`: Tracks class/lecturer progress in real-time ("Where has the class reached this week?").
12. `sources`: Registered academic resources (textbooks, slides, past exams, lecture notes).
13. `source_versions`: Version history and format specifications of academic sources.
14. `source_evidence`: Contextual provenance and evidence metadata (`EXACT_COURSE`, `SAME_DEPARTMENT_ARCHIVE`, `SAME_UNIVERSITY_RELATED_COURSE`, `OPEN_ACADEMIC_EQUIVALENT`).
15. `source_chunks`: Text chunks derived from academic sources for future retrieval and embedding.
16. `past_exam_questions`: Historical exam items cataloged by course offering, year, exam type, and verified solutions.
17. `students`: Student profile and academic stage/semester record (Telegram ID, active stage, program semester).
18. `student_course_states`: Tracks student baseline progression per course, supporting mid-semester joiners.
19. `student_study_sessions`: Logs study sessions, active duration, topic focus, and completion status.
20. `student_checkins`: Daily academic check-ins, study mood, confidence ratings, and streak metrics.
21. `student_topic_mastery`: Student self-assessed and quiz-derived topic mastery levels.
22. `timetable_slots`: Weekly timetable schedule slots by stage, section, day of week, and room.
23. `reminders`: Scheduled user notifications and academic study reminders.
24. `quizzes`: Practice quizzes and self-assessment test suites.
25. `quiz_questions`: Individual questions associated with practice quizzes.
26. `quiz_attempts`: Student quiz attempt records, scores, and timestamps.
27. `audit_logs`: Security and administrative audit trail for critical system actions.
28. `event_logs`: Structured application and operational event telemetry.
29. `idempotency_keys`: Telegram update deduplication tokens to prevent duplicate message processing.

### Cloudflare D1 Compatibility Verification

The `scripts/d1-compat.ts` harness executes `0001_initial_schema.sql` directly against a clean, isolated local Cloudflare D1 instance via Wrangler (`wrangler d1 execute DB --local`).

- **Mode**: STRICT LOCAL-ONLY. No `--remote` flag, no Cloudflare account or credentials required.
- **Verification Result**: All 41 SQL statements (table definitions and indexes) executed with zero syntax or engine errors. Smoke query confirmed `total_tables = 29`. Temporary `.wrangler` state cleaned up automatically.

---

## 5. Architectural Decisions & Research Corrections

### 1. Semester & Stage Modeling

- The Mechatronics degree is strictly structured into 4 stages and 8 program semesters:
  - Stage 1: Program Semesters 1 and 2
  - Stage 2: Program Semesters 3 and 4
  - Stage 3: Program Semesters 5 and 6
  - Stage 4: Program Semesters 7 and 8
- Validated via `validateStageSemester(stage, programSemester)`. Computes derived `term_in_stage` (`1 | 2`).
- Separated `Course` from `CourseOffering`. A single course (such as `TEST402_PROJ`) can have multiple offerings across different semesters (e.g. Semester 7 Part 1 and Semester 8 Part 2).

### 2. Academic Time Foundation

- Created `academic_years` and `academic_calendar_periods`.
- Periods include `PRE_SEMESTER`, `TEACHING`, `EXAMS`, `BREAK`, and `SUMMER_TRAINING`.
- Implemented `AcademicCalendarService`:
  - `getCurrentAcademicPeriod(date, stage)`: Retrieves the currently active period, respecting stage-scoped overrides.
  - `getAcademicWeek(date, stage)`: Computes the derived academic week number (1..N) based on teaching start dates. Returns `0` for `PRE_SEMESTER`. Academic week is dynamically derived, never stored as static drifting data.
  - `getNextTeachingDay(date, stage)`: Computes the next valid instructional calendar date.

### 3. Course Pulse & Student Baseline Foundation

- Created `course_pulses` table and domain interface: Records where the lecturer/class actually reached (`current_topic_id`, `actual_teaching_week`, `confidence`, `updated_by`).
- Created `student_course_states`: Supports mid-semester joiners by tracking student-specific entry baselines (`baseline_topic_id`, `baseline_source: SHARED_COURSE_PULSE | STUDENT_CONFIRMED | STUDENT_ENTERED | INFERRED`). A student joining in Week 7 is not treated as starting in Week 1.

### 4. Contextual Source Authority

- Preserved the `SourceAuthority` enum: `OFFICIAL_DEPARTMENT`, `LECTURER_CURRENT`, `OFFICIAL_UOB`, `PAST_EXAM_VERIFIED`, `OPEN_ACADEMIC`, `STUDENT_SUBMITTED`, `UNVERIFIED`.
- Rejected a single global numeric ranking. Authority is contextual.
- Implemented `RetrievalPolicy`: Ranks sources dynamically according to user intent:
  - `EXAM_LOOKUP`: Prioritizes `PAST_EXAM_VERIFIED` > `LECTURER_CURRENT`.
  - `LECTURER_REQUIREMENTS`: Prioritizes `LECTURER_CURRENT` > `OFFICIAL_DEPARTMENT`.
  - `OFFICIAL_IDENTITY`: Prioritizes `OFFICIAL_DEPARTMENT`.
  - `CONCEPT_EXPLANATION`: Prioritizes `LECTURER_CURRENT` > `OFFICIAL_DEPARTMENT` > `OPEN_ACADEMIC`.

### 5. Source Provenance & Evidence Model

- Added `EvidenceScope` classification: `EXACT_COURSE`, `SAME_DEPARTMENT_ARCHIVE`, `SAME_UNIVERSITY_RELATED_COURSE`, `OPEN_ACADEMIC_EQUIVALENT`, `BIBLIOGRAPHIC_ONLY`, `STUDENT_PROVIDED`.
- Created `source_evidence` table storing metadata: `origin_url`, `origin_department`, `origin_university`, `academic_year`, `verified`, and `distribution_allowed`.
- Distinctly separates related University of Basrah materials from official Mechatronics syllabus documents without making unfounded copyright or syllabus equivalency assumptions.

### 6. Course Staff Assignment Model

- Added `course_staff_assignments`: Maps course offerings to faculty members with explicit roles, academic year, and verification status. Decouples general faculty specialization rosters from yearly course allocations.

### 7. D1 Compatibility Harness

- Added Wrangler local D1 verification (`pnpm db:compat:d1`). Isolated and completely local. Runs without cloud network access.

### 8. Time Storage Rules

- Machine timestamps (`created_at`, `updated_at`, audit entries) are stored in UTC (ISO 8601 `YYYY-MM-DDTHH:mm:ss.sssZ`).
- Academic calendar boundaries and student schedules use explicit local calendar dates (`YYYY-MM-DD`) anchored in `Asia/Baghdad` timezone to prevent date-shifting across midnight boundaries.

---

## 6. Testing & Code Quality

### Summary Statistics

- **Total Test Suites**: 15 test files
- **Total Tests Executed**: 53 tests
- **Tests Passed**: 53 (100%)
- **Tests Failed**: 0
- **Tests Skipped**: 0
- **Overall Statement Coverage**: **84.97%**
- **Overall Branch Coverage**: **79.84%**
- **Overall Function Coverage**: **83.45%**

### Test Suite Breakdown

1. `tests/semester-model.test.ts` (5 tests): Stage 1..4, program semester 1..8 validation, derived term in stage, rejection of invalid combinations (e.g. Stage 1 with Semester 3).
2. `tests/course-offering.test.ts` (2 tests): Separation of `Course` and `CourseOffering`; verifies multi-semester course linkage.
3. `tests/calendar-service.test.ts` (5 tests): Calendar period lookups, stage-scoped overrides (Stage 1 starting later than Stage 3), academic week derivation via `FakeClock`, and pre-semester state handling.
4. `tests/course-pulse.test.ts` (2 tests): Creation and validation of `CoursePulse` and `StudentCourseState` for mid-semester joiners.
5. `tests/source-authority.test.ts` (3 tests): Contextual source ranking based on query intent and evidence scope validation.
6. `tests/clock-timezone.test.ts` (4 tests): UTC timestamping vs `Asia/Baghdad` academic date parsing and formatting; verifies day boundary stability.
7. `tests/database.test.ts` (6 tests): Migration runner, SHA-256 verification, repository CRUD, foreign key enforcement, transaction rollback on failure.
8. `tests/ai.test.ts` (5 tests): `FakeAIProvider`, `AIRouter`, Zod schema validation, and PII protection rejection.
9. `tests/retrieval.test.ts` (3 tests): `FakeRetrievalProvider` search by stage/semester, empty query handling, and intent-aware result retrieval.
10. `tests/idempotency.test.ts` (2 tests): Telegram update deduplication token creation, repository key recording, and duplicate rejection.
11. `tests/telegram-handlers.test.ts` (4 tests): `/start`, `/help`, `/health` command handlers with bilingual Arabic/English responses.
12. `tests/logger-security.test.ts` (3 tests): Structured logging, credential redaction (Telegram bot token, API keys), and metadata serialization.
13. `tests/config.test.ts` (5 tests): Environment schema validation, default configuration fallbacks, and paid service restriction enforcement.
14. `tests/fixtures.test.ts` (3 tests): Integrity of synthetic curriculum fixtures (`TEST101`, `TEST102`, `TEST201`, `TEST402_PROJ`).
15. `tests/lifecycle.test.ts` (1 test): Application startup, database connection initialization, migration check, and graceful shutdown sequence.

---

## 7. Zero-Cost & Cloud Independence

1. **Strict Runtime Schema Enforcement**:
   ```typescript
   ALLOW_PAID_AI: z.literal(false).default(false),
   ALLOW_PAID_STORAGE: z.literal(false).default(false),
   ALLOW_BILLING_FALLBACK: z.literal(false).default(false)
   ```
   If any paid flag is set to `true`, the application refuses to start.
2. **Local Development Autonomy**: Runs completely on Windows with zero cloud dependencies:
   - Database: Native Node 24 `node:sqlite`.
   - Bot Interface: Local long-polling via `grammy`.
   - AI & Retrieval: In-memory `FakeAIProvider` and `FakeRetrievalProvider`.
3. **Free-Tier Cloud Architecture**: Designed to deploy seamlessly to Cloudflare Workers free plan (100,000 requests/day), Cloudflare D1 free plan (5GB storage, 5M reads/day), and free-tier AI endpoints (Groq free tier / Google Gemini free tier) when promoted in later milestones.

---

## 8. Privacy & Security

1. **Privacy by Architecture (Primary Layer)**: Outgoing AI context is encapsulated strictly within the allowlisted `AcademicAiContextDTO`. By architectural design, identity fields (`telegramUserId`, `chatId`, `username`, `phone`, `email`, `studentId`, `displayName`) are not accepted by the builder or schema. Application code never forwards user profile records or Telegram `Context` objects to AI providers.
2. **Defense-in-Depth Best-Effort PII Inspection (Secondary Layer)**: `assertNoStudentPii(data)` and `sanitizeAiPrompt(text)` run as an automated secondary safety net against accidental identifiers in user question text. They inspect for:
   - Telegram user IDs (`user_id: 12345678`)
   - Telegram usernames (`@username`)
   - Iraqi phone numbers (`+964...`, `077...`, `078...`)
   - Email addresses
3. **Log Redaction**: `Logger` sanitizes all log outputs and structured metadata. Replaces bot tokens (e.g. `1234567890:...`), bearer tokens, and API keys with `[REDACTED]`.
4. **Idempotency Defense**: Incoming Telegram updates are hashed into unique idempotency keys stored in `idempotency_keys` table to guarantee that retried Telegram updates are processed exactly once.

---

## 9. Runtime & Deployment Preparation

### Running the Local Development Bot

1. Ensure Node.js 24 and pnpm are installed.
2. Clone repository and install dependencies:
   ```bash
   pnpm install
   ```
3. Copy environment configuration:
   ```bash
   cp .env.example .env
   ```
   Configure `TELEGRAM_BOT_TOKEN=<your-dev-bot-token>`.
4. Initialize database:
   ```bash
   pnpm db:migrate
   pnpm db:seed:test
   ```
5. Start long-polling bot:
   ```bash
   pnpm bot:dev
   ```

### Graceful Shutdown

The application handles `SIGINT` and `SIGTERM`. When received, the runner halts the Telegram polling loop, terminates active middleware pipelines, closes the SQLite database connection, and exits with code 0.

---

## 10. Lessons Learned & Observations

1. **Windows & OneDrive Interoperability**: When developing on a Windows host within a OneDrive-synced folder, pnpm's default symlink-isolated virtual store can result in unpopulated nested directories due to Windows cloud-filter reparse points. Adding `node-linker=hoisted` in `.npmrc` cleanly resolves this without affecting monorepo functionality.
2. **Node 24 Built-In SQLite**: Using `node:sqlite` entirely eliminates native compilation dependencies (Visual Studio C++ Build Tools, Python) on Windows, providing instantaneous test execution and zero-dependency database operations.
3. **Local D1 Smoke Testing**: Executing Wrangler against local D1 with `--file` avoids Windows command shell quote escaping issues and guarantees 100% SQL dialect compatibility before deploying to Cloudflare edge.

---

## 11. Transition to M1 Readiness

### Hard Milestone Boundary

**Milestone M0 is complete. Milestone M1 has NOT been started.**

### M1 Readiness Checklist

- [x] 29 database tables migrated and validated on SQLite and Cloudflare D1.
- [x] Academic domain entities (Stage, Program Semester, Calendar, Course Pulse, Evidence Scope, Authority) implemented and tested.
- [x] Repository abstractions tested with transaction rollback and foreign key verification.
- [x] grammY bot factory, bilingual error boundary, logging, and idempotency middleware operational.
- [x] Fake AI and Retrieval providers available for offline test verification.
- [x] CI workflow configured for automated lint, typecheck, format, test, and D1 compatibility.

The project is fully prepared for Milestone M1 (Student Onboarding & Course Selection Flow) upon user authorization.
