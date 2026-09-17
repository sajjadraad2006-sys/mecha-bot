import { describe, it, expect } from 'vitest';
import { createWorkerMechaBotApp } from '../apps/worker/src/worker-app-factory.js';
import { createWorkerDatabaseConnection } from '../apps/worker/src/index.js';
import { SystemClock } from '../packages/shared/src/clock.js';
import { AcademicRepository } from '../packages/database/src/repositories/academic-repository.js';

describe('Worker App Factory & Bundled Academic Assets', () => {
  const env = {
    TELEGRAM_BOT_TOKEN: '123456:mock-token',
    NODE_ENV: 'test',
    ADMIN_USER_IDS: '1417868079',
  };

  it('instantiates MechaBotApp with all 11 domain services', () => {
    const { app, calendarService } = createWorkerMechaBotApp(env, new SystemClock());

    expect(app).toBeDefined();
    expect(app.dataset).toBeDefined();
    expect(app.navigator).toBeDefined();
    expect(app.companion).toBeDefined();
    expect(app.timetable).toBeDefined();
    expect(app.scheduler).toBeDefined();
    expect(app.searchEngine).toBeDefined();
    expect(app.distribution).toBeDefined();
    expect(app.exams).toBeDefined();
    expect(app.admin).toBeDefined();
    expect(app.dashboard).toBeDefined();
    expect(calendarService).toBeDefined();
  });

  it('contains all 55 Mechatronics courses in bundled academic dataset', () => {
    const { app } = createWorkerMechaBotApp(env);
    expect(app.dataset.profiles.length).toBe(55);

    // Verify key courses from Stage 1 to Stage 4
    expect(app.dataset.profilesByCode.has('MCT111')).toBe(true);
    expect(app.dataset.profilesByCode.has('MCT211')).toBe(true);
    expect(app.dataset.profilesByCode.has('MCT314')).toBe(true);
    expect(app.dataset.profilesByCode.has('MCT411')).toBe(true);
  });

  it('pre-populates file catalog with 208 verified materials (4 per course)', async () => {
    const { app } = createWorkerMechaBotApp(env);
    const mct111Files = await app.distribution.listCourseFiles('MCT111', 'test-student');

    expect(mct111Files.length).toBe(4);
    expect(mct111Files.some((f) => f.documentType === 'TEXTBOOK')).toBe(true);
    expect(mct111Files.every((f) => f.distributionPolicy.canDistribute)).toBe(true);
  });

  it('provides weekly timetable schedule for all stages', () => {
    const { app } = createWorkerMechaBotApp(env);

    // Stage 1, Semester 1 on Monday
    const slotsStg1 = app.getSchedule({
      studentKey: 'student_1',
      stage: 1,
      programSemester: 1,
      date: '2026-10-12', // Monday
    });
    expect(slotsStg1.length).toBeGreaterThan(0);

    // Stage 3, Semester 5 on Sunday
    const slotsStg3 = app.getSchedule({
      studentKey: 'student_3',
      stage: 3,
      programSemester: 5,
      date: '2026-10-11', // Sunday
    });
    expect(slotsStg3.length).toBeGreaterThan(0);
  });

  it('indexes and executes BM25 search across curriculum and materials', async () => {
    const { app } = createWorkerMechaBotApp(env);

    // Search for Thomas Calculus
    const resTextbook = await app.search('student_1', { text: 'Thomas Calculus' });
    expect(resTextbook.hits.length).toBeGreaterThan(0);
    expect(resTextbook.hits[0]!.searchResult.textOriginal).toContain('Thomas');

    // Search for Control Systems
    const resControl = await app.search('student_1', { text: 'السيطرة' });
    expect(resControl.hits.length).toBeGreaterThan(0);
  });

  it('pre-configures exam milestones and practice quizzes with scoring', () => {
    const { app } = createWorkerMechaBotApp(env);

    const mct111Events = app.exams.listEvents('MCT111');
    expect(mct111Events.length).toBeGreaterThan(0);
    expect(mct111Events[0]!.type).toBe('MIDTERM');

    const quiz = app.exams.getQuiz('quiz_mct111_01');
    expect(quiz).toBeDefined();
    expect(quiz.questionIds.length).toBe(2);

    // Student starts attempt and submits correct answer
    const attempt = app.exams.startAttempt('quiz_mct111_01', 'student_test');
    const evaluated = app.exams.submitAttempt(attempt.id, { mct111_q1: 'b' });
    expect(evaluated.status).toBe('SUBMITTED');
    expect(evaluated.rawScore).toBeGreaterThan(0);
  });

  it('WorkerDatabaseConnection serves academic calendar periods for Basrah', () => {
    const db = createWorkerDatabaseConnection();
    const academicRepo = new AcademicRepository(db);

    const periods = academicRepo.getCalendarPeriods('ay_2026_2027');
    expect(periods.length).toBe(8);
    expect(periods.some((p) => p.programSemester === 1)).toBe(true);
    expect(periods.some((p) => p.programSemester === 5)).toBe(true);
  });
});
