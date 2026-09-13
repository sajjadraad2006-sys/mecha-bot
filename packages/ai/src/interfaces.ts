import { z } from 'zod';

export interface AIModelCapabilities {
  supportsStructuredOutput: boolean;
  maxContextTokens: number;
  isFreeTier: boolean;
}

export interface AIRequestOptions {
  temperature?: number;
  maxTokens?: number;
  context?: Record<string, unknown>;
}

export interface AIProvider {
  readonly id: string;
  readonly capabilities: AIModelCapabilities;
  healthCheck(): Promise<boolean>;
  generateStructured<T>(
    prompt: string,
    schema: z.ZodType<T>,
    options?: AIRequestOptions,
  ): Promise<T>;
}

export interface AcademicSourceExcerpt {
  sourceId: string;
  title: string;
  excerpt: string;
  page?: number | undefined;
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
