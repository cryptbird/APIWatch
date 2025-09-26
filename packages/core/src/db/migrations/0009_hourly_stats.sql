-- api_hourly_stats: aggregated usage per API per hour for analytics
CREATE TABLE IF NOT EXISTS api_hourly_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_id UUID NOT NULL REFERENCES apis(id) ON DELETE CASCADE,
  hour TIMESTAMP WITH TIME ZONE NOT NULL,
  call_count INTEGER NOT NULL DEFAULT 0,
  error_count INTEGER NOT NULL DEFAULT 0,
  p50_latency_ms INTEGER,
  p95_latency_ms INTEGER,
  p99_latency_ms INTEGER,
  unique_caller_count INTEGER NOT NULL DEFAULT 0,
  UNIQUE(api_id, hour)
);

CREATE INDEX IF NOT EXISTS api_hourly_stats_api_id_idx ON api_hourly_stats(api_id);
CREATE INDEX IF NOT EXISTS api_hourly_stats_hour_idx ON api_hourly_stats(hour);
