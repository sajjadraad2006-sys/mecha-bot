import type {
  DailyCheckIn,
  ProgressSignal,
  StudentCourseCompanionState,
  StudySession,
} from './types.js';

export interface CompanionRepository {
  saveSession(session: StudySession): void;
  getSession(id: string): StudySession | null;
  findActiveSession(studentKey: string): StudySession | null;
  listSessions(studentKey: string): StudySession[];

  saveCheckIn(checkIn: DailyCheckIn): void;
  findCheckIn(studentKey: string, localDate: string): DailyCheckIn | null;
  listCheckIns(studentKey: string): DailyCheckIn[];

  saveProgressSignal(signal: ProgressSignal): void;
  listProgressSignals(studentKey: string, courseCode?: string, topicKey?: string): ProgressSignal[];

  saveCourseState(state: StudentCourseCompanionState): void;
  getCourseState(studentKey: string, courseCode: string): StudentCourseCompanionState | null;
}
