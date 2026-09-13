import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  SqliteDatabaseConnection,
  MigrationRunner,
  StudentRepository,
  AcademicRepository,
  SourceRepository,
  EventRepository,
  AuditRepository,
} from '@mecha-bot/database';
import {
  SYNTHETIC_ACADEMIC_YEAR,
  SYNTHETIC_COURSES,
  SYNTHETIC_OFFERINGS,
  SourceAuthority,
  EvidenceScope,
} from '@mecha-bot/academic';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsDir = path.resolve(__dirname, '../migrations');

describe('Database Foundation, Migrations & Repositories', () => {
  let db: SqliteDatabaseConnection;

  beforeEach(() => {
    db = new SqliteDatabaseConnection(':memory:');
  });

  afterEach(() => {
    db.close();
  });

  it('applies migrations cleanly to an empty database', () => {
    const runner = new MigrationRunner(db, migrationsDir);
    const applied = runner.migrate();
    expect(applied.length).toBeGreaterThan(0);
    expect(applied).toContain('0001_initial_schema.sql');

    const appliedRecords = runner.getAppliedMigrations();
    expect(appliedRecords.length).toBe(applied.length);
    expect(appliedRecords[0]?.name).toBe('0001_initial_schema.sql');
    expect(appliedRecords[0]?.checksum).toBeDefined();
  });

  it('migrations are idempotent and repeatable without re-applying', () => {
    const runner = new MigrationRunner(db, migrationsDir);
    runner.migrate();

    // Second run should apply 0 migrations
    const secondRun = runner.migrate();
    expect(secondRun.length).toBe(0);
  });

  it('strictly enforces foreign key constraints', () => {
    const runner = new MigrationRunner(db, migrationsDir);
    runner.migrate();

    const academicRepo = new AcademicRepository(db);

    // Attempting to insert a course with non-existent curriculum_version_id must fail
    expect(() => {
      academicRepo.createCourse({
        id: 'course_invalid',
        code: 'INVALID101',
        nameAr: 'مقرر تجريبي غير صالح',
        nameEn: 'Invalid Course',
        defaultStage: 1,
        defaultProgramSemester: 1,
        isActive: true,
        curriculumVersionId: 'non_existent_curriculum_version',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }).toThrow(/FOREIGN KEY/i);
  });

  it('enforces unique constraints', () => {
    const runner = new MigrationRunner(db, migrationsDir);
    runner.migrate();

    const academicRepo = new AcademicRepository(db);
    academicRepo.createCurriculumVersion('cv_synthetic_v1', 'Version 1', '2026-2027');

    academicRepo.createCourse(SYNTHETIC_COURSES[0]!);

    // Attempting to create duplicate course code must fail
    expect(() => {
      academicRepo.createCourse({
        ...SYNTHETIC_COURSES[0]!,
        id: 'different_id_same_code',
      });
    }).toThrow(/UNIQUE constraint failed/i);
  });

  it('properly rolls back transactions upon error', () => {
    const runner = new MigrationRunner(db, migrationsDir);
    runner.migrate();

    const academicRepo = new AcademicRepository(db);
    academicRepo.createAcademicYear(SYNTHETIC_ACADEMIC_YEAR);

    expect(() => {
      db.transaction((tx) => {
        tx.run(
          'INSERT INTO curriculum_versions (id, version_name, academic_year, is_active, created_at) VALUES (?, ?, ?, 1, ?);',
          ['cv_trans_1', 'Trans Version 1', '2026-2027', new Date().toISOString()],
        );

        // Force a foreign key failure inside the same transaction
        tx.run(
          'INSERT INTO courses (id, code, name_ar, name_en, default_stage, default_program_semester, is_active, curriculum_version_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);',
          [
            'c_fail',
            'FAIL101',
            'فشل',
            'Fail',
            1,
            1,
            1,
            'invalid_fk',
            new Date().toISOString(),
            new Date().toISOString(),
          ],
        );
      });
    }).toThrow();

    // Verify that curriculum_versions was rolled back
    const row = db.queryOne('SELECT * FROM curriculum_versions WHERE id = ?;', ['cv_trans_1']);
    expect(row).toBeNull();
  });

  it('supports basic repository CRUD operations across domain entities', () => {
    const runner = new MigrationRunner(db, migrationsDir);
    runner.migrate();

    const studentRepo = new StudentRepository(db);
    const academicRepo = new AcademicRepository(db);
    const sourceRepo = new SourceRepository(db);
    const eventRepo = new EventRepository(db);
    const auditRepo = new AuditRepository(db);

    // 1. Student Profile
    studentRepo.upsert({
      id: 'student_1',
      telegramUserId: 12345678,
      stage: 2,
      programSemester: 3,
      activeCourseId: null,
      locale: 'ar',
      timezone: 'Asia/Baghdad',
      notificationPreferences: { dailyCheckin: true },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const student = studentRepo.findByTelegramId(12345678);
    expect(student).not.toBeNull();
    expect(student?.stage).toBe(2);
    expect(student?.programSemester).toBe(3);
    expect(student?.notificationPreferences).toEqual({ dailyCheckin: true });

    // 2. Academic Course & Offering
    academicRepo.createAcademicYear(SYNTHETIC_ACADEMIC_YEAR);
    academicRepo.createCurriculumVersion('cv_synthetic_v1', 'Synthetic v1', '2026-2027');
    academicRepo.createCourse(SYNTHETIC_COURSES[0]!);
    academicRepo.createCourseOffering(SYNTHETIC_OFFERINGS[0]!);

    const course = academicRepo.findCourseByCode('TEST101');
    expect(course).not.toBeNull();
    expect(course?.code).toBe('TEST101');

    // 3. Source & Source Evidence
    sourceRepo.createSource({
      id: 'src_1',
      courseId: course!.id,
      title: 'Synthetic Course Syllabus',
      sourceType: 'SYLLABUS',
      authorityClass: SourceAuthority.OFFICIAL_DEPARTMENT,
      academicYear: '2026-2027',
      lecturerName: null,
      isVerified: true,
      distributionPermission: 'ALLOWED',
      telegramFileId: 'tg_file_123',
      driveFileId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    sourceRepo.createSourceEvidence({
      id: 'ev_1',
      sourceId: 'src_1',
      evidenceScope: EvidenceScope.EXACT_COURSE,
      originUrl: 'https://uobasrah.edu.iq/mechatronics/syllabus',
      originDepartment: 'Mechatronics Engineering',
      originUniversity: 'University of Basrah',
      academicYear: '2026-2027',
      validFromAcademicYear: '2026-2027',
      validToAcademicYear: null,
      isVerified: true,
      verifiedAt: new Date().toISOString(),
      verifiedBy: 'dept_head',
      distributionAllowed: true,
      accessRightsNotes: 'Public official document',
      searchableCopyAvailable: true,
      isArchived: false,
      createdAt: new Date().toISOString(),
    });

    const source = sourceRepo.getSourceById('src_1');
    const evidence = sourceRepo.getSourceEvidence('src_1');
    expect(source?.title).toBe('Synthetic Course Syllabus');
    expect(evidence?.evidenceScope).toBe(EvidenceScope.EXACT_COURSE);

    // 4. Academic Events & Reminders
    eventRepo.createAcademicEvent({
      id: 'event_1',
      courseId: course!.id,
      eventType: 'QUIZ',
      title: 'Synthetic Quiz 1',
      description: 'First test quiz',
      eventDate: '2026-10-20',
      createdAt: new Date().toISOString(),
    });

    const events = eventRepo.listEventsForCourse(course!.id);
    expect(events.length).toBe(1);
    expect(events[0]?.title).toBe('Synthetic Quiz 1');

    eventRepo.createReminder({
      id: 'rem_1',
      studentId: student!.id,
      title: 'Study Reminder',
      scheduledAt: '2026-10-19T18:00:00.000Z',
      isSent: false,
      idempotencyKey: 'rem_key_123',
      createdAt: new Date().toISOString(),
    });

    const dueReminders = eventRepo.getPendingReminders('2026-10-20T00:00:00.000Z');
    expect(dueReminders.length).toBe(1);
    eventRepo.markReminderSent('rem_1');
    const afterSent = eventRepo.getPendingReminders('2026-10-20T00:00:00.000Z');
    expect(afterSent.length).toBe(0);

    // 5. Audit & AI Usage Logs
    auditRepo.logAudit({
      id: 'audit_1',
      actorId: 'telegram_user_12345678',
      action: 'COURSE_LOOKUP',
      entityType: 'COURSE',
      entityId: course!.id,
      detailsJson: JSON.stringify({ query: 'TEST101' }),
      createdAt: new Date().toISOString(),
    });

    auditRepo.logAiUsage({
      id: 'ai_usage_1',
      provider: 'fake-ai',
      intent: 'GENERAL',
      promptTokens: 50,
      completionTokens: 120,
      latencyMs: 15,
      isSuccess: true,
      createdAt: new Date().toISOString(),
    });

    expect(auditRepo.getAiUsageCount()).toBe(1);
  });
});
