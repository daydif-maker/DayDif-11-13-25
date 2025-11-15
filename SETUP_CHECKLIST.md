# Supabase Setup Checklist

Use this checklist to track your Supabase setup progress.

## ✅ Prerequisites

- [ ] Supabase account created
- [ ] Supabase project created
- [ ] Project URL and API keys obtained

## ✅ Environment Configuration

- [ ] `.env` file created in project root
- [ ] `EXPO_PUBLIC_SUPABASE_URL` set to your project URL
- [ ] `EXPO_PUBLIC_SUPABASE_ANON_KEY` set to your anon key
- [ ] Run `npm run verify:supabase` to check configuration

## ✅ Database Migrations

- [ ] Extension migration (`000_enable_extensions.sql`) run in SQL Editor
  - [ ] `pgcrypto` available (gen_random_uuid() works)
  - [ ] `uuid-ossp` enabled if Supabase exposes it
- [ ] Migration 001 (`001_initial_schema.sql`) run in SQL Editor
  - [ ] All 8 tables created
  - [ ] RLS policies enabled
  - [ ] Triggers created
  - [ ] Profile auto-creation function working
- [ ] Migration 002 (`002_storage_setup.sql`) run in SQL Editor
  - [ ] `lesson-audio` bucket created
  - [ ] Storage policies configured

## ✅ Storage Setup

- [ ] Storage bucket `lesson-audio` exists
- [ ] Bucket is private (not public)
- [ ] Storage policies allow users to:
  - [ ] Upload their own files
  - [ ] Read their own files
  - [ ] Update their own files
  - [ ] Delete their own files

## ✅ OAuth Configuration

### Google OAuth
- [ ] Google Cloud project created
- [ ] Google+ API enabled
- [ ] OAuth 2.0 credentials created
- [ ] Redirect URIs configured:
  - [ ] `https://your-project-ref.supabase.co/auth/v1/callback`
  - [ ] `daydif://auth/callback`
- [ ] Google provider enabled in Supabase
- [ ] Client ID and Secret configured

### Apple OAuth
- [ ] Apple Developer account (if needed)
- [ ] App ID created with Sign in with Apple
- [ ] Services ID created
- [ ] Key created for Sign in with Apple
- [ ] Private key downloaded (.p8 file)
- [ ] Apple provider enabled in Supabase
- [ ] Services ID, Team ID, Key ID, and Private Key configured

### Redirect URLs
- [ ] Site URL set to `daydif://`
- [ ] Redirect URLs configured:
  - [ ] `daydif://auth/callback`
  - [ ] `exp://localhost:8081/--/auth/callback`

## ✅ Verification

- [ ] Run `npm run verify:supabase` - all checks pass
- [ ] Run `npm run test:supabase` - all tests pass
- [ ] Database connection works
- [ ] User sign up works
- [ ] User sign in works
- [ ] Profile auto-creation works
- [ ] Data CRUD operations work
- [ ] Storage bucket access works
- [ ] OAuth sign in works (Google)
- [ ] OAuth sign in works (Apple)

## ✅ App Configuration

- [ ] `app.json` has `"scheme": "daydif"` configured
- [ ] Deep linking configured for iOS (if applicable)
- [ ] Deep linking configured for Android (if applicable)

## 📝 Notes

- Migration files location: `supabase/migrations/`
- Test script: `npm run test:supabase`
- Verify script: `npm run verify:supabase`
- Documentation: See `SUPABASE_SETUP.md` and `SUPABASE_QUICK_START.md`

## 🆘 Need Help?

- Check `SUPABASE_SETUP.md` for detailed instructions
- Check `SUPABASE_QUICK_START.md` for quick reference
- Check `scripts/migration-instructions.md` for migration help
- Check `scripts/oauth-setup-guide.md` for OAuth help
