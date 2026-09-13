import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  SqliteDatabaseConnection,
  MigrationRunner,
  AcademicRepository,
  StudentRepository,
} from '@mecha-bot/database';
import {
  SYNTHETIC_ACADEMIC_YEAR,
  SYNTHETIC_COURSES,
  SYNTHETIC_OFFERINGS,
} from '@mecha-bot/academic';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsDir = path.resolve(__dirname, '../migrations');

describe('Course Pulse & Student Mid-Semester Baseline Foundation', () => {
  let db: SqliteDatabaseConnection;
  let academicRepo: AcademicRepository;
  let studentRepo: StudentRepository;

  beforeEach(() => {
    db = new SqliteDatabaseConnection(':memory:');
    const runner = new MigrationRunner(db, migrationsDir);
    runner.migrate();

    academicRepo = new AcademicRepository(db);
    studentRepo = new StudentRepository(db);

    // Setup base data
    academicRepo.createAcademicYear(SYNTHETIC_ACADEMIC_YEAR);
    academicRepo.createCurriculumVersion('cv_synthetic_v1', 'Synthetic v1', '2026-2027');
    academicRepo.createCourse(SYNTHETIC_COURSES[0]!);
    academicRepo.createCourseOffering(SYNTHETIC_OFFERINGS[0]!);
  });

  afterEach(() => {
    db.close();
  });

  it('persists and updates where the class has actually reached via course pulse', () => {
    academicRepo.upsertCoursePulse({
      id: 'pulse_101',
      courseOfferingId: SYNTHETIC_OFFERINGS[0]!.id,
      currentTopicId: null,
      currentSubtopicId: null,
      actualTeachingWeek: 5,
      progressNote: 'Completed chapter 2 fundamentals',
      confidenceStatus: 'HIGH',
      updatedBy: 'lecturer_admin',
      updatedAt: '2026-10-25T10:00:00.000Z',
    });

    const pulse = academicRepo.getCoursePulse(SYNTHETIC_OFFERINGS[0]!.id);
    expect(pulse).not.toBeNull();
    expect(pulse?.actualTeachingWeek).toBe(5);
    expect(pulse?.progressNote).toBe('Completed chapter 2 fundamentals');
    expect(pulse?.confidenceStatus).toBe('HIGH');
  });

  it('records student baseline state when joining mid-semester', () => {
    studentRepo.upsert({
      id: 'student_join_week7',
      telegramUserId: 987654321,
      stage: 1,
      programSemester: 1,
      activeCourseId: SYNTHETIC_COURSES[0]!.id,
      locale: 'ar',
      timezone: 'Asia/Baghdad',
      notificationPreferences: {},
      createdAt: '2026-11-01T08:00:00.000Z',
      updatedAt: '2026-11-01T08:00:00.000Z',
    });

    academicRepo.upsertStudentCourseState({
      id: 'state_join_week7',
      studentId: 'student_join_week7',
      courseOfferingId: SYNTHETIC_OFFERINGS[0]!.id,
      joinedAt: '2026-11-01T08:00:00.000Z',
      baselineTopicId: null,
      baselineSource: 'STUDENT_CONFIRMED',
      baselineConfidence: 'HIGH',
      lastActiveTopicId: null,
      updatedAt: '2026-11-01T08:00:00.000Z',
    });

    const studentState = academicRepo.getStudentCourseState(
      'student_join_week7',
      SYNTHETIC_OFFERINGS[0]!.id,
    );

    expect(studentState).not.toBeNull();
    expect(studentState?.baselineSource).toBe('STUDENT_CONFIRMED');
    expect(studentState?.baselineConfidence).toBe('HIGH');
    expect(studentState?.joinedAt).toBe('2026-11-01T08:00:00.000Z');
  });
});
