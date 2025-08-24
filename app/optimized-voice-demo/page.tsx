'use client'
import React, { useEffect, useState } from 'react'

export default function OptimizedVoiceDemo() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [userContext, setUserContext] = useState(null)

  useEffect(() => {
    // Load user context first
    loadUserContext()
  }, [])

  useEffect(() => {
    if (!userContext) return // Wait for user context

    // Check if script already exists
    const existingScript = document.querySelector('script[src="https://unpkg.com/@vapi-ai/client-sdk-react/dist/embed/widget.umd.js"]')
    
    if (existingScript) {
      // Script already loaded, initialize widget directly
      initializeWidget()
      return
    }

    // Load VAPI widget script
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/@vapi-ai/client-sdk-react/dist/embed/widget.umd.js'
    script.async = true
    script.type = 'text/javascript'
    script.onload = initializeWidget
    script.onerror = () => {
      console.error('Failed to load VAPI widget script')
      setIsLoaded(false)
    }
    
    document.head.appendChild(script)

    function initializeWidget() {
      const widgetContainer = document.getElementById('vapi-widget-container')
      if (widgetContainer) {
        // Clear any existing content
        widgetContainer.innerHTML = ''
        
        const vapiWidget = document.createElement('vapi-widget')
        vapiWidget.setAttribute('assistant-id', 'af397e88-c286-416f-9f74-e7665401bdb7')
        vapiWidget.setAttribute('public-key', '360c27df-9f83-4b80-bd33-e17dbcbf4971')
        vapiWidget.setAttribute('voice', 'elliot')
        vapiWidget.setAttribute('mode', 'voice')
        vapiWidget.setAttribute('theme', 'dark')
        vapiWidget.setAttribute('base-bg-color', '#000000')
        vapiWidget.setAttribute('accent-color', '#76001b')
        vapiWidget.setAttribute('cta-button-color', '#000000')
        vapiWidget.setAttribute('cta-button-text-color', '#ffffff')
        vapiWidget.setAttribute('border-radius', 'large')
        vapiWidget.setAttribute('size', 'full')
        vapiWidget.setAttribute('position', 'bottom-right')
        vapiWidget.setAttribute('title', 'Business Coach')
        vapiWidget.setAttribute('start-button-text', 'Start')
        vapiWidget.setAttribute('end-button-text', 'End Call')
        vapiWidget.setAttribute('chat-first-message', 'Hey, How can I help you today?')
        vapiWidget.setAttribute('chat-placeholder', 'Type your message...')
        vapiWidget.setAttribute('voice-show-transcript', 'true')
        vapiWidget.setAttribute('consent-required', 'true')
        vapiWidget.setAttribute('consent-title', 'Terms and conditions')
        vapiWidget.setAttribute('consent-content', 'By clicking "Agree," and each time I interact with this AI agent, I consent to the recording, storage, and sharing of my communications with third-party service providers, and as otherwise described in our Terms of Service.')
        vapiWidget.setAttribute('consent-storage-key', 'vapi_widget_consent')
        
        // Add user context as client variables
        if (userContext) {
          const contextualMessage = getContextualMessage(userContext)
          vapiWidget.setAttribute('chat-first-message', contextualMessage)
          
          // Pass client variables to VAPI for assistant context
          vapiWidget.setAttribute('client-variables', JSON.stringify({
            user_id: userContext.user_id,
            current_step: userContext.current_step,
            business_type: userContext.business_type,
            business_name: userContext.business_name || 'Your Business',
            completed_calls: userContext.completed_calls || 0,
            dream_dna_data: userContext.dream_dna_data || {},
            session_timestamp: new Date().toISOString()
          }))
          
          console.log('🎯 VAPI widget configured with user context:', userContext.current_step)
        }
        
        widgetContainer.appendChild(vapiWidget)
        setIsLoaded(true)
      }
    }

    // Cleanup function
    return () => {
      // Clear widget container
      const widgetContainer = document.getElementById('vapi-widget-container')
      if (widgetContainer) {
        widgetContainer.innerHTML = ''
      }
      setIsLoaded(false)
    }
  }, [userContext])

  async function loadUserContext() {
    try {
      // Check URL parameters for test context
      const urlParams = new URLSearchParams(window.location.search)
      const testStep = urlParams.get('step')
      const testType = urlParams.get('type')
      const testName = urlParams.get('name')
      
      if (testStep) {
        // Use test context API
        const testUrl = `/api/test-context?step=${testStep}&type=${testType || 'new'}&name=${encodeURIComponent(testName || 'Test Business')}`
        const testResponse = await fetch(testUrl)
        if (testResponse.ok) {
          const testContext = await testResponse.json()
          setUserContext(testContext)
          console.log('🧪 Test context loaded:', testContext)
          return
        }
      }

      // Try to get user context from session or API
      const response = await fetch('/api/user-context')
      if (response.ok) {
        const context = await response.json()
        setUserContext(context)
        console.log('✅ User context loaded:', context)
      } else {
        // Fallback to demo context
        const demoContext = {
          user_id: 'demo-user',
          current_step: 2,
          business_type: 'new',
          business_name: 'Demo Dream Business',
          completed_calls: 1,
          dream_dna_data: {
            what_problem: 'Helping entrepreneurs start their dream businesses',
            who_serves: 'Aspiring business owners and entrepreneurs',
            stage: 'ideation'
          }
        }
        setUserContext(demoContext)
        console.log('📋 Using demo context for VAPI')
      }
    } catch (error) {
      console.error('⚠️ Failed to load user context:', error)
      // Use minimal fallback
      setUserContext({ user_id: 'anonymous', current_step: 1, business_type: 'unknown' })
    }
  }

  function getContextualMessage(context) {
    const stepMessages = {
      1: `Hey there! I'm Elliot, your business formation coach. I see you're just getting started with ${context.business_type === 'new' ? 'your new business idea' : 'formalizing your existing business'}. Let's dive into your business concept together!`,
      2: `Welcome back! I'm excited to continue our conversation about ${context.business_name || 'your business'}. We're in step 2 of your business formation journey. How are things progressing?`,
      3: `Hi again! We're making great progress on ${context.business_name || 'your business'}. You're in step 3 now - let's focus on the business structure and formation details.`,
      4: `Fantastic! We're at the final step for ${context.business_name || 'your business'}. Let's get everything ready to officially launch your dream business!`
    }

    const step = context.current_step || 1
    return stepMessages[step] || stepMessages[1]
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
            🎤 VAPI Elliot Voice Assistant
          </h1>
          <p style={{ fontSize: '18px', color: '#6c757d', margin: '0 0 24px 0' }}>
            Real VAPI Elliot voice with your custom widget configuration
          </p>
          {userContext && (
            <div style={{
              display: 'inline-block',
              background: '#e8f5e8',
              color: '#155724',
              padding: '12px 20px',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: 'bold',
              marginBottom: '16px'
            }}>
              📍 Step {userContext.current_step} of 4: {userContext.business_type === 'new' ? 'New Business' : 'Existing Business'}
              {userContext.business_name && ` - ${userContext.business_name}`}
            </div>
          )}
          <div style={{
            display: 'inline-block',
            background: '#d4edda',
            color: '#155724',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            🎤 Real VAPI Elliot Voice
          </div>
        </div>

        {/* VAPI Widget Container */}
        <div id="vapi-widget-container" style={{ 
          minHeight: '400px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: '#f8f9fa',
          borderRadius: '12px',
          border: '2px dashed #dee2e6'
        }}>
          {!isLoaded && (
            <div style={{ textAlign: 'center', color: '#6c757d' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎤</div>
              <p><strong>Loading VAPI Widget...</strong></p>
              <p style={{ fontSize: '14px', marginTop: '8px' }}>
                Elliot voice with your custom configuration
              </p>
            </div>
          )}
        </div>


        {/* Information Section */}
        <div style={{ marginTop: '40px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#495057' }}>
            🎤 Real VAPI Elliot Voice Features
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
            <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#495057' }}>🎤 Voice Quality</h4>
              <p style={{ margin: 0, fontSize: '14px', color: '#6c757d' }}>Real VAPI Elliot voice</p>
            </div>
            <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#495057' }}>🎨 Custom Styling</h4>
              <p style={{ margin: 0, fontSize: '14px', color: '#6c757d' }}>Dark theme with red accents</p>
            </div>
            <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#495057' }}>🏢 Business Formation</h4>
              <p style={{ margin: 0, fontSize: '14px', color: '#6c757d' }}>4-stage system integration</p>
            </div>
          </div>
        </div>

        {/* Ready Message */}
        <div style={{ textAlign: 'center', padding: '20px', background: '#e8f5e8', borderRadius: '12px', border: '1px solid #c3e6cb', marginTop: '40px' }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#155724' }}>✅ Real VAPI Elliot Voice Ready</h3>
          <p style={{ margin: 0, color: '#155724' }}>The real VAPI Elliot voice assistant is ready! Uses your custom configuration with dark theme and red accents.</p>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', padding: '20px', borderTop: '1px solid #e9ecef', color: '#6c757d', fontSize: '14px', marginTop: '40px' }}>
          <p style={{ margin: '0 0 8px 0' }}>Powered by <strong>VAPI</strong> • Built for <strong>DreamSeed</strong></p>
          <p style={{ margin: 0 }}>Real VAPI Elliot voice with custom widget configuration</p>
        </div>
      </div>
    </div>
  )
}
