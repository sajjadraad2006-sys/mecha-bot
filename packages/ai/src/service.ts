import type {
  AcademicScope,
  AiBrainCitation,
  AiBrainRequest,
  AiBrainResponse,
} from './interfaces.js';
import { AcademicResponseSchema } from './schemas.js';
import { AiInvocationGate } from './gate.js';
import { BudgetManager } from './budget.js';
import { ConversationContextManager } from './context.js';
import { AcademicGroundingEngine } from './grounding.js';
import { PromptEngine } from './prompt-engine.js';
import { AIRouter } from './router.js';
import { ModelHealthRegistry } from './model-registry.js';
import type { SearchEngine } from '@mecha-bot/search';
import { ProviderError } from '@mecha-bot/shared';

export interface AiBrainServiceDeps {
  router: AIRouter;
  searchEngine?: SearchEngine | undefined;
  gate?: AiInvocationGate | undefined;
  budgetManager?: BudgetManager | undefined;
  contextManager?: ConversationContextManager | undefined;
  groundingEngine?: AcademicGroundingEngine | undefined;
  promptEngine?: PromptEngine | undefined;
  healthRegistry?: ModelHealthRegistry | undefined;
}

export class AiBrainService {
  private router: AIRouter;
  private gate: AiInvocationGate;
  private budgetManager: BudgetManager;
  private contextManager: ConversationContextManager;
  private groundingEngine: AcademicGroundingEngine;
  private promptEngine: PromptEngine;
  private healthRegistry: ModelHealthRegistry;

  constructor(deps: AiBrainServiceDeps) {
    this.router = deps.router;
    this.gate = deps.gate ?? new AiInvocationGate();
    this.budgetManager = deps.budgetManager ?? deps.router.getBudgetManager();
    this.contextManager = deps.contextManager ?? new ConversationContextManager();
    this.groundingEngine = deps.groundingEngine ?? new AcademicGroundingEngine(deps.searchEngine);
    this.promptEngine = deps.promptEngine ?? new PromptEngine();
    this.healthRegistry = deps.healthRegistry ?? deps.router.getHealthRegistry();
  }

  public getContextManager(): ConversationContextManager {
    return this.contextManager;
  }

  public getBudgetManager(): BudgetManager {
    return this.budgetManager;
  }

  public getGate(): AiInvocationGate {
    return this.gate;
  }

  /**
   * Main query entry point for student questions.
   */
  public async answerQuestion(request: AiBrainRequest): Promise<AiBrainResponse> {
    const { studentKey, question, activeCourseCode, activeTopicKey, stage, programSemester } =
      request;

    // 1. Evaluate Invocation Gate
    const gateDecision = this.gate.evaluate(question, activeCourseCode);
    if (!gateDecision.shouldInvokeAi) {
      return {
        intent: 'OUT_OF_SCOPE',
        courseCode: activeCourseCode ?? null,
        topic: activeTopicKey ?? null,
        answer: 'عذراً، هذا السؤال لا يتطلب تحليلاً أكاديمياً ذكياً أو يخص الأوامر المباشرة للبوت.',
        equations: [],
        citations: [],
        confidence: 'LOW',
        assumptions: [],
        needsClarification: false,
        usedFallback: false,
      };
    }

    // 2. Check Zero-Cost Budget Guard
    if (!this.budgetManager.canInvokeAi() || this.healthRegistry.isGlobalQuotaExhausted()) {
      return this.buildQuotaExhaustedResponse(activeCourseCode, activeTopicKey);
    }

    // 3. Resolve Academic Scope Lock
    const scopeResolution = this.contextManager.resolveScope(
      studentKey,
      question,
      activeCourseCode,
    );

    const resolvedScope: AcademicScope | null = scopeResolution.scope;

    // If ambiguous (e.g. concept without course context), ask clarification
    if (scopeResolution.isAmbiguous || !resolvedScope) {
      return {
        intent: 'CLARIFICATION_NEEDED',
        courseCode: null,
        topic: null,
        answer:
          'سؤالك ممتاز، بس حتى أجاوبك بدقة هندسية: تقصد هذا الموضوع لأي مادة؟ أو بيا مقرر جاي تدرس هاي الفكرة؟',
        equations: [],
        citations: [],
        confidence: 'LOW',
        assumptions: [],
        needsClarification: true,
        clarificationPrompt: 'يرجى تحديد المادة الأكاديمية المطلوبة',
        suggestedClarifications: ['MCT314 - السيطرة', 'MCT211 - المكائن', 'MCT312 - الإلكترونيات'],
        usedFallback: false,
      };
    }

    // Populate stage / semester if missing
    if (!resolvedScope.stage && stage) resolvedScope.stage = stage;
    if (!resolvedScope.programSemester && programSemester) {
      resolvedScope.programSemester = programSemester;
    }
    if (!resolvedScope.topicKey && activeTopicKey) {
      resolvedScope.topicKey = activeTopicKey;
    }

    // 4. Retrieve Grounded Evidence from M7
    const grounding = await this.groundingEngine.retrieveGroundedEvidence(question, resolvedScope);

    // 5. Build Injection-Isolated Prompt
    const context = this.contextManager.getContext(studentKey);
    const effectiveTaskType = request.taskType ?? gateDecision.taskType;
    const prompt = this.promptEngine.buildPrompt({
      question,
      scope: resolvedScope,
      excerpts: grounding.excerpts,
      context: context ?? undefined,
      taskType: effectiveTaskType,
    });

    // 6. Generate via Model Router & Provider with Failover
    try {
      const { result, modelId } = await this.router.generateStructured(
        prompt,
        AcademicResponseSchema,
        {
          taskType: effectiveTaskType,
        },
      );

      // 7. Enforce Domain Invariants on Response
      let disclaimer = result.disclaimer;
      if (resolvedScope.courseCode === 'MCT124') {
        disclaimer =
          'ملاحظة أكاديمية: مادة MCT124 تخضع لتضارب منهجي معتمد (CONFLICTING). المعلومات المعروضة استرشادية فقط.';
      } else if (resolvedScope.courseCode === 'P4MCT') {
        disclaimer =
          'ملاحظة أكاديمية: مادة P4MCT معرفة في السجل فقط (IDENTITY_ONLY) دون خريطة مواضيع رسمية.';
      }

      // Check for low grounding
      let finalAnswer = result.answer;
      if (!grounding.hasSufficientEvidence && result.confidence === 'LOW') {
        if (!finalAnswer.includes('ما عندي مصدر كافي')) {
          finalAnswer = `ما عندي مصدر كافي حتى أتأكد من هاي النقطة، بس كفكرة هندسية عامة:\n\n${finalAnswer}`;
        }
      }

      // 8. Update Conversation Context
      this.contextManager.updateContext(studentKey, {
        activeCourseCode: resolvedScope.courseCode,
        activeTopicKey: resolvedScope.topicKey,
        stage: resolvedScope.stage,
        programSemester: resolvedScope.programSemester,
        userMessage: question,
        assistantMessage: finalAnswer,
        confidence: result.needsClarification ? 'AMBIGUOUS' : 'EXPLICIT',
      });

      const citations: AiBrainCitation[] = (result.sourceRefs ?? []).map((s) => ({
        sourceId: s.sourceId,
        title: s.title,
        page: s.page ?? undefined,
        chunkId: s.chunkId ?? undefined,
        authority: s.authority ?? undefined,
      }));

      return {
        intent: result.intent,
        courseCode: result.courseCode ?? resolvedScope.courseCode,
        topic: result.topic ?? resolvedScope.topicKey ?? null,
        answer: finalAnswer,
        equations: result.equations ?? [],
        citations,
        confidence: result.confidence,
        assumptions: result.assumptions ?? [],
        needsClarification: Boolean(result.needsClarification),
        clarificationPrompt: result.clarificationPrompt ?? undefined,
        suggestedClarifications: result.suggestedClarifications ?? [],
        disclaimer: disclaimer ?? undefined,
        usedFallback: false,
        modelUsed: modelId ?? undefined,
      };
    } catch (err: unknown) {
      // Check if quota error 3036
      const errObj = err as { code?: number };
      if (errObj.code === 3036 || (err instanceof ProviderError && err.message.includes('3036'))) {
        return this.buildQuotaExhaustedResponse(resolvedScope.courseCode, resolvedScope.topicKey);
      }

      // Graceful fallback response in natural Iraqi Arabic
      const fallbackCitations: AiBrainCitation[] = grounding.excerpts.map((e) => ({
        sourceId: e.sourceId,
        title: e.title,
        page: e.page ?? undefined,
        chunkId: e.chunkId ?? undefined,
        authority: e.authority ?? undefined,
      }));

      return {
        intent: 'GENERAL',
        courseCode: resolvedScope.courseCode,
        topic: resolvedScope.topicKey ?? null,
        answer:
          'واجهت صعوبة مؤقتة في معالجة هذا السؤال عبر المساعد الذكي. تكدر تعيد صياغة السؤال أو تبحث في قائمة المصادر والملفات المباشرة للمادة.',
        equations: [],
        citations: fallbackCitations,
        confidence: 'LOW',
        assumptions: [],
        needsClarification: false,
        usedFallback: true,
      };
    }
  }

  private buildQuotaExhaustedResponse(
    courseCode?: string | undefined,
    topic?: string | undefined,
  ): AiBrainResponse {
    return {
      intent: 'GENERAL',
      courseCode: courseCode ?? null,
      topic: topic ?? null,
      answer:
        'حالياً المساعد الذكي غير متاح لاكتمال الحصة اليومية، بس تكدر تستخدم باقي وظائف البوت (الجداول، التذكيرات، البحث المباشر، والملفات) بشكل طبيعي.',
      equations: [],
      citations: [],
      confidence: 'LOW',
      assumptions: [],
      needsClarification: false,
      usedFallback: true,
    };
  }
}
