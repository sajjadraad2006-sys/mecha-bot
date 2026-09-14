import { ValidationError } from '@mecha-bot/shared';
import { CatchUpStep, StudyBudgetPlan, StudyBudgetBlock } from './types.js';

/**
 * Partitions a study time budget into deterministic review blocks using planning heuristics.
 *
 * Rules:
 * - Time is distributed between: Prerequisite Review, Target Topic Focus, and Self-Check.
 * - Non-positive or NaN durations are strictly rejected.
 * - Clearly labeled as 'PLANNING_HEURISTIC'.
 */
export function partitionStudyBudget(budgetMinutes: number, steps: CatchUpStep[]): StudyBudgetPlan {
  if (
    typeof budgetMinutes !== 'number' ||
    isNaN(budgetMinutes) ||
    !Number.isFinite(budgetMinutes) ||
    !Number.isInteger(budgetMinutes) ||
    budgetMinutes <= 0
  ) {
    throw new ValidationError(
      `Invalid study budget duration: ${budgetMinutes}. Duration must be a positive integer in minutes.`,
    );
  }

  const prereqSteps = steps.filter((s) => s.reason !== 'TARGET_TOPIC');
  const targetStep = steps.find((s) => s.reason === 'TARGET_TOPIC') || steps[steps.length - 1];

  const prereqKeys = prereqSteps.map((s) => s.topicKey);
  const targetKey = targetStep ? [targetStep.topicKey] : [];

  const hasPrereqs = prereqKeys.length > 0;
  const blocks: StudyBudgetBlock[] = [];

  switch (budgetMinutes) {
    case 10:
      if (hasPrereqs) {
        blocks.push({
          kind: 'PREREQUISITE_REVIEW',
          durationMinutes: 5,
          recommendedTopicKeys: prereqKeys,
          description: 'Quick refresher of foundational prerequisites.',
        });
        blocks.push({
          kind: 'TARGET_TOPIC_FOCUS',
          durationMinutes: 5,
          recommendedTopicKeys: targetKey,
          description: 'Target concept overview and core definitions.',
        });
      } else {
        blocks.push({
          kind: 'TARGET_TOPIC_FOCUS',
          durationMinutes: 8,
          recommendedTopicKeys: targetKey,
          description: 'Focused study of the target topic.',
        });
        blocks.push({
          kind: 'SELF_CHECK',
          durationMinutes: 2,
          recommendedTopicKeys: targetKey,
          description: 'Quick concept recall check.',
        });
      }
      break;

    case 15:
      if (hasPrereqs) {
        blocks.push({
          kind: 'PREREQUISITE_REVIEW',
          durationMinutes: 5,
          recommendedTopicKeys: prereqKeys,
          description: 'Review foundational prerequisite concepts.',
        });
        blocks.push({
          kind: 'TARGET_TOPIC_FOCUS',
          durationMinutes: 7,
          recommendedTopicKeys: targetKey,
          description: 'Core concepts, laws, and equations.',
        });
        blocks.push({
          kind: 'SELF_CHECK',
          durationMinutes: 3,
          recommendedTopicKeys: targetKey,
          description: 'Quick practice question or self-assessment.',
        });
      } else {
        blocks.push({
          kind: 'TARGET_TOPIC_FOCUS',
          durationMinutes: 12,
          recommendedTopicKeys: targetKey,
          description: 'Target topic deep dive.',
        });
        blocks.push({
          kind: 'SELF_CHECK',
          durationMinutes: 3,
          recommendedTopicKeys: targetKey,
          description: 'Self-assessment quiz.',
        });
      }
      break;

    case 30:
      if (hasPrereqs) {
        blocks.push({
          kind: 'PREREQUISITE_REVIEW',
          durationMinutes: 10,
          recommendedTopicKeys: prereqKeys,
          description: 'Prerequisite review and key formulas.',
        });
        blocks.push({
          kind: 'TARGET_TOPIC_FOCUS',
          durationMinutes: 15,
          recommendedTopicKeys: targetKey,
          description: 'In-depth study of target topic principles.',
        });
        blocks.push({
          kind: 'SELF_CHECK',
          durationMinutes: 5,
          recommendedTopicKeys: targetKey,
          description: 'Solve one representative example problem.',
        });
      } else {
        blocks.push({
          kind: 'TARGET_TOPIC_FOCUS',
          durationMinutes: 22,
          recommendedTopicKeys: targetKey,
          description: 'Comprehensive study of the target topic.',
        });
        blocks.push({
          kind: 'SELF_CHECK',
          durationMinutes: 8,
          recommendedTopicKeys: targetKey,
          description: 'Detailed practice problem check.',
        });
      }
      break;

    case 45:
      if (hasPrereqs) {
        blocks.push({
          kind: 'PREREQUISITE_REVIEW',
          durationMinutes: 15,
          recommendedTopicKeys: prereqKeys,
          description: 'Thorough prerequisite derivation and context review.',
        });
        blocks.push({
          kind: 'TARGET_TOPIC_FOCUS',
          durationMinutes: 20,
          recommendedTopicKeys: targetKey,
          description: 'Target topic theory, proofs, and application.',
        });
        blocks.push({
          kind: 'SELF_CHECK',
          durationMinutes: 10,
          recommendedTopicKeys: targetKey,
          description: 'Worked problem practice and error analysis.',
        });
      } else {
        blocks.push({
          kind: 'TARGET_TOPIC_FOCUS',
          durationMinutes: 32,
          recommendedTopicKeys: targetKey,
          description: 'Complete target topic coverage.',
        });
        blocks.push({
          kind: 'SELF_CHECK',
          durationMinutes: 13,
          recommendedTopicKeys: targetKey,
          description: 'Past exam style practice problem.',
        });
      }
      break;

    case 60:
      if (hasPrereqs) {
        blocks.push({
          kind: 'PREREQUISITE_REVIEW',
          durationMinutes: 20,
          recommendedTopicKeys: prereqKeys,
          description: 'Comprehensive prerequisite reconstruction.',
        });
        blocks.push({
          kind: 'TARGET_TOPIC_FOCUS',
          durationMinutes: 25,
          recommendedTopicKeys: targetKey,
          description: 'Full target topic mastery session.',
        });
        blocks.push({
          kind: 'SELF_CHECK',
          durationMinutes: 15,
          recommendedTopicKeys: targetKey,
          description: 'Exam-level problem solving and review.',
        });
      } else {
        blocks.push({
          kind: 'TARGET_TOPIC_FOCUS',
          durationMinutes: 45,
          recommendedTopicKeys: targetKey,
          description: 'Intensive study session on target topic.',
        });
        blocks.push({
          kind: 'SELF_CHECK',
          durationMinutes: 15,
          recommendedTopicKeys: targetKey,
          description: 'Comprehensive self-assessment.',
        });
      }
      break;

    default: {
      // Custom duration heuristics
      if (hasPrereqs) {
        const prereqTime = Math.max(1, Math.round(budgetMinutes * 0.33));
        const targetTime = Math.max(1, Math.round(budgetMinutes * 0.5));
        const checkTime = Math.max(1, budgetMinutes - prereqTime - targetTime);

        blocks.push({
          kind: 'PREREQUISITE_REVIEW',
          durationMinutes: prereqTime,
          recommendedTopicKeys: prereqKeys,
          description: 'Prerequisite review proportional to available budget.',
        });
        blocks.push({
          kind: 'TARGET_TOPIC_FOCUS',
          durationMinutes: targetTime,
          recommendedTopicKeys: targetKey,
          description: 'Target topic core study.',
        });
        blocks.push({
          kind: 'SELF_CHECK',
          durationMinutes: checkTime,
          recommendedTopicKeys: targetKey,
          description: 'Self-assessment check.',
        });
      } else {
        const targetTime = Math.max(1, Math.round(budgetMinutes * 0.75));
        const checkTime = Math.max(1, budgetMinutes - targetTime);

        blocks.push({
          kind: 'TARGET_TOPIC_FOCUS',
          durationMinutes: targetTime,
          recommendedTopicKeys: targetKey,
          description: 'Target topic study session.',
        });
        blocks.push({
          kind: 'SELF_CHECK',
          durationMinutes: checkTime,
          recommendedTopicKeys: targetKey,
          description: 'Self-check recall session.',
        });
      }
      break;
    }
  }

  return {
    totalBudgetMinutes: budgetMinutes,
    blocks,
    label: 'PLANNING_HEURISTIC',
  };
}
