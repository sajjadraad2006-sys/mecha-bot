# Milestone 13: Student Dashboard Foundation (`@mecha-bot/dashboard`)

## Overview

The **Student Dashboard** (`packages/dashboard/`) is Mecha Bot's unified academic synthesis and mastery analytics engine. It deterministically aggregates academic progress, course topic mastery, dynamic timetable schedules, reminders, exams/quiz attempts, and study habit streaks into a scannable, natural Iraqi Arabic view for Telegram.

The dashboard operates under strict adherence to the **7 Sacred Domain Invariants** and a **Zero-Cost Invariant** (`ALLOW_PAID_AI = false`).

---

## Architectural Principles & Invariant Guardrails

### 1. Separation of Expected vs Confirmed Mastery (`EXPECTED != CONFIRMED_BY_STUDENT`)

- **Calendar Expected Mastery**: Pure function of the current dynamic academic week derived from `AcademicCalendarService`.
- **Confirmed Student Mastery**: Derived **solely** from student-confirmed topic positions stored in `StudyNavigatorService`.
- **No Conflation**: The dashboard presents both metrics distinctly:
  - `إنجازك الفعلي:` Percentage of verified topics completed by the student.
  - `المتوقع بالتقويم:` Percentage expected according to the academic calendar week.
  - The two metrics are never averaged or combined into a single misleading progress figure.

### 2. Anomaly Course Handling

- **MCT124 (Logic Circuit & Microcontroller Conflict)**:
  - Marked with `hasConflict: true`.
  - `confirmedMasteryPercentage = null` and `calendarExpectedPercentage = null`.
  - Surfaces explicit warning: `⚠️ تضارب منهجي (غير محلول): هذا المقرر يحتوي تضارباً بين وثيقتين رسميتين`.
  - Excluded from the semester-wide numeric mastery average to prevent mathematical pollution.
- **P4MCT (Graduation Project Identity Only)**:
  - Marked with `isIdentityOnly: true`.
  - `confirmedMasteryPercentage = null` and `calendarExpectedPercentage = null`.
  - Surfaces badge: `ℹ️ معرّف بالهوية فقط`.
  - Excluded from numeric mastery average; topic-level breakdown is suppressed.

### 3. Study Companion Metrics (`INFERRED != CONFIRMED`)

- Tracks consecutive study days (`currentStudyDayStreak`), session counts over 7 and 30 days, total study minutes, and active session status.
- Companion check-ins and pulse inferences remain strictly separated from formal academic confirmation.

### 4. Zero Cost & Complete Determinism

- 100% pure computational queries across domain services (`AcademicCoreDataset`, `CalendarService`, `NavigatorService`, `CompanionService`, `ExamsService`, `TimetableService`, `ReminderSchedulerService`).
- Zero LLM tokens consumed; no external paid APIs.

### 5. Privacy & Zero Identity Leakage

- Operates strictly on opaque, hashed `studentKey` identifiers.
- Telegram `chat.id` and `user.id` remain isolated within `packages/telegram/src/application-bridge.ts`.

---

## Package Structure

```
packages/dashboard/
├── package.json          # @mecha-bot/dashboard (workspace dependency)
├── tsconfig.json         # Extends ../../tsconfig.base.json
└── src/
    ├── types.ts          # Core DTOs (CourseMasteryStatus, AcademicProgressMetrics, StudentDashboardSummary)
    ├── metrics.ts        # Pure calculation functions (calculateCourseMastery, calculateAcademicProgress)
    ├── service.ts        # DashboardService aggregator across all domain services
    └── index.ts          # Public barrel exports
```

---

## Telegram Presentation Layer (Iraqi Arabic)

The dashboard is accessible via:

- `/dashboard` command
- `📊 لوحة التحكم` button on the main persistent menu
- `m:dashboard` inline callback query

Key view elements:

1. **Academic Summary**: Current stage, semester, and dynamic academic week.
2. **Overall Progress Comparison**: Distinct bars for confirmed vs expected progress.
3. **Course Status Cards**: Per-course breakdown with status badges (`✅ متقدم`, `🟢 مستقر`, `⚠️ متأخر`, `⚠️ تضارب منهجي`).
4. **Study Activity**: Streak counter, total study hours, active session indicator.
5. **Quick Action Keyboards**: Instant navigation to Navigator (`🧭 متتبع المواد`), Companion (`⏱️ جلسات الدراسة`), Exams (`📝 الامتحانات`), or Timetable (`📅 الجدول`).

---

## Test Verification Matrix

| Test Suite                                   | Coverage                                                                                               | Tests Passed |
| :------------------------------------------- | :----------------------------------------------------------------------------------------------------- | :----------- |
| `tests/dashboard-domain.test.ts`             | Unit tests for pure metrics, streak calculation, MCT124/P4MCT anomalies, and service aggregation       | 10 / 10      |
| `tests/dashboard-wiring-integration.test.ts` | Integration tests for `MechaBotApp`, bridge PII isolation, Iraqi Arabic rendering, and router commands | 6 / 6        |
