# Project Milestones Roadmap: Mecha Bot

This document outlines the full 17-milestone roadmap for the **Mechatronics Academic Assistant ("Mecha Bot")**, serving the Mechatronics Engineering Department, University of Basrah.

---

## Roadmap Overview

| Milestone | Title                      | Scope Summary                                                                                                                                                                                         | Status   |
| --------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| **M0**    | **Foundation**             | Monorepo setup, SQLite/D1 database migrations, repository abstractions, zero-cost config safeguards, grammY bot skeleton, fake AI/retrieval providers, clock/timezone layer, idempotency, test suite. | **DONE** |
| **M1**    | **Student Onboarding**     | Welcome flow, stage (1..4) & program semester (1..8) selection, locale preference, user profile persistence in database.                                                                              | **DONE** |
| **M2**    | **Academic Core**          | Verified University of Basrah curriculum ingestion, active courses, offerings, prerequisites, topic hierarchies.                                                                                      | **DONE** |
| **M3**    | **Timetable**              | Weekly lecture schedules, lecture rooms, groups, dynamic today/tomorrow view, lecture cancellations.                                                                                                  | **DONE** |
| **M4**    | **Reminders**              | Study reminders, quiz/exam countdowns, assignment deadlines, notification dispatch service.                                                                                                           | **DONE** |
| **M5**    | **Daily Companion**        | Daily study check-ins, study session logging, progress tracking, catch-up mode after missed lectures.                                                                                                 | **DONE** |
| **M6**    | **Sources / Ingestion**    | Verified department materials, lecture slides, syllabus sheets, source evidence & provenance tracking, Google Drive indexing.                                                                         | **DONE** |
| **M7**    | **Search / RAG**           | Course-scoped and topic-scoped semantic search, evidence scope filtering, contextual authority ranking.                                                                                               | **DONE** |
| **M8**    | **AI Brain**               | Tier-1 Frontier Intelligence (Gemini 2.0 Flash, Groq 70B/32B, OpenRouter, Workers AI DeepSeek R1 32B), grounding, strict privacy boundary, structured equation/explanation outputs.                   | **DONE** |
| **M9**    | **Study Navigator**        | Topic position tracking, prerequisite visualizer, revision recommendations, catch-up planning.                                                                                                        | **DONE** |
| **M10**   | **Exams & Quizzes**        | Past exam questions archive, sample quizzes, verified exam solutions, student attempt tracking.                                                                                                       | **DONE** |
| **M11**   | **Admin / Course Editors** | Role-based course editor tools, course pulse updates (where class reached), syllabus edits, audit logging.                                                                                            | **DONE** |
| **M12**   | **File Distribution**      | Telegram native file delivery via `file_id`, zero-egress CDN delivery, Drive link fallbacks, distribution policies.                                                                                   | **DONE** |
| **M13**   | **Student Dashboard**      | Academic summary, topic mastery scores, streak statistics, dynamic progress comparison, MCT124/P4MCT anomaly protection.                                                                              | **DONE** |
| **M14**   | **Mini App**               | Telegram Mini App (Web App) for timetable viewing and rich syllabus exploration.                                                                                                                      | **DONE** |
| **M15**   | **Hardening**              | Performance tuning, rate limiting, Cloudflare Workers + D1 deployment, failover testing.                                                                                                              | **DONE** |
| **M16**   | **Production Release**     | Final security audit, department staff handover, official student launch at University of Basrah.                                                                                                     | **DONE** |
