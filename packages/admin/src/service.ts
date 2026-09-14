import {
  type Clock,
  SystemClock,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from '@mecha-bot/shared';
import type { Role } from './roles.js';
import { canRoleAssignTargetRole } from './roles.js';
import type { AdminPermission } from './permissions.js';
import { type AuthorizationResource, normalizeCourseCode } from './scopes.js';
import type { AssignmentStatus, CourseEditorAssignment } from './assignments.js';
import {
  type ReviewItem,
  type ReviewType,
  evaluateSelfReviewPolicy,
  isValidReviewTransition,
} from './review.js';
import {
  type AdminAuditEvent,
  type AuditEventFilter,
  generateAuditId,
  sanitizeAuditMetadata,
} from './audit.js';
import type { AdminRepository, ReviewItemFilter } from './repository.js';
import { InMemoryAdminRepository } from './in-memory-repository.js';
import { type AuthorizationDecision, evaluateAuthorization } from './authorization.js';
import {
  ActorKeySchema,
  CreateAssignmentInputSchema,
  CreateReviewItemInputSchema,
  ReviewDecisionInputSchema,
  RoleSchema,
  validateWithSchema,
} from './schemas.js';

export interface AdminServiceOptions {
  repository?: AdminRepository | undefined;
  clock?: Clock | undefined;
}

export interface CreateAssignmentParams {
  actorKey: string;
  courseCode: string;
  permissions?: AdminPermission[] | undefined;
  validFrom?: string | undefined;
  validTo?: string | undefined;
}

export interface SubmitReviewParams {
  type: ReviewType;
  courseCode?: string | undefined;
  targetRef?: string | undefined;
  title?: string | undefined;
  summary?: string | undefined;
}

export interface DecideReviewParams {
  itemId: string;
  decision: 'APPROVED' | 'REJECTED' | 'NEEDS_CHANGES';
  reason: string;
  allowSuperAdminOverride?: boolean | undefined;
}

export class AdminService {
  private repository: AdminRepository;
  private clock: Clock;

  constructor(options: AdminServiceOptions = {}) {
    this.repository = options.repository ?? new InMemoryAdminRepository();
    this.clock = options.clock ?? new SystemClock();
  }

  // --- Core Authorization ---

  /**
   * Deterministic capability check returning boolean.
   */
  async can(
    actorKey: string,
    permission: AdminPermission,
    resource?: AuthorizationResource,
  ): Promise<boolean> {
    const decision = await this.authorize(actorKey, permission, resource);
    return decision.allowed;
  }

  /**
   * Evaluates authorization and records audit log on denials.
   */
  async authorize(
    actorKey: string,
    permission: AdminPermission,
    resource?: AuthorizationResource,
  ): Promise<AuthorizationDecision> {
    validateWithSchema(ActorKeySchema, actorKey, 'actorKey');

    const role = (await this.repository.getRole(actorKey)) ?? 'STUDENT';
    const assignments = await this.repository.listAssignmentsByActor(actorKey);

    const now = this.clock.now();
    const decision = evaluateAuthorization(actorKey, role, permission, assignments, resource, now);

    // Audit denials
    if (!decision.allowed) {
      await this.repository.recordAuditEvent({
        id: generateAuditId('authz_denied'),
        actorKey,
        action: 'AUTHORIZATION_DENIED',
        resourceType: resource?.type ?? 'permission',
        resourceKey: resource?.resourceKey,
        courseCode: resource?.courseCode,
        outcome: 'DENIED',
        reason: decision.reason,
        timestamp: decision.timestamp,
        metadata: sanitizeAuditMetadata({
          requestedPermission: permission,
          actorRole: role,
        }),
      });
    }

    return decision;
  }

  /**
   * Asserts authorization, throwing UnauthorizedError if denied.
   */
  async assertAuthorized(
    actorKey: string,
    permission: AdminPermission,
    resource?: AuthorizationResource,
  ): Promise<AuthorizationDecision> {
    const decision = await this.authorize(actorKey, permission, resource);
    if (!decision.allowed) {
      throw new UnauthorizedError(`Authorization denied: ${decision.reason}`);
    }
    return decision;
  }

  // --- Role Management & Privilege Escalation Prevention ---

  /**
   * Assigns or updates a role for targetActorKey.
   *
   * Safety Rules:
   * 1. Caller must have ROLE_ASSIGN capability.
   * 2. Self-escalation is strictly forbidden.
   * 3. Only SUPER_ADMIN may grant or revoke SUPER_ADMIN.
   * 4. Demoting/revoking the final SUPER_ADMIN is forbidden.
   */
  async assignRole(callerKey: string, targetActorKey: string, newRole: Role): Promise<void> {
    validateWithSchema(ActorKeySchema, callerKey, 'callerKey');
    validateWithSchema(ActorKeySchema, targetActorKey, 'targetActorKey');
    validateWithSchema(RoleSchema, newRole, 'newRole');

    // 1. Caller capability check
    await this.assertAuthorized(callerKey, 'ROLE_ASSIGN', {
      type: 'role',
      resourceKey: targetActorKey,
    });

    const callerRole = (await this.repository.getRole(callerKey)) ?? 'STUDENT';
    const targetCurrentRole = (await this.repository.getRole(targetActorKey)) ?? 'STUDENT';

    // 2. Prevent self-escalation
    if (callerKey === targetActorKey) {
      await this.auditFailure(
        callerKey,
        'ROLE_ASSIGN',
        'role',
        'SELF_ESCALATION_FORBIDDEN',
        targetActorKey,
      );
      throw new UnauthorizedError('Self-escalation of roles is strictly forbidden');
    }

    // 3. Super admin grant/revoke privilege ceiling
    if (!canRoleAssignTargetRole(callerRole, newRole)) {
      await this.auditFailure(
        callerKey,
        'ROLE_ASSIGN',
        'role',
        'CANNOT_GRANT_SUPER_ADMIN',
        targetActorKey,
      );
      throw new UnauthorizedError('Caller lacks privilege to grant target role');
    }

    if (
      targetCurrentRole === 'SUPER_ADMIN' &&
      newRole !== 'SUPER_ADMIN' &&
      callerRole !== 'SUPER_ADMIN'
    ) {
      await this.auditFailure(
        callerKey,
        'ROLE_ASSIGN',
        'role',
        'CANNOT_DEMOTE_SUPER_ADMIN',
        targetActorKey,
      );
      throw new UnauthorizedError('Only SUPER_ADMIN may demote a SUPER_ADMIN');
    }

    // 4. Protect final SUPER_ADMIN from demotion
    if (targetCurrentRole === 'SUPER_ADMIN' && newRole !== 'SUPER_ADMIN') {
      const superAdminCount = await this.repository.countSuperAdmins();
      if (superAdminCount <= 1) {
        await this.auditFailure(
          callerKey,
          'ROLE_ASSIGN',
          'role',
          'CANNOT_DEMOTE_FINAL_SUPER_ADMIN',
          targetActorKey,
        );
        throw new ConflictError('Cannot demote or revoke the final SUPER_ADMIN in the system');
      }
    }

    await this.repository.setRole(targetActorKey, newRole, callerKey);

    await this.repository.recordAuditEvent({
      id: generateAuditId('role_assign'),
      actorKey: callerKey,
      action: 'ROLE_ASSIGN',
      resourceType: 'role',
      resourceKey: targetActorKey,
      outcome: 'SUCCESS',
      timestamp: this.clock.nowIso(),
      metadata: sanitizeAuditMetadata({
        previousRole: targetCurrentRole,
        newRole,
        targetActorKey,
      }),
    });
  }

  /**
   * Revokes all administrative roles for target actor, returning them to STUDENT status.
   */
  async revokeRole(callerKey: string, targetActorKey: string): Promise<void> {
    validateWithSchema(ActorKeySchema, callerKey, 'callerKey');
    validateWithSchema(ActorKeySchema, targetActorKey, 'targetActorKey');

    await this.assertAuthorized(callerKey, 'ROLE_ASSIGN', {
      type: 'role',
      resourceKey: targetActorKey,
    });

    const callerRole = (await this.repository.getRole(callerKey)) ?? 'STUDENT';
    const targetCurrentRole = (await this.repository.getRole(targetActorKey)) ?? 'STUDENT';

    if (callerKey === targetActorKey) {
      await this.auditFailure(
        callerKey,
        'ROLE_REVOKE',
        'role',
        'SELF_REVOCATION_FORBIDDEN',
        targetActorKey,
      );
      throw new UnauthorizedError('Self-revocation of role is not allowed');
    }

    if (targetCurrentRole === 'SUPER_ADMIN') {
      if (callerRole !== 'SUPER_ADMIN') {
        await this.auditFailure(
          callerKey,
          'ROLE_REVOKE',
          'role',
          'CANNOT_REVOKE_SUPER_ADMIN',
          targetActorKey,
        );
        throw new UnauthorizedError('Only SUPER_ADMIN may revoke a SUPER_ADMIN role');
      }

      const superAdminCount = await this.repository.countSuperAdmins();
      if (superAdminCount <= 1) {
        await this.auditFailure(
          callerKey,
          'ROLE_REVOKE',
          'role',
          'CANNOT_REVOKE_FINAL_SUPER_ADMIN',
          targetActorKey,
        );
        throw new ConflictError('Cannot demote or revoke the final SUPER_ADMIN in the system');
      }
    }

    await this.repository.removeRole(targetActorKey);

    await this.repository.recordAuditEvent({
      id: generateAuditId('role_revoke'),
      actorKey: callerKey,
      action: 'ROLE_REVOKE',
      resourceType: 'role',
      resourceKey: targetActorKey,
      outcome: 'SUCCESS',
      timestamp: this.clock.nowIso(),
      metadata: sanitizeAuditMetadata({
        previousRole: targetCurrentRole,
        targetActorKey,
      }),
    });
  }

  // --- Course Editor Assignments ---

  /**
   * Assigns an actor to manage a course.
   */
  async assignCourseEditor(
    callerKey: string,
    params: CreateAssignmentParams,
  ): Promise<CourseEditorAssignment> {
    validateWithSchema(ActorKeySchema, callerKey, 'callerKey');
    const validated = validateWithSchema(CreateAssignmentInputSchema, params, 'assignmentParams');

    const courseCode = normalizeCourseCode(validated.courseCode);

    await this.assertAuthorized(callerKey, 'ROLE_ASSIGN', {
      type: 'course',
      courseCode,
      resourceKey: validated.actorKey,
    });

    const nowIso = this.clock.nowIso();
    const id = `assign_${validated.actorKey}_${courseCode}_${Date.now()}`;

    const assignment: CourseEditorAssignment = {
      id,
      actorKey: validated.actorKey,
      courseCode,
      permissions: validated.permissions,
      validFrom: validated.validFrom,
      validTo: validated.validTo,
      assignedBy: callerKey,
      assignedAt: nowIso,
      status: 'ACTIVE',
    };

    await this.repository.saveAssignment(assignment);

    await this.repository.recordAuditEvent({
      id: generateAuditId('assign_course'),
      actorKey: callerKey,
      action: 'COURSE_EDITOR_ASSIGN',
      resourceType: 'course_editor_assignment',
      resourceKey: id,
      courseCode,
      outcome: 'SUCCESS',
      timestamp: nowIso,
      metadata: sanitizeAuditMetadata({
        targetActorKey: validated.actorKey,
        validFrom: validated.validFrom,
        validTo: validated.validTo,
      }),
    });

    return assignment;
  }

  /**
   * Revokes a course editor assignment.
   */
  async revokeCourseEditorAssignment(
    callerKey: string,
    assignmentId: string,
    reason?: string,
  ): Promise<CourseEditorAssignment> {
    validateWithSchema(ActorKeySchema, callerKey, 'callerKey');

    const existing = await this.repository.getAssignment(assignmentId);
    if (!existing) {
      throw new NotFoundError('CourseEditorAssignment', assignmentId);
    }

    await this.assertAuthorized(callerKey, 'ROLE_ASSIGN', {
      type: 'course',
      courseCode: existing.courseCode,
      resourceKey: existing.actorKey,
    });

    const nowIso = this.clock.nowIso();
    const updated: CourseEditorAssignment = {
      ...existing,
      status: 'REVOKED' as AssignmentStatus,
      revokedAt: nowIso,
      revokedBy: callerKey,
      revocationReason: reason,
    };

    await this.repository.saveAssignment(updated);

    await this.repository.recordAuditEvent({
      id: generateAuditId('revoke_course_assign'),
      actorKey: callerKey,
      action: 'COURSE_EDITOR_REVOKE',
      resourceType: 'course_editor_assignment',
      resourceKey: assignmentId,
      courseCode: existing.courseCode,
      outcome: 'SUCCESS',
      reason,
      timestamp: nowIso,
      metadata: sanitizeAuditMetadata({
        targetActorKey: existing.actorKey,
      }),
    });

    return updated;
  }

  // --- Moderation & Review Workflow ---

  /**
   * Submits student or editor material into the moderation pipeline.
   * Student material submitted here never enters trusted knowledge automatically.
   */
  async submitForReview(callerKey: string, params: SubmitReviewParams): Promise<ReviewItem> {
    validateWithSchema(ActorKeySchema, callerKey, 'callerKey');
    const validated = validateWithSchema(CreateReviewItemInputSchema, params, 'reviewSubmission');

    const courseCode = validated.courseCode ? normalizeCourseCode(validated.courseCode) : undefined;

    await this.assertAuthorized(callerKey, 'SOURCE_SUBMIT', {
      type: 'review_item',
      courseCode,
    });

    const nowIso = this.clock.nowIso();
    const id = `rev_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const item: ReviewItem = {
      id,
      type: validated.type,
      submittedBy: callerKey,
      courseCode,
      targetRef: validated.targetRef,
      title: validated.title,
      summary: validated.summary,
      submittedAt: nowIso,
      status: 'PENDING',
      version: 1,
      history: [
        {
          fromStatus: 'PENDING',
          toStatus: 'PENDING',
          changedBy: callerKey,
          changedAt: nowIso,
          reason: 'Initial submission',
        },
      ],
    };

    await this.repository.saveReviewItem(item);

    await this.repository.recordAuditEvent({
      id: generateAuditId('review_submit'),
      actorKey: callerKey,
      action: 'REVIEW_SUBMISSION',
      resourceType: 'review_item',
      resourceKey: id,
      courseCode,
      outcome: 'SUCCESS',
      timestamp: nowIso,
      metadata: sanitizeAuditMetadata({
        reviewType: validated.type,
        title: validated.title,
      }),
    });

    return item;
  }

  /**
   * Makes a moderation decision on a review item (APPROVED, REJECTED, NEEDS_CHANGES).
   *
   * Enforces:
   * - Reviewer capability
   * - Valid state transitions
   * - Self-review prevention (submitter cannot approve own work without explicit super admin override)
   */
  async decideReviewItem(callerKey: string, params: DecideReviewParams): Promise<ReviewItem> {
    validateWithSchema(ActorKeySchema, callerKey, 'callerKey');
    const validated = validateWithSchema(ReviewDecisionInputSchema, params, 'reviewDecision');

    const item = await this.repository.getReviewItem(validated.itemId);
    if (!item) {
      throw new NotFoundError('ReviewItem', validated.itemId);
    }

    // Determine required permission based on review type and decision
    const requiredPermission: AdminPermission =
      validated.decision === 'APPROVED' ? 'SOURCE_APPROVE' : 'SOURCE_REVIEW';

    await this.assertAuthorized(callerKey, requiredPermission, {
      type: 'review_item',
      courseCode: item.courseCode,
      resourceKey: item.id,
    });

    // Verify valid state transition
    if (!isValidReviewTransition(item.status, validated.decision)) {
      throw new ConflictError(
        `Invalid review transition from '${item.status}' to '${validated.decision}'`,
      );
    }

    // Independent review / self-review check
    const callerRole = (await this.repository.getRole(callerKey)) ?? 'STUDENT';
    const selfReviewEval = evaluateSelfReviewPolicy(
      callerKey,
      callerRole,
      item.submittedBy,
      validated.allowSuperAdminOverride ?? false,
    );

    if (!selfReviewEval.allowed) {
      await this.auditFailure(
        callerKey,
        'REVIEW_DECISION',
        'review_item',
        selfReviewEval.reason ?? 'SELF_REVIEW_DENIED',
        item.id,
        item.courseCode,
      );
      throw new UnauthorizedError(`Self-review policy violation: ${selfReviewEval.reason}`);
    }

    const nowIso = this.clock.nowIso();
    const previousStatus = item.status;

    const updated: ReviewItem = {
      ...item,
      status: validated.decision,
      reviewedBy: callerKey,
      reviewedAt: nowIso,
      decisionReason: validated.reason,
      version: item.version + 1,
      history: [
        ...item.history,
        {
          fromStatus: previousStatus,
          toStatus: validated.decision,
          changedBy: callerKey,
          changedAt: nowIso,
          reason: validated.reason,
        },
      ],
    };

    await this.repository.saveReviewItem(updated);

    await this.repository.recordAuditEvent({
      id: generateAuditId('review_decision'),
      actorKey: callerKey,
      action: 'REVIEW_DECISION',
      resourceType: 'review_item',
      resourceKey: item.id,
      courseCode: item.courseCode,
      outcome: 'SUCCESS',
      reason: validated.reason,
      timestamp: nowIso,
      metadata: sanitizeAuditMetadata({
        previousStatus,
        newStatus: validated.decision,
        isSuperAdminOverride: Boolean(selfReviewEval.isOverride),
      }),
    });

    return updated;
  }

  /**
   * Resubmits an item that was marked as NEEDS_CHANGES back to PENDING status.
   */
  async resubmitReviewItem(
    callerKey: string,
    itemId: string,
    updateReason = 'Addressing requested changes',
  ): Promise<ReviewItem> {
    validateWithSchema(ActorKeySchema, callerKey, 'callerKey');

    const item = await this.repository.getReviewItem(itemId);
    if (!item) {
      throw new NotFoundError('ReviewItem', itemId);
    }

    if (item.status !== 'NEEDS_CHANGES') {
      throw new ConflictError(
        `Cannot resubmit item with status '${item.status}'. Only NEEDS_CHANGES can be resubmitted.`,
      );
    }

    // Only submitter or admin can resubmit
    const callerRole = (await this.repository.getRole(callerKey)) ?? 'STUDENT';
    if (callerKey !== item.submittedBy && callerRole !== 'ADMIN' && callerRole !== 'SUPER_ADMIN') {
      throw new UnauthorizedError(
        'Only the original submitter or an administrator may resubmit this item',
      );
    }

    const nowIso = this.clock.nowIso();
    const updated: ReviewItem = {
      ...item,
      status: 'PENDING',
      version: item.version + 1,
      history: [
        ...item.history,
        {
          fromStatus: 'NEEDS_CHANGES',
          toStatus: 'PENDING',
          changedBy: callerKey,
          changedAt: nowIso,
          reason: updateReason,
        },
      ],
    };

    await this.repository.saveReviewItem(updated);

    await this.repository.recordAuditEvent({
      id: generateAuditId('review_resubmit'),
      actorKey: callerKey,
      action: 'REVIEW_RESUBMIT',
      resourceType: 'review_item',
      resourceKey: itemId,
      courseCode: item.courseCode,
      outcome: 'SUCCESS',
      reason: updateReason,
      timestamp: nowIso,
    });

    return updated;
  }

  /**
   * Withdraws a submission from review (terminal withdrawal).
   */
  async withdrawReviewItem(
    callerKey: string,
    itemId: string,
    reason = 'Withdrawn by user',
  ): Promise<ReviewItem> {
    validateWithSchema(ActorKeySchema, callerKey, 'callerKey');

    const item = await this.repository.getReviewItem(itemId);
    if (!item) {
      throw new NotFoundError('ReviewItem', itemId);
    }

    if (!isValidReviewTransition(item.status, 'WITHDRAWN')) {
      throw new ConflictError(`Cannot withdraw item with status '${item.status}'`);
    }

    const callerRole = (await this.repository.getRole(callerKey)) ?? 'STUDENT';
    if (callerKey !== item.submittedBy && callerRole !== 'ADMIN' && callerRole !== 'SUPER_ADMIN') {
      throw new UnauthorizedError('Only submitter or an admin can withdraw this review item');
    }

    const nowIso = this.clock.nowIso();
    const updated: ReviewItem = {
      ...item,
      status: 'WITHDRAWN',
      version: item.version + 1,
      history: [
        ...item.history,
        {
          fromStatus: item.status,
          toStatus: 'WITHDRAWN',
          changedBy: callerKey,
          changedAt: nowIso,
          reason,
        },
      ],
    };

    await this.repository.saveReviewItem(updated);

    await this.repository.recordAuditEvent({
      id: generateAuditId('review_withdraw'),
      actorKey: callerKey,
      action: 'REVIEW_WITHDRAW',
      resourceType: 'review_item',
      resourceKey: itemId,
      courseCode: item.courseCode,
      outcome: 'SUCCESS',
      reason,
      timestamp: nowIso,
    });

    return updated;
  }

  /**
   * Explicit administrative reopening of an APPROVED or REJECTED review item.
   * Disallowed through normal transition; must be performed via this explicit operation.
   */
  async reopenReviewItem(callerKey: string, itemId: string, reason: string): Promise<ReviewItem> {
    validateWithSchema(ActorKeySchema, callerKey, 'callerKey');

    await this.assertAuthorized(callerKey, 'ADMIN_MANAGE', {
      type: 'review_item',
      resourceKey: itemId,
    });

    const item = await this.repository.getReviewItem(itemId);
    if (!item) {
      throw new NotFoundError('ReviewItem', itemId);
    }

    if (item.status !== 'APPROVED' && item.status !== 'REJECTED') {
      throw new ConflictError(
        `Only APPROVED or REJECTED items can be reopened; current status is '${item.status}'`,
      );
    }

    const nowIso = this.clock.nowIso();
    const previousStatus = item.status;

    const updated: ReviewItem = {
      ...item,
      status: 'PENDING',
      version: item.version + 1,
      history: [
        ...item.history,
        {
          fromStatus: previousStatus,
          toStatus: 'PENDING',
          changedBy: callerKey,
          changedAt: nowIso,
          reason: `Reopened: ${reason}`,
        },
      ],
    };

    await this.repository.saveReviewItem(updated);

    await this.repository.recordAuditEvent({
      id: generateAuditId('review_reopen'),
      actorKey: callerKey,
      action: 'REVIEW_REOPEN',
      resourceType: 'review_item',
      resourceKey: itemId,
      courseCode: item.courseCode,
      outcome: 'SUCCESS',
      reason,
      timestamp: nowIso,
      metadata: sanitizeAuditMetadata({ previousStatus }),
    });

    return updated;
  }

  /**
   * Lists review items matching optional filter, requiring SOURCE_REVIEW or ADMIN_MANAGE.
   */
  async listReviewItems(callerKey: string, filter?: ReviewItemFilter): Promise<ReviewItem[]> {
    validateWithSchema(ActorKeySchema, callerKey, 'callerKey');

    await this.assertAuthorized(callerKey, 'SOURCE_REVIEW', {
      type: 'review_item',
      courseCode: filter?.courseCode,
    });

    return this.repository.listReviewItems(filter);
  }

  // --- Audit Inspection ---

  /**
   * Retrieves audit logs subject to AUDIT_VIEW authorization.
   */
  async getAuditLogs(callerKey: string, filter?: AuditEventFilter): Promise<AdminAuditEvent[]> {
    validateWithSchema(ActorKeySchema, callerKey, 'callerKey');

    await this.assertAuthorized(callerKey, 'AUDIT_VIEW', {
      type: 'audit',
    });

    return this.repository.listAuditEvents(filter);
  }

  // --- Helper Audit Recorder ---

  private async auditFailure(
    actorKey: string,
    action: string,
    resourceType: string,
    reason: string,
    resourceKey?: string,
    courseCode?: string,
  ): Promise<void> {
    await this.repository.recordAuditEvent({
      id: generateAuditId('audit_fail'),
      actorKey,
      action,
      resourceType,
      resourceKey,
      courseCode,
      outcome: 'FAILURE',
      reason,
      timestamp: this.clock.nowIso(),
    });
  }
}
