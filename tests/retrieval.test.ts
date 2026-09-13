import { describe, it, expect } from 'vitest';
import { FakeRetrievalProvider } from '@mecha-bot/retrieval';
import { SourceAuthority } from '@mecha-bot/academic';

describe('Retrieval Foundation & Contextual Ranking', () => {
  it('filters retrieval snippets by courseId and respects limit', async () => {
    const provider = new FakeRetrievalProvider();
    const result = await provider.search({
      query: 'test query',
      courseId: 'course_test101',
      limit: 2,
    });

    expect(result.snippets.length).toBe(2);
    expect(result.snippets.every((s) => s.courseId === 'course_test101')).toBe(true);
  });

  it('ranks past exam snippet highest when intent is EXAM_LOOKUP', async () => {
    const provider = new FakeRetrievalProvider();
    const result = await provider.search({
      query: 'What was in the 2025 final exam?',
      courseId: 'course_test101',
      intent: 'EXAM_LOOKUP',
    });

    expect(result.snippets.length).toBeGreaterThan(0);
    expect(result.snippets[0]?.authority).toBe(SourceAuthority.PAST_EXAM_VERIFIED);
  });

  it('ranks official department snippet highest when intent is COURSE_IDENTITY', async () => {
    const provider = new FakeRetrievalProvider();
    const result = await provider.search({
      query: 'What is the official course title and syllabus for TEST101?',
      courseId: 'course_test101',
      intent: 'COURSE_IDENTITY',
    });

    expect(result.snippets.length).toBeGreaterThan(0);
    expect(result.snippets[0]?.authority).toBe(SourceAuthority.OFFICIAL_DEPARTMENT);
  });
});
