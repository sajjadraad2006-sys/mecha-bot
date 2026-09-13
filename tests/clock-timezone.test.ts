import { describe, it, expect } from 'vitest';
import {
  FakeClock,
  SystemClock,
  formatToAcademicDate,
  calculateAcademicWeek,
  daysBetweenAcademicDates,
  isValidAcademicDate,
} from '@mecha-bot/shared';

describe('Clock & Timezone Foundation', () => {
  it('FakeClock supports deterministic time setting and advancement', () => {
    const clock = new FakeClock('2026-09-14T08:00:00.000Z');
    expect(clock.nowIso()).toBe('2026-09-14T08:00:00.000Z');

    clock.advanceMs(3600000); // +1 hour
    expect(clock.nowIso()).toBe('2026-09-14T09:00:00.000Z');

    clock.advanceDays(7); // +7 days
    expect(clock.nowIso()).toBe('2026-09-21T09:00:00.000Z');
  });

  it('SystemClock provides valid real timestamps', () => {
    const clock = new SystemClock();
    const now = clock.now();
    expect(now.getTime()).toBeGreaterThan(0);
    expect(clock.nowIso()).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });

  it('correctly maps UTC timestamp to Asia/Baghdad academic calendar date', () => {
    // 2026-09-13T22:30:00.000Z is 2026-09-14T01:30:00 in Asia/Baghdad (UTC+3)
    const lateNightUtc = new Date('2026-09-13T22:30:00.000Z');
    const localDate = formatToAcademicDate(lateNightUtc, 'Asia/Baghdad');
    expect(localDate).toBe('2026-09-14');
  });

  it('validates academic date format and calculation', () => {
    expect(isValidAcademicDate('2026-09-14')).toBe(true);
    expect(isValidAcademicDate('2026-02-31')).toBe(false); // Invalid calendar date
    expect(isValidAcademicDate('not-a-date')).toBe(false);

    expect(daysBetweenAcademicDates('2026-09-01', '2026-09-15')).toBe(14);
    expect(calculateAcademicWeek('2026-09-01', '2026-09-15')).toBe(3); // 1-indexed (week 3)
  });
});
