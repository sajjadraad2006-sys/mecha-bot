import type {
  CalendarPosition,
  CatchUpPlan,
  CoursePulsePosition,
  DiagnosisStatus,
  StudentCoursePosition,
} from '@mecha-bot/navigator';
import type { SearchResult } from '@mecha-bot/search';
import type { DeliveryDecision } from '@mecha-bot/distribution';
import type { Reminder, QuietHoursConfig } from '@mecha-bot/scheduler';
import type { ReviewItem } from '@mecha-bot/admin';
import type { Stage, ProgramSemester } from '@mecha-bot/academic';

/**
 * High-level unified response for "وين وصلنا؟" (Where are we?)
 * Combines multi-truth perspectives while honoring academic constraints.
 */
export interface WhereAreWeAppResponse {
  courseCode: string;
  hasConflict: boolean;
  conflictDetails?:
    | {
        status: string;
        resolutionStatus: string;
        description: string;
      }
    | undefined;
  hasTopics: boolean;
  topicMapStatus?: string | undefined;
  calendarPosition?: CalendarPosition | undefined;
  coursePulse?: CoursePulsePosition | undefined;
  studentPosition?: StudentCoursePosition | undefined;
  suggestedTopicKey?: string | undefined;
  suggestedTopicTitleEn?: string | undefined;
  suggestedTopicTitleAr?: string | undefined;
  needsStudentConfirmation: boolean;
  confirmationPromptKey: string;
  notes?: string[] | undefined;
}

/**
 * High-level response for "أني ضايع" (I'm lost / Diagnosis)
 */
export interface ImLostAppResponse {
  courseCode?: string | undefined;
  status: DiagnosisStatus;
  targetTopicKey?: string | undefined;
  lastUnderstoodTopicKey?: string | undefined;
  missingPrerequisites: string[];
  explanationNote: string;
  catchUpPlan?: CatchUpPlan | undefined;
  needsStudentConfirmation: boolean;
  candidateCourseCodes?: string[] | undefined;
}

/**
 * Parameters to explicitly record a student's confirmed position.
 */
export interface ConfirmPositionInput {
  studentKey: string;
  courseCode: string;
  topicKey: string;
  confidence?: number | undefined;
  difficulty?: number | undefined;
}

/**
 * Search result paired with delivery resolution.
 */
export interface SearchDeliveryHit {
  searchResult: SearchResult;
  deliveryDecision?: DeliveryDecision | undefined;
}

export interface SearchAndDeliverResponse {
  totalMatches: number;
  hits: SearchDeliveryHit[];
  diagnosticReason?: string | undefined;
}

/**
 * Timetable schedule request criteria for the application layer.
 */
export interface StudentScheduleRequest {
  studentKey: string;
  date?: string | undefined; // YYYY-MM-DD in Baghdad timezone
  stage?: Stage | undefined;
  programSemester?: ProgramSemester | undefined;
  section?: string | undefined;
  subgroup?: string | undefined;
}

/**
 * Result of scheduling reminders for timetable lectures.
 */
export interface LectureRemindersResult {
  scheduledCount: number;
  reminders: Reminder[];
  deferredDueToQuietHours: number;
}

/**
 * Result of scheduling reminders for an academic exam/event.
 */
export interface AcademicEventRemindersResult {
  scheduledCount: number;
  reminders: Reminder[];
  requiresStudentConfirmation: boolean;
  reason?: string | undefined;
}

/**
 * Result of applying an administrative review decision with semantic safety.
 */
export interface AdminReviewDecisionResult {
  reviewItem: ReviewItem;
  academicEvidencePreserved: boolean;
  disclaimer: string;
}

export interface TimetableReminderOptions {
  offsetMinutes?: number | undefined;
  quietHoursConfig?: QuietHoursConfig | undefined;
}
