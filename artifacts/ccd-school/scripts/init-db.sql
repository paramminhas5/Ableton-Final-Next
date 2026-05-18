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
  id                TEXT PRIMARY KEY,
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider          TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  access_token      TEXT,
  refresh_token     TEXT,
  expires_at        BIGINT,
  UNIQUE (provider, provider_account_id)
);

CREATE TABLE IF NOT EXISTS user_progress (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mission_slug TEXT NOT NULL,
  completed   BOOLEAN NOT NULL DEFAULT FALSE,
  score       INTEGER,
  xp_earned   INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, mission_slug)
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
