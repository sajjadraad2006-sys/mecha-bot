import { createHash } from 'node:crypto';
import { ReminderKind } from './types.js';
import { toUtcIso } from './timezone.js';

export interface FingerprintParams {
  userKey: string;
  kind: ReminderKind;
  title: string;
  dueAt: Date | string;
  relatedAcademicEventId?: string | null | undefined;
}

/**
 * Generates a deterministic idempotency fingerprint for a reminder.
 * Ensures the same user, event/title, kind, and exact due time maps to the same key.
 */
export function generateReminderFingerprint(params: FingerprintParams): string {
  const normUser = params.userKey.trim().toLowerCase();
  const normKind = params.kind.trim().toUpperCase();
  const normTitle = params.title.trim().toLowerCase();
  const normDue = toUtcIso(params.dueAt);
  const normEvent = (params.relatedAcademicEventId || '').trim().toLowerCase();

  const raw = `${normUser}|${normKind}|${normTitle}|${normDue}|${normEvent}`;
  return createHash('sha256').update(raw).digest('hex').slice(0, 32);
}
