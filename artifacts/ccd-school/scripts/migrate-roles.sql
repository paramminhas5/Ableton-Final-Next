-- Roles for CCD.SCHOOL members. member (default), staff, owner.
-- staff can open /admin and change a member's plan. owner can also change roles.
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'member';
DO $$ BEGIN
  ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('member', 'staff', 'owner'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role) WHERE role <> 'member';
