import { InlineKeyboard } from 'grammy';
import { Stage } from '@mecha-bot/academic';
import {
  STAGE_NAMES_AR,
  SEMESTER_NAMES_AR,
  STAGE_SEMESTERS_MAP,
  formatCourseButtonLabel,
} from './constants.js';

export function createStageSelectionKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text(STAGE_NAMES_AR[1], 'm1:s:1')
    .row()
    .text(STAGE_NAMES_AR[2], 'm1:s:2')
    .row()
    .text(STAGE_NAMES_AR[3], 'm1:s:3')
    .row()
    .text(STAGE_NAMES_AR[4], 'm1:s:4');
}

export function createSemesterSelectionKeyboard(stage: Stage): InlineKeyboard {
  const [sem1, sem2] = STAGE_SEMESTERS_MAP[stage];
  return new InlineKeyboard()
    .text(SEMESTER_NAMES_AR[sem1], `m1:sem:${sem1}`)
    .text(SEMESTER_NAMES_AR[sem2], `m1:sem:${sem2}`)
    .row()
    .text('↩️ رجوع', 'm1:back:stage');
}

export interface CourseButtonItem {
  code: string;
  nameAr: string;
}

export function createCourseSelectionKeyboard(courses: CourseButtonItem[]): InlineKeyboard {
  const keyboard = new InlineKeyboard();

  for (const c of courses) {
    const label = formatCourseButtonLabel(c.code, c.nameAr);
    // Compact stable callback: m1:c:CODE
    keyboard.text(label, `m1:c:${c.code}`).row();
  }

  keyboard.text('↩️ رجوع', 'm1:back:sem');
  return keyboard;
}

export function createCourseHomeKeyboard(courseCode?: string): InlineKeyboard {
  const code = courseCode ?? '';
  const kb = new InlineKeyboard();

  if (code) {
    kb.text('📍 وين وصلنا؟', `m:where:${code}`)
      .row()
      .text('🧭 أني ضايع', `m:lost:${code}`)
      .row()
      .text('🔍 بحث بالمادة', `m:search:${code}`)
      .row()
      .text('📝 أسئلة وامتحانات', `m:exams:${code}`)
      .row()
      .text('📁 ملفات المادة', `m:files:${code}`)
      .row()
      .text('📚 موادي', 'm:courses')
      .text('🏠 القائمة الرئيسية', 'm:menu');
  } else {
    kb.text('🚀 ابدأ بالمادة', 'm1:start_course')
      .row()
      .text('🔄 تغيير المادة', 'm1:chg:course')
      .row()
      .text('📂 تغيير الفصل', 'm1:chg:sem')
      .text('🎓 تغيير المرحلة', 'm1:chg:stage');
  }

  return kb;
}

export function createMainMenuKeyboard(
  hasActiveCourse: boolean,
  activeCourseCode?: string | null,
  miniAppUrl?: string | null,
): InlineKeyboard {
  const kb = new InlineKeyboard();

  if (miniAppUrl) {
    kb.webApp('📱 التطبيق المصغر', miniAppUrl).row();
  }

  kb.text('📊 لوحة التحكم', 'm:dashboard').text('📚 موادي', 'm:courses').row();

  if (hasActiveCourse && activeCourseCode) {
    kb.text('📍 وين وصلنا؟', `m:where:${activeCourseCode}`)
      .text('🧭 أني ضايع', `m:lost:${activeCourseCode}`)
      .row();
  }

  kb.text('📅 الجدول', 'm:tt').text('🔔 التذكيرات', 'm:rem').row();
  kb.text('🔍 البحث الأكاديمي', 'm:search').row();
  kb.text('⚙️ الإعدادات', 'm1:settings');

  return kb;
}

export function createDashboardKeyboard(
  activeCourseCode?: string,
  miniAppUrl?: string | null,
): InlineKeyboard {
  const kb = new InlineKeyboard();

  if (miniAppUrl) {
    kb.webApp('📱 فتح التطبيق المصغر', miniAppUrl).row();
  }

  kb.text('📚 موادي', 'm:courses');
  if (activeCourseCode) {
    kb.text('🧭 تشخيص التقدم', `m:lost:${activeCourseCode}`);
  } else {
    kb.text('🧭 تشخيص التقدم', 'm:courses');
  }
  kb.row();

  kb.text('📅 الجدول', 'm:tt').text('🔔 التذكيرات', 'm:rem').row();

  if (activeCourseCode) {
    kb.text('📝 أسئلة وامتحانات', `m:exams:${activeCourseCode}`).row();
  }

  kb.text('🔄 تحديث', 'm:dashboard').text('🏠 القائمة الرئيسية', 'm:menu');

  return kb;
}

export function createMiniAppLaunchKeyboard(miniAppUrl: string): InlineKeyboard {
  return new InlineKeyboard()
    .webApp('📱 فتح تطبيق الميكاترونكس المصغر', miniAppUrl)
    .row()
    .text('🏠 القائمة الرئيسية', 'm:menu');
}

export function createWhereAreWeKeyboard(
  courseCode: string,
  suggestedTopicKey?: string,
  needsConfirmation?: boolean,
): InlineKeyboard {
  const kb = new InlineKeyboard();

  if (needsConfirmation && suggestedTopicKey) {
    kb.text('✅ نعم، هذا آخر شي وصلنا له', `m:conf:${courseCode}:${suggestedTopicKey}`).row();
    kb.text('❌ لا، بعدنا ما واصلين', `m:noconf:${courseCode}`).row();
  }

  kb.text('🧭 أني ضايع', `m:lost:${courseCode}`).row();
  kb.text('↩️ رجوع للمادة', `m:c:${courseCode}`).text('🏠 القائمة الرئيسية', 'm:menu');

  return kb;
}

export function createImLostKeyboard(courseCode: string): InlineKeyboard {
  return new InlineKeyboard()
    .text('📍 وين وصلنا؟', `m:where:${courseCode}`)
    .row()
    .text('↩️ رجوع للمادة', `m:c:${courseCode}`)
    .text('🏠 القائمة الرئيسية', 'm:menu');
}

export function createTimetableKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text('🔔 تفعيل تذكيرات المحاضرات', 'm:tt_rem')
    .row()
    .text('🏠 القائمة الرئيسية', 'm:menu');
}

export function createRemindersKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text('🔔 تفعيل تذكيرات الجدول', 'm:tt_rem')
    .row()
    .text('🏠 القائمة الرئيسية', 'm:menu');
}

export interface AcademicEventButton {
  id: string;
  title: string;
}

export function createExamsKeyboard(
  courseCode: string,
  events: AcademicEventButton[] = [],
  quizId?: string,
): InlineKeyboard {
  const kb = new InlineKeyboard();

  for (const ev of events) {
    kb.text(`🔔 تذكير: ${ev.title}`, `m:ex_rem:${ev.id}`).row();
  }

  if (quizId) {
    kb.text('✍️ بدء كويز تجريبي', `m:qz_start:${quizId}`).row();
  }

  kb.text('↩️ رجوع للمادة', `m:c:${courseCode}`).text('🏠 القائمة الرئيسية', 'm:menu');
  return kb;
}

export function createQuizQuestionKeyboard(
  quizId: string,
  questionIndex: number,
  totalQuestions: number,
  choiceCount: number,
  selectedChoice?: number,
): InlineKeyboard {
  const kb = new InlineKeyboard();

  const choiceLabels = ['A', 'B', 'C', 'D', 'E'];
  for (let i = 0; i < choiceCount; i++) {
    const isSelected = selectedChoice === i;
    const label = `${isSelected ? '🔘' : '⚪️'} ${choiceLabels[i] ?? String(i + 1)}`;
    kb.text(label, `m:qz_ans:${quizId}:${questionIndex}:${i}`);
  }
  kb.row();

  if (questionIndex + 1 < totalQuestions) {
    kb.text('➡️ السؤال التالي', `m:qz_next:${quizId}:${questionIndex + 1}`).row();
  } else {
    kb.text('📤 تسليم الكويز الآن', `m:qz_sub:${quizId}`).row();
  }

  kb.text('❌ إلغاء الكويز', 'm:menu');
  return kb;
}

export interface SearchResultButton {
  fileId?: string | undefined;
  label: string;
}

export function createSearchResultsKeyboard(
  files: SearchResultButton[] = [],
  courseCode?: string,
): InlineKeyboard {
  const kb = new InlineKeyboard();

  for (const f of files) {
    if (f.fileId) {
      kb.text(`📥 ${f.label}`, `m:dl:${f.fileId}`).row();
    }
  }

  if (courseCode) {
    kb.text('↩️ رجوع للمادة', `m:c:${courseCode}`);
  }
  kb.text('🏠 القائمة الرئيسية', 'm:menu');
  return kb;
}

export function createFilesKeyboard(
  files: Array<{ id: string; title: string; canDistribute: boolean }>,
  courseCode: string,
): InlineKeyboard {
  const kb = new InlineKeyboard();

  for (const f of files) {
    const prefix = f.canDistribute ? '📥' : '🚫';
    kb.text(`${prefix} ${f.title}`, `m:dl:${f.id}`).row();
  }

  kb.text('↩️ رجوع للمادة', `m:c:${courseCode}`).text('🏠 القائمة الرئيسية', 'm:menu');
  return kb;
}

export function createReturningStudentKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text('▶️ متابعة', 'm1:start_course')
    .row()
    .text('🔄 تغيير المادة', 'm1:chg:course')
    .row()
    .text('⚙️ الإعدادات', 'm1:settings');
}

export function createStudyPlaceholderKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text('↩️ رجوع للقائمة', 'm1:menu')
    .row()
    .text('🔄 تغيير المادة', 'm1:chg:course');
}

export function createSettingsKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text('🔄 تغيير المادة', 'm1:chg:course')
    .row()
    .text('📂 تغيير الفصل', 'm1:chg:sem')
    .row()
    .text('🎓 تغيير المرحلة', 'm1:chg:stage')
    .row()
    .text('↩️ رجوع', 'm1:menu');
}

export function createAiExplanationKeyboard(
  courseCode?: string | null,
  suggestedClarifications?: string[],
): InlineKeyboard {
  const kb = new InlineKeyboard();

  if (suggestedClarifications && suggestedClarifications.length > 0) {
    for (const item of suggestedClarifications.slice(0, 3)) {
      kb.text(`💡 ${item}`, `m:search:${courseCode || ''}`).row();
    }
  }

  if (courseCode) {
    kb.text('📍 وين وصلنا؟', `m:where:${courseCode}`)
      .text('🧭 أني ضايع', `m:lost:${courseCode}`)
      .row()
      .text('↩️ رجوع للمادة', `m:c:${courseCode}`);
  }

  kb.text('🏠 القائمة الرئيسية', 'm:menu');
  return kb;
}
