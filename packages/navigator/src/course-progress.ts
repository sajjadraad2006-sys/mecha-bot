import { AcademicTopic } from '@mecha-bot/academic';
import { CalendarPosition, CoursePulsePosition, WhereAreWeResult } from './types.js';

export interface EvaluateCourseProgressInput {
  courseCode: string;
  coursePulse?: CoursePulsePosition | undefined;
  calendarPosition?: CalendarPosition | undefined;
  sectionKey?: string | undefined;
  topics?: AcademicTopic[] | undefined;
}

/**
 * Deterministic "وين وصلنا؟" Decision Engine.
 * Evaluates available academic evidence without collapsing separate truths,
 * and always requires student confirmation.
 */
export function evaluateCourseProgress(input: EvaluateCourseProgressInput): WhereAreWeResult {
  const courseCode = input.courseCode.toUpperCase();
  const topics = input.topics || [];

  const findTopic = (key?: string) => (key ? topics.find((t) => t.topicKey === key) : undefined);

  // Case 1: Check Course Pulse (verified or inferred)
  if (input.coursePulse && (input.coursePulse.topicKey || input.coursePulse.freeTextTopic)) {
    const pulse = input.coursePulse;

    // Check section scope match if section specified
    const scopeMatches =
      !input.sectionKey ||
      !pulse.sectionKey ||
      pulse.sectionKey.toUpperCase() === input.sectionKey.toUpperCase() ||
      pulse.scope === 'GLOBAL';

    if (scopeMatches) {
      const topicObj = findTopic(pulse.topicKey);
      const isVerified = pulse.status === 'VERIFIED';
      const status = pulse.status;

      return {
        courseCode,
        mode: 'CONFIRM_COURSE_PULSE',
        suggestedTopicKey: pulse.topicKey,
        suggestedTopicTitleEn: topicObj ? topicObj.titleEn : pulse.freeTextTopic,
        suggestedTopicTitleAr: topicObj?.titleAr,
        evidenceStatus: status,
        evidenceSource: pulse.source,
        needsStudentConfirmation: true,
        confirmationPromptKey: isVerified ? 'CONFIRM_VERIFIED_PULSE' : 'CONFIRM_UNVERIFIED_PULSE',
        notes: [
          isVerified
            ? 'Course pulse confirmed by course editor/instructor.'
            : 'Course pulse inferred from peer reports or previous records; requires student verification.',
        ],
      };
    }
  }

  // Case 2: No Course Pulse, but Calendar Position + Ordered Topic Map exists
  if (
    input.calendarPosition &&
    input.calendarPosition.academicWeek !== undefined &&
    topics.length > 0
  ) {
    const week = input.calendarPosition.academicWeek;
    // Find topics nominally mapped to this week or adjacent
    const matchedTopics = topics.filter(
      (t) => t.nominalWeek !== undefined && Math.abs(t.nominalWeek - week) <= 1,
    );

    if (matchedTopics.length > 0) {
      const rangeKeys = matchedTopics.map((t) => t.topicKey);
      const primaryTopic = matchedTopics.find((t) => t.nominalWeek === week) || matchedTopics[0]!;

      return {
        courseCode,
        mode: 'EXPECTED_RANGE',
        suggestedTopicKey: primaryTopic.topicKey,
        suggestedTopicTitleEn: primaryTopic.titleEn,
        suggestedTopicTitleAr: primaryTopic.titleAr,
        suggestedRange: rangeKeys,
        evidenceStatus: 'EXPECTED',
        evidenceSource: 'ACADEMIC_CALENDAR',
        academicWeek: week,
        needsStudentConfirmation: true,
        confirmationPromptKey: 'CONFIRM_EXPECTED_RANGE',
        notes: [
          `Calculated from academic calendar week ${week}. Class pace may differ from nominal syllabus schedule.`,
        ],
      };
    }
  }

  // Case 3: No usable evidence -> Ask student directly
  return {
    courseCode,
    mode: 'ASK_STUDENT_DIRECTLY',
    evidenceStatus: 'UNKNOWN',
    evidenceSource: 'SYSTEM_INFERENCE',
    needsStudentConfirmation: true,
    confirmationPromptKey: 'ASK_STUDENT_DIRECTLY',
    notes: ['No trustworthy course pulse or calendar schedule available for this course.'],
  };
}
