-- ============================================================
-- FIX: Row Level Security Policies for sessions table
-- Run this in the Supabase SQL Editor to fix RLS error:
-- "new row violates row-level security policy for table sessions"
-- ============================================================

-- ============================================================
-- STEP 1: Grant proper schema and table access
-- ============================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- ============================================================
-- STEP 2: Ensure RLS is enabled on sessions table
-- ============================================================

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- STEP 3: Drop ALL existing sessions policies to start fresh
-- ============================================================

DROP POLICY IF EXISTS "Users can view their own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can insert their own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can delete their own sessions" ON sessions;
DROP POLICY IF EXISTS "Service role has full access to sessions" ON sessions;

-- ============================================================
-- STEP 4: Recreate sessions RLS policies with proper role grants
-- ============================================================

-- Policy for SELECT: Users can read their own sessions
CREATE POLICY "Users can view their own sessions"
  ON sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy for INSERT: Users can create sessions for themselves
CREATE POLICY "Users can insert their own sessions"
  ON sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy for UPDATE: Users can update their own sessions
CREATE POLICY "Users can update their own sessions"
  ON sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy for DELETE: Users can delete their own sessions
CREATE POLICY "Users can delete their own sessions"
  ON sessions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Service role bypass for Edge Functions
CREATE POLICY "Service role has full access to sessions"
  ON sessions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- Done!
-- ============================================================

SELECT 'Sessions RLS policies fixed successfully!' AS status;

