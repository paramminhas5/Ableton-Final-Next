-- Learning events (src/lib/learnEvents.ts) live in progress_events with event_type 'learn:<name>'.
-- This index keeps the admin funnel quick. Safe to re-run.
CREATE INDEX IF NOT EXISTS idx_progress_events_type_created ON progress_events (event_type, created_at);
