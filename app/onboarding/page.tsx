'use client'

import { useState, useEffect } from 'react'
import { createSupabaseClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Script from 'next/script'

// Declare VAPI widget component for TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'vapi-widget': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        'assistant-id': string
        'public-key': string
        voice: string
        mode: string
        theme: string
        'base-bg-color': string
        'accent-color': string
        'cta-button-color': string
        'cta-button-text-color': string
        'border-radius': string
        size: string
        position: string
        title: string
        'start-button-text': string
        'end-button-text': string
        'chat-first-message': string
        'chat-placeholder': string
        'voice-show-transcript': string
        'consent-required': string
        'consent-title': string
        'consent-content': string
        'consent-storage-key': string
      }
    }
  }
}

interface User {
  id: string
  customer_name: string
  customer_email: string
  business_name?: string
  status?: string
}

export default function Onboarding() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState(1)
  const [hasDreamDNA, setHasDreamDNA] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const supabase = createSupabaseClient()
  const router = useRouter()

  useEffect(() => {
    setIsClient(true)
    console.log('🔄 Onboarding page mounted, starting user data load...')
    
    // Set a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('⚠️ Loading timeout, redirecting to login...')
        setLoading(false)
        window.location.href = '/login'
      }
    }, 10000) // 10 second timeout

    loadUserData()

    return () => clearTimeout(timeout)
  }, [])

  const loadUserData = async () => {
    try {
      setLoading(true)
      console.log('🔄 Starting user data load...')

      // Add a small delay to ensure auth state is ready
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Get current user session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('❌ Session error:', sessionError)
        setLoading(false)
        window.location.href = '/login'
        return
      }

      if (!session?.user) {
        console.log('❌ No client-side session, but trying API call anyway...')
        // Don't redirect immediately, try the API call first
      }

      console.log('✅ User authenticated:', session?.user?.email || 'unknown user')

      // Call the user profile API to get user data
      const response = await fetch('/api/user-profile')
      const result = await response.json()

      if (result.success && result.profile) {
        console.log('✅ Profile data loaded successfully:', result.profile)
        const userData: User = {
          id: result.profile.id,
          customer_name: result.profile.customer_name || session.user.user_metadata?.full_name || 'User',
          customer_email: result.profile.customer_email || session.user.email || '',
          business_name: result.profile.business_name || '',
          status: result.profile.status || 'active'
        }
        
        setUser(userData)

        // Check if user already has Dream DNA
        if (result.profile.dream_dna_truth) {
          console.log('✅ User has Dream DNA, showing completion state')
          setHasDreamDNA(true)
          setCurrentStep(4) // Skip to completion
        } else {
          console.log('✅ User does not have Dream DNA, showing onboarding flow')
        }
      } else {
        console.log('❌ Failed to load profile data:', result.message)
        if (result.message?.includes('Authentication required')) {
          console.log('API requires authentication, redirecting to login...')
          setLoading(false)
          window.location.href = '/login'
          return
        }
        // Even if profile load fails, we can still show onboarding for new users
        const userData: User = {
          id: session?.user?.id || 'unknown',
          customer_name: session?.user?.user_metadata?.full_name || 'User',
          customer_email: session?.user?.email || '',
          business_name: '',
          status: 'active'
        }
        setUser(userData)
      }
    } catch (err) {
      console.error('❌ User data loading error:', err)
      setLoading(false)
    } finally {
      setLoading(false)
    }
  }

  const handleGetStarted = () => {
    router.push('/dream-dna-setup')
  }

  const handleSkipForNow = () => {
    router.push('/simple-portal')
  }

  const handleCompleteSetup = () => {
    router.push('/user-profile')
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #000000 0%, #1a0000 50%, #000000 100%)',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '3px solid rgba(255, 255, 255, 0.3)',
            borderTop: '3px solid #56b978',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ fontSize: '18px', fontFamily: 'Poppins, sans-serif' }}>Loading your onboarding...</p>
        </div>
      </div>
    )
  }

  if (hasDreamDNA) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #000000 0%, #1a0000 50%, #000000 100%)',
        color: 'white',
        paddingTop: '0'
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '2rem',
          minHeight: 'calc(100vh - 80px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center'
        }}>
          <div style={{
            background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
            borderRadius: '20px',
            padding: '3rem',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            marginBottom: '2rem'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '1rem' }}>🎉</div>
            <h1 style={{
              fontSize: '36px',
              marginBottom: '1rem',
              background: 'linear-gradient(135deg, #56b978 0%, #4ade80 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 'bold'
            }}>
              Welcome to DreamSeed!
            </h1>
            <p style={{ fontSize: '20px', marginBottom: '2rem', color: '#cccccc' }}>
              Great news! You've already completed your Dream DNA setup.
            </p>
            <p style={{ fontSize: '16px', color: '#999999', marginBottom: '2rem' }}>
              You're all set to start building your dream business with AI-powered guidance.
            </p>
            <button
              onClick={handleCompleteSetup}
              style={{
                background: 'linear-gradient(135deg, #56b978 0%, #4ade80 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '16px 32px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(86, 185, 120, 0.3)'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              Go to Your Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* VAPI Script */}
      <Script
        src="https://unpkg.com/@vapi-ai/web-sdk@1.0.0/dist/index.js"
        strategy="beforeInteractive"
        onLoad={() => console.log('✅ VAPI script loaded')}
        onError={(e) => console.error('❌ VAPI script error:', e)}
      />
      
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #000000 0%, #1a0000 50%, #000000 100%)',
        color: 'white',
        paddingTop: '0'
      }}>
      <div style={{
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '2rem',
        minHeight: 'calc(100vh - 80px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>
        {/* Welcome Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '3rem'
        }}>
          <h1 style={{
            fontSize: '48px',
            marginBottom: '1rem',
            background: 'linear-gradient(135deg, #56b978 0%, #4ade80 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 'bold'
          }}>
            Welcome to DreamSeed, {user?.customer_name}! 🌱
          </h1>
          <p style={{
            fontSize: '20px',
            color: '#cccccc',
            marginBottom: '8px'
          }}>
            Let's turn your business idea into reality
          </p>
          <p style={{
            fontSize: '16px',
            color: '#999999'
          }}>
            Complete your Dream DNA to unlock personalized AI guidance
          </p>
        </div>

        {/* Progress Steps */}
        <div style={{
          background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
          borderRadius: '20px',
          padding: '2rem',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          marginBottom: '2rem'
        }}>
          <h2 style={{ margin: '0 0 20px 0', color: '#56b978', fontSize: '28px' }}>🚀 Your Journey Starts Here</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div style={{
              padding: '20px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              border: '2px solid #56b978',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>1️⃣</div>
              <h3 style={{ margin: '0 0 8px 0', color: '#56b978' }}>Dream DNA Setup</h3>
              <p style={{ fontSize: '14px', color: '#cccccc', margin: 0 }}>
                Tell us about your business vision and goals
              </p>
            </div>

            <div style={{
              padding: '20px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>2️⃣</div>
              <h3 style={{ margin: '0 0 8px 0', color: '#999999' }}>AI Analysis</h3>
              <p style={{ fontSize: '14px', color: '#666666', margin: 0 }}>
                Our AI analyzes your business potential
              </p>
            </div>

            <div style={{
              padding: '20px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>3️⃣</div>
              <h3 style={{ margin: '0 0 8px 0', color: '#999999' }}>Personalized Guidance</h3>
              <p style={{ fontSize: '14px', color: '#666666', margin: 0 }}>
                Get tailored business formation advice
              </p>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div style={{
          background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
          borderRadius: '20px',
          padding: '2rem',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          marginBottom: '2rem'
        }}>
          <h2 style={{ margin: '0 0 20px 0', color: '#56b978', fontSize: '28px' }}>✨ What You'll Get</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: '24px' }}>🎯</div>
              <div>
                <h4 style={{ margin: '0 0 4px 0', color: '#cccccc' }}>Personalized Strategy</h4>
                <p style={{ margin: 0, fontSize: '14px', color: '#999999' }}>AI-powered business recommendations</p>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: '24px' }}>🤖</div>
              <div>
                <h4 style={{ margin: '0 0 4px 0', color: '#cccccc' }}>Voice Assistant</h4>
                <p style={{ margin: 0, fontSize: '14px', color: '#999999' }}>Chat with Elliot, your AI business coach</p>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: '24px' }}>📊</div>
              <div>
                <h4 style={{ margin: '0 0 4px 0', color: '#cccccc' }}>Progress Tracking</h4>
                <p style={{ margin: 0, fontSize: '14px', color: '#999999' }}>Monitor your business formation journey</p>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: '24px' }}>🚀</div>
              <div>
                <h4 style={{ margin: '0 0 4px 0', color: '#cccccc' }}>Fast Setup</h4>
                <p style={{ margin: 0, fontSize: '14px', color: '#999999' }}>Complete in just 5-10 minutes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '16px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={handleGetStarted}
            style={{
              background: 'linear-gradient(135deg, #56b978 0%, #4ade80 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '16px 32px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(86, 185, 120, 0.3)',
              minWidth: '200px'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            🚀 Start Dream DNA Setup
          </button>
          
          <button
            onClick={handleSkipForNow}
            style={{
              background: 'transparent',
              color: '#cccccc',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              padding: '16px 32px',
              fontSize: '18px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              minWidth: '200px'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.borderColor = '#56b978'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
            }}
          >
            Skip for Now
          </button>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: '2rem',
          padding: '1rem',
          fontSize: '14px',
          color: '#666666'
        }}>
          <p style={{ margin: '0 0 8px 0' }}>
            Powered by <strong style={{ color: '#56b978' }}>VAPI</strong> • Built for <strong style={{ color: '#56b978' }}>DreamSeed</strong>
          </p>
          <p style={{ margin: 0 }}>
            Your personalized business formation journey starts here
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* VAPI Widget - Fixed at Bottom */}
      {isClient && (
        <vapi-widget
          assistant-id="af397e88-c286-416f-9f74-e7665401bdb7"
          public-key="360c27df-9f83-4b80-bd33-e17dbcbf4971"
          voice="elliot"
          mode="voice"
          theme="dark"
          base-bg-color="#000000"
          accent-color="#76001b"
          cta-button-color="#000000"
          cta-button-text-color="#ffffff"
          border-radius="large"
          size="full"
          position="bottom-right"
          title="Your Business Coach"
          start-button-text="Start"
          end-button-text="End Call"
          chat-first-message={`Hey ${user?.customer_name || 'there'}! I'm Elliot, your personalized business formation coach. Welcome to DreamSeed! 

I can see you're just getting started. Do you have a dream business in mind that you'd like to build? I'd love to hear about your vision and help you bring it to life!

What kind of business are you thinking about creating?`}
          chat-placeholder="Type your message..."
          voice-show-transcript="true"
          consent-required="true"
          consent-title="Terms and conditions"
          consent-content="By clicking 'Agree,' and each time I interact with this AI agent, I consent to the recording, storage, and sharing of my communications with third-party service providers, and as otherwise described in our Terms of Service."
          consent-storage-key="vapi_widget_consent"
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 10000
          }}
        ></vapi-widget>
      )}
      </div>
    </>
  )
}