-- Security hardening (9 Nov 2026 audit).
-- 1. Sign-in throttle: failed password attempts per email and per IP, read by src/lib/throttle.ts.
--    The app keeps working if this table is missing (the throttle is then off).
-- 2. The app talks to Postgres as ccd_app. The Supabase API roles (anon, authenticated) never need these
--    tables; RLS already blocks them, this removes the grants as well (defence in depth).

CREATE TABLE IF NOT EXISTS auth_attempts (
  id         BIGSERIAL PRIMARY KEY,
  key        TEXT NOT NULL,          -- 'email:<lowercased email>' or 'ip:<address>'
  at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_auth_attempts_key_at ON auth_attempts (key, at DESC);
ALTER TABLE auth_attempts ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY app_full_access ON auth_attempts FOR ALL TO ccd_app USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN
  GRANT SELECT, INSERT, DELETE ON auth_attempts TO ccd_app;
  GRANT USAGE ON SEQUENCE auth_attempts_id_seq TO ccd_app;
EXCEPTION WHEN undefined_object THEN NULL; END $$;

-- Emails are compared lowercased from now on.
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_lower ON users (lower(email));

DO $$ DECLARE t TEXT; BEGIN
  FOREACH t IN ARRAY ARRAY['users','user_progress','oauth_accounts','app_settings','push_subscriptions',
                           'progress_events','challenge_scores','drill_results','auth_attempts'] LOOP
    BEGIN
      EXECUTE format('REVOKE ALL ON TABLE public.%I FROM anon, authenticated', t);
    EXCEPTION WHEN undefined_table OR undefined_object THEN NULL; END;
  END LOOP;
END $$;
