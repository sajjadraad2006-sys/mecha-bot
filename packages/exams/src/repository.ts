import type {
  AcademicEvent,
  PastExamQuestion,
  PracticeQuiz,
  QuizAttempt,
  QuizQuestion,
} from './types.js';

export interface ExamsRepository {
  saveEvent(event: AcademicEvent): void;
  findEventByFingerprint(fingerprint: string): AcademicEvent | null;
  listEvents(courseCode?: string): AcademicEvent[];

  savePastQuestion(question: PastExamQuestion): void;
  findPastQuestionByFingerprint(fingerprint: string): PastExamQuestion | null;
  listPastQuestions(courseCode?: string): PastExamQuestion[];

  saveQuestion(question: QuizQuestion): void;
  getQuestion(id: string): QuizQuestion | null;
  saveQuiz(quiz: PracticeQuiz): void;
  getQuiz(id: string): PracticeQuiz | null;

  saveAttempt(attempt: QuizAttempt): void;
  getAttempt(id: string): QuizAttempt | null;
  listAttempts(quizId: string, studentKey?: string): QuizAttempt[];
}
