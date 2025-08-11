-- Add fingerprint_hash to api_snapshots for change detection
ALTER TABLE api_snapshots ADD COLUMN IF NOT EXISTS fingerprint_hash VARCHAR(64);
