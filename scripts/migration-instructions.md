# Migration Instructions

## Step-by-Step Guide to Run Migrations

### Step 1: Get Your Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key

### Step 2: Update Environment Variables

Edit `.env` file:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 3: Enable Required Extensions

1. Go to Supabase Dashboard → **SQL Editor**
2. Click **New query**
3. Open `supabase/migrations/000_enable_extensions.sql`
4. Copy all contents and run the query

This ensures the `pgcrypto` extension (used for `gen_random_uuid()`) is enabled and attempts to enable `uuid-ossp` if your project exposes it. You only need to run this once per project.

> If you're using `supabase db push` or `npm run setup:supabase`, the CLI runs this file automatically before the rest of the migrations.

### Step 4: Run Migration 001 (Database Schema)

1. Go to Supabase Dashboard → **SQL Editor**
2. Click **New query**
3. Open `supabase/migrations/001_initial_schema.sql`
4. Copy **ALL** contents (Ctrl+A, Ctrl+C)
5. Paste into SQL Editor
6. Click **Run** (or press Cmd/Ctrl+Enter)
7. Wait for completion (should see "Success. No rows returned")

**Expected Output:**
- Creates 8 tables: profiles, learning_preferences, plans, plan_lessons, episodes, sessions, day_entries, ai_jobs
- Sets up RLS policies
- Creates triggers
- Creates profile auto-creation function

### Step 5: Run Migration 002 (Storage Setup)

1. In SQL Editor, click **New query**
2. Open `supabase/migrations/002_storage_setup.sql`
3. Copy **ALL** contents
4. Paste into SQL Editor
5. Click **Run**

**Expected Output:**
- Creates `lesson-audio` storage bucket
- Sets up storage policies for user access

### Step 6: Verify Setup

1. Go to **Table Editor** - verify all 8 tables exist
2. Go to **Storage** - verify `lesson-audio` bucket exists
3. Go to **Authentication** → **Policies** - verify RLS policies are enabled

### Step 7: Test

Run the test script:

```bash
npm run test:supabase
```

## Troubleshooting

**Error: "relation already exists"**
- Some tables may already exist. You can either:
  - Drop existing tables and re-run migration
  - Or skip the CREATE TABLE statements for existing tables

**Error: "extension uuid-ossp does not exist"**
- Re-run `supabase/migrations/000_enable_extensions.sql` (it enables `pgcrypto` and tries to enable `uuid-ossp`)

**Error: "permission denied"**
- Ensure you're using the correct Supabase project
- Check that you have admin access to the project

**Storage bucket already exists**
- The migration uses `ON CONFLICT DO NOTHING`, so it's safe to re-run
- Or manually create the bucket in Storage → New bucket

## Quick Copy-Paste Commands

If you prefer command line, you can also use:

```bash
# View extension SQL
cat supabase/migrations/000_enable_extensions.sql

# View migration SQL
cat supabase/migrations/001_initial_schema.sql

# Copy to clipboard (macOS)
cat supabase/migrations/000_enable_extensions.sql | pbcopy
cat supabase/migrations/001_initial_schema.sql | pbcopy

# Copy to clipboard (Linux)
cat supabase/migrations/000_enable_extensions.sql | xclip -selection clipboard
cat supabase/migrations/001_initial_schema.sql | xclip -selection clipboard
```
