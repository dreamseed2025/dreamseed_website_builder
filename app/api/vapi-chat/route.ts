import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { message, systemMessage, userId, dreamId } = await request.json()

    if (!message) {
      return NextResponse.json({
        error: 'Message is required'
      }, { status: 400 })
    }

    const vapiApiKey = process.env.VAPI_API_KEY
    const vapiAssistantId = process.env.VAPI_ASSISTANT_ID

    if (!vapiApiKey || !vapiAssistantId) {
      return NextResponse.json({
        error: 'VAPI not configured'
      }, { status: 500 })
    }

    // Create a temporary assistant with dynamic system message
    const assistantConfig = {
      name: `Dynamic Assistant - User ${userId || 'anonymous'}`,
      model: {
        provider: "openai",
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: systemMessage || "You are a helpful AI assistant for DreamSeed."
          }
        ],
        temperature: 0.7
      },
      voice: {
        provider: "11labs",
        voiceId: "21m00Tcm4TlvDq8ikWAM",
        stability: 0.8
      },
      recordingEnabled: false,
      endCallPhrases: ["goodbye", "thank you", "bye", "end call"]
    }

    // Create temporary assistant
    const createResponse = await fetch('https://api.vapi.ai/assistant', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${vapiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(assistantConfig)
    })

    if (!createResponse.ok) {
      throw new Error(`Failed to create VAPI assistant: ${createResponse.statusText}`)
    }

    const assistant = await createResponse.json()
    const tempAssistantId = assistant.id

    try {
      // Start a call with the temporary assistant
      const callResponse = await fetch('https://api.vapi.ai/call', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${vapiApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          assistantId: tempAssistantId,
          type: 'web',
          metadata: {
            userId,
            dreamId,
            message
          }
        })
      })

      if (!callResponse.ok) {
        throw new Error(`Failed to start VAPI call: ${callResponse.statusText}`)
      }

      const call = await callResponse.json()

      // Send the message to the call
      const messageResponse = await fetch(`https://api.vapi.ai/call/${call.id}/message`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${vapiApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: message
        })
      })

      if (!messageResponse.ok) {
        throw new Error(`Failed to send message: ${messageResponse.statusText}`)
      }

      const messageResult = await messageResponse.json()

      // End the call
      await fetch(`https://api.vapi.ai/call/${call.id}/end`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${vapiApiKey}`
        }
      })

      // Clean up temporary assistant
      await fetch(`https://api.vapi.ai/assistant/${tempAssistantId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${vapiApiKey}`
        }
      })

      return NextResponse.json({
        response: messageResult.response || "I'm sorry, I couldn't process your request.",
        callId: call.id,
        success: true
      })

    } catch (error) {
      // Clean up temporary assistant on error
      try {
        await fetch(`https://api.vapi.ai/assistant/${tempAssistantId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${vapiApiKey}`
          }
        })
      } catch (cleanupError) {
        console.error('Failed to cleanup temporary assistant:', cleanupError)
      }
      throw error
    }

  } catch (error) {
    console.error('VAPI chat error:', error)
    return NextResponse.json({
      error: 'Failed to process VAPI chat request',
      details: error.message
    }, { status: 500 })
  }
}

