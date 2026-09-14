import { describe, it, expect, beforeEach } from 'vitest';
import { FakeClock } from '@mecha-bot/shared';
import {
  ReminderSchedulerService,
  InMemoryReminderRepository,
  generateReminderFingerprint,
} from '@mecha-bot/scheduler';

describe('M4A — Reminder & Timer Domain Foundation (Core Lifecycles & Rules)', () => {
  let clock: FakeClock;
  let repo: InMemoryReminderRepository;
  let service: ReminderSchedulerService;

  beforeEach(() => {
    // 2026-10-15 14:00:00 UTC (17:00:00 Baghdad time)
    clock = new FakeClock('2026-10-15T14:00:00.000Z');
    repo = new InMemoryReminderRepository();
    service = new ReminderSchedulerService({
      repo,
      clock,
      defaultTimezone: 'Asia/Baghdad',
    });
  });

  it('1. Creates a deterministic one-shot reminder', () => {
    const dueAt = '2026-10-15T14:15:00.000Z'; // 17:15 Baghdad
    const { reminder, isDuplicate } = service.createReminder({
      userKey: 'student_123',
      kind: 'STUDY',
      title: 'مراجعة منظومات السيطرة',
      dueAt,
      sourceType: 'STUDENT_CONFIRMED',
    });

    expect(isDuplicate).toBe(false);
    expect(reminder.id).toBeDefined();
    expect(reminder.userKey).toBe('student_123');
    expect(reminder.kind).toBe('STUDY');
    expect(reminder.title).toBe('مراجعة منظومات السيطرة');
    expect(reminder.dueAt).toBe(dueAt);
    expect(reminder.status).toBe('SCHEDULED');
    expect(reminder.sourceType).toBe('STUDENT_CONFIRMED');
    expect(reminder.createdAt).toBe(clock.nowIso());

    const saved = repo.findById(reminder.id);
    expect(saved).not.toBeNull();
    expect(saved?.id).toBe(reminder.id);
  });

  it('2. Creates a dedicated 15-minute break timer with exact deterministic due time', () => {
    const timer = service.createTimer({
      userKey: 'student_123',
      kind: 'BREAK_TIMER',
      durationMinutes: 15,
    });

    expect(timer.kind).toBe('BREAK_TIMER');
    expect(timer.title).toBe('استراحة 15 دقيقة');
    expect(timer.sourceType).toBe('STUDENT_CONFIRMED');
    expect(timer.status).toBe('SCHEDULED');

    // Due at exactly now + 15 minutes = 14:15:00.000Z (17:15 Baghdad)
    expect(timer.dueAt).toBe('2026-10-15T14:15:00.000Z');
  });

  it('3. Creates a custom 25-minute study timer', () => {
    const timer = service.createTimer({
      userKey: 'student_123',
      kind: 'STUDY',
      durationMinutes: 25,
      title: 'جلسة دراسة ميكاترونكس',
    });

    expect(timer.kind).toBe('STUDY');
    expect(timer.title).toBe('جلسة دراسة ميكاترونكس');
    // 14:00 + 25m = 14:25:00.000Z
    expect(timer.dueAt).toBe('2026-10-15T14:25:00.000Z');
  });

  it('4. Supports relative scheduling via scheduleAfter', () => {
    const { reminder } = service.scheduleAfter({
      userKey: 'student_456',
      kind: 'ASSIGNMENT',
      title: 'تسليم تقرير المختبر',
      durationMinutes: 120, // 2 hours
    });

    expect(reminder.dueAt).toBe('2026-10-15T16:00:00.000Z');
  });

  it('5. Rejects non-positive or invalid duration for timers and relative scheduling', () => {
    expect(() => {
      service.createTimer({
        userKey: 'student_123',
        durationMinutes: 0,
      });
    }).toThrow(/Invalid timer duration/);

    expect(() => {
      service.scheduleAfter({
        userKey: 'student_123',
        kind: 'STUDY',
        title: 'دراسة',
        durationMinutes: -10,
      });
    }).toThrow(/Invalid duration in minutes/);

    expect(() => {
      service.scheduleAfter({
        userKey: 'student_123',
        kind: 'STUDY',
        title: 'دراسة',
        durationMinutes: NaN,
      });
    }).toThrow(/Invalid duration in minutes/);
  });

  it('6. Supports cancellation, completion, and delivery status transitions', () => {
    const timer = service.createTimer({
      userKey: 'student_123',
      durationMinutes: 10,
    });

    // 1. Cancel
    const cancelled = service.cancelReminder(timer.id);
    expect(cancelled.status).toBe('CANCELLED');
    expect(cancelled.cancelledAt).toBe(clock.nowIso());
    expect(repo.findById(timer.id)?.status).toBe('CANCELLED');

    // 2. Reschedule & Complete
    const { reminder: r2 } = service.createReminder({
      userKey: 'student_123',
      kind: 'GENERAL',
      title: 'فحص الحساب',
      dueAt: '2026-10-15T15:00:00.000Z',
    });

    const completed = service.completeReminder(r2.id);
    expect(completed.status).toBe('COMPLETED');
    expect(completed.completedAt).toBe(clock.nowIso());

    // 3. Reschedule & Mark Delivered
    const { reminder: r3 } = service.createReminder({
      userKey: 'student_123',
      kind: 'QUIZ',
      title: 'كويز أجهزة قياس',
      dueAt: '2026-10-15T15:30:00.000Z',
    });

    const delivered = service.markDelivered(r3.id);
    expect(delivered.status).toBe('DELIVERED');
    expect(delivered.deliveredAt).toBe(clock.nowIso());
  });

  it('7. Queries due reminders and upcoming reminders accurately', () => {
    // R1 due at 14:10
    service.createReminder({
      userKey: 'student_123',
      kind: 'STUDY',
      title: 'المهمة 1',
      dueAt: '2026-10-15T14:10:00.000Z',
    });

    // R2 due at 14:30
    service.createReminder({
      userKey: 'student_123',
      kind: 'STUDY',
      title: 'المهمة 2',
      dueAt: '2026-10-15T14:30:00.000Z',
    });

    // R3 due tomorrow 14:00
    service.createReminder({
      userKey: 'student_123',
      kind: 'STUDY',
      title: 'المهمة 3',
      dueAt: '2026-10-16T14:00:00.000Z',
    });

    // At 14:00: neither R1 nor R2 is due yet
    expect(service.getDueReminders('2026-10-15T14:00:00.000Z').length).toBe(0);

    // At 14:15: R1 is due
    const due1415 = service.getDueReminders('2026-10-15T14:15:00.000Z');
    expect(due1415.length).toBe(1);
    expect(due1415[0]?.title).toBe('المهمة 1');

    // At 14:35: R1 and R2 are due
    const due1435 = service.getDueReminders('2026-10-15T14:35:00.000Z');
    expect(due1435.length).toBe(2);

    // Upcoming within 60 minutes for student_123
    const upcoming60 = service.getUpcomingReminders('student_123', 60);
    expect(upcoming60.length).toBe(2); // R1 and R2
  });

  it('8. Enforces idempotency and detects duplicates across identical parameters', () => {
    const dueAt = '2026-10-15T15:00:00.000Z';
    const params = {
      userKey: 'student_123',
      kind: 'QUIZ' as const,
      title: 'كويز معالجات دقيقة',
      dueAt,
      relatedAcademicEventId: 'event_quiz_101',
    };

    // Calculate fingerprint
    const fp1 = generateReminderFingerprint(params);
    const fp2 = generateReminderFingerprint({
      ...params,
      title: '  كويز معالجات دقيقة  ', // whitespace trimmed
    });
    expect(fp1).toBe(fp2);

    // First creation
    const res1 = service.createReminder(params);
    expect(res1.isDuplicate).toBe(false);

    // Duplicate creation attempt with identical event, time, and user
    const res2 = service.createReminder(params);
    expect(res2.isDuplicate).toBe(true);
    expect(res2.reminder.id).toBe(res1.reminder.id);

    // Total in repository remains 1
    expect(repo.listByUser('student_123').length).toBe(1);
  });

  it('9. Enforces CORE PRODUCT RULE: Inferred academic event CANNOT automatically create active reminder without student confirmation', () => {
    // Inferred unconfirmed event must be rejected
    expect(() => {
      service.createReminder({
        userKey: 'student_123',
        kind: 'EXAM',
        title: 'امتحان منتصف الفصل (مستنتج من ملف تدريسي غير مؤكد)',
        dueAt: '2026-10-20T07:00:00.000Z',
        sourceType: 'INFERRED_UNCONFIRMED',
      });
    }).toThrow(/Cannot schedule reminder from unconfirmed inferred source/);

    // Rejection also enforced in scheduleAcademicEventReminder
    expect(() => {
      service.scheduleAcademicEventReminder({
        userKey: 'student_123',
        courseCode: 'MCT314',
        academicEventId: 'evt_tentative_1',
        eventTitle: 'كويز مفاجئ غير مؤكد',
        eventTime: '2026-10-20T07:00:00.000Z',
        offsetMinutes: -120,
        sourceType: 'INFERRED_UNCONFIRMED',
      });
    }).toThrow(/Cannot schedule reminder for unconfirmed inferred event/);
  });

  it('10. Confirmed student/academic event successfully schedules active reminders', () => {
    // Explicit student request "ذكرني قبل الكويز بساعتين"
    const reminder = service.scheduleAcademicEventReminder({
      userKey: 'student_123',
      courseCode: 'MCT314',
      academicEventId: 'evt_confirmed_1',
      eventTitle: 'كويز أنظمة السيطرة',
      eventTime: '2026-10-20T07:00:00.000Z', // 10:00 Baghdad
      offsetMinutes: -120, // 2 hours before = 05:00 UTC (08:00 Baghdad)
      sourceType: 'STUDENT_CONFIRMED',
    });

    expect(reminder.status).toBe('SCHEDULED');
    expect(reminder.dueAt).toBe('2026-10-20T05:00:00.000Z');
    expect(reminder.relatedCourseCode).toBe('MCT314');
    expect(reminder.relatedAcademicEventId).toBe('evt_confirmed_1');
  });

  it('11. Zero AI and zero Telegram delivery dependencies in domain scheduler', () => {
    // Verifies service has no AI provider or Telegram Bot API dependencies
    expect((service as unknown as { aiClient?: unknown }).aiClient).toBeUndefined();
    expect((service as unknown as { bot?: unknown }).bot).toBeUndefined();
  });
});
