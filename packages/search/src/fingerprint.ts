/**
 * Deterministic query fingerprint generation for search cache readiness.
 * Identical queries against identical index states generate the exact same fingerprint.
 */

import { createHash } from 'node:crypto';
import { normalizeText } from './normalizer.js';
import type { SearchQuery } from './types.js';

export function computeQueryFingerprint(query: SearchQuery, indexVersion: string): string {
  const normText = normalizeText(query.text);
  const course = query.courseCode?.trim().toUpperCase() ?? '';
  const topic = query.topicKey?.trim().toLowerCase() ?? '';
  const intent = query.intent ?? 'GENERAL_SEARCH';
  const docTypes = (query.documentTypes ?? []).map((t) => t.toUpperCase()).sort().join(',');
  const year = query.academicYear?.trim() ?? '';
  const authorities = (query.sourceAuthorities ?? []).sort().join(',');
  const scopes = (query.evidenceScopes ?? []).sort().join(',');
  const statuses = (query.verificationStatuses ?? []).sort().join(',');
  const allowRelated = query.allowRelatedCourses ? '1' : '0';
  const allowCataloged = query.allowUnverifiedCataloged === false ? '0' : '1';
  const limit = query.limit ?? 10;

  const payload = [
    `v=1`,
    `idx=${indexVersion}`,
    `q=${normText}`,
    `c=${course}`,
    `t=${topic}`,
    `i=${intent}`,
    `dt=${docTypes}`,
    `y=${year}`,
    `auth=${authorities}`,
    `sc=${scopes}`,
    `st=${statuses}`,
    `rel=${allowRelated}`,
    `cat=${allowCataloged}`,
    `lim=${limit}`,
  ].join('|');

  const digest = createHash('sha256').update(payload).digest('hex');
  return `qfp_${digest.substring(0, 16)}`;
}
