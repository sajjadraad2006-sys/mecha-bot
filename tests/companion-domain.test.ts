import { describe, expect, it } from 'vitest';
import {
  calculateActualDurationMinutes,
  calculateStudyConsistency,
  deriveStudentTopicState,
  summarizeTopicProgress,
  transitionStudySession,
  type ProgressSignal,
  type StudySession,
} from '../packages/companion/src/index.js';

function completedSession(id: string, startedAt: string, endedAt: string): StudySession {
  return {
    id,
    studentKey: 'student-1',
    type: 'STUDY',
    startedAt,
    endedAt,
    actualDurationMinutes: calculateActualDurationMinutes(startedAt, endedAt),
    status: 'COMPLETED',
    createdAt: startedAt,
  };
}

describe('daily companion domain', () => {
  it('calculates actual duration deterministically without negative durations', () => {
    expect(
      calculateActualDurationMinutes('2026-09-14T09:00:00.000Z', '2026-09-14T09:45:00.000Z'),
    ).toBe(45);
    expect(() =>
      calculateActualDurationMinutes('2026-09-14T10:00:00.000Z', '2026-09-14T09:59:00.000Z'),
    ).toThrow(/cannot end before/i);
  });

  it('allows active completion and rejects impossible transitions', () => {
    const active: StudySession = {
      id: 'session-1',
      studentKey: 'student-1',
      type: 'FOCUS',
      startedAt: '2026-09-14T09:00:00.000Z',
      status: 'ACTIVE',
      createdAt: '2026-09-14T09:00:00.000Z',
    };
    const completed = transitionStudySession(active, 'COMPLETED', '2026-09-14T09:25:00.000Z');
    expect(completed).toMatchObject({ status: 'COMPLETED', actualDurationMinutes: 25 });
    expect(() =>
      transitionStudySession(completed, 'CANCELLED', '2026-09-14T09:30:00.000Z'),
    ).toThrow(/cannot transition/i);
  });

  it('keeps self-rating and quiz-derived performance as separate signals', () => {
    const signals: ProgressSignal[] = [
      {
        id: 'self-1',
        studentKey: 'student-1',
        courseCode: 'ME301',
        topicKey: 'root-locus',
        type: 'SELF_RATING',
        selfReportedConfidence: 5,
        occurredAt: '2026-09-14T09:00:00.000Z',
        createdAt: '2026-09-14T09:00:00.000Z',
      },
      {
        id: 'quiz-1',
        studentKey: 'student-1',
        courseCode: 'ME301',
        topicKey: 'root-locus',
        type: 'QUIZ_RESULT',
        quizDerivedPerformance: { score: 4, maxScore: 10, percentage: 40 },
        occurredAt: '2026-09-14T10:00:00.000Z',
        createdAt: '2026-09-14T10:00:00.000Z',
      },
    ];

    const summary = summarizeTopicProgress('student-1', 'ME301', 'root-locus', signals);
    expect(summary.latestSelfReportedConfidence).toBe(5);
    expect(summary.latestQuizDerivedPerformance?.percentage).toBe(40);
    expect(summary.signalCounts.SELF_RATING).toBe(1);
    expect(summary.signalCounts.QUIZ_RESULT).toBe(1);
    expect(summary.state).toBe('REVIEW_NEEDED');
    expect(Object.values(summary)).not.toContain('MASTERED');
  });

  it('derives explainable topic states and never invents mastery', () => {
    expect(deriveStudentTopicState([])).toBe('NEW');
    const repeated: ProgressSignal[] = [
      {
        id: 'repeat-1',
        studentKey: 'student-1',
        courseCode: 'ME301',
        topicKey: 'stability',
        type: 'REPEATED_QUESTION',
        count: 2,
        occurredAt: '2026-09-14T09:00:00.000Z',
        createdAt: '2026-09-14T09:00:00.000Z',
      },
    ];
    expect(deriveStudentTopicState(repeated)).toBe('STRUGGLING');

    const manual: ProgressSignal[] = [
      ...repeated,
      {
        id: 'manual-1',
        studentKey: 'student-1',
        courseCode: 'ME301',
        topicKey: 'stability',
        type: 'MANUAL_STUDENT_STATUS',
        state: 'LEARNING',
        occurredAt: '2026-09-14T10:00:00.000Z',
        createdAt: '2026-09-14T10:00:00.000Z',
      },
    ];
    expect(deriveStudentTopicState(manual)).toBe('LEARNING');
  });

  it('counts 7-day, 30-day, streak, and total-minute metrics', () => {
    const sessions = [
      completedSession('s1', '2026-09-12T18:30:00.000Z', '2026-09-12T19:00:00.000Z'),
      completedSession('s2', '2026-09-13T18:30:00.000Z', '2026-09-13T19:00:00.000Z'),
      completedSession('s3', '2026-09-14T06:00:00.000Z', '2026-09-14T06:45:00.000Z'),
      completedSession('old', '2026-08-20T06:00:00.000Z', '2026-08-20T06:15:00.000Z'),
    ];
    const metrics = calculateStudyConsistency(
      sessions,
      new Date('2026-09-14T12:00:00.000Z'),
      'Asia/Baghdad',
    );
    expect(metrics).toEqual({
      daysStudiedLast7Days: 3,
      daysStudiedLast30Days: 4,
      currentStudyDayStreak: 3,
      totalCompletedStudyMinutes: 120,
    });
  });

  it('uses Baghdad local dates across a UTC date boundary', () => {
    const sessions = [
      completedSession('late', '2026-09-13T21:00:00.000Z', '2026-09-13T21:30:00.000Z'),
    ];
    const metrics = calculateStudyConsistency(
      sessions,
      new Date('2026-09-14T20:00:00.000Z'),
      'Asia/Baghdad',
    );
    expect(metrics.daysStudiedLast7Days).toBe(1);
    expect(metrics.currentStudyDayStreak).toBe(1);
  });
});
