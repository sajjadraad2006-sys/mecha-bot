import { describe, it, expect } from 'vitest';
import {
  FakeAIProvider,
  AcademicResponseSchema,
  AIRouter,
  assertNoStudentPii,
  sanitizeAiPrompt,
} from '@mecha-bot/ai';
import { ValidationError } from '@mecha-bot/shared';

describe('AI Foundation & Privacy Boundary', () => {
  it('validates structured AI responses matching schema contracts', async () => {
    const provider = new FakeAIProvider();
    const result = await provider.generateStructured('Test prompt', AcademicResponseSchema);

    expect(result.intent).toBe('GENERAL');
    expect(result.courseCode).toBe('TEST101');
    expect(result.answer).toBeDefined();
    expect(result.confidence).toBe('HIGH');
    expect(result.sourceRefs?.length).toBeGreaterThan(0);
  });

  it('strictly rejects invalid structured output from AI provider', async () => {
    const provider = new FakeAIProvider();
    provider.setMockResponse({
      intent: 'INVALID_INTENT', // Violates enum
      answer: '', // Violates min(1)
    });

    await expect(
      provider.generateStructured('Test prompt', AcademicResponseSchema),
    ).rejects.toThrow(/Structured output validation failed/);
  });

  it('strictly enforces privacy boundary by blocking student PII in outgoing requests', () => {
    // Contains Telegram user ID (8-10 digits)
    expect(() =>
      assertNoStudentPii({
        academicContext: 'Course inquiry',
        userId: 123456789,
      }),
    ).toThrow(ValidationError);

    // Contains email
    expect(() =>
      assertNoStudentPii({
        context: 'Email student@uobasrah.edu.iq query',
      }),
    ).toThrow(ValidationError);

    // Pure academic context without PII passes
    expect(() =>
      assertNoStudentPii({
        course: 'TEST101',
        topic: 'Robotics kinematics',
      }),
    ).not.toThrow();
  });

  it('sanitizes prompts by redacting PII patterns', () => {
    const promptWithPii = 'Student @sajjad_uob with ID 8807584013 asks about TEST101';
    const sanitized = sanitizeAiPrompt(promptWithPii);
    expect(sanitized).not.toContain('8807584013');
    expect(sanitized).not.toContain('@sajjad_uob');
    expect(sanitized).toContain('asks about TEST101');
  });

  it('AIRouter transparently switches to fallback when primary fails', async () => {
    const primary = new FakeAIProvider('primary-gemini-free');
    const fallback = new FakeAIProvider('fallback-groq-free');

    // Simulate primary failure
    primary.setShouldFail(true);

    const router = new AIRouter(primary, [fallback]);
    const { result, providerId } = await router.generateStructured(
      'Synthetic prompt',
      AcademicResponseSchema,
    );

    expect(providerId).toBe('fallback-groq-free');
    expect(result.answer).toBeDefined();
  });
});
