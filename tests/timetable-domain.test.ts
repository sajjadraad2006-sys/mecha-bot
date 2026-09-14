import { describe, expect, it } from 'vitest';
import { FakeClock } from '@mecha-bot/shared';
import {
  addDaysToDateString,
  compareTimes,
  getBaghdadCurrentWeekday,
  getBaghdadDateInfo,
  getBaghdadToday,
  getBaghdadTomorrow,
  getOverlapRange,
  getWeekdayFromDateString,
  intervalsOverlap,
  isAcademicDay,
  isSlotEffectiveOnDate,
  isWeekend,
  minutesToTime,
  timeToMinutes,
  TimetableSlotSchema,
  validateSlot,
  WeekdaySchema,
  type TimetableSlot,
} from '../packages/timetable/src/index.js';

describe('Timetable Domain - Weekday Validation', () => {
  it('accepts all 7 valid uppercase weekdays', () => {
    const validDays = [
      'SUNDAY',
      'MONDAY',
      'TUESDAY',
      'WEDNESDAY',
      'THURSDAY',
      'FRIDAY',
      'SATURDAY',
    ];
    for (const day of validDays) {
      expect(WeekdaySchema.parse(day)).toBe(day);
    }
  });

  it('rejects invalid weekdays', () => {
    expect(() => WeekdaySchema.parse('FUNDAY')).toThrow();
    expect(() => WeekdaySchema.parse('sunday')).toThrow();
    expect(() => WeekdaySchema.parse('')).toThrow();
    expect(() => WeekdaySchema.parse(123)).toThrow();
  });

  it('distinguishes academic weekdays from weekend days in Iraq', () => {
    expect(isAcademicDay('SUNDAY')).toBe(true);
    expect(isAcademicDay('MONDAY')).toBe(true);
    expect(isAcademicDay('TUESDAY')).toBe(true);
    expect(isAcademicDay('WEDNESDAY')).toBe(true);
    expect(isAcademicDay('THURSDAY')).toBe(true);

    expect(isWeekend('FRIDAY')).toBe(true);
    expect(isWeekend('SATURDAY')).toBe(true);

    expect(isAcademicDay('FRIDAY')).toBe(false);
    expect(isWeekend('SUNDAY')).toBe(false);
  });
});

describe('Timetable Domain - Time & Slot Validation', () => {
  const validSlot: TimetableSlot = {
    id: 'test-slot-1',
    courseCode: 'TEST-TT-201',
    stage: 2,
    programSemester: 3,
    type: 'LECTURE',
    weekday: 'SUNDAY',
    startTime: '08:30',
    endTime: '10:30',
    sourceStatus: 'VERIFIED',
  };

  it('accepts a valid timetable slot', () => {
    const parsed = TimetableSlotSchema.parse(validSlot);
    expect(parsed.courseCode).toBe('TEST-TT-201');
    expect(parsed.startTime).toBe('08:30');
    expect(parsed.endTime).toBe('10:30');

    const result = validateSlot(validSlot);
    expect(result.valid).toBe(true);
    expect(result.data?.id).toBe('test-slot-1');
  });

  it('rejects slots where startTime is not strictly before endTime', () => {
    // Equal times
    expect(() =>
      TimetableSlotSchema.parse({
        ...validSlot,
        startTime: '10:00',
        endTime: '10:00',
      }),
    ).toThrow(/startTime must be strictly before endTime/);

    // Start after end
    expect(() =>
      TimetableSlotSchema.parse({
        ...validSlot,
        startTime: '11:00',
        endTime: '09:00',
      }),
    ).toThrow(/startTime must be strictly before endTime/);
  });

  it('rejects invalid time strings format', () => {
    expect(() =>
      TimetableSlotSchema.parse({
        ...validSlot,
        startTime: '8:30', // missing leading zero
      }),
    ).toThrow(/Invalid time format/);

    expect(() =>
      TimetableSlotSchema.parse({
        ...validSlot,
        startTime: '25:00', // out of bounds
      }),
    ).toThrow(/Invalid time format/);

    expect(() =>
      TimetableSlotSchema.parse({
        ...validSlot,
        endTime: '10:65', // invalid minutes
      }),
    ).toThrow(/Invalid time format/);
  });

  it('rejects malformed slot objects through validateSlot helper', () => {
    const res1 = validateSlot({});
    expect(res1.valid).toBe(false);
    expect(res1.errors).toBeDefined();

    const res2 = validateSlot({ ...validSlot, stage: 5 }); // stage out of 1..4
    expect(res2.valid).toBe(false);

    const res3 = validateSlot({ ...validSlot, programSemester: 9 }); // semester out of 1..8
    expect(res3.valid).toBe(false);
  });

  it('enforces validFrom <= validTo when both are specified', () => {
    expect(() =>
      TimetableSlotSchema.parse({
        ...validSlot,
        validFrom: '2026-10-01',
        validTo: '2026-09-01',
      }),
    ).toThrow(/validFrom must be before or equal to validTo/);

    const validRange = TimetableSlotSchema.parse({
      ...validSlot,
      validFrom: '2026-09-01',
      validTo: '2026-10-01',
    });
    expect(validRange.validFrom).toBe('2026-09-01');
  });
});

describe('Timetable Domain - Time Arithmetic & Overlap Checks', () => {
  it('converts HH:MM to minutes since midnight accurately', () => {
    expect(timeToMinutes('00:00')).toBe(0);
    expect(timeToMinutes('08:30')).toBe(510);
    expect(timeToMinutes('12:00')).toBe(720);
    expect(timeToMinutes('23:59')).toBe(1439);
  });

  it('throws on invalid timeToMinutes inputs', () => {
    expect(() => timeToMinutes('invalid')).toThrow();
    expect(() => timeToMinutes('24:00')).toThrow();
    expect(() => timeToMinutes('-01:00')).toThrow();
  });

  it('converts minutes since midnight to HH:MM string', () => {
    expect(minutesToTime(0)).toBe('00:00');
    expect(minutesToTime(510)).toBe('08:30');
    expect(minutesToTime(720)).toBe('12:00');
    expect(minutesToTime(1439)).toBe('23:59');
  });

  it('compares times deterministically', () => {
    expect(compareTimes('08:30', '10:00')).toBe(-1);
    expect(compareTimes('10:00', '08:30')).toBe(1);
    expect(compareTimes('08:30', '08:30')).toBe(0);
  });

  it('verifies that touching intervals are NOT conflicts', () => {
    // 08:30-10:30 and 10:30-12:30 touch at boundary
    expect(intervalsOverlap('08:30', '10:30', '10:30', '12:30')).toBe(false);
    expect(intervalsOverlap('10:30', '12:30', '08:30', '10:30')).toBe(false);
    expect(getOverlapRange('08:30', '10:30', '10:30', '12:30')).toBeNull();
  });

  it('verifies that overlapping intervals are detected with exact overlap bounds', () => {
    // 09:00-11:00 overlaps with 10:00-12:00 (overlap: 10:00-11:00)
    expect(intervalsOverlap('09:00', '11:00', '10:00', '12:00')).toBe(true);
    const overlap = getOverlapRange('09:00', '11:00', '10:00', '12:00');
    expect(overlap).toEqual({ overlapStart: '10:00', overlapEnd: '11:00' });
  });

  it('verifies fully contained intervals overlap correctly', () => {
    // 08:00-12:00 contains 09:00-10:00
    expect(intervalsOverlap('08:00', '12:00', '09:00', '10:00')).toBe(true);
    const overlap = getOverlapRange('08:00', '12:00', '09:00', '10:00');
    expect(overlap).toEqual({ overlapStart: '09:00', overlapEnd: '10:00' });
  });
});

describe('Timetable Domain - Asia/Baghdad Timezone & Deterministic Calendar', () => {
  it('extracts correct date and time in Asia/Baghdad (UTC+3)', () => {
    // 2026-09-14T05:30:00.000Z is 08:30 in Baghdad
    const utcDate = new Date('2026-09-14T05:30:00.000Z');
    const info = getBaghdadDateInfo(utcDate);

    expect(info.dateString).toBe('2026-09-14');
    expect(info.timeString).toBe('08:30');
    expect(info.weekday).toBe('MONDAY');
    expect(info.minutesSinceMidnight).toBe(510);
  });

  it('handles midnight boundary transition in Asia/Baghdad', () => {
    // 2026-09-13T21:15:00.000Z is 00:15 on Monday Sep 14 in Baghdad (UTC+3)
    const utcDate = new Date('2026-09-13T21:15:00.000Z');
    const info = getBaghdadDateInfo(utcDate);

    expect(info.dateString).toBe('2026-09-14');
    expect(info.timeString).toBe('00:15');
    expect(info.weekday).toBe('MONDAY');
  });

  it('operates deterministically with FakeClock', () => {
    const clock = new FakeClock('2026-09-13T06:00:00.000Z'); // Sunday 09:00 Baghdad
    expect(getBaghdadToday(clock)).toBe('2026-09-13');
    expect(getBaghdadCurrentWeekday(clock)).toBe('SUNDAY');
    expect(getBaghdadTomorrow(clock)).toBe('2026-09-14');

    clock.advanceDays(4); // Advance 4 days to Thursday
    expect(getBaghdadToday(clock)).toBe('2026-09-17');
    expect(getBaghdadCurrentWeekday(clock)).toBe('THURSDAY');
  });

  it('adds and subtracts days without timezone drift', () => {
    expect(addDaysToDateString('2026-09-14', 1)).toBe('2026-09-15');
    expect(addDaysToDateString('2026-09-30', 1)).toBe('2026-10-01');
    expect(addDaysToDateString('2026-10-01', -1)).toBe('2026-09-30');
  });

  it('determines weekday accurately from YYYY-MM-DD string', () => {
    expect(getWeekdayFromDateString('2026-09-13')).toBe('SUNDAY');
    expect(getWeekdayFromDateString('2026-09-14')).toBe('MONDAY');
    expect(getWeekdayFromDateString('2026-09-17')).toBe('THURSDAY');
    expect(getWeekdayFromDateString('2026-09-18')).toBe('FRIDAY');
    expect(getWeekdayFromDateString('2026-09-19')).toBe('SATURDAY');
  });

  it('checks effective date bounds accurately', () => {
    const slot: TimetableSlot = {
      id: 'slot-bound',
      courseCode: 'TEST-TT-201',
      stage: 2,
      programSemester: 3,
      type: 'LECTURE',
      weekday: 'SUNDAY',
      startTime: '08:30',
      endTime: '10:30',
      validFrom: '2026-09-01',
      validTo: '2026-09-30',
      sourceStatus: 'VERIFIED',
    };

    expect(isSlotEffectiveOnDate(slot, '2026-08-31')).toBe(false);
    expect(isSlotEffectiveOnDate(slot, '2026-09-01')).toBe(true);
    expect(isSlotEffectiveOnDate(slot, '2026-09-15')).toBe(true);
    expect(isSlotEffectiveOnDate(slot, '2026-09-30')).toBe(true);
    expect(isSlotEffectiveOnDate(slot, '2026-10-01')).toBe(false);
  });
});
