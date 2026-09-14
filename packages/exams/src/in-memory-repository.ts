import type { ExamsRepository } from './repository.js';
import type {
  AcademicEvent,
  PastExamQuestion,
  PracticeQuiz,
  QuizAttempt,
  QuizQuestion,
} from './types.js';

const copy = <T>(value: T): T => structuredClone(value);

export class InMemoryExamsRepository implements ExamsRepository {
  private readonly events = new Map<string, AcademicEvent>();
  private readonly eventFingerprints = new Map<string, string>();
  private readonly pastQuestions = new Map<string, PastExamQuestion>();
  private readonly pastQuestionFingerprints = new Map<string, string>();
  private readonly questions = new Map<string, QuizQuestion>();
  private readonly quizzes = new Map<string, PracticeQuiz>();
  private readonly attempts = new Map<string, QuizAttempt>();

  saveEvent(event: AcademicEvent): void {
    this.events.set(event.id, copy(event));
    this.eventFingerprints.set(event.fingerprint, event.id);
  }

  findEventByFingerprint(fingerprint: string): AcademicEvent | null {
    const id = this.eventFingerprints.get(fingerprint);
    const event = id === undefined ? undefined : this.events.get(id);
    return event === undefined ? null : copy(event);
  }

  listEvents(courseCode?: string): AcademicEvent[] {
    return [...this.events.values()]
      .filter((event) => courseCode === undefined || event.courseCode === courseCode)
      .sort((left, right) => left.createdAt.localeCompare(right.createdAt))
      .map(copy);
  }

  savePastQuestion(question: PastExamQuestion): void {
    this.pastQuestions.set(question.id, copy(question));
    this.pastQuestionFingerprints.set(question.fingerprint, question.id);
  }

  findPastQuestionByFingerprint(fingerprint: string): PastExamQuestion | null {
    const id = this.pastQuestionFingerprints.get(fingerprint);
    const question = id === undefined ? undefined : this.pastQuestions.get(id);
    return question === undefined ? null : copy(question);
  }

  listPastQuestions(courseCode?: string): PastExamQuestion[] {
    return [...this.pastQuestions.values()]
      .filter((question) => courseCode === undefined || question.courseCode === courseCode)
      .sort((left, right) => left.createdAt.localeCompare(right.createdAt))
      .map(copy);
  }

  saveQuestion(question: QuizQuestion): void {
    this.questions.set(question.id, copy(question));
  }

  getQuestion(id: string): QuizQuestion | null {
    const question = this.questions.get(id);
    return question === undefined ? null : copy(question);
  }

  saveQuiz(quiz: PracticeQuiz): void {
    this.quizzes.set(quiz.id, copy(quiz));
  }

  getQuiz(id: string): PracticeQuiz | null {
    const quiz = this.quizzes.get(id);
    return quiz === undefined ? null : copy(quiz);
  }

  saveAttempt(attempt: QuizAttempt): void {
    this.attempts.set(attempt.id, copy(attempt));
  }

  getAttempt(id: string): QuizAttempt | null {
    const attempt = this.attempts.get(id);
    return attempt === undefined ? null : copy(attempt);
  }

  listAttempts(quizId: string, studentKey?: string): QuizAttempt[] {
    return [...this.attempts.values()]
      .filter(
        (attempt) =>
          attempt.quizId === quizId &&
          (studentKey === undefined || attempt.studentKey === studentKey),
      )
      .sort((left, right) => left.startedAt.localeCompare(right.startedAt))
      .map(copy);
  }
}
