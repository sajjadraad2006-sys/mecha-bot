import type { CompanionRepository } from './repository.js';
import type {
  DailyCheckIn,
  ProgressSignal,
  StudentCourseCompanionState,
  StudySession,
} from './types.js';

const copy = <T>(value: T): T => structuredClone(value);

export class InMemoryCompanionRepository implements CompanionRepository {
  private readonly sessions = new Map<string, StudySession>();
  private readonly checkIns = new Map<string, DailyCheckIn>();
  private readonly progressSignals = new Map<string, ProgressSignal>();
  private readonly courseStates = new Map<string, StudentCourseCompanionState>();

  saveSession(session: StudySession): void {
    this.sessions.set(session.id, copy(session));
  }

  getSession(id: string): StudySession | null {
    const session = this.sessions.get(id);
    return session === undefined ? null : copy(session);
  }

  findActiveSession(studentKey: string): StudySession | null {
    const session = [...this.sessions.values()].find(
      (candidate) => candidate.studentKey === studentKey && candidate.status === 'ACTIVE',
    );
    return session === undefined ? null : copy(session);
  }

  listSessions(studentKey: string): StudySession[] {
    return [...this.sessions.values()]
      .filter((session) => session.studentKey === studentKey)
      .sort((left, right) => left.startedAt.localeCompare(right.startedAt))
      .map(copy);
  }

  saveCheckIn(checkIn: DailyCheckIn): void {
    this.checkIns.set(`${checkIn.studentKey}\u0000${checkIn.localDate}`, copy(checkIn));
  }

  findCheckIn(studentKey: string, localDate: string): DailyCheckIn | null {
    const checkIn = this.checkIns.get(`${studentKey}\u0000${localDate}`);
    return checkIn === undefined ? null : copy(checkIn);
  }

  listCheckIns(studentKey: string): DailyCheckIn[] {
    return [...this.checkIns.values()]
      .filter((checkIn) => checkIn.studentKey === studentKey)
      .sort((left, right) => left.localDate.localeCompare(right.localDate))
      .map(copy);
  }

  saveProgressSignal(signal: ProgressSignal): void {
    this.progressSignals.set(signal.id, copy(signal));
  }

  listProgressSignals(
    studentKey: string,
    courseCode?: string,
    topicKey?: string,
  ): ProgressSignal[] {
    return [...this.progressSignals.values()]
      .filter(
        (signal) =>
          signal.studentKey === studentKey &&
          (courseCode === undefined || signal.courseCode === courseCode) &&
          (topicKey === undefined || signal.topicKey === topicKey),
      )
      .sort((left, right) => left.occurredAt.localeCompare(right.occurredAt))
      .map(copy);
  }

  saveCourseState(state: StudentCourseCompanionState): void {
    this.courseStates.set(`${state.studentKey}\u0000${state.courseCode}`, copy(state));
  }

  getCourseState(studentKey: string, courseCode: string): StudentCourseCompanionState | null {
    const state = this.courseStates.get(`${studentKey}\u0000${courseCode}`);
    return state === undefined ? null : copy(state);
  }
}
