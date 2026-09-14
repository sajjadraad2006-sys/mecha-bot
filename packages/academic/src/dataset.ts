import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import { SourceAuthority } from './authority.js';
import { EvidenceScope } from './evidence.js';
import { CourseProfile } from './profile.js';
import { AcademicTopic, TopicPrerequisite, CuratedCourseAlias } from './topic.js';
import { AcademicConflict } from './conflict.js';
import { CourseResolver } from './resolver.js';
import { TopicResolver } from './topic-resolver.js';
import { PrerequisiteGraph } from './prerequisite-graph.js';

// ==========================================
// ZOD SCHEMAS
// ==========================================

export const AcademicEvidenceRefSchema = z.object({
  scope: z.nativeEnum(EvidenceScope),
  sourceTitle: z.string().min(1),
  authorityClass: z.nativeEnum(SourceAuthority),
  academicYear: z.string().optional(),
  isVerified: z.boolean(),
  notes: z.string().optional(),
  pageReference: z.string().optional(),
});

export const AcademicSubtopicSchema = z.object({
  subtopicKey: z.string().min(1),
  titleEn: z.string().min(1),
  titleAr: z.string().nullable().optional(),
  orderIndex: z.number().int().nullable().optional(),
  status: z.enum([
    'CONFIRMED',
    'CANDIDATE',
    'CONFLICTING',
    'OUTDATED',
    'SUPERSEDED',
    'REJECTED',
    'UNKNOWN',
  ]),
  evidenceRefs: z.array(AcademicEvidenceRefSchema),
  notes: z.array(z.string()).nullable().optional(),
});

export const AcademicTopicSchema = z.object({
  topicKey: z.string().min(1),
  courseCode: z.string().min(1),
  titleEn: z.string().min(1),
  titleAr: z.string().nullable().optional(),
  orderIndex: z.number().int().nullable().optional(),
  nominalWeek: z.number().int().min(1).max(20).nullable().optional(),
  parentTopicKey: z.string().nullable().optional(),
  subtopics: z.array(AcademicSubtopicSchema).nullable().optional(),
  status: z.enum([
    'CONFIRMED',
    'CANDIDATE',
    'CONFLICTING',
    'OUTDATED',
    'SUPERSEDED',
    'REJECTED',
    'UNKNOWN',
  ]),
  evidenceRefs: z.array(AcademicEvidenceRefSchema),
  notes: z.array(z.string()).nullable().optional(),
});

export const CourseProfileSchema = z.object({
  courseCode: z.string().min(1),
  stage: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  programSemester: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5),
    z.literal(6),
    z.literal(7),
    z.literal(8),
  ]),
  programSemesters: z
    .array(
      z.union([
        z.literal(1),
        z.literal(2),
        z.literal(3),
        z.literal(4),
        z.literal(5),
        z.literal(6),
        z.literal(7),
        z.literal(8),
      ]),
    )
    .optional(),
  displayNames: z.object({
    en: z.string().min(1),
    ar: z.string().min(1),
  }),
  aliases: z.array(z.string()),
  description: z.string().optional(),
  topicMapStatus: z.enum(['COMPLETE', 'PARTIAL', 'IDENTITY_ONLY', 'CONFLICTING']),
  topics: z.array(AcademicTopicSchema),
  evidenceRefs: z.array(AcademicEvidenceRefSchema),
  notes: z.array(z.string()).optional(),
});

export const CuratedCourseAliasSchema = z.object({
  courseCode: z.string().min(1),
  alias: z.string().min(1),
  normalizedAlias: z.string().min(1),
  locale: z.enum(['ar', 'en', 'all']),
  status: z.enum(['CURATED', 'STUDENT_SUGGESTED', 'REJECTED']),
  notes: z.string().optional(),
});

export const TopicAliasSchema = z.object({
  courseCode: z.string().min(1),
  topicKey: z.string().min(1),
  alias: z.string().min(1),
  normalizedAlias: z.string().min(1),
  locale: z.enum(['ar', 'en', 'all']),
  status: z.enum(['CURATED', 'STUDENT_SUGGESTED', 'REJECTED']),
});

export const AcademicConflictSideSchema = z.object({
  claim: z.string().min(1),
  sourceTitle: z.string().min(1),
  sourceAuthority: z.nativeEnum(SourceAuthority),
  evidenceScope: z.nativeEnum(EvidenceScope),
  provenance: z.string().min(1),
});

export const AcademicConflictSchema = z.object({
  id: z.string().min(1),
  courseCode: z.string().min(1),
  fact: z.string().min(1),
  status: z.literal('CONFLICTING'),
  resolutionStatus: z.enum(['UNRESOLVED', 'RESOLVED']),
  sideA: AcademicConflictSideSchema,
  sideB: AcademicConflictSideSchema,
  notes: z.string().optional(),
});

export const TopicPrerequisiteSchema = z.object({
  topicKey: z.string().min(1),
  prerequisiteTopicKey: z.string().min(1),
  status: z.enum([
    'CONFIRMED',
    'CANDIDATE',
    'CONFLICTING',
    'OUTDATED',
    'SUPERSEDED',
    'REJECTED',
    'UNKNOWN',
  ]),
  evidenceScope: z.nativeEnum(EvidenceScope),
  notes: z.string().optional(),
});

// ==========================================
// DATASET LOADER
// ==========================================

export interface AcademicCoreDataset {
  profiles: CourseProfile[];
  profilesByCode: Map<string, CourseProfile>;
  aliases: CuratedCourseAlias[];
  conflicts: AcademicConflict[];
  prerequisites: TopicPrerequisite[];
  topics: AcademicTopic[];
  courseResolver: CourseResolver;
  topicResolver: TopicResolver;
  prerequisiteGraph: PrerequisiteGraph;
}

export function loadAcademicCoreDataset(curriculumDir?: string): AcademicCoreDataset {
  const baseDir = curriculumDir || path.resolve(process.cwd(), 'curriculum/academic-core');

  // 1. Read and validate aliases
  const aliasesPath = path.join(baseDir, 'aliases.v1.json');
  const rawAliases = JSON.parse(fs.readFileSync(aliasesPath, 'utf-8'));
  const parsedAliases = z.array(CuratedCourseAliasSchema).parse(rawAliases);
  const aliases: CuratedCourseAlias[] = parsedAliases as CuratedCourseAlias[];

  // 2. Read and validate conflicts
  const conflictsPath = path.join(baseDir, 'conflicts.v1.json');
  const rawConflicts = JSON.parse(fs.readFileSync(conflictsPath, 'utf-8'));
  const parsedConflicts = z.array(AcademicConflictSchema).parse(rawConflicts);
  const conflicts: AcademicConflict[] = parsedConflicts as AcademicConflict[];

  // 3. Read and validate prerequisites
  const prereqPath = path.join(baseDir, 'prerequisites.v1.json');
  const rawPrereqs = JSON.parse(fs.readFileSync(prereqPath, 'utf-8'));
  const parsedPrereqs = z.array(TopicPrerequisiteSchema).parse(rawPrereqs);
  const prerequisites: TopicPrerequisite[] = parsedPrereqs as TopicPrerequisite[];

  // 4. Read topic maps
  const allTopics: AcademicTopic[] = [];
  const topicMapsDir = path.join(baseDir, 'topic-maps');
  const stageFiles = ['stage-1.v1.json', 'stage-2.v1.json', 'stage-3.v1.json', 'stage-4.v1.json'];

  for (const sFile of stageFiles) {
    const sPath = path.join(topicMapsDir, sFile);
    if (fs.existsSync(sPath)) {
      const rawStageTopics = JSON.parse(fs.readFileSync(sPath, 'utf-8'));
      const parsedTopics = z.array(AcademicTopicSchema).parse(rawStageTopics);
      allTopics.push(...(parsedTopics as unknown as AcademicTopic[]));
    }
  }

  // Group topics by courseCode
  const topicsByCode = new Map<string, AcademicTopic[]>();
  for (const t of allTopics) {
    const code = t.courseCode.toUpperCase();
    if (!topicsByCode.has(code)) {
      topicsByCode.set(code, []);
    }
    topicsByCode.get(code)!.push(t);
  }

  // 5. Read and validate course profiles
  const profilesPath = path.join(baseDir, 'course-profiles.v1.json');
  const rawProfiles = JSON.parse(fs.readFileSync(profilesPath, 'utf-8'));
  const parsedProfiles = z.array(CourseProfileSchema).parse(rawProfiles);

  // Attach topics to profiles
  const profiles: CourseProfile[] = parsedProfiles.map((p) => {
    const attachedTopics = topicsByCode.get(p.courseCode.toUpperCase()) || [];
    return {
      ...(p as unknown as CourseProfile),
      topics: attachedTopics.length > 0 ? attachedTopics : (p.topics as unknown as AcademicTopic[]),
    };
  });

  const profilesByCode = new Map<string, CourseProfile>();
  for (const p of profiles) {
    profilesByCode.set(p.courseCode.toUpperCase(), p);
  }

  // 6. Build services
  const courseResolver = new CourseResolver(profiles, aliases);
  const topicResolver = new TopicResolver(allTopics);

  const prerequisiteGraph = new PrerequisiteGraph();
  for (const t of allTopics) {
    prerequisiteGraph.addTopic(t);
  }
  for (const edge of prerequisites) {
    prerequisiteGraph.addPrerequisite(
      edge.topicKey,
      edge.prerequisiteTopicKey,
      edge.status,
      edge.evidenceScope,
      edge.notes,
    );
  }

  return {
    profiles,
    profilesByCode,
    aliases,
    conflicts,
    prerequisites,
    topics: allTopics,
    courseResolver,
    topicResolver,
    prerequisiteGraph,
  };
}
