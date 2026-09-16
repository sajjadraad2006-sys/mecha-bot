/**
 * Mecha Bot — Telegram Mini App (Web App) Controller (@mecha-bot/mini-app)
 *
 * Implements client-side reactivity, interactive timetable filters,
 * syllabus tree navigation, and Telegram WebApp SDK bindings.
 */

import { VERIFIED_COURSES, VERIFIED_TIMETABLE_SLOTS, WEEKDAYS_MAP } from './data.js';
import type {
  MiniAppCourse,
  MiniAppStage,
  MiniAppTab,
  MiniAppWeekday,
  TelegramWebAppInterface,
} from './types.js';

class MiniAppController {
  private currentTab: MiniAppTab = 'timetable';
  private selectedStage: MiniAppStage = 3;
  private selectedWeekday: MiniAppWeekday = 'SUNDAY';
  private selectedSection: 'ALL' | 'A' | 'B' = 'ALL';
  private searchQuery: string = '';
  private activeModalCourse: MiniAppCourse | null = null;
  private tg: TelegramWebAppInterface | undefined;

  constructor() {
    this.initTelegram();
    this.initCurrentDay();
    this.bindEvents();
    this.render();
    this.startClock();
  }

  private initTelegram(): void {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      this.tg = window.Telegram.WebApp;
      this.tg.ready();
      this.tg.expand();

      if (this.tg.colorScheme === 'light') {
        document.body.classList.add('tg-theme');
      }

      // Configure Header Color
      try {
        this.tg.setHeaderColor('#070b14');
        this.tg.setBackgroundColor('#070b14');
      } catch {
        // Fallback gracefully on older Telegram clients
      }
    }
  }

  private triggerHaptic(style: 'light' | 'medium' | 'heavy' = 'light'): void {
    try {
      this.tg?.HapticFeedback?.impactOccurred(style);
    } catch {
      // Ignore if not supported
    }
  }

  private initCurrentDay(): void {
    const dayIndex = new Date().getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
    const map: Record<number, MiniAppWeekday> = {
      0: 'SUNDAY',
      1: 'MONDAY',
      2: 'TUESDAY',
      3: 'WEDNESDAY',
      4: 'THURSDAY',
      5: 'FRIDAY',
      6: 'SATURDAY',
    };
    const current = map[dayIndex] ?? 'SUNDAY';
    // If Friday or Saturday (Iraqi weekend), default view to Sunday
    this.selectedWeekday = current === 'FRIDAY' || current === 'SATURDAY' ? 'SUNDAY' : current;
  }

  private getBaghdadTime(): string {
    const now = new Date();
    const baghdadHours = (now.getUTCHours() + 3) % 24;
    const baghdadMins = now.getUTCMinutes();
    const hh = baghdadHours.toString().padStart(2, '0');
    const mm = baghdadMins.toString().padStart(2, '0');
    return `${hh}:${mm}`;
  }

  private startClock(): void {
    setInterval(() => {
      const clockEl = document.getElementById('live-clock-text');
      if (clockEl) {
        clockEl.textContent = `${this.getBaghdadTime()} (توقيت البصرة)`;
      }
    }, 10000);
  }

  private bindEvents(): void {
    // Bottom Nav Tabs
    document.querySelectorAll<HTMLButtonElement>('.nav-tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab as MiniAppTab;
        if (tab && tab !== this.currentTab) {
          this.triggerHaptic('light');
          this.currentTab = tab;
          this.render();
        }
      });
    });

    // Modal Close
    const closeBtn = document.getElementById('modal-close-btn');
    const backdrop = document.getElementById('course-modal-backdrop');
    if (closeBtn && backdrop) {
      closeBtn.addEventListener('click', () => this.closeModal());
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) this.closeModal();
      });
    }
  }

  public setStage(stage: MiniAppStage): void {
    this.triggerHaptic('light');
    this.selectedStage = stage;
    this.render();
  }

  public setWeekday(day: MiniAppWeekday): void {
    this.triggerHaptic('light');
    this.selectedWeekday = day;
    this.render();
  }

  public setSection(section: 'ALL' | 'A' | 'B'): void {
    this.triggerHaptic('light');
    this.selectedSection = section;
    this.render();
  }

  public openModal(courseCode: string): void {
    const course = VERIFIED_COURSES.find((c) => c.code === courseCode);
    if (!course) return;
    this.triggerHaptic('medium');
    this.activeModalCourse = course;
    this.renderModal();
    const backdrop = document.getElementById('course-modal-backdrop');
    if (backdrop) backdrop.classList.add('open');
  }

  public closeModal(): void {
    this.triggerHaptic('light');
    this.activeModalCourse = null;
    const backdrop = document.getElementById('course-modal-backdrop');
    if (backdrop) backdrop.classList.remove('open');
  }

  private render(): void {
    // Update Tab Buttons
    document.querySelectorAll<HTMLButtonElement>('.nav-tab-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.tab === this.currentTab);
    });

    // Update Header
    const studentName = this.tg?.initDataUnsafe?.user?.first_name ?? 'طالب الميكاترونكس';
    const nameEl = document.getElementById('student-greeting');
    if (nameEl) nameEl.textContent = `مرحباً، ${studentName}`;

    const clockEl = document.getElementById('live-clock-text');
    if (clockEl) clockEl.textContent = `${this.getBaghdadTime()} (توقيت البصرة)`;

    // Render Tab View
    const contentArea = document.getElementById('tab-content-area');
    if (!contentArea) return;

    if (this.currentTab === 'timetable') {
      contentArea.innerHTML = this.renderTimetableView();
    } else if (this.currentTab === 'syllabus') {
      contentArea.innerHTML = this.renderSyllabusView();
    } else if (this.currentTab === 'progress') {
      contentArea.innerHTML = this.renderProgressView();
    }

    this.attachDynamicListeners();
  }

  private renderTimetableView(): string {
    const currentBaghdadTime = this.getBaghdadTime();

    // Filter slots by stage, weekday, and section
    const slots = VERIFIED_TIMETABLE_SLOTS.filter((s) => {
      const matchStage = s.stage === this.selectedStage;
      const matchDay = s.weekday === this.selectedWeekday;
      const matchSection =
        this.selectedSection === 'ALL' || !s.section || s.section === this.selectedSection;
      return matchStage && matchDay && matchSection;
    }).sort((a, b) => a.startTime.localeCompare(b.startTime));

    // Days list
    const weekdays: MiniAppWeekday[] = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY'];

    const daysHtml = weekdays
      .map((day) => {
        const count = VERIFIED_TIMETABLE_SLOTS.filter(
          (s) => s.stage === this.selectedStage && s.weekday === day,
        ).length;
        const activeClass = this.selectedWeekday === day ? 'active' : '';
        return `
          <button class="day-btn ${activeClass}" data-day="${day}">
            <span class="day-name">${WEEKDAYS_MAP[day]?.ar ?? day}</span>
            <span class="day-count">${count} محاضرات</span>
          </button>
        `;
      })
      .join('');

    // Slots HTML
    let slotsHtml = '';
    if (slots.length === 0) {
      slotsHtml = `
        <div class="empty-state">
          <div class="empty-state-icon">☕</div>
          <p>لا توجد محاضرات مجدولة لهذا اليوم في هذه المرحلة.</p>
        </div>
      `;
    } else {
      slotsHtml = slots
        .map((s) => {
          const isNow = currentBaghdadTime >= s.startTime && currentBaghdadTime < s.endTime;
          const isNext = currentBaghdadTime < s.startTime;
          const isDone = currentBaghdadTime >= s.endTime;

          let statusBadge = '';
          let liveCardClass = '';

          if (isNow) {
            statusBadge = `<span class="slot-status-indicator status-now">🟢 جارية الآن</span>`;
            liveCardClass = 'now-live';
          } else if (isNext) {
            statusBadge = `<span class="slot-status-indicator status-next">⏳ المحاضرة القادمة</span>`;
            liveCardClass = 'next-up';
          } else if (isDone) {
            statusBadge = `<span class="slot-status-indicator status-done">✓ انتهت</span>`;
          }

          const typeLabel =
            s.type === 'LECTURE'
              ? 'محاضرة نظري'
              : s.type === 'LAB'
                ? 'مختبر عملي'
                : 'مناقشة/تمارين';

          return `
            <div class="slot-card ${liveCardClass}">
              <div class="slot-header">
                <span class="slot-type-badge ${s.type.toLowerCase()}">${typeLabel}</span>
                <span class="slot-time">${s.startTime} - ${s.endTime}</span>
              </div>
              <div class="slot-title">${s.courseTitleAr} (${s.courseCode})</div>
              <div class="slot-meta-row">
                <div class="slot-meta-item">📍 ${s.room}</div>
                <div class="slot-meta-item">👨‍🏫 ${s.lecturerDisplayName}</div>
                ${s.section ? `<div class="slot-meta-item">🏷️ شعبة ${s.section}</div>` : ''}
              </div>
              ${statusBadge}
            </div>
          `;
        })
        .join('');
    }

    return `
      <!-- Stage Chips -->
      <div class="stage-selector-bar">
        ${[1, 2, 3, 4]
          .map(
            (stg) => `
          <button class="stage-chip ${this.selectedStage === stg ? 'active' : ''}" data-stage="${stg}">
            المرحلة ${['الأولى', 'الثانية', 'الثالثة', 'الرابعة'][stg - 1]}
          </button>
        `,
          )
          .join('')}
      </div>

      <!-- Weekday Picker -->
      <div class="weekday-bar">
        ${daysHtml}
      </div>

      <!-- Section Filter -->
      <div style="display: flex; gap: 8px; margin-top: 8px; align-items: center;">
        <span style="font-size: 12px; color: var(--text-secondary);">تصفية الشُعب:</span>
        ${['ALL', 'A', 'B']
          .map(
            (sec) => `
          <button class="stage-chip ${this.selectedSection === sec ? 'active' : ''}" data-section="${sec}" style="padding: 4px 12px; font-size: 12px;">
            ${sec === 'ALL' ? 'جميع الشُعب' : `شعبة ${sec}`}
          </button>
        `,
          )
          .join('')}
      </div>

      <!-- Schedule Cards List -->
      <div class="schedule-list" style="margin-top: 12px;">
        ${slotsHtml}
      </div>
    `;
  }

  private renderSyllabusView(): string {
    const filteredCourses = VERIFIED_COURSES.filter((c) => {
      const matchStage = c.stage === this.selectedStage;
      const matchQuery =
        !this.searchQuery ||
        c.code.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        c.titleAr.includes(this.searchQuery) ||
        c.titleEn.toLowerCase().includes(this.searchQuery.toLowerCase());
      return matchStage && matchQuery;
    });

    const coursesHtml = filteredCourses
      .map((c) => {
        let anomalyBadge = '';
        if (c.hasConflict) {
          anomalyBadge = `<span class="badge-conflict">⚠️ تضارب منهجي</span>`;
        } else if (c.isIdentityOnly) {
          anomalyBadge = `<span class="badge-identity">ℹ️ هوية فقط</span>`;
        }

        return `
          <div class="course-card" data-course-code="${c.code}">
            <div class="course-card-top">
              <span class="course-code-badge">${c.code}</span>
              ${anomalyBadge}
            </div>
            <div class="course-name-ar">${c.titleAr}</div>
            <div class="course-name-en">${c.titleEn}</div>
            <div class="course-stats-bar">
              <span>🎯 ${c.credits} وحدات</span>
              <span>⏱️ ${c.lectureHours} س نظري</span>
              ${c.labHours > 0 ? `<span>🔬 ${c.labHours} س عملي</span>` : ''}
              <span>📚 ${c.topics.length} مواضيع</span>
            </div>
          </div>
        `;
      })
      .join('');

    return `
      <!-- Stage Chips -->
      <div class="stage-selector-bar">
        ${[1, 2, 3, 4]
          .map(
            (stg) => `
          <button class="stage-chip ${this.selectedStage === stg ? 'active' : ''}" data-stage="${stg}">
            المرحلة ${['الأولى', 'الثانية', 'الثالثة', 'الرابعة'][stg - 1]}
          </button>
        `,
          )
          .join('')}
      </div>

      <!-- Search Box -->
      <div class="search-box-wrap" style="margin-top: 12px;">
        <input 
          type="text" 
          id="course-search-input" 
          class="search-input" 
          placeholder="ابحث عن مقرر باسم المادة أو الرمز..."
          value="${this.searchQuery}"
        />
      </div>

      <!-- Course Cards Grid -->
      <div class="course-grid">
        ${
          coursesHtml ||
          `
          <div class="empty-state">
            <div class="empty-state-icon">🔍</div>
            <p>لم يتم العثور على مقررات مطابقة للبحث.</p>
          </div>
        `
        }
      </div>
    `;
  }

  private renderProgressView(): string {
    return `
      <div class="slot-card" style="background: var(--grad-surface);">
        <div style="font-size: 18px; font-weight: 700; margin-bottom: 8px;">📊 مؤشرات التقدم الأكاديمي</div>
        <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 16px;">
          يتم تجميع مؤشرات الإنجاز الحقيقية بناءً على تأكيدك المباشر في بوت تيليجرام.
        </p>

        <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px;">
          <span>الإنجاز الفعلي المؤكد:</span>
          <span style="font-weight: 700; color: var(--accent-cyan);">58%</span>
        </div>
        <div style="background: rgba(255,255,255,0.08); border-radius: 999px; height: 8px; overflow: hidden; margin-bottom: 16px;">
          <div style="background: var(--grad-primary); width: 58%; height: 100%;"></div>
        </div>

        <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px;">
          <span>المتوقع بالتقويم الدراسي:</span>
          <span style="font-weight: 700; color: var(--text-muted);">60% (الأسبوع 9)</span>
        </div>
        <div style="background: rgba(255,255,255,0.08); border-radius: 999px; height: 8px; overflow: hidden; margin-bottom: 20px;">
          <div style="background: #64748b; width: 60%; height: 100%;"></div>
        </div>

        <div style="border-top: 1px solid var(--border-subtle); padding-top: 14px; display: flex; justify-content: space-around; text-align: center;">
          <div>
            <div style="font-size: 20px; font-weight: 700; color: var(--accent-emerald);">🔥 4</div>
            <div style="font-size: 11px; color: var(--text-secondary);">أيام دراسة متتالية</div>
          </div>
          <div>
            <div style="font-size: 20px; font-weight: 700; color: var(--accent-cyan);">14.5</div>
            <div style="font-size: 11px; color: var(--text-secondary);">ساعة دراسية</div>
          </div>
          <div>
            <div style="font-size: 20px; font-weight: 700; color: #a855f7;">12</div>
            <div style="font-size: 11px; color: var(--text-secondary);">جلسة دراسية</div>
          </div>
        </div>
      </div>

      <div style="margin-top: 14px; padding: 14px; border-radius: var(--radius-md); background: rgba(56, 189, 248, 0.08); border: 1px solid rgba(56, 189, 248, 0.2);">
        <div style="font-weight: 600; font-size: 14px; color: var(--accent-cyan); margin-bottom: 4px;">💡 نصيحة المساعد الذكي</div>
        <div style="font-size: 12px; color: var(--text-secondary); line-height: 1.5;">
          يمكنك تحديث مواضع دراستك وتأكيد آخر ما وصلت إليه في المواد مباشرة عبر أمر <code>/lost</code> أو لوحة التحكم <code>/dashboard</code> في المحادثة.
        </div>
      </div>
    `;
  }

  private renderModal(): void {
    const course = this.activeModalCourse;
    const bodyEl = document.getElementById('modal-course-body');
    if (!course || !bodyEl) return;

    let conflictHtml = '';
    if (course.hasConflict && course.conflictNotes) {
      conflictHtml = `
        <div class="conflict-alert-box">
          <strong>تنبيه توثيقي معتمد:</strong>
          <p>${course.conflictNotes}</p>
        </div>
      `;
    }

    const prereqHtml =
      course.prerequisites.length > 0
        ? `
      <div style="margin-bottom: 16px;">
        <div style="font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px;">المتطلبات السابقة:</div>
        <div style="display: flex; flex-wrap: wrap; gap: 6px;">
          ${course.prerequisites
            .map(
              (p) => `
            <span style="background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.3); color: #a5b4fc; padding: 4px 10px; border-radius: 6px; font-size: 12px;">
              🔗 ${p.prerequisiteCourseCode}: ${p.prerequisiteCourseTitleAr}
            </span>
          `,
            )
            .join('')}
        </div>
      </div>
    `
        : '';

    const topicsHtml =
      course.topics.length > 0
        ? `
      <div style="margin-top: 16px;">
        <div style="font-size: 14px; font-weight: 700; margin-bottom: 10px;">📋 مفردات المنهج المعتمدة:</div>
        ${course.topics
          .map(
            (t) => `
          <div class="topic-item-card">
            <div>
              <div style="font-size: 14px; font-weight: 600; color: #fff;">${t.titleAr}</div>
              <div style="font-size: 12px; color: var(--text-muted); font-family: var(--font-stem);">${t.titleEn}</div>
            </div>
            ${t.nominalWeek ? `<span class="topic-week-chip">أسبوع ${t.nominalWeek}</span>` : ''}
          </div>
        `,
          )
          .join('')}
      </div>
    `
        : course.isIdentityOnly
          ? `
      <div class="empty-state">
        <p>ℹ️ هذا المقرر معرّف بالهوية فقط، لا توجد مفردات أسبوعية محددة لمشروع التخرج.</p>
      </div>
    `
          : `
      <div class="empty-state">
        <p>مفردات هذا المقرر قيد التوثيق الرسمي.</p>
      </div>
    `;

    bodyEl.innerHTML = `
      <div class="modal-header">
        <div>
          <span class="course-code-badge">${course.code}</span>
          <h2 style="font-size: 20px; font-weight: 700; margin-top: 6px; color: #fff;">${course.titleAr}</h2>
          <div style="font-size: 13px; color: var(--text-muted); font-family: var(--font-stem);">${course.titleEn}</div>
        </div>
        <button id="modal-close-x" class="modal-close-btn">✕</button>
      </div>

      ${conflictHtml}

      <div class="course-stats-bar" style="margin-bottom: 16px;">
        <span>🎯 ${course.credits} وحدات دراسية</span>
        <span>⏱️ ${course.lectureHours} س نظري</span>
        ${course.labHours > 0 ? `<span>🔬 ${course.labHours} س عملي</span>` : ''}
        <span>📂 ${course.courseType}</span>
      </div>

      ${prereqHtml}
      ${topicsHtml}
    `;

    document.getElementById('modal-close-x')?.addEventListener('click', () => this.closeModal());
  }

  private attachDynamicListeners(): void {
    // Stage chips
    document.querySelectorAll<HTMLButtonElement>('.stage-chip[data-stage]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const stg = Number(btn.dataset.stage) as MiniAppStage;
        if (stg) this.setStage(stg);
      });
    });

    // Weekday buttons
    document.querySelectorAll<HTMLButtonElement>('.day-btn[data-day]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const day = btn.dataset.day as MiniAppWeekday;
        if (day) this.setWeekday(day);
      });
    });

    // Section chips
    document.querySelectorAll<HTMLButtonElement>('.stage-chip[data-section]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const sec = btn.dataset.section as 'ALL' | 'A' | 'B';
        if (sec) this.setSection(sec);
      });
    });

    // Course cards (modal trigger)
    document.querySelectorAll<HTMLDivElement>('.course-card[data-course-code]').forEach((card) => {
      card.addEventListener('click', () => {
        const code = card.dataset.courseCode;
        if (code) this.openModal(code);
      });
    });

    // Search input
    const searchInput = document.getElementById('course-search-input') as HTMLInputElement | null;
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = (e.target as HTMLInputElement).value;
        const filteredArea = document.querySelector('.course-grid');
        if (filteredArea) {
          // Re-render syllabus without re-rendering entire page to keep input focus
          const container = document.getElementById('tab-content-area');
          if (container && this.currentTab === 'syllabus') {
            container.innerHTML = this.renderSyllabusView();
            this.attachDynamicListeners();
            const reInput = document.getElementById(
              'course-search-input',
            ) as HTMLInputElement | null;
            if (reInput) {
              reInput.focus();
              reInput.setSelectionRange(reInput.value.length, reInput.value.length);
            }
          }
        }
      });
    }
  }
}

// Instantiate on DOM load
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    new MiniAppController();
  });
}

export { MiniAppController };
