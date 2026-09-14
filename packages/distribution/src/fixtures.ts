import type { AcademicFileRecord } from './types.js';

export const SYNTHETIC_FILE_RECORDS: AcademicFileRecord[] = [
  // 1. Official verified lecture note with Telegram file_id (ALLOWED)
  {
    id: 'file-rec-ctrl-01',
    contentHash: 'hash-ctrl-notes-2025',
    courseCode: 'TEST-DIST-MCT314',
    title: 'Control Systems I - Official Lecture Notes',
    originalFilename: 'control_systems_lecture_notes_dr_alpha.pdf',
    documentType: 'LECTURER_NOTE',
    academicYear: '2025-2026',
    sourceAuthority: 'FACULTY',
    evidenceScope: 'Course Syllabus 2025',
    verificationStatus: 'VERIFIED',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
      reason: 'Authorized by course lecturer for student distribution',
    },
    storageReference: {
      kind: 'TELEGRAM_FILE_ID',
      value: 'BAACAgIAAxkBAAICsynthetic_tg_file_ctrl_01',
      metadata: {
        telegramFileUniqueId: 'AQADsynthetic_uniq_01',
        vaultChatReference: '-1009999999999',
        vaultMessageReference: '101',
        fileSizeBytes: 4500000,
        mimeType: 'application/pdf',
      },
    },
    visibility: 'GLOBAL',
    archiveStatus: 'CURRENT',
    versionLabel: '2025-v1',
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: '2026-09-01T08:00:00.000Z',
    notes: 'Primary lecture note for semester 5',
  },

  // 2. Official syllabus with authorized external legal link (ALLOWED)
  {
    id: 'file-rec-syl-01',
    courseCode: 'TEST-DIST-MCT314',
    title: 'Control Systems I - Official Department Syllabus',
    originalFilename: 'mct314_syllabus_official.pdf',
    documentType: 'OFFICIAL_SYLLABUS',
    academicYear: '2025-2026',
    sourceAuthority: 'OFFICIAL',
    verificationStatus: 'VERIFIED',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
      reason: 'Public department syllabus',
    },
    storageReference: {
      kind: 'EXTERNAL_URL',
      value: 'https://department.example.edu/academic/mct314_syllabus.pdf',
      metadata: {
        mimeType: 'application/pdf',
      },
    },
    visibility: 'GLOBAL',
    archiveStatus: 'CURRENT',
    createdAt: '2026-09-02T09:00:00.000Z',
    updatedAt: '2026-09-02T09:00:00.000Z',
  },

  // 3. Past exam from 2024-2025 (ARCHIVE, ALLOWED)
  {
    id: 'file-rec-exam-2024',
    courseCode: 'TEST-DIST-MCT314',
    title: 'Control Systems I - Final Exam 2024-2025',
    originalFilename: 'mct314_final_2024_2025.pdf',
    documentType: 'PAST_EXAM',
    academicYear: '2024-2025',
    sourceAuthority: 'FACULTY',
    verificationStatus: 'VERIFIED',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
      reason: 'Authorized departmental past examination paper',
    },
    storageReference: {
      kind: 'TELEGRAM_FILE_ID',
      value: 'BAACAgIAAxkBAAICsynthetic_tg_file_exam_2024',
      metadata: {
        vaultChatReference: '-1009999999999',
        vaultMessageReference: '205',
      },
    },
    visibility: 'COURSE_SHARED',
    archiveStatus: 'ARCHIVE',
    createdAt: '2025-06-15T12:00:00.000Z',
    updatedAt: '2025-06-15T12:00:00.000Z',
  },

  // 4. Commercial Textbook (canSearch = true, canDistribute = false, RESTRICTED)
  {
    id: 'file-rec-book-01',
    courseCode: 'TEST-DIST-MCT314',
    title: 'Modern Control Engineering (Commercial Textbook)',
    originalFilename: 'modern_control_engineering_ogata.pdf',
    documentType: 'TEXTBOOK',
    sourceAuthority: 'EXTERNAL',
    verificationStatus: 'CATALOGED',
    distributionPolicy: {
      canSearch: true,
      canQuote: false,
      canDistribute: false,
      policyState: 'RESTRICTED',
      reason: 'Commercial copyrighted textbook; bibliographic metadata searchable only',
    },
    storageReference: {
      kind: 'LOCAL_ARCHIVE_REFERENCE',
      value: 'local://archive/textbooks/ogata_mct314.pdf',
    },
    visibility: 'GLOBAL',
    archiveStatus: 'CURRENT',
    createdAt: '2026-09-03T10:00:00.000Z',
    updatedAt: '2026-09-03T10:00:00.000Z',
  },

  // 5. Solution Manual (PROHIBITED)
  {
    id: 'file-rec-sol-01',
    courseCode: 'TEST-DIST-MCT314',
    title: 'Control Systems - Solution Manual',
    originalFilename: 'control_solutions_manual.pdf',
    documentType: 'SOLUTION_MANUAL',
    sourceAuthority: 'EXTERNAL',
    verificationStatus: 'CATALOGED',
    distributionPolicy: {
      canSearch: false,
      canQuote: false,
      canDistribute: false,
      policyState: 'PROHIBITED',
      reason: 'Department policy prohibits distribution of faculty solution manuals',
    },
    visibility: 'GLOBAL',
    archiveStatus: 'CURRENT',
    createdAt: '2026-09-04T11:00:00.000Z',
    updatedAt: '2026-09-04T11:00:00.000Z',
  },

  // 6. Unknown Student-Shared File (UNKNOWN, canDistribute = false)
  {
    id: 'file-rec-stu-unverified',
    courseCode: 'TEST-DIST-MCT314',
    title: 'Student Forwarded Control Summary',
    originalFilename: 'summary_forwarded_by_student.pdf',
    documentType: 'STUDENT_NOTE',
    sourceAuthority: 'STUDENT',
    verificationStatus: 'RAW',
    distributionPolicy: {
      canSearch: true,
      canQuote: false,
      canDistribute: false,
      policyState: 'UNKNOWN',
      reason: 'Forwarded by student; rights and accuracy not yet verified by department',
    },
    storageReference: {
      kind: 'TELEGRAM_FILE_ID',
      value: 'BAACAgIAAxkBAAICsynthetic_tg_file_stu_unverified',
    },
    visibility: 'GLOBAL',
    archiveStatus: 'UNKNOWN',
    createdAt: '2026-09-05T14:00:00.000Z',
    updatedAt: '2026-09-05T14:00:00.000Z',
  },

  // 7. Duplicate File (Same contentHash as file-rec-ctrl-01 but uploaded with different title)
  {
    id: 'file-rec-ctrl-dup',
    contentHash: 'hash-ctrl-notes-2025', // SAME HASH!
    courseCode: 'TEST-DIST-MCT314',
    title: 'ملزمة السيطرة - نسخة مكررة',
    originalFilename: 'control_duplicate_copy.pdf',
    documentType: 'LECTURER_NOTE',
    academicYear: '2025-2026',
    sourceAuthority: 'FACULTY',
    verificationStatus: 'CATALOGED', // Lower verification rank than file-rec-ctrl-01
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    storageReference: {
      kind: 'TELEGRAM_FILE_ID',
      value: 'BAACAgIAAxkBAAICsynthetic_tg_file_ctrl_01',
    },
    visibility: 'GLOBAL',
    archiveStatus: 'CURRENT',
    createdAt: '2026-09-05T16:00:00.000Z',
    updatedAt: '2026-09-05T16:00:00.000Z',
  },

  // 8. Private Student File belonging to student_synth_123
  {
    id: 'file-rec-priv-123',
    courseCode: 'TEST-DIST-MCT314',
    title: 'My Personal Handwritten Control Summary',
    originalFilename: 'my_handwritten_summary.pdf',
    documentType: 'STUDENT_NOTE',
    sourceAuthority: 'STUDENT',
    verificationStatus: 'RAW',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
      reason: 'Personal note accessible only to owner',
    },
    storageReference: {
      kind: 'TELEGRAM_FILE_ID',
      value: 'BAACAgIAAxkBAAICsynthetic_tg_file_priv_123',
    },
    visibility: 'PRIVATE_STUDENT',
    studentKey: 'student_synth_123',
    archiveStatus: 'CURRENT',
    createdAt: '2026-09-06T10:00:00.000Z',
    updatedAt: '2026-09-06T10:00:00.000Z',
  },

  // 9. File with MISSING storage reference
  {
    id: 'file-rec-missing-ref',
    courseCode: 'TEST-DIST-MATH101',
    title: 'Engineering Mathematics - Reference Outline',
    documentType: 'LECTURE_SLIDES',
    sourceAuthority: 'FACULTY',
    verificationStatus: 'VERIFIED',
    distributionPolicy: {
      canSearch: true,
      canQuote: true,
      canDistribute: true,
      policyState: 'ALLOWED',
    },
    visibility: 'GLOBAL',
    archiveStatus: 'CURRENT',
    createdAt: '2026-09-07T08:00:00.000Z',
    updatedAt: '2026-09-07T08:00:00.000Z',
  },
];
