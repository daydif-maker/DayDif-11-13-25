# OAuth Provider Setup Guide

Complete guide for configuring Google and Apple OAuth in Supabase.

## Google OAuth Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a project** → **New Project**
3. Name: `DayDif` (or your preferred name)
4. Click **Create**
5. Wait for project creation, then select it

### Step 2: Enable Google+ API

1. In Google Cloud Console, go to **APIs & Services** → **Library**
2. Search for "Google+ API"
3. Click **Enable** (if not already enabled)
4. Also enable **Google Identity Services API**

### Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. If prompted, configure OAuth consent screen:
   - **User Type**: External (or Internal if using Google Workspace)
   - **App name**: DayDif
   - **User support email**: Your email
   - **Developer contact**: Your email
   - Click **Save and Continue**
   - Add scopes: `email`, `profile`, `openid`
   - Click **Save and Continue**
   - Add test users (optional)
   - Click **Save and Continue**
   - Review and **Back to Dashboard**

4. Create OAuth Client ID:
   - **Application type**: Web application
   - **Name**: DayDif Web Client
   - **Authorized redirect URIs**: 
     ```
     https://your-project-ref.supabase.co/auth/v1/callback
     ```
     (Replace `your-project-ref` with your actual Supabase project reference)
   - Click **Create**
   - **Copy the Client ID and Client Secret** (you'll need these)

### Step 4: Configure in Supabase

1. Go to Supabase Dashboard → **Authentication** → **Providers**
2. Find **Google** and click to expand
3. Toggle **Enable Google provider**
4. Paste:
   - **Client ID (for OAuth)**: Your Google Client ID
   - **Client secret (for OAuth)**: Your Google Client Secret
5. Click **Save**

### Step 5: Add Mobile Redirect URI

1. In Google Cloud Console, go back to **Credentials**
2. Edit your OAuth client
3. Under **Authorized redirect URIs**, add:
   ```
   daydif://auth/callback
   ```
4. Click **Save**

## Apple OAuth Setup

### Step 1: Create App ID

1. Go to [Apple Developer Portal](https://developer.apple.com/account/)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Click **Identifiers** → **+** (plus button)
4. Select **App IDs** → **Continue**
5. Select **App** → **Continue**
6. **Description**: DayDif
7. **Bundle ID**: `com.daydif.app` (must match your app.json)
8. Under **Capabilities**, check **Sign in with Apple**
9. Click **Continue** → **Register**

### Step 2: Create Services ID

1. In **Identifiers**, click **+** again
2. Select **Services IDs** → **Continue**
3. **Description**: DayDif Web
4. **Identifier**: `com.daydif.web` (or similar)
5. Click **Continue** → **Register**
6. Click on your new Services ID
7. Check **Sign in with Apple**
8. Click **Configure**
9. **Primary App ID**: Select your App ID (`com.daydif.app`)
10. **Website URLs**:
    - **Domains**: `your-project-ref.supabase.co`
    - **Return URLs**: 
      ```
      https://your-project-ref.supabase.co/auth/v1/callback
      ```
11. Click **Save** → **Continue** → **Save**

### Step 3: Create Key for Sign in with Apple

1. Go to **Keys** → **+** (plus button)
2. **Key Name**: DayDif Sign in with Apple
3. Check **Sign in with Apple**
4. Click **Configure**
5. Select your **Primary App ID**: `com.daydif.app`
6. Click **Save** → **Continue** → **Register**
7. **Download the key file** (.p8) - you can only download it once!
8. Note the **Key ID** shown

### Step 4: Get Your Team ID

1. In Apple Developer Portal, click your name (top right)
2. Your **Team ID** is shown (e.g., `ABC123DEF4`)

### Step 5: Configure in Supabase

1. Go to Supabase Dashboard → **Authentication** → **Providers**
2. Find **Apple** and click to expand
3. Toggle **Enable Apple provider**
4. Fill in:
   - **Services ID**: Your Services ID (e.g., `com.daydif.web`)
   - **Team ID**: Your Team ID
   - **Key ID**: The Key ID from Step 3
   - **Private Key**: Open the .p8 file you downloaded, copy the entire contents (including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`)
5. Click **Save**

## Configure Redirect URLs in Supabase

1. Go to Supabase Dashboard → **Authentication** → **URL Configuration**
2. Set **Site URL**: `daydif://`
3. Under **Redirect URLs**, add:
   ```
   daydif://auth/callback
   exp://localhost:8081/--/auth/callback
   ```
4. Click **Save**

## Testing OAuth

### Test Google OAuth

1. In your app, trigger Google sign-in
2. You should be redirected to Google sign-in page
3. After signing in, you should be redirected back to your app
4. Check Supabase Dashboard → **Authentication** → **Users** to see the new user

### Test Apple OAuth

1. In your app, trigger Apple sign-in
2. You should see Apple sign-in prompt
3. After signing in, you should be redirected back to your app
4. Check Supabase Dashboard → **Authentication** → **Users** to see the new user

## Troubleshooting

### Google OAuth Issues

**Error: "redirect_uri_mismatch"**
- Verify redirect URI in Google Cloud Console matches exactly:
  - `https://your-project-ref.supabase.co/auth/v1/callback`
- Check redirect URI in Supabase Dashboard matches

**Error: "invalid_client"**
- Verify Client ID and Client Secret are correct
- Check that OAuth consent screen is configured

### Apple OAuth Issues

**Error: "invalid_client"**
- Verify Services ID, Team ID, Key ID are correct
- Check that Private Key is copied correctly (including headers/footers)
- Ensure the key hasn't expired

**Error: "redirect_uri_mismatch"**
- Verify Return URLs in Apple Developer Portal match Supabase callback URL
- Check redirect URLs in Supabase Dashboard

### General Issues

**Deep link not working**
- Verify `app.json` has `"scheme": "daydif"`
- For iOS: Ensure bundle identifier matches Apple App ID
- For Android: May need to configure intent filters

**OAuth works on web but not mobile**
- Check redirect URLs include mobile scheme: `daydif://auth/callback`
- Verify deep linking is configured in your app

## Security Notes

- Never commit OAuth credentials to git
- Store credentials securely (use environment variables for production)
- Rotate keys periodically
- Use different OAuth clients for development and production

