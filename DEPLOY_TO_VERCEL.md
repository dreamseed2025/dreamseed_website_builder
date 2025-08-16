# 🚀 Deploy to Vercel - Get HTTPS for Voice Calls

## Quick Deploy Steps

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Deploy Your App
```bash
# From this directory
cd /Users/morganwalker/DreamSeed/simple-vapi-webhook

# Deploy to Vercel
vercel

# You'll be asked:
# - Set up and deploy? Y
# - Which scope? (choose your account)
# - Link to existing project? N
# - Project name? dreamseed-vapi (or press enter for default)
# - Directory? ./ (press enter)
# - Override settings? N
```

### 3. Set Environment Variables
After deployment, add your environment variables in Vercel:

```bash
# Option 1: Via CLI
vercel env add VAPI_PUBLIC_KEY
vercel env add VAPI_PRIVATE_KEY
vercel env add SUPABASE_URL
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add SUPABASE_ANON_KEY
vercel env add AUTH_TEST_MODE

# Option 2: Via Dashboard
# Go to: https://vercel.com/your-username/your-project/settings/environment-variables
```

Add these values:
```
VAPI_PUBLIC_KEY=360c27df-9f83-4b80-bd33-e17dbcbf4971
VAPI_PRIVATE_KEY=3359a2eb-02e4-4f31-a5aa-37c2a020a395
SUPABASE_URL=<your_supabase_url>
SUPABASE_SERVICE_ROLE_KEY=<your_supabase_key>
SUPABASE_ANON_KEY=<your_supabase_anon_key>
AUTH_TEST_MODE=true
```

### 4. Redeploy with Environment Variables
```bash
# Redeploy to apply environment variables
vercel --prod
```

## 🎯 Your HTTPS URLs

After deployment, you'll get URLs like:
- Production: `https://dreamseed-vapi.vercel.app`
- Preview: `https://dreamseed-vapi-abc123.vercel.app`

## 📞 Test Voice Calls

Visit these pages on your HTTPS domain:

1. **VAPI Widget (Recommended)**
   ```
   https://your-app.vercel.app/web-voice-widget.html
   ```
   This should now work with full voice capabilities!

2. **Alternative Voice Interfaces**
   ```
   https://your-app.vercel.app/vapi-voice-final.html
   https://your-app.vercel.app/web-voice-natural.html
   ```

3. **Customer Dashboard**
   ```
   https://your-app.vercel.app/customer-dashboard.html
   ```

## ✅ What Works with HTTPS

- ✅ **Microphone access** - Browser allows it on HTTPS
- ✅ **VAPI voice calls** - Full natural conversation
- ✅ **Web Speech API** - Browser voice recognition
- ✅ **Secure cookies** - Authentication works properly
- ✅ **Service workers** - If you add PWA features

## 🔧 Troubleshooting

If voice still doesn't work after HTTPS deployment:

1. **Check browser console** for errors
2. **Verify microphone permissions** are granted
3. **Test in Chrome/Edge** (best WebRTC support)
4. **Check VAPI dashboard** to confirm assistant is configured for web calls

## 📱 Alternative: Quick Test with ngrok

If you want to test before deploying:
```bash
# Install ngrok
brew install ngrok

# Start your local server
node server.js

# In another terminal
ngrok http 3002

# Use the HTTPS URL provided by ngrok
```

## 🎉 Success!

Once deployed with HTTPS, your VAPI voice calls should work perfectly - just like the VAPI dashboard experience!

---

**Ready?** Run `vercel` now to deploy!