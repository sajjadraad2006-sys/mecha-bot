import { Stage, ProgramSemester } from '@mecha-bot/academic';

export const STAGE_NAMES_AR: Record<Stage, string> = {
  1: 'المرحلة الأولى',
  2: 'المرحلة الثانية',
  3: 'المرحلة الثالثة',
  4: 'المرحلة الرابعة',
};

export const SEMESTER_NAMES_AR: Record<ProgramSemester, string> = {
  1: 'الفصل الأول',
  2: 'الفصل الثاني',
  3: 'الفصل الثالث',
  4: 'الفصل الرابع',
  5: 'الفصل الخامس',
  6: 'الفصل السادس',
  7: 'الفصل السابع',
  8: 'الفصل الثامن',
};

export const STAGE_SEMESTERS_MAP: Record<Stage, [ProgramSemester, ProgramSemester]> = {
  1: [1, 2],
  2: [3, 4],
  3: [5, 6],
  4: [7, 8],
};

/**
 * Clean UI label shortening for courses on inline keyboard buttons
 * Prevents excessively wide buttons on mobile Telegram clients.
 */
export function formatCourseButtonLabel(code: string, nameAr: string): string {
  // If Arabic name is long, truncate or clean up for button
  const cleanName = nameAr.length > 22 ? `${nameAr.slice(0, 20)}...` : nameAr;
  return `${code} — ${cleanName}`;
}
