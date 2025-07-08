/**
 * In-memory store for discovered endpoints during a scan session.
 * Methods: register, getAll, getByPath, diff(previousScan), clear. Persists to .apiwatch-cache.json.
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import type { ApiEndpoint } from '@apiwatch/shared';

const CACHE_FILENAME = '.apiwatch-cache.json';

export interface RegistryDiff {
  added: ApiEndpoint[];
  removed: ApiEndpoint[];
  changed: ApiEndpoint[];
}

export class ApiRegistry {
  private endpoints: Map<string, ApiEndpoint> = new Map();
  private cachePath: string;

  constructor(cwd: string = process.cwd()) {
    this.cachePath = join(cwd, CACHE_FILENAME);
    this.load();
  }

  register(endpoint: ApiEndpoint): void {
    this.endpoints.set(endpoint.id, { ...endpoint, updatedAt: new Date() });
  }

  getAll(): ApiEndpoint[] {
    return Array.from(this.endpoints.values());
  }

  getByPath(path: string, method: string): ApiEndpoint | undefined {
    for (const ep of this.endpoints.values()) {
      if (ep.path === path && ep.method === method) return ep;
    }
    return undefined;
  }

  diff(previous: ApiEndpoint[]): RegistryDiff {
    const prevIds = new Set(previous.map((p) => p.id));
    const currIds = new Set(this.endpoints.keys());
    const added: ApiEndpoint[] = [];
    const removed: ApiEndpoint[] = [];
    const changed: ApiEndpoint[] = [];
    for (const ep of this.endpoints.values()) {
      if (!prevIds.has(ep.id)) added.push(ep);
      else {
        const prev = previous.find((p) => p.id === ep.id);
        if (prev && JSON.stringify(prev) !== JSON.stringify(ep)) changed.push(ep);
      }
    }
    for (const p of previous) {
      if (!currIds.has(p.id)) removed.push(p);
    }
    return { added, removed, changed };
  }

  clear(): void {
    this.endpoints.clear();
  }

  load(): void {
    if (!existsSync(this.cachePath)) return;
    try {
      const raw = readFileSync(this.cachePath, 'utf-8');
      const data = JSON.parse(raw) as { endpoints?: ApiEndpoint[] };
      const list = data.endpoints ?? [];
      for (const ep of list) {
        const e = { ...ep, createdAt: new Date(ep.createdAt), updatedAt: new Date(ep.updatedAt) };
        this.endpoints.set(ep.id, e);
      }
    } catch {
      // ignore
    }
  }

  persist(): void {
    const data = { endpoints: this.getAll(), savedAt: new Date().toISOString() };
    writeFileSync(this.cachePath, JSON.stringify(data, null, 2), 'utf-8');
  }
}
