-- ============================================================
-- Anon Role RLS Policies for Auth Bypass / Development Mode
-- Allows the anon role to read data created by the anonymous user
-- This enables the frontend to poll for status updates when using
-- auth bypass mode with the anonymous user ID.
-- ============================================================

-- Anonymous user ID used by the app in auth bypass mode
-- Must match ANONYMOUS_USER_ID in src/utils/env.ts
-- Value: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'

-- ============================================================
-- Plan Lessons - Allow anon to view anonymous user's lessons
-- ============================================================

CREATE POLICY "Anon can view anonymous user plan lessons"
  ON plan_lessons FOR SELECT
  TO anon
  USING (user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');

-- ============================================================
-- Plans - Allow anon to view anonymous user's plans
-- ============================================================

CREATE POLICY "Anon can view anonymous user plans"
  ON plans FOR SELECT
  TO anon
  USING (user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');

-- ============================================================
-- Episodes - Allow anon to view anonymous user's episodes
-- ============================================================

CREATE POLICY "Anon can view anonymous user episodes"
  ON episodes FOR SELECT
  TO anon
  USING (user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');

-- ============================================================
-- AI Jobs - Allow anon to view anonymous user's AI jobs
-- (Optional: useful for debugging generation status)
-- ============================================================

CREATE POLICY "Anon can view anonymous user ai jobs"
  ON ai_jobs FOR SELECT
  TO anon
  USING (user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');

-- ============================================================
-- Done!
-- ============================================================

SELECT 'Anon role RLS policies added successfully!' AS status;

