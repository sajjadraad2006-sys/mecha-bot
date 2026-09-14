import type { Role } from './roles.js';
import type { CourseEditorAssignment } from './assignments.js';
import type { ReviewItem } from './review.js';
import type { AdminAuditEvent, AuditEventFilter } from './audit.js';
import type { AdminRepository, ReviewItemFilter } from './repository.js';

export interface InMemoryRepositoryInitialData {
  roles?: Record<string, Role> | undefined;
  assignments?: CourseEditorAssignment[] | undefined;
  reviewItems?: ReviewItem[] | undefined;
  auditEvents?: AdminAuditEvent[] | undefined;
}

export class InMemoryAdminRepository implements AdminRepository {
  private roles = new Map<string, Role>();
  private assignments = new Map<string, CourseEditorAssignment>();
  private reviewItems = new Map<string, ReviewItem>();
  private auditEvents: AdminAuditEvent[] = [];

  constructor(initial?: InMemoryRepositoryInitialData) {
    if (initial?.roles) {
      for (const [actorKey, role] of Object.entries(initial.roles)) {
        this.roles.set(actorKey, role);
      }
    }
    if (initial?.assignments) {
      for (const assign of initial.assignments) {
        this.assignments.set(assign.id, { ...assign });
      }
    }
    if (initial?.reviewItems) {
      for (const item of initial.reviewItems) {
        this.reviewItems.set(item.id, {
          ...item,
          history: [...item.history],
        });
      }
    }
    if (initial?.auditEvents) {
      this.auditEvents = initial.auditEvents.map((e) => ({ ...e }));
    }
  }

  // --- Roles ---

  async getRole(actorKey: string): Promise<Role | null> {
    return this.roles.get(actorKey) ?? null;
  }

  async setRole(actorKey: string, role: Role, _assignedBy: string): Promise<void> {
    this.roles.set(actorKey, role);
  }

  async removeRole(actorKey: string): Promise<void> {
    this.roles.delete(actorKey);
  }

  async countSuperAdmins(): Promise<number> {
    let count = 0;
    for (const role of this.roles.values()) {
      if (role === 'SUPER_ADMIN') {
        count += 1;
      }
    }
    return count;
  }

  async listActorsByRole(role: Role): Promise<string[]> {
    const matched: string[] = [];
    for (const [key, r] of this.roles.entries()) {
      if (r === role) {
        matched.push(key);
      }
    }
    return matched;
  }

  // --- Assignments ---

  async getAssignment(id: string): Promise<CourseEditorAssignment | null> {
    const item = this.assignments.get(id);
    return item ? { ...item } : null;
  }

  async findAssignment(
    actorKey: string,
    courseCode: string,
  ): Promise<CourseEditorAssignment | null> {
    const normalized = courseCode.trim().toUpperCase();
    for (const a of this.assignments.values()) {
      if (a.actorKey === actorKey && a.courseCode.trim().toUpperCase() === normalized) {
        return { ...a };
      }
    }
    return null;
  }

  async listAssignmentsByActor(actorKey: string): Promise<CourseEditorAssignment[]> {
    const results: CourseEditorAssignment[] = [];
    for (const a of this.assignments.values()) {
      if (a.actorKey === actorKey) {
        results.push({ ...a });
      }
    }
    return results;
  }

  async listAssignmentsByCourse(courseCode: string): Promise<CourseEditorAssignment[]> {
    const normalized = courseCode.trim().toUpperCase();
    const results: CourseEditorAssignment[] = [];
    for (const a of this.assignments.values()) {
      if (a.courseCode.trim().toUpperCase() === normalized) {
        results.push({ ...a });
      }
    }
    return results;
  }

  async saveAssignment(assignment: CourseEditorAssignment): Promise<void> {
    this.assignments.set(assignment.id, { ...assignment });
  }

  // --- Review Items ---

  async getReviewItem(id: string): Promise<ReviewItem | null> {
    const item = this.reviewItems.get(id);
    if (!item) return null;
    return {
      ...item,
      history: [...item.history],
    };
  }

  async saveReviewItem(item: ReviewItem): Promise<void> {
    this.reviewItems.set(item.id, {
      ...item,
      history: [...item.history],
    });
  }

  async listReviewItems(filter?: ReviewItemFilter): Promise<ReviewItem[]> {
    let items = Array.from(this.reviewItems.values());

    if (filter) {
      if (filter.type) {
        items = items.filter((i) => i.type === filter.type);
      }
      if (filter.status) {
        items = items.filter((i) => i.status === filter.status);
      }
      if (filter.courseCode) {
        const norm = filter.courseCode.trim().toUpperCase();
        items = items.filter((i) => i.courseCode?.trim().toUpperCase() === norm);
      }
      if (filter.submittedBy) {
        items = items.filter((i) => i.submittedBy === filter.submittedBy);
      }
      if (filter.reviewedBy) {
        items = items.filter((i) => i.reviewedBy === filter.reviewedBy);
      }
      if (typeof filter.limit === 'number' && filter.limit > 0) {
        items = items.slice(0, filter.limit);
      }
    }

    return items.map((i) => ({
      ...i,
      history: [...i.history],
    }));
  }

  // --- Audit Events ---

  async recordAuditEvent(event: AdminAuditEvent): Promise<void> {
    this.auditEvents.push({ ...event });
  }

  async listAuditEvents(filter?: AuditEventFilter): Promise<AdminAuditEvent[]> {
    let events = [...this.auditEvents];

    if (filter) {
      if (filter.actorKey) {
        events = events.filter((e) => e.actorKey === filter.actorKey);
      }
      if (filter.action) {
        events = events.filter((e) => e.action === filter.action);
      }
      if (filter.resourceType) {
        events = events.filter((e) => e.resourceType === filter.resourceType);
      }
      if (filter.resourceKey) {
        events = events.filter((e) => e.resourceKey === filter.resourceKey);
      }
      if (filter.courseCode) {
        const norm = filter.courseCode.trim().toUpperCase();
        events = events.filter((e) => e.courseCode?.trim().toUpperCase() === norm);
      }
      if (filter.outcome) {
        events = events.filter((e) => e.outcome === filter.outcome);
      }
      if (filter.since) {
        const sinceMs = new Date(filter.since).getTime();
        events = events.filter((e) => new Date(e.timestamp).getTime() >= sinceMs);
      }
      if (filter.until) {
        const untilMs = new Date(filter.until).getTime();
        events = events.filter((e) => new Date(e.timestamp).getTime() <= untilMs);
      }
      if (typeof filter.limit === 'number' && filter.limit > 0) {
        events = events.slice(0, filter.limit);
      }
    }

    return events.map((e) => ({ ...e }));
  }

  // Helper for test resets
  clear(): void {
    this.roles.clear();
    this.assignments.clear();
    this.reviewItems.clear();
    this.auditEvents = [];
  }
}
