# Architecture Specification: Mecha Bot

## 1. System Overview

**Mecha Bot** is a dedicated academic assistant for the **Mechatronics Engineering Department, University of Basrah**. It is engineered as a zero-cost, local-first, privacy-preserving system designed to assist undergraduate students across all four academic stages.

```
                          ┌─────────────────────────────┐
                          │   Telegram Messaging Client │
                          └──────────────┬──────────────┘
                                         │ (HTTPS / Long Polling)
                                         ▼
                          ┌─────────────────────────────┐
                          │    @mecha-bot/telegram      │
                          │   (grammY Handlers & MW)    │
                          └──────────────┬──────────────┘
                                         │
       ┌──────────────────┬──────────────┼─────────────────┬──────────────────┐
       │                  │              │                 │                  │
       ▼                  ▼              ▼                 ▼                  ▼
┌──────────────┐   ┌──────────────┐ ┌──────────────┐ ┌──────────────┐  ┌──────────────┐
│  @mecha-bot/ │   │  @mecha-bot/ │ │  @mecha-bot/ │ │  @mecha-bot/ │  │  @mecha-bot/ │
│   academic   │   │      ai      │ │  retrieval   │ │  scheduler   │  │    shared    │
└──────┬───────┘   └──────┬───────┘ └──────┬───────┘ └──────┬───────┘  └──────┬───────┘
       │                  │              │                  │                 │
       └──────────────────┴──────────────┼──────────────────┴─────────────────┘
                                         ▼
                          ┌─────────────────────────────┐
                          │    @mecha-bot/database      │
                          │  (Repositories & Migrations)│
                          └──────────────┬──────────────┘
                                         │
                     ┌───────────────────┴───────────────────┐
                     ▼                                       ▼
       ┌───────────────────────────┐           ┌───────────────────────────┐
       │   Local: SQLite Engine    │           │  Prod: Cloudflare D1      │
       │   (node:sqlite built-in)  │           │  (Edge Distributed SQL)   │
       └───────────────────────────┘           └───────────────────────────┘
```

---

## 2. Core Architectural Boundaries

### 2.1 Zero-Cost Principle

1. The project must operate without any financial cost.
2. No paid cloud resources, credit-card required infrastructure, or automated billing fallbacks are allowed.
3. Strict environment schema validation enforces `ALLOW_PAID_AI=false`, `ALLOW_PAID_STORAGE=false`, and `ALLOW_BILLING_FALLBACK=false`.
4. All external providers are abstracted behind pure interfaces with zero-cost implementations (`node:sqlite` locally, free tier Cloudflare Workers / D1 in production, free tier AI routing).

### 2.2 Privacy by Architecture + Defense in Depth

1. **Structural Isolation (Primary Guard)**: AI interfaces accept ONLY an allowlisted, narrow `AcademicAiContextDTO` (`stage`, `programSemester`, `courseCode`, `topic`, `studentQuestion`, `retrievedExcerpts`, `academicPreferences`).
2. **Prohibited Identity Metadata**: `telegramUserId`, `chatId`, `username`, `phone`, `email`, `studentId`, and `displayName` are strictly excluded from the AI context DTO schema and rejected by validation. Application code never passes `StudentProfile` or Telegram `Context` to AI services.
3. **Defense-in-Depth Secondary Guard**: Best-effort PII detection (`assertNoStudentPii`) and regex redaction (`sanitizeAiPrompt`) inspect outgoing payloads as a secondary safety net against accidental identifiers embedded in free-text questions. Rather than claiming absolute guarantees, privacy is enforced through architectural data boundaries backed by multi-layered defensive validation.

### 2.3 Layered Monorepo Architecture

- **`apps/bot`**: Application runtime entry point, wireup, environment loading, and long polling lifecycle.
- **`packages/shared`**: Cross-cutting primitives: Configuration, Clock, Date-time utilities, Structured Logger, Domain Errors, and Idempotency contracts.
- **`packages/academic`**: Domain models for the 4 stages, 8 program semesters, course catalog, course offerings, academic calendar service, course pulse, and contextual source authority.
- **`packages/database`**: SQLite/D1 database connection abstractions, file-based migration runner, and domain repositories.
- **`packages/ai`**: AIProvider contracts, AIRouter with failover sequence, Zod structured response schemas, and FakeAIProvider.
- **`packages/retrieval`**: RetrievalProvider contracts, contextual RetrievalPolicy, and FakeRetrievalProvider.
- **`packages/scheduler`**: Scheduler and reminder interfaces with UTC timestamps and idempotency keys.
- **`packages/telegram`**: grammY bot setup, `/start`, `/help`, `/health` command handlers, error boundary, logging, and idempotency deduplication middleware.

---

## 3. Academic Domain Model

### 3.1 4 Stages & 8 Program Semesters

The degree program is organized into 4 undergraduate stages and 8 program semesters:

- **Stage 1**: Program Semesters 1 and 2
- **Stage 2**: Program Semesters 3 and 4
- **Stage 3**: Program Semesters 5 and 6
- **Stage 4**: Program Semesters 7 and 8

`validateStageSemester(stage, programSemester)` guarantees that invalid combinations (e.g. Stage 2 with Semester 1) are rejected at the domain boundary.

### 3.2 Course vs. CourseOffering Separation

- A **`Course`** represents the timeless academic subject (e.g., `TEST402_PROJ` - Graduation Project).
- A **`CourseOffering`** represents a specific delivery of that course during an academic year and program semester.
- This allows multi-semester projects (such as senior design projects spanning semesters 7 and 8) or repeated offerings across years to share the same course identity without duplication.

### 3.3 Academic Calendar & Week Derivation

- Calendar periods (`academic_calendar_periods`) support stage scoping (`stage_scope: 1..4` or `NULL` for university-wide applicability).
- In the University of Basrah, Stage 1 teaching often begins later than upper stages (Stages 2–4). The `AcademicCalendarService` respects this by preferring stage-specific periods over generic ones.
- Academic teaching weeks are **dynamically derived** from local calendar bounds (`calculateAcademicWeek`), preventing drift caused by static counter fields.
- Local calendar dates (`YYYY-MM-DD`) are modeled separately from UTC timestamps to eliminate timezone rollover errors.
- Weekend handling recognizes Friday and Saturday as non-teaching days in Iraq.

### 3.4 Course Pulse & Student Mid-Semester Baseline

- **`course_pulses`**: Records where the class has actually reached (current teaching week, active topic, progress notes, and confidence status).
- **`student_course_states`**: Records individual student baseline upon joining mid-semester (`baseline_source`, `baseline_confidence`), preventing the system from treating a student joining in week 7 as starting from week 1.

### 3.5 Contextual Source Authority & Evidence Provenance

Source authority is not represented as a single hardcoded numeric hierarchy. Authority is contextual:

- **`EXAM_LOOKUP`**: `PAST_EXAM_VERIFIED` > `LECTURER_CURRENT` > `OFFICIAL_DEPARTMENT` > `OFFICIAL_UOB`...
- **`LECTURER_REQUIREMENTS`**: `LECTURER_CURRENT` > `OFFICIAL_DEPARTMENT` > `OFFICIAL_UOB`...
- **`COURSE_IDENTITY`**: `OFFICIAL_DEPARTMENT` > `OFFICIAL_UOB` > `LECTURER_CURRENT`...
- **`CONCEPT_EXPLANATION`**: `LECTURER_CURRENT` > `OFFICIAL_DEPARTMENT` > `OPEN_ACADEMIC`...

Source evidence records (`source_evidence`) capture origin URL, university, department, academic year, and `evidence_scope` (`EXACT_COURSE`, `SAME_DEPARTMENT_ARCHIVE`, `SAME_UNIVERSITY_RELATED_COURSE`, `OPEN_ACADEMIC_EQUIVALENT`, `BIBLIOGRAPHIC_ONLY`, `STUDENT_PROVIDED`).

---

## 4. Transport, Idempotency & Error Handling

### 4.1 Telegram Update Idempotency

Duplicate updates from Telegram are detected and filtered via `IdempotencyRepository` (`idempotent_updates` table) and `createIdempotencyMiddleware`. Once processed, duplicate update IDs are safely skipped.

### 4.2 Error Boundary

All handler execution is wrapped in `createErrorBoundaryMiddleware`. Uncaught exceptions are logged with full structured error context, while the student receives a polite Arabic and English error notice. Internal stack traces are never exposed to users.

### 4.3 Log Sanitization

The structured logger automatically redacts Telegram bot tokens (e.g. `1234567890:AA...`) and sensitive keys (`apiKey`, `password`, `secret`, `authorization`, `credentials`) to prevent credential leaks.
