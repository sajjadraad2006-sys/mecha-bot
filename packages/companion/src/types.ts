export const DEFAULT_STUDENT_TIME_ZONE = 'Asia/Baghdad';

export const SESSION_TYPES = ['STUDY', 'FOCUS', 'REVIEW', 'PRACTICE', 'BREAK'] as const;
export type SessionType = (typeof SESSION_TYPES)[number];

export const SESSION_STATUSES = [
  'PLANNED',
  'ACTIVE',
  'COMPLETED',
  'CANCELLED',
  'INTERRUPTED',
] as const;
export type SessionStatus = (typeof SESSION_STATUSES)[number];

export interface StudySession {
  id: string;
  studentKey: string;
  courseCode?: string;
  topicKey?: string;
  type: SessionType;
  startedAt: string;
  plannedDurationMinutes?: number;
  endedAt?: string;
  actualDurationMinutes?: number;
  status: SessionStatus;
  completionReason?: string;
  notes?: string;
  createdAt: string;
}

export interface StartStudySessionInput {
  id?: string;
  studentKey: string;
  courseCode?: string;
  topicKey?: string;
  type: SessionType;
  plannedDurationMinutes?: number;
  notes?: string;
}

export interface EndStudySessionInput {
  completionReason?: string;
  notes?: string;
}

export type SelfReportedConfidence = 1 | 2 | 3 | 4 | 5;

export interface DailyCheckIn {
  id: string;
  studentKey: string;
  localDate: string;
  courseCode?: string;
  studiedToday: boolean;
  selfReportedConfidence?: SelfReportedConfidence;
  difficulty?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SaveDailyCheckInInput {
  id?: string;
  studentKey: string;
  localDate?: string;
  courseCode?: string;
  studiedToday: boolean;
  selfReportedConfidence?: number;
  difficulty?: string;
  note?: string;
}

export const PROGRESS_SIGNAL_TYPES = [
  'SELF_RATING',
  'QUIZ_RESULT',
  'STUDY_SESSION',
  'REPEATED_QUESTION',
  'MANUAL_STUDENT_STATUS',
] as const;
export type ProgressSignalType = (typeof PROGRESS_SIGNAL_TYPES)[number];

export const STUDENT_TOPIC_STATES = [
  'NEW',
  'LEARNING',
  'STRUGGLING',
  'REVIEW_NEEDED',
  'COMFORTABLE',
] as const;
export type StudentTopicState = (typeof STUDENT_TOPIC_STATES)[number];

interface ProgressSignalBase {
  id: string;
  studentKey: string;
  courseCode: string;
  topicKey: string;
  occurredAt: string;
  createdAt: string;
}

export interface SelfRatingProgressSignal extends ProgressSignalBase {
  type: 'SELF_RATING';
  selfReportedConfidence: SelfReportedConfidence;
}

export interface QuizResultProgressSignal extends ProgressSignalBase {
  type: 'QUIZ_RESULT';
  quizDerivedPerformance: {
    score: number;
    maxScore: number;
    percentage: number;
  };
}

export interface StudySessionProgressSignal extends ProgressSignalBase {
  type: 'STUDY_SESSION';
  sessionId: string;
  completedMinutes: number;
}

export interface RepeatedQuestionProgressSignal extends ProgressSignalBase {
  type: 'REPEATED_QUESTION';
  count: number;
}

export interface ManualStudentStatusProgressSignal extends ProgressSignalBase {
  type: 'MANUAL_STUDENT_STATUS';
  state: StudentTopicState;
}

export type ProgressSignal =
  | SelfRatingProgressSignal
  | QuizResultProgressSignal
  | StudySessionProgressSignal
  | RepeatedQuestionProgressSignal
  | ManualStudentStatusProgressSignal;

export type NewProgressSignal = ProgressSignal extends infer Signal
  ? Signal extends ProgressSignal
    ? Omit<Signal, 'id' | 'createdAt'> & { id?: string }
    : never
  : never;

export interface TopicProgressSummary {
  studentKey: string;
  courseCode: string;
  topicKey: string;
  state: StudentTopicState;
  signalCounts: Record<ProgressSignalType, number>;
  latestSelfReportedConfidence?: SelfReportedConfidence;
  latestQuizDerivedPerformance?: QuizResultProgressSignal['quizDerivedPerformance'];
  completedStudyMinutes: number;
  repeatedQuestionCount: number;
}

export interface StudentCourseCompanionState {
  studentKey: string;
  courseCode: string;
  lastAttendedTopic?: string;
  lastUnderstoodTopic?: string;
  missedFromDate?: string;
  catchUpRequestedAt?: string;
  updatedAt: string;
}

export interface UpdateStudentCourseCompanionStateInput {
  studentKey: string;
  courseCode: string;
  lastAttendedTopic?: string;
  lastUnderstoodTopic?: string;
  missedFromDate?: string;
  catchUpRequestedAt?: string;
}

export interface StudyConsistencyMetrics {
  daysStudiedLast7Days: number;
  daysStudiedLast30Days: number;
  currentStudyDayStreak: number;
  totalCompletedStudyMinutes: number;
}
