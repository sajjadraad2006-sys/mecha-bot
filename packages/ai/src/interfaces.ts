import { z } from 'zod';

export type TaskType =
  | 'SIMPLE_EXPLANATION'
  | 'CONCEPT_EXPLANATION'
  | 'MULTI_SOURCE_SYNTHESIS'
  | 'STRUCTURED_EXTRACTION'
  | 'FAILOVER';

export type ModelHealthState =
  'HEALTHY' | 'DEGRADED' | 'COOLDOWN' | 'QUOTA_EXHAUSTED' | 'PAID_ONLY';

export enum WorkersAiErrorCode {
  TIMEOUT = 3007,
  QUOTA_EXHAUSTED = 3036,
  OUT_OF_CAPACITY = 3040,
  INVALID_MODEL = 5007,
  INVALID_MODEL_ALT = 3042,
  PAID_REQUIRED = 5035,
}

export interface AIModelCapabilities {
  supportsStructuredOutput: boolean;
  maxContextTokens: number;
  isFreeTier: boolean;
}

export interface AIRequestOptions {
  temperature?: number | undefined;
  maxTokens?: number | undefined;
  context?: Record<string, unknown> | undefined;
  taskType?: TaskType | undefined;
  modelId?: string | undefined;
  timeoutMs?: number | undefined;
}

export interface AIProvider {
  readonly id: string;
  readonly capabilities: AIModelCapabilities;
  healthCheck(): Promise<boolean>;
  generateStructured<T>(
    prompt: string,
    schema: z.ZodType<T>,
    options?: AIRequestOptions | undefined,
  ): Promise<T>;
}

export interface AcademicSourceExcerpt {
  sourceId: string;
  sourceVersion?: string | undefined;
  chunkId?: string | undefined;
  title: string;
  excerpt: string;
  page?: number | undefined;
  pageRange?: [number, number] | undefined;
  authority?: string | undefined;
  evidenceScope?: string | undefined;
  canDistribute?: boolean | undefined;
}

export type ContextConfidence = 'EXPLICIT' | 'INHERITED' | 'INFERRED' | 'AMBIGUOUS';

export interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface ConversationContext {
  studentKey: string;
  stage?: number | undefined;
  programSemester?: number | undefined;
  activeCourseCode?: string | undefined;
  activeTopicKey?: string | undefined;
  activeSubtopicKey?: string | undefined;
  currentIntent?: string | undefined;
  recentMessages: ChatMessage[];
  compactSummary?: string | undefined;
  contextConfidence: ContextConfidence;
  updatedAt: string;
  expiresAt: string;
}

export interface AcademicScope {
  courseCode: string;
  courseTitleAr?: string | undefined;
  courseTitleEn?: string | undefined;
  stage?: number | undefined;
  programSemester?: number | undefined;
  topicKey?: string | undefined;
  topicTitleAr?: string | undefined;
  topicTitleEn?: string | undefined;
  topicMapStatus?: string | undefined;
  conflictStatus?: string | undefined;
}

/**
 * AcademicAiContextDTO
 *
 * Privacy by Architecture:
 * Strictly allowlisted, privacy-preserving DTO for AI prompt construction.
 * Must NOT contain any student identity fields (telegramUserId, chatId, username, phone, email, studentId, displayName).
 */
export interface AcademicAiContextDTO {
  stage: number;
  programSemester: number;
  courseCode: string;
  topic?: string | undefined;
  studentQuestion: string;
  retrievedExcerpts: AcademicSourceExcerpt[];
  academicPreferences?:
    | {
        language?: ('ar' | 'en' | 'bilingual') | undefined;
        detailLevel?: ('concise' | 'detailed' | 'step_by_step') | undefined;
      }
    | undefined;
}

export interface AiBrainRequest {
  studentKey: string;
  question: string;
  activeCourseCode?: string | undefined;
  activeTopicKey?: string | undefined;
  stage?: number | undefined;
  programSemester?: number | undefined;
  taskType?: TaskType | undefined;
}

export interface AiBrainCitation {
  sourceId: string;
  title: string;
  page?: number | undefined;
  chunkId?: string | undefined;
  authority?: string | undefined;
}

export interface AiBrainResponse {
  intent: string;
  courseCode: string | null;
  topic: string | null;
  answer: string;
  equations: string[];
  citations: AiBrainCitation[];
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  assumptions: string[];
  needsClarification: boolean;
  clarificationPrompt?: string | undefined;
  suggestedClarifications?: string[] | undefined;
  disclaimer?: string | undefined;
  usedFallback: boolean;
  modelUsed?: string | undefined;
}
