/**
 * API snapshot model: store schema at each version with fingerprint for change detection.
 */

import type { ApiEndpoint } from '@apiwatch/shared';
import { createHash } from 'node:crypto';

export interface ApiSnapshotRecord {
  id: string;
  apiEndpointId: string;
  version: number;
  schema: unknown;
  capturedAt: Date;
  capturedBy: string;
  fingerprintHash?: string | null;
}

/**
 * Compute a stable hash of the endpoint for change detection (params, method, path, requestBody, responses).
 */
export function computeFingerprint(endpoint: ApiEndpoint): string {
  const payload = JSON.stringify({
    path: endpoint.path,
    method: endpoint.method,
    params: endpoint.params,
    requestBody: endpoint.requestBody,
    responses: endpoint.responses,
  });
  return createHash('sha256').update(payload).digest('hex');
}

/**
 * Build snapshot payload from ApiEndpoint for storage.
 */
export function endpointToSnapshotSchema(endpoint: ApiEndpoint): unknown {
  return {
    path: endpoint.path,
    method: endpoint.method,
    params: endpoint.params,
    requestBody: endpoint.requestBody,
    responses: endpoint.responses,
    tags: endpoint.tags,
    deprecated: endpoint.deprecated,
  };
}
