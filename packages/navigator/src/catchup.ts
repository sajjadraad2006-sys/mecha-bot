import { AcademicTopic, PrerequisiteGraph } from '@mecha-bot/academic';
import { CatchUpStep, CatchUpPlan } from './types.js';

export interface GenerateCatchUpPathInput {
  courseCode: string;
  targetTopic: AcademicTopic;
  lastUnderstoodTopic?: AcademicTopic | undefined;
  prerequisiteGraph: PrerequisiteGraph;
  courseTopics?: AcademicTopic[] | undefined;
}

export interface CatchUpPathResult {
  steps: CatchUpStep[];
  hasPrerequisitePath: boolean;
  hasOrderPath: boolean;
  missingPrerequisiteKeys: string[];
  orderBasedReviewKeys: string[];
}

/**
 * Deterministically constructs a structured catch-up path between a student's
 * last understood position and the current target topic.
 *
 * Rules:
 * - Direct/transitive prerequisites are labeled 'DIRECT_PREREQUISITE' or 'DEPENDENCY_CHAIN'.
 * - Topic order sequence without verified prerequisite edges is labeled 'ORDER_BASED_REVIEW'.
 * - Target topic is included once at the end as 'TARGET_TOPIC'.
 * - Zero duplicate topics.
 * - Deterministic ordering from foundational to target.
 */
export function generateCatchUpPath(input: GenerateCatchUpPathInput): CatchUpPathResult {
  const { targetTopic, lastUnderstoodTopic, prerequisiteGraph, courseTopics = [] } = input;

  const targetKey = targetTopic.topicKey;
  const directPrereqs = prerequisiteGraph.getDirectPrerequisites(targetKey);
  const directPrereqKeys = new Set(directPrereqs.map((p) => p.topicKey));

  // 1. Check full prerequisite dependency chain of the target topic
  const fullChain = prerequisiteGraph.getDependencyChain(targetKey);
  const chainKeys = fullChain.map((t) => t.topicKey);

  const missingPrerequisiteKeys: string[] = [];
  const orderBasedReviewKeys: string[] = [];
  const stepMap = new Map<string, CatchUpStep>();

  if (lastUnderstoodTopic) {
    const lastKey = lastUnderstoodTopic.topicKey;

    if (lastKey === targetKey) {
      // Already on track
      return {
        steps: [
          {
            topicKey: targetKey,
            titleEn: targetTopic.titleEn,
            titleAr: targetTopic.titleAr,
            reason: 'TARGET_TOPIC',
            nominalWeek: targetTopic.nominalWeek,
          },
        ],
        hasPrerequisitePath: true,
        hasOrderPath: false,
        missingPrerequisiteKeys: [],
        orderBasedReviewKeys: [],
      };
    }

    const lastUnderstoodIndexInChain = chainKeys.indexOf(lastKey);

    if (lastUnderstoodIndexInChain !== -1) {
      // The student understood a foundational topic in the prerequisite chain!
      // The missing prerequisites are all topics in the chain AFTER the last understood topic
      const neededChain = fullChain.slice(lastUnderstoodIndexInChain + 1);

      for (const prereq of neededChain) {
        if (prereq.topicKey !== targetKey && !stepMap.has(prereq.topicKey)) {
          const isDirect = directPrereqKeys.has(prereq.topicKey);
          const reason = isDirect ? 'DIRECT_PREREQUISITE' : 'DEPENDENCY_CHAIN';

          missingPrerequisiteKeys.push(prereq.topicKey);
          stepMap.set(prereq.topicKey, {
            topicKey: prereq.topicKey,
            titleEn: prereq.titleEn,
            titleAr: prereq.titleAr,
            reason,
            nominalWeek: prereq.nominalWeek,
          });
        }
      }

      // Add target topic at the end
      stepMap.set(targetKey, {
        topicKey: targetKey,
        titleEn: targetTopic.titleEn,
        titleAr: targetTopic.titleAr,
        reason: 'TARGET_TOPIC',
        nominalWeek: targetTopic.nominalWeek,
      });

      return {
        steps: Array.from(stepMap.values()),
        hasPrerequisitePath: true,
        hasOrderPath: false,
        missingPrerequisiteKeys,
        orderBasedReviewKeys: [],
      };
    }

    // Direct prerequisite check (in case chain traversal didn't order it)
    if (directPrereqKeys.has(lastKey)) {
      // Student understood the immediate prerequisite, only target needed
      return {
        steps: [
          {
            topicKey: targetKey,
            titleEn: targetTopic.titleEn,
            titleAr: targetTopic.titleAr,
            reason: 'TARGET_TOPIC',
            nominalWeek: targetTopic.nominalWeek,
          },
        ],
        hasPrerequisitePath: true,
        hasOrderPath: false,
        missingPrerequisiteKeys: [],
        orderBasedReviewKeys: [],
      };
    }

    // Fallback: Check course topic order (e.g. weekly order in syllabus)
    if (
      courseTopics.length > 0 &&
      lastUnderstoodTopic.courseCode === targetTopic.courseCode &&
      lastUnderstoodTopic.orderIndex !== undefined &&
      targetTopic.orderIndex !== undefined &&
      lastUnderstoodTopic.orderIndex < targetTopic.orderIndex
    ) {
      const intermediateTopics = courseTopics
        .filter(
          (t) =>
            t.orderIndex !== undefined &&
            t.orderIndex > lastUnderstoodTopic.orderIndex! &&
            t.orderIndex < targetTopic.orderIndex!,
        )
        .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

      for (const item of intermediateTopics) {
        if (!stepMap.has(item.topicKey)) {
          orderBasedReviewKeys.push(item.topicKey);
          stepMap.set(item.topicKey, {
            topicKey: item.topicKey,
            titleEn: item.titleEn,
            titleAr: item.titleAr,
            reason: 'ORDER_BASED_REVIEW',
            nominalWeek: item.nominalWeek,
          });
        }
      }

      stepMap.set(targetKey, {
        topicKey: targetKey,
        titleEn: targetTopic.titleEn,
        titleAr: targetTopic.titleAr,
        reason: 'TARGET_TOPIC',
        nominalWeek: targetTopic.nominalWeek,
      });

      return {
        steps: Array.from(stepMap.values()),
        hasPrerequisitePath: false,
        hasOrderPath: true,
        missingPrerequisiteKeys: [],
        orderBasedReviewKeys,
      };
    }
  } else {
    // If no last understood topic provided, return the full prerequisite chain for target
    for (const prereq of fullChain) {
      if (prereq.topicKey !== targetKey && !stepMap.has(prereq.topicKey)) {
        const isDirect = directPrereqKeys.has(prereq.topicKey);
        const reason = isDirect ? 'DIRECT_PREREQUISITE' : 'DEPENDENCY_CHAIN';

        missingPrerequisiteKeys.push(prereq.topicKey);
        stepMap.set(prereq.topicKey, {
          topicKey: prereq.topicKey,
          titleEn: prereq.titleEn,
          titleAr: prereq.titleAr,
          reason,
          nominalWeek: prereq.nominalWeek,
        });
      }
    }

    stepMap.set(targetKey, {
      topicKey: targetKey,
      titleEn: targetTopic.titleEn,
      titleAr: targetTopic.titleAr,
      reason: 'TARGET_TOPIC',
      nominalWeek: targetTopic.nominalWeek,
    });

    return {
      steps: Array.from(stepMap.values()),
      hasPrerequisitePath: fullChain.length > 0,
      hasOrderPath: false,
      missingPrerequisiteKeys,
      orderBasedReviewKeys: [],
    };
  }

  // Neither prerequisite path nor order relationship found
  return {
    steps: [
      {
        topicKey: targetKey,
        titleEn: targetTopic.titleEn,
        titleAr: targetTopic.titleAr,
        reason: 'TARGET_TOPIC',
        nominalWeek: targetTopic.nominalWeek,
      },
    ],
    hasPrerequisitePath: false,
    hasOrderPath: false,
    missingPrerequisiteKeys: [],
    orderBasedReviewKeys: [],
  };
}

/**
 * Builds a structured CatchUpPlan object.
 */
export function buildCatchUpPlan(params: {
  courseCode: string;
  targetTopicKey: string;
  steps: CatchUpStep[];
}): CatchUpPlan {
  return {
    courseCode: params.courseCode.toUpperCase(),
    targetTopicKey: params.targetTopicKey,
    steps: params.steps,
    generatedAt: new Date().toISOString(),
  };
}
