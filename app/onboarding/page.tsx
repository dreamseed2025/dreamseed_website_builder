'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase'

interface PersonalData {
  customer_name: string
  customer_email: string
  customer_phone: string
  state_of_operation: string
  urgency_level: string
  timeline: string
}

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [personalData, setPersonalData] = useState<PersonalData>({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    state_of_operation: '',
    urgency_level: 'Medium',
    timeline: ''
  })
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createSupabaseClient()

  const totalSteps = 3

  // Load user session on mount
  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        setPersonalData(prev => ({
          ...prev,
          customer_email: session.user.email || ''
        }))
      } else {
        // Redirect to login if not authenticated
        router.push('/login')
      }
    }
    getUser()
  }, [supabase.auth, router])

  const handleNext = async () => {
    if (step < totalSteps) {
      setStep(step + 1)
    } else {
      // Save to truth table and move to dream DNA
      await savePersonalData()
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const updatePersonalData = (field: keyof PersonalData, value: string) => {
    setPersonalData(prev => ({ ...prev, [field]: value }))
  }

  const savePersonalData = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Create or update user record in truth table
      const { data, error } = await supabase
        .from('users')
        .upsert({
          customer_name: personalData.customer_name,
          customer_email: personalData.customer_email,
          customer_phone: personalData.customer_phone,
          state_of_operation: personalData.state_of_operation,
          urgency_level: personalData.urgency_level,
          timeline: personalData.timeline,
          call_1_completed: false,
          current_call_stage: 1,
          status: 'onboarding_complete',
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'customer_email'
        })

      if (error) {
        console.error('Error saving personal data:', error)
        alert('Error saving your information. Please try again.')
        return
      }

      // Move to dream DNA collection
      router.push('/dream-dna-setup')
    } catch (error) {
      console.error('Error saving personal data:', error)
      alert('Error saving your information. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const isStepValid = () => {
    switch (step) {
      case 1:
        return personalData.customer_name.trim().length >= 2 && 
               personalData.customer_email.trim().includes('@')
      case 2:
        return personalData.customer_phone.trim().length >= 10 && 
               personalData.state_of_operation.trim() && 
               personalData.state_of_operation !== ''
      case 3:
        return personalData.urgency_level.trim() && 
               personalData.urgency_level !== '' &&
               personalData.timeline.trim() && 
               personalData.timeline !== ''
      default:
        return false
    }
  }

  if (!user) {
    return (
      <div className="container">
        <div className="loading">Loading...</div>
      </div>
    )
  }

  return (
    <div className="container">
      {/* Progress Bar */}
      <div className="progress-section">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          ></div>
        </div>
        <p className="progress-text">Step {step} of {totalSteps}</p>
      </div>

      {/* Header */}
      <div className="header">
        <h1>👋 Welcome to DreamSeed!</h1>
        <p>Let's get to know you better so we can personalize your experience</p>
      </div>

      {/* Step Content */}
      <div className="step-content">
        {step === 1 && (
          <div className="step">
            <h2>Tell us about yourself</h2>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="e.g., John Smith"
                value={personalData.customer_name}
                onChange={(e) => updatePersonalData('customer_name', e.target.value)}
                className="form-input"
                required
                minLength={2}
              />
              {personalData.customer_name.length > 0 && personalData.customer_name.trim().length < 2 && (
                <p className="error-text">Name must be at least 2 characters</p>
              )}
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="your@email.com"
                value={personalData.customer_email}
                onChange={(e) => updatePersonalData('customer_email', e.target.value)}
                className="form-input"
                disabled={!!user.email}
              />
              {user.email && (
                <p className="help-text">Email verified from your account</p>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="step">
            <h2>Contact & Location</h2>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                placeholder="(555) 123-4567"
                value={personalData.customer_phone}
                onChange={(e) => updatePersonalData('customer_phone', e.target.value)}
                className="form-input"
                required
                minLength={10}
              />
              {personalData.customer_phone.length > 0 && personalData.customer_phone.trim().length < 10 && (
                <p className="error-text">Please enter a valid phone number (at least 10 digits)</p>
              )}
              <p className="help-text">We'll use this for important updates about your business formation</p>
            </div>
            <div className="form-group">
              <label>State/Location</label>
              <select
                value={personalData.state_of_operation}
                onChange={(e) => updatePersonalData('state_of_operation', e.target.value)}
                className="form-select"
              >
                <option value="">Select your state</option>
                <option value="CA">California</option>
                <option value="NY">New York</option>
                <option value="TX">Texas</option>
                <option value="FL">Florida</option>
                <option value="DE">Delaware</option>
                <option value="NV">Nevada</option>
                <option value="WA">Washington</option>
                <option value="OR">Oregon</option>
                <option value="CO">Colorado</option>
                <option value="Other">Other</option>
              </select>
              <p className="help-text">This helps us understand the legal requirements for your location</p>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="step">
            <h2>Your Timeline & Urgency</h2>
            <div className="form-group">
              <label>How urgent is starting your business?</label>
              <div className="urgency-options">
                {[
                  { value: 'Low', name: 'Low - Taking my time', description: 'No rush, planning for the future' },
                  { value: 'Medium', name: 'Medium - Steady progress', description: 'Moving forward at a comfortable pace' },
                  { value: 'High', name: 'High - Ready to launch', description: 'Eager to get started soon' },
                  { value: 'Urgent', name: 'Urgent - Need to start ASAP', description: 'Time-sensitive opportunity' }
                ].map((urgency) => (
                  <div
                    key={urgency.value}
                    className={`urgency-option ${personalData.urgency_level === urgency.value ? 'selected' : ''}`}
                    onClick={() => updatePersonalData('urgency_level', urgency.value)}
                  >
                    <div className="urgency-name">{urgency.name}</div>
                    <div className="urgency-description">{urgency.description}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Ideal Timeline</label>
              <select
                value={personalData.timeline}
                onChange={(e) => updatePersonalData('timeline', e.target.value)}
                className="form-select"
              >
                <option value="">Select your timeline</option>
                <option value="Within 1 month">Within 1 month</option>
                <option value="1-3 months">1-3 months</option>
                <option value="3-6 months">3-6 months</option>
                <option value="6-12 months">6-12 months</option>
                <option value="More than 1 year">More than 1 year</option>
                <option value="Just exploring">Just exploring options</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="navigation">
        {step > 1 && (
          <button onClick={handleBack} className="btn-secondary">
            ← Back
          </button>
        )}
        <button 
          onClick={handleNext} 
          disabled={!isStepValid() || loading}
          className="btn-primary"
        >
          {loading ? 'Saving...' : step === totalSteps ? 'Continue to Dream DNA →' : 'Continue →'}
        </button>
      </div>

      {/* Footer */}
      <div className="footer">
        <p>Next: We'll explore your business vision and goals</p>
      </div>

      <style jsx>{`
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 40px 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          min-height: 100vh;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        }

        .loading {
          text-align: center;
          padding: 100px 20px;
          font-size: 18px;
          color: #6b7280;
        }

        .progress-section {
          margin-bottom: 40px;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: #e9ecef;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 10px;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #2563eb, #3b82f6);
          transition: width 0.3s ease;
        }

        .progress-text {
          text-align: center;
          color: #6b7280;
          font-size: 14px;
          margin: 0;
        }

        .header {
          text-align: center;
          margin-bottom: 40px;
        }

        .header h1 {
          color: #1f2937;
          font-size: 32px;
          font-weight: 700;
          margin: 0 0 10px 0;
        }

        .header p {
          color: #6b7280;
          font-size: 18px;
          margin: 0;
        }

        .step-content {
          background: white;
          padding: 40px;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          margin-bottom: 30px;
        }

        .step h2 {
          color: #1f2937;
          font-size: 24px;
          font-weight: 600;
          margin: 0 0 30px 0;
          text-align: center;
        }

        .form-group {
          margin-bottom: 25px;
        }

        .form-group label {
          display: block;
          color: #374151;
          font-weight: 500;
          margin-bottom: 8px;
        }

        .form-input, .form-select {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 16px;
          transition: border-color 0.2s;
          font-family: inherit;
        }

        .form-input:focus, .form-select:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .form-input:disabled {
          background: #f3f4f6;
          color: #6b7280;
        }

        .help-text {
          margin: 8px 0 0 0;
          font-size: 14px;
          color: #6b7280;
          font-style: italic;
        }

        .error-text {
          margin: 8px 0 0 0;
          font-size: 14px;
          color: #dc2626;
          font-weight: 500;
        }

        .urgency-options {
          display: grid;
          gap: 12px;
        }

        .urgency-option {
          padding: 16px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .urgency-option:hover {
          border-color: #2563eb;
          background: #f8fafc;
        }

        .urgency-option.selected {
          border-color: #2563eb;
          background: #eff6ff;
        }

        .urgency-name {
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 4px;
        }

        .urgency-description {
          font-size: 14px;
          color: #6b7280;
        }

        .navigation {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 20px;
        }

        .btn-primary, .btn-secondary {
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .btn-primary {
          background: #2563eb;
          color: white;
          flex: 1;
        }

        .btn-primary:hover:not(:disabled) {
          background: #1d4ed8;
          transform: translateY(-1px);
        }

        .btn-primary:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: #f8f9fa;
          color: #6b7280;
          border: 1px solid #e5e7eb;
        }

        .btn-secondary:hover {
          background: #e5e7eb;
        }

        .footer {
          text-align: center;
          padding: 20px;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 8px;
        }

        .footer p {
          color: #6b7280;
          margin: 0;
          font-size: 14px;
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
        }
      `}</style>
    </div>
  )
}