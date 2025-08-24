import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: NextRequest) {
  try {
    const { message, systemMessage, userId, dreamId, conversation = [] } = await request.json()

    if (!message) {
      return NextResponse.json({
        error: 'Message is required'
      }, { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        error: 'OpenAI API key not configured'
      }, { status: 500 })
    }

    // Build conversation messages
    const messages = [
      {
        role: 'system' as const,
        content: systemMessage || `You are an AI voice assistant for DreamSeed, a business formation platform. You help users with business formation, domain selection, and business planning. Be conversational, friendly, and provide actionable advice. Keep responses concise (1-2 sentences).`
      }
    ]

    // Add conversation history (last 10 messages for context)
    const recentMessages = conversation.slice(-10)
    for (const msg of recentMessages) {
      messages.push({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })
    }

    // Add current message
    messages.push({
      role: 'user' as const,
      content: message
    })

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 150,
      temperature: 0.7,
      user: userId || 'anonymous'
    })

    const response = completion.choices[0]?.message?.content || "I'm sorry, I couldn't process your request."

    // Log the interaction for analytics
    try {
      console.log(`OpenAI Chat - User: ${userId}, Dream: ${dreamId}, Message: ${message.substring(0, 100)}...`)
    } catch (logError) {
      // Ignore logging errors
    }

    return NextResponse.json({
      response,
      usage: completion.usage,
      success: true
    })

  } catch (error) {
    console.error('OpenAI chat error:', error)
    
    if (error instanceof OpenAI.APIError) {
      return NextResponse.json({
        error: 'OpenAI API error',
        details: error.message,
        status: error.status
      }, { status: error.status || 500 })
    }

    return NextResponse.json({
      error: 'Failed to process OpenAI chat request',
      details: error.message
    }, { status: 500 })
  }
}

