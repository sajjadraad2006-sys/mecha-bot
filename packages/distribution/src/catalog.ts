import { validateAcademicFileRecord } from './schemas.js';
import type { AcademicFileRecord } from './types.js';

/**
 * Deduplicates a list of file records by contentHash.
 * Preserves the highest-quality candidate:
 * 1. VERIFIED > CATALOGED > RAW > REJECTED
 * 2. CURRENT > ARCHIVE > UNKNOWN
 * 3. Most recently updated
 */
export function deduplicateByContentHash(records: AcademicFileRecord[]): AcademicFileRecord[] {
  const seenHashes = new Map<string, AcademicFileRecord>();
  const results: AcademicFileRecord[] = [];

  for (const record of records) {
    if (!record.contentHash) {
      results.push(record);
      continue;
    }

    const existing = seenHashes.get(record.contentHash);
    if (!existing) {
      seenHashes.set(record.contentHash, record);
      results.push(record);
    } else {
      // Compare quality to keep the best one
      if (shouldReplaceWithBetterRecord(existing, record)) {
        // Replace in results
        const idx = results.indexOf(existing);
        if (idx !== -1) {
          results[idx] = record;
        }
        seenHashes.set(record.contentHash, record);
      }
    }
  }

  return results;
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

function shouldReplaceWithBetterRecord(
  current: AcademicFileRecord,
  candidate: AcademicFileRecord,
): boolean {
  const vCurrent = getVerificationRank(current.verificationStatus);
  const vCandidate = getVerificationRank(candidate.verificationStatus);
  if (vCandidate > vCurrent) return true;
  if (vCandidate < vCurrent) return false;

  const aCurrent = getArchiveRank(current.archiveStatus);
  const aCandidate = getArchiveRank(candidate.archiveStatus);
  if (aCandidate > aCurrent) return true;
  if (aCandidate < aCurrent) return false;

  return candidate.updatedAt > current.updatedAt;
}

/**
 * Marks a record as superseded by a newer version.
 * Switches archiveStatus to ARCHIVE and sets supersedes/supersededBy reference.
 */
export function markFileSuperseded(
  record: AcademicFileRecord,
  supersedingFileId: string,
  updatedAtIso: string,
): AcademicFileRecord {
  const updated: AcademicFileRecord = {
    ...record,
    archiveStatus: 'ARCHIVE',
    updatedAt: updatedAtIso,
    notes: record.notes
      ? `${record.notes}; Superseded by ${supersedingFileId}`
      : `Superseded by ${supersedingFileId}`,
  };

  const validation = validateAcademicFileRecord(updated);
  if (!validation.valid) {
    throw new Error(`Failed to mark record superseded: ${validation.errors?.join(', ')}`);
  }

  return validation.data!;
}
