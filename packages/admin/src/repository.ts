import type { Role } from './roles.js';
import type { CourseEditorAssignment } from './assignments.js';
import type { ReviewItem, ReviewStatus, ReviewType } from './review.js';
import type { AdminAuditEvent, AuditEventFilter } from './audit.js';

export interface ReviewItemFilter {
  type?: ReviewType | undefined;
  courseCode?: string | undefined;
  status?: ReviewStatus | undefined;
  submittedBy?: string | undefined;
  reviewedBy?: string | undefined;
  limit?: number | undefined;
}

export interface AdminRepository {
  // Roles
  getRole(actorKey: string): Promise<Role | null>;
  setRole(actorKey: string, role: Role, assignedBy: string): Promise<void>;
  removeRole(actorKey: string): Promise<void>;
  countSuperAdmins(): Promise<number>;
  listActorsByRole(role: Role): Promise<string[]>;

  // Course Editor Assignments
  getAssignment(id: string): Promise<CourseEditorAssignment | null>;
  findAssignment(actorKey: string, courseCode: string): Promise<CourseEditorAssignment | null>;
  listAssignmentsByActor(actorKey: string): Promise<CourseEditorAssignment[]>;
  listAssignmentsByCourse(courseCode: string): Promise<CourseEditorAssignment[]>;
  saveAssignment(assignment: CourseEditorAssignment): Promise<void>;

  // Review Items
  getReviewItem(id: string): Promise<ReviewItem | null>;
  saveReviewItem(item: ReviewItem): Promise<void>;
  listReviewItems(filter?: ReviewItemFilter): Promise<ReviewItem[]>;

  // Audit Events
  recordAuditEvent(event: AdminAuditEvent): Promise<void>;
  listAuditEvents(filter?: AuditEventFilter): Promise<AdminAuditEvent[]>;
}
