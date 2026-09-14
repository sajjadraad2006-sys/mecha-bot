import { describe, expect, it } from 'vitest';
import { FakeClock } from '@mecha-bot/shared';
import {
  SYNTHETIC_STAGE2_SLOTS,
  SYNTHETIC_VERSIONED_SLOTS,
  TimetableService,
} from '../packages/timetable/src/index.js';

describe('TimetableService - Schedule Queries', () => {
  const service = new TimetableService({
    initialSlots: SYNTHETIC_STAGE2_SLOTS,
  });

  it('retrieves Sunday schedule ordered by startTime ascending', () => {
    const sundaySlots = service.getScheduleForDay({
      weekday: 'SUNDAY',
      stage: 2,
      programSemester: 3,
    });

    expect(sundaySlots.length).toBeGreaterThan(0);
    // Check ascending order
    for (let i = 0; i < sundaySlots.length - 1; i++) {
      expect(sundaySlots[i]!.startTime <= sundaySlots[i + 1]!.startTime).toBe(true);
    }
    // Outdated slot is excluded by default
    const hasOutdated = sundaySlots.some((s) => s.sourceStatus === 'OUTDATED');
    expect(hasOutdated).toBe(false);
  });

  it('includes outdated slots when includeOutdated is explicitly true', () => {
    const slots = service.getScheduleForDay({
      weekday: 'SUNDAY',
      stage: 2,
      programSemester: 3,
      includeOutdated: true,
    });

    const outdated = slots.find((s) => s.id === 'tt-slot-sun-old');
    expect(outdated).toBeDefined();
    expect(outdated?.sourceStatus).toBe('OUTDATED');
  });

  it('retrieves Thursday schedule accurately', () => {
    const thuSlots = service.getScheduleForDay({
      weekday: 'THURSDAY',
      stage: 2,
      programSemester: 3,
    });

    expect(thuSlots.length).toBe(1);
    expect(thuSlots[0]?.courseCode).toBe('TEST-TT-204');
    expect(thuSlots[0]?.type).toBe('OTHER');
    expect(thuSlots[0]?.notes).toBe('Department Seminar');
  });

  it('returns empty array for days without classes (Friday & Saturday)', () => {
    const friSlots = service.getScheduleForDay({
      weekday: 'FRIDAY',
      stage: 2,
      programSemester: 3,
    });
    expect(friSlots).toEqual([]);

    const satSlots = service.getScheduleForDay({
      weekday: 'SATURDAY',
      stage: 2,
      programSemester: 3,
    });
    expect(satSlots).toEqual([]);
  });

  it('generates full week schedule grouped by weekday', () => {
    const weekSchedule = service.getScheduleForWeek({
      stage: 2,
      programSemester: 3,
      section: 'A',
    });

    expect(weekSchedule.size).toBe(7);
    expect(weekSchedule.get('SUNDAY')?.length).toBeGreaterThan(0);
    expect(weekSchedule.get('MONDAY')?.length).toBeGreaterThan(0);
    expect(weekSchedule.get('FRIDAY')).toEqual([]);
    expect(weekSchedule.get('SATURDAY')).toEqual([]);
  });
});

describe('TimetableService - Section & Subgroup Filtering', () => {
  const service = new TimetableService({
    initialSlots: SYNTHETIC_STAGE2_SLOTS,
  });

  it('delivers common lectures to all sections and section-specific classes only to relevant section', () => {
    // Section A student on Sunday
    const secASlots = service.getScheduleForDay({
      weekday: 'SUNDAY',
      stage: 2,
      programSemester: 3,
      section: 'A',
      subgroup: 'G1',
    });

    // Should receive:
    // 1. TEST-TT-201 (general lecture, no section)
    // 2. TEST-TT-202 (general tutorial, no section)
    // 3. TEST-TT-203 Section A Lab
    // Should NOT receive: Section B Lab
    expect(secASlots.some((s) => s.courseCode === 'TEST-TT-201')).toBe(true);
    expect(secASlots.some((s) => s.courseCode === 'TEST-TT-202')).toBe(true);
    expect(secASlots.some((s) => s.id === 'tt-slot-sun-03-secA-g1')).toBe(true);
    expect(secASlots.some((s) => s.id === 'tt-slot-sun-03-secB-g1')).toBe(false);

    // Section B student on Sunday
    const secBSlots = service.getScheduleForDay({
      weekday: 'SUNDAY',
      stage: 2,
      programSemester: 3,
      section: 'B',
      subgroup: 'G1',
    });
    expect(secBSlots.some((s) => s.id === 'tt-slot-sun-03-secB-g1')).toBe(true);
    expect(secBSlots.some((s) => s.id === 'tt-slot-sun-03-secA-g1')).toBe(false);
  });

  it('filters Tuesday section-specific classes accurately', () => {
    // Section A has Lab and Tutorial on Tuesday
    const secASlots = service.getScheduleForDay({
      weekday: 'TUESDAY',
      stage: 2,
      programSemester: 3,
      section: 'A',
    });
    expect(secASlots.length).toBe(2);

    // Section B has nothing on Tuesday
    const secBSlots = service.getScheduleForDay({
      weekday: 'TUESDAY',
      stage: 2,
      programSemester: 3,
      section: 'B',
    });
    expect(secBSlots.length).toBe(0);
  });
});

describe('TimetableService - Real-Time Class State & Next Class Engine', () => {
  const service = new TimetableService({
    initialSlots: SYNTHETIC_STAGE2_SLOTS,
  });

  it('detects currently active class accurately', () => {
    // Sunday 09:15 Baghdad time (06:15 UTC) -> slot 08:30-10:30 is active
    const activeInstant = new Date('2026-09-13T06:15:00.000Z');
    const activeClass = service.getCurrentClass({
      stage: 2,
      programSemester: 3,
      section: 'A',
      at: activeInstant,
    });

    expect(activeClass).toBeDefined();
    expect(activeClass?.courseCode).toBe('TEST-TT-201');
    expect(activeClass?.startTime).toBe('08:30');
    expect(activeClass?.endTime).toBe('10:30');
  });

  it('returns null when no class is currently in session', () => {
    // Sunday 07:00 Baghdad time (before classes start)
    const earlyInstant = new Date('2026-09-13T04:00:00.000Z');
    const activeClass = service.getCurrentClass({
      stage: 2,
      programSemester: 3,
      at: earlyInstant,
    });
    expect(activeClass).toBeNull();
  });

  it('finds next class later today', () => {
    // Monday at 10:10 Baghdad time (07:10 UTC)
    // Monday schedule: 09:00-11:00 (TEST-TT-204), 11:30-13:30 (TEST-TT-205)
    // Next class starting after 10:10 is TEST-TT-205 at 11:30!
    const mondayInstant = new Date('2026-09-14T07:10:00.000Z');
    const nextResult = service.getNextClass({
      stage: 2,
      programSemester: 3,
      from: mondayInstant,
    });

    expect(nextResult).not.toBeNull();
    expect(nextResult?.slot.courseCode).toBe('TEST-TT-205');
    expect(nextResult?.slot.startTime).toBe('11:30');
    expect(nextResult?.relativeDay).toBe('TODAY');
    // From 10:10 to 11:30 is 80 minutes
    expect(nextResult?.minutesUntilStart).toBe(80);
  });

  it('finds next class tomorrow when all classes today have ended', () => {
    // Sunday at 15:00 Baghdad time (12:00 UTC) - Sunday classes ended at 14:30
    // Next class is Monday morning at 09:00
    const sundayAfternoon = new Date('2026-09-13T12:00:00.000Z');
    const nextResult = service.getNextClass({
      stage: 2,
      programSemester: 3,
      from: sundayAfternoon,
    });

    expect(nextResult).not.toBeNull();
    expect(nextResult?.slot.courseCode).toBe('TEST-TT-204');
    expect(nextResult?.slot.startTime).toBe('09:00');
    expect(nextResult?.weekday).toBe('MONDAY');
    expect(nextResult?.relativeDay).toBe('TOMORROW');
    // From Sunday 15:00 to Monday 09:00 is 9 hours + 9 hours = 18 hours = 1080 minutes
    expect(nextResult?.minutesUntilStart).toBe(1080);
  });

  it('finds next class across the weekend boundary (Thursday to Sunday)', () => {
    // Thursday at 12:00 Baghdad time (09:00 UTC) - Thursday class ended at 11:00
    // Friday & Saturday are weekend. Next class is Sunday at 08:30!
    const thursdayNoon = new Date('2026-09-17T09:00:00.000Z');
    const nextResult = service.getNextClass({
      stage: 2,
      programSemester: 3,
      from: thursdayNoon,
    });

    expect(nextResult).not.toBeNull();
    expect(nextResult?.slot.courseCode).toBe('TEST-TT-201');
    expect(nextResult?.slot.startTime).toBe('08:30');
    expect(nextResult?.weekday).toBe('SUNDAY');
    expect(nextResult?.relativeDay).toBe('LATER');
  });

  it('retrieves the previous class that ended earlier today', () => {
    // Monday at 12:00 Baghdad time (09:00 UTC)
    // TEST-TT-204 ended at 11:00
    // TEST-TT-205 started at 11:30 and ends at 13:30
    const mondayInstant = new Date('2026-09-14T09:00:00.000Z');
    const prevClass = service.getPreviousClass({
      stage: 2,
      programSemester: 3,
      from: mondayInstant,
    });

    expect(prevClass).not.toBeNull();
    expect(prevClass?.courseCode).toBe('TEST-TT-204');
    expect(prevClass?.endTime).toBe('11:00');
  });

  it('returns today and tomorrow schedules deterministically with FakeClock', () => {
    const clock = new FakeClock('2026-09-13T05:00:00.000Z'); // Sunday morning Baghdad
    const serviceWithClock = new TimetableService({
      clock,
      initialSlots: SYNTHETIC_STAGE2_SLOTS,
    });

    const todaySlots = serviceWithClock.getTodaySchedule({
      stage: 2,
      programSemester: 3,
      section: 'A',
    });
    expect(todaySlots.length).toBeGreaterThan(0);
    expect(todaySlots[0]?.weekday).toBe('SUNDAY');

    const tomorrowSlots = serviceWithClock.getTomorrowSchedule({
      stage: 2,
      programSemester: 3,
      section: 'A',
    });
    expect(tomorrowSlots.length).toBeGreaterThan(0);
    expect(tomorrowSlots[0]?.weekday).toBe('MONDAY');
  });
});

describe('TimetableService - Schedule Versioning ("الجدول تغير من الأحد القادم")', () => {
  const versionedService = new TimetableService({
    initialSlots: SYNTHETIC_VERSIONED_SLOTS,
  });

  it('resolves Version 1 prior to effective date boundary', () => {
    // 2026-10-11 is Sunday (within Version 1: 2026-09-01 to 2026-10-17)
    const slots = versionedService.getScheduleForDay({
      date: '2026-10-11',
      stage: 3,
      programSemester: 5,
    });

    expect(slots.length).toBe(1);
    expect(slots[0]?.id).toBe('tt-version-early');
    expect(slots[0]?.startTime).toBe('08:30');
    expect(slots[0]?.room).toBe('Hall-Synth-1');
  });

  it('resolves Version 2 on and after effective date boundary', () => {
    // 2026-10-18 is Sunday ("الجدول تغير من الأحد القادم" - validFrom: 2026-10-18)
    const slots = versionedService.getScheduleForDay({
      date: '2026-10-18',
      stage: 3,
      programSemester: 5,
    });

    expect(slots.length).toBe(1);
    expect(slots[0]?.id).toBe('tt-version-revised');
    expect(slots[0]?.startTime).toBe('10:30');
    expect(slots[0]?.room).toBe('Hall-Synth-4');
  });
});

describe('TimetableService - Repository Management & Utilities', () => {
  it('manages slot collection via addSlot, setSlots, getAllSlots, and clear', () => {
    const service = new TimetableService();
    expect(service.getAllSlots()).toHaveLength(0);

    service.addSlot({
      id: 'dynamic-slot-1',
      courseCode: 'TEST-TT-101',
      stage: 1,
      programSemester: 1,
      type: 'LECTURE',
      weekday: 'SUNDAY',
      startTime: '08:30',
      endTime: '10:30',
      sourceStatus: 'VERIFIED',
    });

    expect(service.getAllSlots()).toHaveLength(1);
    expect(service.getAllSlots()[0]?.courseCode).toBe('TEST-TT-101');

    // Throws when adding invalid slot
    expect(() =>
      service.addSlot({
        id: 'bad-slot',
        courseCode: '',
        stage: 5 as unknown as number,
        programSemester: 1,
        type: 'LECTURE',
        weekday: 'SUNDAY',
        startTime: '10:00',
        endTime: '08:00',
        sourceStatus: 'VERIFIED',
      }),
    ).toThrow(/Cannot add invalid timetable slot/);

    service.setSlots(SYNTHETIC_STAGE2_SLOTS);
    expect(service.getAllSlots()).toHaveLength(SYNTHETIC_STAGE2_SLOTS.length);

    service.clear();
    expect(service.getAllSlots()).toHaveLength(0);
  });

  it('allows clock replacement and service validation', () => {
    const service = new TimetableService();
    const newClock = new FakeClock('2026-09-14T06:00:00.000Z');
    service.setClock(newClock);

    const validation = service.validateSlot({
      id: 'val-test',
      courseCode: 'TEST-TT-201',
      stage: 2,
      programSemester: 3,
      type: 'LECTURE',
      weekday: 'SUNDAY',
      startTime: '08:30',
      endTime: '10:30',
      sourceStatus: 'VERIFIED',
    });
    expect(validation.valid).toBe(true);

    const badValidation = service.validateSlot({ id: 'bad' });
    expect(badValidation.valid).toBe(false);
  });

  it('runs detectConflicts directly from service', () => {
    const service = new TimetableService({ initialSlots: SYNTHETIC_STAGE2_SLOTS });
    const conflicts = service.detectConflicts();
    expect(Array.isArray(conflicts)).toBe(true);
  });
});
