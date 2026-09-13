import { DatabaseConnection } from '../connection.js';

export interface AcademicEvent {
  id: string;
  courseId: string | null;
  eventType: 'QUIZ' | 'EXAM' | 'ASSIGNMENT' | 'LECTURE_CHANGE' | 'GENERIC';
  title: string;
  description: string | null;
  eventDate: string; // YYYY-MM-DD
  createdAt: string;
}

export interface Reminder {
  id: string;
  studentId: string;
  title: string;
  scheduledAt: string; // UTC ISO 8601
  isSent: boolean;
  idempotencyKey: string | null;
  createdAt: string;
}

export class EventRepository {
  constructor(private db: DatabaseConnection) {}

  createAcademicEvent(event: AcademicEvent): void {
    this.db.run(
      'INSERT INTO academic_events (id, course_id, event_type, title, description, event_date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?);',
      [
        event.id,
        event.courseId,
        event.eventType,
        event.title,
        event.description,
        event.eventDate,
        event.createdAt,
      ],
    );
  }

  listEventsForCourse(courseId: string): AcademicEvent[] {
    const rows = this.db.query<Record<string, unknown>>(
      'SELECT * FROM academic_events WHERE course_id = ? ORDER BY event_date ASC;',
      [courseId],
    );
    return rows.map((r) => ({
      id: r['id'] as string,
      courseId: r['course_id'] as string | null,
      eventType: r['event_type'] as AcademicEvent['eventType'],
      title: r['title'] as string,
      description: r['description'] as string | null,
      eventDate: r['event_date'] as string,
      createdAt: r['created_at'] as string,
    }));
  }

  createReminder(reminder: Reminder): void {
    this.db.run(
      'INSERT INTO reminders (id, student_id, title, scheduled_at, is_sent, idempotency_key, created_at) VALUES (?, ?, ?, ?, ?, ?, ?);',
      [
        reminder.id,
        reminder.studentId,
        reminder.title,
        reminder.scheduledAt,
        reminder.isSent ? 1 : 0,
        reminder.idempotencyKey,
        reminder.createdAt,
      ],
    );
  }

  getPendingReminders(beforeUtcIso: string): Reminder[] {
    const rows = this.db.query<Record<string, unknown>>(
      'SELECT * FROM reminders WHERE is_sent = 0 AND scheduled_at <= ? ORDER BY scheduled_at ASC;',
      [beforeUtcIso],
    );
    return rows.map((r) => ({
      id: r['id'] as string,
      studentId: r['student_id'] as string,
      title: r['title'] as string,
      scheduledAt: r['scheduled_at'] as string,
      isSent: Boolean(r['is_sent']),
      idempotencyKey: r['idempotency_key'] as string | null,
      createdAt: r['created_at'] as string,
    }));
  }

  markReminderSent(id: string): void {
    this.db.run('UPDATE reminders SET is_sent = 1 WHERE id = ?;', [id]);
  }
}
