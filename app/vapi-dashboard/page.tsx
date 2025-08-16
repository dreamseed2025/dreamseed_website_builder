'use client'

import { useState, useEffect, useRef } from 'react'
import { createSupabaseClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

export default function VapiDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isCallActive, setIsCallActive] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [transcriptText, setTranscriptText] = useState('')
  const [currentSpeaker, setCurrentSpeaker] = useState<'user' | 'assistant'>('assistant')
  const callStartTime = useRef<number | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  
  const supabase = createSupabaseClient()
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.push('/login')
      }
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth, router])

  useEffect(() => {
    if (isCallActive && !intervalRef.current) {
      intervalRef.current = setInterval(() => {
        if (callStartTime.current) {
          setCallDuration(Math.floor((Date.now() - callStartTime.current) / 1000))
        }
      }, 1000)
    } else if (!isCallActive && intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isCallActive])

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleStartCall = () => {
    setIsCallActive(true)
    setCallDuration(0)
    callStartTime.current = Date.now()
    setTranscriptText('Assistant: Hello! I\'m here to help you with your business formation questions. How can I assist you today?')
    
    // Simulate some conversation
    setTimeout(() => {
      setTranscriptText(prev => prev + '\n\nUser: Hi, I want to start a consulting business.')
      setCurrentSpeaker('user')
    }, 3000)
    
    setTimeout(() => {
      setTranscriptText(prev => prev + '\n\nAssistant: That\'s wonderful! Consulting is a great business model. Can you tell me more about your area of expertise?')
      setCurrentSpeaker('assistant')
    }, 6000)
  }

  const handleEndCall = () => {
    setIsCallActive(false)
    setCallDuration(0)
    setIsMuted(false)
    callStartTime.current = null
    setTranscriptText('')
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading VAPI Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">VAPI Dashboard</h1>
              <p className="text-sm text-gray-600">AI Voice Assistant Interface</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isCallActive ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                <span className="text-sm text-gray-600">
                  {isCallActive ? 'Call Active' : 'Ready'}
                </span>
              </div>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </header>

        {/* Call Interface */}
        <div className="flex-1 flex">
          {/* Left Side - Transcript */}
          <div className="flex-1 flex flex-col bg-white">
            {/* Call Status Bar */}
            <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-700">
                    Duration: {formatDuration(callDuration)}
                  </span>
                  {isCallActive && (
                    <span className="text-sm text-gray-600">
                      Speaking: {currentSpeaker === 'user' ? 'You' : 'Assistant'}
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  {user?.email?.split('@')[0] || 'User'}
                </div>
              </div>
            </div>

            {/* Transcript Area */}
            <div className="flex-1 p-6 overflow-y-auto">
              {!isCallActive && !transcriptText ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                    </div>
                    <p className="text-lg font-medium mb-2">Ready to Start</p>
                    <p className="text-sm">Click the call button to begin your AI conversation</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-2">Live Transcript</div>
                    <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                      {transcriptText}
                    </div>
                    {isCallActive && (
                      <div className="mt-4 flex items-center text-sm text-blue-600">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mr-2 animate-pulse"></div>
                        Listening...
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Controls */}
          <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
            {/* Call Controls */}
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Call Controls</h3>
              
              <div className="space-y-4">
                {!isCallActive ? (
                  <button
                    onClick={handleStartCall}
                    className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Start Call
                  </button>
                ) : (
                  <div className="space-y-3">
                    <button
                      onClick={toggleMute}
                      className={`w-full flex items-center justify-center px-4 py-3 rounded-lg transition-colors ${
                        isMuted 
                          ? 'bg-red-600 text-white hover:bg-red-700' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {isMuted ? (
                        <>
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                          </svg>
                          Unmute
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                          </svg>
                          Mute
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={handleEndCall}
                      className="w-full flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      End Call
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Call Settings */}
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assistant Voice
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Professional (Female)</option>
                    <option>Business (Male)</option>
                    <option>Friendly (Female)</option>
                    <option>Casual (Male)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Speaking Speed
                  </label>
                  <input 
                    type="range" 
                    min="0.5" 
                    max="2" 
                    step="0.1" 
                    defaultValue="1"
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Slow</span>
                    <span>Normal</span>
                    <span>Fast</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Call Info */}
            <div className="flex-1 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Call Information</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-medium ${isCallActive ? 'text-green-600' : 'text-gray-500'}`}>
                    {isCallActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium text-gray-900">
                    {formatDuration(callDuration)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Audio:</span>
                  <span className={`font-medium ${isMuted ? 'text-red-600' : 'text-green-600'}`}>
                    {isMuted ? 'Muted' : 'Active'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Quality:</span>
                  <span className="font-medium text-green-600">HD</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}