/**
 * Call frequency: per (sourceApiId, targetApiId) per hour/day/week; top callers; peak detection; week-over-week trend.
 */

import { createDbPool } from '../db/index.js';
import { createDrizzle } from '../db/index.js';
import { usageEvents, dependencyEdges } from '../db/schema.js';
import { eq, and, gte, lt, sql, desc } from 'drizzle-orm';
import type { Env } from '../env.js';

export interface CallFrequencyBucket {
  sourceApiId: string;
  targetApiId: string;
  period: 'hour' | 'day' | 'week';
  periodStart: Date;
  callCount: number;
}

export interface TopCaller {
  sourceApiId: string;
  targetApiId: string;
  callCount: number;
}

export interface FrequencyAnalyzerResult {
  buckets: CallFrequencyBucket[];
  topCallers: TopCaller[];
  peakDetected: boolean;
  trendWoW: 'increasing' | 'decreasing' | 'stable';
}

export class FrequencyAnalyzer {
  private db: ReturnType<typeof createDrizzle> | null = null;

  constructor(private _env: Env) {}

  private getDb() {
    if (this.db === null) this.db = createDrizzle(createDbPool(this._env.DATABASE_URL));
    return this.db;
  }

  async getCallsPerPeriod(
    targetApiId: string,
    period: 'hour' | 'day' | 'week',
    limit: number
  ): Promise<CallFrequencyBucket[]> {
    const db = this.getDb();
    const interval = period === 'hour' ? '1 hour' : period === 'day' ? '1 day' : '7 days';
    const trunc = period === 'hour' ? 'hour' : 'day';
    const cutoff = new Date(Date.now() - limit * (period === 'week' ? 7 * 24 * 60 * 60 * 1000 : period === 'day' ? 24 * 60 * 60 * 1000 : 60 * 60 * 1000));

    const rows = await db
      .select({
        sourceApiId: usageEvents.sourceApiId,
        targetApiId: usageEvents.targetApiId,
        periodStart: sql<Date>`date_trunc(${trunc}, ${usageEvents.timestamp})`,
        callCount: sql<number>`count(*)::int`,
      })
      .from(usageEvents)
      .where(and(eq(usageEvents.targetApiId, targetApiId), gte(usageEvents.timestamp, cutoff)))
      .groupBy(usageEvents.sourceApiId, usageEvents.targetApiId, sql`date_trunc(${trunc}, ${usageEvents.timestamp})`)
      .orderBy(desc(sql`date_trunc(${trunc}, ${usageEvents.timestamp})`))
      .limit(limit);

    return rows.map((r) => ({
      sourceApiId: r.sourceApiId,
      targetApiId: r.targetApiId ?? targetApiId,
      period,
      periodStart: r.periodStart,
      callCount: r.callCount,
    }));
  }

  async getTopCallers(targetApiId: string, limit: number): Promise<TopCaller[]> {
    const db = this.getDb();
    const rows = await db
      .select({
        sourceApiId: dependencyEdges.sourceApiId,
        targetApiId: dependencyEdges.targetApiId,
        callCount: dependencyEdges.callCount,
      })
      .from(dependencyEdges)
      .where(eq(dependencyEdges.targetApiId, targetApiId))
      .orderBy(desc(dependencyEdges.callCount))
      .limit(limit);
    return rows.map((r) => ({
      sourceApiId: r.sourceApiId,
      targetApiId: r.targetApiId,
      callCount: r.callCount ?? 0,
    }));
  }

  async isPeakTraffic(targetApiId: string, factor: number = 2): Promise<boolean> {
    const buckets = await this.getCallsPerPeriod(targetApiId, 'hour', 24 * 7);
    if (buckets.length < 2) return false;
    const recent = buckets.slice(0, 24).reduce((s, b) => s + b.callCount, 0);
    const older = buckets.slice(24).reduce((s, b) => s + b.callCount, 0);
    const avgOlder = older / (buckets.length - 24) || 0;
    return avgOlder > 0 && recent / 24 > avgOlder * factor;
  }

  async getTrendWoW(targetApiId: string): Promise<'increasing' | 'decreasing' | 'stable'> {
    const db = this.getDb();
    const now = new Date();
    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(thisWeekStart.getDate() - 7);
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);

    const [thisWeek] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(usageEvents)
      .where(and(eq(usageEvents.targetApiId, targetApiId), gte(usageEvents.timestamp, thisWeekStart)));
    const [lastWeek] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(usageEvents)
      .where(
        and(
          eq(usageEvents.targetApiId, targetApiId),
          gte(usageEvents.timestamp, lastWeekStart),
          lt(usageEvents.timestamp, thisWeekStart)
        )
      );

    const cThis = thisWeek?.count ?? 0;
    const cLast = lastWeek?.count ?? 0;
    if (cLast === 0) return 'stable';
    const ratio = cThis / cLast;
    if (ratio > 1.1) return 'increasing';
    if (ratio < 0.9) return 'decreasing';
    return 'stable';
  }
}
