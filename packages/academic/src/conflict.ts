import { SourceAuthority } from './authority.js';
import { EvidenceScope } from './evidence.js';

export interface AcademicConflictSide {
  claim: string;
  sourceTitle: string;
  sourceAuthority: SourceAuthority;
  evidenceScope: EvidenceScope;
  provenance: string;
}

export interface AcademicConflict {
  id: string;
  courseCode: string;
  fact: string;
  status: 'CONFLICTING';
  resolutionStatus: 'UNRESOLVED' | 'RESOLVED';
  sideA: AcademicConflictSide;
  sideB: AcademicConflictSide;
  notes?: string | undefined;
}
