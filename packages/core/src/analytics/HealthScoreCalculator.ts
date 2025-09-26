/**
 * Per-API health score (0-100): 100 - (threat + errorRate + latency + unacknowledged penalties). Update hourly.
 */

import { createDbPool } from '../db/index.js';
import { createDrizzle } from '../db/index.js';
import { apis, dependencyEdges, changeEvents, apiHealthScores } from '../db/schema.js';
import { eq, and, isNull, sql } from 'drizzle-orm';
import type { Env } from '../env.js';

const THREAT_PENALTY: Record<string, number> = { CRITICAL: 25, NEUTRAL: 10, LOW: 0 };
const MAX_PENALTY = 100;

export class HealthScoreCalculator {
  private db: ReturnType<typeof createDrizzle> | null = null;

  constructor(private _env: Env) {}

  private getDb() {
    if (this.db === null) this.db = createDrizzle(createDbPool(this._env.DATABASE_URL));
    return this.db;
  }

  /**
   * Compute health score for one API. Threat level from change_events (latest) or default LOW.
   */
  async computeForApi(apiId: string): Promise<{
    score: number;
    threatLevelPenalty: number;
    errorRatePenalty: number;
    latencyPenalty: number;
    unacknowledgedPenalty: number;
  }> {
    const db = this.getDb();

    const edges = await db
      .select({
        callCount: dependencyEdges.callCount,
        errorCount: dependencyEdges.errorCount,
        avgLatencyMs: dependencyEdges.avgLatencyMs,
      })
      .from(dependencyEdges)
      .where(eq(dependencyEdges.targetApiId, apiId));

    const callCount = edges.reduce((s, e) => s + (e.callCount ?? 0), 0);
    const errorCount = edges.reduce((s, e) => s + (e.errorCount ?? 0), 0);
    const totalLatency = edges.reduce((s, e) => s + (e.avgLatencyMs ?? 0) * (e.callCount ?? 0), 0);
    const avgLatencyMs = callCount > 0 ? Math.round(totalLatency / callCount) : 0;
    const errorRatePenalty = callCount > 0 ? Math.min(30, Math.round((errorCount / callCount) * 100)) : 0;
    const latencyPenalty = avgLatencyMs >= 1000 ? 20 : avgLatencyMs >= 500 ? 10 : avgLatencyMs >= 200 ? 5 : 0;

    const [latestChange] = await db
      .select({ threatLevel: changeEvents.threatLevel, acknowledgedAt: changeEvents.acknowledgedAt })
      .from(changeEvents)
      .where(eq(changeEvents.apiEndpointId, apiId))
      .orderBy(sql`${changeEvents.createdAt} DESC`)
      .limit(1);

    const threatLevel = (latestChange?.threatLevel as string) ?? 'LOW';
    const threatLevelPenalty = THREAT_PENALTY[threatLevel] ?? 0;

    const [unack] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(changeEvents)
      .where(and(eq(changeEvents.apiEndpointId, apiId), eq(changeEvents.threatLevel, 'CRITICAL'), isNull(changeEvents.acknowledgedAt)));
    const unacknowledgedPenalty = Math.min(25, (unack?.count ?? 0) * 10);

    const totalPenalty = threatLevelPenalty + errorRatePenalty + latencyPenalty + unacknowledgedPenalty;
    const score = Math.max(0, Math.min(100, 100 - totalPenalty));

    return {
      score,
      threatLevelPenalty,
      errorRatePenalty,
      latencyPenalty,
      unacknowledgedPenalty,
    };
  }

  async runForAll(): Promise<number> {
    const db = this.getDb();
    const apiRows = await db.select({ id: apis.id }).from(apis);
    let updated = 0;
    for (const row of apiRows) {
      const computed = await this.computeForApi(row.id);
      await db
        .insert(apiHealthScores)
        .values({
          apiId: row.id,
          score: computed.score,
          threatLevelPenalty: computed.threatLevelPenalty,
          errorRatePenalty: computed.errorRatePenalty,
          latencyPenalty: computed.latencyPenalty,
          unacknowledgedPenalty: computed.unacknowledgedPenalty,
        })
        .onConflictDoUpdate({
          target: [apiHealthScores.apiId],
          set: {
            score: computed.score,
            threatLevelPenalty: computed.threatLevelPenalty,
            errorRatePenalty: computed.errorRatePenalty,
            latencyPenalty: computed.latencyPenalty,
            unacknowledgedPenalty: computed.unacknowledgedPenalty,
            computedAt: new Date(),
          },
        });
      updated++;
    }
    return updated;
  }
}
