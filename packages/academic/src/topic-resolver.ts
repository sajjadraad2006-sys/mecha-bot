import { AcademicTopic, AcademicFactStatus, TopicAlias } from './topic.js';
import { normalizeGeneralText, normalizeTolerantArabic } from './normalization.js';

export interface TopicResolutionResult {
  courseCode: string;
  query: string;
  topic: AcademicTopic | null;
  matchSource: 'EXACT_NAME' | 'NORMALIZED_NAME' | 'ALIAS' | 'SUBTOPIC' | 'NONE';
  needsClarification: boolean;
  status: AcademicFactStatus;
}

export class TopicResolver {
  private topicsByCourse: Map<string, AcademicTopic[]>;
  private aliasesByCourse: Map<string, TopicAlias[]>;

  constructor(topics: AcademicTopic[], aliases: TopicAlias[] = []) {
    this.topicsByCourse = new Map();
    for (const t of topics) {
      const c = t.courseCode.toUpperCase();
      if (!this.topicsByCourse.has(c)) {
        this.topicsByCourse.set(c, []);
      }
      this.topicsByCourse.get(c)!.push(t);
    }

    this.aliasesByCourse = new Map();
    for (const a of aliases) {
      const c = a.courseCode.toUpperCase();
      if (!this.aliasesByCourse.has(c)) {
        this.aliasesByCourse.set(c, []);
      }
      this.aliasesByCourse.get(c)!.push(a);
    }
  }

  /**
   * Deterministically resolves a topic for a specific course.
   * If the course has no topic map, safely returns UNKNOWN.
   */
  resolve(courseCode: string, query: string): TopicResolutionResult {
    const rawQuery = (query || '').trim();
    const normQuery = normalizeGeneralText(rawQuery);
    const upperCode = courseCode.toUpperCase();

    const courseTopics = this.topicsByCourse.get(upperCode) || [];
    if (courseTopics.length === 0 || !normQuery) {
      return {
        courseCode,
        query: rawQuery,
        topic: null,
        matchSource: 'NONE',
        needsClarification: false,
        status: 'UNKNOWN',
      };
    }

    // 1. Direct name match (titleEn / titleAr)
    for (const topic of courseTopics) {
      if (
        topic.titleEn.toLowerCase() === rawQuery.toLowerCase() ||
        (topic.titleAr && topic.titleAr.trim() === rawQuery)
      ) {
        return {
          courseCode,
          query: rawQuery,
          topic,
          matchSource: 'EXACT_NAME',
          needsClarification: false,
          status: topic.status,
        };
      }
    }

    // 2. Normalized name match
    for (const topic of courseTopics) {
      const normEn = normalizeGeneralText(topic.titleEn);
      const normAr = topic.titleAr ? normalizeGeneralText(topic.titleAr) : '';
      if (normQuery === normEn || (normAr && normQuery === normAr)) {
        return {
          courseCode,
          query: rawQuery,
          topic,
          matchSource: 'NORMALIZED_NAME',
          needsClarification: false,
          status: topic.status,
        };
      }
    }

    // 3. Topic aliases match
    const courseAliases = this.aliasesByCourse.get(upperCode) || [];
    for (const item of courseAliases) {
      const normAlias = normalizeGeneralText(item.alias);
      if (normQuery === normAlias || normQuery === item.normalizedAlias) {
        const matchedTopic = courseTopics.find((t) => t.topicKey === item.topicKey);
        if (matchedTopic) {
          return {
            courseCode,
            query: rawQuery,
            topic: matchedTopic,
            matchSource: 'ALIAS',
            needsClarification: false,
            status: matchedTopic.status,
          };
        }
      }
    }

    // 4. Subtopic match
    for (const topic of courseTopics) {
      if (topic.subtopics) {
        for (const sub of topic.subtopics) {
          const normSubEn = normalizeGeneralText(sub.titleEn);
          const normSubAr = sub.titleAr ? normalizeGeneralText(sub.titleAr) : '';
          if (normQuery === normSubEn || (normSubAr && normQuery === normSubAr)) {
            return {
              courseCode,
              query: rawQuery,
              topic,
              matchSource: 'SUBTOPIC',
              needsClarification: false,
              status: sub.status,
            };
          }
        }
      }
    }

    // 5. Tolerant Arabic match fallback
    const tolerantQuery = normalizeTolerantArabic(rawQuery);
    for (const topic of courseTopics) {
      if (topic.titleAr) {
        const tolerantAr = normalizeTolerantArabic(topic.titleAr);
        if (tolerantQuery === tolerantAr) {
          return {
            courseCode,
            query: rawQuery,
            topic,
            matchSource: 'NORMALIZED_NAME',
            needsClarification: false,
            status: topic.status,
          };
        }
      }
    }

    // Unmatched
    return {
      courseCode,
      query: rawQuery,
      topic: null,
      matchSource: 'NONE',
      needsClarification: false,
      status: 'UNKNOWN',
    };
  }
}
