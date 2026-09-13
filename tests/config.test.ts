import { describe, it, expect } from 'vitest';
import { loadConfig } from '@mecha-bot/shared';

describe('Configuration & Zero-Cost Policy Safeguards', () => {
  it('loads valid configuration with safe defaults', () => {
    const config = loadConfig({
      TELEGRAM_BOT_TOKEN: '123456789:AAFakeDevTokenForTestingPurpose12345',
    });

    expect(config.NODE_ENV).toBe('development');
    expect(config.LOG_LEVEL).toBe('info');
    expect(config.DATABASE_PATH).toBe('./data/mecha_bot.sqlite');
    expect(config.DEFAULT_TIMEZONE).toBe('Asia/Baghdad');
    expect(config.ALLOW_PAID_AI).toBe(false);
    expect(config.ALLOW_PAID_STORAGE).toBe(false);
    expect(config.ALLOW_BILLING_FALLBACK).toBe(false);
  });

  it('fails validation when TELEGRAM_BOT_TOKEN is missing', () => {
    expect(() => loadConfig({})).toThrow(/TELEGRAM_BOT_TOKEN is required/);
  });

  it('strictly rejects paid AI flag activation under Zero-Cost project rule', () => {
    expect(() =>
      loadConfig({
        TELEGRAM_BOT_TOKEN: 'fake_token',
        ALLOW_PAID_AI: 'true',
      }),
    ).toThrow(/ALLOW_PAID_AI must remain false/);
  });

  it('strictly rejects paid storage flag activation under Zero-Cost project rule', () => {
    expect(() =>
      loadConfig({
        TELEGRAM_BOT_TOKEN: 'fake_token',
        ALLOW_PAID_STORAGE: 'true',
      }),
    ).toThrow(/ALLOW_PAID_STORAGE must remain false/);
  });

  it('strictly rejects billing fallback flag activation', () => {
    expect(() =>
      loadConfig({
        TELEGRAM_BOT_TOKEN: 'fake_token',
        ALLOW_BILLING_FALLBACK: 'true',
      }),
    ).toThrow(/ALLOW_BILLING_FALLBACK must remain false/);
  });
});
