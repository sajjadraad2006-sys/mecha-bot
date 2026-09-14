import { describe, it, expect, beforeEach } from 'vitest';
import { FakeClock, UnauthorizedError } from '@mecha-bot/shared';
import {
  AdminService,
  InMemoryAdminRepository,
  generateAuditId,
  resetAuditSequence,
  sanitizeAuditMetadata,
} from '../packages/admin/src/index.js';

describe('M11A Admin Audit & Accountability Foundation', () => {
  let repository: InMemoryAdminRepository;
  let clock: FakeClock;
  let service: AdminService;

  const SUPER_ADMIN_KEY = 'actor_super_admin_1';
  const ADMIN_KEY = 'actor_admin_1';
  const EDITOR_KEY = 'actor_editor_1';
  const REVIEWER_KEY = 'actor_reviewer_1';
  const STUDENT_KEY = 'actor_student_1';

  beforeEach(() => {
    resetAuditSequence();
    clock = new FakeClock('2026-09-14T14:00:00.000Z');
    repository = new InMemoryAdminRepository({
      roles: {
        [SUPER_ADMIN_KEY]: 'SUPER_ADMIN',
        [ADMIN_KEY]: 'ADMIN',
        [EDITOR_KEY]: 'COURSE_EDITOR',
        [REVIEWER_KEY]: 'REVIEWER',
        [STUDENT_KEY]: 'STUDENT',
      },
    });
    service = new AdminService({ repository, clock });
  });

  describe('Auditing Authorization Denials', () => {
    it('creates an audit event when COURSE_EDITOR attempts unauthorized action on unassigned course', async () => {
      // Assign editor to MCT314
      await service.assignCourseEditor(SUPER_ADMIN_KEY, {
        actorKey: EDITOR_KEY,
        courseCode: 'MCT314',
      });

      // Editor attempts to edit MCT217 (unassigned)
      const decision = await service.authorize(EDITOR_KEY, 'COURSE_EDIT', {
        type: 'course',
        courseCode: 'MCT217',
      });

      expect(decision.allowed).toBe(false);
      expect(decision.reason).toBe('OUT_OF_SCOPE');

      // Verify denial was logged into audit repository
      const denials = await repository.listAuditEvents({
        actorKey: EDITOR_KEY,
        outcome: 'DENIED',
      });

      expect(denials.length).toBeGreaterThanOrEqual(1);
      const denial = denials.find(
        (e) => e.courseCode === 'MCT217' && e.action === 'AUTHORIZATION_DENIED',
      );
      expect(denial).toBeDefined();
      expect(denial?.reason).toBe('OUT_OF_SCOPE');
      expect(denial?.courseCode).toBe('MCT217');
    });

    it('creates audit event when student attempts admin mutation', async () => {
      const decision = await service.authorize(STUDENT_KEY, 'ROLE_ASSIGN');
      expect(decision.allowed).toBe(false);

      const audits = await repository.listAuditEvents({
        actorKey: STUDENT_KEY,
        outcome: 'DENIED',
      });
      expect(audits).toHaveLength(1);
      expect(audits[0]?.reason).toBe('ROLE_LACKS_PERMISSION');
    });
  });

  describe('Auditing Privileged Mutations', () => {
    it('records audit events for role assignments and revocations', async () => {
      await service.assignRole(SUPER_ADMIN_KEY, 'actor_new_target', 'COURSE_EDITOR');

      const assignAudits = await repository.listAuditEvents({
        action: 'ROLE_ASSIGN',
        outcome: 'SUCCESS',
      });
      expect(assignAudits).toHaveLength(1);
      expect(assignAudits[0]?.actorKey).toBe(SUPER_ADMIN_KEY);
      expect(assignAudits[0]?.resourceKey).toBe('actor_new_target');
      expect(assignAudits[0]?.metadata?.['newRole']).toBe('COURSE_EDITOR');

      await service.revokeRole(SUPER_ADMIN_KEY, 'actor_new_target');

      const revokeAudits = await repository.listAuditEvents({
        action: 'ROLE_REVOKE',
        outcome: 'SUCCESS',
      });
      expect(revokeAudits).toHaveLength(1);
      expect(revokeAudits[0]?.resourceKey).toBe('actor_new_target');
    });

    it('records audit events for course editor assignments and revocations', async () => {
      const assignment = await service.assignCourseEditor(SUPER_ADMIN_KEY, {
        actorKey: EDITOR_KEY,
        courseCode: 'MCT314',
      });

      const assignAudits = await repository.listAuditEvents({
        action: 'COURSE_EDITOR_ASSIGN',
        courseCode: 'MCT314',
      });
      expect(assignAudits).toHaveLength(1);
      expect(assignAudits[0]?.actorKey).toBe(SUPER_ADMIN_KEY);
      expect(assignAudits[0]?.courseCode).toBe('MCT314');

      await service.revokeCourseEditorAssignment(
        SUPER_ADMIN_KEY,
        assignment.id,
        'Semester term ended',
      );

      const revokeAudits = await repository.listAuditEvents({
        action: 'COURSE_EDITOR_REVOKE',
        courseCode: 'MCT314',
      });
      expect(revokeAudits).toHaveLength(1);
      expect(revokeAudits[0]?.reason).toBe('Semester term ended');
    });

    it('records audit events for review workflow submissions, decisions, and resubmissions', async () => {
      const item = await service.submitForReview(STUDENT_KEY, {
        type: 'SOURCE_SUBMISSION',
        courseCode: 'MCT314',
        title: 'Summary',
      });

      const submitAudits = await repository.listAuditEvents({
        action: 'REVIEW_SUBMISSION',
        resourceKey: item.id,
      });
      expect(submitAudits).toHaveLength(1);
      expect(submitAudits[0]?.actorKey).toBe(STUDENT_KEY);

      await service.decideReviewItem(REVIEWER_KEY, {
        itemId: item.id,
        decision: 'NEEDS_CHANGES',
        reason: 'Include formulas',
      });

      const decisionAudits = await repository.listAuditEvents({
        action: 'REVIEW_DECISION',
        resourceKey: item.id,
      });
      expect(decisionAudits).toHaveLength(1);
      expect(decisionAudits[0]?.actorKey).toBe(REVIEWER_KEY);
      expect(decisionAudits[0]?.reason).toBe('Include formulas');

      await service.resubmitReviewItem(STUDENT_KEY, item.id, 'Formulas added');

      const resubmitAudits = await repository.listAuditEvents({
        action: 'REVIEW_RESUBMIT',
        resourceKey: item.id,
      });
      expect(resubmitAudits).toHaveLength(1);
      expect(resubmitAudits[0]?.actorKey).toBe(STUDENT_KEY);
    });
  });

  describe('Auditing Security & Privacy Protections', () => {
    it('sanitizes sensitive fields and redacts secrets from audit metadata', () => {
      const rawMetadata = {
        normalField: 'all good',
        secretToken: 'super-secret-telegram-token-12345',
        apiPassword: 'plain-text-password-should-never-be-stored',
        apiKey: 'sk-antigravity-99999',
        authToken: 'Bearer eyJhbGciOi...',
      };

      const sanitized = sanitizeAuditMetadata(rawMetadata);
      expect(sanitized).toBeDefined();
      expect(sanitized?.['normalField']).toBe('all good');
      expect(sanitized?.['secretToken']).toBe('[REDACTED]');
      expect(sanitized?.['apiPassword']).toBe('[REDACTED]');
      expect(sanitized?.['apiKey']).toBe('[REDACTED]');
      expect(sanitized?.['authToken']).toBe('[REDACTED]');
    });

    it('truncates very large text payloads and limits unbounded metadata size', () => {
      const hugeText = 'A'.repeat(5000);
      const sanitized = sanitizeAuditMetadata({
        largeDocument: hugeText,
        numberVal: 42,
        boolVal: true,
      });

      expect(sanitized).toBeDefined();
      const doc = sanitized?.['largeDocument'] as string;
      expect(doc.length).toBeLessThan(300);
      expect(doc).toContain('...[TRUNCATED]');
      expect(sanitized?.['numberVal']).toBe(42);
      expect(sanitized?.['boolVal']).toBe(true);
    });
  });

  describe('Deterministic Audit ID Generation', () => {
    it('generates predictable sequential audit IDs', () => {
      resetAuditSequence();
      const id1 = generateAuditId('test');
      const id2 = generateAuditId('test');

      expect(id1).toContain('test_');
      expect(id1.endsWith('_0001')).toBe(true);
      expect(id2.endsWith('_0002')).toBe(true);
    });
  });

  describe('Audit Querying & Access Control', () => {
    beforeEach(async () => {
      await service.submitForReview(STUDENT_KEY, {
        type: 'SOURCE_SUBMISSION',
        courseCode: 'MCT314',
        title: 'Submission 1',
      });
      await service.submitForReview(STUDENT_KEY, {
        type: 'SOURCE_SUBMISSION',
        courseCode: 'MCT324',
        title: 'Submission 2',
      });
    });

    it('allows actors with AUDIT_VIEW to view and filter audit logs', async () => {
      const reviewerLogs = await service.getAuditLogs(REVIEWER_KEY);
      expect(reviewerLogs.length).toBeGreaterThanOrEqual(2);

      const adminLogs = await service.getAuditLogs(ADMIN_KEY, { courseCode: 'MCT314' });
      expect(adminLogs.every((e) => e.courseCode === 'MCT314')).toBe(true);
    });

    it('denies audit viewing to actors without AUDIT_VIEW permission', async () => {
      await expect(service.getAuditLogs(STUDENT_KEY)).rejects.toThrow(UnauthorizedError);
      await expect(service.getAuditLogs(EDITOR_KEY)).rejects.toThrow(UnauthorizedError);
    });

    it('filters audit logs by outcome, actorKey, and limit correctly', async () => {
      // Cause a denial
      await service.authorize(STUDENT_KEY, 'ADMIN_MANAGE');

      const allEvents = await service.getAuditLogs(ADMIN_KEY);
      expect(allEvents.length).toBeGreaterThan(0);

      const deniedOnly = await service.getAuditLogs(ADMIN_KEY, { outcome: 'DENIED' });
      expect(deniedOnly.length).toBeGreaterThan(0);
      expect(deniedOnly.every((e) => e.outcome === 'DENIED')).toBe(true);

      const limited = await service.getAuditLogs(ADMIN_KEY, { limit: 1 });
      expect(limited).toHaveLength(1);
    });
  });
});
