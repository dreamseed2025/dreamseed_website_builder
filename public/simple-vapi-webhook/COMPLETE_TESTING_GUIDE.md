# Complete Testing & Monitoring Guide 🚀

## Overview
Your dynamic VAPI system now includes comprehensive testing and monitoring capabilities across all 4 call stages.

## ✅ What's Been Implemented

### 1. Dynamic VAPI System
- **Single agent** that changes prompts per call stage
- **Customer data personalization** in prompts
- **Automatic stage progression** based on completion
- **API-driven configuration** changes

### 2. Real-time Monitoring System
- **Live call tracking** with WebhookMonitor class
- **Stage-specific analytics** and metrics
- **Customer journey mapping** across all calls
- **Real-time event logging** and status updates

### 3. Testing Infrastructure
- **Interactive dashboard** at `http://localhost:3002/stage-monitor.html`
- **Comprehensive test suite** with simulation capabilities
- **API endpoint testing** for all system components
- **Customer journey simulation** across all 4 stages

## 🧪 How to Test Each Stage

### Method 1: Interactive Dashboard
1. **Open**: `http://localhost:3002/stage-monitor.html`
2. **Enter customer details** in the testing controls
3. **Click buttons** to test different stages:
   - **📝 Test Prompt**: See how prompts are customized
   - **🔄 Update Agent**: Test VAPI agent updates 
   - **📞 Start Call**: Initiate calls (needs VAPI keys)
   - **💬 Simulate Transcript**: Process sample conversations

### Method 2: API Testing
```bash
# Test prompt customization for each stage
curl -X POST http://localhost:3002/api/test-prompt \
  -H "Content-Type: application/json" \
  -d '{"callStage": 1, "customerData": {"name": "Sarah Johnson", "businessName": "Johnson Consulting"}}'

# Check next recommended stage
curl http://localhost:3002/api/next-call-stage/test@example.com

# Start a dynamic call
curl -X POST http://localhost:3002/api/start-call \
  -H "Content-Type: application/json" \
  -d '{"customerEmail": "test@example.com", "customerData": {"name": "Sarah Johnson", "phone": "+1-555-123-4567"}}'
```

### Method 3: Complete Journey Simulation
```bash
# Run comprehensive 4-stage test (needs node-fetch)
node test-complete-system.js
```

## 📊 How to Monitor Each Stage

### Real-time Monitoring
```bash
# Get current system status
curl http://localhost:3002/api/monitor/status

# Get specific call details
curl http://localhost:3002/api/monitor/call/CALL_ID

# Get customer call history
curl http://localhost:3002/api/monitor/customer/email@example.com

# Get stage analytics
curl http://localhost:3002/api/monitor/stage/1

# Generate system report
curl http://localhost:3002/api/monitor/report
```

### Dashboard Monitoring
- **Live Activity Monitor**: Real-time logs of all system events
- **Stage Cards**: Visual status of each call stage (1-4)
- **Customer Progress**: Current completion percentage and next steps
- **Auto-refresh**: Updates every 10 seconds automatically

## 🎯 Testing Each Call Stage

### Call 1: Foundation & Vision (25% Target)
**Test Focus**: LLC filing basics, business concept, timeline
```bash
# Test prompt
curl -X POST http://localhost:3002/api/test-prompt \
  -H "Content-Type: application/json" \
  -d '{"callStage": 1, "customerData": {"name": "Sarah", "businessName": "Johnson Consulting", "state": "California"}}'

# Simulate conversation
curl -X POST http://localhost:3002/api/test-extraction \
  -H "Content-Type: application/json" \
  -d '{"transcript": "Hi, I want to start Johnson Consulting in California as an LLC", "callStage": 1}'
```

### Call 2: Brand DNA & Market Position (50% Target)
**Test Focus**: Brand identity, colors, logo, competitive positioning
```bash
# Test with brand data
curl -X POST http://localhost:3002/api/test-prompt \
  -H "Content-Type: application/json" \
  -d '{"callStage": 2, "customerData": {"name": "Sarah", "businessName": "Johnson Consulting", "industry": "Consulting"}}'
```

### Call 3: Operations & Implementation (75% Target)
**Test Focus**: Business location, compliance, financial systems, technology
```bash
# Test operational setup
curl -X POST http://localhost:3002/api/test-prompt \
  -H "Content-Type: application/json" \
  -d '{"callStage": 3, "customerData": {"name": "Sarah", "businessName": "Johnson Consulting", "state": "California"}}'
```

### Call 4: Launch Strategy & Support (100% Target)
**Test Focus**: Marketing plan, revenue goals, growth strategy
```bash
# Test launch planning
curl -X POST http://localhost:3002/api/test-prompt \
  -H "Content-Type: application/json" \
  -d '{"callStage": 4, "customerData": {"name": "Sarah", "businessName": "Johnson Consulting"}}'
```

## 🔄 Webhook Event Testing

### Simulate Complete Call Flow
```bash
CALL_ID="test_$(date +%s)"

# 1. Start call
curl -X POST http://localhost:3002/api/monitor/simulate \
  -H "Content-Type: application/json" \
  -d "{\"type\": \"call_started\", \"callId\": \"$CALL_ID\", \"data\": {\"customerEmail\": \"test@example.com\", \"callStage\": 1}}"

# 2. Receive transcript
curl -X POST http://localhost:3002/api/monitor/simulate \
  -H "Content-Type: application/json" \
  -d "{\"type\": \"transcript\", \"callId\": \"$CALL_ID\", \"data\": {\"transcript\": \"I want to start a business\"}}"

# 3. Complete call
curl -X POST http://localhost:3002/api/monitor/simulate \
  -H "Content-Type: application/json" \
  -d "{\"type\": \"call_completed\", \"callId\": \"$CALL_ID\", \"data\": {\"duration\": 900}}"
```

## 📈 Analytics & Reporting

### View Stage Performance
```bash
# Get analytics for each stage
for stage in 1 2 3 4; do
  echo "Stage $stage Analytics:"
  curl -s http://localhost:3002/api/monitor/stage/$stage | head -c 200
  echo -e "\n"
done
```

### Generate System Reports
```bash
# Complete system analytics
curl -s http://localhost:3002/api/monitor/report | head -c 500
```

## 🚀 Production Readiness Checklist

### ✅ Completed & Working
- [x] Dynamic prompt system with 4 call stages
- [x] Customer data personalization in prompts
- [x] Call stage progression logic
- [x] Real-time monitoring and analytics
- [x] Customer journey tracking
- [x] Webhook event processing
- [x] Interactive testing dashboard
- [x] Complete API endpoints
- [x] Simulation and testing tools

### ⚠️ Needs Configuration
- [ ] Set `VAPI_API_KEY` in .env file
- [ ] Set `VAPI_AGENT_ID` in .env file
- [ ] Set `VAPI_WEBHOOK_SECRET` in .env file
- [ ] Test with real VAPI calls
- [ ] Configure voice settings in DynamicVAPIManager

## 💡 Quick Start for Production

### 1. Configure VAPI Credentials
```bash
# Add to .env file
VAPI_API_KEY=your_actual_vapi_api_key
VAPI_AGENT_ID=your_single_agent_id
VAPI_WEBHOOK_SECRET=your_webhook_secret
```

### 2. Test Real Call
```bash
curl -X POST http://localhost:3002/api/start-call \
  -H "Content-Type: application/json" \
  -d '{
    "customerEmail": "customer@example.com",
    "customerData": {
      "name": "Customer Name",
      "phone": "+1-555-123-4567",
      "businessName": "Their Business"
    }
  }'
```

### 3. Monitor Progress
- **Dashboard**: `http://localhost:3002/stage-monitor.html`
- **API**: `http://localhost:3002/api/monitor/status`
- **Customer**: `http://localhost:3002/api/next-call-stage/customer@example.com`

## 🎯 Key Benefits Achieved

### Before (Static 4 Agents)
- ❌ Manual agent switching
- ❌ No prompt customization
- ❌ No progression tracking
- ❌ Limited monitoring

### After (Dynamic System)
- ✅ **Automatic prompt switching** per call stage
- ✅ **Customer data personalization** in every prompt
- ✅ **Intelligent stage progression** based on completion
- ✅ **Real-time monitoring** of all call events
- ✅ **Complete customer journey tracking**
- ✅ **Comprehensive testing and analytics**

## 📞 System Architecture

```
Customer → API Call → Dynamic VAPI Manager → VAPI Agent
    ↓                                           ↓
Dashboard ← Monitor ← Webhook ← AI Processing ← Call
```

The system successfully transforms static VAPI agent management into a dynamic, data-driven conversation system that adapts to each customer's journey through the business formation process.

**Result**: One API call now handles what previously required manual configuration of 4 separate agents! 🎉