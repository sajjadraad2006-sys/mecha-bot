import { Clock } from '@mecha-bot/shared';
import {
  Reminder,
  ReminderKind,
  ReminderSourceType,
  QuietHoursConfig,
  QuietHoursEvaluation,
  RecurrenceRule,
} from './types.js';
import { ReminderRepository, InMemoryReminderRepository } from './repository.js';
import { toUtcIso, DEFAULT_ACADEMIC_TIMEZONE } from './timezone.js';
import { generateReminderFingerprint } from './idempotency.js';
import { evaluateQuietHours } from './quiet-hours.js';
import { canScheduleAcademicReminder } from './academic-offsets.js';
import {
  categorizeOverdueReminders,
  OverdueBatchResult,
  DEFAULT_OVERDUE_GRACE_WINDOW_MINUTES,
} from './overdue.js';

export interface CreateReminderInput {
  id?: string | undefined;
  userKey: string;
  kind: ReminderKind;
  title: string;
  description?: string | null | undefined;
  dueAt: Date | string;
  timezone?: string | undefined;
  sourceType?: ReminderSourceType | undefined;
  relatedCourseCode?: string | null | undefined;
  relatedAcademicEventId?: string | null | undefined;
  recurrence?: RecurrenceRule | null | undefined;
  idempotencyKey?: string | undefined;
  metadata?: Record<string, unknown> | null | undefined;
  quietHoursConfig?: QuietHoursConfig | null | undefined;
  isExplicitlyRequested?: boolean | undefined;
  isUrgent?: boolean | undefined;
}

export interface ScheduleAfterInput {
  userKey: string;
  kind: ReminderKind;
  title: string;
  durationMinutes: number;
  description?: string | null | undefined;
  sourceType?: ReminderSourceType | undefined;
  relatedCourseCode?: string | null | undefined;
  idempotencyKey?: string | undefined;
  metadata?: Record<string, unknown> | null | undefined;
  quietHoursConfig?: QuietHoursConfig | null | undefined;
  isExplicitlyRequested?: boolean | undefined;
  isUrgent?: boolean | undefined;
}

export interface CreateTimerInput {
  userKey: string;
  kind?: 'BREAK_TIMER' | 'STUDY' | undefined;
  durationMinutes: number;
  title?: string | undefined;
  description?: string | null | undefined;
  metadata?: Record<string, unknown> | null | undefined;
}

export interface ScheduleAcademicReminderInput {
  userKey: string;
  courseCode: string;
  academicEventId: string;
  eventTitle: string;
  eventTime: Date | string;
  offsetMinutes: number;
  sourceType: ReminderSourceType;
  quietHoursConfig?: QuietHoursConfig | null | undefined;
  metadata?: Record<string, unknown> | null | undefined;
}

export interface CreateReminderResult {
  reminder: Reminder;
  quietHoursEvaluation?: QuietHoursEvaluation | undefined;
  isDuplicate: boolean;
}

export class ReminderSchedulerService {
  private repo: ReminderRepository;
  private clock: Clock;
  private defaultTimezone: string;

  constructor(deps: {
    repo?: ReminderRepository | undefined;
    clock: Clock;
    defaultTimezone?: string | undefined;
  }) {
    this.repo = deps.repo || new InMemoryReminderRepository();
    this.clock = deps.clock;
    this.defaultTimezone = deps.defaultTimezone || DEFAULT_ACADEMIC_TIMEZONE;
  }

  /**
   * Primary entry point to schedule a one-shot or recurrent reminder.
   * Ensures idempotency, verifies source confirmation, and evaluates quiet hours.
   */
  createReminder(input: CreateReminderInput): CreateReminderResult {
    if (!input.title || input.title.trim().length === 0) {
      throw new Error('Reminder title cannot be empty.');
    }

    if (!input.userKey || input.userKey.trim().length === 0) {
      throw new Error('User key cannot be empty.');
    }

    const dueAtUtc = toUtcIso(input.dueAt);
    const sourceType = input.sourceType || 'STUDENT_ENTERED';

    // Enforce core product rule: Inferred events must NOT automatically become active reminders
    if (!canScheduleAcademicReminder(sourceType)) {
      throw new Error(
        'Cannot schedule reminder from unconfirmed inferred source. Core product rule requires: infer -> suggest -> confirm.',
      );
    }

    // Determine deterministic idempotency key
    const idempotencyKey =
      input.idempotencyKey ||
      generateReminderFingerprint({
        userKey: input.userKey,
        kind: input.kind,
        title: input.title,
        dueAt: dueAtUtc,
        relatedAcademicEventId: input.relatedAcademicEventId,
      });

    // Check for existing duplicate reminder
    const existing = this.repo.findByIdempotencyKey(idempotencyKey);
    if (existing) {
      return {
        reminder: existing,
        isDuplicate: true,
      };
    }

    // Evaluate quiet hours if configured
    let quietHoursEvaluation: QuietHoursEvaluation | undefined;
    if (input.quietHoursConfig) {
      quietHoursEvaluation = evaluateQuietHours(dueAtUtc, input.quietHoursConfig, {
        isExplicitlyRequested: input.isExplicitlyRequested ?? true,
        isUrgent: input.isUrgent ?? false,
      });
    }

    const reminderId = input.id || `rem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const reminder: Reminder = {
      id: reminderId,
      userKey: input.userKey,
      kind: input.kind,
      title: input.title.trim(),
      description: input.description || null,
      dueAt: dueAtUtc,
      timezone: input.timezone || this.defaultTimezone,
      status: 'SCHEDULED',
      sourceType,
      relatedCourseCode: input.relatedCourseCode || null,
      relatedAcademicEventId: input.relatedAcademicEventId || null,
      recurrence: input.recurrence || null,
      idempotencyKey,
      metadata: input.metadata || null,
      createdAt: this.clock.nowIso(),
      completedAt: null,
      cancelledAt: null,
      deliveredAt: null,
    };

    this.repo.save(reminder);

    const result: CreateReminderResult = {
      reminder,
      isDuplicate: false,
    };
    if (quietHoursEvaluation) {
      result.quietHoursEvaluation = quietHoursEvaluation;
    }
    return result;
  }

  /**
   * Schedules a relative reminder (e.g. in 15 minutes, in 2 hours, in 2 days).
   */
  scheduleAfter(input: ScheduleAfterInput): CreateReminderResult {
    if (!Number.isFinite(input.durationMinutes) || input.durationMinutes <= 0) {
      throw new Error(
        `Invalid duration in minutes: ${input.durationMinutes}. Must be a positive finite number.`,
      );
    }

    const nowMs = this.clock.nowEpochMs();
    const dueTimestamp = nowMs + input.durationMinutes * 60 * 1000;
    const dueAt = new Date(dueTimestamp);

    return this.createReminder({
      userKey: input.userKey,
      kind: input.kind,
      title: input.title,
      durationMinutes: input.durationMinutes,
      description: input.description,
      sourceType: input.sourceType,
      relatedCourseCode: input.relatedCourseCode,
      idempotencyKey: input.idempotencyKey,
      metadata: input.metadata,
      quietHoursConfig: input.quietHoursConfig,
      isExplicitlyRequested: input.isExplicitlyRequested,
      isUrgent: input.isUrgent,
      dueAt,
    } as CreateReminderInput);
  }

  /**
   * Dedicated path for break timers and study timers (e.g. 15-minute break, 25-minute study).
   */
  createTimer(input: CreateTimerInput): Reminder {
    const kind = input.kind || 'BREAK_TIMER';

    if (!Number.isFinite(input.durationMinutes) || input.durationMinutes <= 0) {
      throw new Error(
        `Invalid timer duration in minutes: ${input.durationMinutes}. Must be a positive number.`,
      );
    }

    let defaultTitle = input.title;
    if (!defaultTitle) {
      defaultTitle =
        kind === 'BREAK_TIMER'
          ? `استراحة ${input.durationMinutes} دقيقة`
          : `وقت دراسة ${input.durationMinutes} دقيقة`;
    }

    const { reminder } = this.scheduleAfter({
      userKey: input.userKey,
      kind,
      title: defaultTitle,
      durationMinutes: input.durationMinutes,
      description: input.description,
      sourceType: 'STUDENT_CONFIRMED',
      isExplicitlyRequested: true,
      metadata: input.metadata,
    });

    return reminder;
  }

  /**
   * Schedules an academic event reminder with explicit offset (e.g. -1440 for 1 day before).
   */
  scheduleAcademicEventReminder(input: ScheduleAcademicReminderInput): Reminder {
    if (!canScheduleAcademicReminder(input.sourceType)) {
      throw new Error(
        'Cannot schedule reminder for unconfirmed inferred event. Product rule: infer -> suggest -> confirm.',
      );
    }

    const eventTimestamp = (
      typeof input.eventTime === 'string' ? new Date(input.eventTime) : input.eventTime
    ).getTime();

    if (isNaN(eventTimestamp)) {
      throw new Error(`Invalid event time: ${String(input.eventTime)}`);
    }

    const reminderTimestamp = eventTimestamp + input.offsetMinutes * 60 * 1000;
    const dueAt = new Date(reminderTimestamp);

    const title = `تذكير: ${input.eventTitle}`;

    const { reminder } = this.createReminder({
      userKey: input.userKey,
      kind: 'QUIZ',
      title,
      dueAt,
      sourceType: input.sourceType,
      relatedCourseCode: input.courseCode,
      relatedAcademicEventId: input.academicEventId,
      quietHoursConfig: input.quietHoursConfig,
      metadata: input.metadata,
    });

    return reminder;
  }

  cancelReminder(id: string): Reminder {
    const reminder = this.repo.findById(id);
    if (!reminder) {
      throw new Error(`Reminder with id '${id}' not found.`);
    }

    const nowIso = this.clock.nowIso();
    this.repo.updateStatus(id, 'CANCELLED', nowIso);
    return { ...reminder, status: 'CANCELLED', cancelledAt: nowIso };
  }

  completeReminder(id: string): Reminder {
    const reminder = this.repo.findById(id);
    if (!reminder) {
      throw new Error(`Reminder with id '${id}' not found.`);
    }

    const nowIso = this.clock.nowIso();
    this.repo.updateStatus(id, 'COMPLETED', nowIso);
    return { ...reminder, status: 'COMPLETED', completedAt: nowIso };
  }

  markDelivered(id: string): Reminder {
    const reminder = this.repo.findById(id);
    if (!reminder) {
      throw new Error(`Reminder with id '${id}' not found.`);
    }

    const nowIso = this.clock.nowIso();
    this.repo.updateStatus(id, 'DELIVERED', nowIso);
    return { ...reminder, status: 'DELIVERED', deliveredAt: nowIso };
  }

  getDueReminders(asOf?: Date | string): Reminder[] {
    const checkTime = asOf ? asOf : this.clock.now();
    return this.repo.listDue(checkTime);
  }

  getUpcomingReminders(userKey: string, windowMinutes = 1440): Reminder[] {
    const nowMs = this.clock.nowEpochMs();
    const endMs = nowMs + windowMinutes * 60 * 1000;
    const all = this.repo.listByUser(userKey);

    return all.filter((r) => {
      if (r.status !== 'SCHEDULED') return false;
      const dueMs = new Date(r.dueAt).getTime();
      return dueMs >= nowMs && dueMs <= endMs;
    });
  }

  pollAndClassifyReminders(
    graceWindowMinutes = DEFAULT_OVERDUE_GRACE_WINDOW_MINUTES,
  ): OverdueBatchResult {
    const pending = this.repo.listPending();
    const now = this.clock.now();
    return categorizeOverdueReminders(pending, now, graceWindowMinutes);
  }
}
