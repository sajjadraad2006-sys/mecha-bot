import { Stage, ProgramSemester, AcademicCoreDataset, AcademicTopic } from '@mecha-bot/academic';
import { StudyDiagnosis, CoursePulsePosition, CalendarPosition } from './types.js';
import { generateCatchUpPath, buildCatchUpPlan } from './catchup.js';
import { partitionStudyBudget } from './plan.js';

export interface DiagnoseStudyInput {
  studentKey: string;
  courseQuery: string;
  stage?: Stage | undefined;
  programSemester?: ProgramSemester | undefined;
  targetTopicQuery?: string | undefined;
  targetTopicKey?: string | undefined;
  lastUnderstoodQuery?: string | undefined;
  lastUnderstoodTopicKey?: string | undefined;
  coursePulse?: CoursePulsePosition | undefined;
  calendarPosition?: CalendarPosition | undefined;
  studyBudgetMinutes?: number | undefined;
  dataset: AcademicCoreDataset;
}

/**
 * Deterministic "أني ضايع" Diagnosis Engine.
 * Diagnoses the student's academic position, identifies prerequisite gaps,
 * and constructs a structured catch-up plan without AI hallucination.
 */
export function diagnoseStudyPosition(input: DiagnoseStudyInput): StudyDiagnosis {
  const { dataset } = input;

  // Step 1: Resolve Course
  const courseQueryObj: { query: string; stage?: Stage; programSemester?: ProgramSemester } = {
    query: input.courseQuery,
  };
  if (input.stage !== undefined) courseQueryObj.stage = input.stage;
  if (input.programSemester !== undefined) courseQueryObj.programSemester = input.programSemester;

  const courseRes = dataset.courseResolver.resolve(courseQueryObj);

  if (courseRes.needsClarification) {
    return {
      status: 'COURSE_CLARIFICATION_REQUIRED',
      candidateCourseCodes: courseRes.candidateCourseCodes,
      missingPrerequisites: [],
      needsStudentConfirmation: true,
      reasonCodes: [courseRes.clarificationReason || 'AMBIGUOUS_COURSE_QUERY'],
      explanationNote:
        courseRes.candidateCourseCodes.length > 1
          ? `Query '${input.courseQuery}' is ambiguous between courses: ${courseRes.candidateCourseCodes.join(', ')}. Please specify your stage or semester.`
          : `Could not identify course for query '${input.courseQuery}'.`,
    };
  }

  const courseCode = courseRes.candidateCourseCodes[0]!;
  const profile = dataset.profilesByCode.get(courseCode);

  // Step 2: Check Course Profile Integrity (MCT124 Conflict & IDENTITY_ONLY)
  if (profile?.topicMapStatus === 'CONFLICTING') {
    return {
      status: 'ACADEMIC_DATA_CONFLICT',
      courseCode,
      missingPrerequisites: [],
      needsStudentConfirmation: true,
      reasonCodes: ['ACADEMIC_DATA_CONFLICT', 'MCT124_CONFLICT'],
      explanationNote: `Course ${courseCode} has documented academic contradictions between the curriculum schedule and syllabus description. Cannot generate an authoritative progression map.`,
    };
  }

  if (profile?.topicMapStatus === 'IDENTITY_ONLY') {
    return {
      status: 'INSUFFICIENT_ACADEMIC_MAP',
      courseCode,
      missingPrerequisites: [],
      needsStudentConfirmation: false,
      reasonCodes: ['IDENTITY_ONLY_COURSE'],
      explanationNote: `Course ${courseCode} currently has no detailed topic map in the academic core dataset.`,
    };
  }

  const courseTopics = dataset.topics.filter((t) => t.courseCode === courseCode);

  // Step 3: Determine Target Topic
  let targetTopic: AcademicTopic | undefined;

  if (input.targetTopicKey) {
    targetTopic = dataset.topics.find((t) => t.topicKey === input.targetTopicKey);
  } else if (input.targetTopicQuery) {
    const res = dataset.topicResolver.resolve(courseCode, input.targetTopicQuery);
    if (res.topic) {
      targetTopic = res.topic;
    } else {
      return {
        status: 'TOPIC_CLARIFICATION_REQUIRED',
        courseCode,
        missingPrerequisites: [],
        needsStudentConfirmation: true,
        reasonCodes: ['TARGET_TOPIC_UNRESOLVED'],
        explanationNote: `Could not resolve target topic for query '${input.targetTopicQuery}' in course ${courseCode}.`,
      };
    }
  } else if (input.coursePulse?.topicKey) {
    targetTopic = dataset.topics.find((t) => t.topicKey === input.coursePulse!.topicKey);
  }

  if (!targetTopic) {
    return {
      status: 'TARGET_UNKNOWN',
      courseCode,
      missingPrerequisites: [],
      needsStudentConfirmation: true,
      reasonCodes: ['CURRENT_CLASS_TOPIC_UNKNOWN'],
      explanationNote: `Current class topic or study target is unknown for ${courseCode}. Please specify where your class is or what you want to study.`,
    };
  }

  // Step 4: Determine Last Understood Topic
  let lastUnderstoodTopic: AcademicTopic | undefined;

  if (input.lastUnderstoodTopicKey) {
    lastUnderstoodTopic = dataset.topics.find((t) => t.topicKey === input.lastUnderstoodTopicKey);
  } else if (input.lastUnderstoodQuery) {
    const res = dataset.topicResolver.resolve(courseCode, input.lastUnderstoodQuery);
    if (res.topic) {
      lastUnderstoodTopic = res.topic;
    } else {
      return {
        status: 'TOPIC_CLARIFICATION_REQUIRED',
        courseCode,
        targetTopicKey: targetTopic.topicKey,
        missingPrerequisites: [],
        needsStudentConfirmation: true,
        reasonCodes: ['LAST_UNDERSTOOD_TOPIC_UNRESOLVED'],
        explanationNote: `Could not resolve last understood topic for query '${input.lastUnderstoodQuery}' in course ${courseCode}.`,
      };
    }
  }

  if (!lastUnderstoodTopic) {
    return {
      status: 'NEEDS_BASELINE',
      courseCode,
      targetTopicKey: targetTopic.topicKey,
      missingPrerequisites: [],
      needsStudentConfirmation: true,
      reasonCodes: ['BASELINE_UNKNOWN'],
      explanationNote: `Baseline understanding unknown for ${courseCode}. What is the last topic you remember understanding?`,
    };
  }

  // Step 5: Compare Positions & Generate Catch-Up Path
  if (lastUnderstoodTopic.topicKey === targetTopic.topicKey) {
    return {
      status: 'ON_TRACK',
      courseCode,
      targetTopicKey: targetTopic.topicKey,
      lastUnderstoodTopicKey: lastUnderstoodTopic.topicKey,
      missingPrerequisites: [],
      needsStudentConfirmation: false,
      reasonCodes: ['STUDENT_AT_TARGET'],
      explanationNote: `You are up to date with target topic '${targetTopic.titleEn}'.`,
    };
  }

  const pathResult = generateCatchUpPath({
    courseCode,
    targetTopic,
    lastUnderstoodTopic,
    prerequisiteGraph: dataset.prerequisiteGraph,
    courseTopics,
  });

  if (pathResult.hasPrerequisitePath && pathResult.missingPrerequisiteKeys.length > 0) {
    const plan = buildCatchUpPlan({
      courseCode,
      targetTopicKey: targetTopic.topicKey,
      steps: pathResult.steps,
    });

    if (input.studyBudgetMinutes !== undefined) {
      plan.studyBudgetPlan = partitionStudyBudget(input.studyBudgetMinutes, pathResult.steps);
    }

    return {
      status: 'CATCH_UP_REQUIRED',
      courseCode,
      targetTopicKey: targetTopic.topicKey,
      lastUnderstoodTopicKey: lastUnderstoodTopic.topicKey,
      missingPrerequisites: pathResult.missingPrerequisiteKeys,
      needsStudentConfirmation: true,
      reasonCodes: ['UNMET_PREREQUISITE_DEPENDENCIES'],
      explanationNote: `Missing ${pathResult.missingPrerequisiteKeys.length} verified prerequisite topic(s) before '${targetTopic.titleEn}'.`,
      catchUpPlan: plan,
    };
  }

  if (pathResult.hasOrderPath && pathResult.orderBasedReviewKeys.length > 0) {
    const plan = buildCatchUpPlan({
      courseCode,
      targetTopicKey: targetTopic.topicKey,
      steps: pathResult.steps,
    });

    if (input.studyBudgetMinutes !== undefined) {
      plan.studyBudgetPlan = partitionStudyBudget(input.studyBudgetMinutes, pathResult.steps);
    }

    return {
      status: 'REVIEW_RECOMMENDED',
      courseCode,
      targetTopicKey: targetTopic.topicKey,
      lastUnderstoodTopicKey: lastUnderstoodTopic.topicKey,
      missingPrerequisites: [],
      orderBasedReviewTopics: pathResult.orderBasedReviewKeys,
      needsStudentConfirmation: true,
      reasonCodes: ['ORDER_BASED_REVIEW_GAP'],
      explanationNote: `No formal prerequisite dependency edge exists, but ${pathResult.orderBasedReviewKeys.length} intermediate topic(s) precede '${targetTopic.titleEn}' in syllabus order.`,
      catchUpPlan: plan,
    };
  }

  return {
    status: 'INSUFFICIENT_EVIDENCE',
    courseCode,
    targetTopicKey: targetTopic.topicKey,
    lastUnderstoodTopicKey: lastUnderstoodTopic.topicKey,
    missingPrerequisites: [],
    needsStudentConfirmation: true,
    reasonCodes: ['NO_PREREQUISITE_OR_ORDER_PATH_FOUND'],
    explanationNote: `Cannot determine a dependency relationship between '${lastUnderstoodTopic.titleEn}' and '${targetTopic.titleEn}'.`,
  };
}
