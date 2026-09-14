export const EVENT_TYPES = [
  'QUIZ',
  'MIDTERM',
  'FINAL_EXAM',
  'ASSIGNMENT',
  'REPORT',
  'PROJECT',
  'DEADLINE',
  'OTHER',
] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export const EVENT_SOURCE_STATUSES = [
  'OFFICIAL_SOURCE',
  'STUDENT_REPORTED',
  'ADMIN_REPORTED',
  'INFERRED',
] as const;
export type EventSourceStatus = (typeof EVENT_SOURCE_STATUSES)[number];

export const CONFIRMATION_STATUSES = [
  'CONFIRMED',
  'STUDENT_ENTERED',
  'ADMIN_ENTERED',
  'INFERRED_UNCONFIRMED',
  'CANDIDATE',
] as const;
export type ConfirmationStatus = (typeof CONFIRMATION_STATUSES)[number];

export const COVERAGE_STATUSES = ['CONFIRMED', 'STUDENT_REPORTED', 'INFERRED_UNCONFIRMED'] as const;
export type CoverageStatus = (typeof COVERAGE_STATUSES)[number];

export interface EventCoverageItem {
  courseCode: string;
  topicKey?: string;
  freeTextLabel?: string;
  status: CoverageStatus;
  evidenceSource?: string;
}

export interface AcademicEvent {
  id: string;
  fingerprint: string;
  studentKey?: string;
  courseCode: string;
  type: EventType;
  title: string;
  occursAt?: string;
  dueAt?: string;
  academicYear?: string;
  sourceStatus: EventSourceStatus;
  confirmationStatus: ConfirmationStatus;
  coverage: EventCoverageItem[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAcademicEventInput {
  id?: string;
  studentKey?: string;
  courseCode: string;
  type: EventType;
  title: string;
  occursAt?: string;
  dueAt?: string;
  academicYear?: string;
  sourceStatus: EventSourceStatus;
  confirmationStatus: ConfirmationStatus;
  coverage?: EventCoverageItem[];
  notes?: string;
}

export const SOLUTION_STATUSES = ['NONE', 'UNVERIFIED', 'VERIFIED'] as const;
export type SolutionStatus = (typeof SOLUTION_STATUSES)[number];

export const VERIFICATION_STATUSES = ['UNVERIFIED', 'VERIFIED', 'REJECTED'] as const;
export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

export interface PastExamQuestion {
  id: string;
  fingerprint: string;
  courseCode: string;
  academicYear: string;
  attempt?: string;
  examType?: EventType;
  questionNumber?: string;
  questionText: string;
  topicKeys: string[];
  sourceRef?: string;
  page?: number;
  solutionStatus: SolutionStatus;
  verificationStatus: VerificationStatus;
  createdAt: string;
}

export interface CreatePastExamQuestionInput {
  id?: string;
  courseCode: string;
  academicYear: string;
  attempt?: string;
  examType?: EventType;
  questionNumber?: string;
  questionText: string;
  topicKeys?: string[];
  sourceRef?: string;
  page?: number;
  solutionStatus: SolutionStatus;
  verificationStatus: VerificationStatus;
}

export interface MultipleChoiceOption {
  id: string;
  text: string;
}

interface QuizQuestionBase {
  id: string;
  prompt: string;
  points: number;
}

export interface MultipleChoiceQuestion extends QuizQuestionBase {
  type: 'MULTIPLE_CHOICE';
  options: MultipleChoiceOption[];
  correctOptionId: string;
}

export interface TrueFalseQuestion extends QuizQuestionBase {
  type: 'TRUE_FALSE';
  correctAnswer: boolean;
}

export type QuizQuestion = MultipleChoiceQuestion | TrueFalseQuestion;

export type NewQuizQuestion =
  | (Omit<MultipleChoiceQuestion, 'id'> & { id?: string })
  | (Omit<TrueFalseQuestion, 'id'> & { id?: string });

export interface PracticeQuiz {
  id: string;
  courseCode: string;
  title: string;
  questionIds: string[];
  createdAt: string;
}

export interface CreatePracticeQuizInput {
  id?: string;
  courseCode: string;
  title: string;
  questions: NewQuizQuestion[];
}

export type QuizAnswerValue = string | boolean;
export type QuizAnswers = Record<string, QuizAnswerValue>;

export const ATTEMPT_STATUSES = ['IN_PROGRESS', 'SUBMITTED', 'CANCELLED'] as const;
export type AttemptStatus = (typeof ATTEMPT_STATUSES)[number];

export interface QuizAttempt {
  id: string;
  quizId: string;
  studentKey: string;
  startedAt: string;
  submittedAt?: string;
  answers: QuizAnswers;
  rawScore: number;
  maxScore: number;
  percentage: number;
  status: AttemptStatus;
}

export interface QuizScore {
  rawScore: number;
  maxScore: number;
  percentage: number;
  correctQuestionIds: string[];
  incorrectQuestionIds: string[];
  unansweredQuestionIds: string[];
}
