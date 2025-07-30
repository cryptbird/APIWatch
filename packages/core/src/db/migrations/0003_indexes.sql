-- Indexes for graph queries
CREATE INDEX IF NOT EXISTS apis_team_id_idx ON apis(team_id);
CREATE INDEX IF NOT EXISTS apis_deprecated_idx ON apis(deprecated) WHERE deprecated = false;
