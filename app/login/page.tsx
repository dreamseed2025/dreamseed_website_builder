'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createSupabaseClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { checkUserRole, getRedirectPath } from '@/lib/auth-roles'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [loadingError, setLoadingError] = useState<string | null>(null)
  const supabase = createSupabaseClient()
  const router = useRouter()

  useEffect(() => {
    // Set a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('Login loading timeout')
        setLoadingError('Login timeout. Please try again.')
        setLoading(false)
      }
    }, 10000) // 10 second timeout

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event, session ? 'has session' : 'no session')
      
      if (event === 'SIGNED_IN' && session) {
        setLoading(true)
        console.log('🔐 User signed in, redirecting to simple portal...')
        
        // Redirect immediately after sign-in
        router.push('/simple-portal')
      } else if (event === 'SIGNED_OUT') {
        console.log('👋 User signed out')
        setLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [supabase.auth, router, loading])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #141416 0%, #3348a8 100%)', color: 'white' }}>
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
          <p style={{ fontSize: '18px', fontFamily: 'Poppins, sans-serif' }}>Setting up your account...</p>
          {loadingError && (
            <div style={{ marginTop: '20px', padding: '10px', background: 'rgba(255, 0, 0, 0.1)', borderRadius: '8px' }}>
              <p style={{ color: '#ff6b6b', fontSize: '14px' }}>{loadingError}</p>
              <button 
                onClick={() => window.location.reload()}
                style={{ 
                  marginTop: '10px', 
                  background: '#ff6b6b', 
                  color: 'white', 
                  border: 'none', 
                  padding: '8px 16px', 
                  borderRadius: '4px', 
                  cursor: 'pointer' 
                }}
              >
                Retry
              </button>
            </div>
          )}
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <>
      <section style={{
        background: 'linear-gradient(135deg, #000000 0%, #1a0000 50%, #000000 100%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
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

        <div style={{
          maxWidth: '400px',
          width: '100%',
          background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
          borderRadius: '24px',
          padding: '40px',
          boxShadow: '0 25px 50px rgba(139, 0, 0, 0.3), 0 0 30px rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(139, 0, 0, 0.2)',
          position: 'relative',
          zIndex: 2
        }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#141416',
              marginBottom: '8px'
            }}>
              🌱 DreamSeed
            </h1>
            <p style={{
              color: '#666',
              fontSize: '16px',
              marginBottom: '8px'
            }}>
              Sign in to your business dashboard
            </p>
            <p style={{
              color: '#8B0000',
              fontSize: '14px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              Launch Your Dream Business
            </p>
          </div>
          
          <Auth
            supabaseClient={supabase}
            appearance={{ 
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#8B0000',
                    brandAccent: '#A00000',
                    defaultButtonBackground: '#8B0000',
                    defaultButtonBackgroundHover: '#A00000',
                    inputBorder: '#333333',
                    inputBorderHover: '#8B0000',
                    inputBorderFocus: '#8B0000'
                  },
                  borderWidths: {
                    buttonBorderWidth: '1px',
                    inputBorderWidth: '2px'
                  },
                  radii: {
                    borderRadiusButton: '12px',
                    buttonBorderRadius: '12px',
                    inputBorderRadius: '12px'
                  },
                  fontSizes: {
                    baseButtonSize: '16px',
                    baseInputSize: '16px',
                    baseLabelSize: '14px'
                  },
                  space: {
                    buttonPadding: '12px 24px',
                    inputPadding: '12px 16px'
                  },
                  fonts: {
                    bodyFontFamily: 'Inter, sans-serif',
                    buttonFontFamily: 'Inter, sans-serif',
                    inputFontFamily: 'Inter, sans-serif',
                    labelFontFamily: 'Inter, sans-serif'
                  }
                }
              },
              className: {
                container: 'dreamseed-auth-container',
                button: 'dreamseed-auth-button',
                input: 'dreamseed-auth-input',
                label: 'dreamseed-auth-label'
              }
            }}
            providers={['google']}
            showLinks={true}
            redirectTo={typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : '/auth/callback'}
          />

          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <p style={{ 
              fontSize: '14px', 
              color: '#666', 
              marginBottom: '12px',
              lineHeight: '1.5'
            }}>
              New to DreamSeed? Your account will be created automatically when you sign up.
            </p>
            <div style={{
              padding: '12px',
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              borderRadius: '12px',
              marginBottom: '16px'
            }}>
              <p style={{ 
                fontSize: '12px', 
                color: '#495057',
                margin: '0'
              }}>
                🚀 Ready to launch your business? Complete the 4-step formation process with AI guidance.
              </p>
            </div>
            <a 
              href="/admin-login" 
              style={{ 
                fontSize: '13px', 
                color: '#dc3545', 
                textDecoration: 'underline',
                fontWeight: '500'
              }}
            >
              Admin Login →
            </a>
          </div>
        </div>
      </section>

      <style jsx global>{`
        /* Custom Supabase Auth styling */
        .dreamseed-auth-container {
          font-family: 'Inter', sans-serif !important;
        }
        
        .dreamseed-auth-button {
          font-weight: 600 !important;
          transition: all 0.3s ease !important;
          font-family: 'Inter', sans-serif !important;
        }
        
        .dreamseed-auth-button:hover {
          transform: translateY(-1px) !important;
          box-shadow: 0 4px 12px rgba(86, 185, 120, 0.3) !important;
        }
        
        .dreamseed-auth-input {
          font-family: 'Inter', sans-serif !important;
        }
        
        .dreamseed-auth-input:focus {
          box-shadow: 0 0 0 3px rgba(86, 185, 120, 0.1) !important;
        }
        
        .dreamseed-auth-label {
          font-family: 'Inter', sans-serif !important;
          font-weight: 600 !important;
          color: #495057 !important;
        }

        /* Override Supabase default colors */
        .supabase-auth-ui_ui-button {
          background: linear-gradient(135deg, #8B0000 0%, #A00000 100%) !important;
          border: 2px solid #8B0000 !important;
          color: white !important;
          text-transform: uppercase !important;
          letter-spacing: 0.5px !important;
          font-weight: 600 !important;
        }
        
        .supabase-auth-ui_ui-button:hover {
          background: linear-gradient(135deg, #A00000 0%, #CC0000 100%) !important;
          border-color: #A00000 !important;
          transform: translateY(-2px) !important;
          box-shadow: 0 8px 25px rgba(139, 0, 0, 0.4) !important;
        }
        
        .supabase-auth-ui_ui-input {
          background: rgba(0, 0, 0, 0.05) !important;
          border: 2px solid #333333 !important;
          color: #000000 !important;
        }
        
        .supabase-auth-ui_ui-input:focus {
          border-color: #8B0000 !important;
          outline: none !important;
          box-shadow: 0 0 0 3px rgba(139, 0, 0, 0.2) !important;
          background: rgba(139, 0, 0, 0.05) !important;
        }

        .supabase-auth-ui_ui-anchor {
          color: #8B0000 !important;
          font-weight: 600 !important;
        }
        
        .supabase-auth-ui_ui-anchor:hover {
          color: #A00000 !important;
        }

        .supabase-auth-ui_ui-label {
          color: #333333 !important;
          font-weight: 600 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.5px !important;
          font-size: 12px !important;
        }
      `}</style>
    </>
  )
}