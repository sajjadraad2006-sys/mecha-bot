import { isProhibitedUrl } from './schemas.js';
import type {
  AcademicFileRecord,
  DistributionPolicyRecord,
  DocumentType,
  SourceAuthority,
} from './types.js';

export interface DistributionEvaluation {
  allowed: boolean;
  canSearch: boolean;
  canQuote: boolean;
  reason: string;
}

/**
 * Evaluates whether an AcademicFileRecord may be distributed to a student.
 * Guarantees:
 * 1. Verification and distribution permission are strictly independent.
 * 2. Conservative default: UNKNOWN or RESTRICTED policy state blocks distribution.
 * 3. REJECTED files can never be distributed.
 * 4. External URLs are checked against legal/piracy domain restrictions.
 */
export function evaluateDistributionPolicy(record: AcademicFileRecord): DistributionEvaluation {
  const { distributionPolicy, verificationStatus, storageReference } = record;

  // 1. Rejected files are never distributable
  if (verificationStatus === 'REJECTED') {
    return {
      allowed: false,
      canSearch: false,
      canQuote: false,
      reason: 'File has been REJECTED by academic administration.',
    };
  }

  // 2. Policy state evaluation
  if (distributionPolicy.policyState === 'PROHIBITED') {
    return {
      allowed: false,
      canSearch: distributionPolicy.canSearch,
      canQuote: distributionPolicy.canQuote,
      reason:
        distributionPolicy.reason ??
        'Distribution is strictly PROHIBITED for this resource (e.g. copyrighted or sensitive material).',
    };
  }

  if (distributionPolicy.policyState === 'RESTRICTED') {
    return {
      allowed: false,
      canSearch: distributionPolicy.canSearch,
      canQuote: distributionPolicy.canQuote,
      reason:
        distributionPolicy.reason ??
        'Distribution is RESTRICTED (resource may be searchable/quotable for internal reference only).',
    };
  }

  if (distributionPolicy.policyState === 'UNKNOWN') {
    return {
      allowed: false,
      canSearch: distributionPolicy.canSearch,
      canQuote: false,
      reason:
        'Distribution rights are UNKNOWN. Conservative policy blocks delivery until confirmed by faculty.',
    };
  }

  // 3. Allowed policy state: verify canDistribute flag
  if (!distributionPolicy.canDistribute) {
    return {
      allowed: false,
      canSearch: distributionPolicy.canSearch,
      canQuote: distributionPolicy.canQuote,
      reason: 'Policy record explicitly flags canDistribute as false.',
    };
  }

  // 4. If storage reference is an external URL, verify it is not a piracy link
  if (storageReference && storageReference.kind === 'EXTERNAL_URL') {
    if (isProhibitedUrl(storageReference.value)) {
      return {
        allowed: false,
        canSearch: false,
        canQuote: false,
        reason: 'External URL points to an unauthorized or illegal distribution repository.',
      };
    }
  }

  return {
    allowed: true,
    canSearch: distributionPolicy.canSearch,
    canQuote: distributionPolicy.canQuote,
    reason: 'File distribution is fully ALLOWED.',
  };
}

/**
 * Determines whether a file is visible to a specific student requester.
 * Enforces privacy boundaries:
 * - GLOBAL: visible to all
 * - COURSE_SHARED: visible to all within course lookup
 * - PRIVATE_STUDENT: visible ONLY to the student matching studentKey
 */
export function isFileVisibleToStudent(
  record: AcademicFileRecord,
  requesterStudentKey?: string,
): boolean {
  if (record.visibility === 'GLOBAL' || record.visibility === 'COURSE_SHARED') {
    return true;
  }

  if (record.visibility === 'PRIVATE_STUDENT') {
    if (!requesterStudentKey) {
      return false;
    }
    return record.studentKey === requesterStudentKey;
  }

  return false;
}

/**
 * Returns conservative baseline policy defaults based on document type and source authority.
 * Never grants distribution permission merely based on a filename.
 */
export function getBaselinePolicyForType(
  type: DocumentType,
  authority: SourceAuthority,
): DistributionPolicyRecord {
  switch (type) {
    case 'TEXTBOOK':
      // Commercial textbooks: metadata can be searched/bibliographic, but distribution prohibited
      return {
        canSearch: true,
        canQuote: false,
        canDistribute: false,
        policyState: 'RESTRICTED',
        reason: 'Commercial textbook: metadata searchable, distribution restricted.',
      };

    case 'SOLUTION_MANUAL':
      // Solution manuals: strictly prohibited by default
      return {
        canSearch: false,
        canQuote: false,
        canDistribute: false,
        policyState: 'PROHIBITED',
        reason: 'Solution manuals are prohibited from general distribution.',
      };

    case 'LECTURER_NOTE':
    case 'LECTURE_SLIDES':
      if (authority === 'OFFICIAL' || authority === 'FACULTY') {
        return {
          canSearch: true,
          canQuote: true,
          canDistribute: true,
          policyState: 'ALLOWED',
          reason: 'Official faculty notes authorized for student distribution.',
        };
      }
      return {
        canSearch: true,
        canQuote: false,
        canDistribute: false,
        policyState: 'UNKNOWN',
        reason: 'Unverified source for lecture note requires authorization.',
      };

    case 'PAST_EXAM':
    case 'QUIZ':
    case 'ASSIGNMENT':
      if (authority === 'OFFICIAL' || authority === 'FACULTY') {
        return {
          canSearch: true,
          canQuote: true,
          canDistribute: true,
          policyState: 'ALLOWED',
          reason: 'Authorized departmental past evaluation material.',
        };
      }
      return {
        canSearch: true,
        canQuote: false,
        canDistribute: false,
        policyState: 'UNKNOWN',
        reason: 'Student-shared past exam requires catalog verification.',
      };

    case 'STUDENT_NOTE':
      // Student notes are not automatically redistributable across the department without review
      return {
        canSearch: true,
        canQuote: false,
        canDistribute: false,
        policyState: 'UNKNOWN',
        reason: 'Student-authored note requires explicit verification before sharing.',
      };

    default:
      return {
        canSearch: false,
        canQuote: false,
        canDistribute: false,
        policyState: 'UNKNOWN',
        reason: 'Unknown document classification default conservative policy.',
      };
  }
}
