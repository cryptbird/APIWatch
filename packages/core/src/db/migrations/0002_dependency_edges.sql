-- Dependency edges for API call graph
CREATE TABLE IF NOT EXISTS dependency_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_api_id UUID NOT NULL REFERENCES apis(id) ON DELETE CASCADE,
  target_api_id UUID NOT NULL REFERENCES apis(id) ON DELETE CASCADE,
  source_repo_id UUID NOT NULL,
  target_repo_id UUID NOT NULL,
  call_count INTEGER DEFAULT 0,
  last_called_at TIMESTAMP,
  avg_latency_ms INTEGER,
  error_count INTEGER DEFAULT 0,
  first_seen_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS dependency_edges_source_target_idx ON dependency_edges(source_api_id, target_api_id);
CREATE INDEX IF NOT EXISTS dependency_edges_source_idx ON dependency_edges(source_api_id);
CREATE INDEX IF NOT EXISTS dependency_edges_target_idx ON dependency_edges(target_api_id);
