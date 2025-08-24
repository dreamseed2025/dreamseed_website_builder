'use client'
import React, { useState } from 'react'

const CALL_ASSISTANTS = {
  1: '60400523-a331-4c4b-935d-b666ee013d42', // Foundation
  2: '2496625c-6fe8-4304-8b6d-045870680189', // Brand Identity
  3: 'b9f38474-a065-458f-bb03-eb62d21f529a', // Operations Setup
  4: '87416134-cfc7-47de-ad97-4951d3905ea9'  // Launch Strategy
}

// Your exact widget configuration from the playground
const WIDGET_CONFIG = {
  mode: 'voice',
  theme: 'dark',
  baseBgColor: '#000000',
  accentColor: '#76001b',
  ctaButtonColor: '#000000',
  ctaButtonTextColor: '#ffffff',
  borderRadius: 'large',
  size: 'full',
  position: 'bottom-right',
  title: 'Business Coach',
  startButtonText: 'Start',
  endButtonText: 'End Call',
  chatFirstMessage: 'Hey, How can I help you today?',
  chatPlaceholder: 'Type your message...',
  voiceShowTranscript: true,
  consentRequired: true,
  consentTitle: 'Terms and conditions',
  consentContent: 'By clicking "Agree," and each time I interact with this AI agent, I consent to the recording, storage, and sharing of my communications with third-party service providers, and as otherwise described in our Terms of Service.',
  consentStorageKey: 'vapi_widget_consent'
}

export default function ApplyWidgetConfig() {
  const [selectedAssistant, setSelectedAssistant] = useState('4')
  const [isApplying, setIsApplying] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string>('')

  const applyWidgetConfig = async () => {
    setIsApplying(true)
    setError('')
    setResult(null)

    try {
      const assistantId = CALL_ASSISTANTS[selectedAssistant as keyof typeof CALL_ASSISTANTS]
      
      console.log(`🎛️ Applying widget configuration to assistant ${assistantId}...`)

      // Step 1: Configure the assistant (voice and basic settings)
      console.log('Step 1: Configuring assistant...')
      const assistantResponse = await fetch('/api/vapi-configure-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assistantId,
          voice: 'elliot', // Keep Elliot voice
          widgetConfig: WIDGET_CONFIG
        })
      })

      if (!assistantResponse.ok) {
        const errorData = await assistantResponse.json()
        throw new Error(errorData.error || 'Failed to configure assistant')
      }

      const assistantData = await assistantResponse.json()
      console.log('✅ Assistant configured:', assistantData)

      // Step 2: Generate the widget embed code
      console.log('Step 2: Generating widget embed code...')
      const embedResponse = await fetch('/api/vapi-widget-embed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assistantId,
          publicKey: '360c27df-9f83-4b80-bd33-e17dbcbf4971',
          widgetConfig: WIDGET_CONFIG
        })
      })

      if (!embedResponse.ok) {
        const errorData = await embedResponse.json()
        throw new Error(errorData.error || 'Failed to generate embed code')
      }

      const embedData = await embedResponse.json()
      console.log('✅ Embed code generated:', embedData)

      // Combine results
      setResult({
        success: true,
        assistant: assistantData,
        embedCode: embedData.embedCode,
        message: 'Widget configuration applied successfully!'
      })

    } catch (err) {
      setError(`Error: ${err.message}`)
      console.error('❌ Error applying widget configuration:', err)
    } finally {
      setIsApplying(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{
        maxWidth: '1000px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '16px',
        padding: '40px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{
            fontSize: '36px',
            fontWeight: 'bold',
            margin: '0 0 16px 0',
            color: '#495057'
          }}>
            🎛️ Apply Widget Configuration
          </h1>
          <p style={{ fontSize: '18px', color: '#6c757d', margin: '0 0 24px 0' }}>
            Apply your exact VAPI playground widget configuration
          </p>
        </div>

        {/* Assistant Selection */}
        <div style={{
          background: '#f8f9fa',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #e9ecef',
          marginBottom: '30px'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#495057' }}>
            🎯 Select Assistant to Configure
          </h3>
          <select
            value={selectedAssistant}
            onChange={(e) => setSelectedAssistant(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #ced4da',
              fontSize: '16px',
              marginBottom: '16px'
            }}
          >
            <option value="1">Stage 1: Foundation (60400523-a331-4c4b-935d-b666ee013d42)</option>
            <option value="2">Stage 2: Brand Identity (2496625c-6fe8-4304-8b6d-045870680189)</option>
            <option value="3">Stage 3: Operations Setup (b9f38474-a065-458f-bb03-eb62d21f529a)</option>
            <option value="4">Stage 4: Launch Strategy (87416134-cfc7-47de-ad97-4951d3905ea9)</option>
          </select>

          <div style={{ fontSize: '14px', color: '#6c757d' }}>
            <p><strong>Selected Assistant ID:</strong> {CALL_ASSISTANTS[selectedAssistant as keyof typeof CALL_ASSISTANTS]}</p>
          </div>
        </div>

        {/* Widget Configuration Preview */}
        <div style={{
          background: '#e3f2fd',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #bbdefb',
          marginBottom: '30px'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#1976d2' }}>
            🎨 Widget Configuration Preview
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            <div>
              <h4 style={{ margin: '0 0 8px 0', color: '#1565c0' }}>Appearance</h4>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#1565c0' }}>
                <li><strong>Theme:</strong> {WIDGET_CONFIG.theme}</li>
                <li><strong>Background:</strong> {WIDGET_CONFIG.baseBgColor}</li>
                <li><strong>Accent:</strong> {WIDGET_CONFIG.accentColor}</li>
                <li><strong>Border Radius:</strong> {WIDGET_CONFIG.borderRadius}</li>
                <li><strong>Size:</strong> {WIDGET_CONFIG.size}</li>
                <li><strong>Position:</strong> {WIDGET_CONFIG.position}</li>
              </ul>
            </div>
            <div>
              <h4 style={{ margin: '0 0 8px 0', color: '#1565c0' }}>Text & Labels</h4>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#1565c0' }}>
                <li><strong>Title:</strong> {WIDGET_CONFIG.title}</li>
                <li><strong>Start Button:</strong> {WIDGET_CONFIG.startButtonText}</li>
                <li><strong>End Button:</strong> {WIDGET_CONFIG.endButtonText}</li>
                <li><strong>First Message:</strong> {WIDGET_CONFIG.chatFirstMessage}</li>
                <li><strong>Mode:</strong> {WIDGET_CONFIG.mode}</li>
                <li><strong>Show Transcript:</strong> {WIDGET_CONFIG.voiceShowTranscript ? 'Yes' : 'No'}</li>
              </ul>
            </div>
            <div>
              <h4 style={{ margin: '0 0 8px 0', color: '#1565c0' }}>Legal & Consent</h4>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#1565c0' }}>
                <li><strong>Consent Required:</strong> {WIDGET_CONFIG.consentRequired ? 'Yes' : 'No'}</li>
                <li><strong>Consent Title:</strong> {WIDGET_CONFIG.consentTitle}</li>
                <li><strong>Storage Key:</strong> {WIDGET_CONFIG.consentStorageKey}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div style={{
          textAlign: 'center',
          marginBottom: '30px'
        }}>
          <button
            onClick={applyWidgetConfig}
            disabled={isApplying}
            style={{
              padding: '20px 40px',
              borderRadius: '25px',
              background: isApplying ? '#6c757d' : 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
              border: 'none',
              color: 'white',
              fontSize: '18px',
              cursor: isApplying ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 20px rgba(40, 167, 69, 0.4)',
              transition: 'all 0.3s ease'
            }}
          >
            {isApplying ? '🔄 Applying Configuration...' : '🎛️ Apply Widget Configuration'}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div style={{
            background: '#f8d7da',
            color: '#721c24',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #f5c6cb'
          }}>
            <strong>❌ Error:</strong> {error}
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div style={{
            background: '#d4edda',
            color: '#155724',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #c3e6cb'
          }}>
            <strong>✅ Success!</strong>
            <p style={{ margin: '8px 0' }}>Widget configuration applied successfully!</p>
            <details style={{ marginTop: '12px' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Configuration Details</summary>
              <pre style={{
                background: '#f8f9fa',
                padding: '12px',
                borderRadius: '6px',
                marginTop: '8px',
                overflow: 'auto',
                fontSize: '12px',
                whiteSpace: 'pre-wrap'
              }}>
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        )}

        {/* Next Steps */}
        <div style={{
          background: '#fff3cd',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #ffeaa7',
          marginBottom: '30px'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#856404' }}>
            🎯 Next Steps
          </h3>
          <ol style={{ margin: 0, paddingLeft: '20px', color: '#856404' }}>
            <li>Click "Apply Widget Configuration" to update your assistant</li>
            <li>Go to <a href="/vapi-elliot-real" style={{ color: '#007bff' }}>VAPI Widget Page</a> to test the new configuration</li>
            <li>You should see the dark theme with red accent colors</li>
            <li>The widget will have consent requirements and transcript display</li>
            <li>Test both voice and chat modes</li>
          </ol>
        </div>

        {/* Embed Code Preview */}
        <div style={{
          background: '#f8f9fa',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #e9ecef'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#495057' }}>
            📋 Embed Code Preview
          </h3>
          <pre style={{
            background: '#2d3748',
            color: '#e2e8f0',
            padding: '16px',
            borderRadius: '8px',
            overflow: 'auto',
            fontSize: '12px',
            whiteSpace: 'pre-wrap'
          }}>
{`<vapi-widget
  public-key="360c27df-9f83-4b80-bd33-e17dbcbf4971"
  assistant-id="${CALL_ASSISTANTS[selectedAssistant as keyof typeof CALL_ASSISTANTS]}"
  mode="${WIDGET_CONFIG.mode}"
  theme="${WIDGET_CONFIG.theme}"
  base-bg-color="${WIDGET_CONFIG.baseBgColor}"
  accent-color="${WIDGET_CONFIG.accentColor}"
  cta-button-color="${WIDGET_CONFIG.ctaButtonColor}"
  cta-button-text-color="${WIDGET_CONFIG.ctaButtonTextColor}"
  border-radius="${WIDGET_CONFIG.borderRadius}"
  size="${WIDGET_CONFIG.size}"
  position="${WIDGET_CONFIG.position}"
  title="${WIDGET_CONFIG.title}"
  start-button-text="${WIDGET_CONFIG.startButtonText}"
  end-button-text="${WIDGET_CONFIG.endButtonText}"
  chat-first-message="${WIDGET_CONFIG.chatFirstMessage}"
  chat-placeholder="${WIDGET_CONFIG.chatPlaceholder}"
  voice-show-transcript="${WIDGET_CONFIG.voiceShowTranscript}"
  consent-required="${WIDGET_CONFIG.consentRequired}"
  consent-title="${WIDGET_CONFIG.consentTitle}"
  consent-content="${WIDGET_CONFIG.consentContent}"
  consent-storage-key="${WIDGET_CONFIG.consentStorageKey}"
></vapi-widget>`}
          </pre>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          padding: '20px',
          borderTop: '1px solid #e9ecef',
          color: '#6c757d',
          fontSize: '14px',
          marginTop: '30px'
        }}>
          <p style={{ margin: '0 0 8px 0' }}>Powered by <strong>VAPI API</strong> • Built for <strong>DreamSeed</strong></p>
          <p style={{ margin: 0 }}>Apply exact widget configuration from VAPI playground</p>
        </div>
      </div>
    </div>
  )
}
