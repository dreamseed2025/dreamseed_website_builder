'use client'

import React, { useState, useEffect, useRef } from 'react'

interface VAPIWebWidgetProps {
  userId?: string
  dreamId?: string
  businessName?: string
  businessType?: string
  callStage?: number
  className?: string
}

export default function VAPIWebWidget({
  userId = 'demo-user',
  dreamId = 'demo-dream',
  businessName = '',
  businessType = '',
  callStage = 1,
  className = ''
}: VAPIWebWidgetProps) {
  const [isWidgetOpen, setIsWidgetOpen] = useState(false)
  const [isCallActive, setIsCallActive] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('Ready to start')
  const [conversation, setConversation] = useState<Array<{role: string, content: string}>>([])
  
  const vapiWidgetRef = useRef<HTMLDivElement>(null)
  const vapiWidgetElementRef = useRef<any>(null)

  // VAPI Assistant IDs for the 4-stage system
  const CALL_ASSISTANTS = {
    1: '60400523-a331-4c4b-935d-b666ee013d42', // Foundation & Vision
    2: '2496625c-6fe8-4304-8b6d-045870680189', // Brand Identity
    3: 'b9f38474-a065-458f-bb03-eb62d21f529a', // Operations Setup
    4: '87416134-cfc7-47de-ad97-4951d3905ea9'  // Launch Strategy
  }

  useEffect(() => {
    if (isWidgetOpen) {
      loadVAPIScript()
    }
  }, [isWidgetOpen, callStage])

  const loadVAPIScript = () => {
    setIsLoading(true)
    setError('')

    // Load VAPI web widget script
    if (!document.querySelector('script[src*="vapi-ai"]')) {
      const script = document.createElement('script')
      script.src = 'https://unpkg.com/@vapi-ai/web@latest/dist/index.js'
      script.async = true
      script.onload = () => {
        console.log('✅ VAPI web widget script loaded')
        initializeVAPIWidget()
      }
      script.onerror = () => {
        console.error('❌ Failed to load VAPI web widget script')
        setError('Failed to load voice system')
        setIsLoading(false)
      }
      document.head.appendChild(script)
    } else {
      initializeVAPIWidget()
    }
  }

  const initializeVAPIWidget = () => {
    if (!vapiWidgetRef.current) return

    try {
      // Clear existing content
      vapiWidgetRef.current.innerHTML = ''

      // Create VAPI web widget element
      const vapiWidget = document.createElement('vapi-widget')
      
      // Set VAPI configuration
      vapiWidget.setAttribute('public-key', 'pk_test_3359a2eb-02e4-4f31-a5aa-37c2a020a395')
      vapiWidget.setAttribute('assistant-id', CALL_ASSISTANTS[callStage as keyof typeof CALL_ASSISTANTS])
      vapiWidget.setAttribute('mode', 'voice')
      vapiWidget.setAttribute('enable-voice', 'true')
      vapiWidget.setAttribute('voice-enabled', 'true')
      vapiWidget.setAttribute('call-type', 'web')
      vapiWidget.setAttribute('audio-enabled', 'true')
      vapiWidget.setAttribute('button-label', '🎤 Start Business Consultation with Elliot')
      vapiWidget.setAttribute('show-widget-assistant-id', 'false')
      vapiWidget.setAttribute('voice', 'elliot')
      
      // Add custom styling
      vapiWidget.style.cssText = `
        width: 100%;
        height: 100%;
        border-radius: 8px;
        border: none;
        background: transparent;
      `

      // Add widget to container
      vapiWidgetRef.current.appendChild(vapiWidget)
      vapiWidgetElementRef.current = vapiWidget

      // Add event listeners
      vapiWidget.addEventListener('call-start', handleCallStart)
      vapiWidget.addEventListener('call-end', handleCallEnd)
      vapiWidget.addEventListener('speech-start', handleSpeechStart)
      vapiWidget.addEventListener('speech-end', handleSpeechEnd)
      vapiWidget.addEventListener('assistant-speech-start', handleAssistantSpeechStart)
      vapiWidget.addEventListener('assistant-speech-end', handleAssistantSpeechEnd)
      vapiWidget.addEventListener('error', handleError)
      vapiWidget.addEventListener('message', handleMessage)

      console.log('✅ VAPI web widget initialized with assistant:', CALL_ASSISTANTS[callStage as keyof typeof CALL_ASSISTANTS])
      setStatus('Voice widget ready - Click to start')
      setIsLoading(false)

    } catch (error) {
      console.error('❌ VAPI widget initialization failed:', error)
      setError('Failed to initialize voice widget')
      setIsLoading(false)
    }
  }

  const handleCallStart = (event: any) => {
    console.log('🎤 VAPI call started:', event)
    setIsCallActive(true)
    setStatus('Connected - You can speak now')
    setError('')
  }

  const handleCallEnd = (event: any) => {
    console.log('📞 VAPI call ended:', event)
    setIsCallActive(false)
    setStatus('Call ended - Click to start again')
  }

  const handleSpeechStart = (event: any) => {
    console.log('🎤 User started speaking:', event)
    setStatus('Listening to you...')
  }

  const handleSpeechEnd = (event: any) => {
    console.log('🔇 User stopped speaking:', event)
    setStatus('AI is thinking...')
  }

  const handleAssistantSpeechStart = (event: any) => {
    console.log('🤖 AI started speaking:', event)
    setStatus('AI is speaking...')
  }

  const handleAssistantSpeechEnd = (event: any) => {
    console.log('🤖 AI finished speaking:', event)
    setStatus('Your turn to speak')
  }

  const handleMessage = (event: any) => {
    console.log('📨 VAPI message:', event)
    if (event.detail?.message) {
      setConversation(prev => [...prev, { role: 'assistant', content: event.detail.message }])
    }
  }

  const handleError = (event: any) => {
    console.error('❌ VAPI error:', event)
    setError(`Voice error: ${event.detail?.message || 'Unknown error'}`)
    setIsCallActive(false)
  }

  const toggleWidget = () => {
    setIsWidgetOpen(!isWidgetOpen)
  }

  const getCallStageDescription = (stage: number) => {
    const descriptions = {
      1: 'Foundation & Vision',
      2: 'Brand Identity',
      3: 'Operations Setup',
      4: 'Launch Strategy'
    }
    return descriptions[stage as keyof typeof descriptions] || 'Business Formation'
  }

  if (!isWidgetOpen) {
    return (
      <div className={`vapi-web-widget-closed ${className}`}>
        <button
          onClick={toggleWidget}
          className="vapi-web-widget-toggle"
          title="Open VAPI Voice Assistant"
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            color: 'white',
            fontSize: '24px',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
            transition: 'all 0.3s ease',
            zIndex: 1000
          }}
        >
          🎤
        </button>
      </div>
    )
  }

  return (
    <div 
      className={`vapi-web-widget-open ${className}`}
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '400px',
        height: '500px',
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
        border: '2px solid #667eea',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000,
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
            🎤 VAPI Voice Assistant
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', opacity: 0.9 }}>
            {getCallStageDescription(callStage)}
          </p>
        </div>
        <button
          onClick={toggleWidget}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          ✕
        </button>
      </div>

      {/* Status Bar */}
      <div style={{
        padding: '12px 16px',
        background: '#f8f9fa',
        borderBottom: '1px solid #e9ecef',
        fontSize: '14px',
        color: '#495057'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: isCallActive ? '#28a745' : '#6c757d',
            animation: isCallActive ? 'pulse 2s infinite' : 'none'
          }} />
          {status}
        </div>
        {error && (
          <div style={{ color: '#dc3545', fontSize: '12px', marginTop: '4px' }}>
            {error}
          </div>
        )}
      </div>

      {/* VAPI Widget Container */}
      <div 
        ref={vapiWidgetRef}
        style={{
          flex: 1,
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f8f9fa'
        }}
      >
        {isLoading ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔄</div>
            <div>Loading voice widget...</div>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', color: '#dc3545' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>❌</div>
            <div>{error}</div>
            <button
              onClick={initializeVAPIWidget}
              style={{
                marginTop: '12px',
                padding: '8px 16px',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#6c757d' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎤</div>
            <div>Voice widget loaded</div>
            <div style={{ fontSize: '12px', marginTop: '4px' }}>
              Assistant: {CALL_ASSISTANTS[callStage as keyof typeof CALL_ASSISTANTS]}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: '12px 16px',
        background: '#f8f9fa',
        borderTop: '1px solid #e9ecef',
        fontSize: '12px',
        color: '#6c757d',
        textAlign: 'center'
      }}>
        Powered by VAPI • DreamSeed Business Formation
      </div>

      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
