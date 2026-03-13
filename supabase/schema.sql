-- Routines table
-- user_id matches the sub/email from NextAuth session
CREATE TABLE IF NOT EXISTS routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  user_email TEXT NOT NULL,
  name TEXT NOT NULL,
  concern TEXT NOT NULL,
  products JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast user lookup
CREATE INDEX IF NOT EXISTS routines_user_id_idx ON routines(user_id);

-- Row Level Security: users can only access their own routines
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS (used in API routes with service key)
-- No additional policies needed since we use service_role key server-side
