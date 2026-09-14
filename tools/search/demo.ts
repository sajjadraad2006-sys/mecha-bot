#!/usr/bin/env tsx
/**
 * Local evaluation and interactive demo CLI for Mecha Bot Search & Retrieval Foundation.
 *
 * Usage:
 *   pnpm exec tsx tools/search/demo.ts --query "root locus" --course MCT314
 *   pnpm exec tsx tools/search/demo.ts --query "steam tables" --course MCT217
 *   pnpm exec tsx tools/search/demo.ts --query "final exam" --intent EXAM_LOOKUP --course MCT314
 */

import { SearchEngine, type SearchDocument, type RetrievalIntent } from '../../packages/search/src/index.js';
import { SourceAuthority, EvidenceScope } from '../../packages/academic/src/index.js';

// Synthetic project-owned academic fixtures
const SYNTHETIC_FIXTURES: SearchDocument[] = [
  {
    id: 'mct314_p1_c1',
    documentId: 'doc_mct314_notes',
    chunkId: 'c1',
    courseCode: 'MCT314',
    topicKeys: ['root_locus', 'stability'],
    title: 'Control Systems Lecture Notes - Dr. Ali',
    textOriginal:
      'Root locus analysis shows the trajectory of closed-loop poles as system gain K varies from 0 to infinity. ' +
      'Points on the root locus satisfy the angle criterion and magnitude criterion in the s-plane.',
    textNormalized:
      'root locus analysis shows the trajectory of closed-loop poles as system gain k varies from 0 to infinity. ' +
      'points on the root locus satisfy the angle criterion and magnitude criterion in the s-plane.',
    page: 12,
    documentType: 'LECTURER_NOTE',
    sourceAuthority: SourceAuthority.LECTURER_CURRENT,
    evidenceScope: EvidenceScope.EXACT_COURSE,
    verificationStatus: 'CATALOGED',
    academicYear: '2026-2027',
    canSearch: true,
    canQuote: true,
    canDistribute: false,
    provenance: { originalFilename: 'control_lecture_12.pdf' },
  },
  {
    id: 'mct314_exam_c1',
    documentId: 'doc_mct314_exam_2025',
    chunkId: 'c1',
    courseCode: 'MCT314',
    topicKeys: ['root_locus', 'nyquist', 'final_exam'],
    title: 'MCT314 Final Exam 2025',
    textOriginal:
      'Question 3: For the open-loop transfer function G(s) = K / (s(s+2)(s+4)), sketch the root locus and determine the range of K for stability.',
    textNormalized:
      'question 3: for the open-loop transfer function g(s) = k / (s(s+2)(s+4)), sketch the root locus and determine the range of k for stability.',
    page: 1,
    documentType: 'PAST_EXAM',
    sourceAuthority: SourceAuthority.PAST_EXAM_VERIFIED,
    evidenceScope: EvidenceScope.EXACT_COURSE,
    verificationStatus: 'VERIFIED',
    academicYear: '2024-2025',
    canSearch: true,
    canQuote: true,
    canDistribute: false,
    provenance: { originalFilename: 'mct314_final_2025.pdf' },
  },
  {
    id: 'mct217_p1_c1',
    documentId: 'doc_mct217_thermo',
    chunkId: 'c1',
    courseCode: 'MCT217',
    topicKeys: ['thermodynamics', 'steam_tables'],
    title: 'Thermodynamics Engineering Notes',
    textOriginal:
      'Steam tables provide fundamental thermodynamic properties of water in saturated and superheated states, including enthalpy, entropy, and specific volume.',
    textNormalized:
      'steam tables provide fundamental thermodynamic properties of water in saturated and superheated states, including enthalpy, entropy, and specific volume.',
    page: 45,
    documentType: 'LECTURER_NOTE',
    sourceAuthority: SourceAuthority.OFFICIAL_DEPARTMENT,
    evidenceScope: EvidenceScope.EXACT_COURSE,
    verificationStatus: 'VERIFIED',
    academicYear: '2026-2027',
    canSearch: true,
    canQuote: true,
    canDistribute: false,
    provenance: { originalFilename: 'thermodynamics_ch3.pdf' },
  },
  {
    id: 'mct311_p1_c1',
    documentId: 'doc_mct311_math',
    chunkId: 'c1',
    courseCode: 'MCT311',
    topicKeys: ['matrices', 'eigenvalues'],
    title: 'Engineering Mathematics III',
    textOriginal:
      'Matrix eigenvalues and eigenvectors are essential for solving systems of linear differential equations and modal analysis in mechanical vibration.',
    textNormalized:
      'matrix eigenvalues and eigenvectors are essential for solving systems of linear differential equations and modal analysis in mechanical vibration.',
    page: 8,
    documentType: 'LECTURER_NOTE',
    sourceAuthority: SourceAuthority.STUDENT_SUBMITTED,
    evidenceScope: EvidenceScope.EXACT_COURSE,
    verificationStatus: 'CATALOGED',
    academicYear: '2026-2027',
    canSearch: true,
    canQuote: true,
    canDistribute: false,
    provenance: { originalFilename: 'math3_matrices.pdf' },
  },
];

function parseArgs(): { query: string; courseCode?: string; intent?: RetrievalIntent } {
  const args = process.argv.slice(2);
  let query = 'root locus';
  let courseCode: string | undefined = undefined;
  let intent: RetrievalIntent | undefined = undefined;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--query' && args[i + 1]) {
      query = args[i + 1]!;
      i++;
    } else if (args[i] === '--course' && args[i + 1]) {
      courseCode = args[i + 1]!;
      i++;
    } else if (args[i] === '--intent' && args[i + 1]) {
      intent = args[i + 1] as RetrievalIntent;
      i++;
    }
  }

  return { query, courseCode, intent };
}

function main(): void {
  const { query, courseCode, intent } = parseArgs();

  console.log('=== Mecha Bot Deterministic Search Evaluation Demo ===');
  console.log(`  Query:  "${query}"`);
  console.log(`  Course: ${courseCode ?? '(all courses)'}`);
  console.log(`  Intent: ${intent ?? 'GENERAL_SEARCH'}\n`);

  const engine = new SearchEngine();
  engine.indexDocuments(SYNTHETIC_FIXTURES);

  const response = engine.search({
    text: query,
    courseCode,
    intent,
    debug: true,
  });

  console.log(`Index Version:     ${response.indexVersion}`);
  console.log(`Query Fingerprint: ${response.queryFingerprint}`);
  console.log(`Total Matches:     ${response.totalMatches}\n`);

  if (response.results.length === 0) {
    console.log(`[!] No matching results. Diagnostic: ${response.diagnosticReason}`);
    return;
  }

  response.results.forEach((res, idx) => {
    console.log(`[Result #${idx + 1}] Score: ${res.score} (Lexical: ${res.lexicalScore}, Multiplier: ${res.contextualMultiplier}x)`);
    console.log(`  Document:   ${res.title ?? res.documentId} (Page ${res.page ?? 'N/A'})`);
    console.log(`  Course:     ${res.courseCode ?? 'N/A'}`);
    console.log(`  Type:       ${res.documentType}`);
    console.log(`  Authority:  ${res.authority}`);
    console.log(`  Scope:      ${res.evidenceScope}`);
    console.log(`  Status:     ${res.verificationStatus}`);
    console.log(`  Distribute: ${res.canDistribute ? 'ALLOWED' : 'PROHIBITED'}`);
    console.log(`  Reasons:    ${res.matchReasons.join(', ')}`);
    console.log(`  Excerpt:    "${res.textExcerpt}"\n`);
  });
}

main();
