import { describe, it, expect } from 'vitest';
import {
  validateStageSemester,
  getStageForSemester,
  getTermInStage,
  getSemestersForStage,
} from '@mecha-bot/academic';

describe('Academic Semester & Stage Modeling', () => {
  it('correctly maps 8 program semesters across 4 undergraduate stages', () => {
    // Stage 1: Semesters 1, 2
    expect(getStageForSemester(1)).toBe(1);
    expect(getStageForSemester(2)).toBe(1);
    expect(getTermInStage(1)).toBe(1);
    expect(getTermInStage(2)).toBe(2);

    // Stage 2: Semesters 3, 4
    expect(getStageForSemester(3)).toBe(2);
    expect(getStageForSemester(4)).toBe(2);
    expect(getTermInStage(3)).toBe(1);
    expect(getTermInStage(4)).toBe(2);

    // Stage 3: Semesters 5, 6
    expect(getStageForSemester(5)).toBe(3);
    expect(getStageForSemester(6)).toBe(3);
    expect(getTermInStage(5)).toBe(1);
    expect(getTermInStage(6)).toBe(2);

    // Stage 4: Semesters 7, 8
    expect(getStageForSemester(7)).toBe(4);
    expect(getStageForSemester(8)).toBe(4);
    expect(getTermInStage(7)).toBe(1);
    expect(getTermInStage(8)).toBe(2);
  });

  it('retrieves program semester pairs for a given stage', () => {
    expect(getSemestersForStage(1)).toEqual([1, 2]);
    expect(getSemestersForStage(2)).toEqual([3, 4]);
    expect(getSemestersForStage(3)).toEqual([5, 6]);
    expect(getSemestersForStage(4)).toEqual([7, 8]);
  });

  it('validates matching stage and program semester combinations', () => {
    const validStage2Sem3 = validateStageSemester(2, 3);
    expect(validStage2Sem3).toEqual({
      stage: 2,
      programSemester: 3,
      termInStage: 1,
    });

    const validStage4Sem8 = validateStageSemester(4, 8);
    expect(validStage4Sem8).toEqual({
      stage: 4,
      programSemester: 8,
      termInStage: 2,
    });
  });

  it('strictly rejects invalid stage or program semester bounds', () => {
    expect(() => validateStageSemester(0, 1)).toThrow(/Invalid stage/);
    expect(() => validateStageSemester(5, 1)).toThrow(/Invalid stage/);
    expect(() => validateStageSemester(1, 0)).toThrow(/Invalid program semester/);
    expect(() => validateStageSemester(1, 9)).toThrow(/Invalid program semester/);
  });

  it('strictly rejects mismatched stage and semester combinations', () => {
    // Stage 2 with Semester 1 is an invalid combination
    expect(() => validateStageSemester(2, 1)).toThrow(
      /Mismatched stage and semester: Program semester 1 belongs to Stage 1, not Stage 2/,
    );

    // Stage 1 with Semester 4 is an invalid combination
    expect(() => validateStageSemester(1, 4)).toThrow(
      /Mismatched stage and semester: Program semester 4 belongs to Stage 2, not Stage 1/,
    );
  });
});
