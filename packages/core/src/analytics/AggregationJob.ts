/**
 * Hourly job: aggregate usage_events into api_hourly_stats, prune events older than 7 days.
 */

import { createDbPool } from '../db/index.js';
import type { Env } from '../env.js';

const PRUNE_DAYS = 7;

export async function runAggregation(env: Env): Promise<{ aggregated: number; pruned: number }> {
  const pool = createDbPool(env.DATABASE_URL);

  const client = await pool.connect();
  try {
    const cutoff = new Date(Date.now() - PRUNE_DAYS * 24 * 60 * 60 * 1000);

    const aggResult = await client.query(`
      INSERT INTO api_hourly_stats (api_id, hour, call_count, error_count, p50_latency_ms, p95_latency_ms, p99_latency_ms, unique_caller_count)
      SELECT
        target_api_id AS api_id,
        date_trunc('hour', timestamp) AS hour,
        COUNT(*)::int AS call_count,
        COUNT(*) FILTER (WHERE status_code >= 400)::int AS error_count,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY latency_ms) FILTER (WHERE latency_ms IS NOT NULL)::int AS p50_latency_ms,
        PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latency_ms) FILTER (WHERE latency_ms IS NOT NULL)::int AS p95_latency_ms,
        PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY latency_ms) FILTER (WHERE latency_ms IS NOT NULL)::int AS p99_latency_ms,
        COUNT(DISTINCT source_api_id)::int AS unique_caller_count
      FROM usage_events
      WHERE target_api_id IS NOT NULL
        AND timestamp >= $1
      GROUP BY target_api_id, date_trunc('hour', timestamp)
      ON CONFLICT (api_id, hour) DO UPDATE SET
        call_count = EXCLUDED.call_count,
        error_count = EXCLUDED.error_count,
        p50_latency_ms = EXCLUDED.p50_latency_ms,
        p95_latency_ms = EXCLUDED.p95_latency_ms,
        p99_latency_ms = EXCLUDED.p99_latency_ms,
        unique_caller_count = EXCLUDED.unique_caller_count
    `, [cutoff]);

    const prunedResult = await client.query(
      'DELETE FROM usage_events WHERE timestamp < $1',
      [cutoff]
    );

    return {
      aggregated: aggResult.rowCount ?? 0,
      pruned: prunedResult.rowCount ?? 0,
    };
  } finally {
    client.release();
    await pool.end();
  }
}

export function scheduleAggregation(env: Env): () => void {
  let scheduled: ReturnType<typeof setInterval> | null = null;
  const run = (): void => {
    runAggregation(env).catch((err) => {
      console.error('[AggregationJob]', err);
    });
  };
  run();
  scheduled = setInterval(run, 60 * 60 * 1000);
  return (): void => {
    if (scheduled !== null) clearInterval(scheduled);
  };
}
