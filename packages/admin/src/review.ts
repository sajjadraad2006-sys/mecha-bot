import type { Role } from './roles.js';

export const REVIEW_TYPES = [
  'SOURCE_SUBMISSION',
  'PAST_EXAM_SUBMISSION',
  'COURSE_PROGRESS_UPDATE',
  'TIMETABLE_UPDATE',
  'ACADEMIC_EVENT_UPDATE',
  'OTHER',
] as const;

export type ReviewType = (typeof REVIEW_TYPES)[number];

export const REVIEW_STATUSES = [
  'PENDING',
  'APPROVED',
  'REJECTED',
  'NEEDS_CHANGES',
  'WITHDRAWN',
] as const;

export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

/**
 * Audit trail entry for state transitions on a review item.
 */
export interface ReviewHistoryEntry {
  fromStatus: ReviewStatus;
  toStatus: ReviewStatus;
  changedBy: string;
  changedAt: string;
  reason?: string | undefined;
}

/**
 * Representation of an item in the administrative moderation workflow.
 *
 * CRITICAL SEMANTICS:
 * Approved review means approved for the workflow.
 * It does NOT automatically imply or grant:
 * - OFFICIAL_DEPARTMENT
 * - EXACT_COURSE
 * - VERIFIED_SOLUTION
 * Those evidence semantics belong strictly to academic and source authority layers.
 */
export interface ReviewItem {
  id: string;
  type: ReviewType;
  submittedBy: string; // actorKey
  courseCode?: string | undefined;
  targetRef?: string | undefined;
  title?: string | undefined;
  summary?: string | undefined;
  submittedAt: string; // ISO 8601 string
  status: ReviewStatus;
  reviewedBy?: string | undefined;
  reviewedAt?: string | undefined;
  decisionReason?: string | undefined;
  version: number;
  history: ReviewHistoryEntry[];
}

/**
 * Allowed direct transitions between review statuses.
 *
 * Normal workflow:
 * - PENDING -> APPROVED, REJECTED, NEEDS_CHANGES, WITHDRAWN
 * - NEEDS_CHANGES -> PENDING, WITHDRAWN
 *
 * Transitions like APPROVED -> PENDING or REJECTED -> APPROVED are disallowed directly.
 * Any reopening must be an explicit administrative operation.
 */
export const ALLOWED_TRANSITIONS: Record<ReviewStatus, readonly ReviewStatus[]> = {
  PENDING: ['APPROVED', 'REJECTED', 'NEEDS_CHANGES', 'WITHDRAWN'],
  NEEDS_CHANGES: ['PENDING', 'WITHDRAWN'],
  APPROVED: [],
  REJECTED: [],
  WITHDRAWN: [],
};

/**
 * Validates whether a direct status transition is permitted.
 */
export function isValidReviewTransition(from: ReviewStatus, to: ReviewStatus): boolean {
  const allowed = ALLOWED_TRANSITIONS[from];
  return allowed ? allowed.includes(to) : false;
}

/**
 * Evidence semantics warning constant.
 */
export const REVIEW_EVIDENCE_SEMANTICS_DISCLAIMER =
  'APPROVED review status indicates acceptance into workflow only and does NOT confer OFFICIAL_DEPARTMENT, EXACT_COURSE, or VERIFIED_SOLUTION evidence semantics.';

export interface SelfReviewEvaluation {
  allowed: boolean;
  reason?: string | undefined;
  isOverride?: boolean | undefined;
}

/**
 * Evaluates whether an actor can approve a submission, enforcing independent review.
 *
 * Rules:
 * - Submitter cannot approve their own submission under independent review policy.
 * - SUPER_ADMIN may override this policy only if explicit override flag is supplied,
 *   which MUST be clearly logged in the audit trail.
 */
export function evaluateSelfReviewPolicy(
  reviewerKey: string,
  reviewerRole: Role,
  submitterKey: string,
  allowSuperAdminOverride = false,
): SelfReviewEvaluation {
  if (reviewerKey !== submitterKey) {
    return { allowed: true };
  }

  // Reviewer is the submitter
  if (reviewerRole === 'SUPER_ADMIN') {
    if (allowSuperAdminOverride) {
      return {
        allowed: true,
        isOverride: true,
        reason: 'SUPER_ADMIN_SELF_REVIEW_OVERRIDE',
      };
    }
    return {
      allowed: false,
      reason: 'SELF_APPROVAL_REQUIRES_EXPLICIT_SUPER_ADMIN_OVERRIDE',
    };
  }

  return {
    allowed: false,
    reason: 'SELF_REVIEW_FORBIDDEN_INDEPENDENT_REVIEW_REQUIRED',
  };
}
