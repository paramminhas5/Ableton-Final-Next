-- ============================================================
-- World-class upgrade migrations
-- Run: psql $DATABASE_URL -f scripts/migrate-world-class.sql
-- ============================================================

-- 1. Add gems column to user_progress (if not exists)
ALTER TABLE user_progress
  ADD COLUMN IF NOT EXISTS gems INTEGER NOT NULL DEFAULT 0;

-- 2. Add streak_shield_used_at column
ALTER TABLE user_progress
  ADD COLUMN IF NOT EXISTS streak_shield_used_at TEXT DEFAULT NULL;

-- 3. Add fsrs_cards JSONB column for FSRS spaced repetition data
ALTER TABLE user_progress
  ADD COLUMN IF NOT EXISTS fsrs_cards JSONB NOT NULL DEFAULT '{}';

-- 4. Create push_subscriptions table for Web Push
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id          SERIAL PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  endpoint    TEXT NOT NULL UNIQUE,
  p256dh      TEXT NOT NULL,
  auth        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);

-- 5. Create progress_events log table (audit trail for server-authoritative events)
CREATE TABLE IF NOT EXISTS progress_events (
  id          BIGSERIAL PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type  TEXT NOT NULL,
  payload     JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_progress_events_user_id ON progress_events(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_events_created_at ON progress_events(created_at);

-- 6. Add index on user_progress.user_id if not exists
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);

-- 7. Ensure challenge_scores has the right structure
CREATE TABLE IF NOT EXISTS challenge_scores (
  id              SERIAL PRIMARY KEY,
  user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score           INTEGER NOT NULL DEFAULT 0,
  correct         INTEGER NOT NULL DEFAULT 0,
  challenge_date  DATE NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, challenge_date)
);

COMMENT ON TABLE push_subscriptions IS 'Web Push API subscriptions for streak reminders';
COMMENT ON TABLE progress_events IS 'Audit log of server-authoritative progress events (prevents XP spoofing)';
COMMENT ON COLUMN user_progress.fsrs_cards IS 'FSRS v4 spaced repetition cards per mission slug';
