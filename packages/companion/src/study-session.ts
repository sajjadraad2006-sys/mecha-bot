import { ConflictError, ValidationError } from '@mecha-bot/shared';
import type { EndStudySessionInput, SessionStatus, StudySession } from './types.js';
import { requireUtcIso } from './schemas.js';

const TERMINAL_STATUSES: ReadonlySet<SessionStatus> = new Set([
  'COMPLETED',
  'CANCELLED',
  'INTERRUPTED',
]);

export function calculateActualDurationMinutes(startedAt: string, endedAt: string): number {
  requireUtcIso(startedAt, 'startedAt');
  requireUtcIso(endedAt, 'endedAt');
  const elapsedMs = Date.parse(endedAt) - Date.parse(startedAt);
  if (elapsedMs < 0) {
    throw new ValidationError('A study session cannot end before it starts');
  }
  return elapsedMs / 60_000;
}

export function transitionStudySession(
  session: StudySession,
  targetStatus: Extract<SessionStatus, 'COMPLETED' | 'CANCELLED' | 'INTERRUPTED'>,
  endedAt: string,
  input: EndStudySessionInput = {},
): StudySession {
  if (session.status !== 'ACTIVE') {
    throw new ConflictError(
      `Cannot transition study session from ${session.status} to ${targetStatus}`,
    );
  }
  if (TERMINAL_STATUSES.has(session.status)) {
    throw new ConflictError(`Study session is already ${session.status}`);
  }

  const actualDurationMinutes = calculateActualDurationMinutes(session.startedAt, endedAt);
  return {
    ...session,
    status: targetStatus,
    endedAt,
    actualDurationMinutes,
    ...(input.completionReason === undefined
      ? {}
      : { completionReason: input.completionReason.trim() }),
    ...(input.notes === undefined ? {} : { notes: input.notes.trim() }),
  };
}
