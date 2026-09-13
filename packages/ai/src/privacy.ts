import { ValidationError } from '@mecha-bot/shared';
import { AcademicAiContextDTO } from './interfaces.js';
import { AcademicAiContextSchema } from './schemas.js';

/**
 * Common patterns for best-effort PII detection (defense-in-depth secondary guard).
 */
const PII_PATTERNS = [
  /\b\d{8,12}\b/, // Telegram ID pattern
  /@\w{4,32}\b/, // Telegram username pattern
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email pattern
  /\b(?:\+?964|0)?7\d{9}\b/, // Iraqi phone numbers
];

/**
 * Creates and validates an AcademicAiContextDTO.
 *
 * Primary Guard (Privacy by Architecture):
 * Structurally allows ONLY academic fields. Any identity attributes
 * (such as telegramUserId, chatId, username, phone, email, studentId)
 * are rejected by schema validation.
 *
 * Secondary Guard (Defense in Depth):
 * Runs best-effort PII detection on the serialized academic context
 * to catch accidental user identifiers in free-text fields.
 */
export function createAcademicAiContext(input: unknown): AcademicAiContextDTO {
  const parseResult = AcademicAiContextSchema.safeParse(input);
  if (!parseResult.success) {
    const errorDetails = parseResult.error.issues
      .map((issue) => `${issue.path.join('.') || 'root'}: ${issue.message}`)
      .join(', ');
    throw new ValidationError(
      `Privacy by Architecture Violation: Invalid academic context or disallowed identity field detected (${errorDetails})`,
    );
  }

  // Secondary defense-in-depth check for accidental identifiers inside question text
  assertNoStudentPii(parseResult.data as unknown as Record<string, unknown>);

  return parseResult.data;
}

/**
 * Best-effort prompt sanitizer for secondary defense-in-depth redaction.
 */
export function sanitizeAiPrompt(text: string): string {
  let sanitized = text;
  for (const pattern of PII_PATTERNS) {
    sanitized = sanitized.replace(pattern, '[PII_REDACTED]');
  }
  return sanitized;
}

/**
 * Best-effort PII detection validator.
 * Serves as a secondary defense-in-depth safety net, not an absolute guarantee.
 */
export function assertNoStudentPii(data: Record<string, unknown>): void {
  const serialized = JSON.stringify(data);
  for (const pattern of PII_PATTERNS) {
    if (pattern.test(serialized)) {
      throw new ValidationError(
        'Privacy Defense-in-Depth Violation: Outgoing AI payload contains private user identifiers or PII pattern.',
      );
    }
  }
}
