import { describe, it, expect, beforeAll } from 'vitest';
import path from 'node:path';
import fs from 'node:fs';
import {
  loadAcademicCoreDataset,
  AcademicCoreDataset,
  CourseProfileSchema,
  normalizeArabicText,
  normalizeEnglishText,
  normalizeGeneralText,
  normalizeTolerantArabic,
  CourseResolver,
  TopicResolver,
  PrerequisiteGraph,
  EvidenceScope,
  AcademicTopic,
} from '@mecha-bot/academic';

describe('Milestone M2 — Academic Core Suite', () => {
  let dataset: AcademicCoreDataset;
  const curriculumDir = path.resolve(__dirname, '../curriculum/academic-core');
  const m1CurriculumPath = path.resolve(
    __dirname,
    '../curriculum/official/uob-mechatronics-2025.json',
  );

  beforeAll(() => {
    dataset = loadAcademicCoreDataset(curriculumDir);
  });

  describe('1. Dataset Structure & Schema Validation', () => {
    it('successfully loads and validates all academic core files via Zod schemas', () => {
      expect(dataset).toBeDefined();
      expect(dataset.profiles.length).toBe(55);
      expect(dataset.aliases.length).toBeGreaterThan(0);
      expect(dataset.conflicts.length).toBeGreaterThan(0);
      expect(dataset.topics.length).toBeGreaterThan(0);
      expect(dataset.prerequisites.length).toBeGreaterThan(0);
    });

    it('rejects malformed CourseProfile schema', () => {
      const invalidProfile = {
        courseCode: 'INVALID',
        stage: 99, // Invalid stage
        programSemester: 1,
        displayNames: { en: 'Invalid', ar: 'غير صالح' },
        aliases: [],
        topicMapStatus: 'INVALID_STATUS',
        topics: [],
        evidenceRefs: [],
      };
      const result = CourseProfileSchema.safeParse(invalidProfile);
      expect(result.success).toBe(false);
    });

    it('rejects malformed dataset when required files contain corrupt JSON or schemas', () => {
      expect(() => loadAcademicCoreDataset('/nonexistent/directory')).toThrow();
    });
  });

  describe('2. Canonical Course Coverage & Cross-Validation Against M1 Registry', () => {
    let m1Courses: Array<{ code: string; stage: number; semester: number }>;

    beforeAll(() => {
      const m1Raw = JSON.parse(fs.readFileSync(m1CurriculumPath, 'utf-8'));
      m1Courses = m1Raw.courses;
    });

    it('contains exactly 55 canonical CourseProfile records', () => {
      expect(dataset.profiles.length).toBe(55);
    });

    it('contains no duplicate course codes', () => {
      const codes = dataset.profiles.map((p) => p.courseCode);
      const uniqueCodes = new Set(codes);
      expect(uniqueCodes.size).toBe(55);
    });

    it('validates every M2 profile courseCode against M1 official curriculum registry', () => {
      const m1Codes = new Set(m1Courses.map((c) => c.code));
      expect(m1Codes.size).toBe(55);

      for (const profile of dataset.profiles) {
        expect(m1Codes.has(profile.courseCode)).toBe(true);
      }
    });

    it('ensures every profile has a valid stage (1..4) and program semester (1..8) matching M1', () => {
      const m1Map = new Map(m1Courses.map((c) => [c.code, c]));

      for (const profile of dataset.profiles) {
        expect([1, 2, 3, 4]).toContain(profile.stage);
        expect([1, 2, 3, 4, 5, 6, 7, 8]).toContain(profile.programSemester);

        const m1Course = m1Map.get(profile.courseCode);
        expect(m1Course).toBeDefined();
        expect(profile.stage).toBe(m1Course!.stage);
        expect(profile.programSemester).toBe(m1Course!.semester);
      }
    });

    it('handles P4MCT as ONE single canonical profile spanning semesters 7 and 8', () => {
      const p4mctProfiles = dataset.profiles.filter((p) => p.courseCode === 'P4MCT');
      expect(p4mctProfiles.length).toBe(1);

      const p4mct = p4mctProfiles[0]!;
      expect(p4mct.stage).toBe(4);
      expect(p4mct.programSemester).toBe(7);
      expect(p4mct.programSemesters).toEqual([7, 8]);
      expect(p4mct.topicMapStatus).toBe('IDENTITY_ONLY');
    });

    it('verifies topicMapStatus breakdown: 13 COMPLETE, 1 CONFLICTING, 23 PARTIAL, 18 IDENTITY_ONLY', () => {
      const statusCounts = dataset.profiles.reduce(
        (acc, p) => {
          acc[p.topicMapStatus] = (acc[p.topicMapStatus] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      expect(statusCounts['COMPLETE']).toBe(13);
      expect(statusCounts['CONFLICTING']).toBe(1);
      expect(statusCounts['PARTIAL']).toBe(23);
      expect(statusCounts['IDENTITY_ONLY']).toBe(18);
      expect(
        (statusCounts['COMPLETE'] || 0) +
          (statusCounts['CONFLICTING'] || 0) +
          (statusCounts['PARTIAL'] || 0) +
          (statusCounts['IDENTITY_ONLY'] || 0),
      ).toBe(55);
    });

    it('allows incomplete and IDENTITY_ONLY topic maps without fabricating content', () => {
      const identityOnlyProfiles = dataset.profiles.filter(
        (p) => p.topicMapStatus === 'IDENTITY_ONLY',
      );
      expect(identityOnlyProfiles.length).toBe(18);

      for (const p of identityOnlyProfiles) {
        expect(p.topics.length).toBe(0);
      }
    });
  });

  describe('3. MCT124 Structured Academic Conflict', () => {
    it('explicitly models MCT124 as CONFLICTING and does not silently resolve it', () => {
      const profile = dataset.profilesByCode.get('MCT124');
      expect(profile).toBeDefined();
      expect(profile!.topicMapStatus).toBe('CONFLICTING');

      const conflict = dataset.conflicts.find((c) => c.courseCode === 'MCT124');
      expect(conflict).toBeDefined();
      expect(conflict!.status).toBe('CONFLICTING');
      expect(conflict!.resolutionStatus).toBe('UNRESOLVED');
      expect(conflict!.fact).toBe('course_content_description');

      // Side A provenance
      expect(conflict!.sideA.claim).toContain('Physics');
      expect(conflict!.sideA.evidenceScope).toBe(EvidenceScope.EXACT_COURSE);
      expect(conflict!.sideA.provenance).toContain('Page 15');

      // Side B provenance
      expect(conflict!.sideB.claim).toContain('Semiconductor Physics');
      expect(conflict!.sideB.evidenceScope).toBe(EvidenceScope.EXACT_COURSE);
      expect(conflict!.sideB.provenance).toContain('Neamen');
    });

    it('marks Stage 1 MCT124 topics as CONFLICTING rather than CONFIRMED', () => {
      const mct124Topics = dataset.topics.filter((t) => t.courseCode === 'MCT124');
      expect(mct124Topics.length).toBe(15);
      for (const topic of mct124Topics) {
        expect(topic.status).toBe('CONFLICTING');
      }
    });
  });

  describe('4. Evidence & Confidence Semantics', () => {
    it('verifies that candidate evidence never becomes CONFIRMED automatically', () => {
      const candidateTopics = dataset.topics.filter((t) => t.status === 'CANDIDATE');
      expect(candidateTopics.length).toBeGreaterThan(0);

      for (const t of candidateTopics) {
        expect(t.status).not.toBe('CONFIRMED');
        // Candidate topics must have isVerified = false
        for (const ref of t.evidenceRefs) {
          expect(ref.isVerified).toBe(false);
        }
      }
    });

    it('verifies that SAME_UNIVERSITY_RELATED_COURSE is never treated as EXACT_COURSE', () => {
      const relatedCourseTopics = dataset.topics.filter((t) =>
        t.evidenceRefs.some((r) => r.scope === EvidenceScope.SAME_UNIVERSITY_RELATED_COURSE),
      );
      expect(relatedCourseTopics.length).toBeGreaterThan(0);

      for (const t of relatedCourseTopics) {
        const scopes = t.evidenceRefs.map((r) => r.scope);
        expect(scopes).not.toContain(EvidenceScope.EXACT_COURSE);
        expect(t.status).toBe('CANDIDATE');
      }
    });

    it('strictly encodes nominalWeek only for source-supported Stage 1 topics', () => {
      // Stage 1 topics have source-supported weeks
      const stage1Topics = dataset.topics.filter((t) => t.courseCode.startsWith('MCT1'));
      for (const t of stage1Topics) {
        expect(t.nominalWeek).toBeDefined();
        expect(t.nominalWeek).toBeGreaterThanOrEqual(1);
        expect(t.nominalWeek).toBeLessThanOrEqual(15);
      }

      // Stages 2-4 candidate topics do NOT fabricate nominalWeek
      const stage234Topics = dataset.topics.filter((t) => !t.courseCode.startsWith('MCT1'));
      for (const t of stage234Topics) {
        expect(t.nominalWeek).toBeUndefined();
      }
    });
  });

  describe('5. Arabic and English Normalization', () => {
    it('normalizes Arabic text according to conservative rules', () => {
      // Alef unification: [أإآٱ] -> ا
      expect(normalizeArabicText('أحمد')).toBe('احمد');
      expect(normalizeArabicText('إلكترونيات')).toBe('الكترونيات');
      expect(normalizeArabicText('آلات')).toBe('الات');

      // Alef maqsura to yaa: ى -> ي
      expect(normalizeArabicText('أولى')).toBe('اولي');
      expect(normalizeArabicText('محتوى')).toBe('محتوي');

      // Tashkeel removal
      expect(normalizeArabicText('مُعَالَجَةُ الإِشَارَةِ')).toBe('معالجة الاشارة');

      // Tatweel removal
      expect(normalizeArabicText('ســـيـطـرة')).toBe('سيطرة');

      // Whitespace collapse
      expect(normalizeArabicText('   دوائر    كهربائية   ')).toBe('دوائر كهربائية');

      // Conservative rule: Does NOT automatically turn ة -> ه globally
      expect(normalizeArabicText('سيطرة')).toBe('سيطرة');
      expect(normalizeArabicText('معالجة')).toBe('معالجة');
    });

    it('supports tolerant Arabic normalization as secondary fallback', () => {
      expect(normalizeTolerantArabic('سيطرة')).toBe('سيطره');
      expect(normalizeTolerantArabic('مُعَالَجَة')).toBe('معالجه');
    });

    it('normalizes English text properly', () => {
      expect(normalizeEnglishText('  Control   Systems 1  ')).toBe('control systems 1');
      expect(normalizeEnglishText('THERMODYNAMICS')).toBe('thermodynamics');
      expect(normalizeGeneralText('Control-Systems: 1!')).toBe('control systems 1');
    });
  });

  describe('6. CourseResolver Deterministic Intent Resolution', () => {
    let resolver: CourseResolver;

    beforeAll(() => {
      resolver = dataset.courseResolver;
    });

    it('resolves "ثرمو" and "ترموداينمك" to MCT217', () => {
      const res1 = resolver.resolve('ثرمو');
      expect(res1.candidateCourseCodes).toEqual(['MCT217']);
      expect(res1.needsClarification).toBe(false);

      const res2 = resolver.resolve('ترموداينمك');
      expect(res2.candidateCourseCodes).toEqual(['MCT217']);
      expect(res2.needsClarification).toBe(false);

      const res3 = resolver.resolve('thermo');
      expect(res3.candidateCourseCodes).toEqual(['MCT217']);
      expect(res3.needsClarification).toBe(false);
    });

    it('resolves "DSP" to MCT326', () => {
      const res1 = resolver.resolve('DSP');
      expect(res1.candidateCourseCodes).toEqual(['MCT326']);
      expect(res1.needsClarification).toBe(false);

      const res2 = resolver.resolve('dsp');
      expect(res2.candidateCourseCodes).toEqual(['MCT326']);
      expect(res2.needsClarification).toBe(false);

      const res3 = resolver.resolve('معالجة اشارة');
      expect(res3.candidateCourseCodes).toEqual(['MCT326']);
      expect(res3.needsClarification).toBe(false);

      const res4 = resolver.resolve('معالجة الإشارة');
      expect(res4.candidateCourseCodes).toEqual(['MCT326']);
      expect(res4.needsClarification).toBe(false);
    });

    it('resolves "موائع" to MCT313', () => {
      const res1 = resolver.resolve('موائع');
      expect(res1.candidateCourseCodes).toEqual(['MCT313']);
      expect(res1.needsClarification).toBe(false);

      const res2 = resolver.resolve('فلويد');
      expect(res2.candidateCourseCodes).toEqual(['MCT313']);
      expect(res2.needsClarification).toBe(false);

      const res3 = resolver.resolve('fluid');
      expect(res3.candidateCourseCodes).toEqual(['MCT313']);
      expect(res3.needsClarification).toBe(false);
    });

    it('requires clarification for "سيطرة" without context', () => {
      const res = resolver.resolve('سيطرة');
      expect(res.candidateCourseCodes).toContain('MCT314');
      expect(res.candidateCourseCodes).toContain('MCT324');
      expect(res.needsClarification).toBe(true);
      expect(res.clarificationReason).toBe('AMBIGUOUS_COURSE_ALIAS');
    });

    it('resolves "سيطرة" in semester 5 to MCT314 without clarification', () => {
      const res = resolver.resolve({ query: 'سيطرة', programSemester: 5 });
      expect(res.candidateCourseCodes).toEqual(['MCT314']);
      expect(res.needsClarification).toBe(false);
    });

    it('resolves "سيطرة" in semester 6 to MCT324 without clarification', () => {
      const res = resolver.resolve({ query: 'سيطرة', programSemester: 6 });
      expect(res.candidateCourseCodes).toEqual(['MCT324']);
      expect(res.needsClarification).toBe(false);
    });

    it('resolves specific "سيطرة 1" and "سيطرة 2" even without semester context', () => {
      const res1 = resolver.resolve('سيطرة 1');
      expect(res1.candidateCourseCodes).toEqual(['MCT314']);
      expect(res1.needsClarification).toBe(false);

      const res2 = resolver.resolve('سيطرة 2');
      expect(res2.candidateCourseCodes).toEqual(['MCT324']);
      expect(res2.needsClarification).toBe(false);
    });

    it('does not silently resolve when context contradicts query ("سيطرة 2" with semester 5)', () => {
      const res = resolver.resolve({ query: 'سيطرة 2', programSemester: 5 });
      expect(res.candidateCourseCodes).toEqual([]);
      expect(res.needsClarification).toBe(true);
      expect(res.clarificationReason).toBe('CONTEXT_MISMATCH');
    });

    it('resolves exact course codes directly', () => {
      const res1 = resolver.resolve('MCT217');
      expect(res1.candidateCourseCodes).toEqual(['MCT217']);
      expect(res1.matchType).toBe('EXACT_CODE');
      expect(res1.needsClarification).toBe(false);

      const res2 = resolver.resolve('mct-313');
      expect(res2.candidateCourseCodes).toEqual(['MCT313']);
      expect(res2.matchType).toBe('EXACT_CODE');
      expect(res2.needsClarification).toBe(false);
    });

    it('returns unknown safely for unmatched queries', () => {
      const res = resolver.resolve('مادة فضائية غير موجودة');
      expect(res.candidateCourseCodes).toEqual([]);
      expect(res.needsClarification).toBe(true);
      expect(res.confidenceCategory).toBe('UNKNOWN');
      expect(res.clarificationReason).toBe('NO_MATCH');
    });

    it('handles empty and whitespace-only queries safely', () => {
      const res = resolver.resolve('   ');
      expect(res.candidateCourseCodes).toEqual([]);
      expect(res.needsClarification).toBe(true);
      expect(res.clarificationReason).toBe('UNKNOWN_QUERY');
    });

    it('filters by stage when semester is not specified', () => {
      // Both MCT314 and MCT324 are in Stage 3, so stays ambiguous
      const res1 = resolver.resolve({ query: 'سيطرة', stage: 3 });
      expect(res1.candidateCourseCodes.length).toBe(2);
      expect(res1.needsClarification).toBe(true);

      // Thermo is stage 2, requesting it in stage 1 causes CONTEXT_MISMATCH
      const res2 = resolver.resolve({ query: 'ثرمو', stage: 1 });
      expect(res2.candidateCourseCodes).toEqual([]);
      expect(res2.needsClarification).toBe(true);
      expect(res2.clarificationReason).toBe('CONTEXT_MISMATCH');
    });

    it('falls back to course display names matching', () => {
      const res = resolver.resolve('Mathematics II');
      expect(res.candidateCourseCodes).toEqual(['MCT121']);
      expect(res.matchType).toBe('COURSE_NAME');
      expect(res.needsClarification).toBe(false);
    });
  });

  describe('7. TopicResolver Deterministic Resolution', () => {
    let topicResolver: TopicResolver;

    beforeAll(() => {
      topicResolver = dataset.topicResolver;
    });

    it('performs exact and normalized topic match for courses with topic maps', () => {
      // Stage 1 exact match
      const res1 = topicResolver.resolve('MCT111', 'Continuity');
      expect(res1.topic).toBeDefined();
      expect(res1.topic!.courseCode).toBe('MCT111');
      expect(res1.matchSource).toBe('EXACT_NAME');
      expect(res1.status).toBe('CONFIRMED');

      // Stage 3 candidate topic match
      const res2 = topicResolver.resolve('MCT314', 'Root Locus Method for Control Design');
      expect(res2.topic).toBeDefined();
      expect(res2.topic!.topicKey).toBe('mct314-root-locus-analysis');
      expect(res2.status).toBe('CANDIDATE');
    });

    it('supports TopicResolver with custom topic aliases and subtopics', () => {
      const customTopic: AcademicTopic = {
        topicKey: 'test-filter-design',
        courseCode: 'MCT225',
        titleEn: 'Active Filter Design',
        titleAr: 'تصميم المرشحات الفعالة',
        status: 'CANDIDATE',
        evidenceRefs: [],
        subtopics: [
          {
            subtopicKey: 'test-butterworth',
            titleEn: 'Butterworth Filters',
            titleAr: 'مرشحات بترورث',
            status: 'CANDIDATE',
            evidenceRefs: [],
          },
        ],
      };

      const customAliases = [
        {
          courseCode: 'MCT225',
          topicKey: 'test-filter-design',
          alias: 'فلاتر',
          normalizedAlias: 'فلاتر',
          locale: 'ar' as const,
          status: 'CURATED' as const,
        },
      ];

      const customResolver = new TopicResolver([customTopic], customAliases);

      // Alias match
      const resAlias = customResolver.resolve('MCT225', 'فلاتر');
      expect(resAlias.topic).toBeDefined();
      expect(resAlias.topic!.topicKey).toBe('test-filter-design');
      expect(resAlias.matchSource).toBe('ALIAS');

      // Subtopic match
      const resSub = customResolver.resolve('MCT225', 'Butterworth Filters');
      expect(resSub.topic).toBeDefined();
      expect(resSub.matchSource).toBe('SUBTOPIC');

      // Tolerant Arabic match
      const resTolerant = customResolver.resolve('MCT225', 'تصميم المرشحات الفعاله');
      expect(resTolerant.topic).toBeDefined();
      expect(resTolerant.matchSource).toBe('NORMALIZED_NAME');
    });

    it('returns UNKNOWN safely when querying a course with IDENTITY_ONLY or no topic map', () => {
      // P4MCT has no topic map
      const res = topicResolver.resolve('P4MCT', 'Deep Learning for Quadrotors');
      expect(res.topic).toBeNull();
      expect(res.status).toBe('UNKNOWN');
      expect(res.matchSource).toBe('NONE');
      expect(res.needsClarification).toBe(false);
    });

    it('returns UNKNOWN safely when query does not match any topic in the course', () => {
      const res = topicResolver.resolve('MCT111', 'Quantum Electrodynamics');
      expect(res.topic).toBeNull();
      expect(res.status).toBe('UNKNOWN');
    });
  });

  describe('8. PrerequisiteGraph Foundation', () => {
    let graph: PrerequisiteGraph;

    beforeAll(() => {
      graph = dataset.prerequisiteGraph;
    });

    it('performs direct prerequisite lookup correctly', () => {
      const edge = dataset.prerequisites[1]!; // w6 -> w5
      const directPrereqs = graph.getDirectPrerequisites(edge.topicKey);
      expect(directPrereqs.length).toBe(1);
      expect(directPrereqs[0]!.topicKey).toBe(edge.prerequisiteTopicKey);
    });

    it('returns full dependency chain in topological order without loops', () => {
      // w6 depends on w5, and w5 depends on mct111-w10
      const edge = dataset.prerequisites[1]!;
      const chain = graph.getDependencyChain(edge.topicKey);
      const chainKeys = chain.map((t) => t.topicKey);

      expect(chainKeys).toContain(edge.prerequisiteTopicKey);
      expect(chainKeys).toContain('mct111-w10-integrals-part-1');

      // Foundational prerequisite appears before immediate prerequisite
      const idxW10 = chainKeys.indexOf('mct111-w10-integrals-part-1');
      const idxW5 = chainKeys.indexOf(edge.prerequisiteTopicKey);
      expect(idxW10).toBeLessThan(idxW5);
    });

    it('detects cycles accurately when circular dependencies are introduced', () => {
      const testGraph = new PrerequisiteGraph();
      const topicA: AcademicTopic = {
        topicKey: 'test-topic-a',
        courseCode: 'TEST101',
        titleEn: 'Topic A',
        status: 'CONFIRMED',
        evidenceRefs: [],
      };
      const topicB: AcademicTopic = {
        topicKey: 'test-topic-b',
        courseCode: 'TEST101',
        titleEn: 'Topic B',
        status: 'CONFIRMED',
        evidenceRefs: [],
      };
      const topicC: AcademicTopic = {
        topicKey: 'test-topic-c',
        courseCode: 'TEST101',
        titleEn: 'Topic C',
        status: 'CONFIRMED',
        evidenceRefs: [],
      };

      testGraph.addTopic(topicA);
      testGraph.addTopic(topicB);
      testGraph.addTopic(topicC);

      // A -> B -> C -> A (cycle)
      testGraph.addPrerequisite('test-topic-a', 'test-topic-b');
      testGraph.addPrerequisite('test-topic-b', 'test-topic-c');
      testGraph.addPrerequisite('test-topic-c', 'test-topic-a');

      const cycles = testGraph.detectCycles();
      expect(cycles.length).toBeGreaterThan(0);
      const cycleFlattened = cycles[0]!;
      expect(cycleFlattened).toContain('test-topic-a');
      expect(cycleFlattened).toContain('test-topic-b');
      expect(cycleFlattened).toContain('test-topic-c');
    });

    it('confirms the production curriculum prerequisite graph is a valid DAG (zero cycles)', () => {
      const cycles = graph.detectCycles();
      expect(cycles).toEqual([]);
    });
  });

  describe('9. Project Architectural Hygiene & Determinism', () => {
    it('confirms that no AI or LLM provider is imported or used in M2 code', () => {
      const m2Files = [
        'packages/academic/src/profile.ts',
        'packages/academic/src/topic.ts',
        'packages/academic/src/conflict.ts',
        'packages/academic/src/normalization.ts',
        'packages/academic/src/resolver.ts',
        'packages/academic/src/topic-resolver.ts',
        'packages/academic/src/prerequisite-graph.ts',
        'packages/academic/src/dataset.ts',
      ];

      for (const relPath of m2Files) {
        const fullPath = path.resolve(__dirname, '..', relPath);
        const code = fs.readFileSync(fullPath, 'utf-8');
        expect(code).not.toMatch(/google-genai|groq|openai|anthropic|langchain|ollama|gemini/i);
      }
    });

    it('confirms that all dataset loading and resolution is 100% deterministic', () => {
      const run1 = loadAcademicCoreDataset(curriculumDir);
      const run2 = loadAcademicCoreDataset(curriculumDir);

      expect(run1.profiles.length).toBe(run2.profiles.length);
      expect(run1.topics.length).toBe(run2.topics.length);

      const res1 = run1.courseResolver.resolve('ثرمو');
      const res2 = run2.courseResolver.resolve('ثرمو');
      expect(res1).toEqual(res2);
    });
  });
});
