import { validateStorageReference } from './schemas.js';
import type { StorageReference, StorageReferenceMetadata } from './types.js';

/**
 * Creates a validated Telegram file storage reference.
 * Note: Telegram file_id is treated as an opaque token without parsing.
 */
export function createTelegramStorageReference(
  fileId: string,
  metadata?: StorageReferenceMetadata,
): StorageReference {
  const ref: StorageReference = {
    kind: 'TELEGRAM_FILE_ID',
    value: fileId,
    metadata,
  };

  const validation = validateStorageReference(ref);
  if (!validation.valid) {
    throw new Error(`Invalid Telegram storage reference: ${validation.errors?.join(', ')}`);
  }

  return validation.data!;
}

/**
 * Creates a validated external URL storage reference.
 * Strictly verifies URL protocol and rejects known piracy/prohibited domains.
 */
export function createExternalUrlReference(
  url: string,
  metadata?: StorageReferenceMetadata,
): StorageReference {
  const ref: StorageReference = {
    kind: 'EXTERNAL_URL',
    value: url,
    metadata,
  };

  const validation = validateStorageReference(ref);
  if (!validation.valid) {
    throw new Error(`Invalid external URL storage reference: ${validation.errors?.join(', ')}`);
  }

  return validation.data!;
}

export function isTelegramStorageReference(
  ref?: StorageReference,
): ref is StorageReference & { kind: 'TELEGRAM_FILE_ID' } {
  return ref !== undefined && ref.kind === 'TELEGRAM_FILE_ID' && Boolean(ref.value);
}

export function isExternalUrlReference(
  ref?: StorageReference,
): ref is StorageReference & { kind: 'EXTERNAL_URL' } {
  return ref !== undefined && ref.kind === 'EXTERNAL_URL' && Boolean(ref.value);
}

/**
 * Strips raw internal file_id or sensitive vault metadata before sending
 * metadata in student-facing response objects.
 */
export function sanitizeStorageReferenceForDisplay(ref?: StorageReference): {
  kind: string;
  hasDirectTelegramDelivery: boolean;
  hasExternalLink: boolean;
  externalUrl?: string | undefined;
} {
  if (!ref) {
    return {
      kind: 'NONE',
      hasDirectTelegramDelivery: false,
      hasExternalLink: false,
    };
  }

  if (ref.kind === 'TELEGRAM_FILE_ID') {
    return {
      kind: 'TELEGRAM_FILE_ID',
      hasDirectTelegramDelivery: true,
      hasExternalLink: false,
    };
  }

  if (ref.kind === 'EXTERNAL_URL') {
    return {
      kind: 'EXTERNAL_URL',
      hasDirectTelegramDelivery: false,
      hasExternalLink: true,
      externalUrl: ref.value,
    };
  }

  return {
    kind: ref.kind,
    hasDirectTelegramDelivery: false,
    hasExternalLink: false,
  };
}
