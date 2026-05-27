-- Run this in Supabase SQL Editor to create the analytics events table
CREATE TABLE IF NOT EXISTS events (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type text        NOT NULL,
  session_id text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_events_type_created ON events (event_type, created_at);

GRANT ALL PRIVILEGES ON TABLE events TO service_role;
