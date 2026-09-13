import { Context } from 'grammy';
import { DatabaseConnection } from '@mecha-bot/database';
import { Clock, formatToAcademicDate } from '@mecha-bot/shared';

export interface HealthHandlerDeps {
  db: DatabaseConnection;
  clock: Clock;
  env: string;
  uptimeStartMs: number;
}

export function createHealthHandler(deps: HealthHandlerDeps) {
  return async (ctx: Context): Promise<void> => {
    let dbStatus = 'ONLINE';
    try {
      deps.db.queryOne('SELECT 1;');
    } catch {
      dbStatus = 'OFFLINE';
    }

    const now = deps.clock.now();
    const utcIso = deps.clock.nowIso();
    const localAcademicDate = formatToAcademicDate(now, 'Asia/Baghdad');
    const uptimeSec = Math.floor((deps.clock.nowEpochMs() - deps.uptimeStartMs) / 1000);

    const message = [
      '📊 تقرير حالة النظام (System Health Report):',
      '────────────────────────────',
      `• الحالة العامة: ${dbStatus === 'ONLINE' ? '🟢 جاهز (READY)' : '🔴 تعثر (ERROR)'}`,
      `• البيئة (Environment): ${deps.env}`,
      `• قاعدة البيانات (Database): ${dbStatus}`,
      `• التوقيت العالمي (UTC): ${utcIso}`,
      `• التاريخ الأكاديمي المحلي (Basrah): ${localAcademicDate}`,
      `• مدة التشغيل (Uptime): ${uptimeSec}s`,
      '• وضع التشغيل الأكاديمي: M0 Technical Foundation',
      '────────────────────────────',
    ].join('\n');

    await ctx.reply(message);
  };
}
