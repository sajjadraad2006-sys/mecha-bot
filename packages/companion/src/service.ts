import {
  ConflictError,
  NotFoundError,
  SystemClock,
  formatToAcademicDate,
  type Clock,
} from '@mecha-bot/shared';
import { currentLocalDate } from './checkin.js';
import { summarizeTopicProgress } from './progress.js';
import type { CompanionRepository } from './repository.js';
import {
  parseSelfReportedConfidence,
  requireNonEmpty,
  validateCourseCompanionStateInput,
  validateDailyCheckInInput,
  validateProgressSignal,
  validateStartStudySessionInput,
} from './schemas.js';
import { transitionStudySession } from './study-session.js';
import { calculateStudyConsistency } from './streak.js';
import {
  DEFAULT_STUDENT_TIME_ZONE,
  type DailyCheckIn,
  type EndStudySessionInput,
  type NewProgressSignal,
  type ProgressSignal,
  type SaveDailyCheckInInput,
  type StartStudySessionInput,
  type StudentCourseCompanionState,
  type StudyConsistencyMetrics,
  type StudySession,
  type TopicProgressSummary,
  type UpdateStudentCourseCompanionStateInput,
} from './types.js';

export interface CompanionServiceOptions {
  clock?: Clock;
  idGenerator?: () => string;
  timeZone?: string;
}

export class CompanionService {
  private readonly clock: Clock;
  private readonly idGenerator: () => string;
  private readonly timeZone: string;

  constructor(
    private readonly repository: CompanionRepository,
    options: CompanionServiceOptions = {},
  ) {
    this.clock = options.clock ?? new SystemClock();
    this.idGenerator = options.idGenerator ?? (() => crypto.randomUUID());
    this.timeZone = options.timeZone ?? DEFAULT_STUDENT_TIME_ZONE;
  }

  startSession(input: StartStudySessionInput): StudySession {
    validateStartStudySessionInput(input);
    const active = this.repository.findActiveSession(input.studentKey);
    if (active !== null) {
      throw new ConflictError(`Student already has active study session '${active.id}'`);
    }
    const now = this.clock.nowIso();
    const session: StudySession = {
      id: input.id ?? this.idGenerator(),
      studentKey: requireNonEmpty(input.studentKey, 'studentKey'),
      type: input.type,
      startedAt: now,
      status: 'ACTIVE',
      createdAt: now,
      ...(input.courseCode === undefined
        ? {}
        : { courseCode: requireNonEmpty(input.courseCode, 'courseCode') }),
      ...(input.topicKey === undefined
        ? {}
        : { topicKey: requireNonEmpty(input.topicKey, 'topicKey') }),
      ...(input.plannedDurationMinutes === undefined
        ? {}
        : { plannedDurationMinutes: input.plannedDurationMinutes }),
      ...(input.notes === undefined ? {} : { notes: input.notes.trim() }),
    };
    this.repository.saveSession(session);
    return session;
  }

  completeSession(id: string, input: EndStudySessionInput = {}): StudySession {
    return this.endSession(id, 'COMPLETED', input);
  }

  cancelSession(id: string, input: EndStudySessionInput = {}): StudySession {
    return this.endSession(id, 'CANCELLED', input);
  }

  interruptSession(id: string, input: EndStudySessionInput = {}): StudySession {
    return this.endSession(id, 'INTERRUPTED', input);
  }

  getSession(id: string): StudySession {
    const session = this.repository.getSession(id);
    if (session === null) throw new NotFoundError('Study session', id);
    return session;
  }

  saveDailyCheckIn(input: SaveDailyCheckInInput): DailyCheckIn {
    validateDailyCheckInInput(input);
    const localDate = input.localDate ?? currentLocalDate(this.clock, this.timeZone);
    const existing = this.repository.findCheckIn(input.studentKey, localDate);
    const now = this.clock.nowIso();
    const checkIn: DailyCheckIn = {
      id: existing?.id ?? input.id ?? this.idGenerator(),
      studentKey: requireNonEmpty(input.studentKey, 'studentKey'),
      localDate,
      studiedToday: input.studiedToday,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      ...(input.courseCode === undefined
        ? {}
        : { courseCode: requireNonEmpty(input.courseCode, 'courseCode') }),
      ...(input.selfReportedConfidence === undefined
        ? {}
        : { selfReportedConfidence: parseSelfReportedConfidence(input.selfReportedConfidence) }),
      ...(input.difficulty === undefined ? {} : { difficulty: input.difficulty.trim() }),
      ...(input.note === undefined ? {} : { note: input.note.trim() }),
    };
    this.repository.saveCheckIn(checkIn);
    return checkIn;
  }

  recordProgressSignal(input: NewProgressSignal): ProgressSignal {
    validateProgressSignal(input);
    const signal = {
      ...input,
      id: input.id ?? this.idGenerator(),
      createdAt: this.clock.nowIso(),
    } as ProgressSignal;
    this.repository.saveProgressSignal(signal);
    return signal;
  }

  getTopicProgress(studentKey: string, courseCode: string, topicKey: string): TopicProgressSummary {
    return summarizeTopicProgress(
      studentKey,
      courseCode,
      topicKey,
      this.repository.listProgressSignals(studentKey, courseCode, topicKey),
    );
  }

  updateCourseState(input: UpdateStudentCourseCompanionStateInput): StudentCourseCompanionState {
    validateCourseCompanionStateInput(input);
    const existing = this.repository.getCourseState(input.studentKey, input.courseCode);
    const state: StudentCourseCompanionState = {
      ...(existing ?? {
        studentKey: requireNonEmpty(input.studentKey, 'studentKey'),
        courseCode: requireNonEmpty(input.courseCode, 'courseCode'),
      }),
      ...input,
      updatedAt: this.clock.nowIso(),
    };
    this.repository.saveCourseState(state);
    return state;
  }

  getStudyConsistency(studentKey: string): StudyConsistencyMetrics {
    return calculateStudyConsistency(
      this.repository.listSessions(studentKey),
      this.clock.now(),
      this.timeZone,
    );
  }

  getTodayLocalDate(): string {
    return formatToAcademicDate(this.clock.now(), this.timeZone);
  }

  private endSession(
    id: string,
    status: 'COMPLETED' | 'CANCELLED' | 'INTERRUPTED',
    input: EndStudySessionInput,
  ): StudySession {
    const session = this.getSession(id);
    const ended = transitionStudySession(session, status, this.clock.nowIso(), input);
    this.repository.saveSession(ended);
    return ended;
  }
}
