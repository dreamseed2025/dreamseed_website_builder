'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'

interface OptimizedVoiceWidgetProps {
  userId?: string
  dreamId?: string
  businessName?: string
  businessType?: string
  callStage?: number
  className?: string
}

export default function OptimizedVoiceWidget({
  userId = 'demo-user',
  dreamId = 'demo-dream',
  businessName = '',
  businessType = '',
  callStage = 1,
  className = ''
}: OptimizedVoiceWidgetProps) {
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [conversation, setConversation] = useState<Array<{role: string, content: string}>>([])
  const [error, setError] = useState('')
  const [status, setStatus] = useState('Click to start conversation')
  const [volumeLevel, setVolumeLevel] = useState(0)
  const [userSpeaking, setUserSpeaking] = useState(false)
  
  const recognitionRef = useRef<any>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const volumeThreshold = 25 // Lowered for better sensitivity
  const responseCache = useRef<Map<string, string>>(new Map())
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // VAPI Assistant IDs for the 4-stage system
  const CALL_ASSISTANTS = {
    1: '60400523-a331-4c4b-935d-b666ee013d42', // Foundation & Vision
    2: '2496625c-6fe8-4304-8b6d-045870680189', // Brand Identity
    3: 'b9f38474-a065-458f-bb03-eb62d21f529a', // Operations Setup
    4: '87416134-cfc7-47de-ad97-4951d3905ea9'  // Launch Strategy
  }

  // 11labs voice IDs for different stages
  const VOICE_IDS = {
    1: '21m00Tcm4TlvDq8ikWAM', // Rachel - Professional and friendly
    2: 'AZnzlk1XvdvUeBnXmlld', // Domi - Energetic and engaging
    3: 'EXAVITQu4vr4xnSDxMaL', // Bella - Calm and reassuring
    4: 'VR6AewLTigWG4xSOukaG'  // Josh - Confident and authoritative
  }

  useEffect(() => {
    return () => {
      stopConversation()
    }
  }, [])

  // Optimized voice interruption logic
  useEffect(() => {
    if (userSpeaking && isSpeaking) {
      interruptAI()
    }
  }, [userSpeaking, isSpeaking])

  // Debounced processing to avoid rapid API calls
  const debouncedProcessMessage = useCallback((message: string) => {
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current)
    }
    
    processingTimeoutRef.current = setTimeout(() => {
      processMessage(message)
    }, 300) // 300ms debounce
  }, [])

  const processMessage = async (message: string) => {
    // Check cache first
    const cacheKey = `${message.toLowerCase().trim()}_${callStage}`
    const cachedResponse = responseCache.current.get(cacheKey)
    
    if (cachedResponse) {
      console.log('🎯 Using cached response')
      handleAIResponse(cachedResponse)
      return
    }

    setIsProcessing(true)
    setStatus('Processing...')

    try {
      const response = await fetch('/api/vapi-integration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
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
        
        // Cache the response
        responseCache.current.set(cacheKey, data.response)
        
        // Limit cache size
        if (responseCache.current.size > 50) {
          const firstKey = responseCache.current.keys().next().value
          responseCache.current.delete(firstKey)
        }
        
        handleAIResponse(data.response)
      } else {
        throw new Error('API request failed')
      }
    } catch (error) {
      console.error('❌ Error processing message:', error)
      setError('Failed to process message')
      setIsProcessing(false)
      setStatus('Error - try again')
    }
  }

  const handleAIResponse = async (response: string) => {
    setConversation(prev => [...prev, { role: 'assistant', content: response }])
    await speakWith11labs(response)
  }

  const initializeSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition not supported in this browser')
      return
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    recognitionRef.current = new SpeechRecognition()
    
    // Optimized settings for faster response
    recognitionRef.current.continuous = true
    recognitionRef.current.interimResults = true
    recognitionRef.current.lang = 'en-US'
    recognitionRef.current.maxAlternatives = 1

    recognitionRef.current.onstart = () => {
      setIsListening(true)
      setStatus('Listening... (speak naturally)')
      setError('')
    }

    recognitionRef.current.onresult = async (event: any) => {
      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }

      // Show interim results for better UX
      if (interimTranscript) {
        setStatus(`Hearing: "${interimTranscript}"...`)
      }

      // Process final results with debouncing
      if (finalTranscript) {
        console.log('🎤 User said:', finalTranscript)
        
        // Add user message to conversation
        setConversation(prev => [...prev, { role: 'user', content: finalTranscript }])
        
        // Stop listening while processing
        setIsListening(false)
        
        // Stop any current speech
        if (audioRef.current && !audioRef.current.paused) {
          audioRef.current.pause()
          setIsSpeaking(false)
        }
        
        // Use debounced processing
        debouncedProcessMessage(finalTranscript)
      }
    }

    recognitionRef.current.onerror = (event: any) => {
      console.error('❌ Speech recognition error:', event.error)
      if (event.error !== 'no-speech') {
        setError(`Speech recognition error: ${event.error}`)
        setStatus('Error - try again')
      }
    }

    recognitionRef.current.onend = () => {
      // Restart recognition if conversation is still active
      if (isListening && !isMuted) {
        recognitionRef.current.start()
      }
    }
  }

  const initializeAudioVisualization = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      analyserRef.current = audioContextRef.current.createAnalyser()
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream)
      
      microphoneRef.current.connect(analyserRef.current)
      analyserRef.current.fftSize = 128 // Reduced for better performance
      
      const bufferLength = analyserRef.current.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)
      
      const updateVolume = () => {
        if (analyserRef.current && isListening && !isMuted) {
          analyserRef.current.getByteFrequencyData(dataArray)
          const average = dataArray.reduce((a, b) => a + b) / bufferLength
          setVolumeLevel(average)
          
          // Optimized voice detection
          if (average > volumeThreshold) {
            if (!userSpeaking) {
              setUserSpeaking(true)
              console.log('🎤 User started speaking - interrupting AI if needed')
            }
          } else {
            if (userSpeaking) {
              setUserSpeaking(false)
            }
          }
        }
        animationFrameRef.current = requestAnimationFrame(updateVolume)
      }
      
      updateVolume()
    } catch (error) {
      console.error('❌ Audio visualization error:', error)
    }
  }

  const speakWith11labs = async (text: string) => {
    try {
      setIsSpeaking(true)
      setStatus('AI is speaking...')

      // Get the voice ID for the current stage
      const voiceId = VOICE_IDS[callStage as keyof typeof VOICE_IDS] || VOICE_IDS[1]

      // Optimized 11labs call with shorter text for faster response
      const optimizedText = text.length > 200 ? text.substring(0, 200) + '...' : text

      const response = await fetch('/api/elevenlabs-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: optimizedText,
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
          audioRef.current?.play()
        }
        audioRef.current.onended = () => {
          setIsSpeaking(false)
          setIsProcessing(false)
          setStatus('Listening... (speak naturally)')
          URL.revokeObjectURL(audioUrl)
          
          // Resume listening
          if (isListening && !isMuted) {
            recognitionRef.current?.start()
          }
        }
        audioRef.current.onerror = () => {
          setIsSpeaking(false)
          setIsProcessing(false)
          setStatus('Voice error - try again')
          URL.revokeObjectURL(audioUrl)
        }
      }

    } catch (error) {
      console.error('❌ 11labs speech error:', error)
      setIsSpeaking(false)
      setIsProcessing(false)
      setStatus('Voice error - try again')
      setError('Failed to generate voice response')
    }
  }

  const startConversation = async () => {
    try {
      setIsMuted(false)
      setError('')
      setStatus('Initializing...')
      
      await initializeAudioVisualization()
      initializeSpeechRecognition()
      
      recognitionRef.current?.start()
      setStatus('Listening... (speak naturally)')
      
    } catch (error) {
      console.error('❌ Failed to start conversation:', error)
      setError('Failed to start conversation')
      setStatus('Error - try again')
    }
  }

  const stopConversation = () => {
    setIsListening(false)
    setIsProcessing(false)
    setIsSpeaking(false)
    setIsMuted(true)
    setUserSpeaking(false)
    setStatus('Conversation ended')
    
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current)
    }
    
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause()
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close()
    }
  }

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false)
      setStatus('Listening... (speak naturally)')
      recognitionRef.current?.start()
    } else {
      setIsMuted(true)
      setStatus('Microphone muted')
      recognitionRef.current?.stop()
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause()
      }
    }
  }

  const interruptAI = () => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause()
      setIsSpeaking(false)
      setStatus('Listening... (speak naturally)')
      recognitionRef.current?.start()
      console.log('🔇 AI interrupted by user voice')
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

  return (
    <div className={`optimized-voice-widget ${className}`} style={{ padding: '20px' }}>
      {/* Hidden audio element for 11labs playback */}
      <audio ref={audioRef} style={{ display: 'none' }} />
      
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '20px'
      }}>
        <h3 style={{ margin: '0 0 8px 0', color: '#495057' }}>
          ⚡ Optimized Voice Assistant
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
        <p style={{ margin: '4px 0 0 0', fontSize: '10px', color: '#ffc107' }}>
          ⚡ Optimized for Speed
        </p>
      </div>

      {/* Status and Controls */}
      <div style={{
        textAlign: 'center',
        marginBottom: '20px',
        padding: '12px',
        background: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #e9ecef'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: isListening ? '#28a745' : isProcessing ? '#ffc107' : isSpeaking ? '#17a2b8' : '#6c757d',
            animation: (isListening || isProcessing || isSpeaking) ? 'pulse 2s infinite' : 'none'
          }} />
          <span style={{ fontSize: '14px', color: '#495057' }}>{status}</span>
        </div>
        
        {/* Volume Level Indicator */}
        {isListening && !isMuted && (
          <div style={{
            width: '100%',
            height: '4px',
            background: '#e9ecef',
            borderRadius: '2px',
            overflow: 'hidden',
            marginBottom: '8px'
          }}>
            <div style={{
              width: `${Math.min(100, (volumeLevel / 128) * 100)}%`,
              height: '100%',
              background: userSpeaking ? 'linear-gradient(90deg, #dc3545, #c82333)' : 'linear-gradient(90deg, #28a745, #20c997)',
              transition: 'width 0.1s ease'
            }} />
          </div>
        )}
        
        {/* Voice Interruption Indicator */}
        {userSpeaking && isSpeaking && (
          <div style={{
            color: '#dc3545',
            fontSize: '12px',
            fontWeight: 'bold',
            marginTop: '4px'
          }}>
            🎤 Interrupting AI...
          </div>
        )}
        
        {error && (
          <div style={{ color: '#dc3545', fontSize: '12px', marginTop: '4px' }}>
            {error}
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '12px', 
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        {/* Start/Stop Button */}
        {!isListening && !isProcessing && !isSpeaking ? (
          <button
            onClick={startConversation}
            style={{
              padding: '12px 24px',
              borderRadius: '25px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              color: 'white',
              fontSize: '16px',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
              transition: 'all 0.3s ease'
            }}
          >
            ⚡ Start Optimized Conversation
          </button>
        ) : (
          <button
            onClick={stopConversation}
            style={{
              padding: '12px 24px',
              borderRadius: '25px',
              background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
              border: 'none',
              color: 'white',
              fontSize: '16px',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(220, 53, 69, 0.4)',
              transition: 'all 0.3s ease'
            }}
          >
            ⏹️ End Conversation
          </button>
        )}

        {/* Mute/Unmute Button */}
        {(isListening || isProcessing || isSpeaking) && (
          <button
            onClick={toggleMute}
            style={{
              padding: '12px 24px',
              borderRadius: '25px',
              background: isMuted ? 'linear-gradient(135deg, #6c757d 0%, #5a6268 100%)' : 'linear-gradient(135deg, #ffc107 0%, #e0a800 100%)',
              border: 'none',
              color: 'white',
              fontSize: '16px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            {isMuted ? '🔊 Unmute' : '🔇 Mute'}
          </button>
        )}
      </div>

      {/* Instructions */}
      <div style={{
        textAlign: 'center',
        marginBottom: '20px',
        fontSize: '14px',
        color: '#6c757d'
      }}>
        <p style={{ margin: '0 0 8px 0' }}>
          <strong>Optimized Conversation Tips:</strong>
        </p>
        <ul style={{ 
          margin: 0, 
          padding: 0, 
          listStyle: 'none',
          fontSize: '12px'
        }}>
          <li>• ⚡ Faster response times with caching</li>
          <li>• <strong>Interrupt anytime by speaking over the AI</strong></li>
          <li>• Reduced API calls for better performance</li>
          <li>• Try: "I want to start a consulting business"</li>
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
