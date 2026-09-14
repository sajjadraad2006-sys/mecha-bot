import type { CreateAcademicEventInput } from './types.js';

export function normalizeFingerprintText(value: string): string {
  return value.trim().toLocaleLowerCase('en').replace(/\s+/g, ' ');
}

export function createAcademicEventFingerprint(input: CreateAcademicEventInput): string {
  const studentScope = input.studentKey === undefined ? 'shared' : `student:${input.studentKey}`;
  return [
    'academic-event',
    studentScope,
    input.courseCode.trim().toUpperCase(),
    input.type,
    `occurs:${input.occursAt ?? ''}`,
    `due:${input.dueAt ?? ''}`,
    normalizeFingerprintText(input.title),
  ].join('|');
}
