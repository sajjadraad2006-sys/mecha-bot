import { describe, it, expect } from 'vitest';
import {
  SYNTHETIC_COURSES,
  SYNTHETIC_OFFERINGS,
  SYNTHETIC_ACADEMIC_YEAR,
  SYNTHETIC_CALENDAR_PERIODS,
} from '@mecha-bot/academic';

describe('Synthetic Test Fixtures Integrity (No Fabricated Syllabus)', () => {
  it('all fixture course codes strictly follow TEST prefix convention', () => {
    expect(SYNTHETIC_COURSES.length).toBeGreaterThan(0);
    for (const course of SYNTHETIC_COURSES) {
      expect(course.code).toMatch(/^TEST\d+/);
      expect(course.nameEn).toMatch(/Synthetic/i);
    }
  });

  it('all fixture offerings reference synthetic courses and academic year', () => {
    for (const offering of SYNTHETIC_OFFERINGS) {
      expect(offering.academicYearId).toBe(SYNTHETIC_ACADEMIC_YEAR.id);
      expect(SYNTHETIC_COURSES.some((c) => c.id === offering.courseId)).toBe(true);
    }
  });

  it('calendar periods contain only synthetic evidence notes', () => {
    for (const period of SYNTHETIC_CALENDAR_PERIODS) {
      if (period.evidenceMetadataJson) {
        expect(period.evidenceMetadataJson).toContain('Synthetic');
      }
    }
  });
});
