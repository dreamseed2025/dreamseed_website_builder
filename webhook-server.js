import express from 'express';
import { createClient } from '@supabase/supabase-js';

const app = express();
const port = 3004;

app.use(express.json({ limit: '10mb' }));

const supabase = createClient(
  'https://kxldodhrhqbwyvgyuqfd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4bGRvZGhyaHFid3l2Z3l1cWZkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTEyMDA3OCwiZXhwIjoyMDcwNjk2MDc4fQ.ByC7SLkJ2zeyhDN0nyWUNw-otETetisbjKM1sSCfS2Q'
);

// Simple truth table processor
class TruthTableProcessor {
  
  async processCallWebhook(webhookData) {
    try {
      console.log('🔍 Processing VAPI webhook...');
      console.log('📨 Full webhook data:', JSON.stringify(webhookData, null, 2));
      
      const callId = webhookData.callId || webhookData.call?.id || 'unknown';
      const callType = webhookData.type || webhookData.event_type || 'unknown';
      
      // Extract customer phone from different possible locations
      const customerPhone = webhookData.call?.customer?.number || 
                          webhookData.customer?.number ||
                          webhookData.message?.call?.customer?.number ||
                          webhookData.message?.customer?.number ||
                          webhookData.phoneNumber ||
                          webhookData.from ||
                          webhookData.call?.customer?.phoneNumber;
      
      console.log(`📞 Call ${callId} - Type: ${callType}`);
      console.log(`📱 Customer phone: ${customerPhone || 'Not found'}`);
      
      // For call-end events, extract transcript
      if (callType === 'call-end' || callType === 'end-of-call-report') {
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
        
        console.log(`📝 Transcript (${transcript.length} chars):`, transcript.substring(0, 200) + '...');
        
        if (customerPhone && transcript) {
          await this.processCallData(customerPhone, transcript, callId);
        } else if (transcript) {
          // Try to extract phone from transcript
          const phoneInTranscript = this.extractPhoneFromTranscript(transcript);
          if (phoneInTranscript) {
            await this.processCallData(phoneInTranscript, transcript, callId);
          } else {
            console.log('❌ No customer phone found in webhook or transcript');
          }
        }
      }
      
      return { success: true, callId, processed: true };
      
    } catch (error) {
      console.error('❌ Webhook processing error:', error);
      return { success: false, error: error.message };
    }
  }
  
  extractPhoneFromTranscript(transcript) {
    // Look for phone numbers in transcript
    const phoneRegex = /(\+?1?\s?\(?[0-9]{3}\)?\s?[0-9]{3}[\s\-]?[0-9]{4})/g;
    const matches = transcript.match(phoneRegex);
    return matches ? matches[0] : null;
  }
  
  simpleDataExtraction(transcript) {
    const lowerTranscript = transcript.toLowerCase();
    const extracted = {};
    
    // Extract name
    if (lowerTranscript.includes('my name is') || lowerTranscript.includes('i am') || lowerTranscript.includes('this is')) {
      const nameMatch = transcript.match(/(?:my name is|i am|this is)\s+([a-zA-Z\s]+)/i);
      if (nameMatch) {
        extracted.customer_name = nameMatch[1].trim();
      }
    }
    
    // Extract email
    if (lowerTranscript.includes('email')) {
      const emailMatch = transcript.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
      if (emailMatch) {
        extracted.customer_email = emailMatch[1];
      }
    }
    
    // Extract business info
    if (lowerTranscript.includes('business') || lowerTranscript.includes('company')) {
      if (lowerTranscript.includes('called') || lowerTranscript.includes('named')) {
        const businessMatch = transcript.match(/(?:business|company)\s+(?:called|named)\s+([a-zA-Z\s]+)/i);
        if (businessMatch) {
          extracted.business_name = businessMatch[1].trim();
        }
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
    }
    
    return extracted;
  }
  
  async processCallData(customerPhone, transcript, callId) {
    try {
      console.log(`🔍 Processing call data for phone: ${customerPhone}`);
      
      const extractedData = this.simpleDataExtraction(transcript);
      console.log('📊 Extracted data:', extractedData);
      
      // Look for existing user by phone
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('customer_phone', customerPhone)
        .single();
      
      const updateData = {
        ...extractedData,
        updated_at: new Date().toISOString(),
        current_call_stage: Math.max((existingUser?.current_call_stage || 0), 1),
        call_1_completed: true,
        call_1_completed_at: new Date().toISOString()
      };
      
      if (existingUser) {
        // Update existing user
        console.log(`✅ Found existing user: ${existingUser.customer_email || existingUser.customer_phone}`);
        const { error } = await supabase
          .from('users')
          .update(updateData)
          .eq('id', existingUser.id);
          
        if (error) {
          console.log('❌ Update error:', error.message);
        } else {
          console.log(`✅ Updated user ${customerPhone}`);
        }
      } else {
        // Create new user record from call
        console.log(`📝 Creating new user from call: ${customerPhone}`);
        const newUser = {
          customer_phone: customerPhone,
          ...updateData,
          status: 'call_completed',
          created_at: new Date().toISOString()
        };
        
        const { error } = await supabase
          .from('users')
          .insert(newUser);
          
        if (error) {
          console.log('❌ Insert error:', error.message);
        } else {
          console.log(`✅ Created new user ${customerPhone}`);
        }
      }
      
    } catch (error) {
      console.error('❌ Call data processing error:', error);
    }
  }
}

const processor = new TruthTableProcessor();

// Health check endpoint
app.get('/api/webhook', (req, res) => {
  res.json({
    message: 'VAPI Truth Table Webhook',
    status: 'Ready',
    timestamp: new Date().toISOString()
  });
});

// Main webhook endpoint
app.post('/api/webhook', async (req, res) => {
  try {
    console.log('\n🎯 VAPI Webhook received!');
    console.log('📊 Data size:', JSON.stringify(req.body).length, 'chars');
    
    const result = await processor.processCallWebhook(req.body);
    
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
  console.log(`🚀 Truth Table Webhook Server running on port ${port}`);
  console.log(`📍 Health check: http://localhost:${port}/api/webhook`);
  console.log(`🎯 Webhook endpoint: http://localhost:${port}/api/webhook`);
});