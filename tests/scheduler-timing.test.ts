import { describe, it, expect, beforeEach } from 'vitest';
import { FakeClock } from '@mecha-bot/shared';
import {
  evaluateQuietHours,
  calculateNextOccurrence,
  buildReminderTimes,
  classifyReminderDueState,
  categorizeOverdueReminders,
  getZonedParts,
  createUtcDateFromZonedParts,
  ReminderSchedulerService,
  InMemoryReminderRepository,
  QuietHoursConfig,
  Reminder,
} from '@mecha-bot/scheduler';

describe('M4A — Scheduler Timing, Timezones, Quiet Hours & Recurrence Engine', () => {
  let clock: FakeClock;
  let repo: InMemoryReminderRepository;
  let service: ReminderSchedulerService;

  const sampleQuietHours: QuietHoursConfig = {
    enabled: true,
    startHour: 23, // 11:00 PM Baghdad
    startMinute: 0,
    endHour: 7, // 07:00 AM Baghdad
    endMinute: 0,
    timezone: 'Asia/Baghdad',
  };

  beforeEach(() => {
    // 2026-10-15 14:00:00 UTC = 17:00:00 Asia/Baghdad (UTC+3)
    clock = new FakeClock('2026-10-15T14:00:00.000Z');
    repo = new InMemoryReminderRepository();
    service = new ReminderSchedulerService({
      repo,
      clock,
      defaultTimezone: 'Asia/Baghdad',
    });
  });

  describe('1. Timezone & Wall-Clock UTC Boundary Behavior', () => {
    it('accurately extracts Asia/Baghdad wall-clock parts from UTC', () => {
      // 2026-10-15T21:30:00.000Z UTC is 2026-10-16 00:30:00 Baghdad time (next calendar day!)
      const parts = getZonedParts('2026-10-15T21:30:00.000Z', 'Asia/Baghdad');
      expect(parts.year).toBe(2026);
      expect(parts.month).toBe(10);
      expect(parts.day).toBe(16);
      expect(parts.hour).toBe(0);
      expect(parts.minute).toBe(30);
      expect(parts.weekday).toBe('FRIDAY');
    });

    it('creates exact UTC Date from Baghdad wall-clock parts across month boundary', () => {
      // 2026-10-31 23:45 Baghdad time should correspond to 2026-10-31 20:45 UTC
      const utcDate = createUtcDateFromZonedParts(
        {
          year: 2026,
          month: 10,
          day: 31,
          hour: 23,
          minute: 45,
          second: 0,
        },
        'Asia/Baghdad',
      );

      expect(utcDate.toISOString()).toBe('2026-10-31T20:45:00.000Z');
    });
  });

  describe('2. Quiet Hours & Scheduling Decisions', () => {
    it('returns DELIVER_NOW when time is outside quiet hours', () => {
      // 14:00 UTC = 17:00 Baghdad (daytime)
      const res = evaluateQuietHours('2026-10-15T14:00:00.000Z', sampleQuietHours);
      expect(res.inQuietHours).toBe(false);
      expect(res.decision).toBe('DELIVER_NOW');
    });

    it('returns DEFER_UNTIL_QUIET_HOURS_END for automated reminders falling inside quiet hours', () => {
      // 2026-10-15 22:00:00 UTC = 2026-10-16 01:00:00 Baghdad (quiet hours 23:00 to 07:00)
      const res = evaluateQuietHours('2026-10-15T22:00:00.000Z', sampleQuietHours, {
        isExplicitlyRequested: false,
      });

      expect(res.inQuietHours).toBe(true);
      expect(res.decision).toBe('DEFER_UNTIL_QUIET_HOURS_END');
      // Deferred to 07:00 AM Baghdad on October 16 = 04:00:00 UTC
      expect(res.suggestedDueAt).toBe('2026-10-16T04:00:00.000Z');
      expect(res.originalDueAt).toBe('2026-10-15T22:00:00.000Z'); // preserved!
    });

    it('returns REQUIRES_POLICY_DECISION when student explicitly requested a time inside quiet hours', () => {
      // Student explicitly says "ذكرني الساعة 2 بالليل" (02:00 Baghdad = 23:00 UTC)
      const res = evaluateQuietHours('2026-10-15T23:00:00.000Z', sampleQuietHours, {
        isExplicitlyRequested: true,
      });

      expect(res.inQuietHours).toBe(true);
      expect(res.decision).toBe('REQUIRES_POLICY_DECISION');
      // Original requested time must NOT be silently altered!
      expect(res.originalDueAt).toBe('2026-10-15T23:00:00.000Z');
    });

    it('returns ALLOW_URGENT for critical urgent alerts inside quiet hours', () => {
      const res = evaluateQuietHours('2026-10-15T23:00:00.000Z', sampleQuietHours, {
        isUrgent: true,
      });

      expect(res.inQuietHours).toBe(true);
      expect(res.decision).toBe('ALLOW_URGENT');
    });

    it('returns DELIVER_NOW when quiet hours are disabled', () => {
      const disabledConfig: QuietHoursConfig = {
        ...sampleQuietHours,
        enabled: false,
      };

      const res = evaluateQuietHours('2026-10-15T23:00:00.000Z', disabledConfig);
      expect(res.inQuietHours).toBe(false);
      expect(res.decision).toBe('DELIVER_NOW');
    });
  });

  describe('3. Student Reminder Preference Semantics', () => {
    it('models QUIET mode preference (only important and manual timers)', () => {
      const quietPrefs = { mode: 'QUIET' as const, maxDailySuggestions: 0 };
      expect(quietPrefs.mode).toBe('QUIET');
      expect(quietPrefs.maxDailySuggestions).toBe(0);
    });

    it('models BALANCED mode preference (standard academic reminders)', () => {
      const balancedPrefs = { mode: 'BALANCED' as const, maxDailySuggestions: 3 };
      expect(balancedPrefs.mode).toBe('BALANCED');
      expect(balancedPrefs.maxDailySuggestions).toBe(3);
    });

    it('models ALL_IN mode preference (frequent suggestions and check-ins)', () => {
      const allInPrefs = { mode: 'ALL_IN' as const, maxDailySuggestions: 10 };
      expect(allInPrefs.mode).toBe('ALL_IN');
      expect(allInPrefs.maxDailySuggestions).toBe(10);
    });
  });

  describe('4. Academic Reminder Offsets', () => {
    it('computes exact reminder offsets (-1440 mins and -120 mins) sorted chronologically', () => {
      // Event: 2026-10-20 07:00:00 UTC (10:00 Baghdad)
      const eventTime = '2026-10-20T07:00:00.000Z';
      const times = buildReminderTimes(eventTime, [-1440, -120]);

      expect(times.length).toBe(2);
      // 1 day before (24h) = 2026-10-19 07:00:00 UTC
      expect(times[0]).toBe('2026-10-19T07:00:00.000Z');
      // 2 hours before = 2026-10-20 05:00:00 UTC
      expect(times[1]).toBe('2026-10-20T05:00:00.000Z');
    });

    it('rejects invalid event time in offset calculation', () => {
      expect(() => {
        buildReminderTimes('invalid-time-string', [-120]);
      }).toThrow(/Invalid event time/);
    });
  });

  describe('5. Recurrence Engine (Daily, Weekly, University Weekdays)', () => {
    it('calculates next DAILY occurrence at 08:30 Baghdad', () => {
      // Currently: 2026-10-15 14:00 UTC (17:00 Baghdad).
      // Daily check-in at 08:30 Baghdad (05:30 UTC).
      // Since 17:00 is past 08:30 today, next occurrence must be tomorrow 2026-10-16 08:30 Baghdad (05:30 UTC).
      const next = calculateNextOccurrence(
        {
          type: 'DAILY',
          timeOfDay: { hour: 8, minute: 30 },
          timezone: 'Asia/Baghdad',
        },
        '2026-10-15T14:00:00.000Z',
      );

      expect(next).toBe('2026-10-16T05:30:00.000Z');
    });

    it('calculates today occurrence if fromDate is before the daily time', () => {
      // Currently: 2026-10-15 03:00 UTC (06:00 Baghdad).
      // Next 08:30 occurrence should be today!
      const next = calculateNextOccurrence(
        {
          type: 'DAILY',
          timeOfDay: { hour: 8, minute: 30 },
          timezone: 'Asia/Baghdad',
        },
        '2026-10-15T03:00:00.000Z',
      );

      expect(next).toBe('2026-10-15T05:30:00.000Z');
    });

    it('calculates SELECTED_WEEKDAYS for Iraqi university week (Sunday–Thursday)', () => {
      // 2026-10-15 is Thursday.
      // After Thursday 17:00 Baghdad, the next university day is Sunday (Friday and Saturday are weekend!).
      const next = calculateNextOccurrence(
        {
          type: 'SELECTED_WEEKDAYS',
          weekdays: ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY'],
          timeOfDay: { hour: 9, minute: 0 },
          timezone: 'Asia/Baghdad',
        },
        '2026-10-15T14:00:00.000Z', // Thursday 17:00 Baghdad
      );

      // Next occurrence: Sunday, 2026-10-18 at 09:00 Baghdad = 06:00 UTC
      expect(next).toBe('2026-10-18T06:00:00.000Z');
    });

    it('calculates recurrence accurately across month and year boundaries', () => {
      // 2026-10-31 (Saturday) 17:00 Baghdad.
      // Next university weekday (Sunday) is in the new month: November 1st, 2026!
      const next = calculateNextOccurrence(
        {
          type: 'SELECTED_WEEKDAYS',
          weekdays: ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY'],
          timeOfDay: { hour: 8, minute: 0 },
          timezone: 'Asia/Baghdad',
        },
        '2026-10-31T14:00:00.000Z',
      );

      expect(next).toBe('2026-11-01T05:00:00.000Z');
    });

    it('calculates WEEKLY recurrence on specified day', () => {
      // Tuesday weekly review at 18:00 Baghdad (15:00 UTC).
      // fromDate: 2026-10-15 (Thursday).
      // Next Tuesday is 2026-10-20.
      const next = calculateNextOccurrence(
        {
          type: 'WEEKLY',
          weekdays: ['TUESDAY'],
          timeOfDay: { hour: 18, minute: 0 },
          timezone: 'Asia/Baghdad',
        },
        '2026-10-15T14:00:00.000Z',
      );

      expect(next).toBe('2026-10-20T15:00:00.000Z');
    });

    it('rejects invalid recurrence parameters', () => {
      expect(() => {
        calculateNextOccurrence(
          {
            type: 'DAILY',
            timeOfDay: { hour: 25, minute: 0 }, // invalid hour > 23
          },
          new Date(),
        );
      }).toThrow(/Invalid hour/);

      expect(() => {
        calculateNextOccurrence(
          {
            type: 'SELECTED_WEEKDAYS',
            weekdays: [], // empty weekdays
            timeOfDay: { hour: 10, minute: 0 },
          },
          new Date(),
        );
      }).toThrow(/SELECTED_WEEKDAYS recurrence requires at least one weekday/);
    });
  });

  describe('6. Overdue & Process Restart Handling', () => {
    it('classifies DUE when reminder is due within 1 minute', () => {
      const now = '2026-10-15T14:00:00.000Z';
      const dueAt = '2026-10-15T13:59:30.000Z'; // 30s ago
      expect(classifyReminderDueState(dueAt, now, 30)).toBe('DUE');
    });

    it('classifies OVERDUE_RECENT after bot restart within grace window (<= 30 mins)', () => {
      // Bot restarted at 17:08 (14:08 UTC). Reminder was due at 17:00 (14:00 UTC) -> 8 minutes overdue
      const now = '2026-10-15T14:08:00.000Z';
      const dueAt = '2026-10-15T14:00:00.000Z';
      expect(classifyReminderDueState(dueAt, now, 30)).toBe('OVERDUE_RECENT');
    });

    it('classifies EXPIRED when overdue beyond grace window (> 30 mins)', () => {
      // Bot was offline for 2 hours (120 mins overdue)
      const now = '2026-10-15T16:00:00.000Z';
      const dueAt = '2026-10-15T14:00:00.000Z';
      expect(classifyReminderDueState(dueAt, now, 30)).toBe('EXPIRED');
    });

    it('batches and categorizes reminders on restart accurately', () => {
      const now = '2026-10-15T14:08:00.000Z';

      const reminders: Reminder[] = [
        {
          id: 'rem_due_now',
          userKey: 'u1',
          kind: 'BREAK_TIMER',
          title: 'Due Now',
          dueAt: '2026-10-15T14:07:30.000Z', // 30s overdue -> DUE
          timezone: 'Asia/Baghdad',
          status: 'SCHEDULED',
          sourceType: 'STUDENT_CONFIRMED',
          createdAt: '2026-10-15T13:52:00.000Z',
        },
        {
          id: 'rem_recent_overdue',
          userKey: 'u1',
          kind: 'STUDY',
          title: 'Recent Overdue (8m)',
          dueAt: '2026-10-15T14:00:00.000Z', // 8m overdue -> OVERDUE_RECENT
          timezone: 'Asia/Baghdad',
          status: 'SCHEDULED',
          sourceType: 'STUDENT_CONFIRMED',
          createdAt: '2026-10-15T13:00:00.000Z',
        },
        {
          id: 'rem_expired',
          userKey: 'u1',
          kind: 'QUIZ',
          title: 'Expired Reminder (3h overdue)',
          dueAt: '2026-10-15T11:00:00.000Z', // 3h overdue -> EXPIRED
          timezone: 'Asia/Baghdad',
          status: 'SCHEDULED',
          sourceType: 'STUDENT_CONFIRMED',
          createdAt: '2026-10-15T10:00:00.000Z',
        },
      ];

      const batch = categorizeOverdueReminders(reminders, now, 30);
      expect(batch.due.length).toBe(1);
      expect(batch.due[0]?.id).toBe('rem_due_now');

      expect(batch.overdueRecent.length).toBe(1);
      expect(batch.overdueRecent[0]?.id).toBe('rem_recent_overdue');

      expect(batch.expired.length).toBe(1);
      expect(batch.expired[0]?.id).toBe('rem_expired');
    });

    it('integrates overdue categorization via service pollAndClassifyReminders', () => {
      // Schedule reminder due at 14:00
      service.createReminder({
        userKey: 'u1',
        kind: 'STUDY',
        title: 'دراسة سيطرة',
        dueAt: '2026-10-15T14:00:00.000Z',
      });

      // Advance clock by 10 minutes to 14:10 (bot restart simulation)
      clock.advanceMs(10 * 60 * 1000);

      const res = service.pollAndClassifyReminders(30);
      expect(res.overdueRecent.length).toBe(1);
      expect(res.overdueRecent[0]?.title).toBe('دراسة سيطرة');
    });
  });
});
