# Project Milestones Roadmap: Mecha Bot

This document outlines the full 17-milestone roadmap for the **Mechatronics Academic Assistant ("Mecha Bot")**, serving the Mechatronics Engineering Department, University of Basrah.

---

## Roadmap Overview

| Milestone | Title                      | Scope Summary                                                                                                                                                                                         | Status             |
| --------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| **M0**    | **Foundation**             | Monorepo setup, SQLite/D1 database migrations, repository abstractions, zero-cost config safeguards, grammY bot skeleton, fake AI/retrieval providers, clock/timezone layer, idempotency, test suite. | **CURRENT (DONE)** |
| **M1**    | **Student Onboarding**     | Welcome flow, stage (1..4) & program semester (1..8) selection, locale preference, user profile persistence in database.                                                                              | _Planned_          |
| **M2**    | **Academic Core**          | Verified University of Basrah curriculum ingestion, active courses, offerings, prerequisites, topic hierarchies.                                                                                      | _Planned_          |
| **M3**    | **Timetable**              | Weekly lecture schedules, lecture rooms, groups, dynamic today/tomorrow view, lecture cancellations.                                                                                                  | _Planned_          |
| **M4**    | **Reminders**              | Study reminders, quiz/exam countdowns, assignment deadlines, notification dispatch service.                                                                                                           | _Planned_          |
| **M5**    | **Daily Companion**        | Daily study check-ins, study session logging, progress tracking, catch-up mode after missed lectures.                                                                                                 | _Planned_          |
| **M6**    | **Sources / Ingestion**    | Verified department materials, lecture slides, syllabus sheets, source evidence & provenance tracking, Google Drive indexing.                                                                         | _Planned_          |
| **M7**    | **Search / RAG**           | Course-scoped and topic-scoped semantic search, evidence scope filtering, contextual authority ranking.                                                                                               | _Planned_          |
| **M8**    | **AI Brain**               | Gemini & Groq Free Tier integration, strict privacy boundary (zero student PII), structured equation/explanation outputs.                                                                             | _Planned_          |
| **M9**    | **Study Navigator**        | Prerequisite topic visualizer, revision recommendations, concept breakdown guides.                                                                                                                    | _Planned_          |
| **M10**   | **Exams & Quizzes**        | Past exam questions archive, sample quizzes, verified exam solutions, model answers.                                                                                                                  | _Planned_          |
| **M11**   | **Admin / Course Editors** | Role-based course editor tools, course pulse updates (where class reached), syllabus edits.                                                                                                           | _Planned_          |
| **M12**   | **File Distribution**      | Telegram native file delivery via `file_id`, zero-egress CDN delivery, Drive link fallbacks.                                                                                                          | _Planned_          |
| **M13**   | **Student Dashboard**      | Academic summary, topic mastery scores, attendance/study streak statistics.                                                                                                                           | _Planned_          |
| **M14**   | **Mini App**               | Optional Telegram Mini App (Web App) for timetable viewing and rich syllabus exploration.                                                                                                             | _Planned_          |
| **M15**   | **Hardening**              | Performance tuning, rate limiting, Cloudflare Workers + D1 deployment, failover testing.                                                                                                              | _Planned_          |
| **M16**   | **Production Release**     | Final security audit, department staff handover, official student launch at University of Basrah.                                                                                                     | _Planned_          |
