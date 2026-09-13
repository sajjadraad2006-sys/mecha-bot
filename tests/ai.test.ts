import { describe, it, expect } from 'vitest';
import {
  FakeAIProvider,
  AcademicResponseSchema,
  AIRouter,
  assertNoStudentPii,
  sanitizeAiPrompt,
  createAcademicAiContext,
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
    const promptWithPii = 'Student @teststudent with ID 1234567890 asks about TEST101';
    const sanitized = sanitizeAiPrompt(promptWithPii);
    expect(sanitized).not.toContain('1234567890');
    expect(sanitized).not.toContain('@teststudent');
    expect(sanitized).toContain('asks about TEST101');
  });

  it('constructs valid academic context DTO without identity fields', () => {
    const validAcademicInput = {
      stage: 3,
      programSemester: 5,
      courseCode: 'TEST301',
      topic: 'State Space Control',
      studentQuestion: 'How is the controllability matrix constructed?',
      retrievedExcerpts: [
        {
          sourceId: 'src-101',
          title: 'Control Engineering Fundamentals',
          excerpt: 'Controllability matrix is formed by [B AB A^2B ...]',
        },
      ],
      academicPreferences: {
        language: 'bilingual' as const,
        detailLevel: 'step_by_step' as const,
      },
    };

    const context = createAcademicAiContext(validAcademicInput);
    expect(context.stage).toBe(3);
    expect(context.programSemester).toBe(5);
    expect(context.courseCode).toBe('TEST301');
    expect(context.retrievedExcerpts.length).toBe(1);
  });

  it('strictly rejects any Telegram identity metadata in academic AI context builder', () => {
    const baseAcademic = {
      stage: 2,
      programSemester: 3,
      courseCode: 'TEST201',
      studentQuestion: 'What is the frequency response of this circuit?',
      retrievedExcerpts: [],
    };

    // Test rejection of telegramUserId
    expect(() => createAcademicAiContext({ ...baseAcademic, telegramUserId: 123456789 })).toThrow(
      /Privacy by Architecture Violation/,
    );

    // Test rejection of chatId
    expect(() => createAcademicAiContext({ ...baseAcademic, chatId: 987654321 })).toThrow(
      /Privacy by Architecture Violation/,
    );

    // Test rejection of username
    expect(() => createAcademicAiContext({ ...baseAcademic, username: 'test_student' })).toThrow(
      /Privacy by Architecture Violation/,
    );

    // Test rejection of phone number
    expect(() => createAcademicAiContext({ ...baseAcademic, phone: '+9647701234567' })).toThrow(
      /Privacy by Architecture Violation/,
    );

    // Test rejection of email
    expect(() =>
      createAcademicAiContext({ ...baseAcademic, email: 'student@example.com' }),
    ).toThrow(/Privacy by Architecture Violation/);

    // Test rejection of database primary key
    expect(() => createAcademicAiContext({ ...baseAcademic, studentId: 'stu_12345' })).toThrow(
      /Privacy by Architecture Violation/,
    );
  });

  it('triggers secondary defense-in-depth check when accidental PII is in question text', () => {
    const contextWithAccidentalPii = {
      stage: 1,
      programSemester: 1,
      courseCode: 'TEST101',
      studentQuestion: 'My Telegram ID is 9876543210, when is the quiz?',
      retrievedExcerpts: [],
    };

    expect(() => createAcademicAiContext(contextWithAccidentalPii)).toThrow(
      /Privacy Defense-in-Depth Violation/,
    );
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
