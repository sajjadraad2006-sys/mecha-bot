export interface Clock {
  now(): Date;
  nowIso(): string;
  nowEpochMs(): number;
}

export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }

  nowIso(): string {
    return this.now().toISOString();
  }

  nowEpochMs(): number {
    return this.now().getTime();
  }
}

export class FakeClock implements Clock {
  private currentTime: Date;

  constructor(initialTime: Date | string = '2026-09-14T08:00:00.000Z') {
    this.currentTime =
      typeof initialTime === 'string' ? new Date(initialTime) : new Date(initialTime.getTime());
  }

  now(): Date {
    return new Date(this.currentTime.getTime());
  }

  nowIso(): string {
    return this.currentTime.toISOString();
  }

  nowEpochMs(): number {
    return this.currentTime.getTime();
  }

  setTime(time: Date | string): void {
    this.currentTime = typeof time === 'string' ? new Date(time) : new Date(time.getTime());
  }

  advanceMs(ms: number): void {
    this.currentTime = new Date(this.currentTime.getTime() + ms);
  }

  advanceDays(days: number): void {
    this.advanceMs(days * 24 * 60 * 60 * 1000);
  }
}
