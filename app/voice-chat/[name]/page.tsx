'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useParams } from 'next/navigation'

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
  const params = useParams()
  const name = params.name as string
  
  const [user, setUser] = useState<User | null>(null)
  const [dreamDNA, setDreamDNA] = useState<DreamDNA | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [widgetReady, setWidgetReady] = useState(false)
  const [callHistory, setCallHistory] = useState<any[]>([])

  useEffect(() => {
    initializeUser()
  }, [name])

  const initializeUser = async () => {
    try {
      setLoading(true)
      
      // Create email from name parameter
      const email = `${name}@lynkremote.com`
      console.log('🔍 Looking for user with email:', email)
      
      // Try to find user by email
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('customer_email', email)
        .single()

      if (userProfile && !profileError) {
        console.log('✅ Found existing user:', userProfile.customer_name)
        setUser(userProfile)
        await loadUserData(userProfile.id)
      } else {
        console.log('👤 Creating new user for:', name)
        await createNewUser(name, email)
      }
      
    } catch (err) {
      console.error('User initialization error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const createNewUser = async (name: string, email: string) => {
    try {
      // Create a proper UUID for new user
      const userId = crypto.randomUUID()
      
      // Parse name into first and last name
      const nameParts = name.split('-')
      const firstName = nameParts[0] || name
      const lastName = nameParts[1] || ''
      const fullName = lastName ? `${firstName} ${lastName}` : firstName
      
      const newUser = {
        id: userId,
        customer_name: fullName,
        customer_phone: '',
        customer_email: email,
        business_name: `${fullName}'s Business`,
        current_call_stage: 1,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      // Try to save to database
      const { error: insertError } = await supabase
        .from('users')
        .insert(newUser)

      if (insertError) {
        console.warn('Could not save to database, using in-memory user:', insertError.message)
      }
      
      setUser(newUser)
      await loadUserData(newUser.id)
      
    } catch (err) {
      setError('Failed to create user: ' + err.message)
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
      // Personalize the VAPI assistant with user context
      console.log('🎯 Personalizing assistant for:', user.customer_name)
      
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
      
      // Initialize VAPI widget
      if (typeof window !== 'undefined' && window.VapiWidget) {
        const widget = window.VapiWidget.init({
          assistantId: 'af397e88-c286-416f-9f74-e7665401bdb7',
          publicKey: '360c27df-9f83-4b80-bd33-e17dbcbf4971',
          voice: 'elliot',
          onConversationStart: (conversation: any) => {
            console.log('🎤 Conversation started for:', user?.customer_name)
            console.log('📊 User context:', {
              userId: user?.id,
              businessName: user?.business_name,
              callStage: user?.current_call_stage,
              dreamDNA: dreamDNA ? 'Loaded' : 'Not found'
            })
          },
          onConversationEnd: (conversation: any) => {
            console.log('✅ Conversation ended, transcript will be processed')
            if (user) {
              loadUserData(user.id)
            }
          }
        })
        
        setWidgetReady(true)
      } else {
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
      const timer = setTimeout(() => {
        initializeWidget().catch(err => {
          console.error('Widget initialization failed:', err)
          setError('Failed to initialize voice assistant: ' + err.message)
        })
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [user, widgetReady])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading voice chat for {name}...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">🎤 Voice Chat for {user?.customer_name}</h1>
          <p className="text-gray-600 mt-2">
            Welcome to your personalized AI business formation assistant
          </p>
          <p className="text-sm text-gray-500 mt-1">
            URL: <code className="bg-gray-200 px-2 py-1 rounded">/voice-chat/{name}</code>
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
                  </div>
                  
                  {/* VAPI Widget */}
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
                    disabled
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50 text-gray-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email is set from URL: {name}@lynkremote.com</p>
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

