-- Storage Bucket Setup for lesson-audio
-- Creates the bucket and RLS policies for audio file storage

-- Create storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'lesson-audio',
  'lesson-audio',
  false,
  52428800, -- 50MB limit
  ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/ogg']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for lesson-audio bucket
-- Policy: Users can upload their own audio files
-- Files are stored in folders named by user_id: {user_id}/filename.mp3
CREATE POLICY "Users can upload their own audio files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'lesson-audio' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can read their own audio files
CREATE POLICY "Users can read their own audio files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'lesson-audio' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can update their own audio files
CREATE POLICY "Users can update their own audio files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'lesson-audio' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can delete their own audio files
CREATE POLICY "Users can delete their own audio files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'lesson-audio' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

