import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FakeClock } from '@mecha-bot/shared';
import { beforeEach, describe, expect, it } from 'vitest';
import { CompanionService, InMemoryCompanionRepository } from '../packages/companion/src/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('daily companion service', () => {
  let clock: FakeClock;
  let repository: InMemoryCompanionRepository;
  let service: CompanionService;
  let nextId: number;

  beforeEach(() => {
    clock = new FakeClock('2026-09-14T20:30:00.000Z');
    repository = new InMemoryCompanionRepository();
    nextId = 1;
    service = new CompanionService(repository, {
      clock,
      idGenerator: () => `generated-${nextId++}`,
    });
  });

  it('creates a study session with optional course and topic', () => {
    const session = service.startSession({
      studentKey: 'student-1',
      courseCode: 'ME301',
      topicKey: 'root-locus',
      type: 'STUDY',
      plannedDurationMinutes: 50,
    });
    expect(session).toMatchObject({
      id: 'generated-1',
      studentKey: 'student-1',
      courseCode: 'ME301',
      topicKey: 'root-locus',
      status: 'ACTIVE',
      startedAt: '2026-09-14T20:30:00.000Z',
    });
  });

  it('allows course and topic to be omitted', () => {
    const session = service.startSession({ studentKey: 'student-1', type: 'BREAK' });
    expect(session.courseCode).toBeUndefined();
    expect(session.topicKey).toBeUndefined();
  });

  it('uses FakeClock deterministically for active to completed', () => {
    const session = service.startSession({ studentKey: 'student-1', type: 'FOCUS' });
    clock.advanceMs(35 * 60_000);
    const completed = service.completeSession(session.id, { completionReason: 'timer ended' });
    expect(completed).toMatchObject({
      status: 'COMPLETED',
      endedAt: '2026-09-14T21:05:00.000Z',
      actualDurationMinutes: 35,
      completionReason: 'timer ended',
    });
  });

  it('supports active to cancelled and active to interrupted', () => {
    const cancelled = service.startSession({ studentKey: 'student-1', type: 'STUDY' });
    clock.advanceMs(10 * 60_000);
    expect(service.cancelSession(cancelled.id).status).toBe('CANCELLED');

    const interrupted = service.startSession({ studentKey: 'student-1', type: 'REVIEW' });
    clock.advanceMs(5 * 60_000);
    expect(service.interruptSession(interrupted.id).status).toBe('INTERRUPTED');
  });

  it('enforces one active session per student while keeping students independent', () => {
    service.startSession({ studentKey: 'student-1', type: 'STUDY' });
    expect(() => service.startSession({ studentKey: 'student-1', type: 'FOCUS' })).toThrow(
      /already has active/i,
    );
    expect(() => service.startSession({ studentKey: 'student-2', type: 'FOCUS' })).not.toThrow();
  });

  it('rejects an invalid transition after completion', () => {
    const session = service.startSession({ studentKey: 'student-1', type: 'PRACTICE' });
    clock.advanceMs(60_000);
    service.completeSession(session.id);
    expect(() => service.cancelSession(session.id)).toThrow(/cannot transition/i);
  });

  it('creates and updates one same-day daily check-in', () => {
    const created = service.saveDailyCheckIn({
      studentKey: 'student-1',
      studiedToday: false,
      note: 'Not yet',
    });
    expect(created.localDate).toBe('2026-09-14');
    clock.advanceMs(15 * 60_000);
    const updated = service.saveDailyCheckIn({
      studentKey: 'student-1',
      studiedToday: true,
      courseCode: 'ME301',
      selfReportedConfidence: 4,
      difficulty: 'Stability margins',
    });
    expect(updated.id).toBe(created.id);
    expect(updated.createdAt).toBe(created.createdAt);
    expect(updated.updatedAt).toBe('2026-09-14T20:45:00.000Z');
    expect(repository.listCheckIns('student-1')).toHaveLength(1);
  });

  it('validates confidence as a bounded self-report', () => {
    expect(() =>
      service.saveDailyCheckIn({
        studentKey: 'student-1',
        studiedToday: true,
        selfReportedConfidence: 0,
      }),
    ).toThrow(/1 to 5/);
    expect(() =>
      service.saveDailyCheckIn({
        studentKey: 'student-1',
        studiedToday: true,
        selfReportedConfidence: 6,
      }),
    ).toThrow(/1 to 5/);
  });

  it('records separate progress signals and applies deterministic state policy', () => {
    service.recordProgressSignal({
      studentKey: 'student-1',
      courseCode: 'ME301',
      topicKey: 'root-locus',
      type: 'SELF_RATING',
      selfReportedConfidence: 4,
      occurredAt: clock.nowIso(),
    });
    service.recordProgressSignal({
      studentKey: 'student-1',
      courseCode: 'ME301',
      topicKey: 'root-locus',
      type: 'QUIZ_RESULT',
      quizDerivedPerformance: { score: 8, maxScore: 10, percentage: 80 },
      occurredAt: clock.nowIso(),
    });
    const summary = service.getTopicProgress('student-1', 'ME301', 'root-locus');
    expect(summary.state).toBe('COMFORTABLE');
    expect(summary.latestSelfReportedConfidence).toBe(4);
    expect(summary.latestQuizDerivedPerformance).toEqual({
      score: 8,
      maxScore: 10,
      percentage: 80,
    });
    expect(JSON.stringify(summary)).not.toMatch(/mastered/i);
  });

  it('stores catch-up metadata as student facts without lecturer inference', () => {
    const state = service.updateCourseState({
      studentKey: 'student-1',
      courseCode: 'ME301',
      lastAttendedTopic: 'root-locus',
      lastUnderstoodTopic: 'routh-hurwitz',
      missedFromDate: '2026-09-10',
      catchUpRequestedAt: clock.nowIso(),
    });
    expect(state).toMatchObject({
      lastAttendedTopic: 'root-locus',
      lastUnderstoodTopic: 'routh-hurwitz',
      missedFromDate: '2026-09-10',
    });
  });

  it('derives Baghdad local date instead of the UTC calendar date', () => {
    expect(service.getTodayLocalDate()).toBe('2026-09-14');
    clock.setTime('2026-09-14T21:30:00.000Z');
    expect(service.getTodayLocalDate()).toBe('2026-09-15');
    expect(
      service.saveDailyCheckIn({ studentKey: 'student-1', studiedToday: true }).localDate,
    ).toBe('2026-09-15');
  });

  it('has no AI, Telegram, or scheduler dependency', () => {
    const sourceDir = path.resolve(__dirname, '../packages/companion/src');
    const source = readdirSync(sourceDir)
      .filter((file) => file.endsWith('.ts'))
      .map((file) => readFileSync(path.join(sourceDir, file), 'utf8'))
      .join('\n');
    expect(source).not.toMatch(/@mecha-bot\/(?:ai|telegram|scheduler)/);
  });
});
