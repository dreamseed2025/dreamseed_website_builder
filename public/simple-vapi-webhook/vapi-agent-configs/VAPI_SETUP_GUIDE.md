# 🤖 VAPI Agent Configuration Guide for DreamSeed

## 🎯 **What You Need to Do**

Your VAPI agents need to be updated with systematic question prompts so they gather the right information for each call stage. Here's exactly how to configure them:

## 🔧 **VAPI Agent Setup**

### **Agent 1: Foundation & Vision (Call 1)**
**Purpose**: Gather basic business info, LLC requirements, contact details
**Target**: 25% completion
**Webhook URL**: `http://localhost:3002/api/vapi-webhook`
**Webhook Payload**:
```json
{
  "callStage": 1,
  "customerEmail": "{{customer_email}}",
  "type": "transcript",
  "transcript": "{{transcript}}"
}
```

**System Prompt**: Use `/vapi-agent-configs/call-1-agent-prompt.md`

---

### **Agent 2: Brand DNA & Market (Call 2)**  
**Purpose**: Brand identity, logo direction, competitive positioning
**Target**: 50% completion
**Webhook URL**: `http://localhost:3002/api/vapi-webhook`
**Webhook Payload**:
```json
{
  "callStage": 2,
  "customerEmail": "{{customer_email}}",
  "type": "transcript", 
  "transcript": "{{transcript}}"
}
```

**System Prompt**: Use `/vapi-agent-configs/call-2-agent-prompt.md`

---

### **Agent 3: Operations & Implementation (Call 3)**
**Purpose**: Business location, banking, compliance, technology systems
**Target**: 75% completion  
**Webhook URL**: `http://localhost:3002/api/vapi-webhook`
**Webhook Payload**:
```json
{
  "callStage": 3,
  "customerEmail": "{{customer_email}}",
  "type": "transcript",
  "transcript": "{{transcript}}"
}
```

**System Prompt**: Use `/vapi-agent-configs/call-3-agent-prompt.md`

---

### **Agent 4: Launch Strategy & Support (Call 4)**
**Purpose**: Marketing plan, revenue goals, growth strategy, ongoing support
**Target**: 100% completion
**Webhook URL**: `http://localhost:3002/api/vapi-webhook`  
**Webhook Payload**:
```json
{
  "callStage": 4,
  "customerEmail": "{{customer_email}}",
  "type": "transcript",
  "transcript": "{{transcript}}"
}
```

**System Prompt**: Use `/vapi-agent-configs/call-4-agent-prompt.md`

## 📋 **Critical VAPI Settings**

### **For All Agents:**
- **Voice**: Professional, warm tone
- **Speed**: Moderate pace for note-taking
- **Interruption Handling**: Allow customer to interject with questions
- **Call Recording**: Enable for quality assurance
- **Webhook Events**: `transcript`, `call-end`
- **Response Format**: JSON with structured data

### **Call Flow Management:**
- **Call Duration**: 15-30 minutes per call
- **Call Spacing**: 3-5 days between calls
- **Customer Preparation**: Send prep email before each call
- **Follow-up**: Automated summary email after each call

## 🎯 **What Each Agent Should Accomplish**

### **Call 1 Success Criteria:**
- ✅ Contact info (name, email, phone)
- ✅ Business name and concept
- ✅ State for LLC filing
- ✅ Target customers identified
- ✅ Launch timeline established
- ✅ **Target**: 25% completion score

### **Call 2 Success Criteria:**
- ✅ Brand personality defined
- ✅ Color preferences established
- ✅ Logo direction specified
- ✅ Competitive advantage clear
- ✅ Website messaging framework
- ✅ **Target**: 50% completion score

### **Call 3 Success Criteria:**
- ✅ Business location decided
- ✅ Banking and payment systems chosen
- ✅ Compliance requirements identified
- ✅ Technology stack planned
- ✅ Insurance needs assessed
- ✅ **Target**: 75% completion score

### **Call 4 Success Criteria:**
- ✅ Launch date set
- ✅ Marketing strategy complete
- ✅ Revenue goals established
- ✅ Growth plan outlined
- ✅ Support systems identified
- ✅ **Target**: 100% completion score

## 🔗 **Integration Points**

### **VAPI → DreamSeed Backend:**
1. **Webhook Trigger**: VAPI sends transcript after call
2. **AI Analysis**: DreamSeed extracts structured data
3. **Validation**: System scores completeness and quality
4. **Database Update**: Customer record updated with new info
5. **Next Steps**: System suggests follow-up actions

### **Customer Experience Flow:**
1. **Pre-call Email**: "Get ready for Call [X] - here's what we'll cover"
2. **VAPI Call**: Systematic question gathering using agent prompts
3. **Post-call Summary**: "Here's what we captured + next steps"
4. **Progress Dashboard**: Customer can track completion anytime
5. **Next Call Prep**: "For Call [X+1], please think about..."

## 🧪 **Testing Each Agent**

### **Quick Test Script:**
```bash
# Test Call 1 Agent
curl -X POST http://localhost:3002/api/vapi-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "type": "transcript",
    "callStage": 1,
    "customerEmail": "test@example.com",
    "transcript": "Hi, I am Sarah and I want to start a consulting business..."
  }'

# Check results
curl http://localhost:3002/api/customer-completeness/test@example.com
```

## 📊 **Success Metrics to Track**

### **Per-Call Metrics:**
- **Completion Score**: % of required info gathered
- **Call Duration**: Target 15-30 minutes
- **Customer Satisfaction**: Post-call survey score
- **Information Quality**: Validation score from AI

### **Overall Journey Metrics:**
- **4-Call Completion Rate**: % who finish all 4 calls
- **Time to Launch**: Days from Call 1 to business launch
- **Customer Success**: Business formation completion rate
- **Support Tickets**: Questions/issues after calls

## 🚨 **Important Notes**

### **Customer Email Tracking:**
- Use consistent email across all 4 calls
- Email is the primary customer identifier
- Include in every webhook payload

### **Call Stage Management:**
- Always specify correct `callStage` in webhook
- Backend uses this to apply appropriate validation
- Progression: 1 → 2 → 3 → 4

### **Quality Assurance:**
- Review transcripts for systematic question coverage
- Monitor completion scores after each call
- Adjust agent prompts based on missing information patterns

### **Fallback Handling:**
- If webhook fails, ensure VAPI retries
- Manual data entry backup process
- Customer can continue journey even with technical issues

## 🎉 **Ready to Launch!**

Once you configure these 4 VAPI agents with the provided prompts, your system will:

✅ **Systematically gather** 85+ business formation data points  
✅ **Guide customers** through professional 4-call journey  
✅ **Ensure completeness** with validation and quality scoring  
✅ **Track progress** with real-time customer dashboards  
✅ **Provide quality assurance** preventing missed requirements  

**Your DreamSeed voice AI will deliver enterprise-level systematic business formation planning!**