import { Stage, ProgramSemester } from '@mecha-bot/academic';
import type {
  WhereAreWeAppResponse,
  ImLostAppResponse,
  SearchAndDeliverResponse,
  StudentDashboardSummary,
} from '@mecha-bot/wiring';
import type { TimetableSlot } from '@mecha-bot/timetable';
import type { Reminder } from '@mecha-bot/scheduler';
import type { AcademicEvent, PracticeQuiz, QuizQuestion, QuizAttempt } from '@mecha-bot/exams';
import type { DeliveryDecision } from '@mecha-bot/distribution';
import { STAGE_NAMES_AR, SEMESTER_NAMES_AR } from './constants.js';

export function renderStageSelectionView(): string {
  return [
    '🎓 أهلاً بك في Mecha Bot',
    '',
    'مساعدك الأكاديمي لقسم هندسة الميكاترونكس — جامعة البصرة.',
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

export function renderMainMenuView(
  stage: Stage,
  semester: ProgramSemester,
  activeCourseCode?: string | null,
  activeCourseName?: string | null,
): string {
  const courseText =
    activeCourseCode && activeCourseName
      ? `${activeCourseCode} — ${activeCourseName}`
      : activeCourseCode || 'غير محددة (اضغط موادي للاختيار)';

  return [
    '🎓 *القائمة الرئيسية — Mecha Bot*',
    '',
    `📌 المرحلة: ${STAGE_NAMES_AR[stage]} › ${SEMESTER_NAMES_AR[semester]}`,
    `🎛 المادة الحالية: *${courseText}*`,
    '',
    'اختر ما تريد من الأوامر أدناه:',
  ].join('\n');
}

export function renderCourseHomeView(
  code: string,
  nameAr: string,
  stage: Stage,
  semester: ProgramSemester,
): string {
  return [
    `🎛 *${code} — ${nameAr}*`,
    `${STAGE_NAMES_AR[stage]} › ${SEMESTER_NAMES_AR[semester]}`,
    '',
    'أصبحت هذه المادة الحالية.',
    '',
    'اختر الإجراء المطلوب للمادة:',
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
    `🎛 *${code} — ${nameAr}*`,
    `${STAGE_NAMES_AR[stage]} › ${SEMESTER_NAMES_AR[semester]}`,
    '',
    'تگدر تتابع المادة الحالية أو تفتح القائمة الرئيسية:',
  ].join('\n');
}

/**
 * "وين وصلنا؟" View Renderer
 * Enforces the core non-negotiable principle:
 * Calendar Position = EXPECTED
 * Course Pulse = VERIFIED or INFERRED
 * Student Position = CONFIRMED_BY_STUDENT
 * Inference is NEVER confirmation!
 */
export function renderWhereAreWeView(
  response: WhereAreWeAppResponse,
  courseNameAr?: string,
): string {
  const title = courseNameAr
    ? `📍 *متابعة مادة (${response.courseCode}) — ${courseNameAr}*`
    : `📍 *متابعة مادة (${response.courseCode})*`;

  // CASE D: Academic conflict (e.g. MCT124)
  if (response.hasConflict) {
    const statusText = response.conflictDetails?.status || 'CONFLICTING';
    const resText = response.conflictDetails?.resolutionStatus || 'UNRESOLVED';
    return [
      `⚠️ *تنبيه أكاديمي: تضارب منهجي في المادة (${response.courseCode})*`,
      '',
      `الحالة: ${statusText} (${resText})`,
      'عندي تعارض ببيانات المادة بين المصادر المعتمدة، لذلك ما أريد أخمّن عليك تجنباً لأي خطأ.',
      `التفاصيل: ${response.conflictDetails?.description ?? 'تضارب في توصيف المقرر'}`,
      '',
      'يرجى التأكد من ممثل المرحلة أو رئاسة القسم لتأكيد المفردات الرسمية.',
    ].join('\n');
  }

  // CASE E: Identity-only course (e.g. P4MCT)
  if (!response.hasTopics && response.topicMapStatus === 'IDENTITY_ONLY') {
    return [
      `ℹ️ *المادة (${response.courseCode}) معرفة بالهوية فقط*`,
      '',
      'هذه المادة مسجلة في الدليل كمعرف هوية دون شجرة مواضيع تفصيلية.',
      'ما أگدر أفرض أو أخمن مواضيع دراسية غير موثقة رسمياً.',
      'لا يمكن تقديم اقتراح زمني آلي دون تأكيد مفردات المحاضر.',
    ].join('\n');
  }

  const lines: string[] = [title, ''];

  // CASE C: Student has explicit confirmed progress
  const hasConfirmedPos =
    response.studentPosition &&
    response.studentPosition.status === 'CONFIRMED_BY_STUDENT' &&
    response.studentPosition.lastUnderstoodTopicKey;

  if (hasConfirmedPos) {
    lines.push(`✅ *موضعك المؤكد حالياً:* ${response.studentPosition!.lastUnderstoodTopicKey}`);
    lines.push('');
  }

  const suggestedTopic =
    response.suggestedTopicTitleAr || response.suggestedTopicTitleEn || response.suggestedTopicKey;

  // CASE B: Course pulse exists as classroom evidence
  if (
    response.coursePulse &&
    (response.coursePulse.topicKey || response.coursePulse.freeTextTopic)
  ) {
    const pulseTopic =
      response.suggestedTopicTitleAr ||
      response.suggestedTopicTitleEn ||
      response.coursePulse.topicKey ||
      response.coursePulse.freeTextTopic ||
      'الموضوع المحدد في نبض المادة';
    lines.push(`📊 *حسب آخر نبض للمادة:* الشعبة واصلة تقريباً إلى: *${pulseTopic}*.`);
    lines.push('(هذا تقدير لنبض الشعبة، مو موضعك الشخصي).');
    lines.push('');
    lines.push('💡 *بوت ميكا يقترح ويسألك للتأكيد:*');
    lines.push(`وصلتوا فعلياً لهذا الموضوع بالمحاضرات؟`);
  }
  // CASE A: Calendar only estimation
  else {
    const weekText = response.calendarPosition?.academicWeek
      ? `الأسبوع الأكاديمي المتوقع: الأسبوع ${response.calendarPosition.academicWeek}`
      : '';
    if (weekText) lines.push(`📅 ${weekText}`);
    lines.push(`الموضوع المتوقع: *${suggestedTopic ?? 'غير محدد'}*`);
    lines.push('');
    lines.push(`حسب التقويم أنت تقريباً بموضوع: *${suggestedTopic ?? 'غير محدد'}*.`);
    lines.push('هذا تقدير حسب الجدول والتقويم، مو تأكيد لموضعك الشخصي.');
    lines.push('');
    lines.push('💡 *بوت ميكا يقترح ويسألك للتأكيد:*');
    lines.push('وصلتوا فعلياً لهذا الموضوع بالدراسة؟');
  }

  if (response.notes && response.notes.length > 0) {
    lines.push('');
    lines.push(`ملاحظة: ${response.notes.join('\n')}`);
  }

  return lines.join('\n');
}

export function renderConfirmPositionSuccessView(
  courseCode: string,
  topicTitleOrKey: string,
): string {
  return [
    '✅ *تم تأكيد موضعك بنجاح!*',
    '',
    `تم تسجيل موضعك المؤكد في مادة (*${courseCode}*) عند:`,
    `📌 *${topicTitleOrKey}*`,
    '',
    'هذا الموضع مسجل الآن كتقدم دراسي مؤكد من قبلك.',
  ].join('\n');
}

export function renderDeclineConfirmationView(courseCode?: string): string {
  const suffix = courseCode ? ` في مادة (${courseCode})` : '';
  return [
    '👍 *تمام، موضعك يبقى كما هو.*',
    '',
    `ما غيرت موضعك${suffix}. راح يبقى كما هو حتى تأكده بنفسك شوكت ما توصل له.`,
  ].join('\n');
}

/**
 * "أني ضايع" View Renderer
 */
export function renderImLostView(diagnosis: ImLostAppResponse, courseNameAr?: string): string {
  const header = courseNameAr
    ? `🧭 *تشخيص الاستدراك لمادة (${diagnosis.courseCode}) — ${courseNameAr}*`
    : `🧭 *تشخيص الاستدراك لمادة (${diagnosis.courseCode})*`;

  if (diagnosis.status === 'ACADEMIC_DATA_CONFLICT') {
    return [
      `⚠️ *تعذر إعداد خطة الاستدراك (${diagnosis.courseCode})*`,
      '',
      'عندي تعارض ببيانات المادة الرسمية، لذلك ما أگدر أخمن خطة استدراك تفصيلية.',
      `التوضيح: ${diagnosis.explanationNote}`,
    ].join('\n');
  }

  if (diagnosis.status === 'INSUFFICIENT_ACADEMIC_MAP') {
    return [
      `ℹ️ *المادة (${diagnosis.courseCode}) غير مفصلة المواضيع*`,
      '',
      'المادة مسجلة كمعرف هوية دون شجرة مواضيع تفصيلية، لذلك لا يمكن توليد مسار استدراك آلي.',
      `التوضيح: ${diagnosis.explanationNote}`,
    ].join('\n');
  }

  if (diagnosis.status === 'NEEDS_BASELINE') {
    return [
      header,
      '',
      '📍 *تحتاج تحديد موضع البداية:*',
      'حتى أبني لك خطة استدراك دقيقة، أحتاج أعرف آخر موضوع درسته أو فهمته بالمادة.',
      'تگدر تأكد موضعك من شاشة "وين وصلنا؟" أولاً.',
    ].join('\n');
  }

  if (diagnosis.status === 'COURSE_CLARIFICATION_REQUIRED') {
    const candidates = diagnosis.candidateCourseCodes?.join(', ') || '';
    return [
      '⚠️ *يرجى توضيح المادة المطلوبة*',
      '',
      diagnosis.explanationNote,
      candidates ? `المواد المحتملة: ${candidates}` : '',
    ].join('\n');
  }

  const lines: string[] = [header, ''];

  if (diagnosis.status === 'CATCH_UP_REQUIRED' || diagnosis.status === 'REVIEW_RECOMMENDED') {
    lines.push('⚠️ *تم تشخيص الحاجة للاستدراك ومراجعة المتطلبات.*');
    if (diagnosis.missingPrerequisites.length > 0) {
      lines.push(`المفردات المطلوبة: ${diagnosis.missingPrerequisites.join(' ← ')}`);
    }
  } else if (diagnosis.status === 'ON_TRACK') {
    lines.push('✅ *أنت مواكب للمنهج المتوقع!* لا توجد فجوات متطلبات مسجلة.');
  }

  if (diagnosis.explanationNote) {
    lines.push(`التوضيح: ${diagnosis.explanationNote}`);
  }

  if (diagnosis.catchUpPlan && diagnosis.catchUpPlan.steps.length > 0) {
    lines.push('');
    lines.push('📌 *خطوات خطة الاستدراك المقترحة:*');
    diagnosis.catchUpPlan.steps.forEach((step, idx) => {
      const stepTitle = step.titleAr || step.titleEn;
      lines.push(`${idx + 1}. *${stepTitle}* (${step.reason})`);
    });

    if (diagnosis.catchUpPlan.studyBudgetPlan) {
      lines.push('');
      lines.push(
        `⏱️ ميزانية الدراسة المقترحة: *${diagnosis.catchUpPlan.studyBudgetPlan.totalBudgetMinutes} دقيقة*.`,
      );
    }
  }

  return lines.join('\n');
}

/**
 * Search Results View
 * Distinguishes searchability from distributability!
 */
export function renderSearchResultsView(response: SearchAndDeliverResponse, query: string): string {
  if (response.totalMatches === 0) {
    return [
      `🔍 *نتائج البحث عن:* "${query}"`,
      '',
      'لم يتم العثور على أي نتائج مطابقة في مصادر القسم أو المقررات.',
      '💡 نصيحة: جرب البحث بكلمات أخرى أو اسم المادة (مثلاً: ستاتيك، موائع، اهتزازات، MCT211).',
    ].join('\n');
  }

  const lines: string[] = [
    `🔍 *نتائج البحث الأكاديمي (${response.totalMatches} نتيجة) عن:* "${query}"`,
    '',
  ];

  const docTypeLabels: Record<string, string> = {
    LECTURER_NOTE: '📖 ملزمة أستاذ',
    TEXTBOOK: '📚 كتاب منهجي معتمد',
    STUDENT_SUMMARY: '📝 ملخص دراسي معتمد',
    OFFICIAL_SYLLABUS: '📑 مفردات المنهج الرسمي',
    EXAM_SCHEDULE: '📅 موعد امتحان رسمي',
    CURRICULUM_TOPIC: '📑 مفردة منهج مقررة',
  };

  response.hits.slice(0, 5).forEach((hit, idx) => {
    const doc = hit.searchResult;
    const course = doc.courseCode ? `[${doc.courseCode}] ` : '';
    const typeLabel = docTypeLabels[doc.documentType] || '📄 مصدر أكاديمي';

    let statusLine = '';
    if (hit.deliveryDecision?.status === 'READY_TELEGRAM_FILE') {
      statusLine = '\n   📥 _(متاح للتحميل الفوري عبر تيليجرام)_';
    } else if (hit.deliveryDecision?.status === 'READY_EXTERNAL_LINK') {
      statusLine = '\n   🔗 _(رابط تحميل مباشر)_';
    } else if (
      hit.deliveryDecision?.status === 'BLOCKED_POLICY' &&
      doc.documentType !== 'EXAM_SCHEDULE' &&
      doc.documentType !== 'CURRICULUM_TOPIC'
    ) {
      statusLine = '\n   ℹ️ _(مرجع للمعاينة والبحث الأكاديمي — BLOCKED_POLICY)_';
    }

    const docTitle = hit.deliveryDecision?.fileRecord?.title || doc.textExcerpt;
    lines.push(`${idx + 1}. *${course}${typeLabel} [${doc.documentType}]*`);
    lines.push(`   ${docTitle}${statusLine}`);
    lines.push('');
  });

  return lines.join('\n');
}

/**
 * File Delivery Result View
 */
export function renderDeliveryResultView(decision: DeliveryDecision): string {
  if (decision.status === 'BLOCKED_POLICY') {
    return [
      '🚫 *عذراً، هذا الملف محجوب عن التوزيع*',
      '',
      'الملف موجود بالسجل الأكاديمي، لكن ما أقدر أوزعه وفق سياسة المصدر.',
      `السبب: ${decision.reason}`,
    ].join('\n');
  }

  if (decision.status === 'READY_EXTERNAL_LINK' && decision.externalUrl) {
    const lines = [
      '📥 *رابط تحميل الملف:*',
      '',
      `الملف: *${decision.fileRecord?.title ?? 'ملف أكاديمي'}*`,
      `🔗 [اضغط هنا لتحميل الملف](${decision.externalUrl})`,
    ];
    if (decision.fileRecord?.notes) {
      lines.push('', '📝 *ملخص المحتوى والملاحظات الأكاديمية:*', decision.fileRecord.notes);
    }
    return lines.join('\n');
  }

  if (decision.status === 'READY_TELEGRAM_FILE') {
    const lines = [
      '📥 *تم تجهيز الملف للإرسال عبر تيليجرام:*',
      '',
      `الملف: *${decision.fileRecord?.title ?? 'ملف أكاديمي'}*`,
    ];
    if (decision.fileRecord?.notes) {
      lines.push('', '📝 *ملخص المحتوى والملاحظات الأكاديمية:*', decision.fileRecord.notes);
    }
    return lines.join('\n');
  }

  if (decision.status === 'NOT_FOUND') {
    return '❌ لم يتم العثور على الملف المطلوب في السجل الأكاديمي.';
  }

  return `ℹ️ حالة التسليم: ${decision.status} (${decision.reason})`;
}

/**
 * Timetable View
 */
export function renderTimetableView(
  slots: TimetableSlot[],
  stage: Stage,
  semester: ProgramSemester,
  dateStr?: string,
): string {
  const dateLabel = dateStr ? ` ليوم ${dateStr}` : ' اليوم';
  const header = [
    `📅 *جدول المحاضرات${dateLabel} (توقيت بغداد)*`,
    `${STAGE_NAMES_AR[stage]} › ${SEMESTER_NAMES_AR[semester]}`,
    '',
  ];

  if (slots.length === 0) {
    header.push('لا توجد محاضرات مجدولة لهذا اليوم 🎉');
    header.push('استغل الوقت بمراجعة المواد أو حل التمارين!');
    return header.join('\n');
  }

  const lines = [...header];
  slots.forEach((slot, idx) => {
    const room = slot.room ? `📍 القاعة: ${slot.room}` : '';
    const instructor = slot.lecturerDisplayName ? `👤 التدريسي: ${slot.lecturerDisplayName}` : '';
    const typeLabel =
      slot.type === 'LAB' ? 'معمل/مختبر' : slot.type === 'TUTORIAL' ? 'مناقشة' : 'محاضرة';

    lines.push(
      `${idx + 1}. *${slot.courseCode}* (${typeLabel})\n` +
        `   ⏰ ${slot.startTime} – ${slot.endTime}\n` +
        (room || instructor ? `   ${[room, instructor].filter(Boolean).join(' | ')}\n` : ''),
    );
  });

  return lines.join('\n');
}

/**
 * Reminders View
 */
export function renderRemindersView(reminders: Reminder[]): string {
  const header = ['🔔 *التذكيرات المجدولة القادمة (توقيت بغداد)*', ''];

  if (reminders.length === 0) {
    header.push('لا توجد تذكيرات نشطة لـ 24 ساعة القادمة.');
    header.push('تگدر تفعّل تذكيرات جدول المحاضرات أو مواعيد الامتحانات بسهولة!');
    return header.join('\n');
  }

  const lines = [...header];
  reminders.forEach((r, idx) => {
    const course = r.relatedCourseCode ? ` [${r.relatedCourseCode}]` : '';
    const dueTime = r.dueAt
      ? new Date(r.dueAt).toLocaleTimeString('ar-IQ', {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'Asia/Baghdad',
        })
      : '';
    lines.push(`${idx + 1}. *${r.title}*${course}\n   ⏰ الموعد: ${dueTime}`);
  });

  return lines.join('\n');
}

/**
 * Exams & Quizzes View
 */
export function renderExamsView(
  courseCode: string,
  courseNameAr: string,
  events: AcademicEvent[],
  pastQuestionsCount: number,
): string {
  const lines = [`📝 *الامتحانات والأسئلة لمادة (${courseCode})*`, `المادة: *${courseNameAr}*`, ''];

  if (events.length > 0) {
    lines.push('📌 *الامتحانات والتقييمات القادمة:*');
    events.forEach((ev, idx) => {
      const occurs = ev.occursAt ? ` (الموعد: ${ev.occursAt.slice(0, 10)})` : '';
      lines.push(`${idx + 1}. *${ev.title}* [${ev.type}]${occurs}`);
      if (ev.coverage.length > 0) {
        lines.push(`   المفردات المشمولة: ${ev.coverage.join(', ')}`);
      }
    });
    lines.push('');
  } else {
    lines.push('لا توجد مواعيد امتحانات رسمية معلنة حالياً لهذه المادة.');
    lines.push('');
  }

  lines.push(`📚 عدد الأسئلة الامتحانية السابقة المتوفرة: *${pastQuestionsCount}* سؤال.`);

  return lines.join('\n');
}

/**
 * Quiz Question View
 */
export function renderQuizQuestionView(
  quiz: PracticeQuiz,
  question: QuizQuestion,
  questionIndex: number,
  totalQuestions: number,
): string {
  const lines = [
    `✍️ *كويز تجريبي: ${quiz.title}*`,
    `السؤال (${questionIndex + 1} من ${totalQuestions}):`,
    '',
    `❓ *${question.prompt}*`,
    '',
  ];

  if (question.type === 'MULTIPLE_CHOICE') {
    const labels = ['A', 'B', 'C', 'D', 'E'];
    question.options.forEach((opt, idx) => {
      lines.push(`*${labels[idx] ?? String(idx + 1)})* ${opt.text}`);
    });
  } else {
    lines.push('*A)* صح (True)');
    lines.push('*B)* خطأ (False)');
  }

  return lines.join('\n');
}

/**
 * Quiz Result View
 */
export function renderQuizResultView(attempt: QuizAttempt, quizTitle: string): string {
  let gradeComment = 'أداء ممتاز، استمر بالتفوق! 🌟';
  if (attempt.percentage < 50) {
    gradeComment = 'تحتاج مراجعة المواضيع الأساسية، تگدر تستخدم "أني ضايع" للمساعدة. 💪';
  } else if (attempt.percentage < 75) {
    gradeComment = 'نتيجة جيدة، راجع الأسئلة اللي خطأت بيها لتعزيز الفهم. 👍';
  }

  return [
    `🏁 *نتيجة الكويز التجريبي: ${quizTitle}*`,
    '',
    `📊 الدرجة المستحقة: *${attempt.rawScore} / ${attempt.maxScore}*`,
    `🎯 النسبة المئوية: *${attempt.percentage.toFixed(1)}%*`,
    '',
    gradeComment,
  ].join('\n');
}

export function renderStudyPlaceholderView(
  code: string,
  nameAr: string,
  calendarWeek?: number | null,
): string {
  const lines = [
    `🎛 *${code} — ${nameAr}*`,
    '',
    '📚 *لوحة المادة الدراسية:* جميع ملفات وميزات المادة مفعلة بالكامل.',
  ];

  if (calendarWeek && calendarWeek > 0) {
    lines.push('');
    lines.push(`أنت حالياً تقريباً بالأسبوع ${calendarWeek} حسب التقويم.`);
  }

  lines.push('');
  lines.push('إذا دخلت البوت بنص الفصل، مو مشكلة.');
  lines.push('تگدر تحدد آخر موضوع أخذتوه من زر "وين وصلنا؟" حتى أضبط المادة عليك.');

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
    'المادة الحالية: ' + courseText,
    'المنطقة الزمنية: Asia/Baghdad',
    'اللغة: العربية',
  ].join('\n');
}

/**
 * Renders structured academic explanation response from AI Brain in natural Iraqi Arabic.
 */
export function renderAiExplanationView(
  response: {
    courseCode?: string | null | undefined;
    topic?: string | null | undefined;
    answer: string;
    equations?: string[] | undefined;
    citations?: Array<{ title: string; page?: number | undefined }> | undefined;
    disclaimer?: string | undefined;
    needsClarification?: boolean | undefined;
    clarificationPrompt?: string | undefined;
  },
  courseNameAr?: string | null | undefined,
): string {
  const lines: string[] = [];

  // Header
  if (response.courseCode) {
    const courseText = courseNameAr
      ? `${response.courseCode} (${courseNameAr})`
      : response.courseCode;
    const topicText = response.topic ? ` › ${response.topic}` : '';
    lines.push(`🧠 *المخ الذكي | ${courseText}${topicText}*`);
  } else {
    lines.push('🧠 *المخ الذكي — قسم هندسة الميكاترونكس*');
  }
  lines.push('');

  // Main answer
  lines.push(response.answer);

  // Equations if present
  if (response.equations && response.equations.length > 0) {
    lines.push('');
    lines.push('📐 *المعادلات الهندسية:*');
    for (const eq of response.equations) {
      lines.push(`\`${eq}\``);
    }
  }

  // Citations if present
  if (response.citations && response.citations.length > 0) {
    lines.push('');
    lines.push('📚 *المصادر الأكاديمية المعتمدة:*');
    for (const cit of response.citations) {
      const pageStr = cit.page ? ` (ص ${cit.page})` : '';
      lines.push(`• ${cit.title}${pageStr}`);
    }
  }

  // Academic disclaimer (e.g. MCT124 or P4MCT)
  if (response.disclaimer) {
    lines.push('');
    lines.push(`⚠️ *تنبيه أكاديمي:* ${response.disclaimer}`);
  }

  // Clarification prompt if ambiguous
  if (response.needsClarification && response.clarificationPrompt) {
    lines.push('');
    lines.push(`💡 *تأكيد المطلوب:* ${response.clarificationPrompt}`);
  }

  return lines.join('\n');
}

export function renderStudentDashboardView(
  summary: StudentDashboardSummary,
  options?: { studentName?: string | undefined } | undefined,
): string {
  const {
    academicProgress,
    courses,
    studyActivity,
    upcomingEvents,
    quizPerformance,
    timetable,
    reminders,
  } = summary;

  const lines: string[] = [];
  const nameGreeting = options?.studentName ? ` للزميل *${options.studentName}*` : '';
  lines.push(`📊 *لوحة تحكم الطالب${nameGreeting}*`);
  lines.push('');

  // 1. Stage, Semester & Academic Week
  const isPreSem = academicProgress.academicWeek === 0 || !academicProgress.isTeachingWeek;
  const weekLabel =
    academicProgress.academicWeek > 0
      ? `الأسبوع ${academicProgress.academicWeek} (${academicProgress.isTeachingWeek ? 'دراسي' : 'غير تدريسي'})`
      : '🌴 عطلة صيفية / فترة الاستعداد والتسجيل (يبدأ الدوام في 4 تشرين الأول / أكتوبر)';

  lines.push(
    `🎓 *المرحلة:* ${STAGE_NAMES_AR[academicProgress.stage]} › ${SEMESTER_NAMES_AR[academicProgress.programSemester]}`,
  );
  lines.push(`📅 *التقويم الأكاديمي:* ${weekLabel}`);
  lines.push('');

  // 2. Academic Progress & Invariant Contrast
  lines.push('📈 *نسبة الإنجاز الأكاديمي:*');
  lines.push(
    `  • إنجازك المؤكد: *${academicProgress.overallConfirmedMasteryPercentage}%* (بحسب تأكيدك المباشر فقط)`,
  );
  lines.push(
    `  • التقدير الزمني للتقويم: *${academicProgress.overallCalendarExpectedPercentage}%* (المتوقع للأسبوع الحالي)`,
  );
  if (isPreSem) {
    lines.push(
      '  🌴 *فترة الاستعداد الصيفي*: العام الدراسي يبدأ قريباً. المناهج والملازم متوفرة للتحضير المسبق.',
    );
  } else if (academicProgress.coursesNeedingCatchUpCount > 0) {
    lines.push(
      `  ⚠️ *${academicProgress.coursesNeedingCatchUpCount}* مواد تحتاج إلى مراجعة أو تحديد نقطة انطلاق.`,
    );
  }
  lines.push('');

  // 3. Courses Breakdown
  lines.push('📚 *حالة المواد:*');
  for (const c of courses) {
    if (c.hasConflict) {
      lines.push(`  • *${c.courseCode}* — ${c.courseTitle}`);
      lines.push(`    ⚠️ *تضارب منهجي (غير محلول)*: لا يوجد تسلسل موثق للتقدم.`);
    } else if (c.isIdentityOnly) {
      lines.push(`  • *${c.courseCode}* — ${c.courseTitle}`);
      lines.push(`    ℹ️ *معرّف بالهوية فقط*: لم يُضف مخطط المواضيع التفصيلي بعد.`);
    } else {
      const confirmedPct = c.confirmedMasteryPercentage ?? 0;
      const expectedPct = c.calendarExpectedPercentage ?? 0;
      const statusIcon = isPreSem
        ? '🌴 تحضير صيفي'
        : c.catchUpStatus === 'BEHIND'
          ? '🔻 متأخر'
          : c.catchUpStatus === 'AHEAD'
            ? '🔹 متقدم'
            : c.catchUpStatus === 'NEEDS_BASELINE'
              ? '🔸 بانتظار التأكيد'
              : '✅ متزامن';

      lines.push(`  • *${c.courseCode}* (${c.courseTitle}): ${statusIcon}`);
      lines.push(
        `    إنجازك: *${confirmedPct}%* (${c.confirmedTopicsCount}/${c.totalTopics}) | المتوقع: *${expectedPct}%*`,
      );
    }
  }
  lines.push('');

  // 4. Study Activity & Streaks
  lines.push('🔥 *نشاط وسلسلة الدراسة:*');
  lines.push(`  • السلسلة الحالية: *${studyActivity.currentStudyDayStreak}* يوم متواصل`);
  lines.push(`  • جلسات آخر 7 أيام: *${studyActivity.last7DaysSessionCount}* جلسة`);
  lines.push(`  • مجموع وقت الدراسة: *${studyActivity.totalStudyMinutes}* دقيقة`);
  if (studyActivity.hasActiveSession) {
    lines.push(
      `  🟢 *توجد جلسة دراسة نشطة حالياً*${studyActivity.activeSessionCourseCode ? ` (${studyActivity.activeSessionCourseCode})` : ''}`,
    );
  }
  lines.push('');

  // 5. Timetable Today
  lines.push('⏰ *جدول اليوم:*');
  if (isPreSem) {
    lines.push('  • 🌴 العطلة الصيفية — لا توجد محاضرات اليوم.');
    lines.push('  • يبدأ جدول المحاضرات الأسبوعي مع انطلاق الفصل الدراسي.');
  } else {
    lines.push(`  • عدد المحاضرات: *${timetable.todayLectureCount}*`);
    if (timetable.nextLecture) {
      lines.push(
        `  • المحاضرة القادمة: *${timetable.nextLecture.subjectName}* (${timetable.nextLecture.room}) في *${timetable.nextLecture.startTime}*`,
      );
    }
  }
  lines.push('');

  // 6. Exams & Quizzes
  lines.push('📝 *الامتحانات والكويزات:*');
  if (isPreSem) {
    lines.push('  • ℹ️ لا توجد امتحانات معلنة خلال فترة العطلة الصيفية.');
  } else if (upcomingEvents.length > 0) {
    const nextEv = upcomingEvents[0]!;
    const remainingText = nextEv.daysRemaining === 0 ? 'اليوم!' : `بعد ${nextEv.daysRemaining} يوم`;
    lines.push(`  • القادم: *${nextEv.title}* (${nextEv.courseCode}) — ${remainingText}`);
  } else {
    lines.push('  • لا توجد امتحانات معلنة قريباً.');
  }

  if (quizPerformance.totalAttempts > 0) {
    lines.push(
      `  • إحصائيات الكويزات: *${quizPerformance.totalAttempts}* محاولة | المعدل: *${quizPerformance.averageScorePercentage}%*`,
    );
  }
  lines.push('');

  // 7. Reminders
  lines.push('🔔 *التذكيرات:*');
  lines.push(`  • لديك *${reminders.activePendingRemindersCount}* تذكير قيد الانتظار.`);
  if (reminders.nextReminder) {
    lines.push(`  • القادم: *${reminders.nextReminder.title}*`);
  }

  return lines.join('\n');
}

/**
 * Renders the Admin Control Panel Overview.
 */
export function renderAdminMenuView(): string {
  return [
    '🛠️ *لوحة إدارة المواد والمصادر الأكاديمية*',
    'قسم هندسة الميكاترونكس — جامعة البصرة',
    '',
    'أهلاً بك يا أستاذ/مشرف المادة! من هنا يمكنك:',
    '• 📤 *إضافة ملزمة أستاذ*: رفع ملازم المحاضرات الرسمية بصيغة PDF أو روابط Drive.',
    '• 📝 *إضافة ملخص مادة*: نشر ملخصات دراسية معتمدة لمساعدة الطلبة.',
    '',
    'اختر الإجراء المطلوب من الأزرار أدناه:',
  ].join('\n');
}

/**
 * Renders prompt to choose course code for uploading material.
 */
export function renderAdminSelectCourseView(
  materialType: 'LECTURER_NOTE' | 'STUDENT_NOTE',
): string {
  const typeName = materialType === 'LECTURER_NOTE' ? 'ملزمة أستاذ' : 'ملخص مادة';
  return [
    `📤 *إضافة ${typeName} جديدة*`,
    '',
    'يرجى اختيار المقرر الدراسي الذي تتبع له هذه المادة من القائمة أدناه:',
  ].join('\n');
}

/**
 * Renders prompt awaiting file upload from admin.
 */
export function renderAdminAwaitingUploadView(
  materialType: 'LECTURER_NOTE' | 'STUDENT_NOTE',
  courseCode: string,
): string {
  const typeName = materialType === 'LECTURER_NOTE' ? 'ملزمة أستاذ' : 'ملخص مادة';
  return [
    `📥 *بانتظار إرسال (${typeName}) لمادة (${courseCode})*`,
    '',
    'الآن يمكنك:',
    '1. إرسال ملف الـ PDF مباشرة إلى البوت مع كتابة اسم الملزمة في الـ Caption.',
    '2. أو إرسال رابط Google Drive المباشر في رسالة نصية مع العنوان.',
    '',
    '⚠️ *ملاحظة:* سيتم نشر الملف فوراً ليصبح متاحاً للطلبة في قائمة ملفات المادة ومحرك البحث.',
  ].join('\n');
}

/**
 * Renders success confirmation when admin adds material.
 */
export function renderAdminMaterialSuccessView(
  materialType: 'LECTURER_NOTE' | 'STUDENT_NOTE',
  courseCode: string,
  title: string,
): string {
  const typeName = materialType === 'LECTURER_NOTE' ? 'الملزمة' : 'الملخص';
  return [
    `✅ *تم نشر ${typeName} بنجاح!*`,
    '',
    `• *المقرر:* ${courseCode}`,
    `• *العنوان:* ${title}`,
    `• *حالة التوزيع:* متاح للتحميل الفوري للطلبة عبر تيليجرام 📁`,
    '',
    'شكراً لجهودكم في دعم المسيرة التعليمية لطلبة هندسة الميكاترونكس!',
  ].join('\n');
}
