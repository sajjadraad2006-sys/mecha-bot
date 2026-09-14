import { InMemoryFileCatalogRepository } from './in-memory-repository.js';
import type { FileCatalogRepository } from './repository.js';
import { resolveDeliveryDecision } from './resolver.js';
import type { AcademicFileRecord, DeliveryDecision, FileLookupCriteria } from './types.js';

export interface FileDistributionServiceOptions {
  repository?: FileCatalogRepository | undefined;
}

export class FileDistributionService {
  private repo: FileCatalogRepository;

  constructor(options: FileDistributionServiceOptions = {}) {
    this.repo = options.repository ?? new InMemoryFileCatalogRepository();
  }

  public getRepository(): FileCatalogRepository {
    return this.repo;
  }

  public async registerFile(record: AcademicFileRecord): Promise<void> {
    await this.repo.add(record);
  }

  public async updateFile(record: AcademicFileRecord): Promise<void> {
    await this.repo.update(record);
  }

  public async getFile(id: string): Promise<AcademicFileRecord | null> {
    return await this.repo.getById(id);
  }

  public async findFiles(criteria: FileLookupCriteria): Promise<AcademicFileRecord[]> {
    return await this.repo.find(criteria);
  }

  public async listCourseFiles(
    courseCode: string,
    requesterStudentKey?: string,
  ): Promise<AcademicFileRecord[]> {
    return await this.repo.find({ courseCode, requesterStudentKey });
  }

  /**
   * Resolves a delivery decision for a student request.
   * If fileRecordId is provided directly, resolves delivery for that specific file.
   * Otherwise queries the catalog using the provided criteria and resolves.
   */
  public async requestFileDelivery(params: {
    fileRecordId?: string | undefined;
    criteria?: FileLookupCriteria | undefined;
    requesterStudentKey?: string | undefined;
  }): Promise<DeliveryDecision> {
    const { fileRecordId, criteria, requesterStudentKey } = params;

    if (fileRecordId) {
      const file = await this.repo.getById(fileRecordId);
      if (!file) {
        return {
          status: 'NOT_FOUND',
          reason: `File with id '${fileRecordId}' was not found in the catalog.`,
        };
      }
      return resolveDeliveryDecision([file], { requesterStudentKey });
    }

    const searchCriteria: FileLookupCriteria = {
      ...(criteria ?? {}),
      requesterStudentKey: requesterStudentKey ?? criteria?.requesterStudentKey,
    };

    const matches = await this.repo.find(searchCriteria);
    return resolveDeliveryDecision(matches, searchCriteria);
  }

  public async supersedeFile(
    oldFileId: string,
    newFileId: string,
    updatedAtIso?: string,
  ): Promise<void> {
    await this.repo.markSuperseded(oldFileId, newFileId, updatedAtIso);
  }
}
