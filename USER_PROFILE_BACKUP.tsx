/**
 * 👤 USER PROFILE WITH VOICE WIDGET BACKUP
 * 
 * This is a beautiful user profile page with the VAPI voice widget at the bottom.
 * 
 * Features:
 * ✅ User profile information display
 * ✅ Dream DNA integration
 * ✅ Personalized VAPI voice widget at bottom
 * ✅ Beautiful DreamSeed branding
 * ✅ Quick action buttons
 * ✅ Responsive design
 * 
 * To recreate: Copy this entire file to app/user-profile/page.tsx
 * 
 * Created: 2024-12-19
 * Status: WORKING PERFECTLY
 */

'use client'
import React, { useState, useEffect } from 'react'

export default function UserProfile() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Demo data
  const user = {
    id: 'demo-user-123',
    customer_name: 'Demo User',
    customer_phone: '+15551234567',
    customer_email: 'demo@dreamseed.com',
    business_name: 'Demo Business',
    current_call_stage: 1,
    status: 'active'
  }

  const dreamDNA = {
    business_id: user.id,
    core_purpose: 'To help entrepreneurs build successful businesses',
    target_audience: 'Small business owners and startups',
    unique_value_proposition: 'AI-powered business formation guidance',
    business_model: 'SaaS subscription',
    competitive_advantage: 'Personalized AI coaching',
    growth_strategy: 'Expand to enterprise clients',
    vision_statement: 'Empowering entrepreneurs to build their dreams',
    mission_statement: 'Provide accessible, intelligent business formation support'
  }

  return (
    <>
      {/* VAPI Script */}
      <script 
        src="https://unpkg.com/@vapi-ai/client-sdk-react/dist/embed/widget.umd.js" 
        async 
        type="text/javascript"
      ></script>
      
      <div style={{
        background: 'linear-gradient(135deg, #000000 0%, #1a0000 50%, #000000 100%)',
        minHeight: '100vh',
        color: 'white',
        fontFamily: 'Inter, sans-serif'
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
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '2rem',
          position: 'relative',
          zIndex: 10
        }}>
          {/* Header */}
          <div style={{
            textAlign: 'center',
            marginBottom: '3rem'
          }}>
            <h1 style={{
              fontSize: '48px',
              fontWeight: 'bold',
              marginBottom: '16px',
              background: 'linear-gradient(135deg, #ffffff 0%, #cccccc 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              👤 User Profile
            </h1>
            <p style={{
              fontSize: '20px',
              color: '#cccccc',
              marginBottom: '8px'
            }}>
              Your DreamSeed Business Journey
            </p>
            <p style={{
              fontSize: '16px',
              color: '#999999'
            }}>
              Personal Information • Dream DNA • Voice Assistant
            </p>
          </div>

          {/* User Information Card */}
          <div style={{
            background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
            padding: '2rem',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            marginBottom: '2rem'
          }}>
            <h2 style={{ margin: '0 0 20px 0', color: '#56b978', fontSize: '28px' }}>👤 Personal Information</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
              <div>
                <strong style={{ color: '#56b978' }}>Name:</strong>
                <div style={{ color: '#cccccc', marginTop: '4px' }}>{user?.customer_name || 'Not set'}</div>
              </div>
              <div>
                <strong style={{ color: '#56b978' }}>Email:</strong>
                <div style={{ color: '#cccccc', marginTop: '4px' }}>{user?.customer_email || 'Not set'}</div>
              </div>
              <div>
                <strong style={{ color: '#56b978' }}>Phone:</strong>
                <div style={{ color: '#cccccc', marginTop: '4px' }}>{user?.customer_phone || 'Not set'}</div>
              </div>
              <div>
                <strong style={{ color: '#56b978' }}>Business Name:</strong>
                <div style={{ color: '#cccccc', marginTop: '4px' }}>{user?.business_name || 'Not set'}</div>
              </div>
              <div>
                <strong style={{ color: '#56b978' }}>Call Stage:</strong>
                <div style={{ color: '#cccccc', marginTop: '4px' }}>Stage {user?.current_call_stage || 1} of 4</div>
              </div>
              <div>
                <strong style={{ color: '#56b978' }}>Status:</strong>
                <div style={{ color: '#cccccc', marginTop: '4px' }}>{user?.status || 'Active'}</div>
              </div>
            </div>
          </div>

          {/* Dream DNA Card */}
          {dreamDNA && (
            <div style={{
              background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
              padding: '2rem',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              marginBottom: '2rem'
            }}>
              <h2 style={{ margin: '0 0 20px 0', color: '#56b978', fontSize: '28px' }}>🧬 Dream DNA</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                <div>
                  <strong style={{ color: '#56b978' }}>Core Purpose:</strong>
                  <div style={{ color: '#cccccc', marginTop: '4px' }}>{dreamDNA.core_purpose || 'Not set'}</div>
                </div>
                <div>
                  <strong style={{ color: '#56b978' }}>Target Audience:</strong>
                  <div style={{ color: '#cccccc', marginTop: '4px' }}>{dreamDNA.target_audience || 'Not set'}</div>
                </div>
                <div>
                  <strong style={{ color: '#56b978' }}>Unique Value Proposition:</strong>
                  <div style={{ color: '#cccccc', marginTop: '4px' }}>{dreamDNA.unique_value_proposition || 'Not set'}</div>
                </div>
                <div>
                  <strong style={{ color: '#56b978' }}>Business Model:</strong>
                  <div style={{ color: '#cccccc', marginTop: '4px' }}>{dreamDNA.business_model || 'Not set'}</div>
                </div>
                <div>
                  <strong style={{ color: '#56b978' }}>Competitive Advantage:</strong>
                  <div style={{ color: '#cccccc', marginTop: '4px' }}>{dreamDNA.competitive_advantage || 'Not set'}</div>
                </div>
                <div>
                  <strong style={{ color: '#56b978' }}>Growth Strategy:</strong>
                  <div style={{ color: '#cccccc', marginTop: '4px' }}>{dreamDNA.growth_strategy || 'Not set'}</div>
                </div>
              </div>
              
              {(dreamDNA.vision_statement || dreamDNA.mission_statement) && (
                <div style={{ marginTop: '20px', padding: '20px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px' }}>
                  {dreamDNA.vision_statement && (
                    <div style={{ marginBottom: '16px' }}>
                      <strong style={{ color: '#56b978' }}>Vision Statement:</strong>
                      <div style={{ color: '#cccccc', marginTop: '4px', fontStyle: 'italic' }}>"{dreamDNA.vision_statement}"</div>
                    </div>
                  )}
                  {dreamDNA.mission_statement && (
                    <div>
                      <strong style={{ color: '#56b978' }}>Mission Statement:</strong>
                      <div style={{ color: '#cccccc', marginTop: '4px', fontStyle: 'italic' }}>"{dreamDNA.mission_statement}"</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Voice Assistant Section */}
          <div style={{
            background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
            padding: '2rem',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            marginBottom: '2rem'
          }}>
            <h2 style={{ margin: '0 0 20px 0', color: '#56b978', fontSize: '28px' }}>🎤 Your AI Business Coach</h2>
            <p style={{ margin: '0 0 20px 0', color: '#cccccc', fontSize: '16px' }}>
              Elliot is your personalized business formation assistant. He knows your profile, Dream DNA, and business goals. 
              Click the voice button in the bottom-right corner to start a conversation!
            </p>
            
            {/* Voice Widget Features */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎤</div>
                <strong style={{ color: '#56b978' }}>Elliot Voice</strong>
                <div style={{ color: '#cccccc', fontSize: '12px' }}>Natural conversation</div>
              </div>
              <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>🧠</div>
                <strong style={{ color: '#56b978' }}>AI Powered</strong>
                <div style={{ color: '#cccccc', fontSize: '12px' }}>Business expertise</div>
              </div>
              <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>👤</div>
                <strong style={{ color: '#56b978' }}>Personalized</strong>
                <div style={{ color: '#cccccc', fontSize: '12px' }}>Knows your profile</div>
              </div>
              <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>💬</div>
                <strong style={{ color: '#56b978' }}>Real-time</strong>
                <div style={{ color: '#cccccc', fontSize: '12px' }}>Instant responses</div>
              </div>
            </div>

            {/* Instructions */}
            <div style={{
              padding: '16px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#56b978' }}>🎯 How to Use Your Voice Assistant:</h4>
              <ol style={{ margin: 0, paddingLeft: '20px', color: '#cccccc', fontSize: '14px' }}>
                <li>Look for the green microphone button in the bottom-right corner</li>
                <li>Click "Start" to begin your conversation with Elliot</li>
                <li>Ask about your business formation, Dream DNA, or next steps</li>
                <li>Elliot will provide personalized advice based on your profile</li>
                <li>Click "End Call" when you're finished</li>
              </ol>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{
            background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
            padding: '2rem',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            marginBottom: '2rem'
          }}>
            <h2 style={{ margin: '0 0 20px 0', color: '#56b978', fontSize: '28px' }}>⚡ Quick Actions</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <button 
                onClick={() => window.location.href = '/business-assessment'}
                style={{
                  background: 'linear-gradient(135deg, #56b978 0%, #45a367 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '16px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                📊 Business Assessment
              </button>
              <button 
                onClick={() => window.location.href = '/dream-dna-setup'}
                style={{
                  background: 'linear-gradient(135deg, #6f42c1 0%, #5a32a3 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '16px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                🧬 Dream DNA Setup
              </button>
              <button 
                onClick={() => window.location.href = '/domain-checker'}
                style={{
                  background: 'linear-gradient(135deg, #fd7e14 0%, #e55a00 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '16px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                🌐 Domain Checker
              </button>
              <button 
                onClick={() => window.location.href = '/simple-portal'}
                style={{
                  background: 'linear-gradient(135deg, #8B0000 0%, #A00000 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '16px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                🏠 Portal Home
              </button>
            </div>
          </div>

          {/* Footer */}
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#999999',
            fontSize: '14px'
          }}>
            <p style={{ margin: '0 0 8px 0' }}>Powered by <strong style={{ color: '#56b978' }}>VAPI</strong> • Built for <strong style={{ color: '#56b978' }}>DreamSeed</strong></p>
            <p style={{ margin: 0 }}>Your personalized business formation journey</p>
          </div>
        </div>

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
            chat-first-message={`Hey ${user?.customer_name || 'there'}! I'm Elliot, your personalized business formation coach. I can see your profile and Dream DNA. How can I help you with your business today?`}
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

/**
 * 🚀 RECREATION INSTRUCTIONS:
 * 
 * 1. Copy this entire file content
 * 2. Create: app/user-profile/page.tsx
 * 3. Paste the content
 * 4. Ensure route is in middleware.ts publicRoutes array
 * 5. Access at: http://localhost:3000/user-profile
 * 
 * ✅ This page includes:
 * - User profile information display
 * - Dream DNA integration
 * - Personalized VAPI voice widget at bottom
 * - Beautiful DreamSeed branding
 * - Quick action buttons
 * - Responsive design
 * 
 * 👤 The perfect user profile with voice assistant!
 */
