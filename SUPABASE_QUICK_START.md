# Supabase Quick Start

Quick reference for setting up Supabase for DayDif.

## 🚀 Quick Setup (5 minutes)

### 1. Get Your Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project (or create a new one)
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `EXPO_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `EXPO_PUBLIC_SUPABASE_ANON_KEY`

### 2. Set Environment Variables

Create `.env` file in project root:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Run Database Migrations

**Option A: Via Supabase Dashboard (Recommended)**
1. Go to **SQL Editor**
2. Copy/paste contents of `supabase/migrations/001_initial_schema.sql`
3. Click **Run**
4. Copy/paste contents of `supabase/migrations/002_storage_setup.sql`
5. Click **Run**

**Option B: Via CLI**
```bash
npm run setup:supabase
```

### 4. Configure OAuth (Google/Apple)

**Google:**
1. **Authentication** → **Providers** → Enable **Google**
2. Get credentials from [Google Cloud Console](https://console.cloud.google.com/)
3. Add redirect URI: `https://your-project.supabase.co/auth/v1/callback`
4. Add mobile redirect: `daydif://auth/callback`

**Apple:**
1. **Authentication** → **Providers** → Enable **Apple**
2. Get credentials from [Apple Developer Portal](https://developer.apple.com/)
3. Add same redirect URIs as Google

**Configure Redirect URLs:**
- **Authentication** → **URL Configuration**
- **Site URL**: `daydif://`
- **Redirect URLs**: 
  - `daydif://auth/callback`
  - `exp://localhost:8081/--/auth/callback`

### 5. Test Everything

```bash
npm run test:supabase
```

## ✅ Checklist

- [ ] Environment variables set in `.env`
- [ ] Database migrations run (`000_enable_extensions.sql` + `001_initial_schema.sql` + `002_storage_setup.sql`)
- [ ] Storage bucket `lesson-audio` created
- [ ] OAuth providers configured (Google/Apple)
- [ ] Redirect URLs configured
- [ ] Test script passes all checks

## 📚 Full Documentation

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed instructions.

## 🆘 Troubleshooting

**Migration fails?**
- Run SQL manually in Supabase Dashboard SQL Editor
- Run `supabase/migrations/000_enable_extensions.sql` to ensure `pgcrypto` (and optionally `uuid-ossp`) exists

**OAuth not working?**
- Verify redirect URLs match exactly
- Check credentials are correct
- Ensure provider is enabled

**Test script fails?**
- Verify `.env` file exists and has correct values
- Check migrations have run successfully
- Ensure storage bucket exists

## 🔗 Useful Links

- [Supabase Dashboard](https://app.supabase.com)
- [Supabase Docs](https://supabase.com/docs)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Apple Developer Portal](https://developer.apple.com/)
