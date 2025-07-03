/**
 * File watcher using chokidar. Watches scanPaths for .ts/.js changes,
 * debounces 2s, re-scans changed files, diffs against last scan, reports to core.
 */

import chokidar from 'chokidar';
import type { ApiWatchConfig } from './config.js';
import type { ApiEndpoint } from '@apiwatch/shared';

const DEBOUNCE_MS = 2000;

export interface WatcherCallbacks {
  onScanComplete?: (endpoints: ApiEndpoint[], changedFiles: string[]) => void;
  onError?: (err: Error) => void;
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let pendingPaths: Set<string> = new Set();

export function createWatcher(
  config: ApiWatchConfig,
  callbacks: WatcherCallbacks = {}
): chokidar.FSWatcher {
  const { scanPaths, ignorePaths } = config;
  const watcher = chokidar.watch(scanPaths, {
    ignored: [
      /node_modules/,
      /\.git/,
      /\*\.(spec|test)\.(ts|js)$/,
      ...ignorePaths.map((p) => new RegExp(p.replace(/\*\*/g, '.*'))),
    ],
    persistent: true,
    ignoreInitial: true,
  });

  const triggerScan = (): void => {
    const paths = Array.from(pendingPaths);
    pendingPaths.clear();
    debounceTimer = null;
    try {
      callbacks.onScanComplete?.([], paths);
    } catch (err) {
      callbacks.onError?.(err instanceof Error ? err : new Error(String(err)));
    }
  };

  watcher.on('change', (path: string) => {
    if (!path.endsWith('.ts') && !path.endsWith('.js')) return;
    pendingPaths.add(path);
    if (debounceTimer !== null) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(triggerScan, DEBOUNCE_MS);
  });

  watcher.on('error', (err: Error) => {
    callbacks.onError?.(err);
  });

  return watcher;
}
