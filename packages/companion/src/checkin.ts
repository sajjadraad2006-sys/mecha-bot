import { formatToAcademicDate, type Clock } from '@mecha-bot/shared';
import { DEFAULT_STUDENT_TIME_ZONE } from './types.js';

export function currentLocalDate(clock: Clock, timeZone = DEFAULT_STUDENT_TIME_ZONE): string {
  return formatToAcademicDate(clock.now(), timeZone);
}
