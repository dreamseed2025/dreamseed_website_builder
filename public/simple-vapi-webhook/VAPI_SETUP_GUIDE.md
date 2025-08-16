# VAPI API Key Setup Guide 🔑

## Step 1: Get Your VAPI Credentials

### 1.1 Login to VAPI Dashboard
1. Go to [https://vapi.ai](https://vapi.ai)
2. Login to your account (or create one if needed)

### 1.2 Get Your API Key
1. Navigate to **Settings** → **API Keys**
2. Copy your API key (starts with `sk-`)
   - Example: `sk-abc123def456...`

### 1.3 Get Your Agent ID
1. Navigate to **Agents** section
2. **Option A**: Create a new agent
   - Click "Create Agent"
   - Give it any name (e.g., "DreamSeed Dynamic Agent")
   - Set basic configuration (we'll override with dynamic prompts)
   - Copy the Agent ID
3. **Option B**: Use existing agent
   - Click on existing agent
   - Copy the Agent ID (looks like `agent_abc123...`)

## Step 2: Configure Your .env File

Replace the placeholder values in your `.env` file:

```bash
# Open your .env file and replace these values:
VAPI_API_KEY=your_actual_api_key_from_step_1.2
VAPI_AGENT_ID=your_actual_agent_id_from_step_1.3
VAPI_WEBHOOK_SECRET=optional_secret_for_webhook_security
```

### Example Configuration:
```bash
VAPI_API_KEY=sk-abc123def456ghi789jkl012mno345pqr678stu901vwx
VAPI_AGENT_ID=agent_64b8f9e2-1a2b-3c4d-5e6f-7890abcdef12
VAPI_WEBHOOK_SECRET=my_webhook_secret_123
```

## Step 3: Set Up Webhook URL in VAPI

### 3.1 Configure Webhook in VAPI Dashboard
1. Go to your Agent settings in VAPI dashboard
2. Find **Webhook URL** or **Server URL** field
3. Set it to: `http://your-domain.com/api/vapi-webhook`
   - For local testing: `http://localhost:3002/api/vapi-webhook`
   - For production: `https://yourdomain.com/api/vapi-webhook`

### 3.2 Webhook Events to Enable
Make sure these webhook events are enabled:
- ✅ `call.started` or `call-start`
- ✅ `transcript`
- ✅ `call.ended` or `call-end`
- ✅ `error` or `call.failed`

## Step 4: Test Configuration

### 4.1 Restart Your Server
```bash
# Kill current server
# Then restart
node server.js
```

### 4.2 Test Agent Update
```bash
curl -X POST http://localhost:3002/api/update-agent \
  -H "Content-Type: application/json" \
  -d '{"callStage": 1, "customerData": {"name": "Test User"}}'
```

If configured correctly, you should see:
```json
{"success": true, "callStage": 1, "updateResult": {...}}
```

If not configured, you'll see:
```json
{"error": "VAPI API error: 404 Not Found"}
```

### 4.3 Test Call Initiation
```bash
curl -X POST http://localhost:3002/api/start-call \
  -H "Content-Type: application/json" \
  -d '{
    "customerEmail": "test@example.com",
    "customerData": {
      "name": "Test User",
      "phone": "+1-555-123-4567"
    }
  }'
```

## Step 5: Production Deployment

### 5.1 For Production (Required)
You'll need a public webhook URL. Options:

**Option A: Use ngrok for testing**
```bash
# Install ngrok
npm install -g ngrok

# Start your server
node server.js

# In another terminal, expose it
ngrok http 3002

# Use the ngrok URL in VAPI webhook settings
# Example: https://abc123.ngrok.io/api/vapi-webhook
```

**Option B: Deploy to cloud**
- Deploy to Vercel, Railway, Heroku, etc.
- Use production URL in VAPI webhook settings

### 5.2 Update VAPI Webhook URL
In VAPI dashboard, set webhook URL to your public endpoint:
- `https://your-ngrok-url.ngrok.io/api/vapi-webhook`
- `https://your-production-domain.com/api/vapi-webhook`

## Step 6: Voice Configuration (Optional)

### 6.1 Update Voice Settings
Edit `dynamic-vapi-integration.js` to customize voice:

```javascript
voice: {
    provider: "11labs", // or "openai", "playht", etc.
    voiceId: "your-preferred-voice-id"
}
```

### 6.2 Popular Voice IDs
- **11Labs**: `ErXwobaYiN019PkySvjV` (Antoni)
- **OpenAI**: `alloy`, `echo`, `fable`, `onyx`, `nova`, `shimmer`

## ✅ Verification Checklist

- [ ] API key copied from VAPI dashboard
- [ ] Agent ID copied from VAPI dashboard  
- [ ] `.env` file updated with real values
- [ ] Server restarted after configuration
- [ ] Webhook URL set in VAPI dashboard
- [ ] Test API calls return success (not 404 errors)
- [ ] Ready to make real calls!

## 🚀 Quick Test Commands

```bash
# Test prompt generation (works without VAPI keys)
curl -X POST http://localhost:3002/api/test-prompt \
  -H "Content-Type: application/json" \
  -d '{"callStage": 1, "customerData": {"name": "Sarah"}}'

# Test agent update (needs VAPI keys)
curl -X POST http://localhost:3002/api/update-agent \
  -H "Content-Type: application/json" \
  -d '{"callStage": 1}'

# Start real call (needs VAPI keys + phone number)
curl -X POST http://localhost:3002/api/start-call \
  -H "Content-Type: application/json" \
  -d '{
    "customerEmail": "customer@example.com",
    "customerData": {
      "name": "Customer Name", 
      "phone": "+1-555-123-4567"
    }
  }'
```

## 🔧 Troubleshooting

### "404 Not Found" Error
- Check API key is correct
- Check Agent ID is correct
- Verify VAPI account has API access

### "Unauthorized" Error  
- API key is invalid or expired
- Check for typos in API key

### "Agent not found" Error
- Agent ID is incorrect
- Agent was deleted in VAPI dashboard

### Webhook Not Receiving Events
- Check webhook URL in VAPI dashboard
- Use ngrok for local testing
- Verify webhook events are enabled

Once configured, your system will dynamically change VAPI agent prompts for each call stage! 🎉