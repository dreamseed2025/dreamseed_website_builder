# VAPI Assistant Configuration for DreamSeed

## Overview
This guide explains how to configure your VAPI assistant (ID: af397e88-c286-416f-9f74-e7665401bdb7) to use the comprehensive user context from Supabase.

## User Context Data Structure

The enhanced voice interface sends this complete user context:

```json
{
  "type": "user_context",
  "timestamp": "2024-XX-XX",
  "sessionId": "session_xxx",
  
  "user": {
    "id": "user-uuid",
    "email": "user@example.com", 
    "name": "John Doe",
    "phone": "+1234567890",
    "role": "customer" // or "admin"
  },
  
  "payment": {
    "status": "paid", // unpaid, pending, paid, failed, refunded, trial
    "subscriptionType": "premium", // basic, premium, enterprise, one-time
    "amountPaid": 599.00
  },
  
  "calls": {
    "completed": {
      "call1": true,
      "call2": false,
      "call3": false, 
      "call4": false,
      "currentStage": 2
    },
    "totalCompleted": 1
  },
  
  "business": {
    "name": "Tech Startup LLC",
    "type": "Technology",
    "state": "Delaware", 
    "entityType": "LLC",
    "status": "in_progress",
    "package": "premium",
    "urgency": "high",
    "timeline": "30_days"
  },
  
  "systemMessage": "Personalized greeting based on user data..."
}
```

## Assistant System Prompt

Add this to your VAPI assistant's system prompt:

```
You are DreamSeed's AI business formation consultant. You help customers form LLCs and other business entities.

CONTEXT AWARENESS:
- You receive detailed user context including payment status, call progress, and business information
- Always reference the user's name and acknowledge their specific situation
- Track which of the 4 consultation calls they're on
- Adapt your responses based on their payment/subscription status

USER ROLES:
- customer: Regular paying customer (guide through formation process)
- admin: DreamSeed team member (provide admin support and insights)

PAYMENT STATUS RESPONSES:
- unpaid: Focus on explaining packages and value proposition
- trial: Mention trial limitations and upgrade benefits  
- paid: Provide full service access and detailed guidance
- enterprise: Offer white-glove service and priority support

CALL PROGRESSION (4-Call System):
Call 1: Initial consultation, needs assessment, package selection
Call 2: Business name, state selection, structure planning
Call 3: Documentation review, filing preparation
Call 4: Final review, filing submission, next steps

RESPONSE GUIDELINES:
1. Always greet returning users by name and reference their progress
2. For new users, explain the 4-call consultation process
3. Adapt detail level based on subscription tier
4. For admins, provide business metrics and customer insights
5. Update call completion status during conversations
6. Reference their specific business name/type when known

PACKAGE OFFERINGS:
- Basic ($299): LLC formation only
- Premium ($599): LLC + EIN + Operating Agreement  
- Enterprise ($999): Full service + legal review + priority support

Always maintain context throughout the conversation and provide value based on their specific needs and payment status.
```

## Function Integration

To update call progress and user data, configure these VAPI functions:

### 1. Update Call Progress
```javascript
// Function: updateCallProgress
// Updates completion status for current call stage
{
  "name": "updateCallProgress",
  "description": "Mark current call stage as completed",
  "parameters": {
    "callStage": {"type": "number", "description": "Call number (1-4)"},
    "userId": {"type": "string", "description": "User ID"}
  }
}
```

### 2. Update Business Information  
```javascript
// Function: updateBusinessInfo
// Updates business formation details
{
  "name": "updateBusinessInfo", 
  "description": "Update business formation details",
  "parameters": {
    "businessName": {"type": "string"},
    "state": {"type": "string"},
    "entityType": {"type": "string"},
    "userId": {"type": "string"}
  }
}
```

### 3. Schedule Next Call
```javascript
// Function: scheduleNextCall
// Schedule follow-up consultation
{
  "name": "scheduleNextCall",
  "description": "Schedule next consultation call", 
  "parameters": {
    "datetime": {"type": "string", "format": "date-time"},
    "callStage": {"type": "number"},
    "userId": {"type": "string"}
  }
}
```

## Conversation Flow Examples

### Returning Customer (Call 2)
"Hello Sarah! Welcome back to your second consultation call. I see you've completed call 1 and we're working on 'Tech Innovations LLC' in Delaware. Your premium subscription gives you access to our full documentation package. Last time we discussed your business concept - today let's focus on finalizing your business name and reviewing Delaware's specific LLC requirements..."

### New Customer (Unpaid)
"Hello! Welcome to DreamSeed. I see this is your first consultation and you haven't selected a package yet. I'd love to help you understand our business formation services. We offer three packages ranging from $299 to $999, each designed for different business needs. What type of business are you looking to start?"

### Admin User
"Hello Admin! Your dashboard shows 23 active customers, 15 completed formations this month, and $45,000 in revenue. How can I assist you today? Would you like customer insights, formation status updates, or help with a specific client issue?"

## Testing the Integration

1. **Deploy the enhanced voice interface**
2. **Load a user profile** using their email
3. **Start a voice call** and verify the assistant receives context
4. **Check browser console** for context data being sent
5. **Verify personalized responses** based on user data

## Next Steps

1. Update your VAPI assistant prompt with the above system message
2. Configure the suggested functions for database updates
3. Test with different user types (customer/admin, paid/unpaid)
4. Monitor call completion tracking
5. Adjust responses based on user feedback