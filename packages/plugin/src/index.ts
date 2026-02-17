/**
 * APIWatch plugin entry point.
 */

import type { ApiWatchConfig } from './config.js';
import type { ApiEndpoint } from '@apiwatch/shared';

export type { ApiWatchConfig } from './config.js';
export { apiWatchConfigSchema } from './config.schema.js';

export interface ScanResult {
  endpoints: ApiEndpoint[];
  added: number;
  removed: number;
  changed: number;
}

export async function initApiWatch(config: ApiWatchConfig): Promise<void> {
  await Promise.resolve(config);
  // Full implementation: register watcher, interceptors, etc.
}

export async function scanAndReport(): Promise<ScanResult> {
  return {
    endpoints: [],
    added: 0,
    removed: 0,
    changed: 0,
  };
}

export const PLUGIN_VERSION = '1.0.0';
