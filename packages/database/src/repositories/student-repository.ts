import { DatabaseConnection } from '../connection.js';
import { Stage, ProgramSemester } from '@mecha-bot/academic';

export interface StudentProfile {
  id: string;
  telegramUserId: number;
  stage: Stage;
  programSemester: ProgramSemester;
  activeCourseId: string | null;
  locale: string;
  timezone: string;
  notificationPreferences: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

interface StudentProfileRow {
  id: string;
  telegram_user_id: number;
  stage: number;
  program_semester: number;
  active_course_id: string | null;
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
      stage: row.stage as Stage,
      programSemester: row.program_semester as ProgramSemester,
      activeCourseId: row.active_course_id,
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

  upsert(profile: StudentProfile): void {
    const prefsJson = JSON.stringify(profile.notificationPreferences || {});
    this.db.run(
      `INSERT INTO student_profiles (
        id, telegram_user_id, stage, program_semester, active_course_id, locale, timezone, notification_preferences, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(telegram_user_id) DO UPDATE SET
        stage = excluded.stage,
        program_semester = excluded.program_semester,
        active_course_id = excluded.active_course_id,
        locale = excluded.locale,
        timezone = excluded.timezone,
        notification_preferences = excluded.notification_preferences,
        updated_at = excluded.updated_at;`,
      [
        profile.id,
        profile.telegramUserId,
        profile.stage,
        profile.programSemester,
        profile.activeCourseId,
        profile.locale,
        profile.timezone,
        prefsJson,
        profile.createdAt,
        profile.updatedAt,
      ],
    );
  }
}
