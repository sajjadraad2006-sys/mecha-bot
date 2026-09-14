import { describe, expect, it } from 'vitest';
import {
  detectConflicts,
  sectionsConflict,
  subgroupsConflict,
  SYNTHETIC_CONFLICTING_SLOTS,
  SYNTHETIC_STAGE2_SLOTS,
  TimetableService,
  type TimetableSlot,
} from '../packages/timetable/src/index.js';

describe('Timetable Conflict Engine - Section & Subgroup Rules', () => {
  it('correctly assesses section conflict potential', () => {
    // Both undefined -> both apply to all -> potential conflict
    expect(sectionsConflict(undefined, undefined)).toBe(true);

    // One undefined -> one applies to all -> potential conflict for that section
    expect(sectionsConflict('A', undefined)).toBe(true);
    expect(sectionsConflict(undefined, 'B')).toBe(true);

    // Same section -> conflict
    expect(sectionsConflict('A', 'A')).toBe(true);
    expect(sectionsConflict('a', 'A')).toBe(true);

    // Different sections -> NO conflict
    expect(sectionsConflict('A', 'B')).toBe(false);
  });

  it('correctly assesses subgroup conflict potential', () => {
    expect(subgroupsConflict(undefined, undefined)).toBe(true);
    expect(subgroupsConflict('G1', undefined)).toBe(true);
    expect(subgroupsConflict('G1', 'G1')).toBe(true);
    expect(subgroupsConflict('G1', 'G2')).toBe(false);
  });
});

describe('Timetable Conflict Engine - Interval & Slot Overlaps', () => {
  it('detects student schedule overlaps between conflicting slots in same section', () => {
    const conflicts = detectConflicts(SYNTHETIC_CONFLICTING_SLOTS, {
      checkStudentSchedules: true,
      checkRooms: false,
      checkLecturers: false,
    });

    const studentConflict = conflicts.find((c) => c.type === 'STUDENT_SCHEDULE_OVERLAP');
    expect(studentConflict).toBeDefined();
    expect(studentConflict?.weekday).toBe('MONDAY');
    expect(studentConflict?.slotA.courseCode).toBe('TEST-TT-210');
    expect(studentConflict?.slotB.courseCode).toBe('TEST-TT-211');
    expect(studentConflict?.overlapStart).toBe('10:00');
    expect(studentConflict?.overlapEnd).toBe('10:30');
  });

  it('does NOT flag touching intervals as conflicts', () => {
    // SYNTHETIC_STAGE2_SLOTS has:
    // Slot 1: 08:30-10:30
    // Slot 2: 10:30-12:30
    // Slot 3: 12:30-14:30
    // These touch at boundaries
    const service = new TimetableService({ initialSlots: SYNTHETIC_STAGE2_SLOTS });
    const secAConflicts = service.detectScheduleConflicts({
      stage: 2,
      programSemester: 3,
      section: 'A',
      subgroup: 'G1',
    });

    expect(secAConflicts).toEqual([]);
  });

  it('verifies that different sections do NOT produce false student conflicts', () => {
    // On Sunday 12:30-14:30:
    // Section A has Lab in Lab-Synth-A
    // Section B has Lab in Lab-Synth-B
    // They are simultaneous, but student in Section A has no conflict!
    const service = new TimetableService({ initialSlots: SYNTHETIC_STAGE2_SLOTS });

    const secAConflicts = service.detectScheduleConflicts({
      stage: 2,
      programSemester: 3,
      section: 'A',
      subgroup: 'G1',
    });
    expect(secAConflicts).toEqual([]);

    const secBConflicts = service.detectScheduleConflicts({
      stage: 2,
      programSemester: 3,
      section: 'B',
      subgroup: 'G1',
    });
    expect(secBConflicts).toEqual([]);
  });

  it('detects room double-booking across different stages', () => {
    const conflicts = detectConflicts(SYNTHETIC_CONFLICTING_SLOTS, {
      checkStudentSchedules: false,
      checkRooms: true,
      checkLecturers: false,
    });

    const roomConflict = conflicts.find((c) => c.type === 'ROOM_DOUBLE_BOOKING');
    expect(roomConflict).toBeDefined();
    expect(roomConflict?.weekday).toBe('TUESDAY');
    expect(roomConflict?.room).toBe('Hall-Conf-Double');
    expect(roomConflict?.overlapStart).toBe('09:30');
    expect(roomConflict?.overlapEnd).toBe('10:30');
  });

  it('detects lecturer double-booking across different rooms', () => {
    const conflicts = detectConflicts(SYNTHETIC_CONFLICTING_SLOTS, {
      checkStudentSchedules: false,
      checkRooms: false,
      checkLecturers: true,
    });

    const lectConflict = conflicts.find((c) => c.type === 'LECTURER_DOUBLE_BOOKING');
    expect(lectConflict).toBeDefined();
    expect(lectConflict?.weekday).toBe('WEDNESDAY');
    expect(lectConflict?.lecturer).toBe('Dr. Conf C');
    expect(lectConflict?.overlapStart).toBe('10:00');
    expect(lectConflict?.overlapEnd).toBe('11:00');
  });

  it('ignores outdated slots when detecting conflicts by default', () => {
    const slotsWithOutdated: TimetableSlot[] = [
      {
        id: 'slot-active',
        courseCode: 'TEST-TT-201',
        stage: 2,
        programSemester: 3,
        type: 'LECTURE',
        weekday: 'SUNDAY',
        startTime: '08:30',
        endTime: '10:30',
        sourceStatus: 'VERIFIED',
      },
      {
        id: 'slot-outdated',
        courseCode: 'TEST-TT-201-OLD',
        stage: 2,
        programSemester: 3,
        type: 'LECTURE',
        weekday: 'SUNDAY',
        startTime: '08:30',
        endTime: '10:30',
        sourceStatus: 'OUTDATED', // Old replaced schedule
      },
    ];

    const conflicts = detectConflicts(slotsWithOutdated, { ignoreOutdated: true });
    expect(conflicts).toHaveLength(0);

    const conflictsWithOutdated = detectConflicts(slotsWithOutdated, { ignoreOutdated: false });
    expect(conflictsWithOutdated).toHaveLength(1);
  });
});
