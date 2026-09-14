-- Migration 0002: Add active_course_offering_id and allow nullable stage/semester for in-progress onboarding
-- Preserves all foreign keys and indexes for SQLite & Cloudflare D1

CREATE TABLE IF NOT EXISTS student_profiles_new (
  id TEXT PRIMARY KEY,
  telegram_user_id INTEGER NOT NULL UNIQUE,
  stage INTEGER CHECK(stage IS NULL OR stage BETWEEN 1 AND 4),
  program_semester INTEGER CHECK(program_semester IS NULL OR program_semester BETWEEN 1 AND 8),
  active_course_id TEXT,
  active_course_offering_id TEXT,
  locale TEXT NOT NULL DEFAULT 'ar',
  timezone TEXT NOT NULL DEFAULT 'Asia/Baghdad',
  notification_preferences TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (active_course_id) REFERENCES courses(id) ON DELETE SET NULL,
  FOREIGN KEY (active_course_offering_id) REFERENCES course_offerings(id) ON DELETE SET NULL
);

INSERT INTO student_profiles_new (
  id, telegram_user_id, stage, program_semester, active_course_id, active_course_offering_id, locale, timezone, notification_preferences, created_at, updated_at
)
SELECT
  id, telegram_user_id, stage, program_semester, active_course_id, NULL, locale, timezone, notification_preferences, created_at, updated_at
FROM student_profiles;

DROP TABLE student_profiles;

ALTER TABLE student_profiles_new RENAME TO student_profiles;

CREATE INDEX IF NOT EXISTS idx_students_stage_sem ON student_profiles(stage, program_semester);
CREATE INDEX IF NOT EXISTS idx_student_profiles_offering ON student_profiles(active_course_offering_id);
