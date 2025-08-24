'use client'

import { useState, useEffect } from 'react'
import { createSupabaseClient } from '@/lib/supabase'
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

export default function SimplePortal() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [vapiScriptLoaded, setVapiScriptLoaded] = useState(false)
  const supabase = createSupabaseClient()

  useEffect(() => {
    setIsClient(true)
    loadUserData()
    console.log('🔄 Simple Portal: isClient set to true, VAPI widget should be visible')
    
    // Set a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('⚠️ Loading timeout, showing error...')
        setLoading(false)
        setError('Loading timeout - please refresh the page')
      }
    }, 10000) // 10 second timeout

    return () => clearTimeout(timeout)
  }, [])

  // Separate useEffect for VAPI script detection
  useEffect(() => {
    if (!isClient) return
    
    const checkVapiScript = () => {
      if (typeof window !== 'undefined' && (window as any).VapiWidget) {
        console.log('✅ VAPI script detected, setting vapiScriptLoaded to true')
        setVapiScriptLoaded(true)
        return true
      }
      return false
    }
    
    // Check immediately
    if (checkVapiScript()) return
    
    // Set up polling to check for script loading
    const interval = setInterval(() => {
      if (checkVapiScript()) {
        clearInterval(interval)
      }
    }, 500)
    
    // Cleanup after 10 seconds
    const timeout = setTimeout(() => {
      clearInterval(interval)
      console.log('⚠️ VAPI script not detected after 10 seconds')
    }, 10000)
    
    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [isClient])

  const loadUserData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get current user session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('Session error:', sessionError)
        setError('Failed to get user session')
        setLoading(false)
        return
      }

      if (!session?.user) {
        console.log('No client-side session, but trying API call anyway...')
        // Don't redirect immediately, try the API call first
      }

      console.log('Loading user data for:', session?.user?.email || 'unknown user')

      // Call the user profile API which will create profile if needed
      const response = await fetch('/api/user-profile')
      const result = await response.json()

      if (result.success && result.profile) {
        console.log('User data loaded from API:', result.profile)
        
        const userData: User = {
          id: result.profile.id,
          customer_name: result.profile.customer_name || session?.user?.user_metadata?.full_name || 'User',
          customer_email: result.profile.customer_email || session?.user?.email || '',
          business_name: result.profile.business_name || '',
          status: result.profile.status || 'active'
        }
        
        setUser(userData)
      } else {
        console.error('Failed to load user data from API:', result.message)
        if (result.message?.includes('Authentication required')) {
          console.log('API requires authentication, redirecting to login...')
          setLoading(false)
          window.location.href = '/login'
          return
        }
        setError('Failed to load user data')
      }

    } catch (err) {
      console.error('User data loading error:', err)
      setError('Failed to load user data')
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      window.location.href = '/login'
    } catch (error) {
      console.error('Sign out error:', error)
      window.location.href = '/login'
    }
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
          <p style={{ fontSize: '18px', fontFamily: 'Poppins, sans-serif' }}>Loading your portal...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes shimmer {
            0% { left: -100%; }
            100% { left: 100%; }
          }
        `}</style>
      </div>
    )
  }

  if (error) {
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
          <p style={{ fontSize: '18px', fontFamily: 'Poppins, sans-serif', marginBottom: '16px' }}>⚠️ {error}</p>
          <button 
            onClick={() => window.location.href = '/login'}
            style={{ 
              background: '#56b978', 
              color: 'white', 
              border: 'none', 
              padding: '12px 24px', 
              borderRadius: '8px', 
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* VAPI Script */}
      <Script 
        src="https://unpkg.com/@vapi-ai/client-sdk-react/dist/embed/widget.umd.js" 
        strategy="beforeInteractive"
        onLoad={() => {
          console.log('✅ VAPI script loaded successfully')
          setVapiScriptLoaded(true)
        }}
        onError={() => console.error('❌ VAPI script failed to load')}
      />
      
      <section style={{
        background: 'linear-gradient(135deg, #000000 0%, #1a0000 50%, #000000 100%)',
        minHeight: '100vh',
        padding: '0',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background pattern */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url("https://kxldodhrhqbwyvgyuqfd.supabase.co/storage/v1/object/public/webimages/dream_seed_1.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.1
        }} />

        {/* Header */}
        <header style={{
          background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 249, 250, 0.95) 100%)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(139, 0, 0, 0.2)',
          position: 'relative',
          zIndex: 10
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '1rem 2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h1 style={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: '28px',
                fontWeight: 'bold',
                color: '#141416',
                marginBottom: '4px'
              }}>
                🌱 DreamSeed Portal
              </h1>
              <p style={{
                color: '#666',
                fontSize: '16px',
                fontFamily: 'Inter, sans-serif'
              }}>
                Welcome back, {user?.customer_name || 'User'}
              </p>
              {user?.customer_email && (
                <p style={{
                  color: '#999',
                  fontSize: '14px',
                  fontFamily: 'Inter, sans-serif',
                  marginTop: '4px'
                }}>
                  {user.customer_email}
                </p>
              )}
            </div>
            <button
              onClick={handleSignOut}
              style={{
                background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '12px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(220, 53, 69, 0.3)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(220, 53, 69, 0.4)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(220, 53, 69, 0.3)'
              }}
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* Main Content */}
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '2rem',
          position: 'relative',
          zIndex: 5
        }}>
          {/* Hero Section */}
          <div style={{
            background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 249, 250, 0.95) 100%)',
            borderRadius: '24px',
            padding: '2rem',
            marginBottom: '2rem',
            boxShadow: '0 25px 50px rgba(139, 0, 0, 0.1), 0 0 30px rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(139, 0, 0, 0.1)',
            backdropFilter: 'blur(10px)'
          }}>
            <h2 style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#141416',
              marginBottom: '8px',
              textAlign: 'center'
            }}>
              🚀 Your Business Formation Journey
            </h2>
            <p style={{
              color: '#666',
              fontSize: '18px',
              textAlign: 'center',
              fontFamily: 'Inter, sans-serif'
            }}>
              Launch your dream business with AI-powered guidance
            </p>
          </div>

          {/* Feature Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #8B0000 0%, #A00000 100%)',
              color: 'white',
              padding: '2rem',
              borderRadius: '20px',
              boxShadow: '0 15px 35px rgba(139, 0, 0, 0.3)',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)'
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(139, 0, 0, 0.4)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 15px 35px rgba(139, 0, 0, 0.3)'
            }}
            onClick={() => window.location.href = '/business-assessment'}
            >
              <h3 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                marginBottom: '12px',
                fontFamily: 'Poppins, sans-serif'
              }}>
                📊 Business Assessment
              </h3>
              <p style={{
                fontSize: '16px',
                opacity: 0.9,
                fontFamily: 'Inter, sans-serif'
              }}>
                Complete your business formation assessment with AI guidance
              </p>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #56b978 0%, #45a367 100%)',
              color: 'white',
              padding: '2rem',
              borderRadius: '20px',
              boxShadow: '0 15px 35px rgba(86, 185, 120, 0.3)',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)'
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(86, 185, 120, 0.4)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 15px 35px rgba(86, 185, 120, 0.3)'
            }}
            onClick={() => window.location.href = '/user-profile'}
            >
              <h3 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                marginBottom: '12px',
                fontFamily: 'Poppins, sans-serif'
              }}>
                👤 User Profile
              </h3>
              <p style={{
                fontSize: '16px',
                opacity: 0.9,
                fontFamily: 'Inter, sans-serif'
              }}>
                View your profile, Dream DNA, and personalized voice assistant
              </p>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #6f42c1 0%, #5a32a3 100%)',
              color: 'white',
              padding: '2rem',
              borderRadius: '20px',
              boxShadow: '0 15px 35px rgba(111, 66, 193, 0.3)',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)'
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(111, 66, 193, 0.4)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 15px 35px rgba(111, 66, 193, 0.3)'
            }}
            onClick={() => window.location.href = '/domain-checker'}
            >
              <h3 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                marginBottom: '12px',
                fontFamily: 'Poppins, sans-serif'
              }}>
                🌐 Domain Checker
              </h3>
              <p style={{
                fontSize: '16px',
                opacity: 0.9,
                fontFamily: 'Inter, sans-serif'
              }}>
                Find the perfect domain name for your business
              </p>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #fd7e14 0%, #e55a00 100%)',
              color: 'white',
              padding: '2rem',
              borderRadius: '20px',
              boxShadow: '0 15px 35px rgba(253, 126, 20, 0.3)',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)'
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(253, 126, 20, 0.4)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 15px 35px rgba(253, 126, 20, 0.3)'
            }}
            onClick={() => window.location.href = '/onboarding'}
            >
              <h3 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                marginBottom: '12px',
                fontFamily: 'Poppins, sans-serif'
              }}>
                🚀 Complete Onboarding
              </h3>
              <p style={{
                fontSize: '16px',
                opacity: 0.9,
                fontFamily: 'Inter, sans-serif'
              }}>
                Set up your Dream DNA and get personalized guidance
              </p>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
              color: 'white',
              padding: '3rem 2rem',
              borderRadius: '24px',
              boxShadow: '0 20px 40px rgba(0, 123, 255, 0.4)',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              textAlign: 'center',
              gridColumn: 'span 2',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)'
              e.currentTarget.style.boxShadow = '0 25px 50px rgba(0, 123, 255, 0.5)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 123, 255, 0.4)'
            }}
            onClick={() => window.location.href = '/dream-dna-setup'}
            >
              {/* Big Plus Icon */}
              <div style={{
                fontSize: '64px',
                fontWeight: 'bold',
                marginBottom: '16px',
                textShadow: '0 4px 8px rgba(0, 0, 0, 0.3)'
              }}>
                ➕
              </div>
              <h3 style={{
                fontSize: '32px',
                fontWeight: 'bold',
                marginBottom: '16px',
                fontFamily: 'Poppins, sans-serif',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
              }}>
                Create New Dream
              </h3>
              <p style={{
                fontSize: '18px',
                opacity: 0.95,
                fontFamily: 'Inter, sans-serif',
                maxWidth: '400px',
                margin: '0 auto'
              }}>
                Start your business formation journey with our AI-powered dream creation process
              </p>
              
              {/* Shimmer effect */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                animation: 'shimmer 2s infinite'
              }}></div>
            </div>


          </div>

          {/* Status Section */}
          <div style={{
            background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 249, 250, 0.95) 100%)',
            borderRadius: '20px',
            padding: '2rem',
            boxShadow: '0 15px 35px rgba(139, 0, 0, 0.1)',
            border: '1px solid rgba(139, 0, 0, 0.1)',
            backdropFilter: 'blur(10px)'
          }}>
            <h3 style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#141416',
              marginBottom: '1rem',
              textAlign: 'center'
            }}>
              ✅ System Status
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem'
            }}>
              <div style={{
                padding: '1rem',
                background: 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)',
                borderRadius: '12px',
                border: '1px solid #56b978'
              }}>
                <div style={{ fontWeight: 'bold', color: '#155724', marginBottom: '4px' }}>Portal Loading</div>
                <div style={{ color: '#155724' }}>✅ Working</div>
              </div>
              <div style={{
                padding: '1rem',
                background: 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)',
                borderRadius: '12px',
                border: '1px solid #56b978'
              }}>
                <div style={{ fontWeight: 'bold', color: '#155724', marginBottom: '4px' }}>Authentication</div>
                <div style={{ color: '#155724' }}>✅ Working</div>
              </div>
              <div style={{
                padding: '1rem',
                background: 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)',
                borderRadius: '12px',
                border: '1px solid #56b978'
              }}>
                <div style={{ fontWeight: 'bold', color: '#155724', marginBottom: '4px' }}>User Profile</div>
                <div style={{ color: '#155724' }}>✅ {user?.status || 'Active'}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VAPI Widget - Fixed at Bottom */}
      {isClient && (vapiScriptLoaded || loading === false) && (
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
        chat-first-message={`Hey ${user?.customer_name || 'there'}! I'm Elliot, your business coach. 

Let's get straight to it - what business are you building? Tell me about your idea and I'll help you set up your Dream DNA.`}
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
          zIndex: 10000,
          display: 'block',
          visibility: 'visible'
        }}
      ></vapi-widget>
      )}
    </>
  )
}
