/**
 * Supported administrative and user roles in Mecha Bot.
 * Identity is represented by an opaque internal actor key (actorKey: string).
 * Telegram IDs, usernames, and production identifiers are mapped separately.
 */

export const ROLES = ['SUPER_ADMIN', 'ADMIN', 'COURSE_EDITOR', 'REVIEWER', 'STUDENT'] as const;

export type Role = (typeof ROLES)[number];

/**
 * Numeric hierarchy rank for privilege level comparisons.
 * Higher rank represents strictly higher or equal administrative standing.
 */
export const ROLE_HIERARCHY: Record<Role, number> = {
  SUPER_ADMIN: 5,
  ADMIN: 4,
  COURSE_EDITOR: 3,
  REVIEWER: 3,
  STUDENT: 1,
};

/**
 * Type guard for Role.
 */
export function isRole(value: unknown): value is Role {
  return typeof value === 'string' && ROLES.includes(value as Role);
}

/**
 * Validates whether an assigner with role `assignerRole` is allowed to grant or revoke `targetRole`.
 *
 * Rules:
 * - SUPER_ADMIN can assign/revoke any role.
 * - ADMIN can assign/revoke ADMIN, COURSE_EDITOR, REVIEWER, STUDENT.
 * - ADMIN CANNOT grant or revoke SUPER_ADMIN (privilege ceiling).
 * - COURSE_EDITOR, REVIEWER, STUDENT cannot assign or revoke any roles.
 */
export function canRoleAssignTargetRole(assignerRole: Role, targetRole: Role): boolean {
  if (assignerRole === 'SUPER_ADMIN') {
    return true;
  }
  if (assignerRole === 'ADMIN') {
    return targetRole !== 'SUPER_ADMIN';
  }
  return false;
}
