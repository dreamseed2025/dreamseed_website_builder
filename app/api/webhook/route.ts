import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const openAIKey = process.env.OPENAI_API_KEY!

// Initialize OpenAI for vector generation
const openai = new OpenAI({
  apiKey: openAIKey
})

// Enhanced transcript processor with vector generation
class EnhancedTranscriptProcessor {
  private supabase: any
  
  constructor() {
    this.supabase = createClient(supabaseUrl, supabaseServiceKey)
  }
  
  async processCallWebhook(webhookData: any) {
    try {
      console.log('🔍 Processing call webhook with vector generation...')
      console.log('Webhook data keys:', Object.keys(webhookData))
      
      // Extract basic info from webhook
      const callId = webhookData.callId || webhookData.call?.id || 'unknown'
      const callType = webhookData.type || webhookData.event_type || 'unknown'
      const timestamp = new Date().toISOString()
      
      // Only process call completion events
      if (callType !== 'call-end' && callType !== 'end-of-call-report') {
        console.log(`⏭️ Skipping non-completion event: ${callType}`)
        return {
          success: true,
          callId,
          eventType: callType,
          message: 'Event processed (not a call completion)'
        }
      }
      
      // Extract transcript and messages
      let fullTranscript = ''
      let userMessages: string[] = []
      let assistantMessages: string[] = []
      
      if (webhookData.artifact?.messages) {
        fullTranscript = webhookData.artifact.messages
          .map((msg: any) => `${msg.role}: ${msg.content || msg.message || ''}`)
          .join('\n')
        
        // Separate user and assistant messages
        userMessages = webhookData.artifact.messages
          .filter((msg: any) => msg.role === 'user')
          .map((msg: any) => msg.content || msg.message || '')
        
        assistantMessages = webhookData.artifact.messages
          .filter((msg: any) => msg.role === 'assistant')
          .map((msg: any) => msg.content || msg.message || '')
      } else if (webhookData.messages) {
        fullTranscript = webhookData.messages
          .map((msg: any) => `${msg.role}: ${msg.content || msg.message || ''}`)
          .join('\n')
        
        userMessages = webhookData.messages
          .filter((msg: any) => msg.role === 'user')
          .map((msg: any) => msg.content || msg.message || '')
        
        assistantMessages = webhookData.messages
          .filter((msg: any) => msg.role === 'assistant')
          .map((msg: any) => msg.content || msg.message || '')
      } else if (webhookData.transcript) {
        fullTranscript = webhookData.transcript
      }
      
      // Extract customer info
      const customerPhone = webhookData.call?.customer?.number || 
                          webhookData.customer?.number ||
                          webhookData.customerNumber
      
      const customerEmail = webhookData.call?.customer?.email ||
                          webhookData.customer?.email ||
                          webhookData.customerEmail
      
      console.log(`📞 Call ${callId} - Type: ${callType}`)
      console.log(`📱 Customer: ${customerPhone || customerEmail || 'Unknown'}`)
      console.log(`📝 Transcript length: ${fullTranscript.length} chars`)
      console.log(`💬 User messages: ${userMessages.length}, Assistant messages: ${assistantMessages.length}`)
      
      if (!customerPhone && !customerEmail) {
        console.log('❌ No customer identifier found')
        return {
          success: false,
          error: 'No customer identifier found'
        }
      }
      
      if (!fullTranscript) {
        console.log('❌ No transcript found')
        return {
          success: false,
          error: 'No transcript found'
        }
      }
      
      // Determine call stage
      const callStage = await this.determineCallStage(customerPhone || customerEmail)
      
      // Extract structured data
      const extractedData = await this.extractDataFromTranscript(fullTranscript, callStage)
      
      // Generate vector embeddings
      const vectors = await this.generateVectorEmbeddings(fullTranscript, userMessages, callStage)
      
      // Save transcript with vectors to database
      await this.saveTranscriptWithVectors(customerPhone || customerEmail, callId, callStage, {
        fullTranscript,
        userMessages,
        assistantMessages,
        extractedData,
        vectors
      })
      
      // Update user record
      await this.updateUserRecord(customerPhone || customerEmail, extractedData, fullTranscript)
      
      console.log(`✅ Processed call completion for ${callId}`)
      console.log(`📊 Extracted ${Object.keys(extractedData).length} data points`)
      console.log(`🧠 Generated ${Object.keys(vectors).length} vector embeddings`)
      
      return {
        success: true,
        callId,
        timestamp,
        callStage,
        extractedFields: Object.keys(extractedData).length,
        vectorsGenerated: Object.keys(vectors).length,
        transcriptLength: fullTranscript.length
      }
      
    } catch (error) {
      console.error('❌ Webhook processing error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }
  
  async determineCallStage(customerIdentifier: string): Promise<number> {
    try {
      // Try to find user by phone or email
      let user = null
      
      if (customerIdentifier.includes('@')) {
        const { data } = await this.supabase
          .from('users')
          .select('current_call_stage, call_1_completed, call_2_completed, call_3_completed, call_4_completed')
          .eq('customer_email', customerIdentifier)
          .single()
        user = data
      } else {
        const { data } = await this.supabase
          .from('users')
          .select('current_call_stage, call_1_completed, call_2_completed, call_3_completed, call_4_completed')
          .eq('customer_phone', customerIdentifier)
          .single()
        user = data
      }
      
      if (!user) return 1
      
      // Determine which call they just completed
      if (!user.call_1_completed) return 1
      if (!user.call_2_completed) return 2
      if (!user.call_3_completed) return 3
      if (!user.call_4_completed) return 4
      return 4 // All complete
    } catch (error) {
      console.error('Error determining call stage:', error)
      return 1
    }
  }

  async extractDataFromTranscript(transcript: string, callStage: number) {
    try {
      const systemPrompt = `You are a data extraction specialist. Extract structured business formation data from conversation transcripts.
      
      Return ONLY valid JSON with these exact fields (use null if not found):
      {
        "customer_name": "full name",
        "customer_email": "email@domain.com", 
        "customer_phone": "+1XXXXXXXXXX format",
        "business_name": "specific business name if mentioned",
        "business_type": "type of business/industry",
        "state_of_operation": "state name",
        "entity_type": "LLC/Corp/Inc/etc",
        "services": "what services/products they offer",
        "timeline": "Immediate/Within a month/Flexible/specific timeframe",
        "package_preference": "Basic/Standard/Premium if mentioned",
        "urgency_level": "High/Medium/Low",
        "key_requirements": "array of main requirements mentioned",
        "pain_points": "problems they're trying to solve",
        "budget_mentioned": "any budget discussed",
        "next_steps": "what they agreed to do next"
      }
      
      Important:
      - Convert "at" and "dot" to @ and . in emails
      - Format phone as +1 followed by 10 digits
      - Use proper case for names and states
      - Extract the essence, not literal text`

      const userPrompt = `Extract business formation data from this conversation (Call ${callStage}):
      
      ${transcript}
      
      Return ONLY the JSON object with extracted data.`

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.1,
        max_tokens: 500
      })

      const responseText = completion.choices[0].message.content
      
      // Parse the JSON response
      try {
        const cleanJson = responseText.replace(/```json\n?|\n?```/g, '').trim()
        return JSON.parse(cleanJson)
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError.message)
        return {}
      }
    } catch (error) {
      console.error('AI extraction error:', error)
      // Fallback to simple extraction
      return this.simpleDataExtraction(transcript)
    }
  }

  async generateVectorEmbeddings(fullTranscript: string, userMessages: string[], callStage: number) {
    try {
      console.log('🧠 Generating vector embeddings...')
      
      const vectors: any = {}
      
      // 1. Full transcript embedding
      if (fullTranscript && fullTranscript.trim().length > 0) {
        const fullResponse = await openai.embeddings.create({
          model: "text-embedding-3-small",
          input: fullTranscript,
          encoding_format: "float",
        })
        vectors.full_transcript = fullResponse.data[0].embedding
        console.log(`✅ Full transcript vector: ${vectors.full_transcript.length} dimensions`)
      }
      
      // 2. User-only messages embedding (customer voice)
      if (userMessages.length > 0) {
        const userText = userMessages.join(' ')
        const userResponse = await openai.embeddings.create({
          model: "text-embedding-3-small",
          input: userText,
          encoding_format: "float",
        })
        vectors.user_messages = userResponse.data[0].embedding
        console.log(`✅ User messages vector: ${vectors.user_messages.length} dimensions`)
      }
      
      // 3. Semantic summary embedding
      const semanticSummary = await this.generateSemanticSummary(fullTranscript, callStage)
      if (semanticSummary) {
        const summaryResponse = await openai.embeddings.create({
          model: "text-embedding-3-small",
          input: semanticSummary,
          encoding_format: "float",
        })
        vectors.semantic_summary = summaryResponse.data[0].embedding
        vectors.summary_text = semanticSummary
        console.log(`✅ Semantic summary vector: ${vectors.semantic_summary.length} dimensions`)
      }
      
      return vectors
      
    } catch (error) {
      console.error('❌ Vector generation error:', error)
      return {}
    }
  }

  async generateSemanticSummary(transcript: string, callStage: number) {
    try {
      const systemPrompt = `You are a conversation summarizer. Create a concise, semantic summary of business formation conversations.
      
      Focus on:
      - Key business decisions made
      - Customer preferences and requirements
      - Important details about their business concept
      - Next steps agreed upon
      
      Keep summary under 200 words and focus on actionable insights.`

      const userPrompt = `Summarize this business formation conversation (Call ${callStage}):
      
      ${transcript}
      
      Provide a concise summary focusing on key business decisions and customer preferences.`

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 300
      })

      return completion.choices[0].message.content
    } catch (error) {
      console.error('Semantic summary error:', error)
      return null
    }
  }

  async saveTranscriptWithVectors(customerIdentifier: string, callId: string, callStage: number, data: any) {
    try {
      console.log('💾 Saving transcript and vectors to database...')
      
      // First, get or create user ID
      let user = null
      
      if (customerIdentifier.includes('@')) {
        const { data: userData } = await this.supabase
          .from('users')
          .select('id')
          .eq('customer_email', customerIdentifier)
          .single()
        user = userData
      } else {
        const { data: userData } = await this.supabase
          .from('users')
          .select('id')
          .eq('customer_phone', customerIdentifier)
          .single()
        user = userData
      }
      
      if (!user) {
        console.log('❌ User not found for transcript save')
        return
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
      }
      
      // Insert transcript record
      const { error } = await this.supabase
        .from('call_transcripts')
        .insert(transcriptRecord)
      
      if (error) {
        console.log('❌ Transcript save error:', error.message)
      } else {
        console.log(`✅ Saved Call ${callStage} transcript with vectors for ${customerIdentifier}`)
        console.log(`📊 Vectors saved: ${Object.keys(data.vectors).length} embeddings`)
      }
      
    } catch (error) {
      console.error('❌ Transcript save error:', error)
    }
  }

  simpleDataExtraction(transcript: string) {
    const lowerTranscript = transcript.toLowerCase()
    const extracted: any = {}
    
    // Simple keyword-based extraction
    if (lowerTranscript.includes('my name is') || lowerTranscript.includes('i am') || lowerTranscript.includes('this is')) {
      const nameMatch = transcript.match(/(?:my name is|i am|this is)\s+([a-zA-Z\s]+)/i)
      if (nameMatch) {
        extracted.customer_name = nameMatch[1].trim()
      }
    }
    
    if (lowerTranscript.includes('business') || lowerTranscript.includes('company')) {
      if (lowerTranscript.includes('called') || lowerTranscript.includes('named')) {
        const businessMatch = transcript.match(/(?:business|company)\s+(?:called|named)\s+([a-zA-Z\s]+)/i)
        if (businessMatch) {
          extracted.business_name = businessMatch[1].trim()
        }
      }
    }
    
    if (lowerTranscript.includes('email')) {
      const emailMatch = transcript.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i)
      if (emailMatch) {
        extracted.customer_email = emailMatch[1]
      }
    }
    
    if (lowerTranscript.includes('phone') || lowerTranscript.includes('number')) {
      const phoneMatch = transcript.match(/(\(\d{3}\)\s?\d{3}-\d{4}|\d{3}-\d{3}-\d{4}|\d{10})/i)
      if (phoneMatch) {
        extracted.customer_phone = phoneMatch[1]
      }
    }
    
    // Business type detection
    const businessTypes = ['llc', 'corporation', 'partnership', 'sole proprietorship']
    for (const type of businessTypes) {
      if (lowerTranscript.includes(type)) {
        extracted.entity_type = type.toUpperCase()
        break
      }
    }
    
    // Urgency detection
    if (lowerTranscript.includes('urgent') || lowerTranscript.includes('asap') || lowerTranscript.includes('soon')) {
      extracted.urgency_level = 'High'
    } else if (lowerTranscript.includes('no rush') || lowerTranscript.includes('take time')) {
      extracted.urgency_level = 'Low'
    }
    
    return extracted
  }
  
  async updateUserRecord(customerIdentifier: string, extractedData: any, transcript: string) {
    try {
      // Try to find existing user by email or phone
      let existingUser = null
      
      if (customerIdentifier.includes('@')) {
        const { data } = await this.supabase
          .from('users')
          .select('*')
          .eq('customer_email', customerIdentifier)
          .single()
        existingUser = data
      } else {
        const { data } = await this.supabase
          .from('users')
          .select('*')
          .eq('customer_phone', customerIdentifier)
          .single()
        existingUser = data
      }
      
      const updateData = {
        ...extractedData,
        updated_at: new Date().toISOString(),
        current_call_stage: Math.max((existingUser?.current_call_stage || 0), 1),
        call_1_completed: true,
        call_1_completed_at: new Date().toISOString()
      }
      
      if (existingUser) {
        // Update existing user
        const { error } = await this.supabase
          .from('users')
          .update(updateData)
          .eq('id', existingUser.id)
          
        if (error) {
          console.log('❌ Update error:', error.message)
        } else {
          console.log(`✅ Updated user ${customerIdentifier}`)
        }
      } else {
        // Create new user record
        const newUser = {
          customer_email: customerIdentifier.includes('@') ? customerIdentifier : null,
          customer_phone: !customerIdentifier.includes('@') ? customerIdentifier : null,
          ...updateData,
          status: 'call_in_progress'
        }
        
        const { error } = await this.supabase
          .from('users')
          .insert(newUser)
          
        if (error) {
          console.log('❌ Insert error:', error.message)
        } else {
          console.log(`✅ Created user ${customerIdentifier}`)
        }
      }
      
    } catch (error) {
      console.error('❌ User update error:', error)
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const webhookData = await request.json()
    
    console.log('🎯 Webhook received!')
    console.log('📊 Data size:', JSON.stringify(webhookData).length, 'chars')
    
    const processor = new EnhancedTranscriptProcessor()
    const result = await processor.processCallWebhook(webhookData)
    
    return NextResponse.json({
      received: true,
      timestamp: new Date().toISOString(),
      processing: result
    })
    
  } catch (error) {
    console.error('❌ Webhook error:', error)
    return NextResponse.json({
      error: 'Webhook processing failed',
      message: error.message
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Enhanced Transcript Processing Webhook Endpoint',
    status: 'Ready to receive VAPI webhooks with vector generation',
    url: '/api/webhook',
    methods: ['POST'],
    features: [
      'Transcript extraction and storage',
      'Vector embedding generation',
      'Semantic summary creation',
      'Structured data extraction',
      'Call stage determination'
    ],
    environment: {
      supabase: !!supabaseUrl,
      openai: !!openAIKey
    }
  })
}