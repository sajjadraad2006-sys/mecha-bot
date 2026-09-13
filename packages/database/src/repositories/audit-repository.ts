import { DatabaseConnection } from '../connection.js';

export interface AuditLogEntry {
  id: string;
  actorId: string;
  action: string;
  entityType: string;
  entityId: string | null;
  detailsJson: string | null;
  createdAt: string;
}

export interface AiUsageLogEntry {
  id: string;
  provider: string;
  intent: string | null;
  promptTokens: number;
  completionTokens: number;
  latencyMs: number;
  isSuccess: boolean;
  createdAt: string;
}

export class AuditRepository {
  constructor(private db: DatabaseConnection) {}

  logAudit(entry: AuditLogEntry): void {
    this.db.run(
      'INSERT INTO audit_logs (id, actor_id, action, entity_type, entity_id, details_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?);',
      [
        entry.id,
        entry.actorId,
        entry.action,
        entry.entityType,
        entry.entityId,
        entry.detailsJson,
        entry.createdAt,
      ],
    );
  }

  logAiUsage(entry: AiUsageLogEntry): void {
    this.db.run(
      'INSERT INTO ai_usage_logs (id, provider, intent, prompt_tokens, completion_tokens, latency_ms, is_success, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?);',
      [
        entry.id,
        entry.provider,
        entry.intent,
        entry.promptTokens,
        entry.completionTokens,
        entry.latencyMs,
        entry.isSuccess ? 1 : 0,
        entry.createdAt,
      ],
    );
  }

  getAiUsageCount(): number {
    const row = this.db.queryOne<{ count: number }>('SELECT COUNT(*) as count FROM ai_usage_logs;');
    return row?.count || 0;
  }
}
