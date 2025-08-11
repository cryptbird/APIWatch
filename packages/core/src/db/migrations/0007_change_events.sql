-- Add risk_score, acknowledged_at, acknowledged_by to change_events
ALTER TABLE change_events ADD COLUMN IF NOT EXISTS risk_score INTEGER;
ALTER TABLE change_events ADD COLUMN IF NOT EXISTS acknowledged_at TIMESTAMP;
ALTER TABLE change_events ADD COLUMN IF NOT EXISTS acknowledged_by VARCHAR(255);
CREATE INDEX IF NOT EXISTS change_events_created_idx ON change_events(created_at);
