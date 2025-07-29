/**
 * Accept batch of usage events; validate, resolve targetApiId, store in usage_events, update dependency_edges.
 */

import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import type { Env } from '../env.js';
import { createDbPool } from '../db/index.js';
import { createDrizzle } from '../db/index.js';
import { apis, usageEvents, dependencyEdges } from '../db/schema.js';
import { invalidateGraphCache } from '../cache/graphCache.js';
import { emitGraphUpdated } from '../websocket/graphEvents.js';

const usageEventSchema = z.object({
  sourceApiId: z.string().uuid(),
  targetUrl: z.string().url().max(2048),
  targetApiId: z.string().uuid().optional(),
  method: z.string().max(16),
  statusCode: z.number().int().min(0).max(999),
  latencyMs: z.number().int().min(0),
  timestamp: z.string().optional(),
});

export const recordBatchBodySchema = z.object({
  events: z.array(usageEventSchema).min(1).max(500),
});

export type RecordBatchInput = z.infer<typeof recordBatchBodySchema>;

function urlToPath(url: string): string {
  try {
    return new URL(url).pathname;
  } catch {
    return url;
  }
}

function pathMatches(pattern: string, path: string): boolean {
  const re = new RegExp('^' + pattern.replace(/:\w+/g, '[^/]+') + '(?:/|$)');
  return re.test(path);
}

export class UsageTracker {
  private db: NodePgDatabase<Record<string, never>> | null = null;

  constructor(private _env: Env) {}

  private getDb(): NodePgDatabase<Record<string, never>> {
    if (this.db === null) {
      const pool = createDbPool(this._env.DATABASE_URL);
      this.db = createDrizzle(pool) as NodePgDatabase<Record<string, never>>;
    }
    return this.db;
  }

  /**
   * Resolve targetUrl to targetApiId by prefix matching against registered apis.
   */
  async resolveTargetApiId(targetUrl: string): Promise<string | undefined> {
    const path = urlToPath(targetUrl);
    const all = await this.getDb().select({ id: apis.id, path: apis.path }).from(apis);
    let best: { id: string; path: string } | undefined;
    let bestLen = 0;
    for (const row of all) {
      if (pathMatches(row.path, path) && row.path.length > bestLen) {
        best = row;
        bestLen = row.path.length;
      }
    }
    return best?.id;
  }

  async recordBatch(input: RecordBatchInput): Promise<{ recorded: number }> {
    const database = this.getDb();
    let recorded = 0;
    const addedEdges: Array<{ source: string; target: string }> = [];
    for (const ev of input.events) {
      let targetApiId = ev.targetApiId;
      if (targetApiId === undefined) {
        targetApiId = await this.resolveTargetApiId(ev.targetUrl) ?? undefined;
      }
      const ts = ev.timestamp ? new Date(ev.timestamp) : new Date();
      await database.insert(usageEvents).values({
        sourceApiId: ev.sourceApiId,
        targetApiId: targetApiId ?? null,
        targetUrl: ev.targetUrl,
        method: ev.method,
        statusCode: ev.statusCode,
        latencyMs: ev.latencyMs,
        timestamp: ts,
      });
      recorded++;
      if (targetApiId !== undefined) {
        const [sourceApi] = await database.select({ repoId: apis.repoId }).from(apis).where(eq(apis.id, ev.sourceApiId)).limit(1);
        const [targetApi] = await database.select({ repoId: apis.repoId }).from(apis).where(eq(apis.id, targetApiId)).limit(1);
        if (sourceApi?.repoId && targetApi?.repoId) {
          const existing = await database.select().from(dependencyEdges).where(and(eq(dependencyEdges.sourceApiId, ev.sourceApiId), eq(dependencyEdges.targetApiId, targetApiId))).limit(1);
          const isError = ev.statusCode >= 400;
          if (existing.length > 0) {
            const row = existing[0];
            const newCallCount = (row.callCount ?? 0) + 1;
            const oldAvg = row.avgLatencyMs ?? 0;
            const newAvg = Math.round(((oldAvg * (newCallCount - 1)) + ev.latencyMs) / newCallCount);
            await database.update(dependencyEdges).set({
              callCount: newCallCount,
              lastCalledAt: ts,
              avgLatencyMs: newAvg,
              errorCount: (row.errorCount ?? 0) + (isError ? 1 : 0),
            }).where(eq(dependencyEdges.id, row.id));
          } else {
            await database.insert(dependencyEdges).values({
              sourceApiId: ev.sourceApiId,
              targetApiId,
              sourceRepoId: sourceApi.repoId,
              targetRepoId: targetApi.repoId,
              callCount: 1,
              lastCalledAt: ts,
              avgLatencyMs: ev.latencyMs,
              errorCount: isError ? 1 : 0,
            });
            addedEdges.push({ source: ev.sourceApiId, target: targetApiId });
          }
        }
      }
    }
    await invalidateGraphCache();
    if (addedEdges.length > 0) {
      await emitGraphUpdated(this._env.REDIS_URL, {
        addedNodes: [],
        removedNodes: [],
        addedEdges,
        removedEdges: [],
      });
    }
    return { recorded };
  }
}
