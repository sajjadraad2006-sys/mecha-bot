import { Reminder, ReminderStatus } from './types.js';

export interface ReminderRepository {
  save(reminder: Reminder): void;
  findById(id: string): Reminder | null;
  findByIdempotencyKey(key: string): Reminder | null;
  listByUser(userKey: string): Reminder[];
  listPending(): Reminder[];
  listDue(asOf: Date | string): Reminder[];
  updateStatus(id: string, status: ReminderStatus, timestampIso: string): void;
  delete(id: string): boolean;
  clear?(): void;
}

export class InMemoryReminderRepository implements ReminderRepository {
  private reminders = new Map<string, Reminder>();
  private idempotencyIndex = new Map<string, string>(); // idempotencyKey -> reminderId

  save(reminder: Reminder): void {
    this.reminders.set(reminder.id, { ...reminder });
    if (reminder.idempotencyKey) {
      this.idempotencyIndex.set(reminder.idempotencyKey, reminder.id);
    }
  }

  findById(id: string): Reminder | null {
    const item = this.reminders.get(id);
    return item ? { ...item } : null;
  }

  findByIdempotencyKey(key: string): Reminder | null {
    const id = this.idempotencyIndex.get(key);
    if (!id) return null;
    return this.findById(id);
  }

  listByUser(userKey: string): Reminder[] {
    const list: Reminder[] = [];
    for (const r of this.reminders.values()) {
      if (r.userKey === userKey) {
        list.push({ ...r });
      }
    }
    return list.sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());
  }

  listPending(): Reminder[] {
    const list: Reminder[] = [];
    for (const r of this.reminders.values()) {
      if (r.status === 'SCHEDULED') {
        list.push({ ...r });
      }
    }
    return list.sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());
  }

  listDue(asOf: Date | string): Reminder[] {
    const asOfMs = (typeof asOf === 'string' ? new Date(asOf) : asOf).getTime();
    const list: Reminder[] = [];

    for (const r of this.reminders.values()) {
      if (r.status === 'SCHEDULED') {
        const dueMs = new Date(r.dueAt).getTime();
        if (dueMs <= asOfMs) {
          list.push({ ...r });
        }
      }
    }

    return list.sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());
  }

  updateStatus(id: string, status: ReminderStatus, timestampIso: string): void {
    const existing = this.reminders.get(id);
    if (!existing) {
      throw new Error(`Reminder with id '${id}' not found.`);
    }

    const updated = { ...existing, status };
    if (status === 'COMPLETED') {
      updated.completedAt = timestampIso;
    } else if (status === 'CANCELLED') {
      updated.cancelledAt = timestampIso;
    } else if (status === 'DELIVERED') {
      updated.deliveredAt = timestampIso;
    }

    this.reminders.set(id, updated);
  }

  delete(id: string): boolean {
    const existing = this.reminders.get(id);
    if (!existing) return false;
    if (existing.idempotencyKey) {
      this.idempotencyIndex.delete(existing.idempotencyKey);
    }
    return this.reminders.delete(id);
  }

  clear(): void {
    this.reminders.clear();
    this.idempotencyIndex.clear();
  }
}
