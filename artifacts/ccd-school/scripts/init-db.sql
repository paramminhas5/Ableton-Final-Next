-- CCD.SCHOOL database schema
-- Run once to initialise tables: psql $DATABASE_URL -f scripts/init-db.sql

CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  name          TEXT,
  image         TEXT,
  password_hash TEXT,
  plan          TEXT NOT NULL DEFAULT 'free',
  stripe_customer_id TEXT,
  total_xp      INTEGER NOT NULL DEFAULT 0,
  streak        INTEGER NOT NULL DEFAULT 0,
  hearts        INTEGER NOT NULL DEFAULT 3,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS oauth_accounts (
  id                TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider          TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  access_token      TEXT,
  refresh_token     TEXT,
  expires_at        BIGINT,
  UNIQUE (provider, provider_account_id)
);

CREATE TABLE IF NOT EXISTS user_progress (
  user_id           UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  xp                INTEGER NOT NULL DEFAULT 0,
  streak_days       INTEGER NOT NULL DEFAULT 0,
  last_day          DATE,
  daily_xp          INTEGER NOT NULL DEFAULT 0,
  daily_xp_date     DATE,
  hearts            INTEGER NOT NULL DEFAULT 3,
  heart_refill_at   BIGINT NOT NULL DEFAULT 0,
  streak_shield     BOOLEAN NOT NULL DEFAULT FALSE,
  completed_missions JSONB NOT NULL DEFAULT '{}',
  badges            JSONB NOT NULL DEFAULT '[]',
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

INSERT INTO app_settings (key, value)
  VALUES ('gating_mode', 'paid')
  ON CONFLICT (key) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress (user_id);
CREATE INDEX IF NOT EXISTS idx_oauth_accounts_user_id ON oauth_accounts (user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_total_xp ON users (total_xp DESC);
