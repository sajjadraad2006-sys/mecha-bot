import { describe, it, expect } from 'vitest';
import { AcademicCalendarService, SYNTHETIC_CALENDAR_PERIODS } from '@mecha-bot/academic';

describe('Academic Calendar Service & Week Calculation', () => {
  const service = new AcademicCalendarService(SYNTHETIC_CALENDAR_PERIODS);

  it('supports stage-scoped academic calendar applicability', () => {
    // On 2026-10-01:
    // Upper stages (Stage 2, 3, 4) started teaching on 2026-09-20.
    const upperPeriod = service.getCurrentAcademicPeriod(2, '2026-10-01');
    expect(upperPeriod).not.toBeNull();
    expect(upperPeriod?.id).toBe('period_2026_upper_teaching_s1');
    expect(upperPeriod?.periodType).toBe('TEACHING');

    // Stage 1 starts teaching later on 2026-10-18, so on 2026-10-01 it is pre-semester
    const stage1Period = service.getCurrentAcademicPeriod(1, '2026-10-01');
    expect(stage1Period).toBeNull(); // No period active before 2026-10-18
  });

  it('calculates derived academic week dynamically without permanent drift', () => {
    // Upper stage started 2026-09-20 (Sunday)
    // 2026-09-20: Week 1
    const week1 = service.getAcademicWeek(2, '2026-09-20');
    expect(week1.isTeaching).toBe(true);
    expect(week1.weekNumber).toBe(1);

    // 2026-09-27 (7 days later): Week 2
    const week2 = service.getAcademicWeek(2, '2026-09-27');
    expect(week2.isTeaching).toBe(true);
    expect(week2.weekNumber).toBe(2);

    // 2026-10-11 (21 days later): Week 4
    const week4 = service.getAcademicWeek(2, '2026-10-11');
    expect(week4.isTeaching).toBe(true);
    expect(week4.weekNumber).toBe(4);
  });

  it('detects pre-semester state when before teaching start date', () => {
    // Stage 1 starts 2026-10-18. Checking on 2026-10-05:
    const preSem = service.getAcademicWeek(1, '2026-10-05', 1);
    expect(preSem.isPreSemester).toBe(true);
    expect(preSem.isTeaching).toBe(false);
    expect(preSem.weekNumber).toBe(0);
  });

  it('identifies exams period after teaching ends', () => {
    // 2027-01-15 falls within exams period (2027-01-10 to 2027-01-25)
    const examsStatus = service.getAcademicWeek(2, '2027-01-15');
    expect(examsStatus.isTeaching).toBe(false);
    expect(examsStatus.isExams).toBe(true);
    expect(examsStatus.period?.periodType).toBe('EXAMS');
  });

  it('finds the next teaching day in Basrah skipping weekend (Friday & Saturday)', () => {
    // 2026-09-24 is Thursday. Next teaching day must skip Friday (25th) and Saturday (26th) to Sunday (27th).
    const nextTeaching = service.getNextTeachingDay(2, '2026-09-24');
    expect(nextTeaching).toBe('2026-09-27');
  });
});
