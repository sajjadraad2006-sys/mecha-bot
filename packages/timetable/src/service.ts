import { type Clock, SystemClock } from '@mecha-bot/shared';
import { detectConflicts } from './conflict.js';
import {
  addDaysToDateString,
  compareTimes,
  getBaghdadDateInfo,
  getBaghdadToday,
  getBaghdadTomorrow,
  getWeekdayFromDateString,
  isSlotEffectiveOnDate,
  timeToMinutes,
  WEEKDAY_ORDER,
} from './datetime.js';
import { validateSlot } from './schemas.js';
import type {
  NextClassResult,
  RelativeDay,
  StudentScheduleCriteria,
  TimetableConflict,
  TimetableQueryFilter,
  TimetableSlot,
  Weekday,
} from './types.js';

export interface TimetableServiceOptions {
  clock?: Clock | undefined;
  initialSlots?: TimetableSlot[] | undefined;
}

export class TimetableService {
  private slots: TimetableSlot[] = [];
  private clock: Clock;

  constructor(options: TimetableServiceOptions = {}) {
    this.clock = options.clock ?? new SystemClock();
    if (options.initialSlots) {
      this.slots = [...options.initialSlots];
    }
  }

  // --- Repository & Slot Management ---

  public setSlots(slots: TimetableSlot[]): void {
    this.slots = [...slots];
  }

  public addSlot(slot: TimetableSlot): void {
    const validation = validateSlot(slot);
    if (!validation.valid) {
      throw new Error(`Cannot add invalid timetable slot: ${validation.errors?.join(', ')}`);
    }
    this.slots.push(validation.data!);
  }

  public getAllSlots(): readonly TimetableSlot[] {
    return this.slots;
  }

  public clear(): void {
    this.slots = [];
  }

  public setClock(clock: Clock): void {
    this.clock = clock;
  }

  // --- Section & Subgroup Filtering Logic ---

  /**
   * Filter slots based on student's section and subgroup.
   * Rules:
   * - Common slots (no section specified) apply to all students.
   * - Section-specific slots apply only if matching student's section (case-insensitive).
   * - Common subgroups (no subgroup specified) apply to all subgroups in that section.
   * - Subgroup-specific slots apply only if matching student's subgroup (case-insensitive).
   */
  public filterBySection(
    slots: TimetableSlot[],
    section?: string,
    subgroup?: string,
  ): TimetableSlot[] {
    return slots.filter((slot) => {
      // 1. Section check
      if (section && slot.section) {
        if (slot.section.trim().toUpperCase() !== section.trim().toUpperCase()) {
          return false;
        }
      }

      // 2. Subgroup check
      if (subgroup && slot.subgroup) {
        if (slot.subgroup.trim().toUpperCase() !== subgroup.trim().toUpperCase()) {
          return false;
        }
      }

      return true;
    });
  }

  // --- Schedule Queries ---

  /**
   * Query slots for a specific day or date with fine-grained criteria.
   */
  public getScheduleForDay(filter: TimetableQueryFilter = {}): TimetableSlot[] {
    const {
      stage,
      programSemester,
      section,
      subgroup,
      includeOutdated = false,
      sourceStatuses,
      courseCode,
      type,
    } = filter;

    let targetWeekday = filter.weekday;
    const targetDate = filter.date;

    if (!targetWeekday && targetDate) {
      targetWeekday = getWeekdayFromDateString(targetDate);
    }

    let result = this.slots.filter((slot) => {
      // Outdated filtering
      if (!includeOutdated && slot.sourceStatus === 'OUTDATED') {
        return false;
      }

      // Explicit sourceStatuses
      if (sourceStatuses && !sourceStatuses.includes(slot.sourceStatus)) {
        return false;
      }

      // Weekday matching
      if (targetWeekday && slot.weekday !== targetWeekday) {
        return false;
      }

      // Academic date validity
      if (targetDate && !isSlotEffectiveOnDate(slot, targetDate)) {
        return false;
      }

      // Stage matching
      if (stage !== undefined && slot.stage !== stage) {
        return false;
      }

      // Semester matching
      if (programSemester !== undefined && slot.programSemester !== programSemester) {
        return false;
      }

      // Course code matching
      if (courseCode && slot.courseCode.toUpperCase() !== courseCode.toUpperCase()) {
        return false;
      }

      // Slot type matching
      if (type && slot.type !== type) {
        return false;
      }

      return true;
    });

    // Section and Subgroup filtering
    result = this.filterBySection(result, section, subgroup);

    // Sort by startTime ascending
    return result.sort((a, b) => compareTimes(a.startTime, b.startTime));
  }

  /**
   * Get entire week schedule grouped by Weekday (Sunday through Saturday).
   */
  public getScheduleForWeek(
    filter: Omit<TimetableQueryFilter, 'weekday'> & { referenceDate?: string | undefined } = {},
  ): Map<Weekday, TimetableSlot[]> {
    const weekMap = new Map<Weekday, TimetableSlot[]>();

    for (const day of WEEKDAY_ORDER) {
      const daySlots = this.getScheduleForDay({
        ...filter,
        weekday: day,
        date: filter.referenceDate,
      });
      weekMap.set(day, daySlots);
    }

    return weekMap;
  }

  /**
   * Get schedule for a student on a specific local academic calendar date.
   */
  public getScheduleForStudentDate(criteria: StudentScheduleCriteria): TimetableSlot[] {
    const targetDate = criteria.date ?? getBaghdadToday(this.clock);
    const weekday = getWeekdayFromDateString(targetDate);

    return this.getScheduleForDay({
      date: targetDate,
      weekday,
      stage: criteria.stage,
      programSemester: criteria.programSemester,
      section: criteria.section,
      subgroup: criteria.subgroup,
      includeOutdated: criteria.includeOutdated ?? false,
    });
  }

  /**
   * Get today's schedule for a student using Asia/Baghdad timezone.
   */
  public getTodaySchedule(criteria: Omit<StudentScheduleCriteria, 'date'>): TimetableSlot[] {
    const today = getBaghdadToday(this.clock);
    return this.getScheduleForStudentDate({ ...criteria, date: today });
  }

  /**
   * Get tomorrow's schedule for a student using Asia/Baghdad timezone.
   */
  public getTomorrowSchedule(criteria: Omit<StudentScheduleCriteria, 'date'>): TimetableSlot[] {
    const tomorrow = getBaghdadTomorrow(this.clock);
    return this.getScheduleForStudentDate({ ...criteria, date: tomorrow });
  }

  // --- Real-Time Class Queries ---

  /**
   * Check if a specific slot is currently active at given instant.
   */
  public isClassActiveAt(slot: TimetableSlot, at: Date): boolean {
    const info = getBaghdadDateInfo(at);

    if (slot.weekday !== info.weekday) {
      return false;
    }

    if (!isSlotEffectiveOnDate(slot, info.dateString)) {
      return false;
    }

    if (slot.sourceStatus === 'OUTDATED') {
      return false;
    }

    return slot.startTime <= info.timeString && info.timeString < slot.endTime;
  }

  /**
   * Retrieve the currently active class for a student, if any.
   */
  public getCurrentClass(
    criteria: Omit<StudentScheduleCriteria, 'date'> & { at?: Date | undefined },
  ): TimetableSlot | null {
    const instant = criteria.at ?? this.clock.now();
    const info = getBaghdadDateInfo(instant);

    const todaySlots = this.getScheduleForDay({
      date: info.dateString,
      weekday: info.weekday,
      stage: criteria.stage,
      programSemester: criteria.programSemester,
      section: criteria.section,
      subgroup: criteria.subgroup,
      includeOutdated: criteria.includeOutdated ?? false,
    });

    for (const slot of todaySlots) {
      if (this.isClassActiveAt(slot, instant)) {
        return slot;
      }
    }

    return null;
  }

  /**
   * Retrieve the next upcoming class for a student.
   * Searches remaining classes today, tomorrow, or up to `lookaheadDays` ahead
   * (skipping weekends or empty days, safely crossing week boundaries).
   */
  public getNextClass(
    criteria: Omit<StudentScheduleCriteria, 'date'> & {
      from?: Date | undefined;
      lookaheadDays?: number | undefined;
    },
  ): NextClassResult | null {
    const instant = criteria.from ?? this.clock.now();
    const info = getBaghdadDateInfo(instant);
    const maxLookahead = criteria.lookaheadDays ?? 7;

    // 1. Check later today (slots starting strictly after current time)
    const todaySlots = this.getScheduleForDay({
      date: info.dateString,
      weekday: info.weekday,
      stage: criteria.stage,
      programSemester: criteria.programSemester,
      section: criteria.section,
      subgroup: criteria.subgroup,
      includeOutdated: criteria.includeOutdated ?? false,
    });

    for (const slot of todaySlots) {
      if (slot.startTime > info.timeString) {
        const slotStartMinutes = timeToMinutes(slot.startTime);
        const minutesUntil = slotStartMinutes - info.minutesSinceMidnight;

        return {
          slot,
          weekday: info.weekday,
          date: info.dateString,
          relativeDay: 'TODAY',
          minutesUntilStart: minutesUntil,
          isActive: false,
        };
      }
    }

    // 2. Search upcoming days (day 1 = tomorrow, up to maxLookahead)
    for (let dayOffset = 1; dayOffset <= maxLookahead; dayOffset++) {
      const targetDate = addDaysToDateString(info.dateString, dayOffset);
      const targetWeekday = getWeekdayFromDateString(targetDate);

      const daySlots = this.getScheduleForDay({
        date: targetDate,
        weekday: targetWeekday,
        stage: criteria.stage,
        programSemester: criteria.programSemester,
        section: criteria.section,
        subgroup: criteria.subgroup,
        includeOutdated: criteria.includeOutdated ?? false,
      });

      if (daySlots.length > 0) {
        const firstSlot = daySlots[0]!;
        const relativeDay: RelativeDay = dayOffset === 1 ? 'TOMORROW' : 'LATER';

        const minutesUntilMidnightToday = 1440 - info.minutesSinceMidnight;
        const interveningMinutes = (dayOffset - 1) * 1440;
        const slotStartMinutes = timeToMinutes(firstSlot.startTime);
        const totalMinutesUntil = minutesUntilMidnightToday + interveningMinutes + slotStartMinutes;

        return {
          slot: firstSlot,
          weekday: targetWeekday,
          date: targetDate,
          relativeDay,
          minutesUntilStart: totalMinutesUntil,
          isActive: false,
        };
      }
    }

    return null;
  }

  /**
   * Retrieve the class that most recently ended earlier today.
   */
  public getPreviousClass(
    criteria: Omit<StudentScheduleCriteria, 'date'> & { from?: Date | undefined },
  ): TimetableSlot | null {
    const instant = criteria.from ?? this.clock.now();
    const info = getBaghdadDateInfo(instant);

    const todaySlots = this.getScheduleForDay({
      date: info.dateString,
      weekday: info.weekday,
      stage: criteria.stage,
      programSemester: criteria.programSemester,
      section: criteria.section,
      subgroup: criteria.subgroup,
      includeOutdated: criteria.includeOutdated ?? false,
    });

    let lastEndedSlot: TimetableSlot | null = null;

    for (const slot of todaySlots) {
      if (slot.endTime <= info.timeString) {
        lastEndedSlot = slot;
      }
    }

    return lastEndedSlot;
  }

  /**
   * Run conflict detection on the managed slots or a provided subset.
   */
  public detectConflicts(
    slots?: TimetableSlot[],
    options?: Parameters<typeof detectConflicts>[1],
  ): TimetableConflict[] {
    return detectConflicts(slots ?? this.slots, options);
  }

  /**
   * Run conflict detection specifically for a student's schedule criteria.
   */
  public detectScheduleConflicts(criteria: StudentScheduleCriteria): TimetableConflict[] {
    const studentSlots = this.filterBySection(
      this.slots.filter(
        (s) =>
          s.stage === criteria.stage &&
          s.programSemester === criteria.programSemester &&
          (criteria.includeOutdated || s.sourceStatus !== 'OUTDATED'),
      ),
      criteria.section,
      criteria.subgroup,
    );

    return detectConflicts(studentSlots, {
      checkStudentSchedules: true,
      checkRooms: false,
      checkLecturers: false,
      referenceDate: criteria.date,
      ignoreOutdated: !criteria.includeOutdated,
    });
  }

  /**
   * Validate a slot object against schema rules.
   */
  public validateSlot(slot: unknown) {
    return validateSlot(slot);
  }
}
