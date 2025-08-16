# 🌱 Simple Vapi Webhook Server

**The EASIEST way to capture your Vapi voice AI calls!**

Just 3 steps:
1. Run the server
2. Set webhook URL in Vapi
3. Watch your calls appear in the dashboard

## 🚀 Quick Start

```bash
cd simple-vapi-webhook
npm install
npm start
```

**Done!** 

- 📊 **Dashboard**: http://localhost:3000
- 📞 **Webhook**: http://localhost:3000/webhook

## 📋 Setup Your Vapi Assistants

In your Vapi dashboard, set webhook URL for all 4 assistants:

**Local Development:**
```
http://localhost:3000/webhook
```

**Production (use ngrok):**
```bash
ngrok http 3000
# Use the https URL ngrok gives you
```

## ✨ What It Does

- **Captures ALL calls** from your 4 Vapi assistants automatically
- **Extracts key data** like customer name, email, business name, state, package
- **Shows live dashboard** with stats and call history
- **Saves everything** to a simple JSON file
- **No complex setup** - just Node.js required!

## 📊 Dashboard Features

- ✅ Total calls and customers
- ✅ Revenue tracking by package ($999/$1799/$3499)
- ✅ Complete call history with extracted data
- ✅ Auto-refreshes every 30 seconds
- ✅ Beautiful UI matching your DreamSeed branding

## 🔧 Your Assistant IDs

The system automatically detects which call is which:

- **Call 1**: `5ef9abf6-66b4-4457-9848-ee5436d6191f` - Business concept
- **Call 2**: `eb760659-21ba-4f94-a291-04f0897f0328` - Legal formation  
- **Call 3**: `65ddc60b-b813-49b6-9986-38ee2974cfc9` - Banking/operations
- **Call 4**: `af397e88-c286-416f-9f74-e7665401bdb7` - Website/marketing

## 📁 Files

- `server.js` - Simple webhook server (100 lines!)
- `index.html` - Beautiful dashboard
- `calls-data.json` - Your call data (auto-created)
- `package.json` - Dependencies

## 🌐 Deploy to Production

**Option 1: ngrok (Easiest)**
```bash
npm install -g ngrok
ngrok http 3000
# Use the https URL in Vapi
```

**Option 2: Any cloud service**
- Deploy to Heroku, Railway, Vercel, etc.
- Just upload these files and run `npm start`

**Super simple compared to the complex Supabase setup!** 🎉