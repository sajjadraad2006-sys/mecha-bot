/**
 * Worker In-Memory & D1-Synchronized Database Connection (@mecha-bot/worker)
 *
 * Implements the synchronous DatabaseConnection interface required by domain
 * repositories while seamlessly syncing persistent updates to Cloudflare D1.
 */

import type { DatabaseConnection, QueryResultInfo } from '@mecha-bot/database';
import { OFFICIAL_COURSES, OFFICIAL_OFFERINGS } from './courses-data.js';

export interface StoredStudentProfile {
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

export interface D1Binding {
  prepare(sql: string): {
    bind(...params: unknown[]): {
      first<T = unknown>(): Promise<T | null>;
      all<T = unknown>(): Promise<{ results: T[] }>;
      run(): Promise<unknown>;
    };
  };
}

export class WorkerDatabaseConnection implements DatabaseConnection {
  private studentProfilesByTgId = new Map<number, StoredStudentProfile>();
  private studentProfilesById = new Map<string, StoredStudentProfile>();
  private idempotencyStore = new Map<string, { key: string; createdAt: string }>();
  private d1Binding: D1Binding | null = null;
  private executionCtx: { waitUntil: (p: Promise<unknown>) => void } | null = null;

  public setD1(d1: unknown, ctx?: unknown): void {
    if (d1 && typeof (d1 as D1Binding).prepare === 'function') {
      this.d1Binding = d1 as D1Binding;
    }
    if (
      ctx &&
      typeof (ctx as { waitUntil: (p: Promise<unknown>) => void }).waitUntil === 'function'
    ) {
      this.executionCtx = ctx as { waitUntil: (p: Promise<unknown>) => void };
    }
  }

  public hydrateStudentProfile(row: Record<string, unknown>): void {
    if (!row || typeof row['telegram_user_id'] !== 'number') return;
    const profile: StoredStudentProfile = {
      id: String(row['id'] || `student_${row['telegram_user_id']}`),
      telegram_user_id: row['telegram_user_id'],
      stage: typeof row['stage'] === 'number' ? row['stage'] : null,
      program_semester:
        typeof row['program_semester'] === 'number' ? row['program_semester'] : null,
      active_course_id:
        typeof row['active_course_id'] === 'string' ? row['active_course_id'] : null,
      active_course_offering_id:
        typeof row['active_course_offering_id'] === 'string'
          ? row['active_course_offering_id']
          : null,
      locale: String(row['locale'] || 'ar'),
      timezone: String(row['timezone'] || 'Asia/Baghdad'),
      notification_preferences: String(row['notification_preferences'] || '{}'),
      created_at: String(row['created_at'] || new Date().toISOString()),
      updated_at: String(row['updated_at'] || new Date().toISOString()),
    };
    this.studentProfilesByTgId.set(profile.telegram_user_id, profile);
    this.studentProfilesById.set(profile.id, profile);
  }

  public async preloadStudentFromD1(telegramUserId: number): Promise<void> {
    if (this.studentProfilesByTgId.has(telegramUserId) || !this.d1Binding) {
      return;
    }
    try {
      const row = await this.d1Binding
        .prepare('SELECT * FROM student_profiles WHERE telegram_user_id = ?')
        .bind(telegramUserId)
        .first<Record<string, unknown>>();
      if (row) {
        this.hydrateStudentProfile(row);
      }
    } catch {
      // In-memory fallback is safe
    }
  }

  private dispatchD1Async(sql: string, params: unknown[]): void {
    if (!this.d1Binding) return;
    const promise = this.d1Binding
      .prepare(sql)
      .bind(...params)
      .run()
      .catch(() => {
        // Tolerant async sync
      });

    if (this.executionCtx) {
      this.executionCtx.waitUntil(promise);
    }
  }

  exec(_sql: string): void {
    // No-op for runtime migrations on D1-backed worker
  }

  query<T = Record<string, unknown>>(sql: string, params: unknown[] = []): T[] {
    const s = sql.trim();

    // 1. Course offerings query (must be evaluated before general courses query)
    if (s.includes('FROM course_offerings')) {
      // a) findOfferingByCourseCodeAndSemester: WHERE c.code = ? AND co.program_semester = ?
      if (s.includes('c.code = ?')) {
        const code = String(params[0]).toUpperCase();
        const sem = Number(params[1]);
        const match = OFFICIAL_OFFERINGS.find(
          (o) => o.code.toUpperCase() === code && o.program_semester === sem && o.is_active === 1,
        );
        return (match ? [match] : []) as unknown as T[];
      }

      // b) findOfferingById: WHERE id = ?
      if (s.includes('WHERE id = ?') || s.includes('co.id = ?')) {
        const id = String(params[0]);
        const match = OFFICIAL_OFFERINGS.find((o) => o.id === id);
        return (match ? [match] : []) as unknown as T[];
      }

      // c) listOfferingsByCourse: WHERE course_id = ?
      if (s.includes('WHERE course_id = ?') || s.includes('co.course_id = ?')) {
        const courseId = String(params[0]);
        return OFFICIAL_OFFERINGS.filter((o) => o.course_id === courseId).sort(
          (a, b) => a.program_semester - b.program_semester,
        ) as unknown as T[];
      }

      // d) listOfferingsBySemester: WHERE co.academic_year_id = ? AND co.program_semester = ?
      if (s.includes('co.program_semester = ?') || s.includes('program_semester = ?')) {
        const sem = s.includes('co.academic_year_id = ?') ? Number(params[1]) : Number(params[0]);
        return OFFICIAL_OFFERINGS.filter(
          (o) => o.program_semester === sem && o.is_active === 1,
        ).sort((a, b) => a.code.localeCompare(b.code)) as unknown as T[];
      }

      return OFFICIAL_OFFERINGS as unknown as T[];
    }

    // 2. Courses queries
    if (s.includes('FROM courses')) {
      if (s.includes('default_stage =') && s.includes('default_program_semester =')) {
        const stage = Number(params[0]);
        const sem = Number(params[1]);
        return OFFICIAL_COURSES.filter(
          (c) =>
            c.default_stage === stage && c.default_program_semester === sem && c.is_active === 1,
        ).sort((a, b) => a.code.localeCompare(b.code)) as unknown as T[];
      }
      if (s.includes('code =')) {
        const code = String(params[0]).toUpperCase();
        return OFFICIAL_COURSES.filter((c) => c.code.toUpperCase() === code) as unknown as T[];
      }
      if (s.includes('id =')) {
        const id = String(params[0]);
        return OFFICIAL_COURSES.filter((c) => c.id === id) as unknown as T[];
      }
      if (s.includes('is_active = 1')) {
        return OFFICIAL_COURSES.filter((c) => c.is_active === 1).sort((a, b) =>
          a.code.localeCompare(b.code),
        ) as unknown as T[];
      }
      return OFFICIAL_COURSES as unknown as T[];
    }

    // 3. Student profiles query
    if (s.includes('FROM student_profiles')) {
      if (s.includes('telegram_user_id =')) {
        const tgId = params[0] as number;
        const row = this.studentProfilesByTgId.get(tgId);
        return (row ? [row] : []) as unknown as T[];
      }
      if (s.includes('id =')) {
        const id = params[0] as string;
        const row = this.studentProfilesById.get(id);
        return (row ? [row] : []) as unknown as T[];
      }
    }

    // 4. Academic years query
    if (s.includes('FROM academic_years')) {
      return [
        {
          id: 'ay_2026_2027',
          name: '2026-2027',
          starts_on: '2026-09-01',
          ends_on: '2027-06-30',
          is_current: 1,
          created_at: '2026-09-01T00:00:00.000Z',
        },
      ] as unknown as T[];
    }

    // 4b. Academic calendar periods query
    if (s.includes('FROM academic_calendar_periods')) {
      return [
        {
          id: 'period_sem1_teaching',
          academic_year_id: 'ay_2026_2027',
          period_type: 'TEACHING',
          program_semester: 1,
          starts_on: '2026-09-01',
          ends_on: '2026-12-31',
          nominal_week_count: 16,
          stage_scope: 1,
          evidence_metadata_json: null,
          created_at: '2026-09-01T00:00:00.000Z',
        },
        {
          id: 'period_sem3_teaching',
          academic_year_id: 'ay_2026_2027',
          period_type: 'TEACHING',
          program_semester: 3,
          starts_on: '2026-09-01',
          ends_on: '2026-12-31',
          nominal_week_count: 16,
          stage_scope: 2,
          evidence_metadata_json: null,
          created_at: '2026-09-01T00:00:00.000Z',
        },
        {
          id: 'period_sem5_teaching',
          academic_year_id: 'ay_2026_2027',
          period_type: 'TEACHING',
          program_semester: 5,
          starts_on: '2026-09-01',
          ends_on: '2026-12-31',
          nominal_week_count: 16,
          stage_scope: 3,
          evidence_metadata_json: null,
          created_at: '2026-09-01T00:00:00.000Z',
        },
        {
          id: 'period_sem7_teaching',
          academic_year_id: 'ay_2026_2027',
          period_type: 'TEACHING',
          program_semester: 7,
          starts_on: '2026-09-01',
          ends_on: '2026-12-31',
          nominal_week_count: 16,
          stage_scope: 4,
          evidence_metadata_json: null,
          created_at: '2026-09-01T00:00:00.000Z',
        },
        {
          id: 'period_sem2_teaching',
          academic_year_id: 'ay_2026_2027',
          period_type: 'TEACHING',
          program_semester: 2,
          starts_on: '2027-02-01',
          ends_on: '2027-06-15',
          nominal_week_count: 16,
          stage_scope: 1,
          evidence_metadata_json: null,
          created_at: '2026-09-01T00:00:00.000Z',
        },
        {
          id: 'period_sem4_teaching',
          academic_year_id: 'ay_2026_2027',
          period_type: 'TEACHING',
          program_semester: 4,
          starts_on: '2027-02-01',
          ends_on: '2027-06-15',
          nominal_week_count: 16,
          stage_scope: 2,
          evidence_metadata_json: null,
          created_at: '2026-09-01T00:00:00.000Z',
        },
        {
          id: 'period_sem6_teaching',
          academic_year_id: 'ay_2026_2027',
          period_type: 'TEACHING',
          program_semester: 6,
          starts_on: '2027-02-01',
          ends_on: '2027-06-15',
          nominal_week_count: 16,
          stage_scope: 3,
          evidence_metadata_json: null,
          created_at: '2026-09-01T00:00:00.000Z',
        },
        {
          id: 'period_sem8_teaching',
          academic_year_id: 'ay_2026_2027',
          period_type: 'TEACHING',
          program_semester: 8,
          starts_on: '2027-02-01',
          ends_on: '2027-06-15',
          nominal_week_count: 16,
          stage_scope: 4,
          evidence_metadata_json: null,
          created_at: '2026-09-01T00:00:00.000Z',
        },
      ] as unknown as T[];
    }

    // 5. Curriculum versions query
    if (s.includes('FROM curriculum_versions')) {
      return [
        {
          id: 'cv_uob_mct_2025',
          version_name: 'University of Basrah Mechatronics Curriculum Baseline 2025',
          academic_year: '2026-2027',
          is_active: 1,
          created_at: '2026-09-01T00:00:00.000Z',
        },
      ] as unknown as T[];
    }

    // 6. Idempotency keys query
    if (s.includes('FROM idempotency_keys')) {
      const key = params[0] as string;
      const hit = this.idempotencyStore.get(key);
      return (hit ? [hit] : []) as unknown as T[];
    }

    return [] as T[];
  }

  queryOne<T = Record<string, unknown>>(sql: string, params: unknown[] = []): T | null {
    const results = this.query<T>(sql, params);
    return results.length > 0 ? results[0]! : null;
  }

  run(sql: string, params: unknown[] = []): QueryResultInfo {
    const s = sql.trim();

    // 1. Insert or update student_profiles
    if (s.includes('student_profiles')) {
      if (s.startsWith('INSERT INTO student_profiles')) {
        const profile: StoredStudentProfile = {
          id: String(params[0]),
          telegram_user_id: Number(params[1]),
          stage: typeof params[2] === 'number' ? params[2] : null,
          program_semester: typeof params[3] === 'number' ? params[3] : null,
          active_course_id: typeof params[4] === 'string' ? params[4] : null,
          active_course_offering_id: typeof params[5] === 'string' ? params[5] : null,
          locale: String(params[6] || 'ar'),
          timezone: String(params[7] || 'Asia/Baghdad'),
          notification_preferences: String(params[8] || '{}'),
          created_at: String(params[9]),
          updated_at: String(params[10]),
        };
        this.studentProfilesByTgId.set(profile.telegram_user_id, profile);
        this.studentProfilesById.set(profile.id, profile);
        this.dispatchD1Async(sql, params);
        return { changes: 1, lastInsertRowid: 1 };
      }

      if (s.startsWith('UPDATE student_profiles SET')) {
        if (s.includes('stage =') && s.includes('WHERE telegram_user_id =')) {
          // [stage, now, telegramUserId]
          const stage = params[0] as number;
          const now = params[1] as string;
          const tgId = params[2] as number;
          const existing = this.studentProfilesByTgId.get(tgId);
          if (existing) {
            existing.stage = stage;
            existing.program_semester = null;
            existing.active_course_id = null;
            existing.active_course_offering_id = null;
            existing.updated_at = now;
          } else {
            const newP: StoredStudentProfile = {
              id: `student_${tgId}`,
              telegram_user_id: tgId,
              stage,
              program_semester: null,
              active_course_id: null,
              active_course_offering_id: null,
              locale: 'ar',
              timezone: 'Asia/Baghdad',
              notification_preferences: '{}',
              created_at: now,
              updated_at: now,
            };
            this.studentProfilesByTgId.set(tgId, newP);
            this.studentProfilesById.set(newP.id, newP);
          }
          this.dispatchD1Async(sql, params);
          return { changes: 1, lastInsertRowid: 1 };
        }

        if (s.includes('program_semester =') && s.includes('WHERE telegram_user_id =')) {
          // [program_semester, now, telegramUserId]
          const sem = params[0] as number;
          const now = params[1] as string;
          const tgId = params[2] as number;
          const existing = this.studentProfilesByTgId.get(tgId);
          if (existing) {
            existing.program_semester = sem;
            existing.active_course_id = null;
            existing.active_course_offering_id = null;
            existing.updated_at = now;
          } else {
            const newP: StoredStudentProfile = {
              id: `student_${tgId}`,
              telegram_user_id: tgId,
              stage: Math.ceil(sem / 2),
              program_semester: sem,
              active_course_id: null,
              active_course_offering_id: null,
              locale: 'ar',
              timezone: 'Asia/Baghdad',
              notification_preferences: '{}',
              created_at: now,
              updated_at: now,
            };
            this.studentProfilesByTgId.set(tgId, newP);
            this.studentProfilesById.set(newP.id, newP);
          }
          this.dispatchD1Async(sql, params);
          return { changes: 1, lastInsertRowid: 1 };
        }

        if (s.includes('active_course_id =') && s.includes('WHERE telegram_user_id =')) {
          // [active_course_id, active_course_offering_id, now, telegramUserId]
          const crsId = params[0] as string;
          const offId = params[1] as string | null;
          const now = params[2] as string;
          const tgId = params[3] as number;
          const existing = this.studentProfilesByTgId.get(tgId);
          if (existing) {
            existing.active_course_id = crsId;
            existing.active_course_offering_id = offId;
            existing.updated_at = now;
          } else {
            const newP: StoredStudentProfile = {
              id: `student_${tgId}`,
              telegram_user_id: tgId,
              stage: null,
              program_semester: null,
              active_course_id: crsId,
              active_course_offering_id: offId,
              locale: 'ar',
              timezone: 'Asia/Baghdad',
              notification_preferences: '{}',
              created_at: now,
              updated_at: now,
            };
            this.studentProfilesByTgId.set(tgId, newP);
            this.studentProfilesById.set(newP.id, newP);
          }
          this.dispatchD1Async(sql, params);
          return { changes: 1, lastInsertRowid: 1 };
        }
      }
    }

    // 2. Idempotency keys
    if (s.includes('idempotency_keys')) {
      const key = params[0] as string;
      this.idempotencyStore.set(key, { key, createdAt: new Date().toISOString() });
      this.dispatchD1Async(sql, params);
      return { changes: 1, lastInsertRowid: 1 };
    }

    return { changes: 0, lastInsertRowid: 0 };
  }

  transaction<T>(fn: (tx: DatabaseConnection) => T): T {
    return fn(this);
  }

  close(): void {
    // No-op for in-memory connection
  }
}
