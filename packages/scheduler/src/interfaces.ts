export interface ScheduledTask {
  id: string;
  studentId: string;
  title: string;
  scheduledAt: string; // UTC ISO 8601
  isSent: boolean;
  idempotencyKey: string | null;
}

export interface SchedulerService {
  scheduleReminder(
    studentId: string,
    title: string,
    scheduledAt: Date | string,
    idempotencyKey?: string,
  ): Promise<string>;
  pollDueTasks(nowUtcIso: string): Promise<ScheduledTask[]>;
  markTaskCompleted(taskId: string): Promise<void>;
}
