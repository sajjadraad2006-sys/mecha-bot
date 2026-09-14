/**
 * Telegram Application Bridge
 *
 * Enforces the strict hexagonal adapter boundary:
 * Telegram user/chat/update
 *         ↓
 * application request (opaque studentKey)
 *         ↓
 * wiring/application layer (MechaBotApp)
 *         ↓
 * domain operation
 *         ↓
 * application response
 *         ↓
 * Telegram rendering
 *
 * RULES:
 * - NO grammY types or Telegram IDs cross into MechaBotApp or domain packages.
 * - Converts ctx.from.id -> opaque studentKey via StudentRepository.
 * - Renders localized Arabic responses.
 */

import type { Context } from 'grammy';
import type { StudentRepository } from '@mecha-bot/database';
import type { MechaBotApp, WhereAreWeAppResponse, ImLostAppResponse } from '@mecha-bot/wiring';

export interface TelegramAppBridgeDeps {
  app: MechaBotApp;
  studentRepo: StudentRepository;
}

export class TelegramAppBridge {
  private app: MechaBotApp;
  private studentRepo: StudentRepository;

  constructor(deps: TelegramAppBridgeDeps) {
    this.app = deps.app;
    this.studentRepo = deps.studentRepo;
  }

  /**
   * Resolves an opaque application studentKey from the Telegram Context.
   * Isolates the Telegram user ID at the boundary.
   */
  public resolveStudentKey(ctx: Context): string {
    const telegramUserId = ctx.from?.id;
    if (!telegramUserId) {
      throw new Error('Telegram context missing user identifier (ctx.from.id).');
    }

    const studentProfile = this.studentRepo.findOrCreate(telegramUserId);
    return studentProfile.id;
  }

  /**
   * Handles "وين وصلنا؟" command.
   */
  public async handleWhereAreWe(ctx: Context, courseCode: string): Promise<string> {
    const studentKey = this.resolveStudentKey(ctx);
    const response: WhereAreWeAppResponse = await this.app.whereAreWe(studentKey, courseCode);

    if (response.hasConflict) {
      return (
        `⚠️ *تنبيه أكاديمي: تضارب منهجي في المادة (${response.courseCode})*\n\n` +
        `الحالة: ${response.conflictDetails?.status} (${response.conflictDetails?.resolutionStatus})\n` +
        `التفاصيل: ${response.conflictDetails?.description}\n\n` +
        `يرجى مراجعة رئاسة القسم أو ممثل المرحلة لتأكيد المنهج المعتمد.`
      );
    }

    if (!response.hasTopics && response.topicMapStatus === 'IDENTITY_ONLY') {
      return (
        `ℹ️ *المادة (${response.courseCode}) معرفة بالهوية فقط*\n\n` +
        `هذه المادة مسجلة في الدليل كمعرف هوية دون شجرة مواضيع تفصيلية.\n` +
        `لا يمكن تقديم اقتراح زمني آلي دون تأكيد مفردات المحاضر.`
      );
    }

    const weekText = response.calendarPosition?.academicWeek
      ? `الأسبوع الأكاديمي المتوقع: ${response.calendarPosition.academicWeek}\n`
      : '';

    const suggestedTopic =
      response.suggestedTopicTitleAr ||
      response.suggestedTopicTitleEn ||
      response.suggestedTopicKey;

    const notesText = response.notes?.length ? `\n\nملاحظة: ${response.notes.join('\n')}` : '';

    return (
      `📍 *متابعة مادة (${response.courseCode})*\n\n` +
      `${weekText}` +
      `الموضوع المقترح: *${suggestedTopic ?? 'غير محدد'}*\n\n` +
      `💡 *بوت ميكا يقترح ويسألك للتأكيد:*\n` +
      `هل وصلتم لهذا الموضوع فعلياً في محاضراتكم؟` +
      notesText
    );
  }

  /**
   * Handles "أني ضايع" diagnosis command.
   */
  public async handleImLost(
    ctx: Context,
    courseCode: string,
    targetTopicKey?: string,
  ): Promise<string> {
    const studentKey = this.resolveStudentKey(ctx);
    const diagnosis: ImLostAppResponse = await this.app.imLost(
      studentKey,
      courseCode,
      targetTopicKey,
    );

    if (diagnosis.status === 'ACADEMIC_DATA_CONFLICT') {
      return `⚠️ تعذر إعداد خطة الاستدراك: ${diagnosis.explanationNote}`;
    }

    if (diagnosis.status === 'INSUFFICIENT_ACADEMIC_MAP') {
      return `ℹ️ ${diagnosis.explanationNote}`;
    }

    let planText = '';
    if (diagnosis.catchUpPlan && diagnosis.catchUpPlan.steps.length > 0) {
      planText =
        `\n\n📌 *خطوات خطة الاستدراك المقترحة:*\n` +
        diagnosis.catchUpPlan.steps
          .map((step, idx) => `${idx + 1}. ${step.titleAr || step.titleEn} (${step.reason})`)
          .join('\n');

      if (diagnosis.catchUpPlan.studyBudgetPlan) {
        planText +=
          `\n\n⏱️ ميزانية الدراسة المقترحة: ` +
          `${diagnosis.catchUpPlan.studyBudgetPlan.totalBudgetMinutes} دقيقة.`;
      }
    }

    return (
      `🧭 *تشخيص الاستدراك الدراسي (${diagnosis.courseCode})*\n\n` +
      `الحالة: ${diagnosis.status}\n` +
      `التوضيح: ${diagnosis.explanationNote}` +
      planText
    );
  }

  /**
   * Confirms the student's study position explicitly.
   */
  public async handleConfirmPosition(
    ctx: Context,
    courseCode: string,
    topicKey: string,
    confidence?: number,
  ): Promise<string> {
    const studentKey = this.resolveStudentKey(ctx);
    await this.app.confirmPosition({
      studentKey,
      courseCode,
      topicKey,
      confidence,
    });

    return `✅ تم تأكيد موضعك الدراسي في مادة (${courseCode}) عند الموضوع (${topicKey}) بنجاح!`;
  }

  /**
   * Handles search and delivery query.
   */
  public async handleSearch(ctx: Context, queryText: string, courseCode?: string): Promise<string> {
    const studentKey = this.resolveStudentKey(ctx);
    const searchResult = await this.app.search(
      studentKey,
      { text: queryText, courseCode },
      true, // auto-resolve delivery policy
    );

    if (searchResult.totalMatches === 0) {
      return `🔍 لم يتم العثور على نتائج مطابقة للبحث: "${queryText}".`;
    }

    const lines = searchResult.hits.map((hit, idx) => {
      const doc = hit.searchResult;
      const deliveryStatus = hit.deliveryDecision ? `[تسليم: ${hit.deliveryDecision.status}]` : '';
      return `${idx + 1}. *${doc.courseCode ?? 'عام'}*: ${doc.textExcerpt} ${deliveryStatus}`;
    });

    return (
      `🔍 *نتائج البحث الأكاديمي (${searchResult.totalMatches} نتيجة):*\n\n` + lines.join('\n\n')
    );
  }
}
