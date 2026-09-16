import type { ConversationContext, ContextConfidence, AcademicScope } from './interfaces.js';

export interface UpdateContextOptions {
  activeCourseCode?: string | undefined;
  activeTopicKey?: string | undefined;
  activeSubtopicKey?: string | undefined;
  stage?: number | undefined;
  programSemester?: number | undefined;
  userMessage?: string | undefined;
  assistantMessage?: string | undefined;
  confidence?: ContextConfidence | undefined;
  compactSummary?: string | undefined;
}

export class ConversationContextManager {
  private contexts = new Map<string, ConversationContext>();
  private readonly ttlMs: number;
  private readonly maxRecentMessages: number;

  constructor(ttlMs = 30 * 60 * 1000, maxRecentMessages = 6) {
    this.ttlMs = ttlMs;
    this.maxRecentMessages = maxRecentMessages;
  }

  public getContext(studentKey: string): ConversationContext | null {
    const ctx = this.contexts.get(studentKey);
    if (!ctx) return null;

    const now = new Date().toISOString();
    if (now > ctx.expiresAt) {
      // Context expired (TTL)
      this.contexts.delete(studentKey);
      return null;
    }

    return ctx;
  }

  public getOrCreateContext(
    studentKey: string,
    initialScope?: Partial<AcademicScope> | undefined,
  ): ConversationContext {
    const existing = this.getContext(studentKey);
    if (existing) {
      // If explicit new course is provided and differs, update scope
      if (initialScope?.courseCode && initialScope.courseCode !== existing.activeCourseCode) {
        existing.activeCourseCode = initialScope.courseCode;
        existing.activeTopicKey = initialScope.topicKey ?? undefined;
        existing.contextConfidence = 'EXPLICIT';
        this.touch(existing);
      }
      return existing;
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.ttlMs).toISOString();

    const newContext: ConversationContext = {
      studentKey,
      stage: initialScope?.stage,
      programSemester: initialScope?.programSemester,
      activeCourseCode: initialScope?.courseCode,
      activeTopicKey: initialScope?.topicKey,
      recentMessages: [],
      contextConfidence: initialScope?.courseCode ? 'EXPLICIT' : 'INFERRED',
      updatedAt: now.toISOString(),
      expiresAt,
    };

    this.contexts.set(studentKey, newContext);
    return newContext;
  }

  public updateContext(studentKey: string, options: UpdateContextOptions): ConversationContext {
    const ctx = this.getOrCreateContext(studentKey);

    if (options.activeCourseCode !== undefined) {
      ctx.activeCourseCode = options.activeCourseCode;
    }
    if (options.activeTopicKey !== undefined) {
      ctx.activeTopicKey = options.activeTopicKey;
    }
    if (options.activeSubtopicKey !== undefined) {
      ctx.activeSubtopicKey = options.activeSubtopicKey;
    }
    if (options.stage !== undefined) {
      ctx.stage = options.stage;
    }
    if (options.programSemester !== undefined) {
      ctx.programSemester = options.programSemester;
    }
    if (options.confidence !== undefined) {
      ctx.contextConfidence = options.confidence;
    }
    if (options.compactSummary !== undefined) {
      ctx.compactSummary = options.compactSummary;
    }

    const nowIso = new Date().toISOString();

    if (options.userMessage) {
      ctx.recentMessages.push({
        role: 'user',
        text: options.userMessage,
        timestamp: nowIso,
      });
    }

    if (options.assistantMessage) {
      ctx.recentMessages.push({
        role: 'assistant',
        text: options.assistantMessage,
        timestamp: nowIso,
      });
    }

    // Bounded sliding window for recent messages (compaction)
    if (ctx.recentMessages.length > this.maxRecentMessages) {
      ctx.recentMessages = ctx.recentMessages.slice(-this.maxRecentMessages);
    }

    this.touch(ctx);
    return ctx;
  }

  /**
   * Evaluates if a query is attempting an explicit course switch,
   * a locked follow-up, or an ambiguous multi-course concept.
   */
  public resolveScope(
    studentKey: string,
    queryText: string,
    providedCourseCode?: string | undefined,
  ): {
    scope: AcademicScope | null;
    isLockedToExisting: boolean;
    isScopeTransition: boolean;
    isAmbiguous: boolean;
  } {
    const existing = this.getContext(studentKey);

    // 1. Explicit course mention in query (e.g. "MCT314", "MCT 312", "مادة التحكم")
    const courseCodeMatch = queryText.match(/\b(MCT\s*\d{3})\b/i);
    if (courseCodeMatch) {
      const explicitCode = courseCodeMatch[1]!.replace(/\s+/g, '').toUpperCase();
      const isScopeTransition = Boolean(
        existing?.activeCourseCode && existing.activeCourseCode !== explicitCode,
      );

      return {
        scope: {
          courseCode: explicitCode,
          stage: existing?.stage,
          programSemester: existing?.programSemester,
        },
        isLockedToExisting: false,
        isScopeTransition,
        isAmbiguous: false,
      };
    }

    // 2. Explicit provided course code from active session / screen
    if (providedCourseCode) {
      const isScopeTransition = Boolean(
        existing?.activeCourseCode &&
        existing.activeCourseCode !== providedCourseCode.toUpperCase(),
      );

      return {
        scope: {
          courseCode: providedCourseCode.toUpperCase(),
          topicKey:
            existing?.activeCourseCode === providedCourseCode.toUpperCase()
              ? existing.activeTopicKey
              : undefined,
          stage: existing?.stage,
          programSemester: existing?.programSemester,
        },
        isLockedToExisting: Boolean(
          existing?.activeCourseCode === providedCourseCode.toUpperCase(),
        ),
        isScopeTransition,
        isAmbiguous: false,
      };
    }

    // 3. Fall back to active context scope lock if student already in a course
    if (existing?.activeCourseCode) {
      return {
        scope: {
          courseCode: existing.activeCourseCode,
          topicKey: existing.activeTopicKey,
          stage: existing.stage,
          programSemester: existing.programSemester,
        },
        isLockedToExisting: true,
        isScopeTransition: false,
        isAmbiguous: false,
      };
    }

    // 4. No active course scope: question might be ambiguous
    return {
      scope: null,
      isLockedToExisting: false,
      isScopeTransition: false,
      isAmbiguous: true,
    };
  }

  public clearContext(studentKey: string): void {
    this.contexts.delete(studentKey);
  }

  private touch(ctx: ConversationContext): void {
    const now = new Date();
    ctx.updatedAt = now.toISOString();
    ctx.expiresAt = new Date(now.getTime() + this.ttlMs).toISOString();
  }
}
