import type { Role } from './roles.js';

export const ADMIN_PERMISSIONS = [
  'ADMIN_MANAGE',
  'ROLE_ASSIGN',
  'COURSE_VIEW',
  'COURSE_EDIT',
  'COURSE_PULSE_UPDATE',
  'SOURCE_SUBMIT',
  'SOURCE_REVIEW',
  'SOURCE_APPROVE',
  'ACADEMIC_EVENT_CREATE',
  'ACADEMIC_EVENT_REVIEW',
  'TIMETABLE_UPDATE',
  'QUIZ_MANAGE',
  'AUDIT_VIEW',
] as const;

export type AdminPermission = (typeof ADMIN_PERMISSIONS)[number];

/**
 * Permissions that can be scoped to specific courses when held by COURSE_EDITOR.
 */
export const COURSE_SCOPED_PERMISSIONS: readonly AdminPermission[] = [
  'COURSE_EDIT',
  'COURSE_PULSE_UPDATE',
  'TIMETABLE_UPDATE',
  'ACADEMIC_EVENT_CREATE',
] as const;

/**
 * Base capabilities mapped explicitly to each role.
 */
export const ROLE_PERMISSIONS: Record<Role, readonly AdminPermission[]> = {
  SUPER_ADMIN: [
    'ADMIN_MANAGE',
    'ROLE_ASSIGN',
    'COURSE_VIEW',
    'COURSE_EDIT',
    'COURSE_PULSE_UPDATE',
    'SOURCE_SUBMIT',
    'SOURCE_REVIEW',
    'SOURCE_APPROVE',
    'ACADEMIC_EVENT_CREATE',
    'ACADEMIC_EVENT_REVIEW',
    'TIMETABLE_UPDATE',
    'QUIZ_MANAGE',
    'AUDIT_VIEW',
  ],
  ADMIN: [
    'ADMIN_MANAGE',
    'ROLE_ASSIGN',
    'COURSE_VIEW',
    'COURSE_EDIT',
    'COURSE_PULSE_UPDATE',
    'SOURCE_SUBMIT',
    'SOURCE_REVIEW',
    'SOURCE_APPROVE',
    'ACADEMIC_EVENT_CREATE',
    'ACADEMIC_EVENT_REVIEW',
    'TIMETABLE_UPDATE',
    'QUIZ_MANAGE',
    'AUDIT_VIEW',
  ],
  COURSE_EDITOR: [
    'COURSE_VIEW',
    'COURSE_EDIT',
    'COURSE_PULSE_UPDATE',
    'TIMETABLE_UPDATE',
    'ACADEMIC_EVENT_CREATE',
    'SOURCE_SUBMIT',
  ],
  REVIEWER: [
    'COURSE_VIEW',
    'SOURCE_SUBMIT',
    'SOURCE_REVIEW',
    'SOURCE_APPROVE',
    'ACADEMIC_EVENT_REVIEW',
    'AUDIT_VIEW',
  ],
  STUDENT: ['COURSE_VIEW', 'SOURCE_SUBMIT'],
};

/**
 * Check if a permission name is valid.
 */
export function isAdminPermission(value: unknown): value is AdminPermission {
  return typeof value === 'string' && ADMIN_PERMISSIONS.includes(value as AdminPermission);
}

/**
 * Check if a role possesses the capability statically (before scope checks).
 */
export function roleHasCapability(role: Role, permission: AdminPermission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

/**
 * Check if a permission requires course scope when checked for COURSE_EDITOR.
 */
export function isCourseScopedPermission(permission: AdminPermission): boolean {
  return (COURSE_SCOPED_PERMISSIONS as readonly string[]).includes(permission);
}
