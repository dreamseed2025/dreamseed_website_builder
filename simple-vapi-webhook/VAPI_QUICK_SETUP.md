# 🚀 VAPI Quick Setup Guide (5 Minutes)

## 📋 **What You Need to Do:**

### **Step 1: Open VAPI Dashboard**
- Go to your VAPI dashboard
- Find your 4 agents (or create 4 new ones)

### **Step 2: Configure Agent 1**
**Agent Name:** `DreamSeed Call 1 - Foundation & Vision`

**Webhook URL:** 
```
http://localhost:3002/api/vapi-webhook
```

**Webhook Payload:**
```json
{
  "type": "transcript",
  "callStage": 1,
  "customerEmail": "{{customer_email}}",
  "callId": "{{call_id}}",
  "transcript": "{{transcript}}"
}
```

**System Prompt:** Copy the ENTIRE content from:
`/Users/morganwalker/DreamSeed/simple-vapi-webhook/vapi-agent-configs/call-1-agent-prompt.md`

### **Step 3: Configure Agent 2**
**Agent Name:** `DreamSeed Call 2 - Brand DNA & Market`

**Webhook URL:** 
```
http://localhost:3002/api/vapi-webhook
```

**Webhook Payload:**
```json
{
  "type": "transcript",
  "callStage": 2,
  "customerEmail": "{{customer_email}}",
  "callId": "{{call_id}}",
  "transcript": "{{transcript}}"
}
```

**System Prompt:** Copy the ENTIRE content from:
`/Users/morganwalker/DreamSeed/simple-vapi-webhook/vapi-agent-configs/call-2-agent-prompt.md`

### **Step 4: Configure Agent 3**
**Agent Name:** `DreamSeed Call 3 - Operations & Implementation`

**Webhook URL:** 
```
http://localhost:3002/api/vapi-webhook
```

**Webhook Payload:**
```json
{
  "type": "transcript",
  "callStage": 3,
  "customerEmail": "{{customer_email}}",
  "callId": "{{call_id}}",
  "transcript": "{{transcript}}"
}
```

**System Prompt:** Copy the ENTIRE content from:
`/Users/morganwalker/DreamSeed/simple-vapi-webhook/vapi-agent-configs/call-3-agent-prompt.md`

### **Step 5: Configure Agent 4**
**Agent Name:** `DreamSeed Call 4 - Launch Strategy & Support`

**Webhook URL:** 
```
http://localhost:3002/api/vapi-webhook
```

**Webhook Payload:**
```json
{
  "type": "transcript",
  "callStage": 4,
  "customerEmail": "{{customer_email}}",
  "callId": "{{call_id}}",
  "transcript": "{{transcript}}"
}
```

**System Prompt:** Copy the ENTIRE content from:
`/Users/morganwalker/DreamSeed/simple-vapi-webhook/vapi-agent-configs/call-4-agent-prompt.md`

## ✅ **After Setup:**

### **Test Your First Call:**
1. Call Agent 1 
2. It should ask systematic business formation questions
3. After the call, check: `http://localhost:3002/info-tracker.html`
4. Enter the customer email to see progress tracking

### **What Each Agent Will Do:**
- **Agent 1**: Asks about contact info, business concept, LLC basics
- **Agent 2**: Asks about brand personality, colors, competitive advantage  
- **Agent 3**: Asks about business location, banking, compliance, technology
- **Agent 4**: Asks about launch date, marketing strategy, revenue goals

### **Customer Journey:**
Call 1 → Call 2 → Call 3 → Call 4 = Complete business formation plan

## 🎯 **That's It!**

After this 5-minute setup, your calls will work end-to-end with:
- ✅ Systematic question asking
- ✅ Automatic data extraction  
- ✅ Customer progress tracking
- ✅ Professional business formation planning

**Your DreamSeed voice AI will be fully operational!** 🚀