import { describe, expect, it } from 'vitest';
import {
  createAcademicEventFingerprint,
  createPastQuestionFingerprint,
  normalizeCoverage,
  scoreQuiz,
  validateAcademicEventInput,
  validatePastExamQuestionInput,
  validatePracticeQuizInput,
  type CreateAcademicEventInput,
  type QuizQuestion,
} from '../packages/exams/src/index.js';

const quizQuestions: QuizQuestion[] = [
  {
    id: 'mcq-1',
    type: 'MULTIPLE_CHOICE',
    prompt: 'Which point is stable?',
    points: 2,
    options: [
      { id: 'a', text: 'A' },
      { id: 'b', text: 'B' },
    ],
    correctOptionId: 'b',
  },
  {
    id: 'tf-1',
    type: 'TRUE_FALSE',
    prompt: 'A pole can be complex.',
    points: 1,
    correctAnswer: true,
  },
];

function baseEvent(overrides: Partial<CreateAcademicEventInput> = {}): CreateAcademicEventInput {
  return {
    courseCode: 'ME301',
    type: 'QUIZ',
    title: 'Root Locus Quiz',
    occursAt: '2026-10-01T07:00:00.000Z',
    sourceStatus: 'OFFICIAL_SOURCE',
    confirmationStatus: 'CONFIRMED',
    ...overrides,
  };
}

describe('exams and academic events domain', () => {
  it('builds normalized shared fingerprints without student identity', () => {
    const first = createAcademicEventFingerprint(baseEvent({ title: '  Root   Locus Quiz ' }));
    const second = createAcademicEventFingerprint(baseEvent({ title: 'root locus quiz' }));
    expect(first).toBe(second);
    expect(first).toContain('|shared|');
    expect(first).not.toContain('student');
  });

  it('keeps student-specific events independently fingerprinted', () => {
    const first = createAcademicEventFingerprint(baseEvent({ studentKey: 'student-1' }));
    const second = createAcademicEventFingerprint(baseEvent({ studentKey: 'student-2' }));
    expect(first).not.toBe(second);
  });

  it('rejects missing required event timestamps and impossible ordering', () => {
    const undatedQuiz = baseEvent();
    delete undatedQuiz.occursAt;
    expect(() => validateAcademicEventInput(undatedQuiz)).toThrow(/requires occursAt/);
    expect(() =>
      validateAcademicEventInput(
        baseEvent({
          occursAt: '2026-10-02T07:00:00.000Z',
          dueAt: '2026-10-01T07:00:00.000Z',
        }),
      ),
    ).toThrow(/cannot be after/);
  });

  it('rejects treating an inferred source as confirmed truth', () => {
    expect(() =>
      validateAcademicEventInput(
        baseEvent({ sourceStatus: 'INFERRED', confirmationStatus: 'CONFIRMED' }),
      ),
    ).toThrow(/cannot be marked CONFIRMED/);
  });

  it('requires assignments to have deadlines without inventing dates', () => {
    const undatedAssignment = baseEvent({ type: 'ASSIGNMENT' });
    delete undatedAssignment.occursAt;
    expect(() => validateAcademicEventInput(undatedAssignment)).toThrow(/requires dueAt/);
  });

  it('preserves coverage status and evidence labels during normalization', () => {
    const coverage = normalizeCoverage([
      {
        courseCode: 'ME301',
        topicKey: ' root-locus ',
        status: 'INFERRED_UNCONFIRMED',
        evidenceSource: ' lecture title ',
      },
    ]);
    expect(coverage).toEqual([
      {
        courseCode: 'ME301',
        topicKey: 'root-locus',
        status: 'INFERRED_UNCONFIRMED',
        evidenceSource: 'lecture title',
      },
    ]);
  });

  it('creates stable past-question fingerprints and validates separate statuses', () => {
    const input = {
      courseCode: 'ME301',
      academicYear: '2025-2026',
      examType: 'FINAL_EXAM' as const,
      questionNumber: ' 1 ',
      questionText: '  Sketch   the root locus. ',
      solutionStatus: 'UNVERIFIED' as const,
      verificationStatus: 'VERIFIED' as const,
    };
    expect(createPastQuestionFingerprint(input)).toBe(
      createPastQuestionFingerprint({ ...input, questionText: 'sketch the root locus.' }),
    );
    expect(() => validatePastExamQuestionInput(input)).not.toThrow();
    expect(input.solutionStatus).not.toBe(input.verificationStatus);
  });

  it('validates MCQ and true/false quiz creation', () => {
    expect(() =>
      validatePracticeQuizInput({
        courseCode: 'ME301',
        title: 'Practice',
        questions: quizQuestions,
      }),
    ).not.toThrow();
    expect(() =>
      validatePracticeQuizInput({
        courseCode: 'ME301',
        title: 'Broken',
        questions: [
          {
            type: 'MULTIPLE_CHOICE',
            prompt: 'Broken choices',
            points: 1,
            options: [
              { id: 'a', text: 'A' },
              { id: 'b', text: 'B' },
            ],
            correctOptionId: 'c',
          },
        ],
      }),
    ).toThrow(/identify one of/);
  });

  it('scores correct, incorrect, and unanswered answers exactly', () => {
    const result = scoreQuiz(quizQuestions, { 'mcq-1': 'b' });
    expect(result).toEqual({
      rawScore: 2,
      maxScore: 3,
      percentage: 66.67,
      correctQuestionIds: ['mcq-1'],
      incorrectQuestionIds: [],
      unansweredQuestionIds: ['tf-1'],
    });
  });

  it('uses strict true/false types and gives no fuzzy MCQ credit', () => {
    const result = scoreQuiz(quizQuestions, { 'mcq-1': 'B', 'tf-1': 'true' });
    expect(result.rawScore).toBe(0);
    expect(result.incorrectQuestionIds).toEqual(['mcq-1', 'tf-1']);
  });

  it('returns identical scoring for repeated inputs', () => {
    const answers = { 'mcq-1': 'b', 'tf-1': true };
    expect(scoreQuiz(quizQuestions, answers)).toEqual(scoreQuiz(quizQuestions, answers));
    expect(scoreQuiz(quizQuestions, answers).percentage).toBe(100);
  });
});
