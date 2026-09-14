import { Stage, ProgramSemester } from './stage-semester.js';
import { CourseProfile } from './profile.js';
import { CuratedCourseAlias } from './topic.js';
import { normalizeGeneralText, normalizeTolerantArabic } from './normalization.js';

export type MatchType = 'EXACT_CODE' | 'EXACT_ALIAS' | 'NORMALIZED_ALIAS' | 'COURSE_NAME' | 'NONE';
export type ResolutionConfidence = 'CONFIRMED' | 'HIGH' | 'UNKNOWN';

export interface CourseResolutionQuery {
  query: string;
  stage?: Stage;
  programSemester?: ProgramSemester;
}

export interface CourseResolutionResult {
  query: string;
  normalizedQuery: string;
  candidateCourseCodes: string[];
  matchType: MatchType;
  confidenceCategory: ResolutionConfidence;
  needsClarification: boolean;
  clarificationReason?:
    'AMBIGUOUS_COURSE_ALIAS' | 'CONTEXT_MISMATCH' | 'NO_MATCH' | 'UNKNOWN_QUERY';
}

export class CourseResolver {
  private profilesByCode: Map<string, CourseProfile>;
  private aliases: CuratedCourseAlias[];

  constructor(profiles: CourseProfile[], aliases: CuratedCourseAlias[]) {
    this.profilesByCode = new Map();
    for (const p of profiles) {
      this.profilesByCode.set(p.courseCode.toUpperCase(), p);
    }
    this.aliases = aliases;
  }

  /**
   * Resolves a student query into candidate course codes using deterministic logic.
   */
  resolve(queryInput: CourseResolutionQuery | string): CourseResolutionResult {
    const queryObj: CourseResolutionQuery =
      typeof queryInput === 'string' ? { query: queryInput } : queryInput;

    const rawQuery = (queryObj.query || '').trim();
    const normQuery = normalizeGeneralText(rawQuery);

    if (!normQuery) {
      return {
        query: rawQuery,
        normalizedQuery: '',
        candidateCourseCodes: [],
        matchType: 'NONE',
        confidenceCategory: 'UNKNOWN',
        needsClarification: true,
        clarificationReason: 'UNKNOWN_QUERY',
      };
    }

    // 1. Check for exact course code (e.g. "MCT217", "mct 217", "MCT-217")
    const strippedCode = normQuery.replace(/[^a-z0-9]/gi, '').toUpperCase();
    if (this.profilesByCode.has(strippedCode)) {
      const profile = this.profilesByCode.get(strippedCode)!;
      return this.evaluateContextMatch(
        [profile.courseCode],
        queryObj,
        normQuery,
        'EXACT_CODE',
        'CONFIRMED',
      );
    }

    // Also check standard course codes directly
    for (const [code] of this.profilesByCode) {
      if (normQuery === normalizeGeneralText(code)) {
        return this.evaluateContextMatch([code], queryObj, normQuery, 'EXACT_CODE', 'CONFIRMED');
      }
    }

    // 2. Check curated aliases
    const candidateCodes = new Set<string>();
    let matchType: MatchType = 'NONE';

    for (const item of this.aliases) {
      const normAlias = normalizeGeneralText(item.alias);
      if (normQuery === normAlias || normQuery === item.normalizedAlias) {
        candidateCodes.add(item.courseCode);
        matchType = 'NORMALIZED_ALIAS';
      }
    }

    // Fallback: Check course display names
    if (candidateCodes.size === 0) {
      for (const [code, profile] of this.profilesByCode) {
        const normEn = normalizeGeneralText(profile.displayNames.en);
        const normAr = normalizeGeneralText(profile.displayNames.ar);
        if (normQuery === normEn || normQuery === normAr) {
          candidateCodes.add(code);
          matchType = 'COURSE_NAME';
        }
      }
    }

    // Fallback: Tolerant Arabic matching for search
    if (candidateCodes.size === 0) {
      const tolerantQuery = normalizeTolerantArabic(rawQuery);
      for (const item of this.aliases) {
        const tolerantAlias = normalizeTolerantArabic(item.alias);
        if (tolerantQuery === tolerantAlias) {
          candidateCodes.add(item.courseCode);
          matchType = 'NORMALIZED_ALIAS';
        }
      }
    }

    if (candidateCodes.size === 0) {
      return {
        query: rawQuery,
        normalizedQuery: normQuery,
        candidateCourseCodes: [],
        matchType: 'NONE',
        confidenceCategory: 'UNKNOWN',
        needsClarification: true,
        clarificationReason: 'NO_MATCH',
      };
    }

    const matchedList = Array.from(candidateCodes);
    return this.evaluateContextMatch(matchedList, queryObj, normQuery, matchType, 'HIGH');
  }

  private evaluateContextMatch(
    candidates: string[],
    queryObj: CourseResolutionQuery,
    normQuery: string,
    matchType: MatchType,
    initialConfidence: ResolutionConfidence,
  ): CourseResolutionResult {
    let filtered = [...candidates];

    // Filter by programSemester if provided
    if (queryObj.programSemester !== undefined) {
      filtered = filtered.filter((code) => {
        const p = this.profilesByCode.get(code.toUpperCase());
        if (!p) return false;
        if (p.programSemester === queryObj.programSemester) return true;
        if (p.programSemesters && p.programSemesters.includes(queryObj.programSemester!))
          return true;
        return false;
      });

      // Contradiction: The query matched a course, but caller specified an incompatible semester!
      if (filtered.length === 0 && candidates.length > 0) {
        return {
          query: queryObj.query,
          normalizedQuery: normQuery,
          candidateCourseCodes: [],
          matchType,
          confidenceCategory: 'UNKNOWN',
          needsClarification: true,
          clarificationReason: 'CONTEXT_MISMATCH',
        };
      }
    }

    // Filter by stage if provided and semester was not provided
    if (queryObj.stage !== undefined && queryObj.programSemester === undefined) {
      filtered = filtered.filter((code) => {
        const p = this.profilesByCode.get(code.toUpperCase());
        return p ? p.stage === queryObj.stage : false;
      });

      if (filtered.length === 0 && candidates.length > 0) {
        return {
          query: queryObj.query,
          normalizedQuery: normQuery,
          candidateCourseCodes: [],
          matchType,
          confidenceCategory: 'UNKNOWN',
          needsClarification: true,
          clarificationReason: 'CONTEXT_MISMATCH',
        };
      }
    }

    // Evaluate final result
    if (filtered.length === 1) {
      return {
        query: queryObj.query,
        normalizedQuery: normQuery,
        candidateCourseCodes: filtered,
        matchType,
        confidenceCategory: initialConfidence,
        needsClarification: false,
      };
    }

    if (filtered.length > 1) {
      return {
        query: queryObj.query,
        normalizedQuery: normQuery,
        candidateCourseCodes: filtered,
        matchType,
        confidenceCategory: initialConfidence,
        needsClarification: true,
        clarificationReason: 'AMBIGUOUS_COURSE_ALIAS',
      };
    }

    return {
      query: queryObj.query,
      normalizedQuery: normQuery,
      candidateCourseCodes: [],
      matchType: 'NONE',
      confidenceCategory: 'UNKNOWN',
      needsClarification: true,
      clarificationReason: 'NO_MATCH',
    };
  }
}
