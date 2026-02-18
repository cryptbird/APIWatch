/**
 * Runtime interceptor that records every outbound HTTP call.
 * Records: sourceApiId (from env), targetUrl, targetApiId (via urlResolver), method, statusCode, latencyMs, timestamp.
 */

import { resolveTargetApiId } from './urlResolver.js';
import type { ApiEndpoint } from '@apiwatch/shared';

export interface CallRecord {
  sourceApiId: string;
  targetUrl: string;
  targetApiId: string | undefined;
  method: string;
  statusCode: number;
  latencyMs: number;
  timestamp: Date;
}

export type RecordHandler = (record: CallRecord) => void;

const SOURCE_API_ID_ENV = 'APIWATCH_SOURCE_API_ID';

/**
 * Get source API id from environment (e.g. set by server framework).
 */
export function getSourceApiId(): string {
  return process.env[SOURCE_API_ID_ENV] ?? '';
}

/**
 * Call interceptor: builds a call record and invokes the handler.
 * Resolves targetApiId via URL prefix matching against provided endpoints.
 */
export function recordCall(
  targetUrl: string,
  method: string,
  statusCode: number,
  latencyMs: number,
  endpoints: ApiEndpoint[],
  handler: RecordHandler
): void {
  const sourceApiId = getSourceApiId();
  const targetApiId = resolveTargetApiId(targetUrl, endpoints);
  handler({
    sourceApiId,
    targetUrl,
    targetApiId,
    method,
    statusCode,
    latencyMs,
    timestamp: new Date(),
  });
}
