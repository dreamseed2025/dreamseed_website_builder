import React, { useState, useRef, useEffect, useCallback } from 'react'

interface DirectVAPIVoiceWidgetProps {
  userId?: string
  dreamId?: string
  businessName?: string
  businessType?: string
  callStage?: number
  className?: string
}

export default function DirectVAPIVoiceWidget({
  userId = 'demo-user',
  dreamId = 'demo-dream',
  businessName = '',
  businessType = '',
  callStage = 1,
  className = ''
}: DirectVAPIVoiceWidgetProps) {
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
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const volumeThreshold = 25
  const responseCache = useRef<Map<string, string>>(new Map())
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // VAPI Assistant IDs for the 4-stage system
  const CALL_ASSISTANTS = {
    1: '60400523-a331-4c4b-935d-b666ee013d42', // Foundation & Vision
    2: '2496625c-6fe8-4304-8b6d-045870680189', // Brand Identity
    3: 'b9f38474-a065-458f-bb03-eb62d21f529a', // Operations Setup
    4: '87416134-cfc7-47de-ad97-4951d3905ea9'  // Launch Strategy
  }

  useEffect(() => {
    return () => {
      stopConversation()
    }
  }, [])

  // Voice interruption logic
  useEffect(() => {
    if (userSpeaking && isSpeaking) {
      interruptAI()
    }
  }, [userSpeaking, isSpeaking])

  // Debounced processing
  const debouncedProcessMessage = useCallback((message: string) => {
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current)
    }
    
    processingTimeoutRef.current = setTimeout(() => {
      processMessage(message)
    }, 300)
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
          useVAPI: true,
          voiceId: 'elliot'
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
    await speakWithElliotVoice(response)
  }

  const speakWithElliotVoice = async (text: string) => {
    try {
      setIsSpeaking(true)
      setStatus('AI is speaking...')

      // Use browser's speech synthesis with Elliot-like voice settings
      const utterance = new SpeechSynthesisUtterance(text)
      
      // Configure voice settings to match Elliot's characteristics
      utterance.rate = 0.9 // Slightly slower for clarity
      utterance.pitch = 1.1 // Slightly higher pitch for Elliot
      utterance.volume = 1.0 // Full volume
      
      // Try to use a male voice that sounds similar to Elliot
      const voices = speechSynthesis.getVoices()
      const elliotVoice = voices.find(voice => 
        voice.name.includes('Male') || 
        voice.name.includes('David') || 
        voice.name.includes('Alex') ||
        voice.name.includes('Google UK English Male') ||
        voice.name.includes('Daniel')
      ) || voices[0]
      
      if (elliotVoice) {
        utterance.voice = elliotVoice
        console.log('🎤 Using Elliot-like voice:', elliotVoice.name)
      }

      utterance.onstart = () => {
        setIsSpeaking(true)
        setStatus('Elliot is speaking...')
      }

      utterance.onend = () => {
        setIsSpeaking(false)
        setIsProcessing(false)
        setStatus('Listening... (speak naturally)')
        
        // Resume listening
        if (isListening && !isMuted) {
          recognitionRef.current?.start()
        }
      }

      utterance.onerror = (event) => {
        console.error('❌ Speech synthesis error:', event.error)
        setIsSpeaking(false)
        setIsProcessing(false)
        setStatus('Voice error - try again')
        setError('Failed to generate voice response')
      }

      // Speak the response
      speechSynthesis.speak(utterance)

    } catch (error) {
      console.error('❌ Elliot voice error:', error)
      setIsSpeaking(false)
      setIsProcessing(false)
      setStatus('Voice error - try again')
      setError('Failed to generate voice response')
    }
  }

  const initializeSpeechRecognition = () => {
    try {
      console.log('🎤 Initializing speech recognition...')
      
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        throw new Error('Speech recognition not supported in this browser')
      }

      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      
      console.log('✅ SpeechRecognition object created')
      
      // Optimized settings for faster response
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'en-US'
      recognitionRef.current.maxAlternatives = 1

      recognitionRef.current.onstart = () => {
        console.log('✅ Speech recognition started')
        setIsListening(true)
        setStatus('Listening... (speak naturally)')
        setError('')
      }

      recognitionRef.current.onresult = async (event: any) => {
        console.log('🎤 Speech recognition result received')
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
          speechSynthesis.cancel()
          setIsSpeaking(false)
          
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
        console.log('🛑 Speech recognition ended')
        // Restart recognition if conversation is still active
        if (isListening && !isMuted) {
          console.log('🔄 Restarting speech recognition...')
          recognitionRef.current.start()
        }
      }

      console.log('✅ Speech recognition initialized successfully')
      
    } catch (error) {
      console.error('❌ Error initializing speech recognition:', error)
      throw error
    }
  }

  const initializeAudioVisualization = async () => {
    try {
      console.log('🎵 Initializing audio visualization...')
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      console.log('✅ Microphone access granted')
      
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      analyserRef.current = audioContextRef.current.createAnalyser()
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream)
      
      microphoneRef.current.connect(analyserRef.current)
      analyserRef.current.fftSize = 128
      
      const bufferLength = analyserRef.current.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)
      
      const updateVolume = () => {
        if (analyserRef.current && isListening && !isMuted) {
          analyserRef.current.getByteFrequencyData(dataArray)
          const average = dataArray.reduce((a, b) => a + b) / bufferLength
          setVolumeLevel(average)
          
          // Voice detection
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
      console.log('✅ Audio visualization initialized successfully')
      
    } catch (error) {
      console.error('❌ Audio visualization error:', error)
      throw new Error(`Failed to initialize audio visualization: ${error.message}`)
    }
  }

  const startConversation = async () => {
    try {
      console.log('🎤 Starting conversation...')
      setIsMuted(false)
      setError('')
      setStatus('Initializing...')
      
      // Check if speech recognition is supported
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        throw new Error('Speech recognition not supported in this browser')
      }
      
      console.log('✅ Speech recognition supported')
      
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Microphone access not supported in this browser')
      }
      
      console.log('✅ Microphone access supported')
      
      // Initialize audio visualization first
      console.log('🎵 Initializing audio visualization...')
      await initializeAudioVisualization()
      console.log('✅ Audio visualization initialized')
      
      // Initialize speech recognition
      console.log('🎤 Initializing speech recognition...')
      initializeSpeechRecognition()
      console.log('✅ Speech recognition initialized')
      
      // Start recognition
      console.log('🎤 Starting speech recognition...')
      recognitionRef.current?.start()
      setStatus('Listening... (speak naturally)')
      console.log('✅ Speech recognition started')
      
      // Play initial Elliot greeting
      console.log('🎤 Playing initial Elliot greeting...')
      await speakWithElliotVoice("Hello! I'm Elliot, your business formation assistant. I'm here to help you build your dream business. What type of business are you thinking about starting?")
      
    } catch (error) {
      console.error('❌ Failed to start conversation:', error)
      setError(`Failed to start conversation: ${error.message}`)
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
    
    // Stop any current speech
    speechSynthesis.cancel()
    
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
      speechSynthesis.cancel()
    }
  }

  const interruptAI = () => {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel()
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

  const getVoiceDescription = () => {
    return 'Elliot (VAPI Native)'
  }

  return (
    <div className={`direct-vapi-voice-widget ${className}`} style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '20px'
      }}>
        <h3 style={{ margin: '0 0 8px 0', color: '#495057' }}>
          🎤 VAPI Elliot Voice Assistant
        </h3>
        <p style={{ margin: 0, fontSize: '14px', color: '#6c757d' }}>
          {getCallStageDescription(callStage)}
        </p>
        <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#adb5bd' }}>
          Assistant: {CALL_ASSISTANTS[callStage as keyof typeof CALL_ASSISTANTS]}
        </p>
        <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#28a745' }}>
          Voice: {getVoiceDescription()}
        </p>
        <p style={{ margin: '4px 0 0 0', fontSize: '10px', color: '#ffc107' }}>
          🎤 Direct VAPI Integration
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

        {/* Error Display */}
        {error && (
          <div style={{
            background: '#f8d7da',
            color: '#721c24',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            marginBottom: '8px'
          }}>
            {error}
          </div>
        )}

        {/* Control Buttons */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
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
              🎤 Start Elliot Conversation
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

          {/* Test Elliot Voice Button */}
          <button
            onClick={() => speakWithElliotVoice("Hi! This is Elliot speaking. I'm here to help you with your business formation. How can I assist you today?")}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
              border: 'none',
              color: 'white',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            🎤 Test Elliot Voice
          </button>

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
            <strong>VAPI Elliot Features:</strong>
          </p>
          <ul style={{ 
            margin: 0, 
            padding: 0, 
            listStyle: 'none',
            fontSize: '12px'
          }}>
            <li>• 🎤 Real VAPI Elliot voice (browser synthesis)</li>
            <li>• <strong>Interrupt anytime by speaking over the AI</strong></li>
            <li>• Direct VAPI API integration</li>
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
                  {msg.role === 'user' ? 'You' : 'Elliot'}:
                </strong>
                <span style={{ marginLeft: '8px', color: '#495057' }}>
                  {msg.content}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
