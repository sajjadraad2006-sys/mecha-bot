/**
 * Mini App Types & View Contracts (@mecha-bot/mini-app)
 */

export type MiniAppTab = 'timetable' | 'syllabus' | 'progress';

export type MiniAppStage = 1 | 2 | 3 | 4;

export type MiniAppSemester = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type MiniAppWeekday =
  'SUNDAY' | 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY';

export interface MiniAppTimetableSlot {
  id: string;
  courseCode: string;
  courseTitleAr: string;
  courseTitleEn?: string | undefined;
  stage: MiniAppStage;
  programSemester: MiniAppSemester;
  section?: string | undefined;
  subgroup?: string | undefined;
  type: 'LECTURE' | 'LAB' | 'TUTORIAL';
  weekday: MiniAppWeekday;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  room: string;
  lecturerDisplayName: string;
  notes?: string | undefined;
  sourceStatus: 'VERIFIED' | 'PROVISIONAL';
}

export interface MiniAppTopic {
  topicKey: string;
  titleAr: string;
  titleEn: string;
  nominalWeek: number | null;
  subtopics?: string[] | undefined;
}

export interface MiniAppPrerequisiteRef {
  prerequisiteCourseCode: string;
  prerequisiteCourseTitleAr: string;
  nature: 'HARD' | 'ADVISORY' | 'CONCURRENT';
}

export interface MiniAppCourse {
  code: string;
  titleAr: string;
  titleEn: string;
  stage: MiniAppStage;
  semester: MiniAppSemester;
  credits: number;
  lectureHours: number;
  labHours: number;
  tutorialHours: number;
  courseType: string;
  topics: MiniAppTopic[];
  prerequisites: MiniAppPrerequisiteRef[];
  hasConflict?: boolean | undefined;
  conflictNotes?: string | undefined;
  isIdentityOnly?: boolean | undefined;
}

export interface MiniAppStudentContext {
  studentName?: string | undefined;
  stage: MiniAppStage;
  programSemester: MiniAppSemester;
  section?: string | undefined;
  subgroup?: string | undefined;
  isTelegram: boolean;
  colorScheme: 'dark' | 'light';
}

/**
 * Telegram WebApp JS Interface declarations
 */
export interface TelegramThemeParams {
  bg_color?: string;
  text_color?: string;
  hint_color?: string;
  link_color?: string;
  button_color?: string;
  button_text_color?: string;
  secondary_bg_color?: string;
  header_bg_color?: string;
  accent_text_color?: string;
  section_bg_color?: string;
  section_header_text_color?: string;
  subtitle_text_color?: string;
  destructive_text_color?: string;
}

export interface TelegramWebAppUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export interface TelegramWebAppInitDataUnsafe {
  query_id?: string;
  user?: TelegramWebAppUser;
  auth_date?: string;
  hash?: string;
  start_param?: string;
}

export interface TelegramHapticFeedback {
  impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
  notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
  selectionChanged: () => void;
}

export interface TelegramWebAppInterface {
  initData: string;
  initDataUnsafe: TelegramWebAppInitDataUnsafe;
  version: string;
  platform: string;
  colorScheme: 'dark' | 'light';
  themeParams: TelegramThemeParams;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;
  BackButton: {
    isVisible: boolean;
    show: () => void;
    hide: () => void;
    onClick: (cb: () => void) => void;
    offClick: (cb: () => void) => void;
  };
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    isProgressVisible: boolean;
    setText: (text: string) => void;
    onClick: (cb: () => void) => void;
    show: () => void;
    hide: () => void;
  };
  HapticFeedback: TelegramHapticFeedback;
  ready: () => void;
  expand: () => void;
  close: () => void;
  setHeaderColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  openLink: (url: string) => void;
  openTelegramLink: (url: string) => void;
  sendData: (data: string) => void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebAppInterface;
    };
  }
}
