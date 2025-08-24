'use client'
import React, { useState, useEffect } from 'react'
import { createSupabaseClient } from '@/lib/supabase'

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
  vision_statement: string
  mission_statement: string
}

interface DreamDNATruth {
  id?: string
  business_name?: string
  what_problem?: string
  who_serves?: string
  how_different?: string
  primary_service?: string
  target_revenue?: number
  business_model?: string
  unique_value_proposition?: string
  competitive_advantage?: string
  brand_personality?: string
  business_stage?: string
  industry_category?: string
  geographic_focus?: string
  timeline_to_launch?: number
  confidence_score?: number
  extraction_source?: string
  validated_by_user?: boolean
  created_at?: string
  updated_at?: string
}

export default function UserProfile() {
  const [isClient, setIsClient] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [dreamDNA, setDreamDNA] = useState<DreamDNA | null>(null)
  const [dreamDNATruth, setDreamDNATruth] = useState<DreamDNATruth | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createSupabaseClient()

  // Demo data as fallback
  const demoUser: User = {
    id: 'demo-user-123',
    customer_name: 'Demo User',
    customer_phone: '+15551234567',
    customer_email: 'demo@dreamseed.com',
    business_name: 'Demo Business',
    current_call_stage: 1,
    status: 'active'
  }

  const demoDreamDNA: DreamDNA = {
    business_id: demoUser.id,
    core_purpose: 'To help entrepreneurs build successful businesses',
    target_audience: 'Small business owners and startups',
    unique_value_proposition: 'AI-powered business formation guidance',
    business_model: 'SaaS subscription',
    competitive_advantage: 'Personalized AI coaching',
    growth_strategy: 'Expand to enterprise clients',
    vision_statement: 'Empowering entrepreneurs to build their dreams',
    mission_statement: 'Provide accessible, intelligent business formation support'
  }

  useEffect(() => {
    setIsClient(true)
    loadUserProfile()
  }, [])

  const loadUserProfile = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get current user session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('Session error:', sessionError)
        setError('Failed to get user session')
        setUser(demoUser)
        setDreamDNA(demoDreamDNA)
        setLoading(false)
        return
      }

      if (!session?.user) {
        console.log('No authenticated user, using demo data')
        setUser(demoUser)
        setDreamDNA(demoDreamDNA)
        setLoading(false)
        return
      }

      console.log('Loading profile for user:', session.user.email)

      // Call the user profile API which will create profile if needed
      const response = await fetch('/api/user-profile')
      const result = await response.json()

      if (result.success && result.profile) {
        console.log('Profile data loaded from API:', result.profile)
        
        // Map API response to our User interface
        const userData: User = {
          id: result.profile.id,
          customer_name: result.profile.customer_name || session.user.user_metadata?.full_name || 'User',
          customer_phone: '', // Not in API response yet
          customer_email: result.profile.customer_email || session.user.email || '',
          business_name: result.profile.business_name || '',
          current_call_stage: 1, // Default to stage 1
          status: result.profile.status || 'active'
        }
        
        setUser(userData)

        // Set dream DNA truth data if available
        if (result.profile.dream_dna_truth) {
          setDreamDNATruth(result.profile.dream_dna_truth)
        }

        // If dream DNA exists, map it to our interface
        if (result.profile.dream_dna) {
          const dreamDnaData: DreamDNA = {
            business_id: userData.id,
            core_purpose: result.profile.dream_dna.business_concept || 'To help entrepreneurs build successful businesses',
            target_audience: result.profile.dream_dna.target_customers || 'Small business owners and startups',
            unique_value_proposition: result.profile.dream_dna.business_concept || 'AI-powered business formation guidance',
            business_model: 'SaaS subscription', // Default
            competitive_advantage: 'Personalized AI coaching', // Default
            growth_strategy: 'Expand to enterprise clients', // Default
            vision_statement: result.profile.dream_dna.vision_statement || 'Empowering entrepreneurs to build their dreams',
            mission_statement: 'Provide accessible, intelligent business formation support' // Default
          }
          setDreamDNA(dreamDnaData)
        } else {
          // Create basic dream DNA if none exists
          const basicDreamDNA: DreamDNA = {
            business_id: userData.id,
            core_purpose: 'To help entrepreneurs build successful businesses',
            target_audience: 'Small business owners and startups',
            unique_value_proposition: 'AI-powered business formation guidance',
            business_model: 'SaaS subscription',
            competitive_advantage: 'Personalized AI coaching',
            growth_strategy: 'Expand to enterprise clients',
            vision_statement: 'Empowering entrepreneurs to build their dreams',
            mission_statement: 'Provide accessible, intelligent business formation support'
          }
          setDreamDNA(basicDreamDNA)
        }
      } else {
        console.error('Failed to load profile from API:', result.message)
        setError('Failed to load profile data')
        setUser(demoUser)
        setDreamDNA(demoDreamDNA)
      }

    } catch (err) {
      console.error('Profile loading error:', err)
      setError('Failed to load profile data')
      setUser(demoUser)
      setDreamDNA(demoDreamDNA)
    } finally {
      setLoading(false)
    }
  }

  const currentUser = user || demoUser
  const currentDreamDNA = dreamDNA || demoDreamDNA

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
        minHeight: 'calc(100vh - 80px)', // Account for fixed header
        color: 'white',
        fontFamily: 'Inter, sans-serif',
        paddingTop: '0' // Remove top padding since main already has margin-top
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
          zIndex: 10,
          minHeight: 'calc(100vh - 80px)' // Ensure full height minus header
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
            
            {/* Data Status Indicator */}
            {loading && (
              <div style={{
                marginTop: '16px',
                padding: '8px 16px',
                background: 'rgba(255, 193, 7, 0.2)',
                borderRadius: '8px',
                border: '1px solid #ffc107',
                color: '#ffc107',
                fontSize: '14px'
              }}>
                🔄 Loading your profile data...
              </div>
            )}
            
            {error && (
              <div style={{
                marginTop: '16px',
                padding: '8px 16px',
                background: 'rgba(220, 53, 69, 0.2)',
                borderRadius: '8px',
                border: '1px solid #dc3545',
                color: '#dc3545',
                fontSize: '14px'
              }}>
                ⚠️ {error} - Showing demo data
              </div>
            )}
            
            {!loading && !error && user?.id !== demoUser.id && (
              <div style={{
                marginTop: '16px',
                padding: '8px 16px',
                background: 'rgba(86, 185, 120, 0.2)',
                borderRadius: '8px',
                border: '1px solid #56b978',
                color: '#56b978',
                fontSize: '14px'
              }}>
                ✅ Real profile data loaded
              </div>
            )}
            
            {!loading && !error && user?.id === demoUser.id && (
              <div style={{
                marginTop: '16px',
                padding: '8px 16px',
                background: 'rgba(108, 117, 125, 0.2)',
                borderRadius: '8px',
                border: '1px solid #6c757d',
                color: '#6c757d',
                fontSize: '14px'
              }}>
                ℹ️ Demo data - Sign in to see your real profile
              </div>
            )}
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
                <div style={{ color: '#cccccc', marginTop: '4px' }}>{currentUser?.customer_name || 'Not set'}</div>
              </div>
              <div>
                <strong style={{ color: '#56b978' }}>Email:</strong>
                <div style={{ color: '#cccccc', marginTop: '4px' }}>{currentUser?.customer_email || 'Not set'}</div>
              </div>
              <div>
                <strong style={{ color: '#56b978' }}>Phone:</strong>
                <div style={{ color: '#cccccc', marginTop: '4px' }}>{currentUser?.customer_phone || 'Not set'}</div>
              </div>
              <div>
                <strong style={{ color: '#56b978' }}>Business Name:</strong>
                <div style={{ color: '#cccccc', marginTop: '4px' }}>{currentUser?.business_name || 'Not set'}</div>
              </div>
              <div>
                <strong style={{ color: '#56b978' }}>Call Stage:</strong>
                <div style={{ color: '#cccccc', marginTop: '4px' }}>Stage {currentUser?.current_call_stage || 1} of 4</div>
              </div>
              <div>
                <strong style={{ color: '#56b978' }}>Status:</strong>
                <div style={{ color: '#cccccc', marginTop: '4px' }}>{currentUser?.status || 'Active'}</div>
              </div>
            </div>
          </div>

          {/* Enhanced Dream DNA Card */}
          <div style={{
            background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
            padding: '2rem',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            marginBottom: '2rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: '#56b978', fontSize: '28px' }}>🧬 Dream DNA Truth Table</h2>
              {dreamDNATruth && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    padding: '4px 8px',
                    background: dreamDNATruth.validated_by_user ? 'rgba(86, 185, 120, 0.2)' : 'rgba(255, 193, 7, 0.2)',
                    borderRadius: '4px',
                    fontSize: '12px',
                    color: dreamDNATruth.validated_by_user ? '#56b978' : '#ffc107'
                  }}>
                    {dreamDNATruth.validated_by_user ? '✅ Validated' : '⏳ Pending Validation'}
                  </div>
                  {dreamDNATruth.confidence_score && (
                    <div style={{
                      padding: '4px 8px',
                      background: 'rgba(111, 66, 193, 0.2)',
                      borderRadius: '4px',
                      fontSize: '12px',
                      color: '#6f42c1'
                    }}>
                      {Math.round(dreamDNATruth.confidence_score * 100)}% Confidence
                    </div>
                  )}
                </div>
              )}
            </div>

            {dreamDNATruth ? (
              // Display real Dream DNA Truth data
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                <div>
                  <strong style={{ color: '#56b978' }}>Business Name:</strong>
                  <div style={{ color: '#cccccc', marginTop: '4px' }}>{dreamDNATruth.business_name || 'Not set'}</div>
                </div>
                <div>
                  <strong style={{ color: '#56b978' }}>What Problem:</strong>
                  <div style={{ color: '#cccccc', marginTop: '4px' }}>{dreamDNATruth.what_problem || 'Not set'}</div>
                </div>
                <div>
                  <strong style={{ color: '#56b978' }}>Who Serves:</strong>
                  <div style={{ color: '#cccccc', marginTop: '4px' }}>{dreamDNATruth.who_serves || 'Not set'}</div>
                </div>
                <div>
                  <strong style={{ color: '#56b978' }}>How Different:</strong>
                  <div style={{ color: '#cccccc', marginTop: '4px' }}>{dreamDNATruth.how_different || 'Not set'}</div>
                </div>
                <div>
                  <strong style={{ color: '#56b978' }}>Primary Service:</strong>
                  <div style={{ color: '#cccccc', marginTop: '4px' }}>{dreamDNATruth.primary_service || 'Not set'}</div>
                </div>
                <div>
                  <strong style={{ color: '#56b978' }}>Target Revenue:</strong>
                  <div style={{ color: '#cccccc', marginTop: '4px' }}>
                    {dreamDNATruth.target_revenue ? `$${dreamDNATruth.target_revenue.toLocaleString()}` : 'Not set'}
                  </div>
                </div>
                <div>
                  <strong style={{ color: '#56b978' }}>Business Model:</strong>
                  <div style={{ color: '#cccccc', marginTop: '4px' }}>{dreamDNATruth.business_model || 'Not set'}</div>
                </div>
                <div>
                  <strong style={{ color: '#56b978' }}>Unique Value Proposition:</strong>
                  <div style={{ color: '#cccccc', marginTop: '4px' }}>{dreamDNATruth.unique_value_proposition || 'Not set'}</div>
                </div>
                <div>
                  <strong style={{ color: '#56b978' }}>Competitive Advantage:</strong>
                  <div style={{ color: '#cccccc', marginTop: '4px' }}>{dreamDNATruth.competitive_advantage || 'Not set'}</div>
                </div>
                <div>
                  <strong style={{ color: '#56b978' }}>Brand Personality:</strong>
                  <div style={{ color: '#cccccc', marginTop: '4px' }}>{dreamDNATruth.brand_personality || 'Not set'}</div>
                </div>
                <div>
                  <strong style={{ color: '#56b978' }}>Business Stage:</strong>
                  <div style={{ color: '#cccccc', marginTop: '4px' }}>{dreamDNATruth.business_stage || 'Not set'}</div>
                </div>
                <div>
                  <strong style={{ color: '#56b978' }}>Industry Category:</strong>
                  <div style={{ color: '#cccccc', marginTop: '4px' }}>{dreamDNATruth.industry_category || 'Not set'}</div>
                </div>
                <div>
                  <strong style={{ color: '#56b978' }}>Geographic Focus:</strong>
                  <div style={{ color: '#cccccc', marginTop: '4px' }}>{dreamDNATruth.geographic_focus || 'Not set'}</div>
                </div>
                <div>
                  <strong style={{ color: '#56b978' }}>Timeline to Launch:</strong>
                  <div style={{ color: '#cccccc', marginTop: '4px' }}>
                    {dreamDNATruth.timeline_to_launch ? `${dreamDNATruth.timeline_to_launch} months` : 'Not set'}
                  </div>
                </div>
              </div>
            ) : (
              // Fallback to legacy Dream DNA data
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                <div>
                  <strong style={{ color: '#56b978' }}>Core Purpose:</strong>
                  <div style={{ color: '#cccccc', marginTop: '4px' }}>{currentDreamDNA?.core_purpose || 'Not set'}</div>
                </div>
                <div>
                  <strong style={{ color: '#56b978' }}>Target Audience:</strong>
                  <div style={{ color: '#cccccc', marginTop: '4px' }}>{currentDreamDNA?.target_audience || 'Not set'}</div>
                </div>
                <div>
                  <strong style={{ color: '#56b978' }}>Unique Value Proposition:</strong>
                  <div style={{ color: '#cccccc', marginTop: '4px' }}>{currentDreamDNA?.unique_value_proposition || 'Not set'}</div>
                </div>
                <div>
                  <strong style={{ color: '#56b978' }}>Business Model:</strong>
                  <div style={{ color: '#cccccc', marginTop: '4px' }}>{currentDreamDNA?.business_model || 'Not set'}</div>
                </div>
                <div>
                  <strong style={{ color: '#56b978' }}>Competitive Advantage:</strong>
                  <div style={{ color: '#cccccc', marginTop: '4px' }}>{currentDreamDNA?.competitive_advantage || 'Not set'}</div>
                </div>
                <div>
                  <strong style={{ color: '#56b978' }}>Growth Strategy:</strong>
                  <div style={{ color: '#cccccc', marginTop: '4px' }}>{currentDreamDNA?.growth_strategy || 'Not set'}</div>
                </div>
              </div>
            )}
            
            {/* Metadata section */}
            {dreamDNATruth && (
              <div style={{ marginTop: '20px', padding: '20px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px' }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#56b978' }}>📊 Extraction Metadata</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '14px' }}>
                  <div>
                    <strong style={{ color: '#56b978' }}>Source:</strong>
                    <div style={{ color: '#cccccc', marginTop: '2px' }}>{dreamDNATruth.extraction_source || 'Unknown'}</div>
                  </div>
                  <div>
                    <strong style={{ color: '#56b978' }}>Extracted:</strong>
                    <div style={{ color: '#cccccc', marginTop: '2px' }}>
                      {dreamDNATruth.created_at ? new Date(dreamDNATruth.created_at).toLocaleDateString() : 'Unknown'}
                    </div>
                  </div>
                  <div>
                    <strong style={{ color: '#56b978' }}>Updated:</strong>
                    <div style={{ color: '#cccccc', marginTop: '2px' }}>
                      {dreamDNATruth.updated_at ? new Date(dreamDNATruth.updated_at).toLocaleDateString() : 'Unknown'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Legacy vision/mission statements if available */}
            {(currentDreamDNA?.vision_statement || currentDreamDNA?.mission_statement) && (
              <div style={{ marginTop: '20px', padding: '20px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px' }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#56b978' }}>🎯 Vision & Mission</h4>
                {currentDreamDNA.vision_statement && (
                  <div style={{ marginBottom: '16px' }}>
                    <strong style={{ color: '#56b978' }}>Vision Statement:</strong>
                    <div style={{ color: '#cccccc', marginTop: '4px', fontStyle: 'italic' }}>"{currentDreamDNA.vision_statement}"</div>
                  </div>
                )}
                {currentDreamDNA.mission_statement && (
                  <div>
                    <strong style={{ color: '#56b978' }}>Mission Statement:</strong>
                    <div style={{ color: '#cccccc', marginTop: '4px', fontStyle: 'italic' }}>"{currentDreamDNA.mission_statement}"</div>
                  </div>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div style={{ marginTop: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button 
                onClick={() => window.location.href = '/dream-dna-setup'}
                style={{
                  background: 'linear-gradient(135deg, #6f42c1 0%, #5a32a3 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                🧬 Update Dream DNA
              </button>
              <button 
                onClick={() => window.location.href = '/dream-dna-overview'}
                style={{
                  background: 'linear-gradient(135deg, #fd7e14 0%, #e55a00 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                📋 Truth Table Overview
              </button>
              {dreamDNATruth && !dreamDNATruth.validated_by_user && (
                <button 
                  onClick={() => {/* TODO: Add validation logic */}}
                  style={{
                    background: 'linear-gradient(135deg, #56b978 0%, #45a367 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '12px 20px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  ✅ Validate Data
                </button>
              )}
            </div>
          </div>

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
                onClick={() => window.location.href = '/dream-dna-overview'}
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
                🧬 Dream DNA
              </button>
              <button 
                onClick={() => window.location.href = '/dream-dna-setup'}
                style={{
                  background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
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
                ✨ Add New Dream
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
            chat-first-message={`Hey ${currentUser?.customer_name || 'there'}${dreamDNATruth?.business_name ? ` from ${dreamDNATruth.business_name}` : ''}! I'm Elliot, your business coach. 

I can see your profile. What business are you building? Tell me about your idea and I'll help you set up your Dream DNA.`}
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
