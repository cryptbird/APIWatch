/**
 * Axios interceptor: request adds X-ApiWatch-Source header; response records url, method, status, latency.
 * Batches and sends to POST /api/usage/record every 10s or 100 events.
 */

import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import type { ApiEndpoint } from '@apiwatch/shared';
import { getSourceApiId } from './CallInterceptor.js';
import { resolveTargetApiId } from './urlResolver.js';

const BATCH_INTERVAL_MS = 10_000;
const BATCH_SIZE = 100;

export interface UsageEventPayload {
  sourceApiId: string;
  targetUrl: string;
  targetApiId?: string;
  method: string;
  statusCode: number;
  latencyMs: number;
  timestamp: string;
}

export interface AxiosInterceptorOptions {
  axios: AxiosInstance;
  endpoints: ApiEndpoint[];
  serverUrl: string;
}

const buffer: UsageEventPayload[] = [];
let flushTimer: ReturnType<typeof setInterval> | null = null;

function flush(serverUrl: string): void {
  if (buffer.length === 0) return;
  const batch = buffer.splice(0, buffer.length);
  const url = `${serverUrl.replace(/\/$/, '')}/api/usage/record`;
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ events: batch }),
  }).catch(() => {});
}

function scheduleFlush(serverUrl: string): void {
  if (flushTimer) return;
  flushTimer = setInterval(() => {
    flush(serverUrl);
    if (buffer.length === 0 && flushTimer) {
      clearInterval(flushTimer);
      flushTimer = null;
    }
  }, BATCH_INTERVAL_MS);
}

function pushAndMaybeFlush(serverUrl: string, payload: UsageEventPayload): void {
  buffer.push(payload);
  if (buffer.length >= BATCH_SIZE) {
    flush(serverUrl);
  } else {
    scheduleFlush(serverUrl);
  }
}

/**
 * Install request/response interceptors on the given axios instance.
 */
export function installAxiosInterceptor(options: AxiosInterceptorOptions): void {
  const { axios: ax, endpoints, serverUrl } = options;
  const sourceApiId = getSourceApiId();

  ax.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const headers = config.headers as Record<string, string>;
    if (headers) headers['X-ApiWatch-Source'] = sourceApiId;
    (config as InternalAxiosRequestConfig & { _apiwatchStart?: number })._apiwatchStart = Date.now();
    return config;
  });

  ax.interceptors.response.use(
    (response) => {
      const start = (response.config as InternalAxiosRequestConfig & { _apiwatchStart?: number })._apiwatchStart;
      const latencyMs = start != null ? Date.now() - start : 0;
      const url = response.config.url ?? '';
      const fullUrl = response.config.baseURL ? new URL(url, response.config.baseURL).href : url;
      const targetApiId = resolveTargetApiId(fullUrl, endpoints);
      pushAndMaybeFlush(serverUrl, {
        sourceApiId,
        targetUrl: fullUrl,
        targetApiId,
        method: (response.config.method ?? 'GET').toUpperCase(),
        statusCode: response.status,
        latencyMs,
        timestamp: new Date().toISOString(),
      });
      return response;
    },
    (error) => {
      const config = error.config as InternalAxiosRequestConfig & { _apiwatchStart?: number } | undefined;
      const start = config?._apiwatchStart;
      const latencyMs = start != null ? Date.now() - start : 0;
      const url = config?.url ?? '';
      const baseURL = config?.baseURL;
      const fullUrl = baseURL ? new URL(url, baseURL).href : url;
      const targetApiId = resolveTargetApiId(fullUrl, endpoints);
      pushAndMaybeFlush(serverUrl, {
        sourceApiId,
        targetUrl: fullUrl,
        targetApiId,
        method: (config?.method ?? 'GET').toUpperCase(),
        statusCode: error.response?.status ?? 0,
        latencyMs,
        timestamp: new Date().toISOString(),
      });
      return Promise.reject(error);
    }
  );
}
