# 🔧 Fix Discord OAuth2 Redirect URI Error

## The Problem
Discord is rejecting your login because the redirect URI doesn't match what's configured in your Discord app.

## Quick Fix (3 Steps)

### Step 1: Get Your Redirect URI
**For Localhost (Development):**
```
http://localhost:5000/api/auth/callback
```

**For Render (Production):**
```
https://playbot-[your-random-name].onrender.com/api/auth/callback
```

### Step 2: Add to Discord App
1. Go to https://discord.com/developers/applications
2. Select your app
3. Go to **OAuth2 → Redirects**
4. Click **Add Redirect**
5. Paste your redirect URI:
   ```
   http://localhost:5000/api/auth/callback
   ```
6. **Save Changes**

### Step 3: Restart Dashboard
```
In Replit:
1. Stop the workflow
2. Wait 2 seconds
3. Restart workflow
4. Try login again
```

---

## Complete Discord OAuth2 Setup

### In Discord Developer Portal:

**OAuth2 → Redirects**
```
Add these URIs:
- http://localhost:5000/api/auth/callback (DEV)
- https://playbot-[name].onrender.com/api/auth/callback (PROD)
```

**OAuth2 → General**
```
✅ Client ID: [Already set in secrets]
✅ Client Secret: [Already set in secrets]
✅ Redirect URIs: [Add above]
```

**Authorization → Default Authorization Link**
```
Scopes: identify email guilds
Permissions: Administrator
```

---

## Troubleshooting

**Still getting invalid redirect error?**

1. **Check exact match:**
   - Discord config: `http://localhost:5000/api/auth/callback`
   - Environment variable: Set correctly ✅
   - Code uses it: Yes ✅

2. **Common mistakes:**
   - ❌ Typo in URI (missing /api/auth/callback)
   - ❌ Using HTTPS when should be HTTP (localhost)
   - ❌ Extra spaces or characters
   - ❌ Using old Discord app instead of new one

3. **Fix:**
   - Go to Discord app again
   - Delete wrong redirect
   - Add exact URI from Step 1
   - Save
   - Restart bot

---

## For Render Deployment

When you deploy to Render:

1. **Render gives you a URL:**
   ```
   https://playbot-abc123def456.onrender.com
   ```

2. **Add to Discord:**
   ```
   https://playbot-abc123def456.onrender.com/api/auth/callback
   ```

3. **Add to Render environment variables:**
   ```
   DISCORD_REDIRECT_URI=https://playbot-abc123def456.onrender.com/api/auth/callback
   ```

4. **Restart service**

---

## Working Login Flow

1. ✅ User clicks "Login with Discord"
2. ✅ Redirected to Discord OAuth page
3. ✅ User grants permissions
4. ✅ Discord redirects back to YOUR redirect URI
5. ✅ PlayBot receives code
6. ✅ Dashboard loads with server selector

---

## Environment Variables Set ✅

```
DISCORD_REDIRECT_URI=http://localhost:5000/api/auth/callback
```

**This is now configured for local development.**

When you deploy to Render, update this to your Render domain.

---

## Try Again!

1. ✅ Updated environment variable
2. ✅ Discord app configured
3. ✅ Restart workflow
4. **Test login now**

If still failing, check Discord app has exact redirect URI!
