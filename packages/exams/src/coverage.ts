import type { EventCoverageItem } from './types.js';

export function normalizeCoverage(items: EventCoverageItem[]): EventCoverageItem[] {
  return items.map((item) => ({
    courseCode: item.courseCode.trim(),
    status: item.status,
    ...(item.topicKey === undefined ? {} : { topicKey: item.topicKey.trim() }),
    ...(item.freeTextLabel === undefined ? {} : { freeTextLabel: item.freeTextLabel.trim() }),
    ...(item.evidenceSource === undefined ? {} : { evidenceSource: item.evidenceSource.trim() }),
  }));
}
