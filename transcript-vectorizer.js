import express from 'express';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import OpenAI from 'openai';
import SmartPromptGenerator from './smart-prompt-generator.js';
import EnhancedTranscriptExtractor from './enhanced-transcript-extractor.js';

const app = express();
const port = 3007;

app.use(express.json({ limit: '10mb' }));

const supabase = createClient(
  'https://kxldodhrhqbwyvgyuqfd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4bGRvZGhyaHFid3l2Z3l1cWZkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTEyMDA3OCwiZXhwIjoyMDcwNjk2MDc4fQ.ByC7SLkJ2zeyhDN0nyWUNw-otETetisbjKM1sSCfS2Q'
);

// OpenAI API configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const VAPI_PRIVATE_KEY = process.env.VAPI_PRIVATE_KEY;
const PHONE_NUMBER_ID = '2d5a3ced-7573-4482-bc71-1e5ad4e5af97';

// Assistant IDs for each call stage
const CALL_ASSISTANTS = {
  1: '60400523-a331-4c4b-935d-b666ee013d42', // Call 1 - Foundation
  2: '2496625c-6fe8-4304-8b6d-045870680189', // Call 2 - Brand Identity
  3: 'b9f38474-a065-458f-bb03-eb62d21f529a', // Call 3 - Operations Setup
  4: '87416134-cfc7-47de-ad97-4951d3905ea9'  // Call 4 - Launch Strategy
};

class TranscriptVectorizer {
  
  constructor() {
    this.promptGenerator = new SmartPromptGenerator();
    this.enhancedExtractor = new EnhancedTranscriptExtractor();
  }
  
  async processCallWebhook(webhookData) {
    try {
      const callType = webhookData.type || webhookData.message?.type || 'unknown';
      const callId = webhookData.callId || webhookData.call?.id || webhookData.message?.call?.id || 'unknown';
      const customerPhone = webhookData.call?.customer?.number || 
                          webhookData.customer?.number ||
                          webhookData.message?.call?.customer?.number ||
                          webhookData.message?.customer?.number;
      
      console.log(`📞 Webhook: ${callType} for ${customerPhone || 'unknown'} (Call ID: ${callId})`);
      console.log(`🔍 DEBUG - Raw webhook type: "${webhookData.type}" | Message type: "${webhookData.message?.type}"`);
      console.log(`📱 DEBUG - Phone extraction: call.customer.number="${webhookData.call?.customer?.number}" | customer.number="${webhookData.customer?.number}" | message.call.customer.number="${webhookData.message?.call?.customer?.number}"`);
      
      // For call-start events, update assistant with personalized prompt BEFORE call begins
      if (callType === 'call-start' && customerPhone) {
        console.log('🎯 Call starting - updating assistant with personalized prompt...');
        await this.promptGenerator.generateAndUpdatePrompt(customerPhone);
        return { success: true, processed: true, action: 'pre-call-personalization' };
      }
      
      // For call-end events, process the transcript with vectorization
      if (callType === 'call-end' || callType === 'end-of-call-report') {
        await this.processCallCompletion(webhookData, customerPhone, callId);
        
        // Update routing for next call
        setTimeout(async () => {
          await this.routeBasedOnLastCall();
        }, 3000);
        
        // Update assistant with personalized prompt for this customer
        setTimeout(async () => {
          console.log('🧠 Updating assistant with personalized prompt...');
          await this.promptGenerator.generateAndUpdatePrompt(customerPhone);
        }, 5000);
      }
      
      // Fallback: For first status-update webhook (start of call), trigger personalization
      if (customerPhone && callType === 'status-update') {
        console.log(`🔄 Fallback: Triggering personalization for ${customerPhone} on first status-update`);
        // Only do this once per call by checking if we've seen this call ID before
        if (!this.processedCallIds) this.processedCallIds = new Set();
        if (!this.processedCallIds.has(callId)) {
          this.processedCallIds.add(callId);
          console.log(`🎯 First status-update for call ${callId} - updating personalized prompt`);
          await this.promptGenerator.generateAndUpdatePrompt(customerPhone);
        }
      }
      
      return { success: true, processed: true };
      
    } catch (error) {
      console.error('❌ Webhook processing error:', error);
      return { success: false, error: error.message };
    }
  }
  
  async processCallCompletion(webhookData, customerPhone, callId) {
    try {
      console.log('🔍 RAW WEBHOOK DATA ANALYSIS:');
      console.log('   Keys:', Object.keys(webhookData));
      console.log('   Type:', webhookData.type);
      console.log('   Has artifact:', !!webhookData.artifact);
      console.log('   Has transcript:', !!webhookData.transcript);
      console.log('   Has call:', !!webhookData.call);
      console.log('   Has message:', !!webhookData.message);
      
      // DEBUG: Full webhook structure
      console.log('🧪 FULL WEBHOOK STRUCTURE:');
      console.log(JSON.stringify(webhookData, null, 2));
      
      // Debug the actual structure
      if (webhookData.artifact) {
        console.log('   Artifact keys:', Object.keys(webhookData.artifact));
        if (webhookData.artifact.messages) {
          console.log('   Messages count:', webhookData.artifact.messages.length);
        }
      }
      
      // Extract transcript with better parsing
      let fullTranscript = '';
      let userMessages = [];
      let assistantMessages = [];
      
      if (webhookData.artifact?.messages) {
        const messages = webhookData.artifact.messages;
        
        // Separate user and assistant messages
        userMessages = messages
          .filter(msg => msg.role === 'user')
          .map(msg => msg.content || msg.message || '')
          .filter(content => content.trim().length > 0);
          
        assistantMessages = messages
          .filter(msg => msg.role === 'assistant')
          .map(msg => msg.content || msg.message || '')
          .filter(content => content.trim().length > 0);
        
        // Create full conversation transcript
        fullTranscript = messages
          .map(msg => `${msg.role}: ${msg.content || msg.message || ''}`)
          .join('\n');
          
      } else if (webhookData.transcript) {
        fullTranscript = webhookData.transcript;
        userMessages = [fullTranscript]; // Fallback if structure isn't clear
      } else if (webhookData.call?.artifact?.messages) {
        // Alternative path for call.artifact.messages
        const messages = webhookData.call.artifact.messages;
        userMessages = messages.filter(msg => msg.role === 'user').map(msg => msg.content || msg.message || '');
        assistantMessages = messages.filter(msg => msg.role === 'assistant').map(msg => msg.content || msg.message || '');
        fullTranscript = messages.map(msg => `${msg.role}: ${msg.content || msg.message || ''}`).join('\n');
      } else if (webhookData.message?.artifact?.messages) {
        // Alternative path for message.artifact.messages
        const messages = webhookData.message.artifact.messages;
        userMessages = messages.filter(msg => msg.role === 'user').map(msg => msg.content || msg.message || '');
        assistantMessages = messages.filter(msg => msg.role === 'assistant').map(msg => msg.content || msg.message || '');
        fullTranscript = messages.map(msg => `${msg.role}: ${msg.content || msg.message || ''}`).join('\n');
      } else if (webhookData.message?.messages) {
        // Direct path for message.messages (our test case)
        const messages = webhookData.message.messages;
        userMessages = messages.filter(msg => msg.role === 'user').map(msg => msg.content || msg.message || '');
        assistantMessages = messages.filter(msg => msg.role === 'assistant').map(msg => msg.content || msg.message || '');
        fullTranscript = messages.map(msg => `${msg.role}: ${msg.content || msg.message || ''}`).join('\n');
        console.log('✅ Found transcript in message.messages');
      } else {
        console.log('⚠️  No transcript data found in any expected location');
        console.log('🔍 Full webhook structure:', JSON.stringify(webhookData, null, 2));
      }
      
      if (!customerPhone) {
        console.log('❌ No customer phone found in call completion');
        return;
      }
      
      console.log(`📝 Processing call completion for: ${customerPhone}`);
      console.log(`📄 Full transcript length: ${fullTranscript.length} chars`);
      console.log(`💬 User messages: ${userMessages.length}, Assistant messages: ${assistantMessages.length}`);
      
      // Determine call stage
      const callStage = await this.determineCallStage(customerPhone);
      
      // Extract comprehensive structured data from transcript
      const extractedData = await this.enhancedExtractor.extractComprehensiveData(fullTranscript, callStage);
      
      // Generate vector embeddings for the transcript
      const transcriptVectors = await this.generateVectorEmbeddings(fullTranscript, userMessages, callStage);
      
      // Save transcript and vectors to database
      await this.saveTranscriptWithVectors(customerPhone, callId, callStage, {
        fullTranscript,
        userMessages,
        assistantMessages,
        extractedData,
        vectors: transcriptVectors
      });
      
      // Update user progress
      await this.updateUserProgress(customerPhone, callStage, extractedData);
      
    } catch (error) {
      console.error('❌ Call completion processing error:', error);
    }
  }
  
  async generateVectorEmbeddings(fullTranscript, userMessages, callStage) {
    try {
      console.log('🧠 Generating vector embeddings...');
      
      const vectors = {};
      
      // 1. Full transcript embedding
      if (fullTranscript && fullTranscript.trim().length > 0) {
        const fullResponse = await openai.embeddings.create({
          model: "text-embedding-3-small",
          input: fullTranscript,
          encoding_format: "float",
        });
        vectors.full_transcript = fullResponse.data[0].embedding;
        console.log(`✅ Full transcript vector: ${vectors.full_transcript.length} dimensions`);
      }
      
      // 2. User-only messages embedding (customer voice)
      if (userMessages.length > 0) {
        const userText = userMessages.join(' ');
        const userResponse = await openai.embeddings.create({
          model: "text-embedding-3-small",
          input: userText,
          encoding_format: "float",
        });
        vectors.user_messages = userResponse.data[0].embedding;
        console.log(`✅ User messages vector: ${vectors.user_messages.length} dimensions`);
      }
      
      // 3. Semantic summary embedding
      const semanticSummary = await this.generateSemanticSummary(fullTranscript, callStage);
      if (semanticSummary) {
        const summaryResponse = await openai.embeddings.create({
          model: "text-embedding-3-small",
          input: semanticSummary,
          encoding_format: "float",
        });
        vectors.semantic_summary = summaryResponse.data[0].embedding;
        vectors.summary_text = semanticSummary;
        console.log(`✅ Semantic summary vector: ${vectors.semantic_summary.length} dimensions`);
      }
      
      return vectors;
      
    } catch (error) {
      console.error('❌ Vector generation error:', error);
      return {};
    }
  }
  
  async generateSemanticSummary(transcript, callStage) {
    try {
      const stageContext = {
        1: "foundation and business concept discussion",
        2: "brand identity and visual elements planning", 
        3: "operations setup and business systems planning",
        4: "launch strategy and growth planning"
      };
      
      const prompt = `Analyze this Call ${callStage} transcript (${stageContext[callStage]}) and create a concise semantic summary focusing on:
1. Key business decisions made
2. Customer preferences and requirements
3. Important details for future reference
4. Progress toward business formation goals

Transcript:
${transcript}

Provide a 2-3 sentence summary capturing the essence of this conversation:`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 150,
        temperature: 0.3
      });
      
      return response.choices[0].message.content.trim();
      
    } catch (error) {
      console.error('❌ Semantic summary generation error:', error);
      return null;
    }
  }
  
  async saveTranscriptWithVectors(customerPhone, callId, callStage, data) {
    try {
      console.log('💾 Saving transcript and vectors to database...');
      
      // First, get or create user ID
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('customer_phone', customerPhone)
        .single();
      
      if (!user) {
        console.log('❌ User not found for transcript save');
        return;
      }
      
      // Create transcript record with vectors
      const transcriptRecord = {
        user_id: user.id,
        call_id: callId,
        call_stage: callStage,
        full_transcript: data.fullTranscript,
        user_messages: data.userMessages,
        assistant_messages: data.assistantMessages,
        extracted_data: data.extractedData,
        
        // Vector embeddings
        full_transcript_vector: data.vectors.full_transcript || null,
        user_messages_vector: data.vectors.user_messages || null,
        semantic_summary_vector: data.vectors.semantic_summary || null,
        semantic_summary: data.vectors.summary_text || null,
        
        // Metadata
        vector_model: 'text-embedding-3-small',
        processed_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      };
      
      // Try to create the table if it doesn't exist (will fail gracefully if it does)
      await this.ensureTranscriptTable();
      
      // Insert transcript record
      const { error } = await supabase
        .from('call_transcripts')
        .insert(transcriptRecord);
      
      if (error) {
        console.log('❌ Transcript save error:', error.message);
      } else {
        console.log(`✅ Saved Call ${callStage} transcript with vectors for ${customerPhone}`);
        console.log(`📊 Vectors saved: ${Object.keys(data.vectors).length} embeddings`);
      }
      
    } catch (error) {
      console.error('❌ Transcript save error:', error);
    }
  }
  
  async ensureTranscriptTable() {
    try {
      // This will fail if table exists, which is fine
      await supabase.rpc('create_transcript_table_if_not_exists');
    } catch (error) {
      // Table likely already exists, which is expected
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
  
  async extractDataFromTranscript(transcript) {
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
  
  async routeBasedOnLastCall() {
    try {
      console.log('🔍 Checking for recent completed calls...');
      
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
      await this.updatePhoneRouting(1);
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
  
  // API endpoint to search transcripts by similarity
  async searchTranscriptsBySimilarity(queryText, customerPhone = null, limit = 5) {
    try {
      console.log(`🔍 Searching transcripts similar to: "${queryText}"`);
      
      // Generate embedding for query
      const queryResponse = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: queryText,
        encoding_format: "float",
      });
      
      const queryVector = queryResponse.data[0].embedding;
      
      // Use Supabase vector similarity search (requires pgvector extension)
      let query = supabase
        .from('call_transcripts')
        .select('*')
        .limit(limit);
      
      if (customerPhone) {
        // First get user ID
        const { data: user } = await supabase
          .from('users')
          .select('id')
          .eq('customer_phone', customerPhone)
          .single();
        
        if (user) {
          query = query.eq('user_id', user.id);
        }
      }
      
      const { data: transcripts, error } = await query;
      
      if (error) {
        console.log('❌ Search error:', error.message);
        return [];
      }
      
      // Calculate similarities manually if pgvector isn't available
      const results = transcripts
        .filter(t => t.full_transcript_vector)
        .map(transcript => ({
          ...transcript,
          similarity: this.cosineSimilarity(queryVector, transcript.full_transcript_vector)
        }))
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);
      
      console.log(`📊 Found ${results.length} similar transcripts`);
      return results;
      
    } catch (error) {
      console.error('❌ Similarity search error:', error);
      return [];
    }
  }
  
  cosineSimilarity(vecA, vecB) {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }
}

const vectorizer = new TranscriptVectorizer();

// Auto-route every 30 seconds based on recent activity
setInterval(async () => {
  await vectorizer.routeBasedOnLastCall();
}, 30000);

// Initial routing on startup
vectorizer.routeBasedOnLastCall();

// Health check endpoint
app.get('/api/webhook', (req, res) => {
  res.json({
    message: 'Transcript Vectorizer & Truth Table System',
    status: 'Ready',
    features: ['transcript_storage', 'vector_embeddings', 'semantic_search', 'call_routing'],
    timestamp: new Date().toISOString(),
    assistants: CALL_ASSISTANTS
  });
});

// Main webhook endpoint
app.post('/api/webhook', async (req, res) => {
  try {
    const result = await vectorizer.processCallWebhook(req.body);
    
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

// Function call handler for VAPI
app.post('/api/function-calls', async (req, res) => {
  try {
    const { message } = req.body;
    const functionCall = message.functionCall;
    
    console.log(`📞 Function call: ${functionCall.name}`);
    console.log(`📋 Parameters:`, functionCall.parameters);
    
    let result;
    
    switch (functionCall.name) {
      case 'get_customer_data':
        result = await vectorizer.getCustomerData(functionCall.parameters.phone);
        break;
        
      case 'update_customer_data':
        result = await vectorizer.updateCustomerData(
          functionCall.parameters.phone, 
          functionCall.parameters.data
        );
        break;
        
      default:
        result = { error: 'Unknown function' };
    }
    
    res.json({ result: result });
    
  } catch (error) {
    console.error('Function call error:', error);
    res.json({ result: { error: error.message } });
  }
});

// Transcript search endpoint
app.post('/api/search-transcripts', async (req, res) => {
  try {
    const { query, customerPhone, limit = 5 } = req.body;
    const results = await vectorizer.searchTranscriptsBySimilarity(query, customerPhone, limit);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`🚀 Transcript Vectorizer running on port ${port}`);
  console.log(`📍 Webhook: http://localhost:${port}/api/webhook`);
  console.log(`🔍 Search: http://localhost:${port}/api/search-transcripts`);
  console.log(`⏰ Auto-routing every 30 seconds based on recent activity`);
  console.log(`\n🧠 Vector Features:`);
  console.log(`   📄 Full transcript embeddings`);
  console.log(`   💬 User-only message embeddings`);
  console.log(`   📝 Semantic summary generation`);
  console.log(`   🔍 Similarity search capabilities`);
  console.log(`\n📞 Call Stages:`);
  Object.entries(CALL_ASSISTANTS).forEach(([stage, id]) => {
    console.log(`   Call ${stage}: ${id}`);
  });
});