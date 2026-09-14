/**
 * Contextual Retrieval Policy & Multi-Stage Ranking Adjuster for Mecha Bot.
 * Rejects global static authority hierarchies in favor of intent-aware contextual scoring.
 * Preserves evidence scopes, applies verification filters, and calculates match reasons.
 */

import { EvidenceScope, SourceAuthority } from '@mecha-bot/academic';
import type { MatchReason, RetrievalIntent, SearchDocument, SearchQuery } from './types.js';

export interface PolicyEvaluation {
  isEligible: boolean;
  exclusionReason?: string;
  contextualMultiplier: number;
  matchReasons: MatchReason[];
}

export class ContextualPolicyEngine {
  /**
   * Evaluate whether a document is eligible for retrieval under the given query filters
   * and compute its contextual relevance multiplier.
   */
  public evaluate(doc: SearchDocument, query: SearchQuery, hasLexicalMatch: boolean): PolicyEvaluation {
    const matchReasons: MatchReason[] = [];

    if (hasLexicalMatch) {
      matchReasons.push('LEXICAL_MATCH');
    }

    // 1. Permission Check
    if (!doc.canSearch) {
      return { isEligible: false, exclusionReason: 'CANNOT_SEARCH', contextualMultiplier: 0, matchReasons };
    }

    // 2. Verification Filtering
    // Rule: REJECTED content is NEVER returned under any circumstances
    if (doc.verificationStatus === 'REJECTED') {
      return { isEligible: false, exclusionReason: 'VERIFICATION_REJECTED', contextualMultiplier: 0, matchReasons };
    }

    // Rule: RAW content is excluded by default unless explicitly requested in verificationStatuses
    if (doc.verificationStatus === 'RAW') {
      const allowsRaw = query.verificationStatuses?.includes('RAW');
      if (!allowsRaw) {
        return { isEligible: false, exclusionReason: 'RAW_EXCLUDED_BY_DEFAULT', contextualMultiplier: 0, matchReasons };
      }
    }

    // Rule: CATALOGED content is allowed by default unless allowUnverifiedCataloged is explicitly false
    if (doc.verificationStatus === 'CATALOGED') {
      if (query.allowUnverifiedCataloged === false) {
        const explicitlyAllowsCataloged = query.verificationStatuses?.includes('CATALOGED');
        if (!explicitlyAllowsCataloged) {
          return { isEligible: false, exclusionReason: 'CATALOGED_EXCLUDED_BY_POLICY', contextualMultiplier: 0, matchReasons };
        }
      }
    }

    // Explicit verificationStatuses whitelist check if provided
    if (query.verificationStatuses && query.verificationStatuses.length > 0) {
      if (!query.verificationStatuses.includes(doc.verificationStatus)) {
        return { isEligible: false, exclusionReason: 'FILTERED_BY_VERIFICATION_STATUS', contextualMultiplier: 0, matchReasons };
      }
      matchReasons.push('VERIFICATION_FILTER_MATCH');
    }

    // 3. Course Code Filter & Cross-Course Leakage Protection
    if (query.courseCode) {
      const targetCourse = query.courseCode.trim().toUpperCase();
      const docCourse = doc.courseCode?.trim().toUpperCase();

      if (docCourse === targetCourse) {
        matchReasons.push('EXACT_COURSE_FILTER');
      } else {
        // Different or absent course code
        const allowRelated = query.allowRelatedCourses ?? false;
        if (!allowRelated) {
          return { isEligible: false, exclusionReason: 'COURSE_MISMATCH_EXCLUDED', contextualMultiplier: 0, matchReasons };
        }
      }
    }

    // 4. Topic Key Filter
    if (query.topicKey) {
      const targetTopic = query.topicKey.trim().toLowerCase();
      const hasTopic = doc.topicKeys.some((k) => k.trim().toLowerCase() === targetTopic);
      if (!hasTopic) {
        return { isEligible: false, exclusionReason: 'TOPIC_KEY_MISMATCH', contextualMultiplier: 0, matchReasons };
      }
      matchReasons.push('TOPIC_MATCH');
    }

    // 5. Document Type Whitelist Filter
    if (query.documentTypes && query.documentTypes.length > 0) {
      const normalizedTypes = query.documentTypes.map((t) => t.toUpperCase());
      if (!normalizedTypes.includes(doc.documentType.toUpperCase())) {
        return { isEligible: false, exclusionReason: 'DOCUMENT_TYPE_FILTERED', contextualMultiplier: 0, matchReasons };
      }
    }

    // 6. Academic Year Filter
    if (query.academicYear && doc.academicYear) {
      if (query.academicYear.trim() !== doc.academicYear.trim()) {
        return { isEligible: false, exclusionReason: 'ACADEMIC_YEAR_MISMATCH', contextualMultiplier: 0, matchReasons };
      }
    }

    // 7. Source Authority Whitelist Filter
    if (query.sourceAuthorities && query.sourceAuthorities.length > 0) {
      if (!query.sourceAuthorities.includes(doc.sourceAuthority)) {
        return { isEligible: false, exclusionReason: 'AUTHORITY_FILTERED', contextualMultiplier: 0, matchReasons };
      }
    }

    // 8. Evidence Scope Whitelist Filter
    if (query.evidenceScopes && query.evidenceScopes.length > 0) {
      if (!query.evidenceScopes.includes(doc.evidenceScope)) {
        return { isEligible: false, exclusionReason: 'EVIDENCE_SCOPE_FILTERED', contextualMultiplier: 0, matchReasons };
      }
    }

    // Compute Contextual Weight Multiplier based on Query Intent
    const multiplier = this.computeContextualMultiplier(doc, query, matchReasons);

    return {
      isEligible: true,
      contextualMultiplier: multiplier,
      matchReasons,
    };
  }

  /**
   * Intent-aware contextual multiplier calculation.
   * Modulates the lexical score dynamically rather than applying a global static authority penalty.
   */
  private computeContextualMultiplier(
    doc: SearchDocument,
    query: SearchQuery,
    matchReasons: MatchReason[]
  ): number {
    const intent: RetrievalIntent = query.intent ?? 'GENERAL_SEARCH';
    let multiplier = 1.0;

    switch (intent) {
      case 'EXAM_LOOKUP': {
        // High priority for past exams, quizzes, and verified exam records
        if (doc.documentType === 'PAST_EXAM') {
          multiplier *= 1.8;
          matchReasons.push('EXAM_INTENT_MATCH');
        } else if (doc.documentType === 'QUIZ') {
          multiplier *= 1.5;
          matchReasons.push('EXAM_INTENT_MATCH');
        } else if (doc.documentType === 'ASSIGNMENT') {
          multiplier *= 1.2;
        } else {
          // Lecture notes or textbooks get slight dampening when intent is specifically looking for exams
          multiplier *= 0.85;
        }

        if (doc.sourceAuthority === SourceAuthority.PAST_EXAM_VERIFIED) {
          multiplier *= 1.5;
          matchReasons.push('AUTHORITY_CONTEXT_MATCH');
        } else if (doc.sourceAuthority === SourceAuthority.LECTURER_CURRENT) {
          multiplier *= 1.2;
        }
        break;
      }

      case 'LECTURER_REQUIREMENTS': {
        // Highest priority for current lecturer notes and instructions
        if (doc.sourceAuthority === SourceAuthority.LECTURER_CURRENT) {
          multiplier *= 2.0;
          matchReasons.push('AUTHORITY_CONTEXT_MATCH');
        } else if (doc.sourceAuthority === SourceAuthority.OFFICIAL_DEPARTMENT) {
          multiplier *= 1.5;
        }

        if (doc.documentType === 'LECTURER_NOTE' || doc.documentType === 'LECTURE_SLIDES') {
          multiplier *= 1.3;
        }
        break;
      }

      case 'OFFICIAL_IDENTITY': {
        // Department and university official sources prioritized
        if (doc.sourceAuthority === SourceAuthority.OFFICIAL_DEPARTMENT) {
          multiplier *= 2.0;
          matchReasons.push('AUTHORITY_CONTEXT_MATCH');
        } else if (doc.sourceAuthority === SourceAuthority.OFFICIAL_UOB) {
          multiplier *= 1.6;
        }

        if (
          doc.documentType === 'OFFICIAL_PROGRAM' ||
          doc.documentType === 'OFFICIAL_SYLLABUS'
        ) {
          multiplier *= 1.5;
        }
        break;
      }

      case 'CONCEPT_EXPLANATION': {
        // Does NOT blindly prefer exams; prioritizes comprehensive notes, slides, and textbooks
        if (
          doc.documentType === 'LECTURER_NOTE' ||
          doc.documentType === 'LECTURE_SLIDES' ||
          doc.documentType === 'TEXTBOOK'
        ) {
          multiplier *= 1.35;
        }

        if (doc.sourceAuthority === SourceAuthority.LECTURER_CURRENT) {
          multiplier *= 1.3;
          matchReasons.push('AUTHORITY_CONTEXT_MATCH');
        } else if (doc.sourceAuthority === SourceAuthority.OPEN_ACADEMIC) {
          multiplier *= 1.2;
        }

        // Past exams are secondary for pure concept explanation
        if (doc.documentType === 'PAST_EXAM') {
          multiplier *= 0.9;
        }
        break;
      }

      case 'GENERAL_SEARCH':
      default: {
        // Balanced defaults
        if (doc.sourceAuthority === SourceAuthority.OFFICIAL_DEPARTMENT) {
          multiplier *= 1.3;
        } else if (doc.sourceAuthority === SourceAuthority.LECTURER_CURRENT) {
          multiplier *= 1.25;
        } else if (doc.sourceAuthority === SourceAuthority.PAST_EXAM_VERIFIED) {
          multiplier *= 1.2;
        }
        break;
      }
    }

    // Evidence scope adjustments
    if (doc.evidenceScope === EvidenceScope.EXACT_COURSE) {
      multiplier *= 1.2;
    } else if (
      doc.evidenceScope === EvidenceScope.SAME_UNIVERSITY_RELATED_COURSE ||
      doc.evidenceScope === EvidenceScope.SAME_DEPARTMENT_ARCHIVE
    ) {
      // Allowed cross-course material receives a modest discount to keep exact course primary
      multiplier *= 0.85;
    }

    // Verified content bonus
    if (doc.verificationStatus === 'VERIFIED') {
      multiplier *= 1.1;
    }

    return multiplier;
  }
}
