import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { 
      assistantId, 
      publicKey,
      widgetConfig = {}
    } = await request.json()

    if (!assistantId || !publicKey) {
      return NextResponse.json({ 
        error: 'Assistant ID and Public Key are required' 
      }, { status: 400 })
    }

    console.log(`🎨 Generating VAPI widget embed code for assistant ${assistantId}`)
    console.log('📋 Widget configuration:', widgetConfig)

    // Build widget attributes
    const widgetAttributes = [
      `assistant-id="${assistantId}"`,
      `public-key="${publicKey}"`
    ]

    // Add widget configuration attributes
    if (widgetConfig.mode) widgetAttributes.push(`mode="${widgetConfig.mode}"`)
    if (widgetConfig.theme) widgetAttributes.push(`theme="${widgetConfig.theme}"`)
    if (widgetConfig.baseBgColor) widgetAttributes.push(`base-bg-color="${widgetConfig.baseBgColor}"`)
    if (widgetConfig.accentColor) widgetAttributes.push(`accent-color="${widgetConfig.accentColor}"`)
    if (widgetConfig.ctaButtonColor) widgetAttributes.push(`cta-button-color="${widgetConfig.ctaButtonColor}"`)
    if (widgetConfig.ctaButtonTextColor) widgetAttributes.push(`cta-button-text-color="${widgetConfig.ctaButtonTextColor}"`)
    if (widgetConfig.borderRadius) widgetAttributes.push(`border-radius="${widgetConfig.borderRadius}"`)
    if (widgetConfig.size) widgetAttributes.push(`size="${widgetConfig.size}"`)
    if (widgetConfig.position) widgetAttributes.push(`position="${widgetConfig.position}"`)
    if (widgetConfig.title) widgetAttributes.push(`title="${widgetConfig.title}"`)
    if (widgetConfig.startButtonText) widgetAttributes.push(`start-button-text="${widgetConfig.startButtonText}"`)
    if (widgetConfig.endButtonText) widgetAttributes.push(`end-button-text="${widgetConfig.endButtonText}"`)
    if (widgetConfig.chatFirstMessage) widgetAttributes.push(`chat-first-message="${widgetConfig.chatFirstMessage}"`)
    if (widgetConfig.chatPlaceholder) widgetAttributes.push(`chat-placeholder="${widgetConfig.chatPlaceholder}"`)
    if (widgetConfig.voiceShowTranscript !== undefined) widgetAttributes.push(`voice-show-transcript="${widgetConfig.voiceShowTranscript}"`)
    if (widgetConfig.consentRequired !== undefined) widgetAttributes.push(`consent-required="${widgetConfig.consentRequired}"`)
    if (widgetConfig.consentTitle) widgetAttributes.push(`consent-title="${widgetConfig.consentTitle}"`)
    if (widgetConfig.consentContent) widgetAttributes.push(`consent-content="${widgetConfig.consentContent}"`)
    if (widgetConfig.consentStorageKey) widgetAttributes.push(`consent-storage-key="${widgetConfig.consentStorageKey}"`)

    // Generate the widget HTML
    const widgetHtml = `<vapi-widget ${widgetAttributes.join(' ')}></vapi-widget>`
    const scriptHtml = `<script src="https://unpkg.com/@vapi-ai/client-sdk-react/dist/embed/widget.umd.js" async type="text/javascript"></script>`
    
    const fullEmbedCode = `${widgetHtml}\n${scriptHtml}`

    console.log('✅ Generated widget embed code successfully')

    return NextResponse.json({
      success: true,
      embedCode: fullEmbedCode,
      widgetHtml,
      scriptHtml,
      attributes: widgetAttributes,
      configuration: {
        assistantId,
        publicKey,
        widgetConfig
      }
    })

  } catch (error) {
    console.error('❌ Error generating widget embed code:', error)
    return NextResponse.json(
      { error: `Failed to generate embed code: ${error.message}` },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const assistantId = searchParams.get('assistantId')
    const publicKey = searchParams.get('publicKey')

    if (!assistantId || !publicKey) {
      return NextResponse.json({ 
        error: 'Assistant ID and Public Key are required' 
      }, { status: 400 })
    }

    // Return a basic embed code
    const basicEmbedCode = `<vapi-widget assistant-id="${assistantId}" public-key="${publicKey}"></vapi-widget>\n<script src="https://unpkg.com/@vapi-ai/client-sdk-react/dist/embed/widget.umd.js" async type="text/javascript"></script>`

    return NextResponse.json({
      success: true,
      embedCode: basicEmbedCode,
      configuration: {
        assistantId,
        publicKey
      }
    })

  } catch (error) {
    console.error('❌ Error generating basic embed code:', error)
    return NextResponse.json(
      { error: `Failed to generate embed code: ${error.message}` },
      { status: 500 }
    )
  }
}
