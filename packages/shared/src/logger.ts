export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const SENSITIVE_KEYS = new Set([
  'token',
  'bottoken',
  'telegram_bot_token',
  'apikey',
  'api_key',
  'gemini_api_key',
  'groq_api_key',
  'secret',
  'password',
  'authorization',
  'credentials',
]);

export function sanitize(value: unknown): unknown {
  if (value === null || value === undefined) return value;

  if (typeof value === 'string') {
    // Redact bot token pattern (e.g. 123456789:ABCdefGHI...)
    return value.replace(/\b\d{8,10}:[A-Za-z0-9_-]{35}\b/g, '[REDACTED_BOT_TOKEN]');
  }

  if (Array.isArray(value)) {
    return value.map(sanitize);
  }

  if (typeof value === 'object') {
    const sanitizedObj: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (SENSITIVE_KEYS.has(key.toLowerCase())) {
        sanitizedObj[key] = '[REDACTED]';
      } else {
        sanitizedObj[key] = sanitize(val);
      }
    }
    return sanitizedObj;
  }

  return value;
}

export interface Logger {
  debug(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, error?: Error | unknown, context?: Record<string, unknown>): void;
  child(defaultContext: Record<string, unknown>): Logger;
}

export class JsonLogger implements Logger {
  private levelWeights: Record<LogLevel, number> = {
    debug: 10,
    info: 20,
    warn: 30,
    error: 40,
  };

  constructor(
    private minLevel: LogLevel = 'info',
    private defaultContext: Record<string, unknown> = {},
  ) {}

  private shouldLog(level: LogLevel): boolean {
    return this.levelWeights[level] >= this.levelWeights[this.minLevel];
  }

  private output(level: LogLevel, message: string, extra?: Record<string, unknown>): void {
    if (!this.shouldLog(level)) return;

    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...this.defaultContext,
      ...extra,
    };

    const sanitizedEntry = sanitize(entry) as Record<string, unknown>;
    const line = JSON.stringify(sanitizedEntry);

    if (level === 'error') {
      console.error(line);
    } else if (level === 'warn') {
      console.warn(line);
    } else {
      console.log(line);
    }
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.output('debug', message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.output('info', message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.output('warn', message, context);
  }

  error(message: string, error?: Error | unknown, context?: Record<string, unknown>): void {
    const errorDetails =
      error instanceof Error
        ? { errorName: error.name, errorMessage: error.message, stack: error.stack }
        : { error };
    this.output('error', message, { ...errorDetails, ...context });
  }

  child(defaultContext: Record<string, unknown>): Logger {
    return new JsonLogger(this.minLevel, { ...this.defaultContext, ...defaultContext });
  }
}
