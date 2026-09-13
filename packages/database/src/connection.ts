export interface QueryResultInfo {
  changes: number;
  lastInsertRowid: number | bigint;
}

export interface DatabaseConnection {
  exec(sql: string): void;
  query<T = Record<string, unknown>>(sql: string, params?: unknown[]): T[];
  queryOne<T = Record<string, unknown>>(sql: string, params?: unknown[]): T | null;
  run(sql: string, params?: unknown[]): QueryResultInfo;
  transaction<T>(fn: (tx: DatabaseConnection) => T): T;
  close(): void;
}
