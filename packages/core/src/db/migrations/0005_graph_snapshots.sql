-- Graph snapshots for versioning and diff
CREATE TABLE IF NOT EXISTS graph_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_at TIMESTAMP NOT NULL DEFAULT NOW(),
  payload JSONB NOT NULL
);
CREATE INDEX IF NOT EXISTS graph_snapshots_at_idx ON graph_snapshots(snapshot_at);
