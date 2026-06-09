-- ============================================================
-- Full schema: base tables + world-class upgrade columns
-- Run in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/dbttqkrhjywqdyxxyzrs/sql/new
-- ============================================================

-- users.id is UUID (matches Supabase's native UUID type)
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  name          TEXT,
  image         TEXT,
  password_hash TEXT,
  plan          TEXT NOT NULL DEFAULT 'free',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS oauth_accounts (
  id                   SERIAL PRIMARY KEY,
  provider             TEXT NOT NULL,
  provider_account_id  TEXT NOT NULL,
  user_id              UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(provider, provider_account_id)
);

CREATE TABLE IF NOT EXISTS user_progress (
  id                    SERIAL PRIMARY KEY,
  user_id               UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  xp                    INTEGER NOT NULL DEFAULT 0,
  streak_days           INTEGER NOT NULL DEFAULT 0,
  streak_shield         BOOLEAN NOT NULL DEFAULT false,
  last_day              TEXT,
  completed_missions    JSONB NOT NULL DEFAULT '{}',
  lesson_strengths      JSONB NOT NULL DEFAULT '{}',
  badges                JSONB NOT NULL DEFAULT '[]',
  hearts                INTEGER NOT NULL DEFAULT 5,
  heart_refill_at       BIGINT NOT NULL DEFAULT 0,
  daily_xp              INTEGER NOT NULL DEFAULT 0,
  daily_xp_date         TEXT,
  onboarding_done       BOOLEAN NOT NULL DEFAULT false,
  selected_world        TEXT,
  difficulty            TEXT NOT NULL DEFAULT 'normal',
  placement_done        BOOLEAN NOT NULL DEFAULT false,
  unlocked_chapter      INTEGER NOT NULL DEFAULT 1,
  league_id             TEXT,
  league_tier           TEXT NOT NULL DEFAULT 'bronze',
  weekly_xp             INTEGER NOT NULL DEFAULT 0,
  weekly_xp_reset_date  TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ
);

-- World-class upgrade columns (safe to run on existing table)
ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS gems INTEGER NOT NULL DEFAULT 0;
ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS streak_shield_used_at TEXT DEFAULT NULL;
ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS fsrs_cards JSONB NOT NULL DEFAULT '{}';

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id          SERIAL PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  endpoint    TEXT NOT NULL UNIQUE,
  p256dh      TEXT NOT NULL,
  auth        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);

CREATE TABLE IF NOT EXISTS progress_events (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type  TEXT NOT NULL,
  payload     JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_progress_events_user_id ON progress_events(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_events_created_at ON progress_events(created_at);

CREATE TABLE IF NOT EXISTS challenge_scores (
  id              SERIAL PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score           INTEGER NOT NULL DEFAULT 0,
  correct         INTEGER NOT NULL DEFAULT 0,
  challenge_date  DATE NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, challenge_date)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
