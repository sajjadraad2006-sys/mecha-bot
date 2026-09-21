import type { TaskType } from './interfaces.js';

export interface GateDecision {
  shouldInvokeAi: boolean;
  reason: string;
  taskType?: TaskType;
}

// Commands and navigation keywords that bypass AI completely
const SYSTEM_COMMAND_PREFIXES = [
  '/',
  'm:',
  'm1:',
  'm2:',
  'm3:',
  'm4:',
  'm5:',
  'm6:',
  'm7:',
  'm8:',
  'm9:',
  'm10:',
  'm11:',
  'm12:',
];

// Academic intent triggers (Arabic and English)
const ACADEMIC_QUESTION_PATTERNS = [
  /اشرح(?:لي|لنا|ها)?/i,
  /وضح(?:لي|لنا)?/i,
  /فهمني/i,
  /شنو(?:هو|هي|الفرق|معنى|سالفة)?/i,
  /شلون\s+(?:احسب|احل|نحسب|نحل|افهم|نطلع|استخرج|تشتغل|يشتغل|صارت|تصير)/i,
  /ما\s*(?:هو|هي|معنى|الفرق)/i,
  /ليش/i,
  /كيف(?:ية)?/i,
  /لخص(?:لي|لنا)?/i,
  /احسب/i,
  /حل\s*(?:هذا|السؤال|المسألة)?/i,
  /طريقة\s*حل/i,
  /خطوات\s*حل/i,
  /اريد\s*(?:اعرف|افهم|شرح|حل)/i,
  /عندي\s*(?:سؤال|مسألة|استفسار)/i,
  /قانون/i,
  /معادلة/i,
  /مسألة/i,
  /مثال/i,
  /اثبات/i,
  /تعريف/i,
  /مفهوم/i,
  /مقارنة/i,
  /\bwhy\b/i,
  /\bhow\b/i,
  /\bwhat\b/i,
  /\bexplain\b/i,
  /\bcompare\b/i,
  /\bsummarize\b/i,
  /\bderive\b/i,
  /\bcalculate\b/i,
  /\bdefinition\b/i,
  /\bformula\b/i,
  /\btransfer\s+function\b/i,
  /\broot\s+locus\b/i,
  /\bbode\b/i,
  /\bnyquist\b/i,
  /\bstability\b/i,
  /\bstate\s+space\b/i,
  /\bpid\b/i,
  /\bplc\b/i,
  /\bmicrocontroller\b/i,
];

// Follow-up interrogatives that depend on active course scope
const FOLLOW_UP_PATTERNS = [
  /ليش\s+(?:غيرنا|صارت|سوينا|طلع|طلعت)/i,
  /شلون\s+(?:صارت|طلعت|انحلت)/i,
  /والخطوة\s+(?:الثانية|اللي\s+وراها)/i,
  /اشرحها\s+أكثر/i,
  /وضح\s+أكثر/i,
  /ما\s+فهمت/i,
  /عيدها/i,
  /\bwhy\s+did\b/i,
  /\bnext\s+step\b/i,
  /\belaborate\b/i,
  /\bmore\s+detail\b/i,
];

export class AiInvocationGate {
  /**
   * Deterministically evaluates whether incoming text should invoke the AI Brain.
   * NEVER calls an LLM to decide whether to call an LLM.
   */
  public evaluate(rawText: string, activeCourseCode?: string): GateDecision {
    const text = rawText.trim();

    // 1. Length check: empty or trivial strings
    if (!text || text.length < 3) {
      return {
        shouldInvokeAi: false,
        reason: 'Input is empty or too short (< 3 characters)',
      };
    }

    // 2. Command bypass: starts with slash or callback prefix
    for (const prefix of SYSTEM_COMMAND_PREFIXES) {
      if (text.startsWith(prefix)) {
        return {
          shouldInvokeAi: false,
          reason: `System command or button callback prefix detected: '${prefix}'`,
        };
      }
    }

    // 3. Check for specific academic explanation / reasoning questions
    for (const pattern of ACADEMIC_QUESTION_PATTERNS) {
      if (pattern.test(text)) {
        // Multi-source synthesis if comparison or summary
        if (/مقارنة|الفرق|compare|لخص|summarize/i.test(text)) {
          return {
            shouldInvokeAi: true,
            reason: 'Academic comparison/summary detected',
            taskType: 'MULTI_SOURCE_SYNTHESIS',
          };
        }

        // Concept explanation
        return {
          shouldInvokeAi: true,
          reason: 'Academic concept/explanation query detected',
          taskType: 'CONCEPT_EXPLANATION',
        };
      }
    }

    // 4. Follow-up query in active course scope
    if (activeCourseCode) {
      for (const pattern of FOLLOW_UP_PATTERNS) {
        if (pattern.test(text)) {
          return {
            shouldInvokeAi: true,
            reason: `Academic follow-up question within active course scope (${activeCourseCode})`,
            taskType: 'CONCEPT_EXPLANATION',
          };
        }
      }

      // If student is inside an active course thread and asks a substantive question (> 15 chars),
      // treat it as an academic question for that course
      if (text.length >= 15 && !text.startsWith('#')) {
        return {
          shouldInvokeAi: true,
          reason: `Conversational academic query inside active course (${activeCourseCode})`,
          taskType: 'SIMPLE_EXPLANATION',
        };
      }
    }

    // Default: does not invoke AI (deterministic handling)
    return {
      shouldInvokeAi: false,
      reason: 'No academic question pattern or active course follow-up matched',
    };
  }
}
