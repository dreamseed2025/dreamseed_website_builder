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
  const supabase = createSupabaseClient()
  const router = useRouter()

  useEffect(() => {
    const initializeCustomerPortal = async () => {
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
      
      // Also try to load from database if available
      if (roleCheck.user?.email) {
        try {
          const { data: dbAssessment } = await supabase
            .from('business_assessments')
            .select('*')
            .eq('email', roleCheck.user.email)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()
            
          if (dbAssessment) {
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
          }
        } catch (error) {
          console.error('Error loading assessment from database:', error)
        }
      }
      
      setLoading(false)
    }

    initializeCustomerPortal()
  }, [supabase, router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading your business portal...</p>
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
            <a 
              href="/optimized-voice-demo"
              className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition"
            >
              <div className="text-2xl mb-2">🤖</div>
              <h3 className="font-semibold">AI Business Coach</h3>
              <p className="text-sm text-gray-600">Talk with your AI business formation coach</p>
            </a>
            <a 
              href="/voice-domain-assistant"
              className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition"
            >
              <div className="text-2xl mb-2">🎤</div>
              <h3 className="font-semibold">Voice Assistant</h3>
              <p className="text-sm text-gray-600">Find domains using voice commands</p>
            </a>
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="text-2xl mb-2">📞</div>
              <h3 className="font-semibold">Schedule Call</h3>
              <p className="text-sm text-gray-600">Call +1 (555) DREAM-BIZ to continue your journey</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}