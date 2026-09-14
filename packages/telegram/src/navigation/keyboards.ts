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

export function createCourseHomeKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text('🚀 ابدأ بالمادة', 'm1:start_course')
    .row()
    .text('🔄 تغيير المادة', 'm1:chg:course')
    .row()
    .text('📂 تغيير الفصل', 'm1:chg:sem')
    .text('🎓 تغيير المرحلة', 'm1:chg:stage');
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
