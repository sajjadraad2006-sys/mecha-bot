export enum SourceAuthority {
  OFFICIAL_DEPARTMENT = 'OFFICIAL_DEPARTMENT',
  LECTURER_CURRENT = 'LECTURER_CURRENT',
  OFFICIAL_UOB = 'OFFICIAL_UOB',
  PAST_EXAM_VERIFIED = 'PAST_EXAM_VERIFIED',
  OPEN_ACADEMIC = 'OPEN_ACADEMIC',
  STUDENT_SUBMITTED = 'STUDENT_SUBMITTED',
  UNVERIFIED = 'UNVERIFIED',
}

export type RetrievalIntent =
  'EXAM_LOOKUP' | 'LECTURER_REQUIREMENTS' | 'COURSE_IDENTITY' | 'CONCEPT_EXPLANATION' | 'GENERAL';

/**
 * Contextual Retrieval Policy.
 * Ranks sources dynamically based on query intent rather than a global static hierarchy.
 */
export class RetrievalPolicy {
  /**
   * Returns prioritized source authorities for a given query intent.
   */
  static getPriorityList(intent: RetrievalIntent): SourceAuthority[] {
    switch (intent) {
      case 'EXAM_LOOKUP':
        return [
          SourceAuthority.PAST_EXAM_VERIFIED,
          SourceAuthority.LECTURER_CURRENT,
          SourceAuthority.OFFICIAL_DEPARTMENT,
          SourceAuthority.OFFICIAL_UOB,
          SourceAuthority.OPEN_ACADEMIC,
          SourceAuthority.STUDENT_SUBMITTED,
          SourceAuthority.UNVERIFIED,
        ];
      case 'LECTURER_REQUIREMENTS':
        return [
          SourceAuthority.LECTURER_CURRENT,
          SourceAuthority.OFFICIAL_DEPARTMENT,
          SourceAuthority.OFFICIAL_UOB,
          SourceAuthority.PAST_EXAM_VERIFIED,
          SourceAuthority.OPEN_ACADEMIC,
          SourceAuthority.STUDENT_SUBMITTED,
          SourceAuthority.UNVERIFIED,
        ];
      case 'COURSE_IDENTITY':
        return [
          SourceAuthority.OFFICIAL_DEPARTMENT,
          SourceAuthority.OFFICIAL_UOB,
          SourceAuthority.LECTURER_CURRENT,
          SourceAuthority.PAST_EXAM_VERIFIED,
          SourceAuthority.OPEN_ACADEMIC,
          SourceAuthority.STUDENT_SUBMITTED,
          SourceAuthority.UNVERIFIED,
        ];
      case 'CONCEPT_EXPLANATION':
        return [
          SourceAuthority.LECTURER_CURRENT,
          SourceAuthority.OFFICIAL_DEPARTMENT,
          SourceAuthority.OPEN_ACADEMIC,
          SourceAuthority.OFFICIAL_UOB,
          SourceAuthority.PAST_EXAM_VERIFIED,
          SourceAuthority.STUDENT_SUBMITTED,
          SourceAuthority.UNVERIFIED,
        ];
      case 'GENERAL':
      default:
        return [
          SourceAuthority.OFFICIAL_DEPARTMENT,
          SourceAuthority.LECTURER_CURRENT,
          SourceAuthority.OFFICIAL_UOB,
          SourceAuthority.PAST_EXAM_VERIFIED,
          SourceAuthority.OPEN_ACADEMIC,
          SourceAuthority.STUDENT_SUBMITTED,
          SourceAuthority.UNVERIFIED,
        ];
    }
  }

  /**
   * Compares two authorities within the context of an intent.
   * Returns negative if 'a' has higher priority than 'b', positive if lower, 0 if equal.
   */
  static compare(
    a: SourceAuthority,
    b: SourceAuthority,
    intent: RetrievalIntent = 'GENERAL',
  ): number {
    const priority = this.getPriorityList(intent);
    const indexA = priority.indexOf(a);
    const indexB = priority.indexOf(b);
    return indexA - indexB;
  }
}
