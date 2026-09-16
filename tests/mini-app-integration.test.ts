import { describe, it, expect, afterAll } from 'vitest';
import http from 'node:http';
import {
  VERIFIED_COURSES,
  VERIFIED_TIMETABLE_SLOTS,
  WEEKDAYS_MAP,
} from '../apps/mini-app/src/data.js';
import { buildClientBundle, createMiniAppServer } from '../apps/mini-app/src/server.js';
import {
  createMainMenuKeyboard,
  createDashboardKeyboard,
  createMiniAppLaunchKeyboard,
} from '../packages/telegram/src/navigation/keyboards.js';

describe('M14 Mini App: Dataset & Invariant Integrity', () => {
  it('covers courses across all 4 stages and multiple semesters', () => {
    expect(VERIFIED_COURSES.length).toBeGreaterThan(5);
    const stages = new Set(VERIFIED_COURSES.map((c) => c.stage));
    expect(stages.has(1)).toBe(true);
    expect(stages.has(2)).toBe(true);
    expect(stages.has(3)).toBe(true);
    expect(stages.has(4)).toBe(true);
  });

  it('Invariant 3: strictly marks MCT124 as conflicting with official disclaimer notes', () => {
    const mct124 = VERIFIED_COURSES.find((c) => c.code === 'MCT124');
    expect(mct124).toBeDefined();
    expect(mct124?.hasConflict).toBe(true);
    expect(mct124?.conflictNotes).toBeDefined();
    expect(mct124?.conflictNotes).toContain('تضارب منهجي غير محلول');
    expect(mct124?.conflictNotes).toContain('General Physics');
  });

  it('Invariant 4: strictly marks P4MCT as IDENTITY_ONLY with empty topic progression', () => {
    const p4mct = VERIFIED_COURSES.find((c) => c.code === 'P4MCT');
    expect(p4mct).toBeDefined();
    expect(p4mct?.isIdentityOnly).toBe(true);
    expect(p4mct?.topics).toHaveLength(0);
  });

  it('validates prerequisite relations between foundation and advanced courses', () => {
    const mct311 = VERIFIED_COURSES.find((c) => c.code === 'MCT311');
    expect(mct311).toBeDefined();
    expect(mct311?.prerequisites).toEqual(
      expect.arrayContaining([expect.objectContaining({ prerequisiteCourseCode: 'MCT221' })]),
    );

    const mct121 = VERIFIED_COURSES.find((c) => c.code === 'MCT121');
    expect(mct121).toBeDefined();
    expect(mct121?.prerequisites).toEqual(
      expect.arrayContaining([expect.objectContaining({ prerequisiteCourseCode: 'MCT111' })]),
    );
  });

  it('validates timetable slots structure and Iraqi weekday constraints', () => {
    expect(VERIFIED_TIMETABLE_SLOTS.length).toBeGreaterThan(5);

    for (const slot of VERIFIED_TIMETABLE_SLOTS) {
      expect(slot.startTime).toMatch(/^\d{2}:\d{2}$/);
      expect(slot.endTime).toMatch(/^\d{2}:\d{2}$/);
      expect(slot.room).toBeTruthy();
      expect(slot.lecturerDisplayName).toBeTruthy();
      expect(['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY']).toContain(slot.weekday);
    }

    // Friday and Saturday are weekends in Iraq
    expect(WEEKDAYS_MAP['FRIDAY']?.ar).toContain('عطلة');
    expect(WEEKDAYS_MAP['SATURDAY']?.ar).toContain('عطلة');
  });
});

describe('M14 Mini App: Client Bundling & Dev Server', () => {
  let server: http.Server | undefined;
  const testPort = 5199;

  afterAll(async () => {
    if (server) {
      await new Promise<void>((resolve) => server!.close(() => resolve()));
    }
  });

  it('bundles app.ts into valid client JavaScript via esbuild', async () => {
    const bundleJs = await buildClientBundle();
    expect(bundleJs).toBeTruthy();
    expect(bundleJs.length).toBeGreaterThan(10000);
    expect(bundleJs).toContain('MiniAppController');
    expect(bundleJs).toContain('VERIFIED_COURSES');
  });

  it('serves HTML, bundle, and CSS over HTTP with CORS headers', async () => {
    server = createMiniAppServer();
    await new Promise<void>((resolve) => {
      server!.listen(testPort, '127.0.0.1', () => resolve());
    });

    // 1. Test GET /
    const htmlRes = await fetch(`http://127.0.0.1:${testPort}/`);
    expect(htmlRes.status).toBe(200);
    expect(htmlRes.headers.get('content-type')).toContain('text/html');
    const htmlText = await htmlRes.text();
    expect(htmlText).toContain('Mecha Bot');
    expect(htmlText).toContain('telegram-web-app.js');

    // 2. Test GET /bundle.js
    const jsRes = await fetch(`http://127.0.0.1:${testPort}/bundle.js`);
    expect(jsRes.status).toBe(200);
    expect(jsRes.headers.get('content-type')).toContain('application/javascript');
    expect(jsRes.headers.get('access-control-allow-origin')).toBe('*');

    // 3. Test GET /src/index.css
    const cssRes = await fetch(`http://127.0.0.1:${testPort}/src/index.css`);
    expect(cssRes.status).toBe(200);
    expect(cssRes.headers.get('content-type')).toContain('text/css');

    // 4. Test OPTIONS preflight
    const optRes = await fetch(`http://127.0.0.1:${testPort}/`, { method: 'OPTIONS' });
    expect(optRes.status).toBe(204);
    expect(optRes.headers.get('access-control-allow-origin')).toBe('*');
  });
});

describe('M14 Mini App: Telegram Keyboard Integration', () => {
  const testMiniAppUrl = 'https://mecha-bot.pages.dev';

  it('renders web_app button in Main Menu when miniAppUrl is configured', () => {
    const kbWithUrl = createMainMenuKeyboard(true, 'MCT311', testMiniAppUrl);
    const json = JSON.stringify(kbWithUrl.inline_keyboard);
    expect(json).toContain('web_app');
    expect(json).toContain(testMiniAppUrl);
    expect(json).toContain('التطبيق المصغر');
  });

  it('omits web_app button in Main Menu when miniAppUrl is undefined', () => {
    const kbWithoutUrl = createMainMenuKeyboard(true, 'MCT311');
    const json = JSON.stringify(kbWithoutUrl.inline_keyboard);
    expect(json).not.toContain('web_app');
  });

  it('renders web_app button in Dashboard when miniAppUrl is configured', () => {
    const kbWithUrl = createDashboardKeyboard('MCT311', testMiniAppUrl);
    const json = JSON.stringify(kbWithUrl.inline_keyboard);
    expect(json).toContain('web_app');
    expect(json).toContain(testMiniAppUrl);
    expect(json).toContain('فتح التطبيق المصغر');
  });

  it('creates dedicated Mini App launch keyboard with web_app button', () => {
    const kb = createMiniAppLaunchKeyboard(testMiniAppUrl);
    const json = JSON.stringify(kb.inline_keyboard);
    expect(json).toContain('web_app');
    expect(json).toContain(testMiniAppUrl);
    expect(json).toContain('فتح تطبيق الميكاترونكس المصغر');
  });
});
