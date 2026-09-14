// ==========================================
// 1. POSITION STATUS & SOURCES
// ==========================================

export type PositionStatus =
  'CONFIRMED_BY_STUDENT' | 'VERIFIED' | 'INFERRED' | 'EXPECTED' | 'UNKNOWN';

export type PositionSource =
  'STUDENT' | 'COURSE_EDITOR' | 'ACADEMIC_CALENDAR' | 'COURSE_PULSE' | 'SYSTEM_INFERENCE';

export type PulseScope = 'GLOBAL' | 'SECTION';

// ==========================================
// 2. THE THREE SEPARATE TRUTHS
// ==========================================

/**
 * Truth 1: Academic Calendar Position
 * Where the university calendar says the student approximately is.
 * Always status: 'EXPECTED'.
 */
export interface CalendarPosition {
  academicWeek?: number | undefined;
  period?: string | undefined; // e.g. 'TEACHING', 'EXAMS'
  localDate: string; // YYYY-MM-DD
  status: 'EXPECTED';
}

/**
 * Truth 2: Course Pulse Position
 * Where the class/lecturer is actually reported to have reached.
 */
export interface CoursePulsePosition {
  courseCode: string;
  topicKey?: string | undefined;
  freeTextTopic?: string | undefined;
  status: PositionStatus;
  source: PositionSource;
  scope?: PulseScope | undefined;
  sectionKey?: string | undefined; // e.g. 'A', 'B'
  updatedAt: string; // UTC ISO string
}

/**
 * Truth 3: Student Course Position
 * What THIS specific student understands or last completed.
 * Independent of class progress.
 */
export interface StudentCoursePosition {
  id: string;
  studentKey: string;
  courseCode: string;
  lastAttendedTopicKey?: string | undefined;
  lastUnderstoodTopicKey?: string | undefined;
  currentStudyTopicKey?: string | undefined;
  status: PositionStatus;
  source: PositionSource;
  selfReportedDifficulty?: number | undefined; // 1..5 scale
  selfReportedConfidence?: number | undefined; // 1..5 scale
  updatedAt: string; // UTC ISO string
}

/**
 * Multi-truth unified snapshot for a course.
 * Preserves the 3 separate positions without collapsing them.
 */
export interface CoursePositionSnapshot {
  courseCode: string;
  calendarPosition?: CalendarPosition | undefined;
  coursePulse?: CoursePulsePosition | undefined;
  studentPosition?: StudentCoursePosition | undefined;
}

// ==========================================
// 3. LEARNING SIGNALS
// ==========================================

export type LearningSignalType =
  | 'SELF_REPORTED_DIFFICULTY'
  | 'QUIZ_LOW_SCORE'
  | 'REPEATED_QUESTION'
  | 'STUDY_SESSION'
  | 'MANUAL_STATUS';

export interface StudentLearningSignal {
  id: string;
  studentKey: string;
  courseCode: string;
  type: LearningSignalType;
  topicKey?: string | undefined;
  value?: number | string | undefined;
  recordedAt: string; // UTC ISO string
}

// ==========================================
// 4. "وين وصلنا؟" PROGRESS ENGINE CONTRACTS
// ==========================================

export type WhereAreWeMode = 'CONFIRM_COURSE_PULSE' | 'EXPECTED_RANGE' | 'ASK_STUDENT_DIRECTLY';

export interface WhereAreWeResult {
  courseCode: string;
  mode: WhereAreWeMode;
  suggestedTopicKey?: string | undefined;
  suggestedTopicTitleEn?: string | undefined;
  suggestedTopicTitleAr?: string | undefined;
  suggestedRange?: string[] | undefined; // topic keys
  evidenceStatus: PositionStatus;
  evidenceSource: PositionSource;
  academicWeek?: number | undefined;
  needsStudentConfirmation: boolean;
  confirmationPromptKey: string;
  notes?: string[] | undefined;
}

// ==========================================
// 5. "أني ضايع" DIAGNOSIS ENGINE CONTRACTS
// ==========================================

export type DiagnosisStatus =
  | 'ON_TRACK'
  | 'REVIEW_RECOMMENDED'
  | 'CATCH_UP_REQUIRED'
  | 'NEEDS_BASELINE'
  | 'TARGET_UNKNOWN'
  | 'INSUFFICIENT_EVIDENCE'
  | 'COURSE_CLARIFICATION_REQUIRED'
  | 'TOPIC_CLARIFICATION_REQUIRED'
  | 'ACADEMIC_DATA_CONFLICT'
  | 'INSUFFICIENT_ACADEMIC_MAP';

export interface StudyDiagnosis {
  status: DiagnosisStatus;
  courseCode?: string | undefined;
  targetTopicKey?: string | undefined;
  lastUnderstoodTopicKey?: string | undefined;
  candidateCourseCodes?: string[] | undefined;
  missingPrerequisites: string[]; // topicKeys
  orderBasedReviewTopics?: string[] | undefined; // topicKeys
  needsStudentConfirmation: boolean;
  reasonCodes: string[];
  explanationNote: string;
  catchUpPlan?: CatchUpPlan | undefined;
}

// ==========================================
// 6. CATCH-UP PLAN & STUDY BUDGETS
// ==========================================

export type StepReason =
  | 'DIRECT_PREREQUISITE'
  | 'DEPENDENCY_CHAIN'
  | 'STUDENT_REPORTED_GAP'
  | 'TARGET_TOPIC'
  | 'ORDER_BASED_REVIEW';

export interface CatchUpStep {
  topicKey: string;
  titleEn: string;
  titleAr?: string | undefined;
  reason: StepReason;
  nominalWeek?: number | undefined;
}

export type StudyBudgetMinutes = 10 | 15 | 30 | 45 | 60 | number;

export interface StudyBudgetBlock {
  kind: 'PREREQUISITE_REVIEW' | 'TARGET_TOPIC_FOCUS' | 'SELF_CHECK';
  durationMinutes: number;
  recommendedTopicKeys: string[];
  description: string;
}

export interface StudyBudgetPlan {
  totalBudgetMinutes: number;
  blocks: StudyBudgetBlock[];
  label: 'PLANNING_HEURISTIC';
}

export interface CatchUpPlan {
  courseCode: string;
  targetTopicKey: string;
  steps: CatchUpStep[];
  studyBudgetPlan?: StudyBudgetPlan | undefined;
  generatedAt: string;
}
