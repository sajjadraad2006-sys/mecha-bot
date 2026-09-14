import { normalizeFingerprintText } from './academic-event.js';
import type { CreatePastExamQuestionInput } from './types.js';

export function createPastQuestionFingerprint(input: CreatePastExamQuestionInput): string {
  return [
    'past-question',
    input.courseCode.trim().toUpperCase(),
    input.academicYear,
    input.examType ?? '',
    normalizeFingerprintText(input.questionNumber ?? ''),
    normalizeFingerprintText(input.questionText),
  ].join('|');
}
