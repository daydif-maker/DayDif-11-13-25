# Supabase Setup Guide

This guide will help you set up your Supabase project for DayDif, including running migrations, configuring OAuth, and setting up storage.

## Prerequisites

1. **Supabase Account**: Create an account at [supabase.com](https://supabase.com)
2. **Supabase Project**: Create a new project in the Supabase Dashboard
3. **Supabase CLI**: Install globally (if not already installed)
   ```bash
   npm install -g supabase
   ```
4. **Environment Variables**: Create a `.env` file in the project root:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your-project-url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

## Step 1: Link Your Supabase Project

If you're using Supabase CLI for local development:

```bash
supabase link --project-ref your-project-ref
```

Or you can run migrations directly in the Supabase Dashboard (recommended for production).

## Step 2: Run Database Migrations

### Extension prerequisite (run this first)

Before running the main schema migration, make sure the helper extensions exist:

1. Open `supabase/migrations/000_enable_extensions.sql`
2. Copy/paste the SQL into the Supabase SQL Editor
3. Run it once — this enables `pgcrypto` (needed for `gen_random_uuid()`) and tries to enable `uuid-ossp` if Supabase exposes it

> 💡 If you use `npm run setup:supabase` or `supabase db push`, this step runs automatically because the CLI applies all migrations in order.

### Option A: Using Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Open `supabase/migrations/001_initial_schema.sql`
4. Copy the entire contents
5. Paste into the SQL Editor
6. Click **Run** to execute the migration

### Option B: Using Supabase CLI

```bash
npm run setup:supabase
```

This applies all SQL files in `supabase/migrations` (starting with `000_enable_extensions.sql`). If it fails, run each file manually via the Dashboard.

### Step 2b: Set Up Storage Bucket

1. Go to **SQL Editor** in Supabase Dashboard
2. Open `supabase/migrations/002_storage_setup.sql`
3. Copy and run the SQL

Alternatively, you can create the bucket manually:

1. Go to **Storage** in Supabase Dashboard
2. Click **New bucket**
3. Name: `lesson-audio`
4. Public: **No** (private bucket)
5. File size limit: 50MB
6. Allowed MIME types: `audio/mpeg`, `audio/mp3`, `audio/wav`, `audio/m4a`, `audio/ogg`

Then add the storage policies from `002_storage_setup.sql` via the **Storage Policies** section.

## Step 3: Configure OAuth Providers

### Google OAuth Setup

1. Go to **Authentication** → **Providers** in Supabase Dashboard
2. Enable **Google**
3. Get your credentials from [Google Cloud Console](https://console.cloud.google.com/):
   - Create a new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs:
     - `https://your-project-ref.supabase.co/auth/v1/callback`
     - `daydif://auth/callback` (for mobile app)
4. Copy **Client ID** and **Client Secret** to Supabase Dashboard
5. Save

### Apple OAuth Setup

1. Go to **Authentication** → **Providers** in Supabase Dashboard
2. Enable **Apple**
3. Get your credentials from [Apple Developer Portal](https://developer.apple.com/):
   - Create a new App ID
   - Create a Services ID
   - Configure Sign in with Apple
   - Add redirect URLs:
     - `https://your-project-ref.supabase.co/auth/v1/callback`
     - `daydif://auth/callback` (for mobile app)
4. Copy **Services ID**, **Team ID**, **Key ID**, and **Private Key** to Supabase Dashboard
5. Save

### Configure Redirect URLs

In Supabase Dashboard → **Authentication** → **URL Configuration**:

- **Site URL**: `daydif://`
- **Redirect URLs**: Add:
  - `daydif://auth/callback`
  - `exp://localhost:8081/--/auth/callback` (for Expo development)

## Step 4: Test Your Setup

Run the test script to verify everything is working:

```bash
npm run test:supabase
```

This will test:
- ✅ Database connection
- ✅ User sign up
- ✅ Profile creation (automatic trigger)
- ✅ User sign in
- ✅ Data CRUD operations
- ✅ Storage bucket access
- ✅ User sign out

## Step 5: Verify Database Schema

After running migrations, verify the following tables exist:

- `profiles`
- `learning_preferences`
- `plans`
- `plan_lessons`
- `episodes`
- `sessions`
- `day_entries`
- `ai_jobs`

You can check this in **Table Editor** in Supabase Dashboard.

## Step 6: Verify Row Level Security (RLS)

All tables should have RLS enabled. Check in **Authentication** → **Policies**:

- Each table should have policies for SELECT, INSERT, UPDATE, DELETE
- All policies should check `auth.uid() = user_id`

## Troubleshooting

### Migration Fails

- Check that you have the correct permissions
- Re-run `supabase/migrations/000_enable_extensions.sql` to ensure `pgcrypto` (and `uuid-ossp` if available) is installed
- Verify no conflicting tables exist

### Storage Bucket Not Found

- Ensure you've run `002_storage_setup.sql`
- Check that the bucket name is exactly `lesson-audio`
- Verify storage policies are created

### OAuth Not Working

- Verify redirect URLs match exactly
- Check that OAuth credentials are correct
- Ensure the provider is enabled in Supabase Dashboard
- For mobile: Verify deep linking is configured in `app.json`

### Test Script Fails

- Check environment variables are set correctly
- Verify database migrations have run successfully
- Ensure storage bucket exists
- Check Supabase project is active and accessible

## Next Steps

After setup is complete:

1. Update your `.env` file with production credentials
2. Test authentication flow in your app
3. Test data operations (create plan, lessons, etc.)
4. Test audio file uploads to storage
5. Configure any additional Supabase features you need

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Supabase Storage Guide](https://supabase.com/docs/guides/storage)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
