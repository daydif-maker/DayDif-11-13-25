-- DayDif Initial Schema Migration
-- Creates all tables, RLS policies, indexes, and triggers
-- Requires pgcrypto/gen_random_uuid() which is enabled via 000_enable_extensions.sql

-- ============================================================================
-- PROFILES TABLE
-- 1:1 relationship with auth.users
-- ============================================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  timezone TEXT DEFAULT 'UTC',
  has_completed_onboarding BOOLEAN DEFAULT FALSE,
  avatar_color_seed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT profiles_user_id_unique UNIQUE (user_id)
);

-- Index for profiles
CREATE INDEX idx_profiles_user_id ON profiles(user_id);

-- ============================================================================
-- LEARNING_PREFERENCES TABLE
-- Per-user learning preferences
-- ============================================================================
CREATE TABLE learning_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  primary_goal TEXT,
  topics TEXT[] DEFAULT '{}',
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  lessons_per_week INTEGER,
  lesson_duration_minutes INTEGER,
  commute_days INTEGER[] DEFAULT '{}', -- Array of day numbers (0-6, Sunday-Saturday)
  commute_time_windows JSONB, -- Array of {start: "HH:mm", end: "HH:mm"} objects
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT learning_preferences_user_id_unique UNIQUE (user_id)
);

-- Index for learning_preferences
CREATE INDEX idx_learning_preferences_user_id ON learning_preferences(user_id);

-- ============================================================================
-- PLANS TABLE
-- Weekly learning plans
-- ============================================================================
CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  lessons_goal INTEGER NOT NULL,
  minutes_goal INTEGER NOT NULL,
  source TEXT, -- e.g., 'user_created', 'ai_generated'
  meta JSONB DEFAULT '{}', -- Flexible metadata (topics, topicPrompt, etc.)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for plans
CREATE INDEX idx_plans_user_id ON plans(user_id);
CREATE INDEX idx_plans_user_status ON plans(user_id, status);
CREATE INDEX idx_plans_dates ON plans(start_date, end_date);

-- ============================================================================
-- PLAN_LESSONS TABLE
-- Lessons within a plan
-- ============================================================================
CREATE TABLE plan_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_index INTEGER NOT NULL, -- Day number within the plan (0-indexed or 1-indexed)
  date DATE NOT NULL, -- Actual calendar date for this lesson
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
  primary_topic TEXT,
  tags TEXT[] DEFAULT '{}',
  ai_prompt_used TEXT, -- The prompt used to generate this lesson
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for plan_lessons
CREATE INDEX idx_plan_lessons_plan_id ON plan_lessons(plan_id);
CREATE INDEX idx_plan_lessons_user_id ON plan_lessons(user_id);
CREATE INDEX idx_plan_lessons_date ON plan_lessons(user_id, date);
CREATE INDEX idx_plan_lessons_status ON plan_lessons(user_id, status);

-- ============================================================================
-- EPISODES TABLE
-- AI-generated content for each lesson
-- ============================================================================
CREATE TABLE episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES plan_lessons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('intro', 'content', 'summary', 'quiz')),
  title TEXT NOT NULL,
  body TEXT NOT NULL, -- Full text content
  audio_path TEXT, -- Path in Supabase Storage
  duration_seconds INTEGER,
  order_index INTEGER NOT NULL DEFAULT 0, -- Order within the lesson
  meta JSONB DEFAULT '{}', -- Additional metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for episodes
CREATE INDEX idx_episodes_lesson_id ON episodes(lesson_id);
CREATE INDEX idx_episodes_user_id ON episodes(user_id);
CREATE INDEX idx_episodes_order ON episodes(lesson_id, order_index);

-- ============================================================================
-- SESSIONS TABLE
-- Listening/learning sessions
-- ============================================================================
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id UUID NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  progress_seconds INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  source TEXT, -- e.g., 'mobile_app', 'web'
  device TEXT, -- Device identifier
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for sessions
CREATE INDEX idx_sessions_episode_id ON sessions(episode_id);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_started_at ON sessions(user_id, started_at);
CREATE INDEX idx_sessions_completed ON sessions(user_id, completed);

-- ============================================================================
-- DAY_ENTRIES TABLE
-- Daily rollups for the calendar
-- ============================================================================
CREATE TABLE day_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  plan_id UUID REFERENCES plans(id) ON DELETE SET NULL,
  lessons_completed INTEGER DEFAULT 0,
  minutes_learned INTEGER DEFAULT 0,
  streak_active BOOLEAN DEFAULT FALSE,
  reflection TEXT,
  mood TEXT CHECK (mood IN ('great', 'good', 'okay', 'tough')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT day_entries_user_date_unique UNIQUE (user_id, date)
);

-- Indexes for day_entries
CREATE INDEX idx_day_entries_user_id ON day_entries(user_id);
CREATE INDEX idx_day_entries_date ON day_entries(user_id, date);
CREATE INDEX idx_day_entries_plan_id ON day_entries(plan_id);
CREATE INDEX idx_day_entries_streak ON day_entries(user_id, streak_active, date);

-- ============================================================================
-- AI_JOBS TABLE
-- Queue for AI generation tasks
-- ============================================================================
CREATE TABLE ai_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('plan_outline', 'episode_generation', 'lesson_content')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  input JSONB NOT NULL DEFAULT '{}', -- Input parameters for the AI job
  output JSONB DEFAULT '{}', -- Output from the AI job
  error TEXT,
  plan_id UUID REFERENCES plans(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES plan_lessons(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Indexes for ai_jobs
CREATE INDEX idx_ai_jobs_user_id ON ai_jobs(user_id);
CREATE INDEX idx_ai_jobs_status ON ai_jobs(status);
CREATE INDEX idx_ai_jobs_type ON ai_jobs(type, status);
CREATE INDEX idx_ai_jobs_plan_id ON ai_jobs(plan_id);
CREATE INDEX idx_ai_jobs_lesson_id ON ai_jobs(lesson_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE day_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_jobs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile"
  ON profiles FOR DELETE
  USING (auth.uid() = user_id);

-- Learning preferences policies
CREATE POLICY "Users can view their own learning preferences"
  ON learning_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own learning preferences"
  ON learning_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own learning preferences"
  ON learning_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own learning preferences"
  ON learning_preferences FOR DELETE
  USING (auth.uid() = user_id);

-- Plans policies
CREATE POLICY "Users can view their own plans"
  ON plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own plans"
  ON plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plans"
  ON plans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own plans"
  ON plans FOR DELETE
  USING (auth.uid() = user_id);

-- Plan lessons policies
CREATE POLICY "Users can view their own plan lessons"
  ON plan_lessons FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own plan lessons"
  ON plan_lessons FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plan lessons"
  ON plan_lessons FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own plan lessons"
  ON plan_lessons FOR DELETE
  USING (auth.uid() = user_id);

-- Episodes policies
CREATE POLICY "Users can view their own episodes"
  ON episodes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own episodes"
  ON episodes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own episodes"
  ON episodes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own episodes"
  ON episodes FOR DELETE
  USING (auth.uid() = user_id);

-- Sessions policies
CREATE POLICY "Users can view their own sessions"
  ON sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions"
  ON sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
  ON sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions"
  ON sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Day entries policies
CREATE POLICY "Users can view their own day entries"
  ON day_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own day entries"
  ON day_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own day entries"
  ON day_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own day entries"
  ON day_entries FOR DELETE
  USING (auth.uid() = user_id);

-- AI jobs policies
CREATE POLICY "Users can view their own ai jobs"
  ON ai_jobs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ai jobs"
  ON ai_jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ai jobs"
  ON ai_jobs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ai jobs"
  ON ai_jobs FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_preferences_updated_at BEFORE UPDATE ON learning_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plan_lessons_updated_at BEFORE UPDATE ON plan_lessons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_episodes_updated_at BEFORE UPDATE ON episodes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_day_entries_updated_at BEFORE UPDATE ON day_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_jobs_updated_at BEFORE UPDATE ON ai_jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, user_id, display_name, avatar_color_seed)
  VALUES (
    NEW.id,
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    FLOOR(RANDOM() * 1000000)::INTEGER
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- STORAGE BUCKET SETUP
-- ============================================================================

-- Note: Storage buckets and policies are typically created via Supabase Dashboard
-- or using the Storage API. This is a reference for what needs to be created:
-- 
-- Bucket: lesson-audio
-- Public: false (private bucket)
-- 
-- Storage policies should be created via Supabase Dashboard:
-- - Users can upload their own audio files
-- - Users can read their own audio files
-- - Users can delete their own audio files
