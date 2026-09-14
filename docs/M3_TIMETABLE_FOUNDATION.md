# M3A Timetable Domain Foundation

**Milestone**: M3A — Pure Timetable Domain Engine  
**Package**: `@mecha-bot/timetable` (`packages/timetable`)  
**Status**: Completed  
**Base Commit**: `107d4fb`  
**Timezone Reference**: `Asia/Baghdad` (UTC+3)

---

## 1. Executive Summary

Milestone **M3A** implements a pure, deterministic in-memory timetable domain foundation for Mecha Bot. Built in parallel with M1 (Student Onboarding) and M2 (Academic Core), M3A deliberately isolates timetable domain entities, deterministic time calculation, next-class resolution, and multi-dimensional conflict detection from external dependencies (no AI, no Telegram handlers, no database migrations, and no scraping).

All test fixtures use synthetic, clearly non-production course identifiers (e.g. `TEST-TT-201`, `TEST-TT-202`) to ensure no synthetic mock data can be mistaken for authoritative University of Basrah curriculum records.

---

## 2. Capabilities: What M3A Knows vs. Does NOT Know

### What M3A Knows

- **Weekly Schedule Structure**: Standard 7-day week (`SUNDAY` through `SATURDAY`), with Iraqi academic teaching days (`SUNDAY` to `THURSDAY`) and weekends (`FRIDAY` & `SATURDAY`).
- **Deterministic Time Model**: Time intervals strictly formatted as `HH:MM` (24-hour), accurate interval overlapping algorithms, and timezone calculations pinned to `Asia/Baghdad` (UTC+3) using `Intl.DateTimeFormat`.
- **Slot Granularity**: Distinction between `LECTURE`, `LAB`, `TUTORIAL`, and `OTHER` class types.
- **Section & Subgroup Hierarchy**: Common classes (accessible to all students in a stage/semester) vs section-specific classes (`section: 'A'`) and subgroup lab divisions (`subgroup: 'G1'`).
- **Real-Time State**:
  - `getCurrentClass`: Identifies in-progress class at any instant.
  - `getNextClass`: Resolves upcoming classes later today, tomorrow morning, or crossing weekend boundaries safely up to a configurable lookahead period.
  - `getPreviousClass`: Resolves recently ended classes earlier today.
- **Multi-Dimensional Conflict Engine**: Detects overlapping intervals while respecting section boundaries, room allocations, and lecturer schedules. Touching boundaries (e.g. `08:30-10:30` and `10:30-12:30`) are explicitly recognized as non-conflicting.
- **Schedule Versioning & Validity**: Support for `validFrom` and `validTo` calendar dates to handle semester schedule changes (_"الجدول تغير من الأحد القادم"_).
- **Source Authority & Status**: Explicit tracking of status (`VERIFIED`, `STUDENT_CONFIRMED`, `ADMIN_ENTERED`, `CANDIDATE`, `OUTDATED`) ensuring obsolete records are excluded by default.

### What M3A Does NOT Know

- **Actual Current UoB Mechatronics Timetable**: No real timetable scraping or guessed schedules are present.
- **Student Profile**: Does not know the student's enrolled stage, semester, or section until supplied at query time.
- **Authoritative Lecturer Assignments**: Lecturer names are non-authoritative metadata.
- **Dynamic Ad-Hoc Room Changes & Cancellations**: Handled in future administrative and real-time alert updates.
- **Academic Holidays**: Handled by future composition with `AcademicCalendarService`.

---

## 3. Architecture & Domain Model

```
packages/timetable/
├── package.json          # @mecha-bot/timetable
├── tsconfig.json         # Extends tsconfig.base.json
└── src/
    ├── types.ts          # Core domain types (Weekday, TimetableSlot, Conflicts)
    ├── schemas.ts        # Zod runtime validators & refinement rules
    ├── datetime.ts       # Baghdad timezone conversions & time arithmetic
    ├── conflict.ts       # Multi-dimensional overlap & conflict engine
    ├── service.ts        # TimetableService: queries, today/tomorrow, next-class
    ├── fixtures.ts       # Synthetic non-production test fixtures (TEST-TT-xxx)
    └── index.ts          # Public package export entrypoint
```

### Core Types

```typescript
export type Weekday =
  'SUNDAY' | 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY';

export type TimetableSlotType = 'LECTURE' | 'LAB' | 'TUTORIAL' | 'OTHER';

export type SourceStatus =
  'VERIFIED' | 'STUDENT_CONFIRMED' | 'ADMIN_ENTERED' | 'CANDIDATE' | 'OUTDATED';

export interface TimetableSlot {
  id: string;
  courseCode: string;
  courseOfferingId?: string | undefined;
  stage: number; // 1..4
  programSemester: number; // 1..8
  section?: string | undefined; // e.g. 'A', 'B'
  subgroup?: string | undefined; // e.g. 'G1', 'G2'
  type: TimetableSlotType;
  weekday: Weekday;
  startTime: string; // 'HH:MM' 24-hour
  endTime: string; // 'HH:MM' 24-hour
  room?: string | undefined;
  lecturerDisplayName?: string | undefined;
  validFrom?: string | undefined; // 'YYYY-MM-DD'
  validTo?: string | undefined; // 'YYYY-MM-DD'
  academicYearId?: string | undefined;
  sourceStatus: SourceStatus;
  notes?: string | undefined;
}
```

---

## 4. Conflict Detection Algorithm

Two slots $S_1$ and $S_2$ on the same `weekday` with intervals $[s_1, e_1)$ and $[s_2, e_2)$ overlap if and only if:
$$\max(s_1, s_2) < \min(e_1, e_2)$$

Touching intervals where $e_1 = s_2$ yield zero overlap and are deemed valid transitions between back-to-back classes.

### Conflict Classifications:

1. **Student Schedule Overlap (`STUDENT_SCHEDULE_OVERLAP`)**:
   Occurs when $S_1$ and $S_2$ overlap in time for students in the same stage and semester, and both apply to the student's section/subgroup. If $S_1$ is for Section A and $S_2$ is for Section B, no student conflict is generated.
2. **Room Double-Booking (`ROOM_DOUBLE_BOOKING`)**:
   Occurs when two distinct classes claim the same room at overlapping times, even if they belong to different stages or departments.
3. **Lecturer Double-Booking (`LECTURER_DOUBLE_BOOKING`)**:
   Occurs when a lecturer is scheduled in two separate rooms simultaneously.

---

## 5. Next Class Resolution Algorithm

When a student queries `"شنو المحاضرة الجاية؟"`, `TimetableService.getNextClass` operates deterministically:

1. **Local Instant**: Evaluates `Asia/Baghdad` local date, time, and minutes since midnight.
2. **Today's Remaining Schedule**: Scans sorted slots for the student's stage/semester/section starting strictly after current local time. If found:
   - Returns slot with `relativeDay: 'TODAY'` and exact minutes until start.
3. **Upcoming Day Traversal**: If no classes remain today, advances day-by-day (offset $1 \dots 7$):
   - Computes target calendar date (`addDaysToDateString`) without timezone drift.
   - Queries effective slots for that day.
   - If tomorrow has classes: returns the earliest class with `relativeDay: 'TOMORROW'`.
   - If over the weekend (e.g., Thursday afternoon -> Sunday morning): traverses through Friday and Saturday to find Sunday's first lecture with `relativeDay: 'LATER'`.
4. Returns `null` if no classes are scheduled within the lookahead window.

---

## 6. Future Integration Roadmap

### M1 (Student Profile Integration)

- Once M1 completes, student registration records will supply `stage`, `programSemester`, `section`, and `subgroup`.
- Calls to `getTodaySchedule` and `getNextClass` will automatically bind to the user's active session without manual parameters.

### M0 (Academic Calendar Service Integration)

- Composition with `AcademicCalendarService`:
  - Verify whether a date falls within `TEACHING`, `BREAK`, `EXAMS`, or `HOLIDAY`.
  - On official holidays, suppress standard timetable answers and report holiday status.

### M4 (Reminders & Notifications Engine)

- Background jobs will use `getNextClass` with a target offset (e.g. 15 minutes before start) to send proactive Telegram alerts (_"محاضرتك الجاية بعد 15 دقيقة: قاعة 101"_).
