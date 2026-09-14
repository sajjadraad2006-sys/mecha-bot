export const AUDIT_OUTCOMES = ['ALLOWED', 'DENIED', 'SUCCESS', 'FAILURE'] as const;
export type AuditOutcome = (typeof AUDIT_OUTCOMES)[number];

export interface AdminAuditEvent {
  id: string;
  actorKey: string;
  action: string;
  resourceType: string;
  resourceKey?: string | undefined;
  courseCode?: string | undefined;
  outcome: AuditOutcome;
  reason?: string | undefined;
  timestamp: string; // ISO 8601 string
  metadata?: Record<string, unknown> | undefined;
}

/**
 * Filter options for querying audit events.
 */
export interface AuditEventFilter {
  actorKey?: string | undefined;
  action?: string | undefined;
  resourceType?: string | undefined;
  resourceKey?: string | undefined;
  courseCode?: string | undefined;
  outcome?: AuditOutcome | undefined;
  since?: string | undefined;
  until?: string | undefined;
  limit?: number | undefined;
}

/**
 * Sensitive field patterns that must NEVER be logged into audit events.
 */
const SENSITIVE_KEY_REGEX = /token|secret|password|credential|apikey|auth|private/i;
const MAX_METADATA_STRING_LENGTH = 200;

/**
 * Sanitizes audit metadata to prevent leakage of secrets, long documents,
 * or unbounded payloads.
 */
export function sanitizeAuditMetadata(
  raw?: Record<string, unknown>,
): Record<string, unknown> | undefined {
  if (!raw || typeof raw !== 'object') {
    return undefined;
  }

  const clean: Record<string, unknown> = {};

  for (const [key, val] of Object.entries(raw)) {
    if (SENSITIVE_KEY_REGEX.test(key)) {
      clean[key] = '[REDACTED]';
      continue;
    }

    if (typeof val === 'string') {
      if (val.length > MAX_METADATA_STRING_LENGTH) {
        clean[key] = `${val.slice(0, MAX_METADATA_STRING_LENGTH)}...[TRUNCATED]`;
      } else {
        clean[key] = val;
      }
    } else if (typeof val === 'number' || typeof val === 'boolean' || val === null) {
      clean[key] = val;
    } else if (Array.isArray(val)) {
      clean[key] = val
        .slice(0, 10)
        .map((item) => (typeof item === 'string' ? item.slice(0, 50) : item));
    } else if (typeof val === 'object') {
      clean[key] = '[OBJECT]';
    }
  }

  return clean;
}

let auditSequence = 0;

/**
 * Deterministic audit ID generator for in-memory events.
 */
export function generateAuditId(prefix = 'aud'): string {
  auditSequence += 1;
  return `${prefix}_${Date.now()}_${auditSequence.toString().padStart(4, '0')}`;
}

/**
 * Resets the audit sequence counter (useful in test suites).
 */
export function resetAuditSequence(): void {
  auditSequence = 0;
}
