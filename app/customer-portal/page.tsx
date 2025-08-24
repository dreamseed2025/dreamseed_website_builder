'use client'

import { useEffect, useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { checkUserRole } from '@/lib/auth-roles'
import type { User } from '@supabase/supabase-js'

interface AssessmentData {
  businessIdea?: string
  businessType?: string
  fullName?: string
  email?: string
  phone?: string
  timeline?: string
  experience?: string
  mainGoal?: string
}

export default function CustomerPortal() {
  const [user, setUser] = useState<User | null>(null)
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showVoiceWidget, setShowVoiceWidget] = useState(false)
  const [widgetReady, setWidgetReady] = useState(false)
  const [loadingError, setLoadingError] = useState<string | null>(null)
  const supabase = createSupabaseClient()
  const router = useRouter()

  useEffect(() => {
    const initializeCustomerPortal = async () => {
      try {
        const roleCheck = await checkUserRole()
        
        if (!roleCheck.isAuthenticated) {
          router.push('/login')
          return
        }

        if (roleCheck.isAdmin) {
          router.push('/admin-dashboard')
          return
        }

        setUser(roleCheck.user)
        
        // Load assessment data from localStorage or database
        const storedAssessment = localStorage.getItem('assessmentData')
        if (storedAssessment) {
          try {
            const parsedData = JSON.parse(storedAssessment)
            setAssessmentData(parsedData)
          } catch (error) {
            console.error('Error parsing assessment data:', error)
          }
        }
        
        // Also try to load from database if available (optional)
        if (roleCheck.user?.email) {
          try {
            // Check if business_assessments table exists first
            const { data: dbAssessment, error: assessmentError } = await supabase
              .from('business_assessments')
              .select('*')
              .eq('email', roleCheck.user.email)
              .order('created_at', { ascending: false })
              .limit(1)
              .single()
              
            if (dbAssessment && !assessmentError) {
              const formattedData: AssessmentData = {
                businessIdea: dbAssessment.business_idea,
                businessType: dbAssessment.business_type,
                fullName: dbAssessment.full_name,
                email: dbAssessment.email,
                phone: dbAssessment.phone,
                timeline: dbAssessment.timeline,
                experience: dbAssessment.experience,
                mainGoal: dbAssessment.main_goal
              }
              setAssessmentData(formattedData)
            } else {
              console.log('No assessment data found or table does not exist')
            }
          } catch (error) {
            console.error('Error loading assessment from database:', error)
            // Don't fail the whole page for assessment loading errors
          }
        }
        
        setLoading(false)
      } catch (error) {
        console.error('Customer portal initialization error:', error)
        // Even if there's an error, try to show the basic portal
        setLoadingError('Some data could not be loaded, but you can still use the portal.')
        setLoading(false)
      }
    }

    // Set a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('Customer portal loading timeout')
        setLoadingError('Loading timeout. Please refresh the page.')
        setLoading(false)
      }
    }, 10000) // 10 second timeout

    initializeCustomerPortal()

    return () => clearTimeout(timeout)
  }, [supabase, router, loading])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const initializePersonalizedWidget = async () => {
    if (!user || !assessmentData) return
    
    try {
      // Personalize the VAPI assistant with user context
      const personalizeResponse = await fetch('/api/vapi-personalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          phone: assessmentData.phone,
          email: user.email,
          assessmentData: assessmentData
        })
      })
      
      const personalizeResult = await personalizeResponse.json()
      
      if (personalizeResult.success) {
        console.log('✅ Assistant personalized for customer portal')
        setWidgetReady(true)
      } else {
        console.warn('⚠️ Personalization failed:', personalizeResult)
        setWidgetReady(true) // Still show widget
      }
    } catch (error) {
      console.error('❌ Widget personalization error:', error)
      setWidgetReady(true) // Show widget anyway
    }
  }

  useEffect(() => {
    if (showVoiceWidget && user && assessmentData) {
      initializePersonalizedWidget()
    }
  }, [showVoiceWidget, user, assessmentData])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading your business portal...</p>
          {loadingError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{loadingError}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-2 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
              >
                Refresh Page
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">🌱 DreamSeed Portal</h1>
              <p className="text-gray-600">Welcome back, {assessmentData?.fullName || user?.email?.split('@')[0]}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">🚀 Your Business Formation Journey</h2>
          
          {assessmentData ? (
            <div>
              {/* Personalized Content */}
              <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Business Vision</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Business Idea:</strong> 
                    <p className="text-gray-700 mt-1">{assessmentData.businessIdea}</p>
                  </div>
                  <div>
                    <strong>Business Type:</strong> 
                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      {assessmentData.businessType}
                    </span>
                  </div>
                  <div>
                    <strong>Timeline:</strong> 
                    <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                      {assessmentData.timeline === 'asap' ? 'ASAP' : 
                       assessmentData.timeline === '1month' ? 'Within 1 month' :
                       assessmentData.timeline === '3months' ? 'Within 3 months' :
                       assessmentData.timeline === '6months' ? 'Within 6 months' : 
                       'Exploring'}
                    </span>
                  </div>
                  <div>
                    <strong>Experience Level:</strong> 
                    <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                      {assessmentData.experience?.replace('-', ' ')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-yellow-800 mb-2">🎯 Your Next Steps</h4>
                <p className="text-yellow-700 mb-3">
                  Based on your assessment, we've created a personalized 4-call business formation plan:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="bg-white p-3 rounded border">
                    <div className="font-medium text-sm">Call 1: Discovery</div>
                    <div className="text-xs text-gray-600">Understanding your vision</div>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <div className="font-medium text-sm">Call 2: Structure</div>
                    <div className="text-xs text-gray-600">Choosing entity type</div>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <div className="font-medium text-sm">Call 3: Formation</div>
                    <div className="text-xs text-gray-600">Legal documentation</div>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <div className="font-medium text-sm">Call 4: Launch</div>
                    <div className="text-xs text-gray-600">Business activation</div>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <p className="text-blue-800 font-medium mb-2">
                  📞 Ready to start? Call us at: <a href="tel:+1-555-DREAM-BIZ" className="underline">+1 (555) DREAM-BIZ</a>
                </p>
                <p className="text-blue-600 text-sm">
                  We'll use your phone number: {assessmentData.phone} to reach you for your personalized consultation.
                </p>
              </div>
            </div>
          ) : (
            // Generic content for users without assessment
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🌱</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Complete Your Business Assessment</h3>
              <p className="text-gray-600 mb-6">
                Take our quick 4-step assessment to get a personalized business formation plan.
              </p>
              <a 
                href="/business-assessment"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Start Assessment →
              </a>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">🛠️ Quick Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <a 
              href="/domain-checker"
              className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition"
            >
              <div className="text-2xl mb-2">🌐</div>
              <h3 className="font-semibold">Domain Checker</h3>
              <p className="text-sm text-gray-600">Find the perfect domain for your business</p>
            </a>
            <div 
              className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition cursor-pointer"
              onClick={() => setShowVoiceWidget(!showVoiceWidget)}
            >
              <div className="text-2xl mb-2">🤖</div>
              <h3 className="font-semibold">AI Business Coach</h3>
              <p className="text-sm text-gray-600">Talk with your AI business formation coach</p>
              {showVoiceWidget && (
                <div className="mt-2 text-xs text-blue-600">
                  Click to {showVoiceWidget ? 'hide' : 'show'} voice widget
                </div>
              )}
            </div>

            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="text-2xl mb-2">📞</div>
              <h3 className="font-semibold">Schedule Call</h3>
              <p className="text-sm text-gray-600">Call +1 (555) DREAM-BIZ to continue your journey</p>
            </div>
          </div>
        </div>

        {/* Embedded Personalized Voice Widget */}
        {showVoiceWidget && (
          <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">🎤 Your Personalized AI Business Coach</h2>
              <button
                onClick={() => setShowVoiceWidget(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕ Close
              </button>
            </div>
            
            {widgetReady ? (
              <div className="text-center">
                <div className="mb-4">
                  <div className="text-4xl mb-2">🎯</div>
                  <p className="text-gray-600">Your personalized assistant is ready!</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Assistant knows: <strong>{assessmentData?.businessIdea || 'Your business'}</strong>
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
                
                <div className="mt-4 text-sm text-gray-500">
                  <p>💡 The AI assistant has been personalized with your business assessment data</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Personalizing your AI assistant...</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* VAPI Widget Script */}
      <script 
        src="https://unpkg.com/@vapi-ai/client-sdk-react/dist/embed/widget.umd.js" 
        async 
        type="text/javascript"
      ></script>
    </div>
  )
}