-- Unique constraint for dependency_edges to support upsert
ALTER TABLE dependency_edges
  ADD CONSTRAINT dependency_edges_source_target_key UNIQUE (source_api_id, target_api_id);
