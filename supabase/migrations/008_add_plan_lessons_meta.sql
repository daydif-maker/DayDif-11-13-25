-- Add meta column to plan_lessons for storing lesson-specific metadata
ALTER TABLE plan_lessons
  ADD COLUMN IF NOT EXISTS meta JSONB DEFAULT '{}'::jsonb;

-- Ensure existing rows have a non-null JSON object
UPDATE plan_lessons
SET meta = COALESCE(meta, '{}'::jsonb);

-- Keep metadata required for future inserts/updates
ALTER TABLE plan_lessons
  ALTER COLUMN meta SET NOT NULL;
