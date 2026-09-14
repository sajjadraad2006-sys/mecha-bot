/**
 * Bridge F: Admin Moderation (M11) -> Academic Evidence Safety (M2/M12)
 *
 * Enforces strict semantic independence:
 * ADMIN APPROVED != ACADEMICALLY VERIFIED
 *
 * An administrative workflow item reaching status APPROVED indicates acceptance
 * into the application workflow, but does NOT grant or mutate:
 * - sourceAuthority (e.g., STUDENT never becomes FACULTY or OFFICIAL solely via workflow approval)
 * - verificationStatus (e.g., RAW or CATALOGED never becomes VERIFIED without academic verification)
 * - evidenceScope (e.g., RELATED never becomes EXACT_COURSE)
 */

import {
  type AdminService,
  type DecideReviewParams,
  REVIEW_EVIDENCE_SEMANTICS_DISCLAIMER,
  type ReviewItem,
} from '@mecha-bot/admin';
import type { AdminReviewDecisionResult } from '../types.js';

export interface AcademicEvidenceMetadata {
  sourceAuthority: string;
  verificationStatus: string;
  evidenceScope?: string | undefined;
}

/**
 * Asserts that an administrative review decision does not mutate or promote
 * academic evidence metadata to a stronger academic state.
 *
 * Throws an error if any promotion is attempted.
 */
export function assertAdminApprovalDoesNotMutateAcademicEvidence(
  originalEvidence: AcademicEvidenceMetadata,
  targetEvidence: AcademicEvidenceMetadata,
): void {
  // 1. sourceAuthority promotion guard
  if (
    originalEvidence.sourceAuthority === 'STUDENT' &&
    (targetEvidence.sourceAuthority === 'FACULTY' || targetEvidence.sourceAuthority === 'OFFICIAL')
  ) {
    throw new Error(
      `ADMIN_SEMANTIC_SAFETY_VIOLATION: Admin workflow approval cannot mutate sourceAuthority from '${originalEvidence.sourceAuthority}' to '${targetEvidence.sourceAuthority}'.`,
    );
  }

  // 2. verificationStatus promotion guard
  if (
    originalEvidence.verificationStatus !== 'VERIFIED' &&
    targetEvidence.verificationStatus === 'VERIFIED'
  ) {
    throw new Error(
      `ADMIN_SEMANTIC_SAFETY_VIOLATION: Admin workflow approval cannot promote verificationStatus from '${originalEvidence.verificationStatus}' to 'VERIFIED'. Academic evidence status is independent of workflow state.`,
    );
  }

  // 3. evidenceScope promotion guard
  if (
    originalEvidence.evidenceScope &&
    originalEvidence.evidenceScope !== 'EXACT_COURSE' &&
    targetEvidence.evidenceScope === 'EXACT_COURSE'
  ) {
    throw new Error(
      `ADMIN_SEMANTIC_SAFETY_VIOLATION: Admin workflow approval cannot elevate evidenceScope from '${originalEvidence.evidenceScope}' to 'EXACT_COURSE'.`,
    );
  }
}

/**
 * Executes an administrative review decision through AdminService while
 * validating and enforcing academic semantic safety invariants.
 */
export async function executeAdminReviewDecisionSafely(
  adminService: AdminService,
  callerKey: string,
  params: DecideReviewParams,
  academicEvidence?: {
    original: AcademicEvidenceMetadata;
    targetCandidate?: AcademicEvidenceMetadata | undefined;
  },
): Promise<AdminReviewDecisionResult> {
  const decidedItem: ReviewItem = await adminService.decideReviewItem(callerKey, params);

  // If candidate target evidence is provided, assert safety
  if (academicEvidence?.targetCandidate) {
    assertAdminApprovalDoesNotMutateAcademicEvidence(
      academicEvidence.original,
      academicEvidence.targetCandidate,
    );
  }

  return {
    reviewItem: decidedItem,
    academicEvidencePreserved: true,
    disclaimer: REVIEW_EVIDENCE_SEMANTICS_DISCLAIMER,
  };
}
