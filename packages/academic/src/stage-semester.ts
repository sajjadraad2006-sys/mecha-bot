import { ValidationError } from '@mecha-bot/shared';

export type Stage = 1 | 2 | 3 | 4;
export type ProgramSemester = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type TermInStage = 1 | 2;

export function isValidStage(stage: number): stage is Stage {
  return Number.isInteger(stage) && stage >= 1 && stage <= 4;
}

export function isValidProgramSemester(semester: number): semester is ProgramSemester {
  return Number.isInteger(semester) && semester >= 1 && semester <= 8;
}

export function getStageForSemester(semester: ProgramSemester): Stage {
  return Math.ceil(semester / 2) as Stage;
}

export function getTermInStage(semester: ProgramSemester): TermInStage {
  return (((semester - 1) % 2) + 1) as TermInStage;
}

export function getSemestersForStage(stage: Stage): [ProgramSemester, ProgramSemester] {
  const firstSemester = ((stage - 1) * 2 + 1) as ProgramSemester;
  const secondSemester = (firstSemester + 1) as ProgramSemester;
  return [firstSemester, secondSemester];
}

export function validateStageSemester(
  stage: number,
  programSemester: number,
): { stage: Stage; programSemester: ProgramSemester; termInStage: TermInStage } {
  if (!isValidStage(stage)) {
    throw new ValidationError(`Invalid stage: ${stage}. Allowed values are 1, 2, 3, 4.`);
  }
  if (!isValidProgramSemester(programSemester)) {
    throw new ValidationError(
      `Invalid program semester: ${programSemester}. Allowed values are 1 through 8.`,
    );
  }

  const expectedStage = getStageForSemester(programSemester);
  if (expectedStage !== stage) {
    throw new ValidationError(
      `Mismatched stage and semester: Program semester ${programSemester} belongs to Stage ${expectedStage}, not Stage ${stage}.`,
    );
  }

  return {
    stage,
    programSemester,
    termInStage: getTermInStage(programSemester),
  };
}
