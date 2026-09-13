export interface IdempotencyRecord {
  updateId: number;
  handler: string;
  processedAt: string;
}

export interface IdempotencyStore {
  isProcessed(updateId: number): Promise<boolean>;
  markProcessed(updateId: number, handler: string): Promise<void>;
}
