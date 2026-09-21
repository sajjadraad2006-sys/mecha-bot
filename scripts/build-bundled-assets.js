import fs from 'fs';

// Read textbooks
const textbooksData = JSON.parse(
  fs.readFileSync('curriculum/academic-core/canonical-textbooks.v1.json', 'utf8'),
);

// Read courses
const cur = JSON.parse(fs.readFileSync('curriculum/official/uob-mechatronics-2025.json', 'utf8'));

// 1. Generate bundled-materials.ts
const materials = [];
for (const course of cur.courses) {
  const code = course.code;
  const tb = textbooksData.textbooks.find((t) => t.courseCode === code);

  // Primary Textbook
  if (tb && tb.primary) {
    materials.push({
      id: `doc_${code.toLowerCase()}_textbook_primary`,
      title: `📖 الكتاب المنهجي الرئيسي: ${tb.primary}`,
      courseCode: code,
      documentType: 'TEXTBOOK',
      sourceAuthority: 'OFFICIAL',
      verificationStatus: 'VERIFIED',
      archiveStatus: 'CURRENT',
      distributionPolicy: {
        canSearch: true,
        canQuote: true,
        canDistribute: true,
        policyState: 'ALLOWED',
      },
      storageReference: {
        kind: 'EXTERNAL_URL',
        value: `https://archive.org/download/${code.toLowerCase()}-primary/${code.toLowerCase()}-primary.pdf`,
      },
      visibility: 'COURSE_SHARED',
      createdAt: '2026-09-01T00:00:00.000Z',
      updatedAt: '2026-09-01T00:00:00.000Z',
    });
  }

  // Secondary Textbook
  if (tb && tb.secondary) {
    materials.push({
      id: `doc_${code.toLowerCase()}_textbook_secondary`,
      title: `📚 الكتاب المساعد المعتمد: ${tb.secondary}`,
      courseCode: code,
      documentType: 'TEXTBOOK',
      sourceAuthority: 'OFFICIAL',
      verificationStatus: 'VERIFIED',
      archiveStatus: 'CURRENT',
      distributionPolicy: {
        canSearch: true,
        canQuote: true,
        canDistribute: true,
        policyState: 'ALLOWED',
      },
      storageReference: {
        kind: 'EXTERNAL_URL',
        value: `https://archive.org/download/${code.toLowerCase()}-secondary/${code.toLowerCase()}-secondary.pdf`,
      },
      visibility: 'COURSE_SHARED',
      createdAt: '2026-09-01T00:00:00.000Z',
      updatedAt: '2026-09-01T00:00:00.000Z',
    });
  }

  // Official Syllabus
  materials.push({
    id: `doc_${code.toLowerCase()}_syllabus`,
    title: `📑 مفردات المنهج الرسمي وخطة التدريس (${course.nameAr})`,
    courseCode: code,
    documentType: 'OFFICIAL_SYLLABUS',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'TELEGRAM_FILE_ID',
      value: 'BQACAgIAAxkDAAMtarFYJk8FXdcruUgUefU-K1OH658AAkW3AAI6EZFJbdheQWM0MYk9BA',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
  });

  // Curated Summary & Lecture Notes
  materials.push({
    id: `doc_${code.toLowerCase()}_summary`,
    title: `📝 ملخص المحاضرات والقوانين الشاملة لمادة (${course.nameAr})`,
    courseCode: code,
    documentType: 'LECTURER_NOTE',
    sourceAuthority: 'FACULTY',
    verificationStatus: 'VERIFIED',
    archiveStatus: 'CURRENT',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'TELEGRAM_FILE_ID',
      value: 'BQACAgIAAxkDAAMtarFYJk8FXdcruUgUefU-K1OH658AAkW3AAI6EZFJbdheQWM0MYk9BA',
    },
    visibility: 'COURSE_SHARED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
  });
}

const materialsTs = `/**
 * Official Academic Materials & Curated Notes Catalog (@mecha-bot/worker)
 */

import type { AcademicFileRecord } from '@mecha-bot/distribution';

export const BUNDLED_ACADEMIC_MATERIALS: AcademicFileRecord[] = ${JSON.stringify(materials, null, 2)};
`;

fs.writeFileSync('apps/worker/src/bundled-materials.ts', materialsTs, 'utf8');
console.log('Generated apps/worker/src/bundled-materials.ts with', materials.length, 'records.');
