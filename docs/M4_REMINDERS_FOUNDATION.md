# M4A — Reminder & Timer Domain Foundation

## 1. Overview & Architecture

Milestone **M4A** implements the deterministic reminder and timer domain engine for Mecha Bot (University of Basrah — Department of Mechatronics Engineering).

M4A focuses strictly on the **domain engine**, without coupling to persistent database queues, Cloudflare cron triggers, or Telegram delivery loops.

### Core Product Rule:

```
infer -> suggest -> confirm, never silently assume
```

- Inferred academic events (e.g. from lecturer syllabus scans or unconfirmed announcements) **never** create confirmed active reminders automatically.
- Any attempt to schedule an active reminder from an `INFERRED_UNCONFIRMED` source is rejected by the domain engine until confirmed by the student or department administration.
- Explicit student requests (e.g. _"ذكرني بعد 15 دقيقة"_) are treated as `STUDENT_CONFIRMED` or `STUDENT_ENTERED`.

---

## 2. Domain Models

All domain types are located in `packages/scheduler/src/types.ts`.

### Reminder Entity

| Field                    | Type                 | Description                                                                                       |
| :----------------------- | :------------------- | :------------------------------------------------------------------------------------------------ |
| `id`                     | `string`             | Unique reminder ID (`rem_<timestamp>_<rand>`)                                                     |
| `userKey`                | `string`             | Student identifier / Telegram user ID                                                             |
| `kind`                   | `ReminderKind`       | `STUDY`, `QUIZ`, `EXAM`, `ASSIGNMENT`, `DEADLINE`, `BREAK_TIMER`, `LECTURE`, `GENERAL`            |
| `title`                  | `string`             | Descriptive title (e.g. _"استراحة 15 دقيقة"_, _"كويز أنظمة السيطرة"_)                             |
| `description`            | `string?`            | Optional detailed context                                                                         |
| `dueAt`                  | `string`             | Canonical UTC ISO 8601 timestamp                                                                  |
| `timezone`               | `string`             | Academic display timezone (default: `Asia/Baghdad`)                                               |
| `status`                 | `ReminderStatus`     | `SCHEDULED`, `DELIVERED`, `COMPLETED`, `CANCELLED`, `EXPIRED`                                     |
| `sourceType`             | `ReminderSourceType` | `STUDENT_CONFIRMED`, `STUDENT_ENTERED`, `ADMIN_ENTERED`, `SYSTEM_DERIVED`, `INFERRED_UNCONFIRMED` |
| `relatedCourseCode`      | `string?`            | e.g. `MCT314`                                                                                     |
| `relatedAcademicEventId` | `string?`            | Link to canonical academic event                                                                  |
| `recurrence`             | `RecurrenceRule?`    | Optional recurrence configuration                                                                 |
| `idempotencyKey`         | `string?`            | Deduplication fingerprint                                                                         |
| `createdAt`              | `string`             | UTC ISO timestamp                                                                                 |
| `completedAt`            | `string?`            | Timestamp when student completed task                                                             |
| `cancelledAt`            | `string?`            | Timestamp when student cancelled reminder                                                         |
| `deliveredAt`            | `string?`            | Timestamp when notification was delivered                                                         |

---

## 3. Dedicated Timers & Relative Scheduling

### Break & Study Timers

Provides direct, deterministic paths for:

- 15-minute break timers (`kind: 'BREAK_TIMER'`)
- 25-minute study timers (`kind: 'STUDY'`)
- Custom student timers

```typescript
const timer = service.createTimer({
  userKey: 'student_123',
  kind: 'BREAK_TIMER',
  durationMinutes: 15,
});
// Due at exactly now + 15m in UTC
```

### Relative Scheduling

`scheduleAfter({ durationMinutes: 120, ... })` computes exact timestamps via `clock.nowEpochMs() + durationMinutes * 60000`. Rejects non-positive or NaN durations.

---

## 4. Academic Reminder Offsets

Confirmed academic events generate reminder candidates using relative minute offsets:

- `DEFAULT_ACADEMIC_REMINDER_OFFSETS_MINUTES`:
  - `-1440` minutes (24 hours / 1 day before event)
  - `-120` minutes (2 hours before event)

```typescript
const reminderTimes = buildReminderTimes('2026-10-20T07:00:00.000Z', [-1440, -120]);
// Produces sorted candidate timestamps: 1 day prior and 2 hours prior
```

---

## 5. Timezone Semantics (`Asia/Baghdad`)

- **Internal Storage**: All timestamps (`dueAt`, `createdAt`, `deliveredAt`) are strictly UTC ISO 8601.
- **Academic Wall-Clock Calculations**: Evaluated in `Asia/Baghdad` (UTC+3, no daylight saving time since 2008).
- **Date Boundary Safety**: Wall-clock midnight in Baghdad (00:00) corresponds to 21:00 UTC of the preceding day.
- **Zero Local Machine Drift**: All scheduling uses `@mecha-bot/shared` clocks (`FakeClock` in tests, `SystemClock` in runtime).

---

## 6. Quiet Hours Engine

Configured via `QuietHoursConfig` (e.g. `23:00` to `07:00` Baghdad time).

When evaluating a reminder due time falling within quiet hours:

1. **Never Silently Deleted**: Reminders are never dropped.
2. **Explicit Student Request Preserved**: If the student explicitly requested 02:00 AM, the exact requested time is retained, and the evaluation returns `REQUIRES_POLICY_DECISION`.
3. **Automated Reminders Deferred**: System-generated reminders are assigned `DEFER_UNTIL_QUIET_HOURS_END` with `suggestedDueAt` set to 07:00 AM (end of quiet hours).
4. **Urgent Alerts Permitted**: Urgent academic alerts receive `ALLOW_URGENT`.

| Decision                      | Meaning                                                            |
| :---------------------------- | :----------------------------------------------------------------- |
| `DELIVER_NOW`                 | Time is outside quiet hours or quiet hours disabled                |
| `DEFER_UNTIL_QUIET_HOURS_END` | Non-urgent automated reminder deferred to morning                  |
| `ALLOW_URGENT`                | Urgent notification delivered despite quiet hours                  |
| `REQUIRES_POLICY_DECISION`    | Student explicitly requested this time; requires user confirmation |

---

## 7. Recurrence Engine

Supports deterministic recurrence rules:

- `DAILY`: Triggers every day at the specified wall-clock time in `Asia/Baghdad`.
- `WEEKLY`: Triggers on the specified day of the week.
- `SELECTED_WEEKDAYS`: Triggers on a chosen set of weekdays.
  - Specifically supports the Iraqi university week: `['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY']`, skipping Friday and Saturday.

Safely computes next occurrences across month and year boundaries without drift.

---

## 8. Overdue & Process Restart Handling

When Mecha Bot restarts or recovers from offline status, pending scheduled reminders are evaluated:

```
diffMinutes = (now - dueAt) / 60000
```

- **`DUE`**: Overdue by $\le 1$ minute (due right now).
- **`OVERDUE_RECENT`**: Past due within configurable grace window (default: $\le 30$ minutes). These should be delivered immediately with a contextual note.
- **`EXPIRED`**: Past due beyond grace window ($> 30$ minutes). Should be marked `EXPIRED` to avoid obsolete alert spam.

---

## 9. Idempotency & Deduplication

Fingerprints are computed deterministically:

```
sha256(userKey | kind | title | dueAtUtc | relatedAcademicEventId).slice(0, 32)
```

Duplicate submission of the same event and due time returns the existing record without creating duplicate reminders.

---

## 10. Student Preference Modes

Models student notification volume preferences without judgmental semantics:

- **`QUIET`**: Only important academic deadlines and manually requested timers. Zero automated suggestions.
- **`BALANCED`**: Standard academic reminders (up to 3 daily suggestions).
- **`ALL_IN`**: Comprehensive study companion (up to 10 daily suggestions, regular check-ins).

---

## 11. Boundaries & What M4A Does NOT Implement

M4A deliberately does **not** implement:

1. Telegram Bot API message dispatch (`bot.api.sendMessage`).
2. Cloudflare Cron triggers or persistent background worker loops.
3. Natural language NLP parsing (future AI / prompt layers will map user phrases to domain APIs).
4. Database migrations (M0 schema already includes reminder foundations; M4A uses pure domain interfaces with `InMemoryReminderRepository`).

---

## 12. Future Integration Roadmap

- **Milestone M3 (Timetable Foundation)**: Timetable lecture periods will link to the recurrence engine for automatic lecture alerts.
- **Milestone M4 Full Integration**: Connects `ReminderSchedulerService` to SQLite/D1 persistent storage and Telegram notification dispatch with interactive inline snooze buttons.
- **Milestone M5 (Daily Academic Companion)**: Daily check-in loops (Sunday–Thursday 08:30) will use the `SELECTED_WEEKDAYS` recurrence engine.
