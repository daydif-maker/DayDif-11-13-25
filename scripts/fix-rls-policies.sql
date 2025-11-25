-- ============================================================
-- QUICK FIX: Run this in the Supabase SQL Editor
-- Fixes: "new row violates row-level security policy" errors
-- for learning_preferences and plans tables
-- ============================================================

-- Step 1: Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Step 2: Fix learning_preferences RLS
DROP POLICY IF EXISTS "Users can view their own learning preferences" ON learning_preferences;
DROP POLICY IF EXISTS "Users can insert their own learning preferences" ON learning_preferences;
DROP POLICY IF EXISTS "Users can update their own learning preferences" ON learning_preferences;
DROP POLICY IF EXISTS "Users can delete their own learning preferences" ON learning_preferences;

CREATE POLICY "Users can view their own learning preferences"
  ON learning_preferences FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own learning preferences"
  ON learning_preferences FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own learning preferences"
  ON learning_preferences FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own learning preferences"
  ON learning_preferences FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Step 3: Fix plans RLS
DROP POLICY IF EXISTS "Users can view their own plans" ON plans;
DROP POLICY IF EXISTS "Users can insert their own plans" ON plans;
DROP POLICY IF EXISTS "Users can update their own plans" ON plans;
DROP POLICY IF EXISTS "Users can delete their own plans" ON plans;

CREATE POLICY "Users can view their own plans"
  ON plans FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own plans"
  ON plans FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plans"
  ON plans FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own plans"
  ON plans FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Step 4: Fix plan_lessons RLS
DROP POLICY IF EXISTS "Users can view their own plan lessons" ON plan_lessons;
DROP POLICY IF EXISTS "Users can insert their own plan lessons" ON plan_lessons;
DROP POLICY IF EXISTS "Users can update their own plan lessons" ON plan_lessons;
DROP POLICY IF EXISTS "Users can delete their own plan lessons" ON plan_lessons;

CREATE POLICY "Users can view their own plan lessons"
  ON plan_lessons FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own plan lessons"
  ON plan_lessons FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plan lessons"
  ON plan_lessons FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own plan lessons"
  ON plan_lessons FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Step 5: Fix ai_jobs RLS
DROP POLICY IF EXISTS "Users can view their own ai jobs" ON ai_jobs;
DROP POLICY IF EXISTS "Users can insert their own ai jobs" ON ai_jobs;
DROP POLICY IF EXISTS "Users can update their own ai jobs" ON ai_jobs;
DROP POLICY IF EXISTS "Users can delete their own ai jobs" ON ai_jobs;

CREATE POLICY "Users can view their own ai jobs"
  ON ai_jobs FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ai jobs"
  ON ai_jobs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ai jobs"
  ON ai_jobs FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ai jobs"
  ON ai_jobs FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Step 6: Add service_role bypass policies
DROP POLICY IF EXISTS "Service role has full access to learning_preferences" ON learning_preferences;
DROP POLICY IF EXISTS "Service role has full access to plans" ON plans;
DROP POLICY IF EXISTS "Service role has full access to plan_lessons" ON plan_lessons;
DROP POLICY IF EXISTS "Service role has full access to ai_jobs" ON ai_jobs;

CREATE POLICY "Service role has full access to learning_preferences"
  ON learning_preferences FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role has full access to plans"
  ON plans FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role has full access to plan_lessons"
  ON plan_lessons FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role has full access to ai_jobs"
  ON ai_jobs FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Done!
SELECT 'RLS policies fixed successfully!' AS status;

