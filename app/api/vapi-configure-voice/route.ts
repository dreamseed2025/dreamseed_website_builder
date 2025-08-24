import { NextRequest, NextResponse } from 'next/server'

const VAPI_PRIVATE_KEY = '3359a2eb-02e4-4f31-a5aa-37c2a020a395'

const CALL_ASSISTANTS = {
  1: '60400523-a331-4c4b-935d-b666ee013d42', // Foundation
  2: '2496625c-6fe8-4304-8b6d-045870680189', // Brand Identity
  3: 'b9f38474-a065-458f-bb03-eb62d21f529a', // Operations Setup
  4: '87416134-cfc7-47de-ad97-4951d3905ea9'  // Launch Strategy
}

export async function POST(request: NextRequest) {
  try {
    const { 
      assistantId, 
      voice = 'elliot',
      widgetConfig = {},
      systemMessage,
      model = 'gpt-4o-mini',
      temperature = 0.3
    } = await request.json()

    if (!assistantId) {
      return NextResponse.json({ error: 'Assistant ID is required' }, { status: 400 })
    }

    console.log(`🎤 Configuring VAPI assistant ${assistantId}`)
    console.log('📋 Configuration:', { voice, widgetConfig, systemMessage, model, temperature })

    // Get current assistant configuration
    const getResponse = await fetch(`https://api.vapi.ai/assistant/${assistantId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${VAPI_PRIVATE_KEY}`,
        'Content-Type': 'application/json'
      }
    })

    if (!getResponse.ok) {
      throw new Error(`Failed to get assistant: ${getResponse.statusText}`)
    }

    const currentAssistant = await getResponse.json()
    console.log('📋 Current assistant configuration:', JSON.stringify(currentAssistant, null, 2))

    // Prepare update payload - only include updatable fields
    const updatePayload: any = {}
    
    // Only include fields that can be updated
    if (currentAssistant.name) updatePayload.name = currentAssistant.name
    if (currentAssistant.model) updatePayload.model = currentAssistant.model
    if (currentAssistant.recordingEnabled !== undefined) updatePayload.recordingEnabled = currentAssistant.recordingEnabled
    if (currentAssistant.endCallMessage) updatePayload.endCallMessage = currentAssistant.endCallMessage
    if (currentAssistant.transcriber) updatePayload.transcriber = currentAssistant.transcriber
    if (currentAssistant.serverUrl) updatePayload.serverUrl = currentAssistant.serverUrl
    if (currentAssistant.endCallPhrases) updatePayload.endCallPhrases = currentAssistant.endCallPhrases
    if (currentAssistant.backgroundSound) updatePayload.backgroundSound = currentAssistant.backgroundSound
    if (currentAssistant.analysisPlan) updatePayload.analysisPlan = currentAssistant.analysisPlan
    if (currentAssistant.server) updatePayload.server = currentAssistant.server

    // Update voice configuration
    if (voice) {
      updatePayload.voice = {
        provider: 'vapi',
        voiceId: voice.charAt(0).toUpperCase() + voice.slice(1) // Capitalize first letter
      }
    }

    // Update model configuration
    if (model || temperature !== undefined || systemMessage) {
      updatePayload.model = {
        ...currentAssistant.model,
        ...(model && { model }),
        ...(temperature !== undefined && { temperature }),
        ...(systemMessage && {
          messages: [
            {
              role: 'system',
              content: systemMessage
            }
          ]
        })
      }
    }

    // Update widget-specific configurations
    // Note: Most widget properties are HTML attributes, not assistant properties
    // Only a few properties can be set on the assistant itself
    if (Object.keys(widgetConfig).length > 0) {
      // Only update assistant properties that are actually supported
      if (widgetConfig.buttonLabel) {
        updatePayload.buttonLabel = widgetConfig.buttonLabel
      }
      if (widgetConfig.endCallMessage) {
        updatePayload.endCallMessage = widgetConfig.endCallMessage
      }
      if (widgetConfig.recordingEnabled !== undefined) {
        updatePayload.recordingEnabled = widgetConfig.recordingEnabled
      }
      if (widgetConfig.backgroundSound) {
        updatePayload.backgroundSound = widgetConfig.backgroundSound
      }
      
      // Store widget configuration as metadata for reference
      updatePayload.metadata = {
        ...updatePayload.metadata,
        widgetConfiguration: widgetConfig
      }
    }

    console.log('📤 Update payload:', JSON.stringify(updatePayload, null, 2))

    // Update assistant
    const updateResponse = await fetch(`https://api.vapi.ai/assistant/${assistantId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${VAPI_PRIVATE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatePayload)
    })

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text()
      console.error('❌ Failed to update assistant:', errorText)
      throw new Error(`Failed to update assistant: ${updateResponse.statusText}`)
    }

    const updatedAssistant = await updateResponse.json()
    console.log('✅ Assistant updated successfully:', JSON.stringify(updatedAssistant, null, 2))

    return NextResponse.json({
      success: true,
      message: `Assistant ${assistantId} configured successfully`,
      assistant: updatedAssistant,
      changes: {
        voice: voice ? `Set to ${voice}` : 'No change',
        model: model ? `Set to ${model}` : 'No change',
        temperature: temperature !== undefined ? `Set to ${temperature}` : 'No change',
        systemMessage: systemMessage ? 'Updated' : 'No change',
        widgetConfig: Object.keys(widgetConfig).length > 0 ? 'Updated' : 'No change'
      }
    })

  } catch (error) {
    console.error('❌ Error configuring VAPI assistant:', error)
    return NextResponse.json(
      { error: `Failed to configure assistant: ${error.message}` },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const assistantId = searchParams.get('assistantId')

    if (!assistantId) {
      return NextResponse.json({ error: 'Assistant ID is required' }, { status: 400 })
    }

    console.log(`🔍 Getting VAPI assistant configuration: ${assistantId}`)

    const response = await fetch(`https://api.vapi.ai/assistant/${assistantId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${VAPI_PRIVATE_KEY}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to get assistant: ${response.statusText}`)
    }

    const assistant = await response.json()
    console.log('📋 Assistant configuration:', JSON.stringify(assistant, null, 2))

    // Extract widget-relevant configurations
    const widgetConfig = {
      voice: assistant.voice,
      model: assistant.model,
      // Basic settings
      buttonLabel: assistant.buttonLabel,
      endCallMessage: assistant.endCallMessage,
      recordingEnabled: assistant.recordingEnabled,
      backgroundSound: assistant.backgroundSound,
      serverUrl: assistant.serverUrl,
      transcriber: assistant.transcriber,
      // Advanced settings
      mode: assistant.mode,
      theme: assistant.theme,
      baseBgColor: assistant.baseBgColor,
      accentColor: assistant.accentColor,
      ctaButtonColor: assistant.ctaButtonColor,
      ctaButtonTextColor: assistant.ctaButtonTextColor,
      borderRadius: assistant.borderRadius,
      size: assistant.size,
      position: assistant.position,
      title: assistant.title,
      startButtonText: assistant.startButtonText,
      endButtonText: assistant.endButtonText,
      chatFirstMessage: assistant.chatFirstMessage,
      chatPlaceholder: assistant.chatPlaceholder,
      voiceShowTranscript: assistant.voiceShowTranscript,
      consentRequired: assistant.consentRequired,
      consentTitle: assistant.consentTitle,
      consentContent: assistant.consentContent,
      consentStorageKey: assistant.consentStorageKey
    }

    return NextResponse.json({
      success: true,
      assistant,
      widgetConfig
    })

  } catch (error) {
    console.error('❌ Error getting VAPI assistant:', error)
    return NextResponse.json(
      { error: `Failed to get assistant: ${error.message}` },
      { status: 500 }
    )
  }
}
