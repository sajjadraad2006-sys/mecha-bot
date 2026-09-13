import { Context } from 'grammy';

export async function handleStart(ctx: Context): Promise<void> {
  const message = [
    '🤖 مرحباً بك في المساعد الأكاديمي لقسم هندسة الميكاترونكس - جامعة البصرة',
    'Welcome to Mecha Bot - Mechatronics Academic Assistant (University of Basrah)',
    '',
    '📌 الحالة الحالية: المرحلة التأسيسية (Milestone M0 - Foundation)',
    'النظام قيد التجهيز الفني وسيقدم قريباً دعماً أكاديمياً شاملاً للمراحل الأربع:',
    '• المقررات الدراسية والمناهج المعتمدة',
    '• أسئلة الامتحانات السابقة وحلولها',
    '• التذكيرات والجداول الأسبوعية',
    '• التوجيه والمساعد الذكي الأكاديمي',
    '',
    'اكتب /help للاطلاع على الأوامر المتاحة، أو /health لفحص حالة النظام.',
  ].join('\n');

  await ctx.reply(message);
}
