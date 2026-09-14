# Mecha Bot — Cross-Domain Wiring Architecture (@mecha-bot/wiring)

## 1. Mission & Architectural Role

The `@mecha-bot/wiring` package is the central orchestration and adapter layer of Mecha Bot. It connects the verified foundation domain packages (M1 through M12, excluding M8 AI Brain) into a unified application architecture while strictly preserving their independent domain boundaries and ownership models.

### Package Boundaries & Limits

- **Orchestration / Adapter Layer Only**: `@mecha-bot/wiring` is NOT a "God package" and MUST NOT become a new domain.
- **Domain Truth Preservation**: Wiring does NOT own academic truth (M2), student progress truth (M9), timetable truth (M3), reminder truth (M4), search truth (M7), distribution policy (M12), or admin authorization policy (M11).
- **Responsibilities**:
  1. Translates contracts between domains.
  2. Coordinates domain operations.
  3. Enforces cross-domain safety invariants.
  4. Exposes high-level use-cases to user interfaces (Telegram, Web, CLI).

---

## 2. Core Product Invariant

> **"Mecha Bot should infer, suggest, and confirm — never silently assume."**  
> **باللهجة العراقية: "يستنتج، يقترح، ويسأل للتأكيد؛ ما يفرض."**

In Mecha Bot:

1. Calendar positions are strictly `EXPECTED`.
2. Class progress signals are `INFERRED` or `VERIFIED` (from course pulse).
3. Student understanding is `CONFIRMED_BY_STUDENT` **strictly and exclusively** when the student explicitly confirms it via user action.
4. Background study sessions or check-in signals record evidence signals; they NEVER silently declare mastery or mutate student position.

---

## 3. The 6 Cross-Domain Bridges

```
                      +-----------------------------+
                      |       @mecha-bot/wiring     |
                      |        (MechaBotApp)        |
                      +--------------+--------------+
                                     |
    +-----------------+--------------+--------------+-----------------+
    |                 |              |              |                 |
[Bridge A]       [Bridge B]     [Bridge C]     [Bridge D]        [Bridge E/F]
Companion         Ingestion       Search        Timetable           Exams /
   to                to             to             to                Admin
Navigator          Search      Distribution     Scheduler          Scheduler /
(M5 -> M9)       (M6 -> M7)    (M7 -> M12)      (M3 -> M4)          Academic
```

### Bridge A: Companion (M5) -> Navigator (M9)

- **Source**: M5 `ProgressSignal` (`SELF_RATING`, `QUIZ_RESULT`, `STUDY_SESSION`, `REPEATED_QUESTION`, `MANUAL_STUDENT_STATUS`) and `StudySession`.
- **Target**: M9 `StudentLearningSignal` and `StudyNavigatorService`.
- **Safety Invariant**:
  - `forwardCompanionSignalToNavigator()` maps session and check-in signals to learning signals for diagnosis.
  - `forwardCompletedSessionToNavigator()` records study time evidence, but NEVER promotes `StudentCoursePosition` to `CONFIRMED_BY_STUDENT`.
  - `confirmStudentCoursePosition()` is the ONLY entry point that sets `status: 'CONFIRMED_BY_STUDENT'` and `source: 'STUDENT'`.

### Bridge B: Ingestion (M6) -> Search (M7)

- **Source**: M6 `M6Manifest` and `M6ExtractedDocument`.
- **Target**: M7 `SearchEngine` (BM25 Index).
- **Safety Invariant**:
  - Converts ingested document pages into search chunks via `adaptM6ToSearchDocuments()`.
  - Documents with `permissions.canSearch === false` or failed extraction status are strictly rejected from entering the search index.

### Bridge C: Search (M7) -> Distribution (M12)

- **Source**: M7 `SearchResult` hits.
- **Target**: M12 `FileDistributionService` (`DeliveryDecision`).
- **Safety Invariant**:
  - Independent permission: `canSearch !== canDistribute`.
  - Fast-path check: If `searchResult.canDistribute === false`, delivery is immediately blocked with `BLOCKED_POLICY`.
  - Catalog check: Prohibited files (e.g. `SOLUTION_MANUAL` or unverified external URLs) are blocked under conservative distribution policy (`status: 'BLOCKED_POLICY'`). Authorized materials return `READY_TELEGRAM_FILE` or `READY_EXTERNAL_LINK`.

### Bridge D: Timetable (M3) -> Scheduler (M4)

- **Source**: M3 `TimetableSlot`s from `TimetableService`.
- **Target**: M4 `ReminderSchedulerService`.
- **Safety Invariant**:
  - Suppresses slots marked with `sourceStatus: 'OUTDATED'`.
  - Wall-clock lecture times are translated to UTC based on the official departmental timezone (`Asia/Baghdad`).
  - Automated timetable reminders pass `isExplicitlyRequested: false`, allowing the scheduler to evaluate quiet hours (23:00 to 07:00) and return `DEFER_UNTIL_QUIET_HOURS_END` instead of waking students.

### Bridge E: Exams & Academic Events (M10) -> Scheduler (M4)

- **Source**: M10 `AcademicEvent` (quizzes, midterms, finals, deadlines).
- **Target**: M4 `ReminderSchedulerService`.
- **Safety Invariant**:
  - Reminders are calculated using canonical academic relative minute offsets (`-1440` for 24h, `-120` for 2h prior).
  - **Unconfirmed Inferred Events**: If `confirmationStatus === 'INFERRED_UNCONFIRMED'`, `canScheduleAcademicReminder()` strictly returns `false`. The bridge returns `requiresStudentConfirmation: true` with 0 active reminders scheduled until the student confirms the event.

### Bridge F: Admin Moderation (M11) -> Academic Semantic Safety (M2/M12)

- **Source**: M11 `AdminService` review item approvals (`ReviewStatus: 'APPROVED'`).
- **Target**: Academic core entities and distribution catalog.
- **Critical Semantic Safety Rule**:
  > **ADMIN APPROVED != ACADEMICALLY VERIFIED**
  > An administrative workflow approval indicates process acceptance, NOT academic truth or evidence authority.
- **Regression Guard**:
  - An admin approval CANNOT mutate:
    1. `sourceAuthority` (e.g., `STUDENT` never becomes `FACULTY` or `OFFICIAL` merely because approved).
    2. `verificationStatus` (e.g., `RAW` never becomes `VERIFIED` without independent academic evidence verification).
    3. `evidenceScope` (e.g., `SECTION` never becomes `EXACT_COURSE`).
  - Regression tested by `assertAdminApprovalDoesNotMutateAcademicEvidence()`.

---

## 4. Telegram Boundary Architecture

The Telegram integration package (`packages/telegram`) implements a strict hexagonal adapter boundary:

```
Telegram User / Context (ctx.from.id)
                ↓
    TelegramAppBridge (Adapter)
  [resolves studentKey: "student_<tgId>"]
                ↓
  MechaBotApp (Application Layer)
  [studentKey: string, courseCode: string]
                ↓
   Domain Services (M2-M12)
                ↓
       Application Response
                ↓
  TelegramAppBridge (Renderer)
  [Formats Arabic Telegram UI & Keyboards]
```

### Boundary Rules

1. **No GrammY Types in Domain**: GrammY `Context`, `Update`, or `InlineKeyboard` objects NEVER cross into `@mecha-bot/wiring` or any domain package.
2. **Opaque Student Identifiers**: Domain services and wiring operate strictly on opaque `studentKey: string`. Telegram User IDs and Chat IDs are never stored in academic entities or navigator records.
3. **Localized Arabic Rendering**: The bridge formats all domain outputs into natural Iraqi / academic Arabic:
   - "وين وصلنا؟" prompt: _"📍 متابعة مادة (MCT111)... بوت ميكا يقترح ويسألك للتأكيد: هل وصلتم لهذا الموضوع فعلياً في محاضراتكم؟"_
   - "أني ضايع" diagnosis: _"🧭 تشخيص الاستدراك الدراسي... خطوات خطة الاستدراك المقترحة..."_
   - Explicit confirmation: _"✅ تم تأكيد موضعك الدراسي في مادة (MCT211) عند الموضوع (laplace-transforms) بنجاح!"_

---

## 5. Five Core Product Safety Cases

All five safety cases are verified by automated regression tests in `tests/cross-domain-wiring.test.ts`:

1. **Safety Case 1 (Calendar is EXPECTED)**: Academic calendar positions always report `status: 'EXPECTED'` and always set `needsStudentConfirmation: true`.
2. **Safety Case 2 (Pulse is Independent)**: Shared class pulse positions (`VERIFIED` or `INFERRED`) remain independent and do not collapse into or overwrite individual student progress.
3. **Safety Case 3 (Confirmation Strictness)**: A student's position becomes `CONFIRMED_BY_STUDENT` ONLY when the student invokes `confirmPosition()`. System inference, background sessions, and calendar updates are prohibited from promoting positions.
4. **Safety Case 4 (MCT124 Conflict Explicit)**: The curriculum conflict in course `MCT124` is explicitly surfaced (`hasConflict: true`, `status: 'CONFLICTING'`, `resolutionStatus: 'UNRESOLVED'`) with an Arabic alert, never silently guessed or auto-resolved.
5. **Safety Case 5 (P4MCT Identity-Only Explicit)**: Course `P4MCT` is recognized as `topicMapStatus: 'IDENTITY_ONLY'` with 0 topics. The system alerts the student rather than hallucinating topics.

---

## 6. Zero-Cost Infrastructure Verification

In accordance with the Mecha Bot Zero-Money constraint:

- **Search**: BM25 deterministic lexical index running locally in memory (0 vector database costs, 0 embedding API calls).
- **Storage**: Local SQLite database with strict Cloudflare D1 compatibility verified across all 29 schema tables (0 paid serverless costs).
- **Curriculum & Navigation**: Deterministic DAG traversal across 55 canonical courses and 56 offerings (0 LLM inference costs).
- **Scheduler**: Pure in-memory / local SQLite priority queue running on standard Node/Wrangler workers (0 paid job scheduler services).
