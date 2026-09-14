import type { AcademicFileRecord, FileLookupCriteria } from './types.js';

export interface FileCatalogRepository {
  add(record: AcademicFileRecord): void | Promise<void>;
  update(record: AcademicFileRecord): void | Promise<void>;
  getById(id: string): AcademicFileRecord | null | Promise<AcademicFileRecord | null>;
  find(criteria: FileLookupCriteria): AcademicFileRecord[] | Promise<AcademicFileRecord[]>;
  listByCourse(courseCode: string): AcademicFileRecord[] | Promise<AcademicFileRecord[]>;
  markSuperseded(oldFileId: string, newFileId: string, updatedAtIso?: string): void | Promise<void>;
  count(): number | Promise<number>;
}
