-- api_health_scores: per-API health score (0-100), updated hourly
CREATE TABLE IF NOT EXISTS api_health_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_id UUID NOT NULL REFERENCES apis(id) ON DELETE CASCADE UNIQUE,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  threat_level_penalty INTEGER NOT NULL DEFAULT 0,
  error_rate_penalty INTEGER NOT NULL DEFAULT 0,
  latency_penalty INTEGER NOT NULL DEFAULT 0,
  unacknowledged_penalty INTEGER NOT NULL DEFAULT 0,
  computed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS api_health_scores_api_id_idx ON api_health_scores(api_id);
CREATE INDEX IF NOT EXISTS api_health_scores_score_idx ON api_health_scores(score);
