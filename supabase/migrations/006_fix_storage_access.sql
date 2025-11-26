-- ============================================================
-- Fix Storage Access for lesson-audio bucket
-- Makes audio files publicly readable while keeping write restricted
-- ============================================================

-- Option 1: Make the bucket public for reading
-- This is the simplest solution for audio playback
UPDATE storage.buckets 
SET public = true 
WHERE id = 'lesson-audio';

-- Option 2: Add explicit policy for public/anon read access
-- This allows anyone to read audio files (needed for playback)
DROP POLICY IF EXISTS "Public can read audio files" ON storage.objects;

CREATE POLICY "Public can read audio files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'lesson-audio');

-- Also allow service role to upload without user ID restriction
-- (The TTS service uses service role to upload)
DROP POLICY IF EXISTS "Service role can upload audio files" ON storage.objects;

CREATE POLICY "Service role can upload audio files"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'lesson-audio');

-- Allow service role to update audio files
DROP POLICY IF EXISTS "Service role can update audio files" ON storage.objects;

CREATE POLICY "Service role can update audio files"
ON storage.objects FOR UPDATE
TO service_role
USING (bucket_id = 'lesson-audio');

-- ============================================================
-- Done!
-- ============================================================

SELECT 'Storage access policies updated - audio files now publicly readable!' AS status;

