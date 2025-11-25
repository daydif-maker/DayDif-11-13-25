-- ============================================================
-- FIX: Row Level Security Policies for learning_preferences and plans
-- Run this in the Supabase SQL Editor to fix RLS errors:
-- "new row violates row-level security policy for table"
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
-- STEP 2: Fix learning_preferences RLS policies
-- ============================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own learning preferences" ON learning_preferences;
DROP POLICY IF EXISTS "Users can insert their own learning preferences" ON learning_preferences;
DROP POLICY IF EXISTS "Users can update their own learning preferences" ON learning_preferences;
DROP POLICY IF EXISTS "Users can delete their own learning preferences" ON learning_preferences;

-- Recreate with proper checks
CREATE POLICY "Users can view their own learning preferences"
  ON learning_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own learning preferences"
  ON learning_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own learning preferences"
  ON learning_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own learning preferences"
  ON learning_preferences FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================
-- STEP 3: Fix plans RLS policies
-- ============================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own plans" ON plans;
DROP POLICY IF EXISTS "Users can insert their own plans" ON plans;
DROP POLICY IF EXISTS "Users can update their own plans" ON plans;
DROP POLICY IF EXISTS "Users can delete their own plans" ON plans;

-- Recreate with proper checks
CREATE POLICY "Users can view their own plans"
  ON plans FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own plans"
  ON plans FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plans"
  ON plans FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own plans"
  ON plans FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================
-- STEP 4: Fix plan_lessons RLS policies
-- ============================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own plan lessons" ON plan_lessons;
DROP POLICY IF EXISTS "Users can insert their own plan lessons" ON plan_lessons;
DROP POLICY IF EXISTS "Users can update their own plan lessons" ON plan_lessons;
DROP POLICY IF EXISTS "Users can delete their own plan lessons" ON plan_lessons;

-- Recreate with proper checks
CREATE POLICY "Users can view their own plan lessons"
  ON plan_lessons FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own plan lessons"
  ON plan_lessons FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plan lessons"
  ON plan_lessons FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own plan lessons"
  ON plan_lessons FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================
-- STEP 5: Fix episodes RLS policies
-- ============================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own episodes" ON episodes;
DROP POLICY IF EXISTS "Users can insert their own episodes" ON episodes;
DROP POLICY IF EXISTS "Users can update their own episodes" ON episodes;
DROP POLICY IF EXISTS "Users can delete their own episodes" ON episodes;

-- Recreate with proper checks
CREATE POLICY "Users can view their own episodes"
  ON episodes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own episodes"
  ON episodes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own episodes"
  ON episodes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own episodes"
  ON episodes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================
-- STEP 6: Fix sessions RLS policies
-- ============================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can insert their own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can delete their own sessions" ON sessions;

-- Recreate with proper checks
CREATE POLICY "Users can view their own sessions"
  ON sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions"
  ON sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
  ON sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions"
  ON sessions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================
-- STEP 7: Fix day_entries RLS policies
-- ============================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own day entries" ON day_entries;
DROP POLICY IF EXISTS "Users can insert their own day entries" ON day_entries;
DROP POLICY IF EXISTS "Users can update their own day entries" ON day_entries;
DROP POLICY IF EXISTS "Users can delete their own day entries" ON day_entries;

-- Recreate with proper checks
CREATE POLICY "Users can view their own day entries"
  ON day_entries FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own day entries"
  ON day_entries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own day entries"
  ON day_entries FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own day entries"
  ON day_entries FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================
-- STEP 8: Fix ai_jobs RLS policies
-- ============================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own ai jobs" ON ai_jobs;
DROP POLICY IF EXISTS "Users can insert their own ai jobs" ON ai_jobs;
DROP POLICY IF EXISTS "Users can update their own ai jobs" ON ai_jobs;
DROP POLICY IF EXISTS "Users can delete their own ai jobs" ON ai_jobs;

-- Recreate with proper checks
CREATE POLICY "Users can view their own ai jobs"
  ON ai_jobs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ai jobs"
  ON ai_jobs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ai jobs"
  ON ai_jobs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ai jobs"
  ON ai_jobs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================
-- STEP 9: Fix profiles RLS policies
-- ============================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON profiles;

-- Recreate with proper checks (profiles uses both id and user_id, check against both)
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id AND auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id OR auth.uid() = user_id)
  WITH CHECK (auth.uid() = id AND auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile"
  ON profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = id OR auth.uid() = user_id);

-- ============================================================
-- STEP 10: Allow service_role to bypass RLS for Edge Functions
-- Note: service_role should already bypass RLS by default,
-- but we add explicit policies just in case
-- ============================================================

-- Service role policies for all tables (for Edge Functions)
CREATE POLICY "Service role has full access to learning_preferences"
  ON learning_preferences FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role has full access to plans"
  ON plans FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role has full access to plan_lessons"
  ON plan_lessons FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role has full access to episodes"
  ON episodes FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role has full access to sessions"
  ON sessions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role has full access to day_entries"
  ON day_entries FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role has full access to ai_jobs"
  ON ai_jobs FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role has full access to profiles"
  ON profiles FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- Done!
-- ============================================================

SELECT 'RLS policies fixed successfully!' AS status;

