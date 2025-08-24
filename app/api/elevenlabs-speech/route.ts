import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { text, voiceId, modelId = 'eleven_monolingual_v1' } = await request.json()

    if (!text || !voiceId) {
      return NextResponse.json({
        error: 'Text and voiceId are required'
      }, { status: 400 })
    }

    // Get 11labs API key from environment
    const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY
    
    if (!elevenLabsApiKey) {
      console.warn('11labs API key not configured, falling back to browser speech synthesis')
      return NextResponse.json({
        error: '11labs API key not configured'
      }, { status: 500 })
    }

    // Call 11labs API
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': elevenLabsApiKey
      },
      body: JSON.stringify({
        text,
        model_id: modelId,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5
        }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('11labs API error:', response.status, errorText)
      return NextResponse.json({
        error: `11labs API error: ${response.status}`
      }, { status: response.status })
    }

    // Get the audio data
    const audioBuffer = await response.arrayBuffer()
    
    // Return the audio as a blob
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-cache'
      }
    })

  } catch (error) {
    console.error('11labs speech error:', error)
    return NextResponse.json({
      error: 'Failed to generate speech',
      details: error.message
    }, { status: 500 })
  }
}

