import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const openAIKey = process.env.OPENAI_API_KEY!

// Simple in-memory truth table processor for now
class SimpleTruthTableProcessor {
  private supabase: any
  
  constructor() {
    this.supabase = createClient(supabaseUrl, supabaseServiceKey)
  }
  
  async processCallWebhook(webhookData: any) {
    try {
      console.log('🔍 Processing call webhook...')
      console.log('Webhook data keys:', Object.keys(webhookData))
      
      // Extract basic info from webhook
      const callId = webhookData.callId || webhookData.call?.id || 'unknown'
      const callType = webhookData.type || webhookData.event_type || 'unknown'
      const timestamp = new Date().toISOString()
      
      // Try to extract transcript
      let transcript = ''
      if (webhookData.artifact?.messages) {
        transcript = webhookData.artifact.messages
          .map((msg: any) => `${msg.role}: ${msg.content || msg.message || ''}`)
          .join('\\n')
      } else if (webhookData.messages) {
        transcript = webhookData.messages
          .map((msg: any) => `${msg.role}: ${msg.content || msg.message || ''}`)
          .join('\\n')
      } else if (webhookData.transcript) {
        transcript = webhookData.transcript
      }
      
      // Extract customer info if available
      const customerPhone = webhookData.call?.customer?.number || 
                          webhookData.customer?.number ||
                          webhookData.customerNumber
      
      const customerEmail = webhookData.call?.customer?.email ||
                          webhookData.customer?.email ||
                          webhookData.customerEmail
      
      console.log(`📞 Call ${callId} - Type: ${callType}`)
      console.log(`📱 Customer: ${customerPhone || customerEmail || 'Unknown'}`)
      console.log(`📝 Transcript length: ${transcript.length} chars`)
      
      // Simple extraction without AI for now
      const extractedData = this.simpleDataExtraction(transcript)
      
      if (customerEmail || customerPhone) {
        // Update user record
        const customerIdentifier = customerEmail || customerPhone
        await this.updateUserRecord(customerIdentifier, extractedData, transcript)
      }
      
      // Log the processing
      console.log(`✅ Processed webhook for call ${callId}`)
      console.log(`📊 Extracted ${Object.keys(extractedData).length} data points`)
      
      return {
        success: true,
        callId,
        timestamp,
        extractedFields: Object.keys(extractedData).length,
        transcriptLength: transcript.length
      }
      
    } catch (error) {
      console.error('❌ Webhook processing error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }
  
  simpleDataExtraction(transcript: string) {
    const lowerTranscript = transcript.toLowerCase()
    const extracted: any = {}
    
    // Simple keyword-based extraction
    if (lowerTranscript.includes('my name is') || lowerTranscript.includes('i am') || lowerTranscript.includes('this is')) {
      const nameMatch = transcript.match(/(?:my name is|i am|this is)\\s+([a-zA-Z\\s]+)/i)
      if (nameMatch) {
        extracted.customer_name = nameMatch[1].trim()
      }
    }
    
    if (lowerTranscript.includes('business') || lowerTranscript.includes('company')) {
      if (lowerTranscript.includes('called') || lowerTranscript.includes('named')) {
        const businessMatch = transcript.match(/(?:business|company)\\s+(?:called|named)\\s+([a-zA-Z\\s]+)/i)
        if (businessMatch) {
          extracted.business_name = businessMatch[1].trim()
        }
      }
    }
    
    if (lowerTranscript.includes('email')) {
      const emailMatch = transcript.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})/i)
      if (emailMatch) {
        extracted.customer_email = emailMatch[1]
      }
    }
    
    if (lowerTranscript.includes('phone') || lowerTranscript.includes('number')) {
      const phoneMatch = transcript.match(/(\\(\\d{3}\\)\\s?\\d{3}-\\d{4}|\\d{3}-\\d{3}-\\d{4}|\\d{10})/i)
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
    
    const processor = new SimpleTruthTableProcessor()
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
    message: 'Truth Table Webhook Endpoint',
    status: 'Ready to receive VAPI webhooks',
    url: '/api/webhook',
    methods: ['POST'],
    environment: {
      supabase: !!supabaseUrl,
      openai: !!openAIKey
    }
  })
}