/**
 * Stability Index = 1 - (changeCount / totalDays). Scale 0-1. Flag APIs with stability < 0.5 as high-volatility.
 */

import { createDbPool } from '../db/index.js';
import { createDrizzle } from '../db/index.js';
import { changeEvents, apis } from '../db/schema.js';
import { eq, gte, sql } from 'drizzle-orm';
import type { Env } from '../env.js';

export interface StabilityResult {
  apiId: string;
  stabilityIndex: number;
  changeCount: number;
  totalDays: number;
  trend: 'stable' | 'volatile';
}

export class StabilityAnalyzer {
  private db: ReturnType<typeof createDrizzle> | null = null;

  constructor(private _env: Env) {}

  private getDb() {
    if (this.db === null) this.db = createDrizzle(createDbPool(this._env.DATABASE_URL));
    return this.db;
  }

  async getStability(apiId: string, totalDays: number = 90): Promise<StabilityResult> {
    const db = this.getDb();
    const since = new Date(Date.now() - totalDays * 24 * 60 * 60 * 1000);

    const [row] = await db
      .select({ changeCount: sql<number>`count(*)::int` })
      .from(changeEvents)
      .where(and(eq(changeEvents.apiEndpointId, apiId), gte(changeEvents.createdAt, since)));

    const changeCount = row?.changeCount ?? 0;
    const stabilityIndex = totalDays > 0 ? Math.max(0, Math.min(1, 1 - changeCount / totalDays)) : 1;
    const trend = stabilityIndex < 0.5 ? 'volatile' : 'stable';

    return { apiId, stabilityIndex, changeCount, totalDays, trend };
  }

  async getVolatileApis(totalDays: number = 90, minStability: number = 0.5): Promise<StabilityResult[]> {
    const db = this.getDb();
    const apiRows = await db.select({ id: apis.id }).from(apis);
    const results: StabilityResult[] = [];
    for (const a of apiRows) {
      const r = await this.getStability(a.id, totalDays);
      if (r.stabilityIndex < minStability) results.push(r);
    }
    return results;
  }
}
