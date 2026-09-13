import {
  formatToAcademicDate,
  calculateAcademicWeek,
  isValidAcademicDate,
} from '@mecha-bot/shared';
import { Stage, ProgramSemester } from './stage-semester.js';

export type PeriodType =
  'PRE_SEMESTER' | 'TEACHING' | 'EXAMS' | 'BREAK' | 'SUMMER_TRAINING' | 'HOLIDAY';

export interface AcademicYear {
  id: string;
  name: string; // e.g. "2026-2027"
  startsOn: string; // YYYY-MM-DD
  endsOn: string; // YYYY-MM-DD
  isCurrent: boolean;
  createdAt: string;
}

export interface AcademicCalendarPeriod {
  id: string;
  academicYearId: string;
  periodType: PeriodType;
  programSemester: ProgramSemester | null;
  startsOn: string; // YYYY-MM-DD local academic calendar date
  endsOn: string; // YYYY-MM-DD local academic calendar date
  nominalWeekCount: number;
  stageScope: Stage | null; // null = applies to all stages, 1..4 = applies to specific stage
  evidenceMetadataJson: string | null;
  createdAt: string;
}

export interface AcademicWeekStatus {
  weekNumber: number;
  isPreSemester: boolean;
  isTeaching: boolean;
  isExams: boolean;
  period: AcademicCalendarPeriod | null;
}

export class AcademicCalendarService {
  constructor(private periods: AcademicCalendarPeriod[]) {}

  /**
   * Find the period applicable to a stage on a given date.
   * Priority: stage-specific period overrides generic stageScope=null period.
   */
  getCurrentAcademicPeriod(
    stage: Stage,
    date: Date | string,
    timeZone = 'Asia/Baghdad',
  ): AcademicCalendarPeriod | null {
    const targetDateStr =
      typeof date === 'string' && isValidAcademicDate(date)
        ? date
        : formatToAcademicDate(typeof date === 'string' ? new Date(date) : date, timeZone);

    const matching = this.periods.filter((p) => {
      const withinDate = targetDateStr >= p.startsOn && targetDateStr <= p.endsOn;
      if (!withinDate) return false;

      if (p.stageScope === stage) return true;
      if (p.stageScope === null) {
        // If this stage has its own explicit period of the same periodType, generic does not apply to this stage
        const stageHasSpecific = this.periods.some(
          (sp) => sp.stageScope === stage && sp.periodType === p.periodType,
        );
        return !stageHasSpecific;
      }
      return false;
    });

    if (matching.length === 0) return null;
    return matching[0]!;
  }

  /**
   * Derives the academic teaching week for a given stage on a given date.
   * Does NOT store week as static truth; derives dynamically from calendar bounds.
   */
  getAcademicWeek(
    stage: Stage,
    date: Date | string,
    programSemester?: ProgramSemester,
    timeZone = 'Asia/Baghdad',
  ): AcademicWeekStatus {
    const targetDateStr =
      typeof date === 'string' && isValidAcademicDate(date)
        ? date
        : formatToAcademicDate(typeof date === 'string' ? new Date(date) : date, timeZone);

    // Find the teaching period for this stage & semester
    const teachingPeriod = this.periods.find((p) => {
      const stageMatch = p.stageScope === null || p.stageScope === stage;
      const semMatch = programSemester ? p.programSemester === programSemester : true;
      return p.periodType === 'TEACHING' && stageMatch && semMatch;
    });

    if (!teachingPeriod) {
      const currentPeriod = this.getCurrentAcademicPeriod(stage, targetDateStr, timeZone);
      return {
        weekNumber: 0,
        isPreSemester: false,
        isTeaching: false,
        isExams: currentPeriod?.periodType === 'EXAMS',
        period: currentPeriod,
      };
    }

    if (targetDateStr < teachingPeriod.startsOn) {
      // Pre-semester
      return {
        weekNumber: 0,
        isPreSemester: true,
        isTeaching: false,
        isExams: false,
        period: this.getCurrentAcademicPeriod(stage, targetDateStr, timeZone),
      };
    }

    if (targetDateStr > teachingPeriod.endsOn) {
      // Post-teaching (exams or break)
      const currentPeriod = this.getCurrentAcademicPeriod(stage, targetDateStr, timeZone);
      return {
        weekNumber: teachingPeriod.nominalWeekCount,
        isPreSemester: false,
        isTeaching: false,
        isExams: currentPeriod?.periodType === 'EXAMS',
        period: currentPeriod,
      };
    }

    // Within teaching period
    const weekNum = calculateAcademicWeek(teachingPeriod.startsOn, targetDateStr);
    return {
      weekNumber: Math.min(weekNum, teachingPeriod.nominalWeekCount),
      isPreSemester: false,
      isTeaching: true,
      isExams: false,
      period: teachingPeriod,
    };
  }

  /**
   * Given a starting date, find the next teaching date (skipping weekends: Friday & Saturday in Iraq).
   */
  getNextTeachingDay(
    stage: Stage,
    fromDate: Date | string,
    timeZone = 'Asia/Baghdad',
  ): string | null {
    let cursor =
      typeof fromDate === 'string' && isValidAcademicDate(fromDate)
        ? fromDate
        : formatToAcademicDate(
            typeof fromDate === 'string' ? new Date(fromDate) : fromDate,
            timeZone,
          );

    // Look ahead up to 30 days
    for (let i = 1; i <= 30; i++) {
      const [y, m, d] = cursor.split('-').map(Number);
      const nextDate = new Date(Date.UTC(y!, m! - 1, d! + 1));
      cursor = formatToAcademicDate(nextDate, timeZone);

      // Check day of week in Iraq (0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat)
      // University of Basrah teaching days are Sunday - Thursday (Friday=5, Saturday=6 are weekend)
      const dayOfWeek = nextDate.getUTCDay();
      if (dayOfWeek === 5 || dayOfWeek === 6) continue;

      const period = this.getCurrentAcademicPeriod(stage, cursor, timeZone);
      if (period && period.periodType === 'TEACHING') {
        return cursor;
      }
    }

    return null;
  }
}
