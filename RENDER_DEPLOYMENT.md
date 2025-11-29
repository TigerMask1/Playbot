# 🚀 Deploy PlayBot to Render (Complete Guide)

## Why Render?

✅ Free tier available  
✅ Automatic deployments from GitHub  
✅ Always-on hosting (24/7)  
✅ Custom domain support  
✅ Environment variables management  
✅ SSL/TLS included  

---

## Prerequisites

1. **GitHub Account** - Repo must be on GitHub
2. **MongoDB Atlas Account** - For MongoDB URI
3. **Discord Bot Token** - From Discord Developer Portal
4. **Render Account** - Free at render.com

---

## Step 1: Prepare Your Repository

### Make sure your repo has:
```
✅ package.json
✅ src/main.js
✅ .env (with environment variables)
✅ .gitignore (with .env!)
```

### Check .gitignore has these:
```
node_modules/
.env
.DS_Store
*.log
```

**Never commit secrets to GitHub!**

---

## Step 2: Get Your Environment Variables

### From Discord Developer Portal:
1. Go to https://discord.com/developers/applications
2. Select your app
3. Copy: `CLIENT_ID`, `CLIENT_SECRET`, `BOT_TOKEN`

### From MongoDB Atlas:
1. Go to https://www.mongodb.com/cloud/atlas
2. Create cluster
3. Copy: Connection string (your `MONGODB_URI`)

### Generate SESSION_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**You now have:**
- DISCORD_BOT_TOKEN ✅
- DISCORD_CLIENT_ID ✅
- DISCORD_CLIENT_SECRET ✅
- MONGODB_URI ✅
- SESSION_SECRET ✅

---

## Step 3: Deploy to Render

### 3a. Create New Web Service
```
1. Go to https://render.com
2. Sign up/login
3. Click "New +"
4. Select "Web Service"
5. Connect GitHub (authorize Render)
```

### 3b. Select Repository
```
1. Search your "playbot" repo
2. Click "Connect"
3. Fill in service details:

Name: playbot
Environment: Node
Branch: main
```

### 3c. Build Settings
```
Build Command: npm install
Start Command: node src/main.js
```

### 3d. Add Environment Variables
**Click "Add Environment Variable" for each:**

| Variable | Value |
|----------|-------|
| DISCORD_BOT_TOKEN | Your bot token |
| DISCORD_CLIENT_ID | Your client ID |
| DISCORD_CLIENT_SECRET | Your client secret |
| MONGODB_URI | Your MongoDB connection string |
| SESSION_SECRET | Generated random string |
| PORT | 5000 |
| NODE_ENV | production |

### 3e. Deploy!
```
1. Click "Create Web Service"
2. Wait for build (5-10 minutes)
3. See live URL: https://playbot-[random].onrender.com
```

---

## Step 4: Configure Discord Redirect URI

### Add to Discord Developer Portal:
```
REDIRECT_URI: https://playbot-[random].onrender.com/api/auth/callback
```

**Steps:**
1. Go to Discord Developer Portal
2. Your app → OAuth2 → Redirects
3. Add redirect URL
4. Save

---

## Step 5: Update Bot Invite URL

### Discord Bot Invite:
```
https://discord.com/api/oauth2/authorize?
client_id=YOUR_CLIENT_ID&
permissions=8&
scope=bot
```

**Replace:** `YOUR_CLIENT_ID` with your actual ID

---

## Step 6: Verify Deployment

### Check if running:
```
1. Go to https://playbot-[random].onrender.com
2. Should see login page
3. Login with Discord
4. Select server
5. Customize features
```

### Check logs:
```
In Render dashboard:
1. Select your service
2. Click "Logs"
3. See startup messages:
   - "Connected to MongoDB"
   - "Dashboard running"
   - "Discord Bot connected"
```

---

## Troubleshooting

### Service won't start?
```
❌ Problem: Build fails
✅ Solution: 
   1. Check npm install succeeded
   2. Check node_modules exists
   3. Check package.json has all deps

❌ Problem: MongoDB connection fails
✅ Solution:
   1. Verify MONGODB_URI is correct
   2. Add Render IP to MongoDB allowlist:
      - MongoDB Atlas → Network Access
      - Add: 0.0.0.0/0 (allow all)
      - Or specific Render IP

❌ Problem: Discord OAuth fails
✅ Solution:
   1. Verify REDIRECT_URI in Discord app
   2. Check CLIENT_ID matches
   3. Check CLIENT_SECRET is correct

❌ Problem: Still not working?
✅ Solution:
   1. Check Render logs for error messages
   2. Restart service (click Restart)
   3. Check environment variables are set
```

---

## Ongoing Management

### View Logs:
```
Render Dashboard → Your Service → Logs
See all errors and status messages
```

### Restart Service:
```
Render Dashboard → Your Service → Restart
When you need to restart after changes
```

### Update Code:
```
1. Push changes to GitHub
2. Render auto-redeploys
3. See new version live in minutes
```

### Monitor Health:
```
Render Dashboard shows:
- Memory usage
- CPU usage
- Response time
```

---

## Custom Domain (Optional)

To use your own domain instead of `playbot-xxx.onrender.com`:

```
1. In Render dashboard
2. Go to Settings
3. Custom Domain
4. Enter your domain
5. Update DNS records (Render will show instructions)
```

---

## Free Tier Limitations

✅ **Included:**
- 750 free tier hours/month
- ~24/7 uptime (24hrs/month free)
- 0.5 GB memory
- 500 MB disk
- Automatic SSL

⚠️ **Limitations:**
- Service spins down after 15 mins of no traffic
- Limited memory/CPU
- No custom domain on free tier

💡 **Upgrade to Pro ($7/month) for:**
- Always-on (never spins down)
- More memory/CPU
- Custom domain
- 5x performance

---

## Deployment Checklist

- [ ] GitHub repo created and pushed
- [ ] All secrets in .gitignore
- [ ] MongoDB Atlas account created
- [ ] Discord app configured
- [ ] Render account created
- [ ] Environment variables noted
- [ ] Service created on Render
- [ ] Build succeeded
- [ ] Logs show no errors
- [ ] Dashboard accessible at URL
- [ ] Discord OAuth works
- [ ] Bot commands work
- [ ] Can customize from dashboard

---

## Success!

Once deployed, your PlayBot is:
- 🌐 **Live on internet** at https://playbot-[name].onrender.com
- 🤖 **Discord bot connected** and listening for commands
- 🗄️ **MongoDB connected** for data persistence
- 📊 **Dashboard accessible** for customization
- 👥 **Multi-server ready** - Invite to unlimited Discord servers

**Congratulations! Your platform is production-ready!** 🎉

---

## Next Steps

1. ✅ Verify dashboard works
2. ✅ Invite bot to your Discord server
3. ✅ Tell admins to customize via dashboard
4. ✅ Users use !help for bot commands
5. ✅ Monitor logs for any issues
6. ✅ Upgrade to Pro when you scale

---

## Support

**Render Issues?** → https://render.com/docs  
**Discord Issues?** → https://discord.com/developers  
**MongoDB Issues?** → https://docs.mongodb.com  

Your PlayBot is ready for the world! 🚀
