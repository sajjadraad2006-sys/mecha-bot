# Milestone M2 — Academic Core Architecture & Integration Guide

## 1. Overview & Purpose

Milestone **M2 (Academic Core)** establishes the deterministic academic intelligence foundation for Mecha Bot. While **M1** answers _who_ the student is (stage, semester, active courses), **M2** answers:

- What is this course?
- What academic topics belong to it?
- What colloquial names and aliases do students use to refer to it?
- What is verified by official department curriculum vs. what is candidate evidence from related university archives?
- What academic contradictions exist in departmental evidence?
- What prerequisite dependency chains connect topics?

### Core Principle

> **Never turn uncertain academic information into fact.**
> Follow the pipeline: `infer -> suggest -> confirm`.
> Never silently assume or fabricate data.

M2 contains **no AI providers, no LLMs, no embeddings, and no vector search**. All services are purely deterministic, reproducible, and mathematically sound.

---

## 2. What M2 Knows vs. What M2 Explicitly Does NOT Know

### What M2 Knows (Confirmed Facts)

- **55 Canonical Program Courses**: All 55 courses across stages 1 to 4 validated against the official University of Basrah Mechatronics 2025 program specification (`cv_uob_mct_2025`).
- **56 Semester Placements**: All semester placements, including `P4MCT` (Engineering Project) correctly represented as a single canonical course spanning semesters 7 and 8.
- **Stage 1 Complete Weekly Syllabus**: Weekly topics for 13 Stage 1 courses (`MCT111` through `MCT127`, excluding `MCT124`) verified from the official course description forms (`3437Mechatronics Engineering.pdf`).
- **MCT124 Contradiction**: Formally captured conflict between curriculum table title (`Physics`) and weekly syllabus description (`Semiconductor Physics and Electronic Devices`).
- **203 Curated Course Aliases**: Arabic and English colloquial aliases normalized and indexed for instant deterministic resolution.
- **16 Curated Topic Prerequisite Edges**: Source-supported topic dependencies (e.g. calculus integration progressions, AC from DC analysis, K-maps from Boolean algebra).

### What M2 Explicitly Does NOT Know (Candidate or Unknown Knowledge)

- **Stages 2–4 Detailed Syllabi**: Official weekly syllabus forms for Stages 2–4 are not published in the 2025 program document. Related University of Basrah archives (Mechanical Engineering, Electrical Engineering, faculty archives) are tracked strictly as `CANDIDATE` under `SAME_UNIVERSITY_RELATED_COURSE` or `SAME_DEPARTMENT_ARCHIVE`.
- **Identity-Only Courses**: Courses without trustworthy candidate archives (e.g. `MCT211`, `MCT214`, `MCT221`, `MCT223`, `MCT226`, `MCT311`, `MCT315`, `MCT321`, `MCT322`, `MCT323`, `MCT327`, `P4MCT`, `MCT414`, `MCT422`, `MCT423`, `MCT425`) are categorized as `IDENTITY_ONLY`. Content is **never fabricated** simply to populate a profile.
- **Timetable & Schedule Realities**: Handled independently by M3.
- **File Parsing / Chunking / Ingestion**: Handled by M6.
- **Study Navigator UX Diagnostics**: Handled by M9.

---

## 3. Profile Taxonomy: Coverage Breakdown

Every canonical course profile is assigned one of four strict statuses:

| Status          | Definition                                                                                                           | Count  | Courses                                                                                                                                                                                                                              |
| :-------------- | :------------------------------------------------------------------------------------------------------------------- | :----: | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `COMPLETE`      | Full official weekly syllabus supported by official department evidence (`EXACT_COURSE`).                            | **13** | `MCT111`, `MCT112`, `MCT113`, `MCT114`, `MCT115`, `MCT116`, `MCT117`, `MCT121`, `MCT122`, `MCT123`, `MCT125`, `MCT126`, `MCT127`                                                                                                     |
| `CONFLICTING`   | Departmental evidence contains an unresolved substantive contradiction.                                              | **1**  | `MCT124`                                                                                                                                                                                                                             |
| `PARTIAL`       | Course has candidate topic evidence from related university/department archives, but no verified exact MCT syllabus. | **23** | `MCT212`, `MCT213`, `MCT215`, `MCT217`, `MCT222`, `MCT224`, `MCT225`, `MCT312`, `MCT313`, `MCT314`, `MCT316`, `MCT317`, `MCT324`, `MCT325`, `MCT326`, `MCT411`, `MCT412`, `MCT413`, `MCT415`, `MCT416`, `MCT421`, `MCT424`, `MCT426` |
| `IDENTITY_ONLY` | Canonical course identity confirmed, but no trustworthy topic syllabus exists yet.                                   | **18** | `MCT211`, `MCT214`, `MCT216`, `MCT221`, `MCT223`, `MCT226`, `MCT227`, `MCT311`, `MCT315`, `MCT321`, `MCT322`, `MCT323`, `MCT327`, `P4MCT`, `MCT414`, `MCT422`, `MCT423`, `MCT425`                                                    |
| **Total**       |                                                                                                                      | **55** |                                                                                                                                                                                                                                      |

---

## 4. Evidence Semantics & Provenance

M2 implements multi-tier evidence tracking:

### Evidence Scopes (`EvidenceScope`)

1. `EXACT_COURSE`: Primary source describing the exact course in Mechatronics Engineering.
2. `SAME_DEPARTMENT_ARCHIVE`: Material from current MCT faculty teaching archives.
3. `SAME_UNIVERSITY_RELATED_COURSE`: Material from another department at University of Basrah (Mechanical, Electrical, Computer Engineering).
4. `OPEN_ACADEMIC_EQUIVALENT`: Standard open textbook or accredited curriculum equivalent.
5. `BIBLIOGRAPHIC_ONLY`: Curriculum table entry or syllabus citation without lecture notes.
6. `STUDENT_PROVIDED`: Unverified student submissions.

### Fact Statuses (`AcademicFactStatus`)

- `CONFIRMED`: Source-verified exact course truth.
- `CANDIDATE`: Believed likely from related courses, pending verification.
- `CONFLICTING`: Conflicting evidence exists.
- `OUTDATED` / `SUPERSEDED`: Historical syllabus version replaced by newer curriculum.
- `REJECTED`: Proven inaccurate.
- `UNKNOWN`: Insufficient evidence.

> [!WARNING]
> Candidate evidence never automatically becomes confirmed. Related UoB material (`SAME_UNIVERSITY_RELATED_COURSE`) is never upgraded to `EXACT_COURSE` without primary departmental verification.

---

## 5. The MCT124 Conflict Case Study

Course `MCT124` is a foundational benchmark for Mecha Bot's evidence integrity:

- **Side A (Curriculum Table, Page 15)**: The official curriculum schedule titles MCT124 as `physics / فيزياء` (75 hours, 3 ECTS).
- **Side B (Detailed Course Description, Pages 42–44)**: The official course description form lists instructor Asst. Prof. Dr. Muhannad Hamed Khalaf and outlines a 15-week syllabus on **semiconductor physics, charge carrier dynamics, PN junctions, diodes, and Bipolar Junction Transistors (BJT)**, citing Donald Neamen's _Semiconductor Physics and Devices_ and _Microelectronics_.

**System Behavior**:

- Profile `topicMapStatus` is marked `CONFLICTING`.
- Topics in `topic-maps/stage-1.v1.json` for MCT124 are marked `CONFLICTING`.
- Stored as a structured conflict record in `curriculum/academic-core/conflicts.v1.json`.
- The system preserves both provenance records and flags the discrepancy rather than silently picking one.

---

## 6. Deterministic Resolvers & Normalization

### Normalization Rules

1. **Conservative Arabic Normalization**:
   - `[أإآٱ]` -> `ا`
   - `ى` -> `ي`
   - Diacritics (tashkeel `[\u064B-\u065F\u0670]`) stripped
   - Tatweel (`\u0640`) stripped
   - Whitespace collapsed and trimmed
   - **Important**: `ة` is **NOT** automatically turned into `ه` globally to prevent destructive semantic collisions. A secondary tolerant normalizer is available for tolerant search fallbacks.
2. **English Normalization**:
   - Lowercased, whitespace collapsed and trimmed.

### `CourseResolver`

- Input: Query string (e.g. `"ثرمو"`, `"كنترول"`, `"DSP"`), optional context `{ stage?, programSemester? }`.
- **Ambiguity & Disambiguation**:
  - Query `"سيطرة"` with no context: Returns `['MCT314', 'MCT324']` with `needsClarification = true`.
  - Query `"سيطرة"` with `programSemester: 5`: Resolves to `['MCT314']` with `needsClarification = false`.
  - Query `"سيطرة"` with `programSemester: 6`: Resolves to `['MCT324']` with `needsClarification = false`.
  - Query `"سيطرة 2"` with `programSemester: 5`: Detected as contradiction, returns `[]` with `needsClarification = true` and `clarificationReason = 'CONTEXT_MISMATCH'`.

### `TopicResolver`

- Matches queries against topic titles (English and Arabic), topic aliases, and subtopics for a given course.
- Safely returns `status: 'UNKNOWN'` and `topic: null` if course has no topic map (`IDENTITY_ONLY`) or topic is unmatched.

### `PrerequisiteGraph`

- Direct prerequisite lookups: `getDirectPrerequisites(topicKey)`.
- Full topological dependency chain: `getDependencyChain(topicKey)`.
- Cycle detection: `detectCycles()` returns empty array for DAGs or cycle paths for circular dependencies. Tested and verified on production curriculum.

---

## 7. Downstream Milestone Touchpoints

### Future M6 (Ingestion Pipeline) Integration

- M6 will ingest raw lecture slides, PDFs, and exam papers.
- M6 will link incoming source chunks to `CourseProfile` by `courseCode` and to `AcademicTopic` by `topicKey`.
- M6 evidence will update `AcademicEvidenceRef` records and may promote `CANDIDATE` topics to `CONFIRMED` upon faculty/lecturer syllabus verification.

### Future M9 (Study Navigator / "أني ضايع") Integration

- M9 provides diagnostic remediation when a student is struggling with a topic.
- M9 will call `prerequisiteGraph.getDependencyChain(currentTopicKey)` to trace the root prerequisite that the student has not yet mastered.
- M9 relies on M2's cycle-safe deterministic graph.

---

## 8. Post-M1 Database Integration Instructions

During M2 development, **no database migrations** were created to maintain total merge safety with M1. The database already contains compatible tables from migration `0001_initial_schema.sql`:

- `topics` (`id`, `course_id`, `parent_topic_id`, `title_ar`, `title_en`, `order_index`, `created_at`)
- `topic_prerequisites` (`id`, `topic_id`, `prerequisite_topic_id`)
- `course_aliases` (`id`, `course_id`, `alias`, `locale`)

### Seeding Script for M2 -> DB Pass

A lightweight integration script (e.g. `scripts/seed-academic-core.ts`) can populate these tables:

1. Load dataset via `loadAcademicCoreDataset()`.
2. For each profile, look up `course_id` from `courses` table by `courseCode`.
3. Insert curated aliases into `course_aliases`.
4. Insert topics into `topics`.
5. Insert prerequisite edges into `topic_prerequisites`.
