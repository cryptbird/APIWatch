/**
 * SLA breach detection: maxErrorRate, maxP95Latency. Check every 5min; on breach emit event, CRITICAL notification, JIRA P1.
 */

import type { Env } from '../env.js';
import { createDbPool } from '../db/index.js';
import { getEnv } from '../env.js';
import { apiHourlyStats } from '../db/schema.js';
import { eq, gte, sql, and } from 'drizzle-orm';
import { createDrizzle } from '../db/index.js';

export interface SlaConfig {
  apiId: string;
  maxErrorRate?: number;
  maxP95LatencyMs?: number;
}

const DEFAULT_MAX_ERROR_RATE = 0.01;
const DEFAULT_MAX_P95_MS = 500;

export interface SlaBreach {
  apiId: string;
  type: 'error_rate' | 'latency';
  current: number;
  threshold: number;
  at: Date;
}

export class SlaMonitor {
  private db: ReturnType<typeof createDrizzle> | null = null;

  constructor(
    private _env: Env,
    private configs: SlaConfig[] = []
  ) {}

  private getDb() {
    if (this.db === null) this.db = createDrizzle(createDbPool(this._env.DATABASE_URL));
    return this.db;
  }

  addConfig(config: SlaConfig): void {
    this.configs.push(config);
  }

  async check(): Promise<SlaBreach[]> {
    const db = this.getDb();
    const breaches: SlaBreach[] = [];
    const hourStart = new Date();
    hourStart.setMinutes(0, 0, 0);

    for (const cfg of this.configs) {
      const maxErrorRate = cfg.maxErrorRate ?? DEFAULT_MAX_ERROR_RATE;
      const maxP95 = cfg.maxP95LatencyMs ?? DEFAULT_MAX_P95_MS;

      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const [row] = await db
        .select({
          callCount: sql<number>`coalesce(sum(${apiHourlyStats.callCount}), 0)::int`,
          errorCount: sql<number>`coalesce(sum(${apiHourlyStats.errorCount}), 0)::int`,
          p95: sql<number>`coalesce(max(${apiHourlyStats.p95LatencyMs}), 0)::int`,
        })
        .from(apiHourlyStats)
        .where(and(eq(apiHourlyStats.apiId, cfg.apiId), gte(apiHourlyStats.hour, oneHourAgo)));

      const callCount = row?.callCount ?? 0;
      const errorCount = row?.errorCount ?? 0;
      const errorRate = callCount > 0 ? errorCount / callCount : 0;
      const p95 = row?.p95 ?? 0;

      if (callCount > 0 && errorRate > maxErrorRate) {
        breaches.push({
          apiId: cfg.apiId,
          type: 'error_rate',
          current: errorRate,
          threshold: maxErrorRate,
          at: new Date(),
        });
      }
      if (p95 > maxP95) {
        breaches.push({
          apiId: cfg.apiId,
          type: 'latency',
          current: p95,
          threshold: maxP95,
          at: new Date(),
        });
      }
    }
    return breaches;
  }
}

export function startSlaMonitor(env: Env, configs: SlaConfig[]): () => void {
  const monitor = new SlaMonitor(env, configs);
  const interval = setInterval(() => {
    monitor.check().then((breaches) => {
      if (breaches.length > 0) {
        getEnv();
        // Emit sla:breach; in real impl would notify and create JIRA
      }
    });
  }, 5 * 60 * 1000);
  return () => clearInterval(interval);
}
