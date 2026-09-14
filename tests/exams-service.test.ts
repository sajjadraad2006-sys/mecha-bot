import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FakeClock } from '@mecha-bot/shared';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  ExamsService,
  InMemoryExamsRepository,
  type PracticeQuiz,
} from '../packages/exams/src/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('exams and academic events service', () => {
  let clock: FakeClock;
  let repository: InMemoryExamsRepository;
  let service: ExamsService;
  let nextId: number;

  beforeEach(() => {
    clock = new FakeClock('2026-09-14T08:00:00.000Z');
    repository = new InMemoryExamsRepository();
    nextId = 1;
    service = new ExamsService(repository, {
      clock,
      idGenerator: () => `generated-${nextId++}`,
    });
  });

  function createMixedQuiz(): PracticeQuiz {
    return service.createPracticeQuiz({
      courseCode: 'ME301',
      title: 'Control Systems Practice',
      questions: [
        {
          id: 'mcq-1',
          type: 'MULTIPLE_CHOICE',
          prompt: 'Choose the stable region.',
          points: 2,
          options: [
            { id: 'left', text: 'Left half-plane' },
            { id: 'right', text: 'Right half-plane' },
          ],
          correctOptionId: 'left',
        },
        {
          id: 'tf-1',
          type: 'TRUE_FALSE',
          prompt: 'Routh-Hurwitz is deterministic.',
          points: 1,
          correctAnswer: true,
        },
      ],
    });
  }

  it('creates a confirmed quiz event with coverage', () => {
    const event = service.createEvent({
      courseCode: 'ME301',
      type: 'QUIZ',
      title: 'Root Locus Quiz',
      occursAt: '2026-09-20T07:00:00.000Z',
      sourceStatus: 'OFFICIAL_SOURCE',
      confirmationStatus: 'CONFIRMED',
      coverage: [
        { courseCode: 'ME301', topicKey: 'root-locus', status: 'CONFIRMED' },
        {
          courseCode: 'ME301',
          freeTextLabel: 'Stability margins',
          status: 'STUDENT_REPORTED',
        },
      ],
    });
    expect(event.type).toBe('QUIZ');
    expect(event.confirmationStatus).toBe('CONFIRMED');
    expect(event.coverage.map((item) => item.status)).toEqual(['CONFIRMED', 'STUDENT_REPORTED']);
  });

  it('creates midterm and final exam events at explicit dates', () => {
    const midterm = service.createEvent({
      courseCode: 'ME301',
      type: 'MIDTERM',
      title: 'Midterm',
      occursAt: '2026-11-01T07:00:00.000Z',
      sourceStatus: 'ADMIN_REPORTED',
      confirmationStatus: 'ADMIN_ENTERED',
    });
    const final = service.createEvent({
      courseCode: 'ME301',
      type: 'FINAL_EXAM',
      title: 'Final Exam',
      occursAt: '2027-01-15T06:00:00.000Z',
      sourceStatus: 'OFFICIAL_SOURCE',
      confirmationStatus: 'CONFIRMED',
    });
    expect(midterm.occursAt).toBe('2026-11-01T07:00:00.000Z');
    expect(final.type).toBe('FINAL_EXAM');
  });

  it('creates an assignment deadline using dueAt', () => {
    const event = service.createEvent({
      studentKey: 'student-1',
      courseCode: 'ME301',
      type: 'ASSIGNMENT',
      title: 'Lab report',
      dueAt: '2026-09-30T20:59:59.000Z',
      sourceStatus: 'STUDENT_REPORTED',
      confirmationStatus: 'STUDENT_ENTERED',
    });
    expect(event.dueAt).toBe('2026-09-30T20:59:59.000Z');
    expect(event.studentKey).toBe('student-1');
  });

  it('rejects invalid events', () => {
    expect(() =>
      service.createEvent({
        courseCode: 'ME301',
        type: 'FINAL_EXAM',
        title: 'Undated exam',
        sourceStatus: 'INFERRED',
        confirmationStatus: 'INFERRED_UNCONFIRMED',
      }),
    ).toThrow(/requires occursAt/);
  });

  it('never upgrades inferred events or inferred coverage', () => {
    const event = service.createEvent({
      courseCode: 'ME301',
      type: 'QUIZ',
      title: 'Possible quiz',
      occursAt: '2026-09-27T07:00:00.000Z',
      sourceStatus: 'INFERRED',
      confirmationStatus: 'INFERRED_UNCONFIRMED',
      coverage: [
        {
          courseCode: 'ME301',
          topicKey: 'stability',
          status: 'INFERRED_UNCONFIRMED',
          evidenceSource: 'course sequence',
        },
      ],
    });
    expect(event.confirmationStatus).toBe('INFERRED_UNCONFIRMED');
    expect(event.coverage[0]?.status).toBe('INFERRED_UNCONFIRMED');
  });

  it('preserves confirmed status on a student-scoped event', () => {
    const event = service.createEvent({
      studentKey: 'student-1',
      courseCode: 'ME301',
      type: 'QUIZ',
      title: 'Confirmed personal quiz entry',
      occursAt: '2026-09-27T07:00:00.000Z',
      sourceStatus: 'STUDENT_REPORTED',
      confirmationStatus: 'CONFIRMED',
    });
    expect(event.confirmationStatus).toBe('CONFIRMED');
  });

  it('deduplicates a repeated confirmed event by fingerprint', () => {
    const input = {
      courseCode: 'ME301',
      type: 'QUIZ' as const,
      title: ' Root   Locus Quiz ',
      occursAt: '2026-09-20T07:00:00.000Z',
      sourceStatus: 'OFFICIAL_SOURCE' as const,
      confirmationStatus: 'CONFIRMED' as const,
    };
    const first = service.createEvent(input);
    const second = service.createEvent({ ...input, title: 'root locus quiz' });
    expect(second.id).toBe(first.id);
    expect(repository.listEvents()).toHaveLength(1);
  });

  it('creates verified and unverified past questions without coupling solution status', () => {
    const verified = service.createPastQuestion({
      courseCode: 'ME301',
      academicYear: '2025-2026',
      examType: 'FINAL_EXAM',
      questionNumber: '1',
      questionText: 'Sketch the root locus.',
      topicKeys: ['root-locus'],
      sourceRef: 'archive-2026',
      page: 2,
      solutionStatus: 'UNVERIFIED',
      verificationStatus: 'VERIFIED',
    });
    const unverified = service.createPastQuestion({
      courseCode: 'ME301',
      academicYear: '2024-2025',
      questionText: 'State the stability condition.',
      solutionStatus: 'NONE',
      verificationStatus: 'UNVERIFIED',
    });
    expect(verified.verificationStatus).toBe('VERIFIED');
    expect(verified.solutionStatus).toBe('UNVERIFIED');
    expect(unverified.verificationStatus).toBe('UNVERIFIED');
    expect(unverified.solutionStatus).toBe('NONE');
  });

  it('creates an MCQ and true/false practice quiz', () => {
    const quiz = createMixedQuiz();
    expect(quiz.questionIds).toEqual(['mcq-1', 'tf-1']);
    expect(repository.getQuestion('mcq-1')?.type).toBe('MULTIPLE_CHOICE');
    expect(repository.getQuestion('tf-1')?.type).toBe('TRUE_FALSE');
  });

  it('runs the attempt lifecycle and scores exact answers', () => {
    const quiz = createMixedQuiz();
    const attempt = service.startAttempt(quiz.id, 'student-1', 'attempt-1');
    expect(attempt).toMatchObject({ status: 'IN_PROGRESS', rawScore: 0, maxScore: 3 });
    clock.advanceMs(5 * 60_000);
    const submitted = service.submitAttempt(attempt.id, { 'mcq-1': 'left', 'tf-1': false });
    expect(submitted).toMatchObject({
      status: 'SUBMITTED',
      rawScore: 2,
      maxScore: 3,
      percentage: 66.67,
      submittedAt: '2026-09-14T08:05:00.000Z',
    });
  });

  it('scores unanswered questions as zero and awards no fuzzy credit', () => {
    const quiz = createMixedQuiz();
    const attempt = service.startAttempt(quiz.id, 'student-1');
    const submitted = service.submitAttempt(attempt.id, { 'mcq-1': 'Left' });
    expect(submitted.rawScore).toBe(0);
    expect(submitted.percentage).toBe(0);
  });

  it('supports cancellation and prevents terminal-state submission', () => {
    const quiz = createMixedQuiz();
    const attempt = service.startAttempt(quiz.id, 'student-1');
    expect(service.cancelAttempt(attempt.id).status).toBe('CANCELLED');
    expect(() => service.submitAttempt(attempt.id, {})).toThrow(/cannot submit/i);
  });

  it('keeps attempts independent across students with deterministic scores', () => {
    const quiz = createMixedQuiz();
    const first = service.startAttempt(quiz.id, 'student-1');
    const second = service.startAttempt(quiz.id, 'student-2');
    const firstResult = service.submitAttempt(first.id, { 'mcq-1': 'left', 'tf-1': true });
    const secondResult = service.submitAttempt(second.id, { 'mcq-1': 'right', 'tf-1': false });
    expect(firstResult.percentage).toBe(100);
    expect(secondResult.percentage).toBe(0);
    expect(repository.listAttempts(quiz.id, 'student-1')).toHaveLength(1);
    expect(repository.listAttempts(quiz.id, 'student-2')).toHaveLength(1);
  });

  it('has no AI, Telegram, scheduler, or ingestion dependency', () => {
    const sourceDir = path.resolve(__dirname, '../packages/exams/src');
    const source = readdirSync(sourceDir)
      .filter((file) => file.endsWith('.ts'))
      .map((file) => readFileSync(path.join(sourceDir, file), 'utf8'))
      .join('\n');
    expect(source).not.toMatch(/@mecha-bot\/(?:ai|telegram|scheduler)|tools\/ingestion/);
  });
});
