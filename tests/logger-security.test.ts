import { describe, it, expect, vi } from 'vitest';
import { JsonLogger, sanitize } from '@mecha-bot/shared';

describe('Logger Security & Credential Redaction', () => {
  it('automatically redacts bot tokens matching Telegram token patterns', () => {
    const rawToken = '1234567890:ABCdefGHIjklMNOpqrsTUVwxyz123456789';
    const message = `Connecting to Telegram bot with token ${rawToken} on endpoint`;
    const sanitized = sanitize(message);

    expect(sanitized).not.toContain(rawToken);
    expect(sanitized).toContain('[REDACTED_BOT_TOKEN]');
  });

  it('redacts sensitive fields in structured objects', () => {
    const sensitiveData = {
      telegram_bot_token: 'secret123',
      apiKey: 'gemini_secret_key_xyz',
      password: 'mypassword',
      user: 'student101',
      details: {
        authorization: 'Bearer token',
        normalField: 'hello',
      },
    };

    const sanitized = sanitize(sensitiveData) as Record<string, unknown> & {
      telegram_bot_token: string;
      apiKey: string;
      password: string;
      user: string;
      details: { authorization: string; normalField: string };
    };
    expect(sanitized.telegram_bot_token).toBe('[REDACTED]');
    expect(sanitized.apiKey).toBe('[REDACTED]');
    expect(sanitized.password).toBe('[REDACTED]');
    expect(sanitized.user).toBe('student101');
    expect(sanitized.details.authorization).toBe('[REDACTED]');
    expect(sanitized.details.normalField).toBe('hello');
  });

  it('outputs structured JSON without leaking tokens', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const logger = new JsonLogger('info', { service: 'test-bot' });
    const dummyToken = '1234567890:ABCdefGHIjklMNOpqrsTUVwxyz123456789';

    logger.info(`Bot initialized with token ${dummyToken}`, {
      apiKey: 'secret_key',
      safeParam: 42,
    });

    expect(logSpy).toHaveBeenCalled();
    const loggedString = logSpy.mock.calls[0]![0];
    const parsed = JSON.parse(loggedString);

    expect(parsed.service).toBe('test-bot');
    expect(parsed.level).toBe('info');
    expect(parsed.message).toContain('[REDACTED_BOT_TOKEN]');
    expect(parsed.apiKey).toBe('[REDACTED]');
    expect(parsed.safeParam).toBe(42);

    logSpy.mockRestore();
  });
});
