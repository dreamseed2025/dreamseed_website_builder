import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const vapiPrivateKey = '3359a2eb-02e4-4f31-a5aa-37c2a020a395'

// VAPI Assistant IDs for the 4-stage call system
const CALL_ASSISTANTS = {
  1: '60400523-a331-4c4b-935d-b666ee013d42', // Call 1 - Foundation
  2: '2496625c-6fe8-4304-8b6d-045870680189', // Call 2 - Brand Identity
  3: 'b9f38474-a065-458f-bb03-eb62d21f529a', // Call 3 - Operations Setup
  4: '87416134-cfc7-47de-ad97-4951d3905ea9'  // Call 4 - Launch Strategy
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const { 
      message, 
      userId, 
      dreamId, 
      businessName, 
      businessType,
      callStage = 1, // Default to stage 1
      useVAPI = true, // Whether to use VAPI or fallback to OpenAI
      voiceId = 'elliot' // Voice ID for VAPI (default to Elliot)
    } = await request.json()

    if (!message) {
      return NextResponse.json({
        error: 'Message is required'
      }, { status: 400 })
    }

    // If VAPI is disabled or not configured, fallback to OpenAI
    if (!useVAPI || !vapiPrivateKey) {
      return await handleOpenAIFallback(message, userId, dreamId, businessName, businessType)
    }

    // Use VAPI integration
    return await handleVAPIIntegration(message, userId, dreamId, businessName, businessType, callStage, voiceId)

  } catch (error) {
    console.error('VAPI Integration error:', error)
    return NextResponse.json({
      error: 'Failed to process request',
      details: error.message
    }, { status: 500 })
  }
}

async function handleVAPIIntegration(
  message: string, 
  userId: string, 
  dreamId: string, 
  businessName: string, 
  businessType: string,
  callStage: number,
  voiceId: string = 'elliot'
) {
  try {
    // Get the appropriate assistant ID for the call stage
    const assistantId = CALL_ASSISTANTS[callStage as keyof typeof CALL_ASSISTANTS]
    
    if (!assistantId) {
      throw new Error(`Invalid call stage: ${callStage}`)
    }

    // Generate personalized system message based on user context
    const systemMessage = generatePersonalizedSystemMessage(
      userId, 
      dreamId, 
      businessName, 
      businessType, 
      callStage
    )

    // Update VAPI assistant with personalized prompt and Harry voice
    await updateVAPIAssistant(assistantId, systemMessage, voiceId)

    // VAPI is designed for phone calls, not web interactions
    // For web-based voice widget, we'll use the assistant's system message
    // but process through OpenAI with the VAPI assistant's context
    
    // Get the current assistant configuration to extract the system message
    const assistantResponse = await fetch(`https://api.vapi.ai/assistant/${assistantId}`, {
      headers: {
        'Authorization': `Bearer ${vapiPrivateKey}`
      }
    })

    if (!assistantResponse.ok) {
      throw new Error(`Failed to get assistant config: ${assistantResponse.statusText}`)
    }

    const assistantConfig = await assistantResponse.json()
    const vapiSystemMessage = assistantConfig.model?.messages?.[0]?.content || systemMessage

    // Use OpenAI with the VAPI assistant's system message
    const openAIKey = process.env.OPENAI_API_KEY
    if (!openAIKey) {
      throw new Error('OpenAI API key not configured')
    }
    
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: vapiSystemMessage },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    })

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API failed: ${openaiResponse.statusText}`)
    }

    const openaiResult = await openaiResponse.json()
    const aiResponse = openaiResult.choices?.[0]?.message?.content || "I'm sorry, I couldn't process your request."

    // Process the interaction for business formation progress
    await processVoiceWidgetInteraction(userId, dreamId, message, callStage)

    return NextResponse.json({
      response: aiResponse,
      callStage,
      assistantId,
      voiceId,
      success: true,
      source: 'vapi-11labs-elliot'
    })

  } catch (error) {
    console.error('VAPI integration error:', error)
    // Fallback to OpenAI if VAPI fails
    return await handleOpenAIFallback(message, userId, dreamId, businessName, businessType)
  }
}

async function handleOpenAIFallback(
  message: string, 
  userId: string, 
  dreamId: string, 
  businessName: string, 
  businessType: string
) {
  try {
    // Use the existing OpenAI chat API as fallback
    const openaiResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/openai-chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        systemMessage: generatePersonalizedSystemMessage(userId, dreamId, businessName, businessType, 1),
        userId,
        dreamId
      })
    })

    if (!openaiResponse.ok) {
      throw new Error('OpenAI fallback failed')
    }

    const openaiResult = await openaiResponse.json()

    return NextResponse.json({
      response: openaiResult.response,
      success: true,
      source: 'openai-fallback'
    })

  } catch (error) {
    console.error('OpenAI fallback error:', error)
    return NextResponse.json({
      response: "I'm sorry, I'm having trouble processing your request right now. Please try again.",
      success: false,
      source: 'fallback-error'
    })
  }
}

async function updateVAPIAssistant(assistantId: string, systemMessage: string, voiceId: string) {
  try {
    const response = await fetch(`https://api.vapi.ai/assistant/${assistantId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${vapiPrivateKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: {
          provider: "openai",
          model: "gpt-4o-mini",
          messages: [{
            role: "system",
            content: systemMessage
          }],
          temperature: 0.7,
          maxTokens: 1000,
          voice: voiceId // Add voiceId to the assistant configuration
        }
      })
    })

    if (!response.ok) {
      console.warn(`Failed to update VAPI assistant ${assistantId}: ${response.statusText}`)
    } else {
      console.log(`✅ Updated VAPI assistant ${assistantId} with personalized prompt and voice: ${voiceId}`)
    }

  } catch (error) {
    console.error('Error updating VAPI assistant:', error)
  }
}

function generatePersonalizedSystemMessage(
  userId: string, 
  dreamId: string, 
  businessName: string, 
  businessType: string,
  callStage: number
): string {
  const stageDescriptions = {
    1: 'Foundation & Vision - Help establish business concept, entity type, and basic structure',
    2: 'Brand Identity - Focus on business naming, branding, and market positioning',
    3: 'Operations Setup - Cover banking, accounting, compliance, and operational details',
    4: 'Launch Strategy - Discuss marketing, revenue goals, and growth planning'
  }

  let systemMessage = `You are an AI voice assistant for DreamSeed, a business formation platform. You help users with business formation, domain selection, and business planning.

Current Call Stage: ${callStage} - ${stageDescriptions[callStage as keyof typeof stageDescriptions]}

User Context:
- User ID: ${userId}
- Dream ID: ${dreamId}
- Business Name: ${businessName || 'Not specified'}
- Business Type: ${businessType || 'Not specified'}

Guidelines:
- Be conversational and friendly
- Keep responses concise (1-2 sentences for voice)
- Focus on the current call stage objectives
- Ask follow-up questions to gather required information
- Provide actionable advice for business formation
- Personalize responses based on their business type and context
- If they mention domains, offer to help find available ones
- If they mention business formation, guide them through the process

Current Stage Focus: ${stageDescriptions[callStage as keyof typeof stageDescriptions]}`

  return systemMessage
}

async function processVoiceWidgetInteraction(
  userId: string, 
  dreamId: string, 
  message: string, 
  callStage: number
) {
  try {
    // Update user progress in database
    const { error } = await supabase
      .from('users')
      .update({
        current_call_stage: callStage,
        last_interaction: new Date().toISOString()
      })
      .eq('id', userId)

    if (error) {
      console.error('Error updating user progress:', error)
    }

    // Log the interaction for analytics
    console.log(`📊 Voice Widget Interaction - User: ${userId}, Stage: ${callStage}, Message: ${message.substring(0, 100)}...`)

  } catch (error) {
    console.error('Error processing voice widget interaction:', error)
  }
}
