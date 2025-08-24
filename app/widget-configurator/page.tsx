'use client'
import React, { useState, useEffect } from 'react'

const CALL_ASSISTANTS = {
  1: '60400523-a331-4c4b-935d-b666ee013d42', // Foundation
  2: '2496625c-6fe8-4304-8b6d-045870680189', // Brand Identity
  3: 'b9f38474-a065-458f-bb03-eb62d21f529a', // Operations Setup
  4: '87416134-cfc7-47de-ad97-4951d3905ea9'  // Launch Strategy
}

const VOICE_OPTIONS = [
  { id: 'elliot', name: 'Elliot (Male)', provider: 'vapi' },
  { id: 'harry', name: 'Harry (Male)', provider: 'vapi' },
  { id: 'sarah', name: 'Sarah (Female)', provider: 'vapi' },
  { id: 'jennifer', name: 'Jennifer (Female)', provider: 'vapi' }
]

const MODEL_OPTIONS = [
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini (Fast & Cost-effective)' },
  { id: 'gpt-4o', name: 'GPT-4o (Most Capable)' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo (Fastest)' }
]

export default function WidgetConfigurator() {
  const [selectedAssistant, setSelectedAssistant] = useState('4')
  const [isLoading, setIsLoading] = useState(false)
  const [currentConfig, setCurrentConfig] = useState<any>(null)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string>('')

  // Configuration form state
  const [config, setConfig] = useState({
    voice: 'elliot',
    model: 'gpt-4o-mini',
    temperature: 0.3,
    buttonLabel: '🎤 Start Business Consultation',
    endCallMessage: 'Thank you for your time! Have a great day!',
    recordingEnabled: true,
    backgroundSound: 'off',
    systemMessage: ''
  })

  // Load current configuration
  const loadCurrentConfig = async () => {
    setIsLoading(true)
    setError('')
    setResult(null)

    try {
      const assistantId = CALL_ASSISTANTS[selectedAssistant as keyof typeof CALL_ASSISTANTS]
      
      console.log(`🔍 Loading assistant ${assistantId} configuration...`)

      const response = await fetch(`/api/vapi-configure-voice?assistantId=${assistantId}`)
      const data = await response.json()

      if (response.ok) {
        setCurrentConfig(data.assistant)
        
        // Update form with current values
        setConfig({
          voice: data.assistant.voice?.voiceId || 'elliot',
          model: data.assistant.model?.model || 'gpt-4o-mini',
          temperature: data.assistant.model?.temperature || 0.3,
          buttonLabel: data.assistant.buttonLabel || '🎤 Start Business Consultation',
          endCallMessage: data.assistant.endCallMessage || 'Thank you for your time! Have a great day!',
          recordingEnabled: data.assistant.recordingEnabled !== false,
          backgroundSound: data.assistant.backgroundSound || 'off',
          systemMessage: data.assistant.model?.messages?.[0]?.content || ''
        })
        
        console.log('📋 Current configuration loaded:', data)
      } else {
        setError(data.error || 'Failed to load configuration')
        console.error('❌ Failed to load configuration:', data)
      }
    } catch (err) {
      setError(`Error: ${err.message}`)
      console.error('❌ Error loading configuration:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Save configuration
  const saveConfiguration = async () => {
    setIsLoading(true)
    setError('')
    setResult(null)

    try {
      const assistantId = CALL_ASSISTANTS[selectedAssistant as keyof typeof CALL_ASSISTANTS]
      
      console.log(`💾 Saving assistant ${assistantId} configuration...`)

      const response = await fetch('/api/vapi-configure-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assistantId,
          voice: config.voice,
          model: config.model,
          temperature: config.temperature,
          systemMessage: config.systemMessage,
          widgetConfig: {
            buttonLabel: config.buttonLabel,
            endCallMessage: config.endCallMessage,
            recordingEnabled: config.recordingEnabled,
            backgroundSound: config.backgroundSound
          }
        })
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
        console.log('✅ Configuration saved successfully:', data)
      } else {
        setError(data.error || 'Failed to save configuration')
        console.error('❌ Failed to save configuration:', data)
      }
    } catch (err) {
      setError(`Error: ${err.message}`)
      console.error('❌ Error saving configuration:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Load config when assistant changes
  useEffect(() => {
    loadCurrentConfig()
  }, [selectedAssistant])

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{
        maxWidth: '1200px',
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
            🎛️ VAPI Widget Configurator
          </h1>
          <p style={{ fontSize: '18px', color: '#6c757d', margin: '0 0 24px 0' }}>
            Configure your VAPI assistant's voice, model, and widget settings via API
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

        {/* Configuration Form */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '30px',
          marginBottom: '30px'
        }}>
          {/* Voice & Model Configuration */}
          <div style={{
            background: '#f8f9fa',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid #e9ecef'
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#495057' }}>
              🎤 Voice & Model Settings
            </h3>
            
            {/* Voice Selection */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#495057' }}>
                Voice
              </label>
              <select
                value={config.voice}
                onChange={(e) => setConfig({ ...config, voice: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '6px',
                  border: '1px solid #ced4da',
                  fontSize: '14px'
                }}
              >
                {VOICE_OPTIONS.map(voice => (
                  <option key={voice.id} value={voice.id}>{voice.name}</option>
                ))}
              </select>
            </div>

            {/* Model Selection */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#495057' }}>
                AI Model
              </label>
              <select
                value={config.model}
                onChange={(e) => setConfig({ ...config, model: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '6px',
                  border: '1px solid #ced4da',
                  fontSize: '14px'
                }}
              >
                {MODEL_OPTIONS.map(model => (
                  <option key={model.id} value={model.id}>{model.name}</option>
                ))}
              </select>
            </div>

            {/* Temperature */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#495057' }}>
                Temperature: {config.temperature}
              </label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={config.temperature}
                onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
                style={{ width: '100%' }}
              />
              <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '4px' }}>
                0 = Focused, 2 = Creative
              </div>
            </div>
          </div>

          {/* Widget Configuration */}
          <div style={{
            background: '#f8f9fa',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid #e9ecef'
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#495057' }}>
              🎛️ Widget Settings
            </h3>
            
            {/* Button Label */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#495057' }}>
                Button Label
              </label>
              <input
                type="text"
                value={config.buttonLabel}
                onChange={(e) => setConfig({ ...config, buttonLabel: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '6px',
                  border: '1px solid #ced4da',
                  fontSize: '14px'
                }}
                placeholder="🎤 Start Business Consultation"
              />
            </div>

            {/* End Call Message */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#495057' }}>
                End Call Message
              </label>
              <textarea
                value={config.endCallMessage}
                onChange={(e) => setConfig({ ...config, endCallMessage: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '6px',
                  border: '1px solid #ced4da',
                  fontSize: '14px',
                  minHeight: '60px',
                  resize: 'vertical'
                }}
                placeholder="Thank you for your time! Have a great day!"
              />
            </div>

            {/* Recording Enabled */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', color: '#495057' }}>
                <input
                  type="checkbox"
                  checked={config.recordingEnabled}
                  onChange={(e) => setConfig({ ...config, recordingEnabled: e.target.checked })}
                />
                Enable Recording
              </label>
            </div>

            {/* Background Sound */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#495057' }}>
                Background Sound
              </label>
              <select
                value={config.backgroundSound}
                onChange={(e) => setConfig({ ...config, backgroundSound: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '6px',
                  border: '1px solid #ced4da',
                  fontSize: '14px'
                }}
              >
                <option value="off">Off</option>
                <option value="office">Office</option>
                <option value="cafe">Cafe</option>
                <option value="traffic">Traffic</option>
              </select>
            </div>
          </div>
        </div>

        {/* System Message */}
        <div style={{
          background: '#f8f9fa',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #e9ecef',
          marginBottom: '30px'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#495057' }}>
            🤖 System Message (Advanced)
          </h3>
          <textarea
            value={config.systemMessage}
            onChange={(e) => setConfig({ ...config, systemMessage: e.target.value })}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #ced4da',
              fontSize: '14px',
              minHeight: '120px',
              resize: 'vertical',
              fontFamily: 'monospace'
            }}
            placeholder="Enter the system message that defines the assistant's behavior..."
          />
          <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '8px' }}>
            Leave empty to keep current system message
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '30px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={loadCurrentConfig}
            disabled={isLoading}
            style={{
              padding: '16px 32px',
              borderRadius: '25px',
              background: isLoading ? '#6c757d' : 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
              border: 'none',
              color: 'white',
              fontSize: '16px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 20px rgba(0, 123, 255, 0.4)',
              transition: 'all 0.3s ease'
            }}
          >
            {isLoading ? '🔄 Loading...' : '📋 Reload Current Config'}
          </button>

          <button
            onClick={saveConfiguration}
            disabled={isLoading}
            style={{
              padding: '16px 32px',
              borderRadius: '25px',
              background: isLoading ? '#6c757d' : 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
              border: 'none',
              color: 'white',
              fontSize: '16px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 20px rgba(40, 167, 69, 0.4)',
              transition: 'all 0.3s ease'
            }}
          >
            {isLoading ? '🔄 Saving...' : '💾 Save Configuration'}
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
            <div style={{ marginTop: '12px' }}>
              <strong>Changes Made:</strong>
              <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                {Object.entries(result.changes).map(([key, value]) => (
                  <li key={key}>{key}: {value}</li>
                ))}
              </ul>
            </div>
            <details style={{ marginTop: '12px' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Full Response</summary>
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

        {/* Current Configuration Display */}
        {currentConfig && (
          <div style={{
            background: '#e3f2fd',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid #bbdefb',
            marginBottom: '30px'
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#1976d2' }}>
              📋 Current Configuration
            </h3>
            <div style={{ fontSize: '14px', color: '#1565c0' }}>
              <p><strong>Voice:</strong> {currentConfig.voice?.voiceId} ({currentConfig.voice?.provider})</p>
              <p><strong>Model:</strong> {currentConfig.model?.model} (temp: {currentConfig.model?.temperature})</p>
              <p><strong>Button Label:</strong> {currentConfig.buttonLabel || 'Not set'}</p>
              <p><strong>Recording:</strong> {currentConfig.recordingEnabled ? 'Enabled' : 'Disabled'}</p>
              <p><strong>Background Sound:</strong> {currentConfig.backgroundSound || 'Off'}</p>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div style={{
          background: '#fff3cd',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #ffeaa7'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#856404' }}>
            🎯 How to Use the Widget Configurator
          </h3>
          <ol style={{ margin: 0, paddingLeft: '20px', color: '#856404' }}>
            <li>Select the assistant you want to configure</li>
            <li>Adjust voice, model, and widget settings as needed</li>
            <li>Click "Save Configuration" to update via VAPI API</li>
            <li>Test the widget on the VAPI widget page</li>
            <li>All changes are applied immediately to your assistant</li>
          </ol>
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
          <p style={{ margin: 0 }}>Comprehensive widget configuration via VAPI API</p>
        </div>
      </div>
    </div>
  )
}
