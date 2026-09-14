export type ReminderKind =
  'STUDY' | 'QUIZ' | 'EXAM' | 'ASSIGNMENT' | 'DEADLINE' | 'BREAK_TIMER' | 'LECTURE' | 'GENERAL';

export type ReminderStatus = 'SCHEDULED' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';

export type ReminderSourceType =
  | 'STUDENT_CONFIRMED'
  | 'STUDENT_ENTERED'
  | 'ADMIN_ENTERED'
  | 'SYSTEM_DERIVED'
  | 'INFERRED_UNCONFIRMED';

export type ReminderPreferenceMode = 'QUIET' | 'BALANCED' | 'ALL_IN';

export type Weekday =
  'SUNDAY' | 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY';

export const UNIVERSITY_WEEKDAYS: Weekday[] = [
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
];

export interface QuietHoursConfig {
  enabled: boolean;
  startHour: number; // 0..23 (e.g. 23 for 11:00 PM)
  startMinute: number; // 0..59
  endHour: number; // 0..23 (e.g. 7 for 07:00 AM)
  endMinute: number; // 0..59
  timezone?: string | undefined; // defaults to 'Asia/Baghdad'
}

export type QuietHoursDecision =
  'DELIVER_NOW' | 'DEFER_UNTIL_QUIET_HOURS_END' | 'ALLOW_URGENT' | 'REQUIRES_POLICY_DECISION';

export interface QuietHoursEvaluation {
  decision: QuietHoursDecision;
  inQuietHours: boolean;
  originalDueAt: string; // UTC ISO
  suggestedDueAt?: string | undefined; // UTC ISO if deferred
  reason: string;
}

export type OverdueClassification = 'DUE' | 'OVERDUE_RECENT' | 'EXPIRED';

export interface RecurrenceRule {
  type: 'DAILY' | 'WEEKLY' | 'SELECTED_WEEKDAYS';
  weekdays?: Weekday[] | undefined;
  timeOfDay: {
    hour: number; // 0..23 in timezone
    minute: number; // 0..59 in timezone
  };
  timezone?: string | undefined;
}

export interface ReminderPreferenceConfig {
  mode: ReminderPreferenceMode;
  quietHours?: QuietHoursConfig | undefined;
  maxDailySuggestions?: number | undefined;
}

export interface Reminder {
  id: string;
  userKey: string;
  kind: ReminderKind;
  title: string;
  description?: string | null | undefined;
  dueAt: string; // UTC ISO 8601
  timezone: string; // default: 'Asia/Baghdad'
  status: ReminderStatus;
  sourceType: ReminderSourceType;
  relatedCourseCode?: string | null | undefined;
  relatedAcademicEventId?: string | null | undefined;
  recurrence?: RecurrenceRule | null | undefined;
  idempotencyKey?: string | null | undefined;
  metadata?: Record<string, unknown> | null | undefined;
  createdAt: string; // UTC ISO
  completedAt?: string | null | undefined;
  cancelledAt?: string | null | undefined;
  deliveredAt?: string | null | undefined;
}
