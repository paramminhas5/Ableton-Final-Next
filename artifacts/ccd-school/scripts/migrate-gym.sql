-- Ear Gym results (PRD drill_results). Safe to re-run.
CREATE TABLE IF NOT EXISTS drill_results (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  drill       TEXT NOT NULL,
  difficulty  INTEGER NOT NULL,
  correct     BOOLEAN NOT NULL,
  response_ms INTEGER NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS drill_results_user_created_idx ON drill_results (user_id, created_at DESC);
