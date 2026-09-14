# M10A Exams, Quizzes, and Academic Events Foundation

M10A provides deterministic domain models and an in-memory repository for academic events,
exam coverage, past questions, practice quizzes, attempts, and exact scoring. It does not invent
dates, upgrade uncertain evidence, or call AI services.

## Academic events

Events represent quizzes, midterms, final exams, assignments, reports, projects, deadlines, and
other explicitly dated academic events. Quiz and exam events require an explicit UTC `occursAt`;
assignment-like events require an explicit UTC `dueAt`. When both exist, occurrence cannot be
after the deadline. `studentKey` is optional: absent means a shared/class event, while present
means student-scoped.

Source provenance (`OFFICIAL_SOURCE`, `STUDENT_REPORTED`, `ADMIN_REPORTED`, or `INFERRED`) is
stored separately from confirmation status. Confirmation is preserved exactly as supplied:
`CONFIRMED`, `STUDENT_ENTERED`, `ADMIN_ENTERED`, `INFERRED_UNCONFIRMED`, or `CANDIDATE`.
Especially, inferred data is never silently promoted to confirmed truth.

Normalized fingerprints combine scope, course, event type, explicit date/time, and normalized
title. Reprocessing the same event returns the existing record. Shared fingerprints do not
include student identity; student-scoped event fingerprints do, so personal deadlines remain
independent.

## Coverage semantics

Coverage is a list of independent items with a matching course code, a topic key and/or free-text
label, optional evidence reference, and one of `CONFIRMED`, `STUDENT_REPORTED`, or
`INFERRED_UNCONFIRMED`. Normalization trims labels but never changes their evidence status.

## Past exam questions

A past question records course, academic year, optional attempt/exam type/question number,
question text, topic keys, source/page references, solution status, and verification status.
Question verification and solution verification are deliberately separate: a verified question
can still have no solution or an unverified solution. M10A neither extracts questions from PDFs
nor generates solutions.

## Practice quizzes and deterministic scoring

Practice quizzes contain separately stored questions and stable question IDs. M10A supports
multiple-choice and true/false questions. Each question has a positive point value. MCQ scoring
compares the submitted option ID exactly; true/false scoring requires an actual boolean. Wrong
types, differently cased labels, incorrect answers, and unanswered questions receive zero.
There is no fuzzy, semantic, AI, or partial-credit grading.

Attempts move from `IN_PROGRESS` to either `SUBMITTED` or `CANCELLED` and cannot leave a terminal
state. Submission stores an immutable answer snapshot, raw and maximum scores, and a percentage
rounded deterministically to two decimal places. Attempts from different students are
independent.

## Boundaries and future integration

M10A has no Telegram UX, reminders, scheduling, source ingestion, PDF extraction, NLP parsing,
AI grading, generated solutions, or database migrations. A future database repository can map
the domain to the existing `past_exam_questions`, `quizzes`, `quiz_questions`, and
`quiz_attempts` tables.

Future integration keeps ownership boundaries explicit:

- M2 Academic Core can resolve validated course/topic references without becoming the event
  source of truth.
- M4 Reminders can schedule alerts only from explicit event timestamps and confirmation policy.
- M6 Sources can create candidates with provenance while retaining unconfirmed status.
- M9 Study Navigator can select practice material and consume attempt results without changing
  deterministic scoring or treating one result as mastery.
