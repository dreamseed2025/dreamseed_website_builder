import express from 'express';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

const app = express();
const port = 3006;

app.use(express.json({ limit: '10mb' }));

const supabase = createClient(
  'https://kxldodhrhqbwyvgyuqfd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4bGRvZGhyaHFid3l2Z3l1cWZkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTEyMDA3OCwiZXhwIjoyMDcwNjk2MDc4fQ.ByC7SLkJ2zeyhDN0nyWUNw-otETetisbjKM1sSCfS2Q'
);

const VAPI_PRIVATE_KEY = '3359a2eb-02e4-4f31-a5aa-37c2a020a395';
const PHONE_NUMBER_ID = '2d5a3ced-7573-4482-bc71-1e5ad4e5af97';

// Assistant IDs for each call stage
const CALL_ASSISTANTS = {
  1: '60400523-a331-4c4b-935d-b666ee013d42', // Call 1 - Foundation
  2: '2496625c-6fe8-4304-8b6d-045870680189', // Call 2 - Brand Identity
  3: 'b9f38474-a065-458f-bb03-eb62d21f529a', // Call 3 - Operations Setup
  4: '87416134-cfc7-47de-ad97-4951d3905ea9'  // Call 4 - Launch Strategy
};

class PreCallRouter {
  
  async routeBasedOnLastCall() {
    try {
      console.log('🔍 Checking for recent completed calls...');
      
      // Get the most recent call that ended in the last 2 minutes
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
      
      const { data: recentUsers } = await supabase
        .from('users')
        .select('customer_phone, current_call_stage, call_1_completed, call_2_completed, call_3_completed, call_4_completed, updated_at')
        .gte('updated_at', twoMinutesAgo)
        .order('updated_at', { ascending: false })
        .limit(1);
      
      if (recentUsers && recentUsers.length > 0) {
        const user = recentUsers[0];
        console.log(`📞 Recent activity for: ${user.customer_phone}`);
        
        // Determine next call stage
        let nextStage = 1;
        if (user.call_4_completed) {
          nextStage = 4; // All complete, stay on Call 4 for follow-up
        } else if (user.call_3_completed) {
          nextStage = 4;
        } else if (user.call_2_completed) {
          nextStage = 3;
        } else if (user.call_1_completed) {
          nextStage = 2;
        } else {
          nextStage = 1;
        }
        
        console.log(`🎯 Setting default routing to Call ${nextStage}`);
        await this.updatePhoneRouting(nextStage);
        return { success: true, stage: nextStage, phone: user.customer_phone };
      }
      
      console.log('📝 No recent activity, keeping default Call 1 routing');
      await this.updatePhoneRouting(1);
      return { success: true, stage: 1, phone: 'default' };
      
    } catch (error) {
      console.error('❌ Pre-call routing error:', error);
      await this.updatePhoneRouting(1); // Default to Call 1 on error
      return { success: false, error: error.message };
    }
  }
  
  async updatePhoneRouting(stage) {
    try {
      const assistantId = CALL_ASSISTANTS[stage];
      
      const headers = {
        'Authorization': `Bearer ${VAPI_PRIVATE_KEY}`,
        'Content-Type': 'application/json'
      };
      
      await axios.patch(
        `https://api.vapi.ai/phone-number/${PHONE_NUMBER_ID}`,
        { assistantId: assistantId },
        { headers }
      );
      
      console.log(`✅ Phone number routed to Call ${stage} (${assistantId})`);
      
    } catch (error) {
      console.error('❌ Phone routing update failed:', error.response?.data || error.message);
    }
  }
  
  // Keep the existing webhook processing for call completion
  async processCallWebhook(webhookData) {
    try {
      const callType = webhookData.type || webhookData.message?.type || 'unknown';
      const customerPhone = webhookData.call?.customer?.number || 
                          webhookData.customer?.number ||
                          webhookData.message?.call?.customer?.number ||
                          webhookData.message?.customer?.number;
      
      console.log(`📞 Webhook: ${callType} for ${customerPhone || 'unknown'}`);
      
      // For call-end events, process the transcript and trigger re-routing
      if (callType === 'call-end' || callType === 'end-of-call-report') {
        await this.processCallCompletion(webhookData, customerPhone);
        
        // Wait a moment then update routing for next call
        setTimeout(async () => {
          await this.routeBasedOnLastCall();
        }, 3000);
      }
      
      return { success: true, processed: true };
      
    } catch (error) {
      console.error('❌ Webhook processing error:', error);
      return { success: false, error: error.message };
    }
  }
  
  async processCallCompletion(webhookData, customerPhone) {
    try {
      // Extract transcript
      let transcript = '';
      if (webhookData.artifact?.messages) {
        transcript = webhookData.artifact.messages
          .filter(msg => msg.role === 'user')
          .map(msg => msg.content || msg.message || '')
          .join(' ');
      } else if (webhookData.transcript) {
        transcript = webhookData.transcript;
      }
      
      if (!customerPhone) {
        console.log('❌ No customer phone found in call completion');
        return;
      }
      
      console.log(`📝 Processing call completion for: ${customerPhone}`);
      console.log(`📄 Transcript length: ${transcript.length} chars`);
      
      // Determine which call stage this was by checking current progress
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('customer_phone', customerPhone)
        .single();
      
      let callStage = 1;
      if (user) {
        if (!user.call_1_completed) callStage = 1;
        else if (!user.call_2_completed) callStage = 2;
        else if (!user.call_3_completed) callStage = 3;
        else if (!user.call_4_completed) callStage = 4;
        else callStage = 4; // All complete
      }
      
      // Extract data from transcript
      const extractedData = this.extractDataFromTranscript(transcript);
      
      // Update user progress
      await this.updateUserProgress(customerPhone, callStage, extractedData);
      
    } catch (error) {
      console.error('❌ Call completion processing error:', error);
    }
  }
  
  extractDataFromTranscript(transcript) {
    const lowerTranscript = transcript.toLowerCase();
    const extracted = {};
    
    // Extract name
    const nameMatch = transcript.match(/(?:my name is|i am|this is)\s+([a-zA-Z\s]+?)(?:\s+and|\s+from|\.|,|$)/i);
    if (nameMatch) {
      extracted.customer_name = nameMatch[1].trim();
    }
    
    // Extract email
    const emailMatch = transcript.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
    if (emailMatch) {
      extracted.customer_email = emailMatch[1];
    }
    
    // Extract business name
    const businessMatch = transcript.match(/(?:business|company)\s+(?:is\s+)?(?:called|named)\s+([a-zA-Z\s]+?)(?:\s+and|\s+in|\.|,|$)/i);
    if (businessMatch) {
      extracted.business_name = businessMatch[1].trim();
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
    if (lowerTranscript.includes('urgent') || lowerTranscript.includes('asap') || lowerTranscript.includes('soon')) {
      extracted.urgency_level = 'High';
    } else if (lowerTranscript.includes('no rush') || lowerTranscript.includes('take time')) {
      extracted.urgency_level = 'Low';
    } else {
      extracted.urgency_level = 'Medium';
    }
    
    return extracted;
  }
  
  async updateUserProgress(customerPhone, callStage, extractedData) {
    try {
      const { data: existingUser } = await supabase
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
        const newUser = {
          customer_phone: customerPhone,
          ...updateData,
          status: 'call_completed',
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
      
      console.log('📊 Extracted data:', extractedData);
      
    } catch (error) {
      console.error('❌ User progress update error:', error);
    }
  }
}

const router = new PreCallRouter();

// Auto-route every 30 seconds based on recent activity
setInterval(async () => {
  await router.routeBasedOnLastCall();
}, 30000);

// Initial routing on startup
router.routeBasedOnLastCall();

// Health check endpoint
app.get('/api/webhook', (req, res) => {
  res.json({
    message: 'Pre-Call Router & Truth Table System',
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

app.listen(port, () => {
  console.log(`🚀 Pre-Call Router running on port ${port}`);
  console.log(`📍 Webhook: http://localhost:${port}/api/webhook`);
  console.log(`⏰ Auto-routing every 30 seconds based on recent activity`);
  console.log(`\n📞 Call Stages:`);
  Object.entries(CALL_ASSISTANTS).forEach(([stage, id]) => {
    console.log(`   Call ${stage}: ${id}`);
  });
});