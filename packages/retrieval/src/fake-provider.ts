import {
  RetrievalProvider,
  RetrievalQuery,
  RetrievalResult,
  RetrievalSnippet,
} from './interfaces.js';
import { SourceAuthority, RetrievalPolicy, EvidenceScope } from '@mecha-bot/academic';

export class FakeRetrievalProvider implements RetrievalProvider {
  private snippets: RetrievalSnippet[] = [];

  constructor(initialSnippets: RetrievalSnippet[] = []) {
    if (initialSnippets.length > 0) {
      this.snippets = initialSnippets;
    } else {
      // Default synthetic snippets for TEST101
      this.snippets = [
        {
          sourceId: 'src_test101_official',
          sourceVersionId: 'ver_test101_1',
          courseId: 'course_test101',
          topicId: 'topic_test101_fnd',
          pageNumber: 5,
          snippet: 'Official department syllabus definitions for TEST101.',
          authority: SourceAuthority.OFFICIAL_DEPARTMENT,
          evidenceScope: EvidenceScope.EXACT_COURSE,
          score: 0.95,
        },
        {
          sourceId: 'src_test101_exam_2025',
          sourceVersionId: 'ver_test101_exam_1',
          courseId: 'course_test101',
          topicId: 'topic_test101_fnd',
          pageNumber: 1,
          snippet: 'Final Exam 2024-2025 Question 1 on test engineering foundations.',
          authority: SourceAuthority.PAST_EXAM_VERIFIED,
          evidenceScope: EvidenceScope.EXACT_COURSE,
          score: 0.9,
        },
        {
          sourceId: 'src_test101_lecturer_notes',
          sourceVersionId: 'ver_test101_lec_1',
          courseId: 'course_test101',
          topicId: 'topic_test101_fnd',
          pageNumber: 12,
          snippet: 'Current lecturer notes regarding project milestone expectations.',
          authority: SourceAuthority.LECTURER_CURRENT,
          evidenceScope: EvidenceScope.EXACT_COURSE,
          score: 0.88,
        },
        {
          sourceId: 'src_open_mech',
          sourceVersionId: 'ver_open_mech_1',
          courseId: 'course_test101',
          topicId: null,
          pageNumber: null,
          snippet: 'Open academic reference explaining PID tuning concepts.',
          authority: SourceAuthority.OPEN_ACADEMIC,
          evidenceScope: EvidenceScope.OPEN_ACADEMIC_EQUIVALENT,
          score: 0.7,
        },
      ];
    }
  }

  addSnippet(snippet: RetrievalSnippet): void {
    this.snippets.push(snippet);
  }

  async search(query: RetrievalQuery): Promise<RetrievalResult> {
    const intent = query.intent || 'GENERAL';
    const limit = query.limit || 10;

    let filtered = this.snippets;

    if (query.courseId) {
      filtered = filtered.filter((s) => s.courseId === query.courseId);
    }

    if (query.topicId) {
      filtered = filtered.filter((s) => s.topicId === query.topicId);
    }

    // Sort snippets based on intent-aware RetrievalPolicy and relevance score
    filtered = [...filtered].sort((a, b) => {
      const authComp = RetrievalPolicy.compare(a.authority, b.authority, intent);
      if (authComp !== 0) return authComp;
      return b.score - a.score;
    });

    const paginated = filtered.slice(0, limit);

    return {
      query: query.query,
      snippets: paginated,
      totalFound: filtered.length,
    };
  }
}
