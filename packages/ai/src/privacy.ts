import { ValidationError } from '@mecha-bot/shared';

const PII_PATTERNS = [
  /\b\d{8,12}\b/, // Telegram ID pattern
  /@\w{4,32}\b/, // Telegram username pattern
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email pattern
  /\b(?:\+?964|0)?7\d{9}\b/, // Iraqi phone numbers
];

export function sanitizeAiPrompt(text: string): string {
  let sanitized = text;
  for (const pattern of PII_PATTERNS) {
    sanitized = sanitized.replace(pattern, '[PII_REDACTED]');
  }
  return sanitized;
}

export function assertNoStudentPii(data: Record<string, unknown>): void {
  const serialized = JSON.stringify(data);
  for (const pattern of PII_PATTERNS) {
    if (pattern.test(serialized)) {
      throw new ValidationError(
        'Privacy Violation: Outgoing AI payload contains private user identifiers or PII.',
      );
    }
  }
}
