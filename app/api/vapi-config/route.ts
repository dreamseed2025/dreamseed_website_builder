import { NextRequest, NextResponse } from 'next/server'

// VAPI Configuration for the 4-stage call system
const VAPI_CONFIG = {
  publicKey: 'pk_test_3359a2eb-02e4-4f31-a5aa-37c2a020a395', // Public key for frontend
  privateKey: '3359a2eb-02e4-4f31-a5aa-37c2a020a395', // Private key for backend
  assistants: {
    1: {
      id: '60400523-a331-4c4b-935d-b666ee013d42',
      name: 'Foundation & Vision',
      description: 'Help establish business concept, entity type, and basic structure',
      stage: 1
    },
    2: {
      id: '2496625c-6fe8-4304-8b6d-045870680189',
      name: 'Brand Identity',
      description: 'Focus on business naming, branding, and market positioning',
      stage: 2
    },
    3: {
      id: 'b9f38474-a065-458f-bb03-eb62d21f529a',
      name: 'Operations Setup',
      description: 'Cover banking, accounting, compliance, and operational details',
      stage: 3
    },
    4: {
      id: '87416134-cfc7-47de-ad97-4951d3905ea9',
      name: 'Launch Strategy',
      description: 'Discuss marketing, revenue goals, and growth planning',
      stage: 4
    }
  },
  phoneNumberId: '2d5a3ced-7573-4482-bc71-1e5ad4e5af97',
  webhookUrl: process.env.NEXT_PUBLIC_BASE_URL ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhook` : 'http://localhost:3000/api/webhook',
  integrationStatus: 'active',
  features: {
    dynamicPrompts: true,
    callRouting: true,
    transcriptProcessing: true,
    businessFormation: true,
    voiceWidget: true
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check if VAPI is properly configured
    const isConfigured = VAPI_CONFIG.privateKey && VAPI_CONFIG.publicKey
    
    if (!isConfigured) {
      return NextResponse.json({
        configured: false,
        message: 'VAPI not configured',
        error: 'Missing VAPI credentials'
      }, { status: 404 })
    }

    // Return VAPI configuration (excluding sensitive private key)
    return NextResponse.json({
      configured: true,
      publicKey: VAPI_CONFIG.publicKey,
      assistants: VAPI_CONFIG.assistants,
      phoneNumberId: VAPI_CONFIG.phoneNumberId,
      webhookUrl: VAPI_CONFIG.webhookUrl,
      integrationStatus: VAPI_CONFIG.integrationStatus,
      features: VAPI_CONFIG.features,
      message: 'VAPI integration is active and ready'
    })

  } catch (error) {
    console.error('VAPI Config error:', error)
    return NextResponse.json({
      configured: false,
      error: 'Failed to load VAPI configuration',
      details: error.message
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, assistantId, callStage } = await request.json()

    switch (action) {
      case 'getAssistant':
        if (callStage && VAPI_CONFIG.assistants[callStage as keyof typeof VAPI_CONFIG.assistants]) {
          return NextResponse.json({
            success: true,
            assistant: VAPI_CONFIG.assistants[callStage as keyof typeof VAPI_CONFIG.assistants]
          })
        } else {
          return NextResponse.json({
            success: false,
            error: 'Invalid call stage'
          }, { status: 400 })
        }

      case 'getAllAssistants':
        return NextResponse.json({
          success: true,
          assistants: VAPI_CONFIG.assistants
        })

      case 'testConnection':
        // Test VAPI API connection
        try {
          const response = await fetch('https://api.vapi.ai/assistant', {
            headers: {
              'Authorization': `Bearer ${VAPI_CONFIG.privateKey}`
            }
          })
          
          if (response.ok) {
            return NextResponse.json({
              success: true,
              message: 'VAPI API connection successful'
            })
          } else {
            return NextResponse.json({
              success: false,
              error: 'VAPI API connection failed',
              status: response.status
            })
          }
        } catch (error) {
          return NextResponse.json({
            success: false,
            error: 'VAPI API connection error',
            details: error.message
          })
        }

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action'
        }, { status: 400 })
    }

  } catch (error) {
    console.error('VAPI Config POST error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to process request',
      details: error.message
    }, { status: 500 })
  }
}
