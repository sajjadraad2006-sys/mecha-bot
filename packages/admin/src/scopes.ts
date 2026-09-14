/**
 * Course and global scopes for role authorization.
 *
 * Course editors are scoped to specific course codes (e.g., MCT314, MCT324).
 * Super admins and Admins have global scope across all courses.
 */

export const SCOPE_KINDS = ['GLOBAL', 'COURSE'] as const;
export type ScopeKind = (typeof SCOPE_KINDS)[number];

export interface GlobalScope {
  kind: 'GLOBAL';
}

export interface CourseScope {
  kind: 'COURSE';
  courseCode: string;
}

export type AuthorizationScope = GlobalScope | CourseScope;

/**
 * Standard course code regex:
 * 2 to 6 uppercase letters followed by 3 to 4 digits, optional single suffix letter.
 * Examples: MCT111, MCT314, MATH101, EE201A.
 */
export const COURSE_CODE_REGEX = /^[A-Z]{2,6}[0-9]{3,4}[A-Z]?$/;

/**
 * Validates courseCode syntax strictly.
 */
export function isValidCourseCode(courseCode: string): boolean {
  if (!courseCode || typeof courseCode !== 'string') {
    return false;
  }
  return COURSE_CODE_REGEX.test(courseCode.trim());
}

/**
 * Normalizes courseCode (trimmed uppercase).
 */
export function normalizeCourseCode(courseCode: string): string {
  const trimmed = courseCode.trim().toUpperCase();
  if (!COURSE_CODE_REGEX.test(trimmed)) {
    throw new Error(`Invalid course code syntax: '${courseCode}'`);
  }
  return trimmed;
}

/**
 * Target resource for authorization checks.
 */
export interface AuthorizationResource {
  type: string;
  courseCode?: string | undefined;
  resourceKey?: string | undefined;
}
