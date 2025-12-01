-- ============================================================
-- FIX: Anon Role RLS Policies for Sessions Table
-- Allows the anon role to create/update sessions when using
-- auth bypass mode with the anonymous user ID.
-- ============================================================

-- Anonymous user ID used by the app in auth bypass mode
-- Must match ANONYMOUS_USER_ID in src/utils/env.ts
-- Value: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'

-- ============================================================
-- STEP 1: Drop existing anon policies for sessions (if any)
-- ============================================================

DROP POLICY IF EXISTS "Anon can view anonymous user sessions" ON sessions;
DROP POLICY IF EXISTS "Anon can insert anonymous user sessions" ON sessions;
DROP POLICY IF EXISTS "Anon can update anonymous user sessions" ON sessions;
DROP POLICY IF EXISTS "Anon can delete anonymous user sessions" ON sessions;

-- ============================================================
-- STEP 2: Create anon policies for sessions table
-- ============================================================

-- Policy for SELECT: Anon can read anonymous user's sessions
CREATE POLICY "Anon can view anonymous user sessions"
  ON sessions FOR SELECT
  TO anon
  USING (user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');

-- Policy for INSERT: Anon can create sessions for anonymous user
CREATE POLICY "Anon can insert anonymous user sessions"
  ON sessions FOR INSERT
  TO anon
  WITH CHECK (user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');

-- Policy for UPDATE: Anon can update anonymous user's sessions
CREATE POLICY "Anon can update anonymous user sessions"
  ON sessions FOR UPDATE
  TO anon
  USING (user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')
  WITH CHECK (user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');

-- Policy for DELETE: Anon can delete anonymous user's sessions
CREATE POLICY "Anon can delete anonymous user sessions"
  ON sessions FOR DELETE
  TO anon
  USING (user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');

-- ============================================================
-- STEP 3: Also add missing anon policies for day_entries
-- (needed when completing sessions, which updates day_entries)
-- ============================================================

DROP POLICY IF EXISTS "Anon can view anonymous user day entries" ON day_entries;
DROP POLICY IF EXISTS "Anon can insert anonymous user day entries" ON day_entries;
DROP POLICY IF EXISTS "Anon can update anonymous user day entries" ON day_entries;

-- Policy for SELECT: Anon can read anonymous user's day entries
CREATE POLICY "Anon can view anonymous user day entries"
  ON day_entries FOR SELECT
  TO anon
  USING (user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');

-- Policy for INSERT: Anon can create day entries for anonymous user
CREATE POLICY "Anon can insert anonymous user day entries"
  ON day_entries FOR INSERT
  TO anon
  WITH CHECK (user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');

-- Policy for UPDATE: Anon can update anonymous user's day entries
CREATE POLICY "Anon can update anonymous user day entries"
  ON day_entries FOR UPDATE
  TO anon
  USING (user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')
  WITH CHECK (user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');

-- ============================================================
-- Done!
-- ============================================================

SELECT 'Anon role sessions/day_entries RLS policies added successfully!' AS status;


