import { deduplicateByContentHash } from './catalog.js';
import { evaluateDistributionPolicy } from './policy.js';
import type { AcademicFileRecord, DeliveryDecision, FileLookupCriteria } from './types.js';

/**
 * Deterministically ranks candidates based on quality, freshness, and relevance.
 * Note: This ranking is for file delivery candidate selection only; it does not
 * make subjective academic truth claims.
 */
export function rankCandidates(
  candidates: AcademicFileRecord[],
  criteria: FileLookupCriteria = {},
): AcademicFileRecord[] {
  return [...candidates].sort((a, b) => {
    // 1. Exact course code match preference if courseCode filter was requested
    if (criteria.courseCode) {
      const aCourseMatch =
        a.courseCode?.toUpperCase() === criteria.courseCode.toUpperCase() ? 1 : 0;
      const bCourseMatch =
        b.courseCode?.toUpperCase() === criteria.courseCode.toUpperCase() ? 1 : 0;
      if (aCourseMatch !== bCourseMatch) return bCourseMatch - aCourseMatch;
    }

    // 2. Verification status (VERIFIED > CATALOGED > RAW > REJECTED)
    const vRankA = getVerificationRank(a.verificationStatus);
    const vRankB = getVerificationRank(b.verificationStatus);
    if (vRankA !== vRankB) return vRankB - vRankA;

    // 3. Archive status (CURRENT > ARCHIVE > UNKNOWN)
    const aRankA = getArchiveRank(a.archiveStatus);
    const aRankB = getArchiveRank(b.archiveStatus);
    if (aRankA !== aRankB) return aRankB - aRankA;

    // 4. Distribution policy (ALLOWED over restricted/prohibited)
    const distA = evaluateDistributionPolicy(a).allowed ? 1 : 0;
    const distB = evaluateDistributionPolicy(b).allowed ? 1 : 0;
    if (distA !== distB) return distB - distA;

    // 5. Academic year match preference if specified
    if (criteria.academicYear) {
      const yearMatchA = a.academicYear === criteria.academicYear ? 1 : 0;
      const yearMatchB = b.academicYear === criteria.academicYear ? 1 : 0;
      if (yearMatchA !== yearMatchB) return yearMatchB - yearMatchA;
    }

    // 6. Recency of update (ISO string descending)
    if (a.updatedAt !== b.updatedAt) {
      return b.updatedAt.localeCompare(a.updatedAt);
    }

    // 7. Deterministic tie-breaker by ID ascending
    return a.id.localeCompare(b.id);
  });
}

function getVerificationRank(status: string): number {
  switch (status) {
    case 'VERIFIED':
      return 3;
    case 'CATALOGED':
      return 2;
    case 'RAW':
      return 1;
    default:
      return 0;
  }
}

function getArchiveRank(status: string): number {
  switch (status) {
    case 'CURRENT':
      return 2;
    case 'ARCHIVE':
      return 1;
    default:
      return 0;
  }
}

/**
 * Resolves a collection of candidate records into a deterministic DeliveryDecision.
 */
export function resolveDeliveryDecision(
  records: AcademicFileRecord[],
  criteria: FileLookupCriteria = {},
): DeliveryDecision {
  if (records.length === 0) {
    return {
      status: 'NOT_FOUND',
      reason: 'No files matching criteria were found in the catalog.',
    };
  }

  // 1. Deduplicate by content hash so identical files don't cause false selection ambiguity
  const uniqueCandidates = deduplicateByContentHash(records);

  // 2. Rank candidates deterministically
  const rankedCandidates = rankCandidates(uniqueCandidates, criteria);

  // 3. If multiple distinct candidates remain, ask for user selection
  if (rankedCandidates.length > 1) {
    return {
      status: 'NEEDS_SELECTION',
      candidates: rankedCandidates,
      reason: `Found ${rankedCandidates.length} matching files. User selection is required.`,
    };
  }

  const singleCandidate = rankedCandidates[0]!;

  // 4. Evaluate distribution policy on the single candidate
  const policyEval = evaluateDistributionPolicy(singleCandidate);
  if (!policyEval.allowed) {
    return {
      status: 'BLOCKED_POLICY',
      fileRecord: singleCandidate,
      policy: singleCandidate.distributionPolicy,
      reason: policyEval.reason,
    };
  }

  // 5. Inspect storage reference
  if (!singleCandidate.storageReference) {
    return {
      status: 'MISSING_STORAGE_REFERENCE',
      fileRecord: singleCandidate,
      reason: `File '${singleCandidate.id}' has no associated storage reference.`,
    };
  }

  const { kind, value } = singleCandidate.storageReference;

  if (kind === 'TELEGRAM_FILE_ID') {
    return {
      status: 'READY_TELEGRAM_FILE',
      fileRecord: singleCandidate,
      storageReference: singleCandidate.storageReference,
      reason: 'File has a valid Telegram file_id ready for dispatch.',
    };
  }

  if (kind === 'EXTERNAL_URL') {
    return {
      status: 'READY_EXTERNAL_LINK',
      fileRecord: singleCandidate,
      storageReference: singleCandidate.storageReference,
      externalUrl: value,
      reason: 'File is available via authorized external URL.',
    };
  }

  return {
    status: 'MISSING_STORAGE_REFERENCE',
    fileRecord: singleCandidate,
    reason: `Storage reference kind '${kind}' cannot be distributed directly.`,
  };
}
