import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File

    if (!audioFile) {
      return NextResponse.json({
        error: 'Audio file is required'
      }, { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        error: 'OpenAI API key not configured'
      }, { status: 500 })
    }

    // Convert File to Buffer
    const bytes = await audioFile.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Call OpenAI Whisper API with buffer directly
    const transcription = await openai.audio.transcriptions.create({
      file: buffer,
      model: 'whisper-1',
      language: 'en',
      response_format: 'text'
    })

    return NextResponse.json({
      transcript: transcription,
      success: true
    })

  } catch (error) {
    console.error('Whisper transcription error:', error)
    
    if (error instanceof OpenAI.APIError) {
      return NextResponse.json({
        error: 'OpenAI Whisper API error',
        details: error.message,
        status: error.status
      }, { status: error.status || 500 })
    }

    return NextResponse.json({
      error: 'Failed to transcribe audio',
      details: error.message
    }, { status: 500 })
  }
}
