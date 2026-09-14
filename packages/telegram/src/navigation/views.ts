import { Stage, ProgramSemester } from '@mecha-bot/academic';
import { STAGE_NAMES_AR, SEMESTER_NAMES_AR } from './constants.js';

export function renderStageSelectionView(): string {
  return [
    '🎓 أهلاً بك في Mecha Bot',
    '',
    'مساعدك الدراسي لقسم هندسة الميكاترونكس.',
    '',
    'حدد مرحلتك:',
  ].join('\n');
}

export function renderSemesterSelectionView(stage: Stage): string {
  return [`🎓 ${STAGE_NAMES_AR[stage]}`, '', 'اختر الفصل:'].join('\n');
}

export function renderCourseSelectionView(stage: Stage, semester: ProgramSemester): string {
  return [`📚 ${STAGE_NAMES_AR[stage]} › ${SEMESTER_NAMES_AR[semester]}`, '', 'اختر المادة:'].join(
    '\n',
  );
}

export function renderCourseHomeView(
  code: string,
  nameAr: string,
  stage: Stage,
  semester: ProgramSemester,
): string {
  return [
    `🎛 ${code} — ${nameAr}`,
    '',
    `${STAGE_NAMES_AR[stage]} › ${SEMESTER_NAMES_AR[semester]}`,
    '',
    'أصبحت هذه المادة الحالية.',
  ].join('\n');
}

export function renderReturningStudentView(
  code: string,
  nameAr: string,
  stage: Stage,
  semester: ProgramSemester,
): string {
  return [
    'أهلاً بعودتك 👋',
    '',
    `🎛 ${code} — ${nameAr}`,
    `${STAGE_NAMES_AR[stage]} › ${SEMESTER_NAMES_AR[semester]}`,
  ].join('\n');
}

export function renderStudyPlaceholderView(
  code: string,
  nameAr: string,
  calendarWeek?: number | null,
): string {
  const lines = [`🎛 ${code} — ${nameAr}`, '', 'ميزات الدراسة ستتوفر في المراحل القادمة.'];

  if (calendarWeek && calendarWeek > 0) {
    lines.push('');
    lines.push(`أنت حالياً تقريباً بالأسبوع ${calendarWeek} حسب التقويم.`);
  }

  lines.push('');
  lines.push('إذا دخلت البوت بنص الفصل، مو مشكلة.');
  lines.push('لاحقاً تگدر تحدد آخر موضوع أخذتوه حتى أضبط المادة عليك.');

  return lines.join('\n');
}

export function renderSettingsView(
  stage: Stage | null,
  semester: ProgramSemester | null,
  courseCode: string | null,
  courseNameAr: string | null,
): string {
  const stageText = stage ? STAGE_NAMES_AR[stage] : 'غير محدد';
  const semText = semester ? SEMESTER_NAMES_AR[semester] : 'غير محدد';
  const courseText = courseCode && courseNameAr ? `${courseCode} — ${courseNameAr}` : 'غير محدد';

  return [
    '⚙️ الإعدادات الأكاديمية',
    '',
    `المرحلة: ${stageText}`,
    `الفصل: ${semText}`,
    `المادة الحالية: ${courseText}`,
    'المنطقة الزمنية: Asia/Baghdad',
    'اللغة: العربية',
  ].join('\n');
}
