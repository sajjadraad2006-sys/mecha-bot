import type { AdminPermission } from './permissions.js';

export const ASSIGNMENT_STATUSES = ['ACTIVE', 'REVOKED', 'EXPIRED'] as const;
export type AssignmentStatus = (typeof ASSIGNMENT_STATUSES)[number];

/**
 * Represents authorization granted to an actor to edit/manage a specific course in Mecha Bot.
 *
 * NOTE: This represents MECHA BOT ADMINISTRATIVE PRIVILEGES ONLY.
 * It does NOT represent lecturer assignment, instructional duties, or teaching status.
 */
export interface CourseEditorAssignment {
  id: string;
  actorKey: string;
  courseCode: string;
  permissions?: AdminPermission[] | undefined;
  validFrom?: string | undefined; // ISO 8601 string
  validTo?: string | undefined; // ISO 8601 string
  assignedBy: string;
  assignedAt: string; // ISO 8601 string
  status: AssignmentStatus;
  revokedAt?: string | undefined;
  revokedBy?: string | undefined;
  revocationReason?: string | undefined;
}

/**
 * Checks whether a course editor assignment is currently active and effective.
 *
 * Fails safely:
 * - If status is not 'ACTIVE', returns false.
 * - If validFrom is in the future, returns false (not yet effective).
 * - If validTo is in the past, returns false (expired).
 */
export function isAssignmentEffective(
  assignment: CourseEditorAssignment,
  at: Date = new Date(),
): boolean {
  if (assignment.status !== 'ACTIVE') {
    return false;
  }

  const currentMs = at.getTime();

  if (assignment.validFrom) {
    const fromMs = new Date(assignment.validFrom).getTime();
    if (isNaN(fromMs) || currentMs < fromMs) {
      return false;
    }
  }

  if (assignment.validTo) {
    const toMs = new Date(assignment.validTo).getTime();
    if (isNaN(toMs) || currentMs > toMs) {
      return false;
    }
  }

  return true;
}

/**
 * Verifies if an assignment allows a specific permission.
 * If assignment.permissions is undefined or empty, it grants all course-scoped permissions.
 */
export function assignmentPermits(
  assignment: CourseEditorAssignment,
  permission: AdminPermission,
): boolean {
  if (!assignment.permissions || assignment.permissions.length === 0) {
    return true;
  }
  return assignment.permissions.includes(permission);
}
