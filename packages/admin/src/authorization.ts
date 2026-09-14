import type { Role } from './roles.js';
import {
  type AdminPermission,
  isCourseScopedPermission,
  roleHasCapability,
} from './permissions.js';
import type { AuthorizationResource } from './scopes.js';
import {
  type CourseEditorAssignment,
  assignmentPermits,
  isAssignmentEffective,
} from './assignments.js';

export interface AuthorizationDecision {
  allowed: boolean;
  actorKey: string;
  permission: AdminPermission;
  resource?: AuthorizationResource | undefined;
  reason: string;
  timestamp: string; // ISO 8601 string
}

/**
 * Pure authorization evaluation engine.
 * Deterministic: given the same inputs and state, produces identical decisions.
 */
export function evaluateAuthorization(
  actorKey: string,
  role: Role,
  permission: AdminPermission,
  assignments: readonly CourseEditorAssignment[],
  resource?: AuthorizationResource,
  now: Date = new Date(),
): AuthorizationDecision {
  const timestamp = now.toISOString();

  // 1. SUPER_ADMIN has unconditional global access across all permissions and scopes
  if (role === 'SUPER_ADMIN') {
    return {
      allowed: true,
      actorKey,
      permission,
      resource,
      reason: 'SUPER_ADMIN_GLOBAL',
      timestamp,
    };
  }

  // 2. Check static capability of role
  if (!roleHasCapability(role, permission)) {
    return {
      allowed: false,
      actorKey,
      permission,
      resource,
      reason: 'ROLE_LACKS_PERMISSION',
      timestamp,
    };
  }

  // 3. ADMIN has broad operational capabilities across courses
  if (role === 'ADMIN') {
    return {
      allowed: true,
      actorKey,
      permission,
      resource,
      reason: 'ADMIN_GLOBAL',
      timestamp,
    };
  }

  // 4. COURSE_EDITOR evaluation
  if (role === 'COURSE_EDITOR') {
    if (isCourseScopedPermission(permission)) {
      if (!resource || !resource.courseCode) {
        return {
          allowed: false,
          actorKey,
          permission,
          resource,
          reason: 'COURSE_SCOPE_REQUIRED',
          timestamp,
        };
      }

      const targetCourse = resource.courseCode.trim().toUpperCase();
      const matchingAssignments = assignments.filter(
        (a) => a.courseCode.trim().toUpperCase() === targetCourse,
      );

      if (matchingAssignments.length === 0) {
        return {
          allowed: false,
          actorKey,
          permission,
          resource,
          reason: 'OUT_OF_SCOPE',
          timestamp,
        };
      }

      // Check active and effective assignment
      const effectiveAssignment = matchingAssignments.find((a) => isAssignmentEffective(a, now));

      if (effectiveAssignment) {
        if (!assignmentPermits(effectiveAssignment, permission)) {
          return {
            allowed: false,
            actorKey,
            permission,
            resource,
            reason: 'PERMISSION_NOT_IN_ASSIGNMENT',
            timestamp,
          };
        }

        return {
          allowed: true,
          actorKey,
          permission,
          resource,
          reason: 'COURSE_EDITOR_ASSIGNED',
          timestamp,
        };
      }

      // If not effective, check specific failure reason among matching assignments
      const anyRevoked = matchingAssignments.some((a) => a.status === 'REVOKED');
      if (anyRevoked) {
        return {
          allowed: false,
          actorKey,
          permission,
          resource,
          reason: 'ASSIGNMENT_REVOKED',
          timestamp,
        };
      }

      const anyExpired = matchingAssignments.some((a) => {
        if (a.status === 'EXPIRED') return true;
        if (a.validTo && new Date(a.validTo).getTime() < now.getTime()) return true;
        return false;
      });
      if (anyExpired) {
        return {
          allowed: false,
          actorKey,
          permission,
          resource,
          reason: 'ASSIGNMENT_EXPIRED',
          timestamp,
        };
      }

      const anyFuture = matchingAssignments.some(
        (a) => a.validFrom && new Date(a.validFrom).getTime() > now.getTime(),
      );
      if (anyFuture) {
        return {
          allowed: false,
          actorKey,
          permission,
          resource,
          reason: 'ASSIGNMENT_NOT_YET_EFFECTIVE',
          timestamp,
        };
      }

      return {
        allowed: false,
        actorKey,
        permission,
        resource,
        reason: 'OUT_OF_SCOPE',
        timestamp,
      };
    }

    // Non-course-scoped permissions (e.g. COURSE_VIEW, SOURCE_SUBMIT)
    return {
      allowed: true,
      actorKey,
      permission,
      resource,
      reason: 'COURSE_EDITOR_GENERAL',
      timestamp,
    };
  }

  // 5. REVIEWER role evaluation
  if (role === 'REVIEWER') {
    return {
      allowed: true,
      actorKey,
      permission,
      resource,
      reason: 'REVIEWER_CAPABILITY',
      timestamp,
    };
  }

  // 6. STUDENT role evaluation
  if (role === 'STUDENT') {
    return {
      allowed: true,
      actorKey,
      permission,
      resource,
      reason: 'STUDENT_DEFAULT',
      timestamp,
    };
  }

  return {
    allowed: false,
    actorKey,
    permission,
    resource,
    reason: 'UNKNOWN_ROLE',
    timestamp,
  };
}
