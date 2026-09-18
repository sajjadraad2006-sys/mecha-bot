/**
 * Mecha Bot — Worker Application Factory (@mecha-bot/worker)
 *
 * Instantiates the unified MechaBotApp orchestrator and all 11 verified domain
 * services for Cloudflare Workers edge runtime with pre-bundled static academic assets.
 */

import { Clock, SystemClock } from '@mecha-bot/shared';
import { AcademicCalendarService, type AcademicCalendarPeriod } from '@mecha-bot/academic';
import {
  StudyNavigatorService,
  InMemoryStudentCoursePositionRepository,
} from '@mecha-bot/navigator';
import { CompanionService, InMemoryCompanionRepository } from '@mecha-bot/companion';
import { TimetableService } from '@mecha-bot/timetable';
import { ReminderSchedulerService } from '@mecha-bot/scheduler';
import { SearchEngine, normalizeText } from '@mecha-bot/search';
import { FileDistributionService, InMemoryFileCatalogRepository } from '@mecha-bot/distribution';
import {
  ExamsService,
  InMemoryExamsRepository,
  type AcademicEvent,
  type CreatePracticeQuizInput,
} from '@mecha-bot/exams';
import { AdminService, InMemoryAdminRepository } from '@mecha-bot/admin';
import {
  AiBrainService,
  AIRouter,
  ModelHealthRegistry,
  BudgetManager,
  OpenAiCompatibleProvider,
  GeminiProvider,
  FakeAIProvider,
  type AIProvider,
} from '@mecha-bot/ai';
import { MechaBotApp } from '@mecha-bot/wiring';

import { createBundledAcademicDataset, BUNDLED_TOPICS } from './bundled-academic-data.js';
import { BUNDLED_ACADEMIC_MATERIALS } from './bundled-materials.js';
import { BUNDLED_TIMETABLE_SLOTS } from './bundled-timetable-data.js';
import { BUNDLED_EXAM_EVENTS, BUNDLED_PRACTICE_QUIZZES } from './bundled-exams-data.js';
import type { WorkerEnv } from './index.js';

export const WORKER_ACADEMIC_PERIODS: AcademicCalendarPeriod[] = [
  // Semester 1 (Fall 2026)
  {
    id: 'period_sem1_teaching',
    academicYearId: 'ay_2026_2027',
    periodType: 'TEACHING',
    programSemester: 1,
    startsOn: '2026-09-01',
    endsOn: '2026-12-31',
    nominalWeekCount: 16,
    stageScope: 1,
    evidenceMetadataJson: null,
    createdAt: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'period_sem3_teaching',
    academicYearId: 'ay_2026_2027',
    periodType: 'TEACHING',
    programSemester: 3,
    startsOn: '2026-09-01',
    endsOn: '2026-12-31',
    nominalWeekCount: 16,
    stageScope: 2,
    evidenceMetadataJson: null,
    createdAt: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'period_sem5_teaching',
    academicYearId: 'ay_2026_2027',
    periodType: 'TEACHING',
    programSemester: 5,
    startsOn: '2026-09-01',
    endsOn: '2026-12-31',
    nominalWeekCount: 16,
    stageScope: 3,
    evidenceMetadataJson: null,
    createdAt: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'period_sem7_teaching',
    academicYearId: 'ay_2026_2027',
    periodType: 'TEACHING',
    programSemester: 7,
    startsOn: '2026-09-01',
    endsOn: '2026-12-31',
    nominalWeekCount: 16,
    stageScope: 4,
    evidenceMetadataJson: null,
    createdAt: '2026-09-01T00:00:00.000Z',
  },
  // Semester 2 (Spring 2027)
  {
    id: 'period_sem2_teaching',
    academicYearId: 'ay_2026_2027',
    periodType: 'TEACHING',
    programSemester: 2,
    startsOn: '2027-02-01',
    endsOn: '2027-06-15',
    nominalWeekCount: 16,
    stageScope: 1,
    evidenceMetadataJson: null,
    createdAt: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'period_sem4_teaching',
    academicYearId: 'ay_2026_2027',
    periodType: 'TEACHING',
    programSemester: 4,
    startsOn: '2027-02-01',
    endsOn: '2027-06-15',
    nominalWeekCount: 16,
    stageScope: 2,
    evidenceMetadataJson: null,
    createdAt: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'period_sem6_teaching',
    academicYearId: 'ay_2026_2027',
    periodType: 'TEACHING',
    programSemester: 6,
    startsOn: '2027-02-01',
    endsOn: '2027-06-15',
    nominalWeekCount: 16,
    stageScope: 3,
    evidenceMetadataJson: null,
    createdAt: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'period_sem8_teaching',
    academicYearId: 'ay_2026_2027',
    periodType: 'TEACHING',
    programSemester: 8,
    startsOn: '2027-02-01',
    endsOn: '2027-06-15',
    nominalWeekCount: 16,
    stageScope: 4,
    evidenceMetadataJson: null,
    createdAt: '2026-09-01T00:00:00.000Z',
  },
];

/**
 * Creates and initializes a fully wired MechaBotApp instance for Cloudflare Workers edge.
 */
export function createWorkerMechaBotApp(
  env: WorkerEnv,
  clock: Clock = new SystemClock(),
): {
  app: MechaBotApp;
  calendarService: AcademicCalendarService;
} {
  // 1. Academic Dataset & Calendar
  const dataset = createBundledAcademicDataset();
  const calendarService = new AcademicCalendarService(WORKER_ACADEMIC_PERIODS);

  // 2. Study Navigator (M2/M8)
  const navigatorRepo = new InMemoryStudentCoursePositionRepository();
  const navigatorService = new StudyNavigatorService({ dataset, repository: navigatorRepo });

  // 3. Companion Service (M9)
  const companionRepo = new InMemoryCompanionRepository();
  const companionService = new CompanionService(companionRepo, { clock });

  // 4. Timetable Service (M3)
  const timetableService = new TimetableService({
    clock,
    initialSlots: BUNDLED_TIMETABLE_SLOTS,
  });

  // 5. Scheduler Service (M4)
  const schedulerService = new ReminderSchedulerService({ clock });

  // 6. Search Engine (M7)
  const searchEngine = new SearchEngine();

  // Index all bundled academic materials
  for (const m of BUNDLED_ACADEMIC_MATERIALS) {
    const notesText = m.notes ? ` ${m.notes}` : '';
    const fullText = `${m.title} - ${m.documentType} لمادة ${m.courseCode}${notesText}`;
    searchEngine.indexDocument({
      id: `mat_${m.id}`,
      documentId: m.id,
      courseCode: m.courseCode,
      topicKeys: [],
      title: m.title,
      textOriginal: fullText,
      textNormalized: normalizeText(fullText),
      documentType: m.documentType,
      sourceAuthority: 'OFFICIAL_DEPARTMENT',
      evidenceScope: 'EXACT_COURSE',
      verificationStatus: 'VERIFIED',
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      provenance: {},
    });
  }

  // Index curriculum topics
  for (const t of BUNDLED_TOPICS) {
    const fullText = `${t.titleAr} ${t.titleEn} ${t.topicKey} ${t.courseCode}`;
    searchEngine.indexDocument({
      id: `topic_${t.courseCode}_${t.topicKey}`,
      documentId: `topic_${t.topicKey}`,
      courseCode: t.courseCode,
      topicKeys: [t.topicKey],
      title: t.titleAr || t.titleEn,
      textOriginal: fullText,
      textNormalized: normalizeText(fullText),
      documentType: 'CURRICULUM_TOPIC',
      sourceAuthority: 'OFFICIAL_DEPARTMENT',
      evidenceScope: 'EXACT_COURSE',
      verificationStatus: 'VERIFIED',
      canSearch: true,
      canQuote: true,
      canDistribute: false,
      provenance: {},
    });
  }

  // Index exam milestones
  for (const ev of BUNDLED_EXAM_EVENTS) {
    const fullText = `${ev.title} ${ev.type} ${ev.courseCode}`;
    searchEngine.indexDocument({
      id: `exam_${ev.courseCode}_${ev.type}`,
      documentId: `exam_${ev.courseCode}_${ev.type}`,
      courseCode: ev.courseCode,
      topicKeys: [],
      title: ev.title,
      textOriginal: fullText,
      textNormalized: normalizeText(fullText),
      documentType: 'EXAM_SCHEDULE',
      sourceAuthority: 'OFFICIAL_DEPARTMENT',
      evidenceScope: 'EXACT_COURSE',
      verificationStatus: 'VERIFIED',
      canSearch: true,
      canQuote: true,
      canDistribute: false,
      provenance: {},
    });
  }

  // 7. File Distribution Service (M12)
  const distributionRepo = new InMemoryFileCatalogRepository();
  for (const mat of BUNDLED_ACADEMIC_MATERIALS) {
    distributionRepo.add(mat);
  }
  const distributionService = new FileDistributionService({ repository: distributionRepo });

  // 8. Exams & Practice Quizzes Service (M10)
  const examsRepo = new InMemoryExamsRepository();
  const examsService = new ExamsService(examsRepo, { clock });
  for (const ev of BUNDLED_EXAM_EVENTS) {
    examsService.createEvent(ev as AcademicEvent);
  }
  for (const q of BUNDLED_PRACTICE_QUIZZES) {
    examsService.createPracticeQuiz(q as unknown as CreatePracticeQuizInput);
  }

  // 9. Admin Service (M11)
  const adminRoles: Record<
    string,
    'SUPER_ADMIN' | 'ADMIN' | 'COURSE_EDITOR' | 'REVIEWER' | 'STUDENT'
  > = {
    '1417868079': 'SUPER_ADMIN',
  };
  if (env.ADMIN_USER_IDS) {
    for (const id of env.ADMIN_USER_IDS.split(',')) {
      const trimmed = id.trim();
      if (trimmed) adminRoles[trimmed] = 'ADMIN';
    }
  }
  const adminService = new AdminService({
    repository: new InMemoryAdminRepository({ roles: adminRoles }),
  });

  // 10. AI Brain Service (M5)
  let primaryAiProvider: AIProvider;
  const fallbackProviders: AIProvider[] = [];

  if (env.GROQ_API_KEY) {
    primaryAiProvider = new OpenAiCompatibleProvider({
      id: 'groq-llama-3.3-70b',
      apiKey: env.GROQ_API_KEY,
      baseUrl: 'https://api.groq.com/openai/v1',
      defaultModel: 'llama-3.3-70b-versatile',
    });
    if (env.GEMINI_API_KEY) {
      fallbackProviders.push(
        new GeminiProvider({
          apiKey: env.GEMINI_API_KEY,
          model: 'gemini-2.0-flash',
        }),
      );
    }
  } else if (env.GEMINI_API_KEY) {
    primaryAiProvider = new GeminiProvider({
      apiKey: env.GEMINI_API_KEY,
      model: 'gemini-2.0-flash',
    });
  } else {
    primaryAiProvider = new FakeAIProvider('edge-static-fallback');
  }

  const aiRouter = new AIRouter(
    primaryAiProvider,
    fallbackProviders,
    new ModelHealthRegistry(),
    new BudgetManager(),
  );

  const aiBrainService = new AiBrainService({
    router: aiRouter,
    searchEngine,
  });

  // 11. Application Orchestrator (MechaBotApp)
  const app = new MechaBotApp({
    academicDataset: dataset,
    navigatorService,
    companionService,
    timetableService,
    schedulerService,
    searchEngine,
    distributionService,
    examsService,
    adminService,
    calendarService,
    aiBrainService,
  });

  return { app, calendarService };
}
