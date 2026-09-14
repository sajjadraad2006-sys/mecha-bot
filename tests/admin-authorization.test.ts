import { describe, it, expect, beforeEach } from 'vitest';
import { FakeClock, UnauthorizedError, ValidationError } from '@mecha-bot/shared';
import {
  AdminService,
  InMemoryAdminRepository,
  isValidCourseCode,
  normalizeCourseCode,
  isRole,
  isAdminPermission,
  validateWithSchema,
  RoleSchema,
  CourseCodeSchema,
  ActorKeySchema,
  type CourseEditorAssignment,
} from '../packages/admin/src/index.js';

describe('M11A Admin Authorization & Scoping Foundation', () => {
  let repository: InMemoryAdminRepository;
  let clock: FakeClock;
  let service: AdminService;

  const SUPER_ADMIN_KEY = 'actor_super_admin_1';
  const ADMIN_KEY = 'actor_admin_1';
  const EDITOR_KEY = 'actor_editor_1';
  const REVIEWER_KEY = 'actor_reviewer_1';
  const STUDENT_KEY = 'actor_student_1';

  beforeEach(async () => {
    clock = new FakeClock('2026-09-14T10:00:00.000Z');
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

  describe('SUPER_ADMIN Privileges', () => {
    it('grants global access across all capabilities without course scoping restrictions', async () => {
      const perms = [
        'ADMIN_MANAGE',
        'ROLE_ASSIGN',
        'COURSE_VIEW',
        'COURSE_EDIT',
        'COURSE_PULSE_UPDATE',
        'TIMETABLE_UPDATE',
        'ACADEMIC_EVENT_CREATE',
        'ACADEMIC_EVENT_REVIEW',
        'SOURCE_REVIEW',
        'SOURCE_APPROVE',
        'QUIZ_MANAGE',
        'AUDIT_VIEW',
      ] as const;

      for (const perm of perms) {
        const canDoGlobal = await service.can(SUPER_ADMIN_KEY, perm);
        expect(canDoGlobal).toBe(true);

        const canDoScoped = await service.can(SUPER_ADMIN_KEY, perm, {
          type: 'course',
          courseCode: 'MCT314',
        });
        expect(canDoScoped).toBe(true);
      }
    });

    it('returns SUPER_ADMIN_GLOBAL decision reason', async () => {
      const decision = await service.authorize(SUPER_ADMIN_KEY, 'COURSE_EDIT', {
        type: 'course',
        courseCode: 'MCT999',
      });
      expect(decision.allowed).toBe(true);
      expect(decision.reason).toBe('SUPER_ADMIN_GLOBAL');
    });
  });

  describe('ADMIN Role Capabilities', () => {
    it('has broad operational access across courses', async () => {
      expect(
        await service.can(ADMIN_KEY, 'COURSE_EDIT', { type: 'course', courseCode: 'MCT314' }),
      ).toBe(true);
      expect(
        await service.can(ADMIN_KEY, 'COURSE_PULSE_UPDATE', {
          type: 'course',
          courseCode: 'MCT217',
        }),
      ).toBe(true);
      expect(
        await service.can(ADMIN_KEY, 'TIMETABLE_UPDATE', { type: 'course', courseCode: 'MCT111' }),
      ).toBe(true);
      expect(await service.can(ADMIN_KEY, 'AUDIT_VIEW')).toBe(true);
    });
  });

  describe('COURSE_EDITOR Scoping & Permissions', () => {
    beforeEach(async () => {
      // Assign editor to MCT314
      await repository.saveAssignment({
        id: 'assign_editor_mct314',
        actorKey: EDITOR_KEY,
        courseCode: 'MCT314',
        assignedBy: SUPER_ADMIN_KEY,
        assignedAt: clock.nowIso(),
        status: 'ACTIVE',
      });
    });

    it('permits COURSE_EDIT for assigned course MCT314', async () => {
      const allowed = await service.can(EDITOR_KEY, 'COURSE_EDIT', {
        type: 'course',
        courseCode: 'MCT314',
      });
      expect(allowed).toBe(true);

      const decision = await service.authorize(EDITOR_KEY, 'COURSE_EDIT', {
        type: 'course',
        courseCode: 'MCT314',
      });
      expect(decision.allowed).toBe(true);
      expect(decision.reason).toBe('COURSE_EDITOR_ASSIGNED');
    });

    it('denies COURSE_EDIT for unassigned course MCT217', async () => {
      const allowed = await service.can(EDITOR_KEY, 'COURSE_EDIT', {
        type: 'course',
        courseCode: 'MCT217',
      });
      expect(allowed).toBe(false);

      const decision = await service.authorize(EDITOR_KEY, 'COURSE_EDIT', {
        type: 'course',
        courseCode: 'MCT217',
      });
      expect(decision.allowed).toBe(false);
      expect(decision.reason).toBe('OUT_OF_SCOPE');
    });

    it('denies course-scoped action if no courseCode is provided in resource', async () => {
      const decision = await service.authorize(EDITOR_KEY, 'COURSE_EDIT');
      expect(decision.allowed).toBe(false);
      expect(decision.reason).toBe('COURSE_SCOPE_REQUIRED');
    });

    it('allows general non-course-scoped permissions like COURSE_VIEW and SOURCE_SUBMIT', async () => {
      expect(await service.can(EDITOR_KEY, 'COURSE_VIEW')).toBe(true);
      expect(await service.can(EDITOR_KEY, 'SOURCE_SUBMIT')).toBe(true);
    });

    it('Course Pulse permission respects course scope', async () => {
      expect(
        await service.can(EDITOR_KEY, 'COURSE_PULSE_UPDATE', {
          type: 'course',
          courseCode: 'MCT314',
        }),
      ).toBe(true);
      expect(
        await service.can(EDITOR_KEY, 'COURSE_PULSE_UPDATE', {
          type: 'course',
          courseCode: 'MCT217',
        }),
      ).toBe(false);
    });

    it('timetable update permission respects course scope', async () => {
      expect(
        await service.can(EDITOR_KEY, 'TIMETABLE_UPDATE', {
          type: 'course',
          courseCode: 'MCT314',
        }),
      ).toBe(true);
      expect(
        await service.can(EDITOR_KEY, 'TIMETABLE_UPDATE', {
          type: 'course',
          courseCode: 'MCT217',
        }),
      ).toBe(false);
    });

    it('academic event permission respects course scope', async () => {
      expect(
        await service.can(EDITOR_KEY, 'ACADEMIC_EVENT_CREATE', {
          type: 'course',
          courseCode: 'MCT314',
        }),
      ).toBe(true);
      expect(
        await service.can(EDITOR_KEY, 'ACADEMIC_EVENT_CREATE', {
          type: 'course',
          courseCode: 'MCT217',
        }),
      ).toBe(false);
    });
  });

  describe('Assignment Status & Lifecycle Restrictions', () => {
    it('denies access when assignment status is REVOKED', async () => {
      const revokedAssignment: CourseEditorAssignment = {
        id: 'assign_revoked_1',
        actorKey: EDITOR_KEY,
        courseCode: 'MCT324',
        assignedBy: SUPER_ADMIN_KEY,
        assignedAt: '2026-09-01T00:00:00.000Z',
        status: 'REVOKED',
        revokedAt: '2026-09-10T00:00:00.000Z',
        revokedBy: SUPER_ADMIN_KEY,
      };
      await repository.saveAssignment(revokedAssignment);

      const decision = await service.authorize(EDITOR_KEY, 'COURSE_EDIT', {
        type: 'course',
        courseCode: 'MCT324',
      });
      expect(decision.allowed).toBe(false);
      expect(decision.reason).toBe('ASSIGNMENT_REVOKED');
    });

    it('denies access when assignment status is EXPIRED', async () => {
      const expiredAssignment: CourseEditorAssignment = {
        id: 'assign_expired_1',
        actorKey: EDITOR_KEY,
        courseCode: 'MCT324',
        assignedBy: SUPER_ADMIN_KEY,
        assignedAt: '2026-08-01T00:00:00.000Z',
        status: 'EXPIRED',
      };
      await repository.saveAssignment(expiredAssignment);

      const decision = await service.authorize(EDITOR_KEY, 'COURSE_EDIT', {
        type: 'course',
        courseCode: 'MCT324',
      });
      expect(decision.allowed).toBe(false);
      expect(decision.reason).toBe('ASSIGNMENT_EXPIRED');
    });

    it('denies access when validTo is in the past even if status flag was active', async () => {
      const timeExpiredAssignment: CourseEditorAssignment = {
        id: 'assign_time_expired_1',
        actorKey: EDITOR_KEY,
        courseCode: 'MCT324',
        validTo: '2026-09-10T00:00:00.000Z', // Clock is 2026-09-14
        assignedBy: SUPER_ADMIN_KEY,
        assignedAt: '2026-08-01T00:00:00.000Z',
        status: 'ACTIVE',
      };
      await repository.saveAssignment(timeExpiredAssignment);

      const decision = await service.authorize(EDITOR_KEY, 'COURSE_EDIT', {
        type: 'course',
        courseCode: 'MCT324',
      });
      expect(decision.allowed).toBe(false);
      expect(decision.reason).toBe('ASSIGNMENT_EXPIRED');
    });

    it('denies access when validFrom is in the future', async () => {
      const futureAssignment: CourseEditorAssignment = {
        id: 'assign_future_1',
        actorKey: EDITOR_KEY,
        courseCode: 'MCT324',
        validFrom: '2026-09-20T00:00:00.000Z', // Clock is 2026-09-14
        assignedBy: SUPER_ADMIN_KEY,
        assignedAt: '2026-09-14T00:00:00.000Z',
        status: 'ACTIVE',
      };
      await repository.saveAssignment(futureAssignment);

      const decision = await service.authorize(EDITOR_KEY, 'COURSE_EDIT', {
        type: 'course',
        courseCode: 'MCT324',
      });
      expect(decision.allowed).toBe(false);
      expect(decision.reason).toBe('ASSIGNMENT_NOT_YET_EFFECTIVE');
    });

    it('respects restricted custom permissions subset on assignment', async () => {
      const restrictedAssignment: CourseEditorAssignment = {
        id: 'assign_restricted_1',
        actorKey: EDITOR_KEY,
        courseCode: 'MCT324',
        permissions: ['COURSE_PULSE_UPDATE'], // Only pulse allowed, not course edit
        assignedBy: SUPER_ADMIN_KEY,
        assignedAt: '2026-09-14T00:00:00.000Z',
        status: 'ACTIVE',
      };
      await repository.saveAssignment(restrictedAssignment);

      // Pulse update allowed
      expect(
        await service.can(EDITOR_KEY, 'COURSE_PULSE_UPDATE', {
          type: 'course',
          courseCode: 'MCT324',
        }),
      ).toBe(true);

      // Course edit denied because it's not in the assignment permissions array
      const decision = await service.authorize(EDITOR_KEY, 'COURSE_EDIT', {
        type: 'course',
        courseCode: 'MCT324',
      });
      expect(decision.allowed).toBe(false);
      expect(decision.reason).toBe('PERMISSION_NOT_IN_ASSIGNMENT');
    });
  });

  describe('REVIEWER Role Capabilities', () => {
    it('permits review and audit capabilities', async () => {
      expect(await service.can(REVIEWER_KEY, 'SOURCE_REVIEW')).toBe(true);
      expect(await service.can(REVIEWER_KEY, 'SOURCE_APPROVE')).toBe(true);
      expect(await service.can(REVIEWER_KEY, 'ACADEMIC_EVENT_REVIEW')).toBe(true);
      expect(await service.can(REVIEWER_KEY, 'AUDIT_VIEW')).toBe(true);
    });

    it('denies course editing and admin management mutations', async () => {
      expect(
        await service.can(REVIEWER_KEY, 'COURSE_EDIT', { type: 'course', courseCode: 'MCT314' }),
      ).toBe(false);
      expect(await service.can(REVIEWER_KEY, 'ADMIN_MANAGE')).toBe(false);
      expect(await service.can(REVIEWER_KEY, 'ROLE_ASSIGN')).toBe(false);
    });
  });

  describe('STUDENT Role Restrictions', () => {
    it('denies all admin and course mutations', async () => {
      expect(
        await service.can(STUDENT_KEY, 'COURSE_EDIT', { type: 'course', courseCode: 'MCT314' }),
      ).toBe(false);
      expect(
        await service.can(STUDENT_KEY, 'COURSE_PULSE_UPDATE', {
          type: 'course',
          courseCode: 'MCT314',
        }),
      ).toBe(false);
      expect(await service.can(STUDENT_KEY, 'ROLE_ASSIGN')).toBe(false);
      expect(await service.can(STUDENT_KEY, 'ADMIN_MANAGE')).toBe(false);
      expect(await service.can(STUDENT_KEY, 'SOURCE_APPROVE')).toBe(false);
    });

    it('allows read and source submission for students', async () => {
      expect(await service.can(STUDENT_KEY, 'COURSE_VIEW')).toBe(true);
      expect(await service.can(STUDENT_KEY, 'SOURCE_SUBMIT')).toBe(true);
    });
  });

  describe('Role Assignment Safety & Privilege Escalation Prevention', () => {
    it('COURSE_EDITOR cannot grant roles', async () => {
      await expect(
        service.assignRole(EDITOR_KEY, 'actor_target_1', 'COURSE_EDITOR'),
      ).rejects.toThrow(UnauthorizedError);
    });

    it('REVIEWER cannot grant roles', async () => {
      await expect(service.assignRole(REVIEWER_KEY, 'actor_target_1', 'REVIEWER')).rejects.toThrow(
        UnauthorizedError,
      );
    });

    it('STUDENT cannot grant roles', async () => {
      await expect(service.assignRole(STUDENT_KEY, 'actor_target_1', 'STUDENT')).rejects.toThrow(
        UnauthorizedError,
      );
    });

    it('ADMIN cannot grant SUPER_ADMIN role', async () => {
      await expect(service.assignRole(ADMIN_KEY, 'actor_target_1', 'SUPER_ADMIN')).rejects.toThrow(
        UnauthorizedError,
      );
    });

    it('ADMIN cannot demote SUPER_ADMIN', async () => {
      await expect(service.assignRole(ADMIN_KEY, SUPER_ADMIN_KEY, 'ADMIN')).rejects.toThrow(
        UnauthorizedError,
      );
    });

    it('ADMIN can grant ADMIN or COURSE_EDITOR to another actor', async () => {
      await service.assignRole(ADMIN_KEY, 'actor_target_1', 'COURSE_EDITOR');
      const role = await repository.getRole('actor_target_1');
      expect(role).toBe('COURSE_EDITOR');
    });

    it('SUPER_ADMIN can assign any role including SUPER_ADMIN', async () => {
      await service.assignRole(SUPER_ADMIN_KEY, 'actor_target_new_sa', 'SUPER_ADMIN');
      const role = await repository.getRole('actor_target_new_sa');
      expect(role).toBe('SUPER_ADMIN');
    });

    it('actor cannot self-escalate their role', async () => {
      await expect(service.assignRole(ADMIN_KEY, ADMIN_KEY, 'SUPER_ADMIN')).rejects.toThrow(
        UnauthorizedError,
      );
      await expect(service.assignRole(EDITOR_KEY, EDITOR_KEY, 'ADMIN')).rejects.toThrow(
        UnauthorizedError,
      );
    });

    it('protects the final SUPER_ADMIN from demotion or revocation', async () => {
      // Currently only one SUPER_ADMIN exists (SUPER_ADMIN_KEY)
      expect(await repository.countSuperAdmins()).toBe(1);

      await expect(service.assignRole(SUPER_ADMIN_KEY, SUPER_ADMIN_KEY, 'ADMIN')).rejects.toThrow();

      // Even if another SUPER_ADMIN attempts it when count is 1
      await expect(service.revokeRole(SUPER_ADMIN_KEY, SUPER_ADMIN_KEY)).rejects.toThrow();
    });
  });

  describe('Isolation & Determinism', () => {
    it('isolates two course editors to their assigned domains', async () => {
      const EDITOR_2_KEY = 'actor_editor_2';
      await repository.setRole(EDITOR_2_KEY, 'COURSE_EDITOR', SUPER_ADMIN_KEY);

      // Assign editor 1 to MCT314
      await service.assignCourseEditor(SUPER_ADMIN_KEY, {
        actorKey: EDITOR_KEY,
        courseCode: 'MCT314',
      });

      // Assign editor 2 to MCT324
      await service.assignCourseEditor(SUPER_ADMIN_KEY, {
        actorKey: EDITOR_2_KEY,
        courseCode: 'MCT324',
      });

      // Editor 1 can edit MCT314 but NOT MCT324
      expect(
        await service.can(EDITOR_KEY, 'COURSE_EDIT', { type: 'course', courseCode: 'MCT314' }),
      ).toBe(true);
      expect(
        await service.can(EDITOR_KEY, 'COURSE_EDIT', { type: 'course', courseCode: 'MCT324' }),
      ).toBe(false);

      // Editor 2 can edit MCT324 but NOT MCT314
      expect(
        await service.can(EDITOR_2_KEY, 'COURSE_EDIT', { type: 'course', courseCode: 'MCT324' }),
      ).toBe(true);
      expect(
        await service.can(EDITOR_2_KEY, 'COURSE_EDIT', { type: 'course', courseCode: 'MCT314' }),
      ).toBe(false);
    });

    it('produces identical repeated authorization decisions deterministically', async () => {
      await service.assignCourseEditor(SUPER_ADMIN_KEY, {
        actorKey: EDITOR_KEY,
        courseCode: 'MCT314',
      });

      const d1 = await service.authorize(EDITOR_KEY, 'COURSE_EDIT', {
        type: 'course',
        courseCode: 'MCT314',
      });
      const d2 = await service.authorize(EDITOR_KEY, 'COURSE_EDIT', {
        type: 'course',
        courseCode: 'MCT314',
      });

      expect(d1.allowed).toBe(true);
      expect(d2.allowed).toBe(true);
      expect(d1.reason).toBe(d2.reason);
    });
  });

  describe('Validation & Syntax Safeguards', () => {
    it('validates and normalizes courseCode syntax correctly', () => {
      expect(isValidCourseCode('MCT314')).toBe(true);
      expect(isValidCourseCode('MATH101')).toBe(true);
      expect(isValidCourseCode('EE201A')).toBe(true);

      expect(isValidCourseCode('mct314')).toBe(false); // must be uppercase
      expect(isValidCourseCode('MCT 314')).toBe(false);
      expect(isValidCourseCode('MCT@314')).toBe(false);
      expect(isValidCourseCode('')).toBe(false);

      expect(normalizeCourseCode('mct314')).toBe('MCT314');
      expect(() => normalizeCourseCode('invalid@code')).toThrow();
    });

    it('validates schema definitions strictly', () => {
      expect(CourseCodeSchema.safeParse('MCT314').success).toBe(true);
      expect(CourseCodeSchema.safeParse('mct314').success).toBe(false);

      expect(RoleSchema.safeParse('ADMIN').success).toBe(true);
      expect(RoleSchema.safeParse('HACKER').success).toBe(false);

      expect(ActorKeySchema.safeParse('valid_actor-1').success).toBe(true);
      expect(ActorKeySchema.safeParse('bad actor key with spaces').success).toBe(false);
    });

    it('tests isRole and isAdminPermission type guards', () => {
      expect(isRole('SUPER_ADMIN')).toBe(true);
      expect(isRole('ADMIN')).toBe(true);
      expect(isRole('UNKNOWN')).toBe(false);
      expect(isRole(null)).toBe(false);

      expect(isAdminPermission('COURSE_EDIT')).toBe(true);
      expect(isAdminPermission('NOT_A_PERMISSION')).toBe(false);
      expect(isAdminPermission(123)).toBe(false);
    });

    it('validateWithSchema throws ValidationError on invalid inputs', () => {
      expect(() => validateWithSchema(RoleSchema, 'INVALID', 'testContext')).toThrow(
        ValidationError,
      );
      expect(validateWithSchema(RoleSchema, 'STUDENT', 'testContext')).toBe('STUDENT');
    });

    it('assertAuthorized throws UnauthorizedError on denied authorization', async () => {
      await expect(service.assertAuthorized(STUDENT_KEY, 'ROLE_ASSIGN')).rejects.toThrow(
        UnauthorizedError,
      );
      const decision = await service.assertAuthorized(SUPER_ADMIN_KEY, 'ROLE_ASSIGN');
      expect(decision.allowed).toBe(true);
    });

    it('exercises InMemoryAdminRepository helper query methods', async () => {
      const assignment = await service.assignCourseEditor(SUPER_ADMIN_KEY, {
        actorKey: EDITOR_KEY,
        courseCode: 'MCT314',
      });

      const found = await repository.findAssignment(EDITOR_KEY, 'mct314');
      expect(found).toBeDefined();
      expect(found?.id).toBe(assignment.id);

      const byCourse = await repository.listAssignmentsByCourse('MCT314');
      expect(byCourse).toHaveLength(1);
      expect(byCourse[0]?.id).toBe(assignment.id);

      const byId = await repository.getAssignment(assignment.id);
      expect(byId).toBeDefined();

      const nonExistent = await repository.getAssignment('non_existent_id');
      expect(nonExistent).toBeNull();

      const editors = await repository.listActorsByRole('COURSE_EDITOR');
      expect(editors).toContain(EDITOR_KEY);

      repository.clear();
      expect(await repository.getAssignment(assignment.id)).toBeNull();
      expect(await repository.countSuperAdmins()).toBe(0);
    });
  });
});
