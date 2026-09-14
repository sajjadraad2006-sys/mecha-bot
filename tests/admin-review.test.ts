import { describe, it, expect, beforeEach } from 'vitest';
import { FakeClock, UnauthorizedError, ConflictError, NotFoundError } from '@mecha-bot/shared';
import {
  AdminService,
  InMemoryAdminRepository,
  REVIEW_EVIDENCE_SEMANTICS_DISCLAIMER,
  isValidReviewTransition,
  evaluateSelfReviewPolicy,
} from '../packages/admin/src/index.js';

describe('M11A Moderation & Review Workflow Foundation', () => {
  let repository: InMemoryAdminRepository;
  let clock: FakeClock;
  let service: AdminService;

  const SUPER_ADMIN_KEY = 'actor_super_admin_1';
  const ADMIN_KEY = 'actor_admin_1';
  const REVIEWER_KEY = 'actor_reviewer_1';
  const STUDENT_1_KEY = 'actor_student_1';
  const STUDENT_2_KEY = 'actor_student_2';

  beforeEach(() => {
    clock = new FakeClock('2026-09-14T12:00:00.000Z');
    repository = new InMemoryAdminRepository({
      roles: {
        [SUPER_ADMIN_KEY]: 'SUPER_ADMIN',
        [ADMIN_KEY]: 'ADMIN',
        [REVIEWER_KEY]: 'REVIEWER',
        [STUDENT_1_KEY]: 'STUDENT',
        [STUDENT_2_KEY]: 'STUDENT',
      },
    });
    service = new AdminService({ repository, clock });
  });

  describe('Submission Lifecycle', () => {
    it('allows students to submit review items in PENDING status with version 1', async () => {
      const item = await service.submitForReview(STUDENT_1_KEY, {
        type: 'SOURCE_SUBMISSION',
        courseCode: 'MCT314',
        title: 'Lecture 3 Notes on Control Systems',
        summary: 'Student handwritten notes from lecture 3',
        targetRef: 'doc_lec3_notes',
      });

      expect(item.id).toMatch(/^rev_/);
      expect(item.type).toBe('SOURCE_SUBMISSION');
      expect(item.courseCode).toBe('MCT314');
      expect(item.submittedBy).toBe(STUDENT_1_KEY);
      expect(item.status).toBe('PENDING');
      expect(item.version).toBe(1);
      expect(item.history).toHaveLength(1);
      expect(item.history[0]?.fromStatus).toBe('PENDING');
      expect(item.history[0]?.toStatus).toBe('PENDING');
      expect(item.history[0]?.changedBy).toBe(STUDENT_1_KEY);
    });

    it('supports all review types', async () => {
      const types = [
        'SOURCE_SUBMISSION',
        'PAST_EXAM_SUBMISSION',
        'COURSE_PROGRESS_UPDATE',
        'TIMETABLE_UPDATE',
        'ACADEMIC_EVENT_UPDATE',
        'OTHER',
      ] as const;

      for (const t of types) {
        const item = await service.submitForReview(STUDENT_1_KEY, {
          type: t,
          title: `Submission for ${t}`,
        });
        expect(item.type).toBe(t);
        expect(item.status).toBe('PENDING');
      }
    });
  });

  describe('Standard State Transitions', () => {
    let pendingItem: Awaited<ReturnType<AdminService['submitForReview']>>;

    beforeEach(async () => {
      pendingItem = await service.submitForReview(STUDENT_1_KEY, {
        type: 'SOURCE_SUBMISSION',
        courseCode: 'MCT314',
        title: 'Chapter 2 Summary',
      });
    });

    it('transitions PENDING -> APPROVED', async () => {
      const approved = await service.decideReviewItem(REVIEWER_KEY, {
        itemId: pendingItem.id,
        decision: 'APPROVED',
        reason: 'Content verified accurate and relevant to course syllabus',
      });

      expect(approved.status).toBe('APPROVED');
      expect(approved.reviewedBy).toBe(REVIEWER_KEY);
      expect(approved.decisionReason).toBe(
        'Content verified accurate and relevant to course syllabus',
      );
      expect(approved.version).toBe(2);
      expect(approved.history).toHaveLength(2);
      expect(approved.history[1]?.fromStatus).toBe('PENDING');
      expect(approved.history[1]?.toStatus).toBe('APPROVED');
      expect(approved.history[1]?.changedBy).toBe(REVIEWER_KEY);
    });

    it('transitions PENDING -> REJECTED', async () => {
      const rejected = await service.decideReviewItem(REVIEWER_KEY, {
        itemId: pendingItem.id,
        decision: 'REJECTED',
        reason: 'Duplicate material already available in official curriculum',
      });

      expect(rejected.status).toBe('REJECTED');
      expect(rejected.reviewedBy).toBe(REVIEWER_KEY);
      expect(rejected.version).toBe(2);
    });

    it('transitions PENDING -> NEEDS_CHANGES', async () => {
      const needsChanges = await service.decideReviewItem(REVIEWER_KEY, {
        itemId: pendingItem.id,
        decision: 'NEEDS_CHANGES',
        reason: 'Please specify the exact textbook page numbers referenced',
      });

      expect(needsChanges.status).toBe('NEEDS_CHANGES');
      expect(needsChanges.reviewedBy).toBe(REVIEWER_KEY);
      expect(needsChanges.version).toBe(2);
    });

    it('transitions NEEDS_CHANGES -> PENDING when submitter addresses feedback', async () => {
      await service.decideReviewItem(REVIEWER_KEY, {
        itemId: pendingItem.id,
        decision: 'NEEDS_CHANGES',
        reason: 'Missing page numbers',
      });

      const resubmitted = await service.resubmitReviewItem(
        STUDENT_1_KEY,
        pendingItem.id,
        'Added page numbers 45-52',
      );

      expect(resubmitted.status).toBe('PENDING');
      expect(resubmitted.version).toBe(3);
      expect(resubmitted.history).toHaveLength(3);
      expect(resubmitted.history[2]?.fromStatus).toBe('NEEDS_CHANGES');
      expect(resubmitted.history[2]?.toStatus).toBe('PENDING');
    });

    it('transitions PENDING -> WITHDRAWN when submitter cancels', async () => {
      const withdrawn = await service.withdrawReviewItem(
        STUDENT_1_KEY,
        pendingItem.id,
        'Found error in calculations',
      );

      expect(withdrawn.status).toBe('WITHDRAWN');
      expect(withdrawn.version).toBe(2);
    });

    it('transitions NEEDS_CHANGES -> WITHDRAWN', async () => {
      await service.decideReviewItem(REVIEWER_KEY, {
        itemId: pendingItem.id,
        decision: 'NEEDS_CHANGES',
        reason: 'Needs redo',
      });

      const withdrawn = await service.withdrawReviewItem(
        STUDENT_1_KEY,
        pendingItem.id,
        'Abandoning submission',
      );
      expect(withdrawn.status).toBe('WITHDRAWN');
    });
  });

  describe('Invalid State Transitions Safeguards', () => {
    it('disallows APPROVED -> PENDING directly through decision', async () => {
      const item = await service.submitForReview(STUDENT_1_KEY, {
        type: 'SOURCE_SUBMISSION',
        title: 'Formulas',
      });

      await service.decideReviewItem(REVIEWER_KEY, {
        itemId: item.id,
        decision: 'APPROVED',
        reason: 'Good',
      });

      // Direct transition from APPROVED to anything is rejected
      await expect(
        service.decideReviewItem(REVIEWER_KEY, {
          itemId: item.id,
          decision: 'REJECTED',
          reason: 'Changed mind',
        }),
      ).rejects.toThrow(ConflictError);

      expect(isValidReviewTransition('APPROVED', 'PENDING')).toBe(false);
      expect(isValidReviewTransition('APPROVED', 'REJECTED')).toBe(false);
      expect(isValidReviewTransition('REJECTED', 'APPROVED')).toBe(false);
      expect(isValidReviewTransition('WITHDRAWN', 'APPROVED')).toBe(false);
    });

    it('allows explicit administrative reopening of an APPROVED or REJECTED item', async () => {
      const item = await service.submitForReview(STUDENT_1_KEY, {
        type: 'SOURCE_SUBMISSION',
        title: 'Quiz solutions',
      });

      await service.decideReviewItem(REVIEWER_KEY, {
        itemId: item.id,
        decision: 'APPROVED',
        reason: 'Looks fine',
      });

      // Reopening by ADMIN
      const reopened = await service.reopenReviewItem(
        ADMIN_KEY,
        item.id,
        'Found plagiarized questions in submission',
      );

      expect(reopened.status).toBe('PENDING');
      expect(reopened.version).toBe(3);
      expect(reopened.history[2]?.reason).toContain('Found plagiarized questions');
    });

    it('forbids non-admins from reopening items', async () => {
      const item = await service.submitForReview(STUDENT_1_KEY, {
        type: 'SOURCE_SUBMISSION',
        title: 'Notes',
      });

      await service.decideReviewItem(REVIEWER_KEY, {
        itemId: item.id,
        decision: 'REJECTED',
        reason: 'Irrelevant',
      });

      await expect(
        service.reopenReviewItem(STUDENT_1_KEY, item.id, 'I want to reopen'),
      ).rejects.toThrow(UnauthorizedError);

      await expect(
        service.reopenReviewItem(REVIEWER_KEY, item.id, 'I want to reopen'),
      ).rejects.toThrow(UnauthorizedError);
    });
  });

  describe('Self-Review Prevention Policy', () => {
    it('prevents a reviewer from approving their own submission under independent review', async () => {
      // Reviewer submits an item
      const item = await service.submitForReview(REVIEWER_KEY, {
        type: 'SOURCE_SUBMISSION',
        courseCode: 'MCT314',
        title: 'My Own Guide',
      });

      // Reviewer attempts to approve their own submission
      await expect(
        service.decideReviewItem(REVIEWER_KEY, {
          itemId: item.id,
          decision: 'APPROVED',
          reason: 'I think my work is great',
        }),
      ).rejects.toThrow(UnauthorizedError);

      const check = evaluateSelfReviewPolicy(REVIEWER_KEY, 'REVIEWER', REVIEWER_KEY);
      expect(check.allowed).toBe(false);
      expect(check.reason).toBe('SELF_REVIEW_FORBIDDEN_INDEPENDENT_REVIEW_REQUIRED');
    });

    it('prevents ADMIN from approving their own submission without super-admin override', async () => {
      const item = await service.submitForReview(ADMIN_KEY, {
        type: 'SOURCE_SUBMISSION',
        title: 'Admin personal summary',
      });

      await expect(
        service.decideReviewItem(ADMIN_KEY, {
          itemId: item.id,
          decision: 'APPROVED',
          reason: 'Admin self approve',
        }),
      ).rejects.toThrow(UnauthorizedError);
    });

    it('requires explicit override flag for SUPER_ADMIN self-approval and logs it', async () => {
      const item = await service.submitForReview(SUPER_ADMIN_KEY, {
        type: 'SOURCE_SUBMISSION',
        title: 'Super Admin emergency patch note',
      });

      // Without explicit override flag: rejected
      await expect(
        service.decideReviewItem(SUPER_ADMIN_KEY, {
          itemId: item.id,
          decision: 'APPROVED',
          reason: 'Emergency self approve',
          allowSuperAdminOverride: false,
        }),
      ).rejects.toThrow(UnauthorizedError);

      // With explicit override flag: allowed and logged
      const approved = await service.decideReviewItem(SUPER_ADMIN_KEY, {
        itemId: item.id,
        decision: 'APPROVED',
        reason: 'Emergency official notice override',
        allowSuperAdminOverride: true,
      });

      expect(approved.status).toBe('APPROVED');

      // Verify audit event reflects override
      const audits = await service.getAuditLogs(SUPER_ADMIN_KEY, {
        action: 'REVIEW_DECISION',
        resourceKey: item.id,
        outcome: 'SUCCESS',
      });
      expect(audits).toHaveLength(1);
      expect(audits[0]?.metadata?.['isSuperAdminOverride']).toBe(true);

      const failedAudits = await service.getAuditLogs(SUPER_ADMIN_KEY, {
        action: 'REVIEW_DECISION',
        resourceKey: item.id,
        outcome: 'FAILURE',
      });
      expect(failedAudits).toHaveLength(1);
    });
  });

  describe('Academic Evidence Demarcation Safeguard', () => {
    it('approved review item does NOT grant official academic evidence levels', async () => {
      const item = await service.submitForReview(STUDENT_1_KEY, {
        type: 'SOURCE_SUBMISSION',
        courseCode: 'MCT314',
        title: 'Student Homework Solution',
      });

      const approved = await service.decideReviewItem(REVIEWER_KEY, {
        itemId: item.id,
        decision: 'APPROVED',
        reason: 'Student homework solution accepted to review pool',
      });

      // Review workflow approval is strictly moderation-pipeline level
      expect(approved.status).toBe('APPROVED');

      // Review item contains NO academic evidence fields such as OFFICIAL_DEPARTMENT, EXACT_COURSE, VERIFIED_SOLUTION
      const approvedRecord = approved as unknown as Record<string, unknown>;
      expect(approvedRecord['evidenceScope']).toBeUndefined();
      expect(approvedRecord['evidenceLevel']).toBeUndefined();
      expect(approvedRecord['isOfficialDepartment']).toBeUndefined();

      // Disclaimer constant exists to enforce boundary
      expect(REVIEW_EVIDENCE_SEMANTICS_DISCLAIMER).toContain(
        'APPROVED review status indicates acceptance into workflow only',
      );
      expect(REVIEW_EVIDENCE_SEMANTICS_DISCLAIMER).toContain('OFFICIAL_DEPARTMENT');
    });
  });

  describe('Permissions & Access Control for Review Operations', () => {
    it('forbids students from deciding review items', async () => {
      const item = await service.submitForReview(STUDENT_1_KEY, {
        type: 'SOURCE_SUBMISSION',
        title: 'Notes',
      });

      await expect(
        service.decideReviewItem(STUDENT_2_KEY, {
          itemId: item.id,
          decision: 'APPROVED',
          reason: 'Peer approval',
        }),
      ).rejects.toThrow(UnauthorizedError);
    });

    it('forbids other students from withdrawing someone elses submission', async () => {
      const item = await service.submitForReview(STUDENT_1_KEY, {
        type: 'SOURCE_SUBMISSION',
        title: 'Notes',
      });

      await expect(
        service.withdrawReviewItem(STUDENT_2_KEY, item.id, 'Malicious withdrawal'),
      ).rejects.toThrow(UnauthorizedError);
    });

    it('allows reviewers and admins to list review items', async () => {
      await service.submitForReview(STUDENT_1_KEY, {
        type: 'SOURCE_SUBMISSION',
        courseCode: 'MCT314',
        title: 'Item 1',
      });
      await service.submitForReview(STUDENT_2_KEY, {
        type: 'PAST_EXAM_SUBMISSION',
        courseCode: 'MCT324',
        title: 'Item 2',
      });

      const reviewerList = await service.listReviewItems(REVIEWER_KEY);
      expect(reviewerList).toHaveLength(2);

      const filtered = await service.listReviewItems(ADMIN_KEY, { courseCode: 'MCT314' });
      expect(filtered).toHaveLength(1);
      expect(filtered[0]?.courseCode).toBe('MCT314');
    });

    it('throws NotFoundError for non-existent review item', async () => {
      await expect(
        service.decideReviewItem(REVIEWER_KEY, {
          itemId: 'rev_nonexistent',
          decision: 'APPROVED',
          reason: 'Does not exist',
        }),
      ).rejects.toThrow(NotFoundError);
    });
  });
});
