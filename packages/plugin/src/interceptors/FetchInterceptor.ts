/**
 * Fetch interceptor: wraps global fetch to record outbound calls.
 * Captures url, method, status, latency; same payload as axios interceptor.
 * Works with Request object or URL string. Batches to POST /api/usage/record.
 */

import type { ApiEndpoint } from '@apiwatch/shared';
import { getSourceApiId } from './CallInterceptor.js';
import { resolveTargetApiId } from './urlResolver.js';

const BATCH_INTERVAL_MS = 10_000;
const BATCH_SIZE = 100;

export interface FetchUsagePayload {
  sourceApiId: string;
  targetUrl: string;
  targetApiId?: string;
  method: string;
  statusCode: number;
  latencyMs: number;
  timestamp: string;
}

export interface FetchInterceptorOptions {
  endpoints: ApiEndpoint[];
  serverUrl: string;
}

const fetchBuffer: FetchUsagePayload[] = [];
let fetchFlushTimer: ReturnType<typeof setInterval> | null = null;

function flushFetch(serverUrl: string): void {
  if (fetchBuffer.length === 0) return;
  const batch = fetchBuffer.splice(0, fetchBuffer.length);
  const url = `${serverUrl.replace(/\/$/, '')}/api/usage/record`;
  const origFetch = (globalThis as unknown as { __apiwatchOriginalFetch?: typeof fetch }).__apiwatchOriginalFetch ?? fetch;
  origFetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ events: batch }),
  }).catch(() => {});
}

function scheduleFetchFlush(serverUrl: string): void {
  if (fetchFlushTimer) return;
  fetchFlushTimer = setInterval(() => {
    flushFetch(serverUrl);
    if (fetchBuffer.length === 0 && fetchFlushTimer) {
      clearInterval(fetchFlushTimer);
      fetchFlushTimer = null;
    }
  }, BATCH_INTERVAL_MS);
}

function pushFetchAndMaybeFlush(serverUrl: string, payload: FetchUsagePayload): void {
  fetchBuffer.push(payload);
  if (fetchBuffer.length >= BATCH_SIZE) {
    flushFetch(serverUrl);
  } else {
    scheduleFetchFlush(serverUrl);
  }
}

/**
 * Install fetch wrapper. Saves original fetch and replaces global fetch with a function
 * that records the call then invokes the original.
 */
export function installFetchInterceptor(options: FetchInterceptorOptions): void {
  const { endpoints, serverUrl } = options;
  const origFetch = globalThis.fetch;
  if ((globalThis as unknown as { __apiwatchFetchInstalled?: boolean }).__apiwatchFetchInstalled) {
    return;
  }
  (globalThis as unknown as { __apiwatchOriginalFetch?: typeof fetch }).__apiwatchOriginalFetch = origFetch;
  (globalThis as unknown as { __apiwatchFetchInstalled?: boolean }).__apiwatchFetchInstalled = true;

  globalThis.fetch = function apiwatchFetch(
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> {
    const start = Date.now();
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    const method = (typeof input === 'object' && !(input instanceof URL) && input.method) || init?.method || 'GET';
    return origFetch(input, init).then(
      (response) => {
        const latencyMs = Date.now() - start;
        const sourceApiId = getSourceApiId();
        const targetApiId = resolveTargetApiId(url, endpoints);
        pushFetchAndMaybeFlush(serverUrl, {
          sourceApiId,
          targetUrl: url,
          targetApiId,
          method: String(method).toUpperCase(),
          statusCode: response.status,
          latencyMs,
          timestamp: new Date().toISOString(),
        });
        return response;
      },
      (err) => {
        const latencyMs = Date.now() - start;
        const sourceApiId = getSourceApiId();
        const targetApiId = resolveTargetApiId(url, endpoints);
        pushFetchAndMaybeFlush(serverUrl, {
          sourceApiId,
          targetUrl: url,
          targetApiId,
          method: String(method).toUpperCase(),
          statusCode: 0,
          latencyMs,
          timestamp: new Date().toISOString(),
        });
        return Promise.reject(err);
      }
    );
  };
}
