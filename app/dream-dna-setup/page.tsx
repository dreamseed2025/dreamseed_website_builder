'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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

interface DreamData {
  business_name: string
  business_type: string
  state: string
}

export default function DreamDNASetupPage() {
  const [dreamData, setDreamData] = useState<DreamData>({
    business_name: '',
    business_type: '',
    state: ''
  })
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()
  const supabase = createSupabaseClient()

  // Load user session on mount
  useEffect(() => {
    setIsClient(true)
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
      } else {
        // Allow non-authenticated users to start dreaming
        console.log('No authenticated user, allowing demo mode')
      }
    }
    getUser()
  }, [supabase.auth])

  const handleSave = async () => {
    await createDream()
  }

  const updateDreamData = (field: keyof DreamData, value: string) => {
    setDreamData(prev => ({ ...prev, [field]: value }))
  }

  const createDream = async () => {
    setLoading(true)
    try {
      console.log('🔍 Dream Data to save:', dreamData)
      
      // Validate required fields
      const requiredFields = ['business_name', 'business_type', 'state']
      const missingFields = requiredFields.filter(field => 
        !dreamData[field] || dreamData[field].trim() === ''
      )
      
      if (missingFields.length > 0) {
        console.error('❌ Missing required fields:', missingFields)
        alert(`Please complete all fields or use the voice assistant to help you fill them out.`)
        setLoading(false)
        return
      }

      // If user is authenticated, save to their profile
      if (user) {
        // Get the user's profile to get their user_id from the users table
        const { data: userProfile, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('customer_email', user.email)
          .single()

        let userId = userProfile?.id

        if (userError || !userProfile) {
          console.error('❌ Error getting user profile:', userError)
          // Create a basic user profile if it doesn't exist
          const { data: newUser, error: createError } = await supabase
            .from('users')
            .insert({
              customer_email: user.email,
              customer_name: user.user_metadata?.full_name || 'User',
              status: 'active'
            })
            .select()
            .single()

          if (createError) {
            console.error('❌ Error creating user profile:', createError)
            alert('Error creating user profile. Please try again.')
            setLoading(false)
            return
          }
          
          userId = newUser.id
        } else {
          userId = userProfile.id
        }

        // Create new dream DNA truth table record
        const dreamTruthData = {
          user_id: userId,
          dream_type: 'business_formation',
          business_name: dreamData.business_name,
          business_type: dreamData.business_type,
          registering_state: dreamData.state,
          domain: null, // Will be captured later
          confidence_score: 0.85,
          extraction_source: 'form',
          validated_by_user: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        console.log('📝 Creating dream DNA truth table record:', dreamTruthData)
        
        const { data: dreamTruthResult, error: dreamTruthError } = await supabase
          .from('dream_dna_truth')
          .insert(dreamTruthData)

        if (dreamTruthError) {
          console.error('❌ Error creating dream DNA truth record:', dreamTruthError)
          alert(`Error creating your dream: ${dreamTruthError.message}. Please try again.`)
          return
        }

        console.log('✅ Dream DNA truth table record created successfully!')
        console.log('✅ Dream data saved:', dreamTruthResult)
        
        // 🔥 NEW: Trigger automatic predictions after dream creation
        console.log('🧠 Triggering automatic predictions for new dream...')
        try {
          const response = await fetch('/api/transcript-predictions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: userId,
              predictAll: true
            })
          })
          
          if (response.ok) {
            const result = await response.json()
            console.log('✅ Automatic predictions triggered:', result)
          } else {
            console.log('⚠️ Automatic predictions failed, but dream was created successfully')
          }
        } catch (predictionError) {
          console.log('⚠️ Automatic predictions error:', predictionError)
          // Don't fail dream creation if predictions fail
        }
        
        // Redirect to user profile with success message
        router.push('/user-profile?dream-created=success')
      } else {
        // For non-authenticated users, show success and prompt to sign up
        alert('Great! Your dream business has been created. Sign up to save your progress and get personalized coaching!')
        router.push('/login?redirect=/dream-dna-setup')
      }
    } catch (error) {
      console.error('Error creating dream:', error)
      alert('Error creating your dream. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const isFormValid = () => {
    return dreamData.business_name.trim().length >= 2 &&
           dreamData.business_type.trim().length >= 2 &&
           dreamData.state.trim().length >= 2
  }

  const getCompletionPercentage = () => {
    const totalFields = 3
    const completedFields = [
      dreamData.business_name,
      dreamData.business_type,
      dreamData.state
    ].filter(field => field.trim().length >= 2).length
    
    return Math.round((completedFields / totalFields) * 100)
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
      
      <div className="container">
      {/* Header */}
      <div className="header">
        <h1>🌱 Create Your Dream Business</h1>
        <p>Tell us about your dream business in 3 simple questions</p>
        
        {/* Progress Bar */}
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${getCompletionPercentage()}%` }}
            ></div>
          </div>
          <span className="progress-text">{getCompletionPercentage()}% Complete</span>
        </div>

        <div className="voice-cta">
          <p>💬 <strong>Need help?</strong> Click the voice assistant to talk through your ideas!</p>
        </div>
      </div>

      {/* Simple Form */}
      <div className="step-content">
        <div className="step">
          <h2>Your Dream Business</h2>
          
          <div className="form-group">
            <label>🏢 Dream Business Name</label>
            <input
              type="text"
              placeholder="e.g., TechFlow Solutions, Green Earth Consulting..."
              value={dreamData.business_name}
              onChange={(e) => updateDreamData('business_name', e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>🏭 Business Type</label>
            <select
              value={dreamData.business_type}
              onChange={(e) => updateDreamData('business_type', e.target.value)}
              className="form-input"
            >
              <option value="">Select business type</option>
              <option value="LLC">LLC (Limited Liability Company)</option>
              <option value="C-Corp">C-Corporation</option>
              <option value="S-Corp">S-Corporation</option>
              <option value="Partnership">Partnership</option>
              <option value="Sole Proprietorship">Sole Proprietorship</option>
            </select>
          </div>

          <div className="form-group">
            <label>📍 What state is your company based?</label>
            <select
              value={dreamData.state}
              onChange={(e) => updateDreamData('state', e.target.value)}
              className="form-input"
            >
              <option value="">Select a state</option>
              <option value="AL">Alabama</option>
              <option value="AK">Alaska</option>
              <option value="AZ">Arizona</option>
              <option value="AR">Arkansas</option>
              <option value="CA">California</option>
              <option value="CO">Colorado</option>
              <option value="CT">Connecticut</option>
              <option value="DE">Delaware</option>
              <option value="FL">Florida</option>
              <option value="GA">Georgia</option>
              <option value="HI">Hawaii</option>
              <option value="ID">Idaho</option>
              <option value="IL">Illinois</option>
              <option value="IN">Indiana</option>
              <option value="IA">Iowa</option>
              <option value="KS">Kansas</option>
              <option value="KY">Kentucky</option>
              <option value="LA">Louisiana</option>
              <option value="ME">Maine</option>
              <option value="MD">Maryland</option>
              <option value="MA">Massachusetts</option>
              <option value="MI">Michigan</option>
              <option value="MN">Minnesota</option>
              <option value="MS">Mississippi</option>
              <option value="MO">Missouri</option>
              <option value="MT">Montana</option>
              <option value="NE">Nebraska</option>
              <option value="NV">Nevada</option>
              <option value="NH">New Hampshire</option>
              <option value="NJ">New Jersey</option>
              <option value="NM">New Mexico</option>
              <option value="NY">New York</option>
              <option value="NC">North Carolina</option>
              <option value="ND">North Dakota</option>
              <option value="OH">Ohio</option>
              <option value="OK">Oklahoma</option>
              <option value="OR">Oregon</option>
              <option value="PA">Pennsylvania</option>
              <option value="RI">Rhode Island</option>
              <option value="SC">South Carolina</option>
              <option value="SD">South Dakota</option>
              <option value="TN">Tennessee</option>
              <option value="TX">Texas</option>
              <option value="UT">Utah</option>
              <option value="VT">Vermont</option>
              <option value="VA">Virginia</option>
              <option value="WA">Washington</option>
              <option value="WV">West Virginia</option>
              <option value="WI">Wisconsin</option>
              <option value="WY">Wyoming</option>
            </select>
          </div>

          <div className="inspiration">
            <p><strong>💬 Pro tip:</strong> Use the voice assistant to talk through your business idea!</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button
          onClick={() => router.push('/')}
          className="btn-secondary"
          disabled={loading}
        >
          ← Back to Home
        </button>
        <button
          onClick={handleSave}
          className="btn-primary"
          disabled={loading || !isFormValid()}
        >
          {loading ? 'Creating Your Dream...' : 'Create Dream Business'}
        </button>
      </div>

      <style jsx>{`
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 40px 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          min-height: 100vh;
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
        }

        .header {
          text-align: center;
          margin-bottom: 40px;
        }

        .header h1 {
          color: #0c4a6e;
          font-size: 36px;
          font-weight: 700;
          margin: 0 0 10px 0;
        }

        .header p {
          color: #0369a1;
          font-size: 18px;
          margin: 0 0 20px 0;
        }

        .progress-container {
          margin: 20px 0;
          text-align: center;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 8px;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #0ea5e9 0%, #0284c7 100%);
          transition: width 0.3s ease;
        }

        .progress-text {
          font-size: 14px;
          color: #6b7280;
          font-weight: 500;
        }

        .voice-cta {
          background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
          color: white;
          padding: 15px 20px;
          border-radius: 12px;
          margin-top: 20px;
          box-shadow: 0 4px 15px rgba(14, 165, 233, 0.3);
        }

        .voice-cta p {
          margin: 0;
          font-size: 16px;
        }

        .step-content {
          background: white;
          padding: 40px;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(14, 165, 233, 0.1);
          margin-bottom: 30px;
          border: 1px solid #e0f2fe;
        }

        .step h2 {
          color: #0c4a6e;
          font-size: 28px;
          font-weight: 600;
          margin: 0 0 30px 0;
          text-align: center;
        }

        .form-group {
          margin-bottom: 30px;
        }

        .form-group label {
          display: block;
          color: #374151;
          font-weight: 600;
          margin-bottom: 8px;
          font-size: 16px;
        }

        .form-input {
          width: 100%;
          padding: 16px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 16px;
          transition: all 0.2s;
          font-family: inherit;
        }

        .form-input:focus {
          outline: none;
          border-color: #0ea5e9;
          box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
        }

        .inspiration {
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          border: 2px solid #0ea5e9;
          border-radius: 12px;
          padding: 20px;
          margin-top: 30px;
          text-align: center;
        }

        .inspiration p {
          margin: 0;
          color: #0c4a6e;
          font-weight: 500;
          font-size: 16px;
        }

        .action-buttons {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 20px;
        }

        .btn-primary, .btn-secondary {
          padding: 14px 28px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .btn-primary {
          background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
          color: white;
          flex: 1;
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(14, 165, 233, 0.3);
        }

        .btn-primary:disabled {
          background: #9ca3af;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .btn-secondary {
          background: #f8f9fa;
          color: #6b7280;
          border: 2px solid #e5e7eb;
        }

        .btn-secondary:hover {
          background: #e5e7eb;
          border-color: #d1d5db;
        }

        @media (max-width: 768px) {
          .container {
            padding: 20px 15px;
          }

          .step-content {
            padding: 25px;
          }

          .header h1 {
            font-size: 28px;
          }

          .action-buttons {
            flex-direction: column;
          }
        }
      `}</style>

      {/* VAPI Widget - Enhanced for Dream Creation */}
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
          title="Your Dream Business Coach"
          start-button-text="Start Coaching"
          end-button-text="End Session"
          chat-first-message={`Hey! I'm Elliot, your dream business coach. 🌱

I can see you're creating your dream business! Let me help you with these 3 simple questions:

🏢 What's your dream business name?
🏭 What industry are you in?
📍 What state will your company be based in?

Tell me about your business idea and I'll help you get started!`}
          chat-placeholder="Tell me about your business idea..."
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