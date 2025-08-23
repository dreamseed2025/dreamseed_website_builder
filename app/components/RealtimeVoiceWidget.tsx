'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Agent } from 'openai-realtime-agents'

interface RealtimeVoiceWidgetProps {
  userId: string
  dreamId: string
  useWhisper?: boolean
  onConversationStart?: () => void
  onConversationEnd?: () => void
  onError?: (error: string) => void
}

export default function RealtimeVoiceWidget({
  userId,
  dreamId,
  useWhisper = true,
  onConversationStart,
  onConversationEnd,
  onError
}: RealtimeVoiceWidgetProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [conversationHistory, setConversationHistory] = useState<Array<{
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
    confidence?: number
  }>>([])
  const [status, setStatus] = useState('Ready to connect')
  const [error, setError] = useState<string | null>(null)
  
  const agentRef = useRef<Agent | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  // Generate dynamic system message based on user context
  const generateSystemMessage = useCallback(() => {
    return `You are an AI voice assistant for DreamSeed, a business formation platform. You help users with business formation, domain selection, and business planning.

User Context:
- User ID: ${userId}
- Dream ID: ${dreamId}

Guidelines:
- Be conversational and friendly
- Keep responses concise (1-2 sentences)
- Ask follow-up questions to understand their needs
- Provide actionable advice for business formation
- If they mention domains, offer to help find available ones
- If they mention business formation, guide them through the process
- Personalize responses based on their business context

You can be interrupted at any time - this is expected and natural in voice conversations.`
  }, [userId, dreamId])

  // Initialize OpenAI Realtime Agent
  const initializeAgent = useCallback(async () => {
    try {
      setStatus('Initializing OpenAI Realtime Agent...')
      
      if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured')
      }

      // Create the agent with your system message
      const agent = new Agent({
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
        model: 'gpt-4o-mini',
        systemMessage: generateSystemMessage(),
        // Enable real-time voice features
        voice: {
          input: {
            samplingRate: 16000,
            // Enable voice activity detection for interrupts
            voiceActivityDetection: {
              enabled: true,
              silenceThresholdMs: 500,
              speechThresholdMs: 100
            }
          },
          output: {
            model: 'tts-1',
            voice: 'alloy',
            speed: 1.0
          }
        }
      })

      // Set up event listeners
      agent.on('start', () => {
        setIsConnected(true)
        setStatus('Connected to OpenAI Realtime Agent')
        onConversationStart?.()
      })

      agent.on('end', () => {
        setIsConnected(false)
        setIsListening(false)
        setIsSpeaking(false)
        setStatus('Disconnected')
        onConversationEnd?.()
      })

      agent.on('userMessage', (message) => {
        setConversationHistory(prev => [...prev, {
          role: 'user',
          content: message.content,
          timestamp: new Date()
        }])
        setIsListening(false)
        setIsSpeaking(true)
      })

      agent.on('assistantMessage', (message) => {
        setConversationHistory(prev => [...prev, {
          role: 'assistant',
          content: message.content,
          timestamp: new Date()
        }])
        setIsSpeaking(false)
      })

      agent.on('interrupt', () => {
        setIsSpeaking(false)
        setIsListening(true)
        setStatus('User interrupted - listening...')
      })

      agent.on('error', (error) => {
        setError(error.message)
        setStatus('Error occurred')
        onError?.(error.message)
      })

      agentRef.current = agent
      setStatus('Agent initialized - click to start conversation')
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize agent'
      setError(errorMessage)
      setStatus('Initialization failed')
      onError?.(errorMessage)
    }
  }, [userId, dreamId, generateSystemMessage, onConversationStart, onConversationEnd, onError])

  // Start/stop conversation
  const toggleConversation = useCallback(async () => {
    if (!agentRef.current) {
      await initializeAgent()
      return
    }

    if (isConnected) {
      // Stop conversation
      await agentRef.current.stop()
    } else {
      // Start conversation
      try {
        setStatus('Starting conversation...')
        await agentRef.current.start()
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to start conversation'
        setError(errorMessage)
        onError?.(errorMessage)
      }
    }
  }, [isConnected, initializeAgent, onError])

  // Audio visualization
  const startAudioVisualization = useCallback((stream: MediaStream) => {
    try {
      audioContextRef.current = new AudioContext()
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 256
      
      const microphone = audioContextRef.current.createMediaStreamSource(stream)
      microphone.connect(analyserRef.current)
      
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
      
      const updateAudioLevel = () => {
        if (analyserRef.current && isListening) {
          analyserRef.current.getByteFrequencyData(dataArray)
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length
          // You can use this for audio visualization
          animationFrameRef.current = requestAnimationFrame(updateAudioLevel)
        }
      }
      
      updateAudioLevel()
    } catch (err) {
      console.error('Failed to start audio visualization:', err)
    }
  }, [isListening])

  const stopAudioVisualization = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (agentRef.current) {
        agentRef.current.stop()
      }
      stopAudioVisualization()
    }
  }, [stopAudioVisualization])

  return (
    <div className="realtime-voice-widget">
      {/* Status Display */}
      <div className="widget-status">
        <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
          {isConnected ? '🟢' : '🔴'}
        </div>
        <span className="status-text">{status}</span>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-message">
          <span>❌ {error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Voice Widget Button */}
      <button
        className={`voice-widget-button ${isConnected ? 'connected' : ''} ${isListening ? 'listening' : ''} ${isSpeaking ? 'speaking' : ''}`}
        onClick={toggleConversation}
        disabled={!agentRef.current && status.includes('failed')}
        title={isConnected ? 'Stop conversation' : 'Start conversation'}
      >
        {isConnected ? (isListening ? '👂' : isSpeaking ? '🗣️' : '🎤') : '🎤'}
      </button>

      {/* Conversation History */}
      <div className="conversation-history">
        <h3>Conversation History</h3>
        <div className="messages">
          {conversationHistory.map((message, index) => (
            <div key={index} className={`message ${message.role}`}>
              <div className="message-content">{message.content}</div>
              <div className="message-time">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Audio Visualization */}
      {isListening && (
        <div className="audio-visualizer">
          <div className="audio-bar"></div>
          <div className="audio-bar"></div>
          <div className="audio-bar"></div>
          <div className="audio-bar"></div>
          <div className="audio-bar"></div>
        </div>
      )}

      <style jsx>{`
        .realtime-voice-widget {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 1000;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 10px;
        }

        .widget-status {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 8px 12px;
          border-radius: 20px;
          font-size: 12px;
        }

        .status-indicator {
          font-size: 12px;
        }

        .voice-widget-button {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          border: none;
          background: linear-gradient(135deg, #ff4757 0%, #ff6b7a 100%);
          color: white;
          font-size: 24px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 16px rgba(255, 71, 87, 0.4);
        }

        .voice-widget-button:hover {
          transform: scale(1.1);
        }

        .voice-widget-button.connected {
          background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%);
        }

        .voice-widget-button.listening {
          background: linear-gradient(135deg, #ffa726 0%, #ffb74d 100%);
          animation: pulse 1.5s ease-in-out infinite;
        }

        .voice-widget-button.speaking {
          background: linear-gradient(135deg, #2196f3 0%, #42a5f5 100%);
        }

        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }

        .error-message {
          background: rgba(255, 71, 87, 0.9);
          color: white;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .error-message button {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          font-size: 16px;
        }

        .conversation-history {
          background: rgba(0, 0, 0, 0.9);
          color: white;
          padding: 16px;
          border-radius: 12px;
          max-width: 300px;
          max-height: 400px;
          overflow-y: auto;
        }

        .conversation-history h3 {
          margin: 0 0 12px 0;
          font-size: 14px;
        }

        .messages {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .message {
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 12px;
        }

        .message.user {
          background: rgba(255, 255, 255, 0.2);
          margin-left: 20%;
        }

        .message.assistant {
          background: rgba(102, 126, 234, 0.3);
          margin-right: 20%;
        }

        .message-time {
          font-size: 10px;
          opacity: 0.7;
          margin-top: 4px;
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
          animation: audioWave 1s ease-in-out infinite;
        }

        .audio-bar:nth-child(1) { animation-delay: 0s; }
        .audio-bar:nth-child(2) { animation-delay: 0.1s; }
        .audio-bar:nth-child(3) { animation-delay: 0.2s; }
        .audio-bar:nth-child(4) { animation-delay: 0.3s; }
        .audio-bar:nth-child(5) { animation-delay: 0.4s; }

        @keyframes audioWave {
          0%, 100% { height: 5px; }
          50% { height: 20px; }
        }
      `}</style>
    </div>
  )
}
