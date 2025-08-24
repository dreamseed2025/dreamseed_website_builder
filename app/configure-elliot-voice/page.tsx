'use client'
import React, { useState } from 'react'

const CALL_ASSISTANTS = {
  1: '60400523-a331-4c4b-935d-b666ee013d42', // Foundation
  2: '2496625c-6fe8-4304-8b6d-045870680189', // Brand Identity
  3: 'b9f38474-a065-458f-bb03-eb62d21f529a', // Operations Setup
  4: '87416134-cfc7-47de-ad97-4951d3905ea9'  // Launch Strategy
}

export default function ConfigureElliotVoice() {
  const [selectedAssistant, setSelectedAssistant] = useState('4')
  const [isConfiguring, setIsConfiguring] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string>('')

  const configureVoice = async () => {
    setIsConfiguring(true)
    setError('')
    setResult(null)

    try {
      const assistantId = CALL_ASSISTANTS[selectedAssistant as keyof typeof CALL_ASSISTANTS]
      
      console.log(`🎤 Configuring assistant ${assistantId} with Elliot voice...`)

      const response = await fetch('/api/vapi-configure-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assistantId,
          voice: 'elliot'
        })
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
        console.log('✅ Voice configured successfully:', data)
      } else {
        setError(data.error || 'Failed to configure voice')
        console.error('❌ Failed to configure voice:', data)
      }
    } catch (err) {
      setError(`Error: ${err.message}`)
      console.error('❌ Error configuring voice:', err)
    } finally {
      setIsConfiguring(false)
    }
  }

  const getAssistantConfig = async () => {
    setIsConfiguring(true)
    setError('')
    setResult(null)

    try {
      const assistantId = CALL_ASSISTANTS[selectedAssistant as keyof typeof CALL_ASSISTANTS]
      
      console.log(`🔍 Getting assistant ${assistantId} configuration...`)

      const response = await fetch(`/api/vapi-configure-voice?assistantId=${assistantId}`)
      const data = await response.json()

      if (response.ok) {
        setResult(data)
        console.log('📋 Assistant configuration:', data)
      } else {
        setError(data.error || 'Failed to get assistant configuration')
        console.error('❌ Failed to get assistant configuration:', data)
      }
    } catch (err) {
      setError(`Error: ${err.message}`)
      console.error('❌ Error getting assistant configuration:', err)
    } finally {
      setIsConfiguring(false)
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
        maxWidth: '800px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '16px',
        padding: '40px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            margin: '0 0 16px 0',
            color: '#495057'
          }}>
            🎤 Configure VAPI Elliot Voice
          </h1>
          <p style={{ fontSize: '16px', color: '#6c757d', margin: '0 0 24px 0' }}>
            Configure your VAPI assistant to use Elliot's voice via API
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

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '30px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={configureVoice}
            disabled={isConfiguring}
            style={{
              padding: '16px 32px',
              borderRadius: '25px',
              background: isConfiguring ? '#6c757d' : 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
              border: 'none',
              color: 'white',
              fontSize: '16px',
              cursor: isConfiguring ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 20px rgba(40, 167, 69, 0.4)',
              transition: 'all 0.3s ease',
              flex: 1,
              minWidth: '200px'
            }}
          >
            {isConfiguring ? '🔄 Configuring...' : '🎤 Configure Elliot Voice'}
          </button>

          <button
            onClick={getAssistantConfig}
            disabled={isConfiguring}
            style={{
              padding: '16px 32px',
              borderRadius: '25px',
              background: isConfiguring ? '#6c757d' : 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
              border: 'none',
              color: 'white',
              fontSize: '16px',
              cursor: isConfiguring ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 20px rgba(0, 123, 255, 0.4)',
              transition: 'all 0.3s ease',
              flex: 1,
              minWidth: '200px'
            }}
          >
            {isConfiguring ? '🔄 Loading...' : '📋 Get Current Config'}
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
            <pre style={{
              background: '#f8f9fa',
              padding: '12px',
              borderRadius: '6px',
              marginTop: '12px',
              overflow: 'auto',
              fontSize: '12px',
              whiteSpace: 'pre-wrap'
            }}>
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        {/* Instructions */}
        <div style={{
          background: '#e3f2fd',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #bbdefb'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#1976d2' }}>
            🎯 How This Works
          </h3>
          <ol style={{ margin: 0, paddingLeft: '20px', color: '#1565c0' }}>
            <li>Select the assistant you want to configure</li>
            <li>Click "Configure Elliot Voice" to set the voice via VAPI API</li>
            <li>Click "Get Current Config" to see the current assistant settings</li>
            <li>After configuration, the widget will use Elliot's voice</li>
            <li>Test the voice on the VAPI widget page</li>
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
          <p style={{ margin: 0 }}>Configure VAPI assistant voices programmatically</p>
        </div>
      </div>
    </div>
  )
}

