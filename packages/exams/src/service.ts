import {
  ConflictError,
  NotFoundError,
  SystemClock,
  ValidationError,
  type Clock,
} from '@mecha-bot/shared';
import { createAcademicEventFingerprint } from './academic-event.js';
import { normalizeCoverage } from './coverage.js';
import { createPastQuestionFingerprint } from './past-question.js';
import { materializeQuizQuestion } from './quiz.js';
import type { ExamsRepository } from './repository.js';
import {
  requireText,
  validateAcademicEventInput,
  validatePastExamQuestionInput,
  validatePracticeQuizInput,
} from './schemas.js';
import { scoreQuiz } from './scoring.js';
import type {
  AcademicEvent,
  CreateAcademicEventInput,
  CreatePastExamQuestionInput,
  CreatePracticeQuizInput,
  PastExamQuestion,
  PracticeQuiz,
  QuizAnswers,
  QuizAttempt,
  QuizQuestion,
} from './types.js';

export interface ExamsServiceOptions {
  clock?: Clock;
  idGenerator?: () => string;
}

export class ExamsService {
  private readonly clock: Clock;
  private readonly idGenerator: () => string;

  constructor(
    private readonly repository: ExamsRepository,
    options: ExamsServiceOptions = {},
  ) {
    this.clock = options.clock ?? new SystemClock();
    this.idGenerator = options.idGenerator ?? (() => crypto.randomUUID());
  }

  createEvent(input: CreateAcademicEventInput): AcademicEvent {
    validateAcademicEventInput(input);
    const fingerprint = createAcademicEventFingerprint(input);
    const existing = this.repository.findEventByFingerprint(fingerprint);
    if (existing !== null) return existing;
    const now = this.clock.nowIso();
    const event: AcademicEvent = {
      id: input.id ?? this.idGenerator(),
      fingerprint,
      courseCode: requireText(input.courseCode, 'courseCode'),
      type: input.type,
      title: requireText(input.title, 'title'),
      sourceStatus: input.sourceStatus,
      confirmationStatus: input.confirmationStatus,
      coverage: normalizeCoverage(input.coverage ?? []),
      createdAt: now,
      updatedAt: now,
      ...(input.studentKey === undefined
        ? {}
        : { studentKey: requireText(input.studentKey, 'studentKey') }),
      ...(input.occursAt === undefined ? {} : { occursAt: input.occursAt }),
      ...(input.dueAt === undefined ? {} : { dueAt: input.dueAt }),
      ...(input.academicYear === undefined ? {} : { academicYear: input.academicYear }),
      ...(input.notes === undefined ? {} : { notes: input.notes.trim() }),
    };
    this.repository.saveEvent(event);
    return event;
  }

  listEvents(courseCode?: string): AcademicEvent[] {
    return this.repository.listEvents(courseCode);
  }

  getEvent(id: string): AcademicEvent | null {
    return this.repository.listEvents().find((e) => e.id === id) ?? null;
  }

  createPastQuestion(input: CreatePastExamQuestionInput): PastExamQuestion {
    validatePastExamQuestionInput(input);
    const fingerprint = createPastQuestionFingerprint(input);
    const existing = this.repository.findPastQuestionByFingerprint(fingerprint);
    if (existing !== null) return existing;
    const question: PastExamQuestion = {
      id: input.id ?? this.idGenerator(),
      fingerprint,
      courseCode: requireText(input.courseCode, 'courseCode'),
      academicYear: input.academicYear,
      questionText: requireText(input.questionText, 'questionText'),
      topicKeys: [
        ...new Set((input.topicKeys ?? []).map((topic) => requireText(topic, 'topicKey'))),
      ],
      solutionStatus: input.solutionStatus,
      verificationStatus: input.verificationStatus,
      createdAt: this.clock.nowIso(),
      ...(input.attempt === undefined ? {} : { attempt: input.attempt.trim() }),
      ...(input.examType === undefined ? {} : { examType: input.examType }),
      ...(input.questionNumber === undefined
        ? {}
        : { questionNumber: input.questionNumber.trim() }),
      ...(input.sourceRef === undefined ? {} : { sourceRef: input.sourceRef.trim() }),
      ...(input.page === undefined ? {} : { page: input.page }),
    };
    this.repository.savePastQuestion(question);
    return question;
  }

  createPracticeQuiz(input: CreatePracticeQuizInput): PracticeQuiz {
    validatePracticeQuizInput(input);
    const questionIds = new Set<string>();
    const questions: QuizQuestion[] = input.questions.map((question) => {
      const id = question.id ?? this.idGenerator();
      if (questionIds.has(id)) throw new ValidationError(`Duplicate question ID '${id}'`);
      questionIds.add(id);
      return materializeQuizQuestion(question, id);
    });
    const quiz: PracticeQuiz = {
      id: input.id ?? this.idGenerator(),
      courseCode: requireText(input.courseCode, 'courseCode'),
      title: requireText(input.title, 'title'),
      questionIds: questions.map((question) => question.id),
      createdAt: this.clock.nowIso(),
    };
    for (const question of questions) this.repository.saveQuestion(question);
    this.repository.saveQuiz(quiz);
    return quiz;
  }

  startAttempt(quizId: string, studentKey: string, id?: string): QuizAttempt {
    const quiz = this.getQuiz(quizId);
    const maxScore = this.getQuizQuestions(quiz).reduce(
      (total, question) => total + question.points,
      0,
    );
    const attempt: QuizAttempt = {
      id: id ?? this.idGenerator(),
      quizId,
      studentKey: requireText(studentKey, 'studentKey'),
      startedAt: this.clock.nowIso(),
      answers: {},
      rawScore: 0,
      maxScore,
      percentage: 0,
      status: 'IN_PROGRESS',
    };
    this.repository.saveAttempt(attempt);
    return attempt;
  }

  submitAttempt(id: string, answers: QuizAnswers): QuizAttempt {
    const attempt = this.getAttempt(id);
    if (attempt.status !== 'IN_PROGRESS') {
      throw new ConflictError(`Cannot submit attempt in ${attempt.status} state`);
    }
    const quiz = this.getQuiz(attempt.quizId);
    const score = scoreQuiz(this.getQuizQuestions(quiz), answers);
    const submitted: QuizAttempt = {
      ...attempt,
      answers: structuredClone(answers),
      rawScore: score.rawScore,
      maxScore: score.maxScore,
      percentage: score.percentage,
      submittedAt: this.clock.nowIso(),
      status: 'SUBMITTED',
    };
    this.repository.saveAttempt(submitted);
    return submitted;
  }

  cancelAttempt(id: string): QuizAttempt {
    const attempt = this.getAttempt(id);
    if (attempt.status !== 'IN_PROGRESS') {
      throw new ConflictError(`Cannot cancel attempt in ${attempt.status} state`);
    }
    const cancelled: QuizAttempt = { ...attempt, status: 'CANCELLED' };
    this.repository.saveAttempt(cancelled);
    return cancelled;
  }

  getQuiz(id: string): PracticeQuiz {
    const quiz = this.repository.getQuiz(id);
    if (quiz === null) throw new NotFoundError('Practice quiz', id);
    return quiz;
  }

  getAttempt(id: string): QuizAttempt {
    const attempt = this.repository.getAttempt(id);
    if (attempt === null) throw new NotFoundError('Quiz attempt', id);
    return attempt;
  }

  listStudentAttempts(studentKey: string): QuizAttempt[] {
    return this.repository.listStudentAttempts(studentKey);
  }

  private getQuizQuestions(quiz: PracticeQuiz): QuizQuestion[] {
    return quiz.questionIds.map((questionId) => {
      const question = this.repository.getQuestion(questionId);
      if (question === null) throw new NotFoundError('Quiz question', questionId);
      return question;
    });
  }
}
