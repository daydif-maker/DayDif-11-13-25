#!/usr/bin/env node

/**
 * Supabase Setup Script
 * 
 * This script helps set up your Supabase project:
 * 1. Runs the migration SQL
 * 2. Creates the lesson-audio storage bucket
 * 3. Sets up storage policies
 * 
 * Prerequisites:
 * - Supabase CLI installed (npm install -g supabase)
 * - Supabase project linked (supabase link)
 * - Environment variables set (EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const MIGRATION_FILE = path.join(__dirname, '../supabase/migrations/001_initial_schema.sql');

async function runMigration() {
  console.log('📦 Running database migration...');
  
  if (!fs.existsSync(MIGRATION_FILE)) {
    throw new Error(`Migration file not found: ${MIGRATION_FILE}`);
  }

  try {
    // Read the migration SQL
    const migrationSQL = fs.readFileSync(MIGRATION_FILE, 'utf8');
    
    // Check if Supabase is linked
    try {
      execSync('supabase status', { stdio: 'ignore' });
    } catch (error) {
      console.error('❌ Supabase project not linked. Please run: supabase link');
      process.exit(1);
    }

    // Run the migration using Supabase CLI
    // Note: This requires the migration to be in the migrations folder
    // and Supabase to be linked to your project
    console.log('Running migration SQL...');
    
    // Use psql if available, otherwise use Supabase CLI db push
    try {
      // Try using supabase db push (for local development)
      execSync(`supabase db push`, { 
        stdio: 'inherit',
        cwd: path.join(__dirname, '..')
      });
      console.log('✅ Migration completed successfully!');
    } catch (error) {
      console.log('⚠️  Local migration failed. Trying remote migration...');
      console.log('📝 Please run the migration SQL manually in Supabase Dashboard:');
      console.log('   1. Go to SQL Editor in Supabase Dashboard');
      console.log(`   2. Copy contents of: ${MIGRATION_FILE}`);
      console.log('   3. Paste and run the SQL');
    }
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  }
}

async function createStorageBucket() {
  console.log('\n🗄️  Creating storage bucket...');
  
  const bucketName = 'lesson-audio';
  const bucketSQL = `
-- Create storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  '${bucketName}',
  '${bucketName}',
  false,
  52428800, -- 50MB limit
  ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/ogg']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for lesson-audio bucket
-- Policy: Users can upload their own audio files
CREATE POLICY "Users can upload their own audio files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = '${bucketName}' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can read their own audio files
CREATE POLICY "Users can read their own audio files"
ON storage.objects FOR SELECT
USING (
  bucket_id = '${bucketName}' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can update their own audio files
CREATE POLICY "Users can update their own audio files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = '${bucketName}' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can delete their own audio files
CREATE POLICY "Users can delete their own audio files"
ON storage.objects FOR DELETE
USING (
  bucket_id = '${bucketName}' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
`;

  try {
    // Write SQL to temp file
    const tempSQLFile = path.join(__dirname, '../supabase/migrations/002_storage_setup.sql');
    fs.writeFileSync(tempSQLFile, bucketSQL);
    
    console.log(`✅ Storage setup SQL created: ${tempSQLFile}`);
    console.log('📝 Please run this SQL in Supabase Dashboard SQL Editor:');
    console.log(`   File: ${tempSQLFile}`);
    
    // Alternatively, try to run via Supabase CLI
    try {
      execSync(`supabase db push`, { 
        stdio: 'inherit',
        cwd: path.join(__dirname, '..')
      });
      console.log('✅ Storage bucket created successfully!');
    } catch (error) {
      console.log('⚠️  Could not run storage setup automatically.');
      console.log('   Please run the SQL manually in Supabase Dashboard.');
    }
  } catch (error) {
    console.error('❌ Storage setup failed:', error.message);
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting Supabase setup...\n');
  
  try {
    await runMigration();
    await createStorageBucket();
    
    console.log('\n✅ Setup completed!');
    console.log('\n📋 Next steps:');
    console.log('   1. Configure OAuth providers in Supabase Dashboard');
    console.log('   2. Set up redirect URLs for OAuth');
    console.log('   3. Run: npm run test:supabase (to test authentication)');
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { runMigration, createStorageBucket };

