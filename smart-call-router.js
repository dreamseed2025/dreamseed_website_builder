import express from 'express';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

const app = express();
const port = 3005;

app.use(express.json({ limit: '10mb' }));

const supabase = createClient(
  'https://kxldodhrhqbwyvgyuqfd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4bGRvZGhyaHFid3l2Z3l1cWZkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTEyMDA3OCwiZXhwIjoyMDcwNjk2MDc4fQ.ByC7SLkJ2zeyhDN0nyWUNw-otETetisbjKM1sSCfS2Q'
);

const VAPI_PRIVATE_KEY = '3359a2eb-02e4-4f31-a5aa-37c2a020a395';

// Assistant IDs for each call stage
const CALL_ASSISTANTS = {
  1: '60400523-a331-4c4b-935d-b666ee013d42', // Call 1 - Foundation
  2: '2496625c-6fe8-4304-8b6d-045870680189', // Call 2 - Brand Identity
  3: 'b9f38474-a065-458f-bb03-eb62d21f529a', // Call 3 - Operations Setup
  4: '87416134-cfc7-47de-ad97-4951d3905ea9'  // Call 4 - Launch Strategy
};

// Phone number that routes calls
const PHONE_NUMBER_ID = '2d5a3ced-7573-4482-bc71-1e5ad4e5af97';

class SmartCallRouter {
  
  async routeIncomingCall(customerPhone) {
    try {
      console.log(`🔍 Determining call route for: ${customerPhone}`);
      
      // Look up user's current progress
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('customer_phone', customerPhone)
        .single();
      
      let targetStage = 1; // Default to Call 1 for new users
      let userContext = '';
      
      if (user) {
        console.log(`👤 Found existing user: ${user.customer_name || 'Unknown'}`);
        console.log(`📊 Current stage: ${user.current_call_stage}`);
        console.log(`📞 Call completions: 1:${user.call_1_completed} 2:${user.call_2_completed} 3:${user.call_3_completed} 4:${user.call_4_completed}`);
        
        // Determine next call stage based on progress
        if (!user.call_1_completed) {
          targetStage = 1;
        } else if (!user.call_2_completed) {
          targetStage = 2;
        } else if (!user.call_3_completed) {
          targetStage = 3;
        } else if (!user.call_4_completed) {
          targetStage = 4;
        } else {
          targetStage = 4; // All calls complete, route to final call for follow-up
        }
        
        // Build context string for the assistant
        userContext = this.buildUserContext(user, targetStage);
      } else {
        console.log(`📝 New user - routing to Call 1`);
      }
      
      const targetAssistant = CALL_ASSISTANTS[targetStage];
      console.log(`🎯 Routing to Call ${targetStage} (Assistant: ${targetAssistant})`);
      
      // Update phone number to route to correct assistant
      await this.updatePhoneNumberRouting(targetAssistant, userContext);
      
      return {
        stage: targetStage,
        assistantId: targetAssistant,
        userExists: !!user,
        context: userContext
      };
      
    } catch (error) {
      console.error('❌ Call routing error:', error);
      // Default to Call 1 on error
      await this.updatePhoneNumberRouting(CALL_ASSISTANTS[1], '');
      return { stage: 1, assistantId: CALL_ASSISTANTS[1], userExists: false, context: '' };
    }
  }
  
  buildUserContext(user, targetStage) {
    let context = `CUSTOMER CONTEXT:\n`;
    context += `- Name: ${user.customer_name || 'Not provided'}\n`;
    context += `- Email: ${user.customer_email || 'Not provided'}\n`;
    context += `- Phone: ${user.customer_phone || 'Not provided'}\n`;
    context += `- Business: ${user.business_name || 'Not specified'}\n`;
    context += `- Entity Type: ${user.entity_type || 'Not specified'}\n`;
    context += `- State: ${user.state_of_operation || 'Not specified'}\n`;
    context += `- Urgency: ${user.urgency_level || 'Not specified'}\n`;
    
    // Add call history
    context += `\nCALL HISTORY:\n`;
    if (user.call_1_completed) context += `✅ Call 1 completed on ${user.call_1_completed_at}\n`;
    if (user.call_2_completed) context += `✅ Call 2 completed on ${user.call_2_completed_at}\n`;
    if (user.call_3_completed) context += `✅ Call 3 completed on ${user.call_3_completed_at}\n`;
    if (user.call_4_completed) context += `✅ Call 4 completed on ${user.call_4_completed_at}\n`;
    
    context += `\nCURRENT CALL: This is Call ${targetStage} for this customer.\n`;
    
    return context;
  }
  
  async updatePhoneNumberRouting(assistantId, context) {
    try {
      const headers = {
        'Authorization': `Bearer ${VAPI_PRIVATE_KEY}`,
        'Content-Type': 'application/json'
      };
      
      // Update phone number to route to specific assistant
      const updateData = {
        assistantId: assistantId
      };
      
      await axios.patch(
        `https://api.vapi.ai/phone-number/${PHONE_NUMBER_ID}`,
        updateData,
        { headers }
      );
      
      console.log(`✅ Phone number routed to assistant: ${assistantId}`);
      
    } catch (error) {
      console.error('❌ Phone routing update failed:', error.response?.data || error.message);
    }
  }
  
  async processCallWebhook(webhookData) {
    try {
      console.log('\n🎯 Smart Call Webhook received!');
      
      const callId = webhookData.callId || webhookData.call?.id || webhookData.message?.call?.id || 'unknown';
      const callType = webhookData.type || webhookData.message?.type || 'unknown';
      
      // Extract customer phone from different possible locations
      const customerPhone = webhookData.call?.customer?.number || 
                          webhookData.customer?.number ||
                          webhookData.message?.call?.customer?.number ||
                          webhookData.message?.customer?.number ||
                          webhookData.phoneNumber ||
                          webhookData.from;
      
      console.log(`📞 Call ${callId} - Type: ${callType}`);
      console.log(`📱 Customer phone: ${customerPhone || 'Not found'}`);
      
      // For incoming calls, route them to the right assistant
      if ((callType === 'status-update' && webhookData.message?.status === 'in-progress') ||
          callType === 'call-start' || 
          callType === 'call.started') {
        
        if (customerPhone) {
          const routing = await this.routeIncomingCall(customerPhone);
          console.log(`🎯 Routed to Call ${routing.stage}`);
        }
      }
      
      // For call-end events, process the transcript and update progress
      if (callType === 'call-end' || callType === 'end-of-call-report') {
        await this.processCallCompletion(webhookData, customerPhone, callId);
      }
      
      return { success: true, callId, processed: true };
      
    } catch (error) {
      console.error('❌ Smart webhook processing error:', error);
      return { success: false, error: error.message };
    }
  }
  
  async processCallCompletion(webhookData, customerPhone, callId) {
    try {
      // Extract transcript
      let transcript = '';
      if (webhookData.artifact?.messages) {
        transcript = webhookData.artifact.messages
          .map(msg => `${msg.role}: ${msg.content || msg.message || ''}`)
          .join('\n');
      } else if (webhookData.messages) {
        transcript = webhookData.messages
          .map(msg => `${msg.role}: ${msg.content || msg.message || ''}`)
          .join('\n');
      } else if (webhookData.transcript) {
        transcript = webhookData.transcript;
      }
      
      if (!customerPhone || !transcript) {
        console.log('❌ Missing phone or transcript for call completion');
        return;
      }
      
      console.log(`📝 Processing call completion for: ${customerPhone}`);
      console.log(`📄 Transcript length: ${transcript.length} chars`);
      
      // Determine which call stage this was
      const callStage = await this.determineCallStage(customerPhone);
      
      // Extract data from transcript
      const extractedData = this.extractDataFromTranscript(transcript);
      
      // Update user record with call completion
      await this.updateUserProgress(customerPhone, callStage, extractedData, transcript);
      
    } catch (error) {
      console.error('❌ Call completion processing error:', error);
    }
  }
  
  async determineCallStage(customerPhone) {
    const { data: user } = await supabase
      .from('users')
      .select('current_call_stage, call_1_completed, call_2_completed, call_3_completed, call_4_completed')
      .eq('customer_phone', customerPhone)
      .single();
    
    if (!user) return 1;
    
    // Determine which call they just completed
    if (!user.call_1_completed) return 1;
    if (!user.call_2_completed) return 2;
    if (!user.call_3_completed) return 3;
    if (!user.call_4_completed) return 4;
    return 4; // All complete
  }
  
  extractDataFromTranscript(transcript) {
    const lowerTranscript = transcript.toLowerCase();
    const extracted = {};
    
    // Extract name
    if (lowerTranscript.includes('my name is') || lowerTranscript.includes('i am') || lowerTranscript.includes('this is')) {
      const nameMatch = transcript.match(/(?:my name is|i am|this is)\s+([a-zA-Z\s]+?)(?:\s+and|\s+from|\.|,|$)/i);
      if (nameMatch) {
        extracted.customer_name = nameMatch[1].trim();
      }
    }
    
    // Extract email
    const emailMatch = transcript.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
    if (emailMatch) {
      extracted.customer_email = emailMatch[1];
    }
    
    // Extract business name
    if (lowerTranscript.includes('business') || lowerTranscript.includes('company')) {
      const businessMatch = transcript.match(/(?:business|company)\s+(?:is\s+)?(?:called|named)\s+([a-zA-Z\s]+?)(?:\s+and|\s+in|\.|,|$)/i);
      if (businessMatch) {
        extracted.business_name = businessMatch[1].trim();
      }
    }
    
    // Extract state
    const states = ['california', 'texas', 'florida', 'new york', 'illinois', 'pennsylvania', 'ohio', 'georgia', 'north carolina', 'michigan'];
    for (const state of states) {
      if (lowerTranscript.includes(state)) {
        extracted.state_of_operation = state.charAt(0).toUpperCase() + state.slice(1);
        break;
      }
    }
    
    // Extract entity type
    const businessTypes = ['llc', 'corporation', 'partnership', 'sole proprietorship'];
    for (const type of businessTypes) {
      if (lowerTranscript.includes(type)) {
        extracted.entity_type = type.toUpperCase();
        break;
      }
    }
    
    // Extract urgency
    if (lowerTranscript.includes('urgent') || lowerTranscript.includes('asap') || lowerTranscript.includes('soon') || lowerTranscript.includes('quickly')) {
      extracted.urgency_level = 'High';
    } else if (lowerTranscript.includes('no rush') || lowerTranscript.includes('take time') || lowerTranscript.includes('no hurry')) {
      extracted.urgency_level = 'Low';
    } else {
      extracted.urgency_level = 'Medium';
    }
    
    return extracted;
  }
  
  async updateUserProgress(customerPhone, callStage, extractedData, transcript) {
    try {
      // Get existing user or create new one
      let { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('customer_phone', customerPhone)
        .single();
      
      const now = new Date().toISOString();
      const updateData = {
        ...extractedData,
        updated_at: now,
        current_call_stage: Math.max((existingUser?.current_call_stage || 0), callStage),
        [`call_${callStage}_completed`]: true,
        [`call_${callStage}_completed_at`]: now
      };
      
      if (existingUser) {
        // Update existing user
        const { error } = await supabase
          .from('users')
          .update(updateData)
          .eq('id', existingUser.id);
          
        if (error) {
          console.log('❌ Update error:', error.message);
        } else {
          console.log(`✅ Updated user progress - Call ${callStage} completed`);
        }
      } else {
        // Create new user
        const newUser = {
          customer_phone: customerPhone,
          ...updateData,
          status: 'call_in_progress',
          created_at: now
        };
        
        const { error } = await supabase
          .from('users')
          .insert(newUser);
          
        if (error) {
          console.log('❌ Insert error:', error.message);
        } else {
          console.log(`✅ Created new user - Call ${callStage} completed`);
        }
      }
      
      // Log extracted data
      console.log('📊 Extracted data:', extractedData);
      
    } catch (error) {
      console.error('❌ User progress update error:', error);
    }
  }
}

const router = new SmartCallRouter();

// Health check endpoint
app.get('/api/webhook', (req, res) => {
  res.json({
    message: 'Smart Call Router & Truth Table System',
    status: 'Ready',
    timestamp: new Date().toISOString(),
    assistants: CALL_ASSISTANTS
  });
});

// Main webhook endpoint
app.post('/api/webhook', async (req, res) => {
  try {
    const result = await router.processCallWebhook(req.body);
    
    res.json({
      received: true,
      timestamp: new Date().toISOString(),
      processing: result
    });
    
  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(500).json({
      error: 'Webhook processing failed',
      message: error.message
    });
  }
});

// Manual routing endpoint for testing
app.post('/api/route-user', async (req, res) => {
  try {
    const { customerPhone } = req.body;
    const routing = await router.routeIncomingCall(customerPhone);
    res.json(routing);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`🚀 Smart Call Router running on port ${port}`);
  console.log(`📍 Webhook: http://localhost:${port}/api/webhook`);
  console.log(`🎯 Manual routing: http://localhost:${port}/api/route-user`);
  console.log(`\n📞 Call Stages:`);
  Object.entries(CALL_ASSISTANTS).forEach(([stage, id]) => {
    console.log(`   Call ${stage}: ${id}`);
  });
});