# How to Test & Fix Google OAuth Issue

## The Problem
You're stuck on "Completing sign in..." because Supabase is not creating a session after Google OAuth.

## Root Cause
The OAuth callback URL in your Supabase dashboard doesn't match `http://localhost:5173/auth/callback`

## Step-by-Step Fix

### 1. Open Supabase Dashboard
Go to: https://supabase.com/dashboard/project/hmteesodbdvdursgdfox

### 2. Navigate to Authentication Settings
- Click on **Authentication** in the left sidebar
- Click on **Providers** 
- Click on **Google** (or go to URL Configuration)

### 3. Configure Redirect URLs
You need to add the EXACT redirect URL:

```
http://localhost:5173/auth/callback
```

**IMPORTANT**: The URL must match EXACTLY:
- ✅ `http://localhost:5173/auth/callback` (CORRECT)
- ❌ `http://localhost:5173/account` (WRONG - this was your old setting)
- ❌ `http://localhost:5173/auth/callback/` (WRONG - trailing slash)
- ❌ `https://localhost:5173/auth/callback` (WRONG - https instead of http)

### 4. Also Check Google Provider Settings
In Supabase Dashboard → Authentication → Providers → Google:
- Make sure "Enabled" is toggled ON
- Client ID should be from Google Cloud Console
- Client Secret should be from Google Cloud Console

### 5. Save and Wait
After saving, wait 30 seconds for changes to propagate.

### 6. Test Again
1. Clear your browser cache and cookies
2. Go to `http://localhost:5173/login`
3. Click "Continue with Google"
4. Complete Google login
5. Watch the browser console (F12)

## What You Should See in Console

**If SUCCESSFUL:**
```
=== AUTH CALLBACK PROCESSING STARTED ===
✓ OAuth tokens detected in URL
Waiting for Supabase to create session...
✅ SUCCESS at attempt 1!
Session user: your-email@gmail.com
```

**If STILL FAILING:**
```
❌ FAILED: No session created after 10 seconds
```
This means the redirect URL is still wrong or Google OAuth credentials are incorrect.

## Quick Test Command

Run this in your browser console immediately after OAuth redirect:
```javascript
const { data } = await fetch('https://hmteesodbdvdursgdfox.supabase.co/auth/v1/settings').then(r => r.json());
console.log('Supabase Auth Settings:', data);
```

## Still Not Working?

1. **Check browser console for the exact error**
2. **Verify the URL after Google redirect** - it should be exactly:
   `http://localhost:5173/auth/callback#access_token=...`
3. **Check Supabase logs**: Dashboard → Logs → Auth
4. **Try incognito mode** to rule out cache issues

## Common Mistakes

1. **Wrong port**: Using 5174 instead of 5173
2. **Wrong path**: Using `/account` instead of `/auth/callback`
3. **Missing http/https**: Must be `http://` for localhost
4. **Trailing slash**: Don't add `/` at the end
5. **Multiple URLs**: You can add multiple redirect URLs, add both:
   - `http://localhost:5173/auth/callback`
   - `http://localhost:5173` (as fallback)
