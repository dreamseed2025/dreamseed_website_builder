'use client'

import React, { useState, useEffect, useRef } from 'react'

interface SimpleVoiceWidgetProps {
  userId?: string
  dreamId?: string
  businessName?: string
  businessType?: string
  callStage?: number
  className?: string
}

export default function SimpleVoiceWidget({
  userId = 'demo-user',
  dreamId = 'demo-dream',
  businessName = '',
  businessType = '',
  callStage = 1,
  className = ''
}: SimpleVoiceWidgetProps) {
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [conversation, setConversation] = useState<Array<{role: string, content: string}>>([])
  const [error, setError] = useState('')
  const [status, setStatus] = useState('Ready to start')
  
  const recognitionRef = useRef<any>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // VAPI Assistant IDs for the 4-stage system
  const CALL_ASSISTANTS = {
    1: '60400523-a331-4c4b-935d-b666ee013d42', // Foundation & Vision
    2: '2496625c-6fe8-4304-8b6d-045870680189', // Brand Identity
    3: 'b9f38474-a065-458f-bb03-eb62d21f529a', // Operations Setup
    4: '87416134-cfc7-47de-ad97-4951d3905ea9'  // Launch Strategy
  }

  // 11labs voice IDs for different stages (you can customize these)
  const VOICE_IDS = {
    1: '21m00Tcm4TlvDq8ikWAM', // Rachel - Professional and friendly
    2: 'AZnzlk1XvdvUeBnXmlld', // Domi - Energetic and engaging
    3: 'EXAVITQu4vr4xnSDxMaL', // Bella - Calm and reassuring
    4: 'VR6AewLTigWG4xSOukaG'  // Josh - Confident and authoritative
  }

  useEffect(() => {
    initializeSpeechRecognition()
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  const initializeSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition not supported in this browser')
      return
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    recognitionRef.current = new SpeechRecognition()
    
    recognitionRef.current.continuous = false
    recognitionRef.current.interimResults = false
    recognitionRef.current.lang = 'en-US'

    recognitionRef.current.onstart = () => {
      setIsListening(true)
      setStatus('Listening...')
      setError('')
    }

    recognitionRef.current.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript
      console.log('🎤 User said:', transcript)
      
      setIsListening(false)
      setIsProcessing(true)
      setStatus('Processing...')
      
      // Add user message to conversation
      setConversation(prev => [...prev, { role: 'user', content: transcript }])
      
      // Send to VAPI integration API
      try {
        const response = await fetch('/api/vapi-integration', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: transcript,
            userId,
            dreamId,
            businessName,
            businessType,
            callStage,
            useVAPI: true
          })
        })

        if (response.ok) {
          const data = await response.json()
          console.log('🤖 AI Response:', data.response)
          
          // Add AI response to conversation
          setConversation(prev => [...prev, { role: 'assistant', content: data.response }])
          
          // Speak the response using 11labs
          await speakWith11labs(data.response)
        } else {
          throw new Error('API request failed')
        }
      } catch (error) {
        console.error('❌ Error processing voice input:', error)
        setError('Failed to process voice input')
        setIsProcessing(false)
        setStatus('Error - Try again')
      }
    }

    recognitionRef.current.onerror = (event: any) => {
      console.error('❌ Speech recognition error:', event.error)
      setIsListening(false)
      setIsProcessing(false)
      setError(`Speech recognition error: ${event.error}`)
      setStatus('Error - Try again')
    }

    recognitionRef.current.onend = () => {
      setIsListening(false)
      if (!isProcessing) {
        setStatus('Ready to start')
      }
    }
  }

  const speakWith11labs = async (text: string) => {
    try {
      setIsSpeaking(true)
      setStatus('Generating voice...')

      // Get the voice ID for the current stage
      const voiceId = VOICE_IDS[callStage as keyof typeof VOICE_IDS] || VOICE_IDS[1]

      // Call 11labs API
      const response = await fetch('/api/elevenlabs-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voiceId,
          modelId: 'eleven_monolingual_v1'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate speech')
      }

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)

      // Play the audio
      if (audioRef.current) {
        audioRef.current.src = audioUrl
        audioRef.current.onloadedmetadata = () => {
          setStatus('AI is speaking...')
          audioRef.current?.play()
        }
        audioRef.current.onended = () => {
          setIsSpeaking(false)
          setIsProcessing(false)
          setStatus('Ready for next input')
          URL.revokeObjectURL(audioUrl)
        }
        audioRef.current.onerror = () => {
          setIsSpeaking(false)
          setIsProcessing(false)
          setStatus('Voice error - Try again')
          URL.revokeObjectURL(audioUrl)
        }
      }

    } catch (error) {
      console.error('❌ 11labs speech error:', error)
      setIsSpeaking(false)
      setIsProcessing(false)
      setStatus('Voice error - Try again')
      setError('Failed to generate voice response')
    }
  }

  const startListening = () => {
    if (recognitionRef.current && !isListening && !isProcessing && !isSpeaking) {
      recognitionRef.current.start()
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
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

  const getVoiceDescription = (stage: number) => {
    const descriptions = {
      1: 'Rachel (Professional)',
      2: 'Domi (Energetic)',
      3: 'Bella (Calm)',
      4: 'Josh (Confident)'
    }
    return descriptions[stage as keyof typeof descriptions] || 'Rachel (Professional)'
  }

  const isButtonDisabled = isListening || isProcessing || isSpeaking

  return (
    <div className={`simple-voice-widget ${className}`} style={{ padding: '20px' }}>
      {/* Hidden audio element for 11labs playback */}
      <audio ref={audioRef} style={{ display: 'none' }} />
      
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '20px'
      }}>
        <h3 style={{ margin: '0 0 8px 0', color: '#495057' }}>
          🎤 Voice Business Assistant
        </h3>
        <p style={{ margin: 0, fontSize: '14px', color: '#6c757d' }}>
          {getCallStageDescription(callStage)}
        </p>
        <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#adb5bd' }}>
          Assistant: {CALL_ASSISTANTS[callStage as keyof typeof CALL_ASSISTANTS]}
        </p>
        <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#28a745' }}>
          Voice: {getVoiceDescription(callStage)}
        </p>
      </div>

      {/* Status */}
      <div style={{
        textAlign: 'center',
        marginBottom: '20px',
        padding: '12px',
        background: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #e9ecef'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: isListening ? '#28a745' : isProcessing ? '#ffc107' : isSpeaking ? '#17a2b8' : '#6c757d',
            animation: (isListening || isProcessing || isSpeaking) ? 'pulse 2s infinite' : 'none'
          }} />
          <span style={{ fontSize: '14px', color: '#495057' }}>{status}</span>
        </div>
        {error && (
          <div style={{ color: '#dc3545', fontSize: '12px', marginTop: '8px' }}>
            {error}
          </div>
        )}
      </div>

      {/* Voice Button */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <button
          onClick={isListening ? stopListening : startListening}
          disabled={isButtonDisabled}
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: isListening 
              ? 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)'
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            color: 'white',
            fontSize: '24px',
            cursor: isButtonDisabled ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
            transition: 'all 0.3s ease',
            opacity: isButtonDisabled ? 0.6 : 1
          }}
          title={isListening ? 'Stop listening' : 'Start listening'}
        >
          {isListening ? '⏹️' : isProcessing ? '🔄' : isSpeaking ? '🔊' : '🎤'}
        </button>
      </div>

      {/* Instructions */}
      <div style={{
        textAlign: 'center',
        marginBottom: '20px',
        fontSize: '14px',
        color: '#6c757d'
      }}>
        <p style={{ margin: '0 0 8px 0' }}>
          <strong>Try saying:</strong>
        </p>
        <ul style={{ 
          margin: 0, 
          padding: 0, 
          listStyle: 'none',
          fontSize: '12px'
        }}>
          <li>• "I want to start a consulting business"</li>
          <li>• "What type of LLC should I form?"</li>
          <li>• "I need help naming my business"</li>
          <li>• "Which state is best for my business?"</li>
        </ul>
      </div>

      {/* Conversation History */}
      {conversation.length > 0 && (
        <div style={{
          maxHeight: '200px',
          overflowY: 'auto',
          border: '1px solid #e9ecef',
          borderRadius: '8px',
          padding: '12px',
          background: '#f8f9fa'
        }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#495057' }}>
            Conversation History
          </h4>
          {conversation.map((msg, index) => (
            <div key={index} style={{
              marginBottom: '8px',
              padding: '8px',
              background: msg.role === 'user' ? '#e3f2fd' : '#f3e5f5',
              borderRadius: '6px',
              fontSize: '12px'
            }}>
              <strong style={{ color: msg.role === 'user' ? '#1976d2' : '#7b1fa2' }}>
                {msg.role === 'user' ? 'You' : 'AI'}:
              </strong>
              <span style={{ marginLeft: '8px', color: '#495057' }}>
                {msg.content}
              </span>
            </div>
          ))}
        </div>
      )}

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
