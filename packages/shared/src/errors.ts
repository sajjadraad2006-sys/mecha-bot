export class AppError extends Error {
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(message: string, code = 'INTERNAL_ERROR', isOperational = true, details?: unknown) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.isOperational = isOperational;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', true, details);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, identifier?: string | number) {
    const detail = identifier ? ` with identifier '${identifier}'` : '';
    super(`${resource}${detail} not found`, 'NOT_FOUND', true);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'CONFLICT_ERROR', true, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized action') {
    super(message, 'UNAUTHORIZED', true);
  }
}

export class ProviderError extends AppError {
  public readonly isRetryable: boolean;

  constructor(provider: string, message: string, isRetryable = false, details?: unknown) {
    super(`Provider '${provider}' failed: ${message}`, 'PROVIDER_ERROR', true, details);
    this.isRetryable = isRetryable;
  }
}

export class IdempotencyError extends AppError {
  constructor(updateId: number | string) {
    super(`Update ${updateId} has already been processed`, 'DUPLICATE_UPDATE', true);
  }
}
