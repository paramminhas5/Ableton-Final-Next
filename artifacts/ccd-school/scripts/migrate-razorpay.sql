-- Razorpay (India) subscriptions. Safe to re-run.
ALTER TABLE users ADD COLUMN IF NOT EXISTS razorpay_subscription_id TEXT;
CREATE INDEX IF NOT EXISTS users_razorpay_subscription_id_idx ON users (razorpay_subscription_id);
