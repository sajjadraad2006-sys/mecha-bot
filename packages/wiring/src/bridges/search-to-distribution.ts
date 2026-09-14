/**
 * Bridge C: Search (M7) -> Distribution (M12)
 *
 * Resolves file delivery requests triggered from search results.
 * Guarantees that searchability and distributability are strictly separated:
 * A document may be indexed and searchable (e.g. textbook bibliographic quote),
 * but delivery will be BLOCKED_POLICY if canDistribute is false or document
 * is a solution manual.
 */

import type { SearchResult } from '@mecha-bot/search';
import type { DeliveryDecision, FileDistributionService } from '@mecha-bot/distribution';
import type { SearchDeliveryHit } from '../types.js';

/**
 * Resolves delivery for a single search result.
 */
export async function resolveSearchDelivery(
  distributionService: FileDistributionService,
  searchResult: SearchResult,
  requesterStudentKey: string,
): Promise<DeliveryDecision> {
  // 1. Strict fast-path check: if SearchResult flags canDistribute === false, block immediately
  if (!searchResult.canDistribute) {
    return {
      status: 'BLOCKED_POLICY',
      reason:
        'Document is indexed for search/reference only and is not authorized for direct file distribution.',
    };
  }

  // 2. Query the distribution service catalog using documentId
  const delivery = await distributionService.requestFileDelivery({
    fileRecordId: searchResult.documentId,
    requesterStudentKey,
  });

  // If found, return the catalog decision (which evaluates permissions, solution manuals, etc.)
  if (delivery.status !== 'NOT_FOUND') {
    return delivery;
  }

  // Fallback: search catalog by courseCode
  if (searchResult.courseCode) {
    return distributionService.requestFileDelivery({
      criteria: {
        courseCode: searchResult.courseCode,
        requesterStudentKey,
        distributableOnly: true,
      },
      requesterStudentKey,
    });
  }

  return {
    status: 'NOT_FOUND',
    reason: `File catalog record for document '${searchResult.documentId}' was not found.`,
  };
}

/**
 * Resolves delivery decisions for a list of search results.
 */
export async function resolveSearchHitsDelivery(
  distributionService: FileDistributionService,
  searchResults: SearchResult[],
  requesterStudentKey: string,
): Promise<SearchDeliveryHit[]> {
  const hits: SearchDeliveryHit[] = [];

  for (const result of searchResults) {
    const delivery = await resolveSearchDelivery(distributionService, result, requesterStudentKey);
    hits.push({
      searchResult: result,
      deliveryDecision: delivery,
    });
  }

  return hits;
}
