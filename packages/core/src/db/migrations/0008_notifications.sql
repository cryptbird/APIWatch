-- In-app notification center
CREATE TABLE IF NOT EXISTS in_app_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  change_event_id UUID NOT NULL,
  channel_type VARCHAR(32) NOT NULL,
  subject VARCHAR(512) NOT NULL,
  body TEXT,
  threat_level VARCHAR(32) NOT NULL,
  read BOOLEAN DEFAULT false,
  acknowledged BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);
CREATE INDEX IF NOT EXISTS in_app_notifications_user_id_idx ON in_app_notifications(user_id);
CREATE INDEX IF NOT EXISTS in_app_notifications_read_idx ON in_app_notifications(read);
