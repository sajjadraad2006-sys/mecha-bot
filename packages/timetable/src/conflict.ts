import { getOverlapRange, intervalsOverlap } from './datetime.js';
import type { TimetableConflict, TimetableSlot } from './types.js';

export interface ConflictDetectionOptions {
  checkStudentSchedules?: boolean | undefined;
  checkRooms?: boolean | undefined;
  checkLecturers?: boolean | undefined;
  referenceDate?: string | undefined; // 'YYYY-MM-DD' - if supplied, checks effective date overlap
  ignoreOutdated?: boolean | undefined;
}

/**
 * Determines whether two sections are potentially attended by the same student.
 * - If either is undefined, it applies generally across all sections.
 * - If both are defined, they only conflict if they are equal (case-insensitive).
 */
export function sectionsConflict(sectionA?: string, sectionB?: string): boolean {
  if (!sectionA || !sectionB) {
    return true; // One or both apply to all sections
  }
  return sectionA.trim().toUpperCase() === sectionB.trim().toUpperCase();
}

/**
 * Determines whether two subgroups are attended by the same student.
 * - If either is undefined, it applies generally across the section.
 * - If both are defined, they only conflict if they are equal (case-insensitive).
 */
export function subgroupsConflict(subgroupA?: string, subgroupB?: string): boolean {
  if (!subgroupA || !subgroupB) {
    return true; // One or both apply to all subgroups
  }
  return subgroupA.trim().toUpperCase() === subgroupB.trim().toUpperCase();
}

/**
 * Check if two slots' valid date ranges overlap.
 */
export function dateRangesOverlap(slotA: TimetableSlot, slotB: TimetableSlot): boolean {
  if (slotA.validTo && slotB.validFrom && slotA.validTo < slotB.validFrom) {
    return false;
  }
  if (slotB.validTo && slotA.validFrom && slotB.validTo < slotA.validFrom) {
    return false;
  }
  return true;
}

/**
 * Detect all conflicts within a collection of timetable slots.
 */
export function detectConflicts(
  slots: TimetableSlot[],
  options: ConflictDetectionOptions = {},
): TimetableConflict[] {
  const {
    checkStudentSchedules = true,
    checkRooms = true,
    checkLecturers = true,
    referenceDate,
    ignoreOutdated = true,
  } = options;

  const conflicts: TimetableConflict[] = [];

  // Filter out outdated slots if requested
  const candidateSlots = ignoreOutdated
    ? slots.filter((s) => s.sourceStatus !== 'OUTDATED')
    : slots;

  // Compare every unique pair (i < j)
  for (let i = 0; i < candidateSlots.length; i++) {
    const slotA = candidateSlots[i]!;

    for (let j = i + 1; j < candidateSlots.length; j++) {
      const slotB = candidateSlots[j]!;

      // 1. Must be on same weekday
      if (slotA.weekday !== slotB.weekday) {
        continue;
      }

      // 2. Must overlap in time
      if (!intervalsOverlap(slotA.startTime, slotA.endTime, slotB.startTime, slotB.endTime)) {
        continue;
      }

      // 3. Must overlap in date validity
      if (referenceDate) {
        const aActive =
          (!slotA.validFrom || referenceDate >= slotA.validFrom) &&
          (!slotA.validTo || referenceDate <= slotA.validTo);
        const bActive =
          (!slotB.validFrom || referenceDate >= slotB.validFrom) &&
          (!slotB.validTo || referenceDate <= slotB.validTo);
        if (!aActive || !bActive) {
          continue;
        }
      } else if (!dateRangesOverlap(slotA, slotB)) {
        continue;
      }

      const overlap = getOverlapRange(
        slotA.startTime,
        slotA.endTime,
        slotB.startTime,
        slotB.endTime,
      );
      if (!overlap) continue;

      // 4. Student schedule conflict (same stage, same semester, compatible sections & subgroups)
      if (
        checkStudentSchedules &&
        slotA.stage === slotB.stage &&
        slotA.programSemester === slotB.programSemester
      ) {
        if (
          sectionsConflict(slotA.section, slotB.section) &&
          subgroupsConflict(slotA.subgroup, slotB.subgroup)
        ) {
          conflicts.push({
            type: 'STUDENT_SCHEDULE_OVERLAP',
            reason: `Student schedule conflict on ${slotA.weekday} between ${slotA.courseCode} (${slotA.startTime}-${slotA.endTime}) and ${slotB.courseCode} (${slotB.startTime}-${slotB.endTime})`,
            weekday: slotA.weekday,
            slotA,
            slotB,
            overlapStart: overlap.overlapStart,
            overlapEnd: overlap.overlapEnd,
            stage: slotA.stage,
            programSemester: slotA.programSemester,
            section: slotA.section ?? slotB.section,
          });
        }
      }

      // 5. Room double-booking (regardless of stage/semester)
      if (
        checkRooms &&
        slotA.room &&
        slotB.room &&
        slotA.room.trim().toUpperCase() === slotB.room.trim().toUpperCase()
      ) {
        conflicts.push({
          type: 'ROOM_DOUBLE_BOOKING',
          reason: `Room double-booking for '${slotA.room}' on ${slotA.weekday} between ${slotA.courseCode} and ${slotB.courseCode} (${overlap.overlapStart}-${overlap.overlapEnd})`,
          weekday: slotA.weekday,
          slotA,
          slotB,
          overlapStart: overlap.overlapStart,
          overlapEnd: overlap.overlapEnd,
          room: slotA.room,
        });
      }

      // 6. Lecturer double-booking (regardless of stage/semester)
      if (
        checkLecturers &&
        slotA.lecturerDisplayName &&
        slotB.lecturerDisplayName &&
        slotA.lecturerDisplayName.trim().toUpperCase() ===
          slotB.lecturerDisplayName.trim().toUpperCase()
      ) {
        conflicts.push({
          type: 'LECTURER_DOUBLE_BOOKING',
          reason: `Lecturer double-booking for '${slotA.lecturerDisplayName}' on ${slotA.weekday} between ${slotA.courseCode} and ${slotB.courseCode} (${overlap.overlapStart}-${overlap.overlapEnd})`,
          weekday: slotA.weekday,
          slotA,
          slotB,
          overlapStart: overlap.overlapStart,
          overlapEnd: overlap.overlapEnd,
          lecturer: slotA.lecturerDisplayName,
        });
      }
    }
  }

  return conflicts;
}
