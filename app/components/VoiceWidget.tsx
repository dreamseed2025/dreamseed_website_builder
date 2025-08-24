'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { createSupabaseClient } from '@/lib/supabase'

interface VoiceWidgetProps {
  userId?: string
  dreamId?: string
  className?: string
  onConversationStart?: () => void
  onConversationEnd?: () => void
  onError?: (error: string) => void
}

interface ConversationMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  audioUrl?: string
}

interface UserProfile {
  id: string
  customer_name?: string
  customer_email?: string
  business_name?: string
  business_type?: string
  dream_dna?: any
}

export default function VoiceWidget({
  userId,
  dreamId,
  className = '',
  onConversationStart,
  onConversationEnd,
  onError
}: VoiceWidgetProps) {
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [conversation, setConversation] = useState<ConversationMessage[]>([])
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [error, setError] = useState<string>('')
  const [isWidgetOpen, setIsWidgetOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recognitionRef = useRef<any>(null)
  const synthesisRef = useRef<SpeechSynthesis | null>(null)
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

  const startListening = async () => {
    try {
      setError('')
      setIsListening(true)
      setIsProcessing(false)

      // Initialize speech recognition
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
          await handleUserInput(transcript)
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
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsListening(false)
  }

  const handleUserInput = async (transcript: string) => {
    try {
      setIsProcessing(true)
      setIsListening(false)

      // Add user message to conversation
      const userMessage: ConversationMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: transcript,
        timestamp: new Date()
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
      // Check if VAPI is configured
      const vapiConfig = await fetch('/api/vapi-config').catch(() => null)
      if (!vapiConfig) return null

      const config = await vapiConfig.json()
      if (!config.publicKey || !config.assistantId) return null

      // Call VAPI with dynamic system message
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
    const response = await fetch('/api/openai-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userInput,
        systemMessage: generateDynamicSystemMessage(),
        userId,
        dreamId,
        conversation: conversation.slice(-10) // Last 10 messages for context
      })
    })

    if (!response.ok) {
      throw new Error('OpenAI API call failed')
    }

    const data = await response.json()
    return data.response
  }

  const speakResponse = async (text: string) => {
    if (!synthesisRef.current) return

    try {
      setIsSpeaking(true)

      // Stop any current speech
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
    // Stop current speech
    if (synthesisRef.current) {
      synthesisRef.current.cancel()
      setIsSpeaking(false)
    }

    // Stop listening if active
    if (isListening) {
      stopListening()
    }

    // Start listening for new input
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

  if (!isWidgetOpen) {
    return (
      <div className={`voice-widget-closed ${className}`}>
        <button
          onClick={toggleWidget}
          className="voice-widget-toggle"
          title="Open Voice Assistant"
        >
          🎤
        </button>
      </div>
    )
  }

  return (
    <div className={`voice-widget ${className} ${isMinimized ? 'minimized' : ''}`}>
      {/* Header */}
      <div className="voice-widget-header">
        <div className="voice-widget-title">
          <span className="voice-icon">🎤</span>
          <span>DreamSeed AI Assistant</span>
        </div>
        <div className="voice-widget-controls">
          <button
            onClick={minimizeWidget}
            className="voice-widget-btn minimize-btn"
            title="Minimize"
          >
            {isMinimized ? '🔽' : '🔼'}
          </button>
          <button
            onClick={toggleWidget}
            className="voice-widget-btn close-btn"
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
              onClick={isListening ? stopListening : startListening}
              disabled={isProcessing || isSpeaking}
              className={`voice-btn ${isListening ? 'listening' : ''} ${isProcessing ? 'processing' : ''} ${isSpeaking ? 'speaking' : ''}`}
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
              ) : isListening ? (
                <>
                  <div className="pulse-ring"></div>
                  🎤 Listening...
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
        .voice-widget {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 350px;
          max-height: 500px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
          border: 1px solid #e1e5e9;
          z-index: 1000;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .voice-widget.minimized {
          height: 60px;
        }

        .voice-widget-closed {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 1000;
        }

        .voice-widget-toggle {
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

        .voice-widget-toggle:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
        }

        .voice-widget-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .voice-widget-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          font-size: 14px;
        }

        .voice-icon {
          font-size: 16px;
        }

        .voice-widget-controls {
          display: flex;
          gap: 8px;
        }

        .voice-widget-btn {
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

        .voice-widget-btn:hover {
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

        .voice-btn {
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

        .voice-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
        }

        .voice-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .voice-btn.listening {
          background: linear-gradient(135deg, #ff4757 0%, #ff6b7a 100%);
          animation: pulse-border 1.5s ease-in-out infinite;
        }

        .voice-btn.processing {
          background: linear-gradient(135deg, #ffa726 0%, #ffb74d 100%);
        }

        .voice-btn.speaking {
          background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%);
        }

        .pulse-ring {
          position: absolute;
          width: 100%;
          height: 100%;
          border: 2px solid rgba(255, 255, 255, 0.5);
          border-radius: 50px;
          animation: pulse-ring 1.5s ease-out infinite;
        }

        @keyframes pulse-border {
          0% { border-color: rgba(255, 255, 255, 0.5); }
          50% { border-color: rgba(255, 255, 255, 0.8); }
          100% { border-color: rgba(255, 255, 255, 0.5); }
        }

        @keyframes pulse-ring {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(1.3);
            opacity: 0;
          }
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

        .message-time {
          font-size: 10px;
          color: #6c757d;
          margin-top: 4px;
        }

        @media (max-width: 480px) {
          .voice-widget {
            width: calc(100vw - 40px);
            right: 20px;
            left: 20px;
          }
        }
      `}</style>
    </div>
  )
}

