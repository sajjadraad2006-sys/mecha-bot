-- ==============================================================================
-- Mecha Bot - Migration 0001: Initial Foundation Schema
-- Compatible with SQLite and Cloudflare D1
-- ==============================================================================

-- 1. Migrations Tracking
CREATE TABLE IF NOT EXISTS _migrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  applied_at TEXT NOT NULL,
  checksum TEXT NOT NULL
);

-- 2. Academic Years
CREATE TABLE IF NOT EXISTS academic_years (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  starts_on TEXT NOT NULL, -- YYYY-MM-DD local academic date
  ends_on TEXT NOT NULL,   -- YYYY-MM-DD local academic date
  is_current INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

-- 3. Academic Calendar Periods
CREATE TABLE IF NOT EXISTS academic_calendar_periods (
  id TEXT PRIMARY KEY,
  academic_year_id TEXT NOT NULL,
  period_type TEXT NOT NULL, -- 'PRE_SEMESTER', 'TEACHING', 'EXAMS', 'BREAK', 'SUMMER_TRAINING', 'HOLIDAY'
  program_semester INTEGER,  -- 1..8 or NULL
  starts_on TEXT NOT NULL,   -- YYYY-MM-DD local academic date
  ends_on TEXT NOT NULL,     -- YYYY-MM-DD local academic date
  nominal_week_count INTEGER NOT NULL DEFAULT 0,
  stage_scope INTEGER,       -- 1..4 or NULL (applies to all stages)
  evidence_metadata_json TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_calendar_dates ON academic_calendar_periods(starts_on, ends_on);
CREATE INDEX IF NOT EXISTS idx_calendar_stage ON academic_calendar_periods(stage_scope);

-- 4. Curriculum Versions
CREATE TABLE IF NOT EXISTS curriculum_versions (
  id TEXT PRIMARY KEY,
  version_name TEXT NOT NULL UNIQUE,
  academic_year TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);

-- 5. Courses (Identity independent of offering)
CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  default_stage INTEGER NOT NULL CHECK(default_stage BETWEEN 1 AND 4),
  default_program_semester INTEGER NOT NULL CHECK(default_program_semester BETWEEN 1 AND 8),
  is_active INTEGER NOT NULL DEFAULT 1,
  curriculum_version_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (curriculum_version_id) REFERENCES curriculum_versions(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_courses_code ON courses(code);
CREATE INDEX IF NOT EXISTS idx_courses_stage_semester ON courses(default_stage, default_program_semester);

-- 6. Course Offerings (Specific academic year / semester placement)
CREATE TABLE IF NOT EXISTS course_offerings (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL,
  academic_year_id TEXT NOT NULL,
  stage INTEGER NOT NULL CHECK(stage BETWEEN 1 AND 4),
  program_semester INTEGER NOT NULL CHECK(program_semester BETWEEN 1 AND 8),
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE,
  UNIQUE(course_id, academic_year_id, program_semester)
);

CREATE INDEX IF NOT EXISTS idx_offerings_lookup ON course_offerings(academic_year_id, stage, program_semester);

-- 7. Course Aliases
CREATE TABLE IF NOT EXISTS course_aliases (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL,
  alias TEXT NOT NULL,
  locale TEXT NOT NULL DEFAULT 'all',
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_aliases_text ON course_aliases(alias);

-- 8. Topics
CREATE TABLE IF NOT EXISTS topics (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL,
  parent_topic_id TEXT,
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_topic_id) REFERENCES topics(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_topics_course ON topics(course_id, order_index);

-- 9. Topic Prerequisites
CREATE TABLE IF NOT EXISTS topic_prerequisites (
  id TEXT PRIMARY KEY,
  topic_id TEXT NOT NULL,
  prerequisite_topic_id TEXT NOT NULL,
  FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE,
  FOREIGN KEY (prerequisite_topic_id) REFERENCES topics(id) ON DELETE CASCADE,
  UNIQUE(topic_id, prerequisite_topic_id)
);

-- 10. Course Pulses (Where the class actually reached)
CREATE TABLE IF NOT EXISTS course_pulses (
  id TEXT PRIMARY KEY,
  course_offering_id TEXT NOT NULL UNIQUE,
  current_topic_id TEXT,
  current_subtopic_id TEXT,
  actual_teaching_week INTEGER,
  progress_note TEXT,
  confidence_status TEXT NOT NULL DEFAULT 'ESTIMATED', -- 'HIGH', 'MEDIUM', 'LOW', 'ESTIMATED'
  updated_by TEXT,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (course_offering_id) REFERENCES course_offerings(id) ON DELETE CASCADE,
  FOREIGN KEY (current_topic_id) REFERENCES topics(id) ON DELETE SET NULL
);

-- 11. Student Profiles (Telegram mapping kept in DB only)
CREATE TABLE IF NOT EXISTS student_profiles (
  id TEXT PRIMARY KEY,
  telegram_user_id INTEGER NOT NULL UNIQUE,
  stage INTEGER NOT NULL CHECK(stage BETWEEN 1 AND 4),
  program_semester INTEGER NOT NULL CHECK(program_semester BETWEEN 1 AND 8),
  active_course_id TEXT,
  locale TEXT NOT NULL DEFAULT 'ar',
  timezone TEXT NOT NULL DEFAULT 'Asia/Baghdad',
  notification_preferences TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (active_course_id) REFERENCES courses(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_students_stage_sem ON student_profiles(stage, program_semester);

-- 12. Student Course States & Baseline (Supports mid-semester joins)
CREATE TABLE IF NOT EXISTS student_course_states (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  course_offering_id TEXT NOT NULL,
  joined_at TEXT NOT NULL,
  baseline_topic_id TEXT,
  baseline_source TEXT NOT NULL, -- 'SHARED_COURSE_PULSE', 'STUDENT_CONFIRMED', 'STUDENT_ENTERED', 'INFERRED'
  baseline_confidence TEXT NOT NULL DEFAULT 'MEDIUM', -- 'HIGH', 'MEDIUM', 'LOW'
  last_active_topic_id TEXT,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (course_offering_id) REFERENCES course_offerings(id) ON DELETE CASCADE,
  FOREIGN KEY (baseline_topic_id) REFERENCES topics(id) ON DELETE SET NULL,
  UNIQUE(student_id, course_offering_id)
);

-- 13. Course Staff Assignments
CREATE TABLE IF NOT EXISTS course_staff_assignments (
  id TEXT PRIMARY KEY,
  course_offering_id TEXT NOT NULL,
  staff_name TEXT NOT NULL,
  staff_title TEXT,
  role TEXT NOT NULL, -- 'PRIMARY_LECTURER', 'CO_LECTURER', 'LAB_INSTRUCTOR', 'TEACHING_ASSISTANT'
  academic_year_id TEXT NOT NULL,
  evidence_source_id TEXT,
  verification_status TEXT NOT NULL DEFAULT 'UNVERIFIED', -- 'VERIFIED', 'UNVERIFIED', 'ARCHIVED'
  created_at TEXT NOT NULL,
  FOREIGN KEY (course_offering_id) REFERENCES course_offerings(id) ON DELETE CASCADE,
  FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE
);

-- 14. Sources
CREATE TABLE IF NOT EXISTS sources (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL,
  title TEXT NOT NULL,
  source_type TEXT NOT NULL, -- 'LECTURE_NOTE', 'SYLLABUS', 'TEXTBOOK', 'EXAM_PAPER', 'LAB_MANUAL'
  authority_class TEXT NOT NULL, -- SourceAuthority enum
  academic_year TEXT,
  lecturer_name TEXT,
  is_verified INTEGER NOT NULL DEFAULT 0,
  distribution_permission TEXT NOT NULL DEFAULT 'ALLOWED',
  telegram_file_id TEXT,
  drive_file_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sources_course ON sources(course_id);
CREATE INDEX IF NOT EXISTS idx_sources_authority ON sources(authority_class);

-- 15. Source Evidence & Provenance
CREATE TABLE IF NOT EXISTS source_evidence (
  id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL UNIQUE,
  evidence_scope TEXT NOT NULL, -- 'EXACT_COURSE', 'SAME_DEPARTMENT_ARCHIVE', 'SAME_UNIVERSITY_RELATED_COURSE', 'OPEN_ACADEMIC_EQUIVALENT', 'BIBLIOGRAPHIC_ONLY', 'STUDENT_PROVIDED'
  origin_url TEXT,
  origin_department TEXT,
  origin_university TEXT,
  academic_year TEXT,
  valid_from_academic_year TEXT,
  valid_to_academic_year TEXT,
  is_verified INTEGER NOT NULL DEFAULT 0,
  verified_at TEXT,
  verified_by TEXT,
  distribution_allowed INTEGER NOT NULL DEFAULT 1,
  access_rights_notes TEXT,
  searchable_copy_available INTEGER NOT NULL DEFAULT 0,
  is_archived INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY (source_id) REFERENCES sources(id) ON DELETE CASCADE
);

-- 16. Source Versions
CREATE TABLE IF NOT EXISTS source_versions (
  id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL,
  version_number INTEGER NOT NULL DEFAULT 1,
  checksum TEXT NOT NULL,
  file_size INTEGER,
  created_at TEXT NOT NULL,
  FOREIGN KEY (source_id) REFERENCES sources(id) ON DELETE CASCADE,
  UNIQUE(source_id, version_number)
);

-- 17. Source Chunks (Future RAG Ready)
CREATE TABLE IF NOT EXISTS source_chunks (
  id TEXT PRIMARY KEY,
  source_version_id TEXT NOT NULL,
  topic_id TEXT,
  page_number INTEGER,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  metadata_json TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (source_version_id) REFERENCES source_versions(id) ON DELETE CASCADE,
  FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_chunks_search ON source_chunks(source_version_id, topic_id);

-- 18. Past Exams
CREATE TABLE IF NOT EXISTS past_exams (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  exam_type TEXT NOT NULL, -- 'MIDTERM', 'FINAL_FIRST_ATTEMPT', 'FINAL_SECOND_ATTEMPT'
  session TEXT,
  is_verified INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- 19. Past Questions
CREATE TABLE IF NOT EXISTS past_questions (
  id TEXT PRIMARY KEY,
  past_exam_id TEXT NOT NULL,
  question_number INTEGER NOT NULL,
  topic_id TEXT,
  question_text TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (past_exam_id) REFERENCES past_exams(id) ON DELETE CASCADE,
  FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE SET NULL
);

-- 20. Student Topic States
CREATE TABLE IF NOT EXISTS student_topic_states (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  topic_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'NOT_STARTED', -- 'NOT_STARTED', 'IN_PROGRESS', 'REVIEWED', 'MASTERED'
  confidence_level INTEGER NOT NULL DEFAULT 0, -- 0..5
  last_studied_at TEXT,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE,
  UNIQUE(student_id, topic_id)
);

-- 21. Schedule Entries
CREATE TABLE IF NOT EXISTS schedule_entries (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL,
  day_of_week INTEGER NOT NULL CHECK(day_of_week BETWEEN 0 AND 6), -- 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu in Basrah
  start_time TEXT NOT NULL, -- '08:30'
  end_time TEXT NOT NULL,   -- '10:30'
  room TEXT,
  lecturer TEXT,
  group_name TEXT,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- 22. Academic Events
CREATE TABLE IF NOT EXISTS academic_events (
  id TEXT PRIMARY KEY,
  course_id TEXT,
  event_type TEXT NOT NULL, -- 'QUIZ', 'EXAM', 'ASSIGNMENT', 'LECTURE_CHANGE', 'GENERIC'
  title TEXT NOT NULL,
  description TEXT,
  event_date TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- 23. Reminders
CREATE TABLE IF NOT EXISTS reminders (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  title TEXT NOT NULL,
  scheduled_at TEXT NOT NULL, -- UTC ISO string
  is_sent INTEGER NOT NULL DEFAULT 0,
  idempotency_key TEXT UNIQUE,
  created_at TEXT NOT NULL,
  FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_reminders_queue ON reminders(scheduled_at, is_sent);

-- 24. Study Sessions
CREATE TABLE IF NOT EXISTS study_sessions (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  course_id TEXT NOT NULL,
  topic_id TEXT,
  duration_minutes INTEGER NOT NULL,
  started_at TEXT NOT NULL,
  ended_at TEXT NOT NULL,
  FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE SET NULL
);

-- 25. Student Checkins
CREATE TABLE IF NOT EXISTS student_checkins (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  checkin_date TEXT NOT NULL, -- YYYY-MM-DD
  status TEXT NOT NULL,
  mood TEXT,
  notes TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
  UNIQUE(student_id, checkin_date)
);

-- 26. Admin Roles
CREATE TABLE IF NOT EXISTS admin_roles (
  id TEXT PRIMARY KEY,
  telegram_user_id INTEGER NOT NULL,
  role TEXT NOT NULL, -- 'SUPER_ADMIN', 'COURSE_EDITOR', 'ACADEMIC_AUDITOR'
  granted_at TEXT NOT NULL,
  UNIQUE(telegram_user_id, role)
);

-- 27. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  actor_id TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details_json TEXT,
  created_at TEXT NOT NULL
);

-- 28. Idempotent Telegram Updates
CREATE TABLE IF NOT EXISTS idempotent_updates (
  update_id INTEGER PRIMARY KEY,
  handler TEXT NOT NULL,
  processed_at TEXT NOT NULL
);

-- 29. AI Usage Logs
CREATE TABLE IF NOT EXISTS ai_usage_logs (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL,
  intent TEXT,
  prompt_tokens INTEGER NOT NULL DEFAULT 0,
  completion_tokens INTEGER NOT NULL DEFAULT 0,
  latency_ms INTEGER NOT NULL DEFAULT 0,
  is_success INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);
