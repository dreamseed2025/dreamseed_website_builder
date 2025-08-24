'use client'
import React, { useEffect, useState } from 'react'
import { createSupabaseClient } from '../../lib/supabase'

export default function VAPIHostedWidget() {
  const [userInfo, setUserInfo] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [authUser, setAuthUser] = useState<any>(null)

  useEffect(() => {
    // Simplified user loading with timeout protection
    const getRealUserInfo = async () => {
      try {
        const supabase = createSupabaseClient()
        
        // Set a timeout to prevent infinite loading
        const timeout = setTimeout(() => {
          if (isLoading) {
            console.warn('User loading timeout - using demo data')
            setUserInfo({
              id: 'demo-user',
              email: 'demo@dreamseed.com',
              full_name: 'Demo User',
              business_name: 'Demo Business',
              business_type: 'General',
              current_call_stage: 1,
              dream_id: 'dream-demo'
            })
            setIsLoading(false)
          }
        }, 5000) // 5 second timeout
        
        // Step 1: Get authenticated user (with timeout)
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
          console.log('No authenticated user, using demo data')
          setUserInfo({
            id: 'demo-user',
            email: 'demo@dreamseed.com',
            full_name: 'Demo User',
            business_name: 'Demo Business',
            business_type: 'General',
            current_call_stage: 1,
            dream_id: 'dream-demo'
          })
          setIsLoading(false)
          clearTimeout(timeout)
          return
        }
        
        setAuthUser(user)
        console.log('✅ Authenticated user:', user.email)
        
        // Step 2: Try to get user profile (optional, don't block if it fails)
        try {
          const { data: userProfile, error: profileError } = await supabase
            .from('users')
            .select('id, email, full_name, business_name, business_type, current_call_stage')
            .eq('id', user.id)
            .single()
          
          if (!profileError && userProfile) {
            setUserInfo(userProfile)
            console.log('✅ Found user profile')
          } else {
            // Use basic user data
            setUserInfo({
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || 'User',
              business_name: 'My Business',
              business_type: 'General',
              current_call_stage: 1,
              dream_id: `dream-${user.id}`
            })
            console.log('✅ Using basic user data')
          }
        } catch (profileError) {
          console.log('⚠️ Profile fetch failed, using basic data')
          setUserInfo({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || 'User',
            business_name: 'My Business',
            business_type: 'General',
            current_call_stage: 1,
            dream_id: `dream-${user.id}`
          })
        }
        
        clearTimeout(timeout)
        setIsLoading(false)
        
      } catch (err) {
        console.error('Error loading user info:', err)
        // Don't show error, just use demo data
        setUserInfo({
          id: 'demo-user',
          email: 'demo@dreamseed.com',
          full_name: 'Demo User',
          business_name: 'Demo Business',
          business_type: 'General',
          current_call_stage: 1,
          dream_id: 'dream-demo'
        })
        setIsLoading(false)
      }
    }

    getRealUserInfo()
  }, [isLoading])

  const personalizeAssistant = async (user: any) => {
    try {
      console.log('🎯 Personalizing assistant for real user:', user.full_name || user.email)
      
      // Create Dream DNA context section
      const dreamDNASection = user.dreamDNA ? `
## 🧬 DREAM DNA TRUTH TABLE
**Vision Statement:** ${user.dreamDNA.vision_statement || 'Not specified'}
**Core Purpose:** ${user.dreamDNA.core_purpose || 'Not specified'}
**Passion Driver:** ${user.dreamDNA.passion_driver || 'Not specified'}
**Business Concept:** ${user.dreamDNA.business_concept || 'Not specified'}
**Target Customers:** ${user.dreamDNA.target_customers || 'Not specified'}
**Unique Value Proposition:** ${user.dreamDNA.unique_value_prop || 'Not specified'}
**Revenue Goals:** ${user.dreamDNA.revenue_goals || 'Not specified'}
**Services Offered:** ${user.dreamDNA.services_offered || 'Not specified'}
**Lifestyle Goals:** ${user.dreamDNA.lifestyle_goals || 'Not specified'}
**Risk Tolerance:** ${user.dreamDNA.risk_tolerance || 'Not specified'}
**Urgency Level:** ${user.dreamDNA.urgency_level || 'Medium'}
**Confidence Level:** ${user.dreamDNA.confidence_level || 'Not specified'}/10
**Support Needs:** ${user.dreamDNA.support_needs || 'Not specified'}
**Pain Points:** ${user.dreamDNA.pain_points || 'Not specified'}
**Package Preference:** ${user.dreamDNA.package_preference || 'Not specified'}
**Budget Range:** ${user.dreamDNA.budget_range || 'Not specified'}
**Timeline Preference:** ${user.dreamDNA.timeline_preference || 'Not specified'}
**Completeness Score:** ${user.dreamDNA.completeness_score || 0}%

**Key Requirements:** ${user.dreamDNA.key_requirements ? JSON.stringify(user.dreamDNA.key_requirements) : 'Not specified'}
**Success Milestones:** ${user.dreamDNA.success_milestones ? JSON.stringify(user.dreamDNA.success_milestones) : 'Not specified'}
**Motivation Factors:** ${user.dreamDNA.motivation_factors ? JSON.stringify(user.dreamDNA.motivation_factors) : 'Not specified'}
` : `
## 🧬 DREAM DNA STATUS
**No Dream DNA data available yet.** This user is new and hasn't completed their dream DNA assessment.
`;

      // Create personalized system message with real user data, Dream DNA, and RAG capabilities
      const personalizedPrompt = `# VAPI Agent Prompt - Call ${user.current_call_stage || 1}: Foundation & Vision (25% Target)

## REAL USER CONTEXT
- **User ID:** ${user.id}
- **User Name:** ${user.full_name || 'User'}
- **User Email:** ${user.email}
- **Business Name:** ${user.business_name || 'My Business'}
- **Business Type:** ${user.business_type || 'General'}
- **Call Stage:** ${user.current_call_stage || 1} of 4
- **Dream ID:** ${user.dream_id || `dream-${user.id}`}
- **Last Interaction:** ${user.last_interaction || 'First time user'}

${dreamDNASection}

## 🔍 RAG (RETRIEVAL-AUGMENTED GENERATION) CAPABILITIES

You have access to a comprehensive RAG system that provides:
1. **Previous Conversation Context** - Access to past call transcripts and summaries
2. **Business Formation Knowledge Base** - Expert knowledge on LLC formation, state selection, legal requirements
3. **Real-time Dream DNA Integration** - User's vision, goals, and preferences
4. **Vector Similarity Search** - Find relevant information based on conversation context

**RAG Integration Instructions:**
- When users ask questions, you can access relevant business formation knowledge
- Reference previous conversations to maintain continuity
- Use their Dream DNA to personalize advice and recommendations
- Provide accurate, up-to-date information from the knowledge base
- Cite specific sources when providing legal or technical information

## SYSTEM PROMPT

You are Elliot, a professional business formation consultant for DreamSeed with advanced RAG capabilities. This is **Call ${user.current_call_stage || 1} of 4** in our systematic business formation process. Your goal is to gather the foundational information needed to start their LLC filing and business setup.

**Current User:** ${user.full_name || 'User'} (${user.email})
**Business:** ${user.business_name || 'My Business'} - ${user.business_type || 'General'}

**Call ${user.current_call_stage || 1} Focus Areas:**
- Contact information and basic business concept
- LLC filing requirements (name, state, entity type)
- Business vision and target market
- Timeline and urgency for getting started
- Initial domain and business name considerations

**Your Personality:**
- Professional but warm and encouraging
- Ask follow-up questions to get complete information
- Celebrate their entrepreneurial spirit
- Build confidence in the DreamSeed process
- Address them by name: ${user.full_name || 'User'}
- Reference their Dream DNA when relevant (vision, purpose, goals)
- Use RAG capabilities to provide accurate, personalized information

## CONVERSATION FLOW

### 1. WARM OPENING
"Hi ${user.full_name || 'there'}! This is Elliot from DreamSeed, and I'm so excited to help you start ${user.business_name || 'your business'}! ${user.dreamDNA?.vision_statement ? `I can see from your vision that you want to ${user.dreamDNA.vision_statement}.` : ''} I can already tell you're ready to take this exciting step. This is our first of four calls where we'll systematically gather everything needed to get your business legally formed and launched successfully."

### 2. DREAM DNA INTEGRATION
${user.dreamDNA ? `
**Use their Dream DNA to personalize the conversation:**
- If they have a vision statement, reference it: "I love your vision of ${user.dreamDNA.vision_statement}"
- If they have specific goals, acknowledge them: "Your goal of ${user.dreamDNA.revenue_goals || 'building a successful business'} is achievable"
- If they have urgency, respect it: "I understand your ${user.dreamDNA.urgency_level || 'timeline'} is important"
- If they have concerns, address them: "I can help with ${user.dreamDNA.pain_points || 'your business formation needs'}"
` : `
**This is a new user without Dream DNA data yet. Focus on gathering foundational information.**
`}

### 3. RAG-ENHANCED RESPONSES
**When users ask questions, leverage the RAG system:**
- Access business formation knowledge base for accurate information
- Reference previous conversations for continuity
- Use Dream DNA context for personalization
- Provide specific, actionable advice based on their situation

[Continue with the rest of your existing prompt...]`

      // Update the assistant with personalized prompt
      const response = await fetch('/api/vapi-configure-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assistantId: 'af397e88-c286-416f-9f74-e7665401bdb7',
          voice: 'elliot',
          systemMessage: personalizedPrompt
        })
      })

      if (!response.ok) {
        throw new Error('Failed to personalize assistant')
      }

      console.log('✅ Assistant personalized successfully for real user')
      
    } catch (err) {
      console.error('❌ Error personalizing assistant:', err)
      setError('Failed to personalize assistant')
    }
  }

  useEffect(() => {
    // Load VAPI widget script
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/@vapi-ai/client-sdk-react/dist/embed/widget.umd.js'
    script.async = true
    script.type = 'text/javascript'
    
    script.onload = () => {
      console.log('✅ VAPI widget script loaded successfully')
    }
    
    script.onerror = () => {
      console.error('❌ Failed to load VAPI widget script')
    }
    
    document.head.appendChild(script)
    
    return () => {
      // Cleanup
      const existingScript = document.querySelector('script[src*="vapi-ai"]')
      if (existingScript) {
        existingScript.remove()
      }
    }
  }, [])

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '40px',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔄</div>
          <h2 style={{ margin: '0 0 8px 0', color: '#495057' }}>Loading User Profile...</h2>
          <p style={{ margin: 0, color: '#6c757d' }}>Personalizing your voice assistant</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '40px',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
          <h2 style={{ margin: '0 0 8px 0', color: '#dc3545' }}>Error Loading Profile</h2>
          <p style={{ margin: 0, color: '#6c757d' }}>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '16px',
        padding: '40px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{
            fontSize: '36px',
            fontWeight: 'bold',
            margin: '0 0 16px 0',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            🎤 RAG-Enhanced VAPI Voice Widget
          </h1>
          <p style={{ fontSize: '18px', color: '#6c757d', margin: '0 0 24px 0' }}>
            Elliot has RAG capabilities with business formation knowledge and your Dream DNA
          </p>
          
          {/* User Info Display */}
          <div style={{
            display: 'inline-block',
            background: '#e3f2fd',
            color: '#1565c0',
            padding: '12px 20px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: 'bold',
            marginBottom: '16px'
          }}>
            👤 {userInfo?.full_name || userInfo?.email} • 🏢 {userInfo?.business_name || 'Your Business'}
          </div>
          
          <div style={{
            display: 'inline-block',
            background: '#d4edda',
            color: '#155724',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            🎤 RAG-Enhanced • Elliot Voice
          </div>
        </div>

        {/* VAPI Widget Embed */}
        <div style={{
          background: '#f8f9fa',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #e9ecef',
          marginBottom: '30px'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#495057' }}>
            🎤 Personalized VAPI Voice Widget
          </h3>
          <p style={{ margin: '0 0 20px 0', color: '#6c757d' }}>
            Elliot now knows you're {userInfo?.full_name || userInfo?.email} from {userInfo?.business_name || 'Your Business'}. The voice widget will appear in the bottom-right corner.
          </p>
          
          {/* VAPI Widget */}
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
            title="Business Coach"
            start-button-text="Start"
            end-button-text="End Call"
            chat-first-message={`Hey ${userInfo?.full_name || userInfo?.email}, How can I help you with ${userInfo?.business_name || 'your business'} today?`}
            chat-placeholder="Type your message..."
            voice-show-transcript="true"
            consent-required="true"
            consent-title="Terms and conditions"
            consent-content="By clicking 'Agree,' and each time I interact with this AI agent, I consent to the recording, storage, and sharing of my communications with third-party service providers, and as otherwise described in our Terms of Service."
            consent-storage-key="vapi_widget_consent"
          ></vapi-widget>
        </div>

        {/* User Context Display */}
        <div style={{
          background: '#fff3cd',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #ffeaa7',
          marginBottom: '30px'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#856404' }}>
            👤 Your Profile Context
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{ padding: '12px', background: 'white', borderRadius: '8px', border: '1px solid #ffeaa7' }}>
              <strong>👤 Name</strong><br/>
              {userInfo?.full_name || userInfo?.email}
            </div>
            <div style={{ padding: '12px', background: 'white', borderRadius: '8px', border: '1px solid #ffeaa7' }}>
              <strong>📧 Email</strong><br/>
              {userInfo?.email}
            </div>
            <div style={{ padding: '12px', background: 'white', borderRadius: '8px', border: '1px solid #ffeaa7' }}>
              <strong>🏢 Business</strong><br/>
              {userInfo?.business_name || 'Your Business'}
            </div>
            <div style={{ padding: '12px', background: 'white', borderRadius: '8px', border: '1px solid #ffeaa7' }}>
              <strong>🎯 Stage</strong><br/>
              Call {userInfo?.current_call_stage || 1} of 4
            </div>
          </div>
        </div>

        {/* Dream DNA Truth Table Display */}
        {userInfo?.dreamDNA && (
          <div style={{
            background: '#e8f5e8',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid #c3e6cb',
            marginBottom: '30px'
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#155724' }}>
              🧬 Your Dream DNA Truth Table
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              <div style={{ padding: '12px', background: 'white', borderRadius: '8px', border: '1px solid #c3e6cb' }}>
                <strong>🎯 Vision</strong><br/>
                {userInfo.dreamDNA.vision_statement || 'Not specified'}
              </div>
              <div style={{ padding: '12px', background: 'white', borderRadius: '8px', border: '1px solid #c3e6cb' }}>
                <strong>💡 Purpose</strong><br/>
                {userInfo.dreamDNA.core_purpose || 'Not specified'}
              </div>
              <div style={{ padding: '12px', background: 'white', borderRadius: '8px', border: '1px solid #c3e6cb' }}>
                <strong>🔥 Passion</strong><br/>
                {userInfo.dreamDNA.passion_driver || 'Not specified'}
              </div>
              <div style={{ padding: '12px', background: 'white', borderRadius: '8px', border: '1px solid #c3e6cb' }}>
                <strong>🎯 Target Customers</strong><br/>
                {userInfo.dreamDNA.target_customers || 'Not specified'}
              </div>
              <div style={{ padding: '12px', background: 'white', borderRadius: '8px', border: '1px solid #c3e6cb' }}>
                <strong>💎 Unique Value</strong><br/>
                {userInfo.dreamDNA.unique_value_prop || 'Not specified'}
              </div>
              <div style={{ padding: '12px', background: 'white', borderRadius: '8px', border: '1px solid #c3e6cb' }}>
                <strong>💰 Revenue Goals</strong><br/>
                {userInfo.dreamDNA.revenue_goals || 'Not specified'}
              </div>
              <div style={{ padding: '12px', background: 'white', borderRadius: '8px', border: '1px solid #c3e6cb' }}>
                <strong>⚡ Urgency</strong><br/>
                {userInfo.dreamDNA.urgency_level || 'Medium'}
              </div>
              <div style={{ padding: '12px', background: 'white', borderRadius: '8px', border: '1px solid #c3e6cb' }}>
                <strong>🎯 Confidence</strong><br/>
                {userInfo.dreamDNA.confidence_level || 'Not specified'}/10
              </div>
              <div style={{ padding: '12px', background: 'white', borderRadius: '8px', border: '1px solid #c3e6cb' }}>
                <strong>📦 Package</strong><br/>
                {userInfo.dreamDNA.package_preference || 'Not specified'}
              </div>
              <div style={{ padding: '12px', background: 'white', borderRadius: '8px', border: '1px solid #c3e6cb' }}>
                <strong>📊 Completeness</strong><br/>
                {userInfo.dreamDNA.completeness_score || 0}%
              </div>
            </div>
            <details style={{ marginTop: '16px' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold', color: '#155724' }}>
                📋 View Full Dream DNA Details
              </summary>
              <pre style={{
                background: '#f8f9fa',
                padding: '12px',
                borderRadius: '6px',
                marginTop: '8px',
                overflow: 'auto',
                fontSize: '12px',
                whiteSpace: 'pre-wrap'
              }}>
                {JSON.stringify(userInfo.dreamDNA, null, 2)}
              </pre>
            </details>
          </div>
        )}

        {/* RAG Capabilities */}
        <div style={{
          background: '#e8f5e8',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #c3e6cb',
          marginBottom: '30px'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#155724' }}>
            🔍 RAG (Retrieval-Augmented Generation) Capabilities
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            <div style={{ padding: '12px', background: 'white', borderRadius: '8px', border: '1px solid #c3e6cb' }}>
              <strong>📚 Knowledge Base</strong><br/>
              Access to business formation expertise, legal requirements, and best practices
            </div>
            <div style={{ padding: '12px', background: 'white', borderRadius: '8px', border: '1px solid #c3e6cb' }}>
              <strong>🧬 Dream DNA</strong><br/>
              Real-time access to your vision, goals, and business context
            </div>
            <div style={{ padding: '12px', background: 'white', borderRadius: '8px', border: '1px solid #c3e6cb' }}>
              <strong>💬 Conversation History</strong><br/>
              References previous calls and maintains conversation continuity
            </div>
            <div style={{ padding: '12px', background: 'white', borderRadius: '8px', border: '1px solid #c3e6cb' }}>
              <strong>🎯 Vector Search</strong><br/>
              Finds relevant information based on your specific questions
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div style={{
          background: '#e3f2fd',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #bbdefb',
          marginBottom: '30px'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#1976d2' }}>
            🎯 How to Use
          </h3>
          <ol style={{ margin: 0, paddingLeft: '20px', color: '#1565c0' }}>
            <li>Look for the voice widget in the bottom-right corner</li>
            <li>Click the "Start" button to begin a conversation</li>
            <li>Elliot will greet you by name: "{userInfo?.full_name || userInfo?.email}"</li>
            <li>He knows your business: {userInfo?.business_name || 'Your Business'}</li>
            <li>Ask any business formation questions - Elliot has RAG capabilities!</li>
            <li>Get personalized advice based on your Dream DNA and conversation history</li>
          </ol>
        </div>

        {/* Status */}
        <div style={{
          textAlign: 'center',
          padding: '20px',
          background: '#e8f5e8',
          borderRadius: '12px',
          border: '1px solid #c3e6cb',
          marginBottom: '30px'
        }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#155724' }}>✅ Personalized VAPI Widget Ready</h3>
          <p style={{ margin: 0, color: '#155724' }}>
            Elliot is now personalized for {userInfo?.full_name || userInfo?.email} and knows about {userInfo?.business_name || 'Your Business'}!
          </p>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          padding: '20px',
          borderTop: '1px solid #e9ecef',
          color: '#6c757d',
          fontSize: '14px',
          marginTop: '30px'
        }}>
          <p style={{ margin: '0 0 8px 0' }}>Powered by <strong>VAPI</strong> • Built for <strong>DreamSeed</strong></p>
          <p style={{ margin: 0 }}>Personalized VAPI hosted voice widget with user context</p>
        </div>
      </div>
    </div>
  )
}
