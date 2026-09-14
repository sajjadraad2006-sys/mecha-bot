# M5A Daily Companion Domain Foundation

M5A provides deterministic, UI-independent building blocks for a student's daily study
companion. It stores UTC machine timestamps and uses `Asia/Baghdad` as the default timezone
when a student-local calendar date is required.

## Study session lifecycle

A session is one of `STUDY`, `FOCUS`, `REVIEW`, `PRACTICE`, or `BREAK`. Starting a session
creates it in `ACTIVE` state. An active session can become `COMPLETED`, `CANCELLED`, or
`INTERRUPTED`; terminal states cannot transition again. Elapsed minutes are calculated only
from the UTC start and end instants, and an end before the start is rejected. The service
allows only one active session per student, while different students remain independent.

Course and topic references are optional so general study or break sessions are valid. Breaks
are session records but do not contribute to study consistency metrics.

## Daily check-ins

A check-in records a student's answer for one local calendar date. Saving another check-in for
the same student and local date updates the existing record while preserving its ID and creation
time. Course, difficulty, note, and confidence are optional. `selfReportedConfidence` is an
integer from 1 to 5 and is explicitly a subjective report, not objective mastery.

## Progress signals

Signals remain typed and separate:

- `SELF_RATING` carries only self-reported confidence.
- `QUIZ_RESULT` carries score, maximum, and derived percentage.
- `STUDY_SESSION` carries completed minutes and a session reference.
- `REPEATED_QUESTION` carries an explainable count.
- `MANUAL_STUDENT_STATUS` carries a student-entered topic state.

The summary policy can produce `NEW`, `LEARNING`, `STRUGGLING`, `REVIEW_NEEDED`, or
`COMFORTABLE`. It never produces mastery. Manual student status is explicit; otherwise the
small deterministic policy uses the latest self-rating and quiz result plus repeated-question
counts. The raw signal counts and latest values remain visible so consumers can explain the
summary.

## Catch-up foundation

Per-student course state can record `lastAttendedTopic`, `lastUnderstoodTopic`,
`missedFromDate`, and `catchUpRequestedAt`. These are student-entered or future confirmed facts.
M5A never infers lecturer or class progress.

## Consistency semantics

Only completed, non-break sessions count. A study day is the Baghdad-local date on which a
session ended. Metrics provide unique study days in inclusive trailing 7-day and 30-day windows,
all-time completed study minutes, and a consecutive-day streak. The streak can end today or
yesterday so the current unfinished day does not reset it; an older last study day yields zero.
No penalties, rankings, or aggressive gamification are applied.

## Boundaries and future integration

M5A does not implement Telegram UI, AI interpretation, notifications, reminder scheduling,
timetables, quizzes, lecturer-progress inference, or database migrations. The in-memory
repository is a deterministic adapter for tests and early integration. A later database adapter
can map to the existing `student_study_sessions`, `student_checkins`, and
`student_topic_mastery` tables without changing this domain API.

M4 can later consume explicit session/check-in facts to schedule reminders. M9 Study Navigator
can combine the transparent progress and catch-up facts under a documented evidence policy. M13
Dashboard can present summaries and consistency metrics without recalculating or upgrading any
signal.
