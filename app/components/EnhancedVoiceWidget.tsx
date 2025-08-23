'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { createSupabaseClient } from '@/lib/supabase'

interface EnhancedVoiceWidgetProps {
  userId?: string
  dreamId?: string
  className?: string
  onConversationStart?: () => void
  onConversationEnd?: () => void
  onError?: (error: string) => void
  useWhisper?: boolean
}

interface ConversationMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  audioUrl?: string
  confidence?: number
}

interface UserProfile {
  id: string
  customer_name?: string
  customer_email?: string
  business_name?: string
  business_type?: string
  dream_dna?: any
}

export default function EnhancedVoiceWidget({
  userId,
  dreamId,
  className = '',
  onConversationStart,
  onConversationEnd,
  onError,
  useWhisper = true
}: EnhancedVoiceWidgetProps) {
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [conversation, setConversation] = useState<ConversationMessage[]>([])
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [error, setError] = useState<string>('')
  const [isWidgetOpen, setIsWidgetOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)
  const [transcriptionConfidence, setTranscriptionConfidence] = useState<number>(0)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recognitionRef = useRef<any>(null)
  const synthesisRef = useRef<SpeechSynthesis | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const supabase = createSupabaseClient()

  // Load user profile on mount
  useEffect(() => {
    if (userId) {
      loadUserProfile()
    }
  }, [userId])

  // Initialize speech synthesis
  useEffect(() => {
    if ('speechSynthesis' in window) {
      synthesisRef.current = window.speechSynthesis
    }
  }, [])

  // Cleanup audio context on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  const loadUserProfile = async () => {
    try {
      if (!userId) return

      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      const { data: dreamDNA } = await supabase
        .from('dream_dna')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (userData) {
        setUserProfile({
          id: userId,
          customer_name: userData.customer_name,
          customer_email: userData.customer_email,
          business_name: userData.business_name,
          business_type: userData.business_type,
          dream_dna: dreamDNA
        })
      }
    } catch (err) {
      console.error('Failed to load user profile:', err)
    }
  }

  const generateDynamicSystemMessage = useCallback(() => {
    let systemMessage = `You are an AI voice assistant for DreamSeed, a business formation platform. You help users with business formation, domain selection, and business planning.`

    if (userProfile) {
      systemMessage += `\n\nUser Context:
- Name: ${userProfile.customer_name || 'Not provided'}
- Business: ${userProfile.business_name || 'Not specified'}
- Business Type: ${userProfile.business_type || 'Not specified'}
- Email: ${userProfile.customer_email || 'Not provided'}`

      if (userProfile.dream_dna) {
        systemMessage += `\n- Business Concept: ${userProfile.dream_dna.business_concept || 'Not specified'}
- Vision: ${userProfile.dream_dna.vision_statement || 'Not specified'}
- Target Customers: ${userProfile.dream_dna.target_customers || 'Not specified'}`
      }
    }

    if (dreamId) {
      systemMessage += `\n- Dream ID: ${dreamId}`
    }

    systemMessage += `\n\nGuidelines:
- Be conversational and friendly
- Keep responses concise (1-2 sentences)
- Ask follow-up questions to understand their needs
- Provide actionable advice for business formation
- If they mention domains, offer to help find available ones
- If they mention business formation, guide them through the process`

    return systemMessage
  }, [userProfile, dreamId])

  const startAudioVisualization = async (stream: MediaStream) => {
    try {
      audioContextRef.current = new AudioContext()
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 256

      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream)
      microphoneRef.current.connect(analyserRef.current)

      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)

      const updateAudioLevel = () => {
        if (analyserRef.current && isRecording) {
          analyserRef.current.getByteFrequencyData(dataArray)
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length
          setAudioLevel(average)
          animationFrameRef.current = requestAnimationFrame(updateAudioLevel)
        }
      }

      updateAudioLevel()
    } catch (err) {
      console.error('Failed to start audio visualization:', err)
    }
  }

  const startRecording = async () => {
    try {
      setError('')
      setIsRecording(true)
      setIsListening(false)
      setIsProcessing(false)
      audioChunksRef.current = []

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        } 
      })

      // Start audio visualization
      await startAudioVisualization(stream)

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })

      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        await processAudioInput(audioBlob)
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
        setIsRecording(false)
        setAudioLevel(0)
      }

      mediaRecorder.start()
    } catch (err) {
      setError('Failed to start recording')
      setIsRecording(false)
      console.error('Recording error:', err)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
    }
  }

  const processAudioInput = async (audioBlob: Blob) => {
    try {
      setIsProcessing(true)
      setError('')

      let transcript = ''
      let confidence = 0

      if (useWhisper) {
        // Use OpenAI Whisper for transcription
        const formData = new FormData()
        formData.append('audio', audioBlob)

        const response = await fetch('/api/whisper-transcribe', {
          method: 'POST',
          body: formData
        })

        if (response.ok) {
          const data = await response.json()
          transcript = data.transcript
          confidence = 0.95 // Whisper typically has high confidence
        } else {
          throw new Error('Whisper transcription failed')
        }
      } else {
        // Fallback to browser speech recognition
        transcript = await getBrowserTranscription()
        confidence = 0.8
      }

      if (transcript.trim()) {
        setTranscriptionConfidence(confidence)
        await handleUserInput(transcript, confidence)
      } else {
        setError('No speech detected. Please try again.')
      }

    } catch (err) {
      setError('Failed to process audio input')
      console.error('Audio processing error:', err)
    } finally {
      setIsProcessing(false)
    }
  }

  const getBrowserTranscription = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        reject(new Error('Speech recognition not supported'))
        return
      }

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      const recognition = new SpeechRecognition()

      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US'

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        resolve(transcript)
      }

      recognition.onerror = (event: any) => {
        reject(new Error(`Speech recognition error: ${event.error}`))
      }

      recognition.start()
    })
  }

  const startListening = async () => {
    if (useWhisper) {
      await startRecording()
    } else {
      await startBrowserListening()
    }
  }

  const startBrowserListening = async () => {
    try {
      setError('')
      setIsListening(true)
      setIsProcessing(false)

      if (!recognitionRef.current) {
        if ('webkitSpeechRecognition' in window) {
          recognitionRef.current = new (window as any).webkitSpeechRecognition()
        } else if ('SpeechRecognition' in window) {
          recognitionRef.current = new (window as any).SpeechRecognition()
        } else {
          throw new Error('Speech recognition not supported')
        }

        recognitionRef.current.continuous = false
        recognitionRef.current.interimResults = false
        recognitionRef.current.lang = 'en-US'

        recognitionRef.current.onstart = () => {
          setIsListening(true)
        }

        recognitionRef.current.onresult = async (event: any) => {
          const transcript = event.results[0][0].transcript
          await handleUserInput(transcript, 0.8)
        }

        recognitionRef.current.onerror = (event: any) => {
          setError(`Speech recognition error: ${event.error}`)
          setIsListening(false)
        }

        recognitionRef.current.onend = () => {
          setIsListening(false)
        }
      }

      recognitionRef.current.start()
    } catch (err) {
      setError('Failed to start speech recognition')
      setIsListening(false)
    }
  }

  const stopListening = () => {
    if (useWhisper) {
      stopRecording()
    } else if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsListening(false)
  }

  const handleUserInput = async (transcript: string, confidence: number = 0.8) => {
    try {
      setIsProcessing(true)
      setIsListening(false)
      setIsRecording(false)

      // Add user message to conversation
      const userMessage: ConversationMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: transcript,
        timestamp: new Date(),
        confidence
      }
      setConversation(prev => [...prev, userMessage])

      // Call VAPI or OpenAI API for response
      const response = await getAIResponse(transcript)
      
      // Add assistant response to conversation
      const assistantMessage: ConversationMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text,
        timestamp: new Date()
      }
      setConversation(prev => [...prev, assistantMessage])

      // Speak the response
      if (response.text) {
        await speakResponse(response.text)
      }

    } catch (err) {
      setError('Failed to process your request')
      console.error('Error processing user input:', err)
    } finally {
      setIsProcessing(false)
    }
  }

  const getAIResponse = async (userInput: string): Promise<{ text: string }> => {
    try {
      // Try VAPI first if available
      const vapiResponse = await callVAPI(userInput)
      if (vapiResponse) {
        return { text: vapiResponse }
      }

      // Fallback to OpenAI
      const openaiResponse = await callOpenAI(userInput)
      return { text: openaiResponse }

    } catch (err) {
      console.error('AI response error:', err)
      return { text: "I'm sorry, I'm having trouble processing your request right now. Please try again." }
    }
  }

  const callVAPI = async (userInput: string): Promise<string | null> => {
    try {
      const response = await fetch('/api/vapi-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userInput,
          systemMessage: generateDynamicSystemMessage(),
          userId,
          dreamId
        })
      })

      if (response.ok) {
        const data = await response.json()
        return data.response
      }

      return null
    } catch (err) {
      console.error('VAPI call error:', err)
      return null
    }
  }

  const callOpenAI = async (userInput: string): Promise<string> => {
    // Try VAPI integration first, fallback to OpenAI
    try {
      const response = await fetch('/api/vapi-integration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userInput,
          userId,
          dreamId,
          businessName: businessName || '',
          businessType: businessType || '',
          callStage: determineCallStage(),
          useVAPI: true
        })
      })

      if (response.ok) {
        const data = await response.json()
        console.log(`✅ VAPI Integration Response (${data.source}):`, data.response)
        return data.response
      }
    } catch (vapiError) {
      console.warn('VAPI integration failed, falling back to OpenAI:', vapiError)
    }

    // Fallback to OpenAI
    const response = await fetch('/api/openai-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userInput,
        systemMessage: generateDynamicSystemMessage(),
        userId,
        dreamId,
        conversation: conversation.slice(-10)
      })
    })

    if (!response.ok) {
      throw new Error('OpenAI API call failed')
    }

    const data = await response.json()
    return data.response
  }

  const determineCallStage = (): number => {
    // Simple logic to determine call stage based on conversation context
    const recentMessages = conversation.slice(-5).map(msg => msg.content.toLowerCase())
    const allText = recentMessages.join(' ')
    
    if (allText.includes('brand') || allText.includes('logo') || allText.includes('domain')) {
      return 2 // Brand Identity
    } else if (allText.includes('bank') || allText.includes('accounting') || allText.includes('compliance')) {
      return 3 // Operations
    } else if (allText.includes('launch') || allText.includes('marketing') || allText.includes('revenue')) {
      return 4 // Launch Strategy
    } else {
      return 1 // Foundation (default)
    }
  }

  const speakResponse = async (text: string) => {
    if (!synthesisRef.current) return

    try {
      setIsSpeaking(true)

      synthesisRef.current.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 0.8

      utterance.onend = () => {
        setIsSpeaking(false)
      }

      utterance.onerror = () => {
        setIsSpeaking(false)
        setError('Failed to speak response')
      }

      synthesisRef.current.speak(utterance)
    } catch (err) {
      setIsSpeaking(false)
      console.error('Speech synthesis error:', err)
    }
  }

  const handleInterrupt = () => {
    if (synthesisRef.current) {
      synthesisRef.current.cancel()
      setIsSpeaking(false)
    }

    if (isListening || isRecording) {
      stopListening()
    }

    setTimeout(() => {
      startListening()
    }, 100)
  }

  const toggleWidget = () => {
    setIsWidgetOpen(!isWidgetOpen)
    if (!isWidgetOpen) {
      onConversationStart?.()
    } else {
      onConversationEnd?.()
    }
  }

  const minimizeWidget = () => {
    setIsMinimized(!isMinimized)
  }

  const clearConversation = () => {
    setConversation([])
    setError('')
  }

  const isActive = isListening || isRecording || isProcessing || isSpeaking

  if (!isWidgetOpen) {
    return (
      <div className={`enhanced-voice-widget-closed ${className}`}>
        <button
          onClick={toggleWidget}
          className="enhanced-voice-widget-toggle"
          title="Open AI Voice Assistant"
        >
          🎤
        </button>
      </div>
    )
  }

  return (
    <div className={`enhanced-voice-widget ${className} ${isMinimized ? 'minimized' : ''}`}>
      {/* Header */}
      <div className="enhanced-voice-widget-header">
        <div className="enhanced-voice-widget-title">
          <span className="voice-icon">🎤</span>
          <span>AI Voice Assistant</span>
          {useWhisper && <span className="whisper-badge">Whisper</span>}
        </div>
        <div className="enhanced-voice-widget-controls">
          <button
            onClick={minimizeWidget}
            className="enhanced-voice-widget-btn minimize-btn"
            title="Minimize"
          >
            {isMinimized ? '🔽' : '🔼'}
          </button>
          <button
            onClick={toggleWidget}
            className="enhanced-voice-widget-btn close-btn"
            title="Close"
          >
            ✕
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* User Profile Display */}
          {userProfile && (
            <div className="user-profile">
              <div className="profile-info">
                {userProfile.customer_name && (
                  <span className="profile-tag">👤 {userProfile.customer_name}</span>
                )}
                {userProfile.business_name && (
                  <span className="profile-tag">🏢 {userProfile.business_name}</span>
                )}
                {dreamId && (
                  <span className="profile-tag">💭 Dream #{dreamId}</span>
                )}
              </div>
            </div>
          )}

          {/* Voice Controls */}
          <div className="voice-controls">
            <button
              onClick={isActive ? stopListening : startListening}
              disabled={isProcessing}
              className={`enhanced-voice-btn ${isActive ? 'active' : ''} ${isProcessing ? 'processing' : ''} ${isSpeaking ? 'speaking' : ''}`}
            >
              {isProcessing ? (
                <>
                  <div className="spinner"></div>
                  Processing...
                </>
              ) : isSpeaking ? (
                <>
                  🔊 Speaking...
                </>
              ) : isActive ? (
                <>
                  {useWhisper && isRecording && (
                    <div className="audio-visualizer">
                      <div 
                        className="audio-bar" 
                        style={{ height: `${Math.max(10, audioLevel * 0.5)}px` }}
                      ></div>
                    </div>
                  )}
                  🎤 {useWhisper ? 'Recording...' : 'Listening...'}
                </>
              ) : (
                <>
                  🎤 Start Speaking
                </>
              )}
            </button>

            {/* Interrupt Button */}
            {isSpeaking && (
              <button
                onClick={handleInterrupt}
                className="interrupt-btn"
                title="Interrupt and speak"
              >
                🔇 Interrupt
              </button>
            )}

            {/* Transcription Confidence */}
            {transcriptionConfidence > 0 && (
              <div className="confidence-indicator">
                Confidence: {Math.round(transcriptionConfidence * 100)}%
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="error-message">
              ❌ {error}
              <button
                onClick={() => setError('')}
                className="error-close"
              >
                ✕
              </button>
            </div>
          )}

          {/* Conversation */}
          <div className="conversation-container">
            <div className="conversation-header">
              <h4>Conversation</h4>
              {conversation.length > 0 && (
                <button
                  onClick={clearConversation}
                  className="clear-btn"
                  title="Clear conversation"
                >
                  🗑️ Clear
                </button>
              )}
            </div>
            
            <div className="conversation-messages">
              {conversation.length === 0 ? (
                <div className="empty-conversation">
                  <p>Start speaking to begin your conversation!</p>
                  <p className="conversation-tips">
                    💡 Try saying: "Help me form an LLC" or "Find domains for my business"
                  </p>
                </div>
              ) : (
                conversation.map((message) => (
                  <div
                    key={message.id}
                    className={`message ${message.role}`}
                  >
                    <div className="message-content">
                      {message.content}
                      {message.confidence && (
                        <div className="message-confidence">
                          Confidence: {Math.round(message.confidence * 100)}%
                        </div>
                      )}
                    </div>
                    <div className="message-time">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        .enhanced-voice-widget {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 380px;
          max-height: 600px;
          background: white;
          border-radius: 20px;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
          border: 1px solid #e1e5e9;
          z-index: 1000;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .enhanced-voice-widget.minimized {
          height: 60px;
        }

        .enhanced-voice-widget-closed {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 1000;
        }

        .enhanced-voice-widget-toggle {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          color: white;
          font-size: 24px;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
          transition: all 0.3s ease;
        }

        .enhanced-voice-widget-toggle:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
        }

        .enhanced-voice-widget-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .enhanced-voice-widget-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          font-size: 14px;
        }

        .voice-icon {
          font-size: 16px;
        }

        .whisper-badge {
          background: rgba(255, 255, 255, 0.2);
          padding: 2px 6px;
          border-radius: 8px;
          font-size: 10px;
          font-weight: 500;
        }

        .enhanced-voice-widget-controls {
          display: flex;
          gap: 8px;
        }

        .enhanced-voice-widget-btn {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          width: 24px;
          height: 24px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.2s;
        }

        .enhanced-voice-widget-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .user-profile {
          padding: 12px 20px;
          background: #f8f9fa;
          border-bottom: 1px solid #e9ecef;
        }

        .profile-info {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .profile-tag {
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 500;
        }

        .voice-controls {
          padding: 20px;
          text-align: center;
        }

        .enhanced-voice-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 16px 24px;
          border-radius: 50px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0 auto;
          position: relative;
          min-width: 160px;
          justify-content: center;
        }

        .enhanced-voice-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
        }

        .enhanced-voice-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .enhanced-voice-btn.active {
          background: linear-gradient(135deg, #ff4757 0%, #ff6b7a 100%);
          animation: pulse-border 1.5s ease-in-out infinite;
        }

        .enhanced-voice-btn.processing {
          background: linear-gradient(135deg, #ffa726 0%, #ffb74d 100%);
        }

        .enhanced-voice-btn.speaking {
          background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%);
        }

        .audio-visualizer {
          display: flex;
          align-items: center;
          gap: 2px;
          height: 20px;
        }

        .audio-bar {
          width: 3px;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 2px;
          transition: height 0.1s ease;
        }

        @keyframes pulse-border {
          0% { border-color: rgba(255, 255, 255, 0.5); }
          50% { border-color: rgba(255, 255, 255, 0.8); }
          100% { border-color: rgba(255, 255, 255, 0.5); }
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .interrupt-btn {
          background: #ff4757;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 12px;
          cursor: pointer;
          margin-top: 8px;
          transition: all 0.2s;
        }

        .interrupt-btn:hover {
          background: #ff6b7a;
        }

        .confidence-indicator {
          margin-top: 8px;
          font-size: 12px;
          color: #6c757d;
          background: #f8f9fa;
          padding: 4px 8px;
          border-radius: 8px;
          display: inline-block;
        }

        .error-message {
          background: #ffebee;
          color: #c62828;
          padding: 12px 20px;
          margin: 0 20px;
          border-radius: 8px;
          font-size: 14px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .error-close {
          background: none;
          border: none;
          color: #c62828;
          cursor: pointer;
          font-size: 16px;
        }

        .conversation-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          max-height: 300px;
        }

        .conversation-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 20px;
          border-bottom: 1px solid #e9ecef;
        }

        .conversation-header h4 {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          color: #495057;
        }

        .clear-btn {
          background: none;
          border: none;
          color: #6c757d;
          cursor: pointer;
          font-size: 12px;
          padding: 4px 8px;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .clear-btn:hover {
          background: #f8f9fa;
          color: #495057;
        }

        .conversation-messages {
          flex: 1;
          overflow-y: auto;
          padding: 12px 20px;
          max-height: 200px;
        }

        .empty-conversation {
          text-align: center;
          color: #6c757d;
          font-size: 14px;
        }

        .conversation-tips {
          font-size: 12px;
          margin-top: 8px;
          opacity: 0.8;
        }

        .message {
          margin-bottom: 12px;
          display: flex;
          flex-direction: column;
        }

        .message.user {
          align-items: flex-end;
        }

        .message.assistant {
          align-items: flex-start;
        }

        .message-content {
          max-width: 80%;
          padding: 8px 12px;
          border-radius: 12px;
          font-size: 14px;
          line-height: 1.4;
        }

        .message.user .message-content {
          background: #667eea;
          color: white;
        }

        .message.assistant .message-content {
          background: #f8f9fa;
          color: #495057;
          border: 1px solid #e9ecef;
        }

        .message-confidence {
          font-size: 10px;
          opacity: 0.7;
          margin-top: 4px;
        }

        .message-time {
          font-size: 10px;
          color: #6c757d;
          margin-top: 4px;
        }

        @media (max-width: 480px) {
          .enhanced-voice-widget {
            width: calc(100vw - 40px);
            right: 20px;
            left: 20px;
          }
        }
      `}</style>
    </div>
  )
}
