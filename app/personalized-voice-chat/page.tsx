'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface User {
  id: string
  customer_name: string
  customer_phone: string
  customer_email: string
  business_name: string
  current_call_stage: number
  status: string
}

interface DreamDNA {
  business_id: string
  core_purpose: string
  target_audience: string
  unique_value_proposition: string
  business_model: string
  competitive_advantage: string
  growth_strategy: string
  risk_factors: string
  success_metrics: string
  vision_statement: string
  mission_statement: string
  values: string
  brand_identity: string
  market_positioning: string
  operational_plan: string
}

export default function PersonalizedVoiceChat() {
  const [user, setUser] = useState<User | null>(null)
  const [dreamDNA, setDreamDNA] = useState<DreamDNA | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [widgetReady, setWidgetReady] = useState(false)
  const [callHistory, setCallHistory] = useState<any[]>([])
  const [initializationTimeout, setInitializationTimeout] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    initializeUser()
  }, [])

  const initializeUser = async () => {
    try {
      setLoading(true)
      
      // Get current authenticated user
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !authUser) {
        // If no authenticated user, create a demo user or redirect to login
        console.log('No authenticated user, using demo mode')
        await createDemoUser()
        return
      }

      // Get user profile from database
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (profileError) {
        console.log('Profile not found, creating new profile')
        await createUserProfile(authUser.id, authUser.email || '')
        return
      }

      setUser(userProfile)
      await loadUserData(userProfile.id)
      
    } catch (err) {
      console.error('User initialization error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const createDemoUser = async () => {
    try {
      // Create a proper UUID for demo user
      const demoUserId = crypto.randomUUID()
      const demoUser = {
        id: demoUserId,
        customer_name: 'Demo User',
        customer_phone: '+15551234567',
        customer_email: 'demo@dreamseed.com',
        business_name: 'Demo Business',
        current_call_stage: 1,
        status: 'active'
      }
      
      setUser(demoUser)
      await loadUserData(demoUser.id)
      
    } catch (err) {
      setError('Failed to create demo user: ' + err.message)
    }
  }

  const createUserProfile = async (userId: string, email: string) => {
    try {
      const newProfile = {
        id: userId,
        customer_name: 'New User',
        customer_phone: '',
        customer_email: email,
        business_name: '',
        current_call_stage: 1,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('users')
        .insert(newProfile)

      if (error) {
        console.error('Profile creation error:', error)
        // Continue with in-memory profile
        setUser(newProfile)
        await loadUserData(userId)
      } else {
        setUser(newProfile)
        await loadUserData(userId)
      }
      
    } catch (err) {
      setError('Failed to create user profile: ' + err.message)
    }
  }

  const loadUserData = async (userId: string) => {
    try {
      // Load Dream DNA
      const { data: dreamDNAData, error: dreamError } = await supabase
        .from('dream_dna')
        .select('*')
        .eq('business_id', userId)
        .single()

      if (!dreamError && dreamDNAData) {
        setDreamDNA(dreamDNAData)
      }

      // Load recent call history
      const { data: calls, error: callsError } = await supabase
        .from('call_transcripts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5)

      if (!callsError && calls) {
        setCallHistory(calls)
      }

    } catch (err) {
      console.error('Data loading error:', err)
    }
  }

  const updateUserProfile = async (updates: Partial<User>) => {
    if (!user) return

    try {
      const updatedUser = { ...user, ...updates, updated_at: new Date().toISOString() }
      
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)

      if (!error) {
        setUser(updatedUser)
      }
      
    } catch (err) {
      console.error('Profile update error:', err)
    }
  }

  const initializeWidget = async () => {
    if (!user) return
    
    try {
      // First, personalize the VAPI assistant with user context
      console.log('🎯 Personalizing assistant for user:', user.customer_name)
      
      const personalizeResponse = await fetch('/api/vapi-personalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          phone: user.customer_phone,
          email: user.customer_email
        })
      })
      
      const personalizeResult = await personalizeResponse.json()
      
      if (personalizeResult.success) {
        console.log('✅ Assistant personalized:', personalizeResult)
      } else {
        console.warn('⚠️ Personalization failed:', personalizeResult)
        console.log('Continuing with default assistant configuration...')
      }
      
      // Then initialize VAPI widget
      if (typeof window !== 'undefined' && window.VapiWidget) {
        const widget = window.VapiWidget.init({
          assistantId: 'af397e88-c286-416f-9f74-e7665401bdb7', // Your assistant ID
          publicKey: '360c27df-9f83-4b80-bd33-e17dbcbf4971', // Your public key
          voice: 'elliot',
          onConversationStart: (conversation: any) => {
            console.log('🎤 Conversation started for user:', user?.customer_name)
            console.log('📊 User context:', {
              userId: user?.id,
              businessName: user?.business_name,
              callStage: user?.current_call_stage,
              dreamDNA: dreamDNA ? 'Loaded' : 'Not found'
            })
          },
          onConversationEnd: (conversation: any) => {
            console.log('✅ Conversation ended, transcript will be processed')
            // Refresh call history
            if (user) {
              loadUserData(user.id)
            }
          }
        })
        
        setWidgetReady(true)
      } else {
        // Fallback if VapiWidget is not available
        console.warn('VapiWidget not available, setting widget as ready anyway')
        setWidgetReady(true)
      }
    } catch (error) {
      console.error('❌ Widget initialization error:', error)
      setError('Failed to initialize voice assistant: ' + error.message)
    }
  }

  useEffect(() => {
    if (user && !widgetReady) {
      // Set a timeout to prevent infinite loading
      const timeout = setTimeout(() => {
        console.warn('Widget initialization timeout - forcing ready state')
        setWidgetReady(true)
        setError('Widget initialization timed out, but you can still try the voice chat')
      }, 10000) // 10 second timeout
      
      setInitializationTimeout(timeout)
      
      // Initialize widget after user is loaded
      const timer = setTimeout(() => {
        initializeWidget().catch(err => {
          console.error('Widget initialization failed:', err)
          setError('Failed to initialize voice assistant: ' + err.message)
        }).finally(() => {
          // Clear timeout if initialization completes
          if (initializationTimeout) {
            clearTimeout(initializationTimeout)
            setInitializationTimeout(null)
          }
        })
      }, 1000)
      
      return () => {
        clearTimeout(timer)
        if (initializationTimeout) {
          clearTimeout(initializationTimeout)
        }
      }
    }
  }, [user, widgetReady, initializationTimeout])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your personalized voice chat...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Setup Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🎤 Personalized Voice Assistant</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {user?.customer_name || 'User'}! Your AI assistant is ready with your business context.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Voice Widget */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">💬 Start Your Conversation</h2>
              
              {widgetReady ? (
                <div className="text-center">
                  <div className="mb-4">
                    <div className="text-4xl mb-2">🎯</div>
                    <p className="text-gray-600">Your personalized VAPI widget is ready!</p>
                                      <p className="text-sm text-gray-500 mt-1">
                    Assistant knows your business: <strong>{user?.business_name || 'Not set'}</strong>
                  </p>
                  
                  {!user?.business_name && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800 mb-2">
                        <strong>Complete your business setup</strong> for better personalized assistance
                      </p>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => window.location.href = '/business-setup'}
                          className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
                        >
                          Set Up Business
                        </button>
                        <button
                          onClick={() => window.location.href = '/dream-dna-setup'}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                        >
                          Set Up Dream DNA
                        </button>
                      </div>
                    </div>
                  )}
                  </div>
                  
                  {/* VAPI Widget will be injected here */}
                  <div id="vapi-widget-container" className="mt-6">
                    <vapi-widget 
                      assistant-id="af397e88-c286-416f-9f74-e7665401bdb7"
                      public-key="360c27df-9f83-4b80-bd33-e17dbcbf4971"
                      voice="elliot"
                    ></vapi-widget>
                  </div>
                  
                  {/* Fallback if widget doesn't load */}
                  <div className="mt-4 text-sm text-gray-500">
                    <p>If the voice widget doesn't appear, try refreshing the page or check your browser console for errors.</p>
                    <button 
                      onClick={() => {
                        console.log('Current user:', user)
                        console.log('Dream DNA:', dreamDNA)
                        console.log('Call history:', callHistory)
                        console.log('Widget ready:', widgetReady)
                      }}
                      className="mt-2 text-xs bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
                    >
                      Debug Info (check console)
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Initializing your personalized assistant...</p>
                </div>
              )}
            </div>
          </div>

          {/* User Profile & Context */}
          <div className="space-y-6">
            {/* User Profile */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">👤 Your Profile</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={user?.customer_name || ''}
                    onChange={(e) => updateUserProfile({ customer_name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Business Name</label>
                  <input
                    type="text"
                    value={user?.business_name || ''}
                    onChange={(e) => updateUserProfile({ business_name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    value={user?.customer_phone || ''}
                    onChange={(e) => updateUserProfile({ customer_phone: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={user?.customer_email || ''}
                    onChange={(e) => updateUserProfile({ customer_email: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Call Stage</label>
                  <select
                    value={user?.current_call_stage || 1}
                    onChange={(e) => updateUserProfile({ current_call_stage: parseInt(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value={1}>1 - Foundation</option>
                    <option value={2}>2 - Brand Identity</option>
                    <option value={3}>3 - Operations</option>
                    <option value={4}>4 - Launch Strategy</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Dream DNA Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">🧬 Dream DNA</h3>
              
              {dreamDNA ? (
                <div className="space-y-2">
                  <div className="flex items-center text-green-600">
                    <span className="text-xl mr-2">✅</span>
                    <span className="font-medium">Loaded</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Your business vision is integrated into the assistant
                  </p>
                  <div className="text-xs text-gray-500 mt-2">
                    <p><strong>Core Purpose:</strong> {dreamDNA.core_purpose?.substring(0, 50)}...</p>
                    <p><strong>Target:</strong> {dreamDNA.target_audience?.substring(0, 50)}...</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="text-2xl mb-2">🧬</div>
                  <p className="text-sm text-gray-600 mb-3">No Dream DNA found</p>
                  <button 
                    onClick={() => window.location.href = '/dream-dna-setup'}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                  >
                    Set Up Dream DNA
                  </button>
                </div>
              )}
            </div>

            {/* Recent Calls */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">📞 Recent Calls</h3>
              
              {callHistory.length > 0 ? (
                <div className="space-y-3">
                  {callHistory.map((call) => (
                    <div key={call.id} className="border-l-4 border-blue-500 pl-3">
                      <p className="text-sm font-medium text-gray-900">
                        Call {call.call_id.substring(0, 8)}...
                      </p>
                      <p className="text-xs text-gray-600">
                        Stage {call.call_stage} • {new Date(call.created_at).toLocaleDateString()}
                      </p>
                      {call.semantic_summary && (
                        <p className="text-xs text-gray-500 mt-1">
                          {call.semantic_summary.substring(0, 60)}...
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <div className="text-2xl mb-2">📭</div>
                  <p className="text-sm">No calls yet</p>
                  <p className="text-xs">Start your first conversation above!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* VAPI Widget Script */}
      <script 
        src="https://unpkg.com/@vapi-ai/client-sdk-react/dist/embed/widget.umd.js" 
        async 
        type="text/javascript"
        onLoad={() => {
          console.log('✅ VAPI widget script loaded')
          if (typeof window !== 'undefined') {
            window.VapiWidgetLoaded = true
          }
        }}
        onError={() => {
          console.error('❌ Failed to load VAPI widget script')
          setError('Failed to load VAPI widget script. Please check your internet connection.')
        }}
      ></script>
    </div>
  )
}
