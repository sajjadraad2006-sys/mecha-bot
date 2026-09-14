import { markFileSuperseded } from './catalog.js';
import { evaluateDistributionPolicy, isFileVisibleToStudent } from './policy.js';
import type { FileCatalogRepository } from './repository.js';
import { validateAcademicFileRecord } from './schemas.js';
import type { AcademicFileRecord, FileLookupCriteria } from './types.js';

export class InMemoryFileCatalogRepository implements FileCatalogRepository {
  private records = new Map<string, AcademicFileRecord>();

  constructor(initialRecords: AcademicFileRecord[] = []) {
    for (const record of initialRecords) {
      this.add(record);
    }
  }

  public add(record: AcademicFileRecord): void {
    const validation = validateAcademicFileRecord(record);
    if (!validation.valid) {
      throw new Error(`Cannot add invalid file record: ${validation.errors?.join(', ')}`);
    }
    this.records.set(record.id, validation.data!);
  }

  public update(record: AcademicFileRecord): void {
    if (!this.records.has(record.id)) {
      throw new Error(`Cannot update non-existent file record with id '${record.id}'`);
    }
    const validation = validateAcademicFileRecord(record);
    if (!validation.valid) {
      throw new Error(`Cannot update invalid file record: ${validation.errors?.join(', ')}`);
    }
    this.records.set(record.id, validation.data!);
  }

  public getById(id: string): AcademicFileRecord | null {
    return this.records.get(id) ?? null;
  }

  public find(criteria: FileLookupCriteria): AcademicFileRecord[] {
    const results: AcademicFileRecord[] = [];

    for (const record of this.records.values()) {
      // 1. Privacy / visibility boundary check
      if (!isFileVisibleToStudent(record, criteria.requesterStudentKey)) {
        continue;
      }

      // 2. Course code filter (case-insensitive exact)
      if (criteria.courseCode) {
        if (!record.courseCode) continue;
        if (record.courseCode.trim().toUpperCase() !== criteria.courseCode.trim().toUpperCase()) {
          continue;
        }
      }

      // 3. Document type filter
      if (criteria.documentType && record.documentType !== criteria.documentType) {
        continue;
      }

      // 4. Academic year filter
      if (criteria.academicYear && record.academicYear !== criteria.academicYear) {
        continue;
      }

      // 5. Verification status filter
      if (
        criteria.verificationStatus &&
        record.verificationStatus !== criteria.verificationStatus
      ) {
        continue;
      }

      // 6. Archive status filter
      if (criteria.archiveStatus && record.archiveStatus !== criteria.archiveStatus) {
        continue;
      }

      // 7. Text query filter (substring in title, originalFilename, notes)
      if (criteria.query && criteria.query.trim().length > 0) {
        const q = criteria.query.trim().toLowerCase();
        const titleMatch = record.title.toLowerCase().includes(q);
        const fileMatch = record.originalFilename?.toLowerCase().includes(q) ?? false;
        const notesMatch = record.notes?.toLowerCase().includes(q) ?? false;
        if (!titleMatch && !fileMatch && !notesMatch) {
          continue;
        }
      }

      // 8. Distributable only filter
      if (criteria.distributableOnly) {
        const evalResult = evaluateDistributionPolicy(record);
        if (!evalResult.allowed) {
          continue;
        }
      }

      results.push(record);
    }

    return results;
  }

  public listByCourse(courseCode: string): AcademicFileRecord[] {
    return this.find({ courseCode });
  }

  public markSuperseded(
    oldFileId: string,
    newFileId: string,
    updatedAtIso: string = new Date().toISOString(),
  ): void {
    const existing = this.getById(oldFileId);
    if (!existing) {
      throw new Error(`Cannot supersede non-existent file with id '${oldFileId}'`);
    }
    const updated = markFileSuperseded(existing, newFileId, updatedAtIso);
    this.records.set(oldFileId, updated);
  }

  public count(): number {
    return this.records.size;
  }

  public clear(): void {
    this.records.clear();
  }
}
