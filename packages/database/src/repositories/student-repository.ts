import { DatabaseConnection } from '../connection.js';
import { Stage, ProgramSemester } from '@mecha-bot/academic';

export interface StudentProfile {
  id: string;
  telegramUserId: number;
  stage: Stage | null;
  programSemester: ProgramSemester | null;
  activeCourseId: string | null;
  activeCourseOfferingId?: string | null;
  locale: string;
  timezone: string;
  notificationPreferences: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

interface StudentProfileRow {
  id: string;
  telegram_user_id: number;
  stage: number | null;
  program_semester: number | null;
  active_course_id: string | null;
  active_course_offering_id: string | null;
  locale: string;
  timezone: string;
  notification_preferences: string;
  created_at: string;
  updated_at: string;
}

export class StudentRepository {
  constructor(private db: DatabaseConnection) {}

  private mapRow(row: StudentProfileRow): StudentProfile {
    return {
      id: row.id,
      telegramUserId: row.telegram_user_id,
      stage: row.stage !== null ? (row.stage as Stage) : null,
      programSemester:
        row.program_semester !== null ? (row.program_semester as ProgramSemester) : null,
      activeCourseId: row.active_course_id,
      activeCourseOfferingId: row.active_course_offering_id,
      locale: row.locale,
      timezone: row.timezone,
      notificationPreferences: JSON.parse(row.notification_preferences || '{}'),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  findByTelegramId(telegramUserId: number): StudentProfile | null {
    const row = this.db.queryOne<StudentProfileRow>(
      'SELECT * FROM student_profiles WHERE telegram_user_id = ?;',
      [telegramUserId],
    );
    return row ? this.mapRow(row) : null;
  }

  findById(id: string): StudentProfile | null {
    const row = this.db.queryOne<StudentProfileRow>(
      'SELECT * FROM student_profiles WHERE id = ?;',
      [id],
    );
    return row ? this.mapRow(row) : null;
  }

  findOrCreate(telegramUserId: number, defaults?: Partial<StudentProfile>): StudentProfile {
    const existing = this.findByTelegramId(telegramUserId);
    if (existing) return existing;

    const now = new Date().toISOString();
    const newProfile: StudentProfile = {
      id: defaults?.id || `student_${telegramUserId}`,
      telegramUserId,
      stage: defaults?.stage || null,
      programSemester: defaults?.programSemester || null,
      activeCourseId: defaults?.activeCourseId || null,
      activeCourseOfferingId: defaults?.activeCourseOfferingId || null,
      locale: defaults?.locale || 'ar',
      timezone: defaults?.timezone || 'Asia/Baghdad',
      notificationPreferences: defaults?.notificationPreferences || {},
      createdAt: now,
      updatedAt: now,
    };

    this.upsert(newProfile);
    return newProfile;
  }

  upsert(profile: StudentProfile): void {
    const prefsJson = JSON.stringify(profile.notificationPreferences || {});
    this.db.run(
      `INSERT INTO student_profiles (
        id, telegram_user_id, stage, program_semester, active_course_id, active_course_offering_id, locale, timezone, notification_preferences, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(telegram_user_id) DO UPDATE SET
        stage = excluded.stage,
        program_semester = excluded.program_semester,
        active_course_id = excluded.active_course_id,
        active_course_offering_id = excluded.active_course_offering_id,
        locale = excluded.locale,
        timezone = excluded.timezone,
        notification_preferences = excluded.notification_preferences,
        updated_at = excluded.updated_at;`,
      [
        profile.id,
        profile.telegramUserId,
        profile.stage ?? null,
        profile.programSemester ?? null,
        profile.activeCourseId ?? null,
        profile.activeCourseOfferingId ?? null,
        profile.locale ?? 'ar',
        profile.timezone ?? 'Asia/Baghdad',
        prefsJson,
        profile.createdAt,
        profile.updatedAt,
      ],
    );
  }

  /**
   * Deterministic stage update:
   * Sets new stage, and transactionally clears program_semester, active_course_id, and active_course_offering_id.
   */
  updateStage(telegramUserId: number, stage: Stage): StudentProfile {
    this.findOrCreate(telegramUserId);
    const now = new Date().toISOString();

    this.db.run(
      `UPDATE student_profiles SET
        stage = ?,
        program_semester = NULL,
        active_course_id = NULL,
        active_course_offering_id = NULL,
        updated_at = ?
      WHERE telegram_user_id = ?;`,
      [stage, now, telegramUserId],
    );

    const updated = this.findByTelegramId(telegramUserId);
    if (!updated) throw new Error(`Failed to find student after updating stage: ${telegramUserId}`);
    return updated;
  }

  /**
   * Deterministic semester update:
   * Sets new program_semester, and transactionally clears active_course_id and active_course_offering_id.
   */
  updateSemester(telegramUserId: number, semester: ProgramSemester): StudentProfile {
    this.findOrCreate(telegramUserId);
    const now = new Date().toISOString();

    this.db.run(
      `UPDATE student_profiles SET
        program_semester = ?,
        active_course_id = NULL,
        active_course_offering_id = NULL,
        updated_at = ?
      WHERE telegram_user_id = ?;`,
      [semester, now, telegramUserId],
    );

    const updated = this.findByTelegramId(telegramUserId);
    if (!updated)
      throw new Error(`Failed to find student after updating semester: ${telegramUserId}`);
    return updated;
  }

  /**
   * Set active course offering:
   * Links student to concrete course offering and canonical course.
   */
  updateActiveCourse(
    telegramUserId: number,
    courseId: string,
    courseOfferingId: string,
  ): StudentProfile {
    this.findOrCreate(telegramUserId);
    const now = new Date().toISOString();

    this.db.run(
      `UPDATE student_profiles SET
        active_course_id = ?,
        active_course_offering_id = ?,
        updated_at = ?
      WHERE telegram_user_id = ?;`,
      [courseId, courseOfferingId, now, telegramUserId],
    );

    const updated = this.findByTelegramId(telegramUserId);
    if (!updated)
      throw new Error(`Failed to find student after updating course: ${telegramUserId}`);
    return updated;
  }
}
