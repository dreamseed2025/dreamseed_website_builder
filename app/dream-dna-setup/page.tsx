'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase'

interface DreamDNAData {
  vision_statement: string
  core_purpose: string
  business_concept: string
  target_customers: string
  unique_value_prop: string
  passion_driver: string
  lifestyle_goals: string
  revenue_goals: string
  risk_tolerance: string
  confidence_level: number
}

export default function DreamDNASetupPage() {
  const [step, setStep] = useState(1)
  const [dreamData, setDreamData] = useState<DreamDNAData>({
    vision_statement: '',
    core_purpose: '',
    business_concept: '',
    target_customers: '',
    unique_value_prop: '',
    passion_driver: '',
    lifestyle_goals: '',
    revenue_goals: '',
    risk_tolerance: 'Medium',
    confidence_level: 5
  })
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createSupabaseClient()

  const totalSteps = 4

  // Load user session on mount
  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
      } else {
        router.push('/login')
      }
    }
    getUser()
  }, [supabase.auth, router])

  const handleNext = async () => {
    if (step < totalSteps) {
      setStep(step + 1)
    } else {
      await saveDreamDNA()
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const updateDreamData = (field: keyof DreamDNAData, value: string | number) => {
    setDreamData(prev => ({ ...prev, [field]: value }))
  }

  const saveDreamDNA = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Create dream DNA record
      const { data, error } = await supabase
        .from('dream_dna')
        .upsert({
          user_id: user.id,
          vision_statement: dreamData.vision_statement,
          core_purpose: dreamData.core_purpose,
          business_concept: dreamData.business_concept,
          target_customers: dreamData.target_customers,
          unique_value_prop: dreamData.unique_value_prop,
          passion_driver: dreamData.passion_driver,
          lifestyle_goals: dreamData.lifestyle_goals,
          revenue_goals: dreamData.revenue_goals,
          risk_tolerance: dreamData.risk_tolerance,
          confidence_level: dreamData.confidence_level,
          completeness_score: calculateCompleteness(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })

      if (error) {
        console.error('Error saving dream DNA:', error)
        alert('Error saving your information. Please try again.')
        return
      }

      // Redirect to business setup with completed onboarding
      router.push('/business-setup?source=dream-dna')
    } catch (error) {
      console.error('Error saving dream DNA:', error)
      alert('Error saving your information. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const calculateCompleteness = () => {
    const fields = Object.values(dreamData)
    const completedFields = fields.filter(field => 
      field !== '' && field !== null && field !== undefined
    ).length
    return Math.round((completedFields / fields.length) * 100)
  }

  const isStepValid = () => {
    switch (step) {
      case 1:
        return dreamData.vision_statement.trim().length >= 20 && 
               dreamData.core_purpose.trim().length >= 20
      case 2:
        return dreamData.business_concept.trim().length >= 30 && 
               dreamData.target_customers.trim().length >= 20
      case 3:
        return dreamData.unique_value_prop.trim().length >= 20 && 
               dreamData.passion_driver.trim().length >= 15
      case 4:
        return dreamData.lifestyle_goals.trim().length >= 15 && 
               dreamData.confidence_level > 0 && 
               dreamData.risk_tolerance.trim() &&
               dreamData.revenue_goals.trim()
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
        <h1>🧬 Your Dream DNA</h1>
        <p>Let's capture the essence of your business vision and what drives you</p>
      </div>

      {/* Step Content */}
      <div className="step-content">
        {step === 1 && (
          <div className="step">
            <h2>Your Vision & Purpose</h2>
            <div className="form-group">
              <label>Vision Statement</label>
              <textarea
                placeholder="Describe your big picture vision. What impact do you want to make? What does success look like?"
                value={dreamData.vision_statement}
                onChange={(e) => updateDreamData('vision_statement', e.target.value)}
                className="form-textarea"
                rows={3}
              />
            </div>
            <div className="form-group">
              <label>Core Purpose</label>
              <textarea
                placeholder="Why does this business matter to you? What deeper purpose drives you beyond just making money?"
                value={dreamData.core_purpose}
                onChange={(e) => updateDreamData('core_purpose', e.target.value)}
                className="form-textarea"
                rows={3}
              />
            </div>
            <div className="inspiration">
              <h4>💡 Think about:</h4>
              <ul>
                <li>What change do you want to create in the world?</li>
                <li>What legacy do you want to leave?</li>
                <li>What gets you excited about this business?</li>
              </ul>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="step">
            <h2>Business Concept & Market</h2>
            <div className="form-group">
              <label>Business Concept</label>
              <textarea
                placeholder="Describe your business idea in detail. What exactly will you do? How will it work?"
                value={dreamData.business_concept}
                onChange={(e) => updateDreamData('business_concept', e.target.value)}
                className="form-textarea"
                rows={4}
              />
            </div>
            <div className="form-group">
              <label>Target Customers</label>
              <textarea
                placeholder="Who are your ideal customers? Be specific about demographics, needs, and pain points."
                value={dreamData.target_customers}
                onChange={(e) => updateDreamData('target_customers', e.target.value)}
                className="form-textarea"
                rows={3}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="step">
            <h2>Value & Motivation</h2>
            <div className="form-group">
              <label>Unique Value Proposition</label>
              <textarea
                placeholder="What makes your business unique? Why would customers choose you over competitors?"
                value={dreamData.unique_value_prop}
                onChange={(e) => updateDreamData('unique_value_prop', e.target.value)}
                className="form-textarea"
                rows={3}
              />
            </div>
            <div className="form-group">
              <label>Passion Driver</label>
              <textarea
                placeholder="What about this business excites you most? What keeps you motivated even when things get tough?"
                value={dreamData.passion_driver}
                onChange={(e) => updateDreamData('passion_driver', e.target.value)}
                className="form-textarea"
                rows={3}
              />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="step">
            <h2>Goals & Confidence</h2>
            <div className="form-group">
              <label>Lifestyle Goals</label>
              <textarea
                placeholder="How do you want this business to fit into your life? What lifestyle are you trying to create?"
                value={dreamData.lifestyle_goals}
                onChange={(e) => updateDreamData('lifestyle_goals', e.target.value)}
                className="form-textarea"
                rows={3}
              />
            </div>
            <div className="form-group">
              <label>Revenue Goals</label>
              <input
                type="text"
                placeholder="e.g., $100k in first year, $1M by year 3"
                value={dreamData.revenue_goals}
                onChange={(e) => updateDreamData('revenue_goals', e.target.value)}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Risk Tolerance</label>
              <div className="risk-options">
                {[
                  { value: 'Low', description: 'Prefer safe, proven approaches' },
                  { value: 'Medium', description: 'Balanced approach with calculated risks' },
                  { value: 'High', description: 'Comfortable with bold moves and uncertainty' }
                ].map((risk) => (
                  <div
                    key={risk.value}
                    className={`risk-option ${dreamData.risk_tolerance === risk.value ? 'selected' : ''}`}
                    onClick={() => updateDreamData('risk_tolerance', risk.value)}
                  >
                    <div className="risk-name">{risk.value} Risk</div>
                    <div className="risk-description">{risk.description}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Confidence Level (1-10)</label>
              <div className="confidence-slider">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={dreamData.confidence_level}
                  onChange={(e) => updateDreamData('confidence_level', parseInt(e.target.value))}
                  className="slider"
                />
                <div className="confidence-display">
                  <span>{dreamData.confidence_level}/10</span>
                  <span className="confidence-label">
                    {dreamData.confidence_level <= 3 ? 'Building confidence' :
                     dreamData.confidence_level <= 6 ? 'Getting there' :
                     dreamData.confidence_level <= 8 ? 'Pretty confident' : 'Very confident'}
                  </span>
                </div>
              </div>
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
          {loading ? 'Saving...' : step === totalSteps ? 'Complete Setup →' : 'Continue →'}
        </button>
      </div>

      {/* Footer */}
      <div className="footer">
        <p>
          {step === totalSteps ? 
            'Almost done! Next we\'ll help you build your business plan.' :
            'Your Dream DNA helps us personalize your entire experience'}
        </p>
      </div>

      <style jsx>{`
        .container {
          max-width: 700px;
          margin: 0 auto;
          padding: 40px 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          min-height: 100vh;
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
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
          background: #e0f2fe;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 10px;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #0ea5e9, #0284c7);
          transition: width 0.3s ease;
        }

        .progress-text {
          text-align: center;
          color: #0369a1;
          font-size: 14px;
          margin: 0;
          font-weight: 500;
        }

        .header {
          text-align: center;
          margin-bottom: 40px;
        }

        .header h1 {
          color: #0c4a6e;
          font-size: 32px;
          font-weight: 700;
          margin: 0 0 10px 0;
        }

        .header p {
          color: #0369a1;
          font-size: 18px;
          margin: 0;
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

        .form-input, .form-textarea {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 16px;
          transition: border-color 0.2s;
          font-family: inherit;
          resize: vertical;
        }

        .form-input:focus, .form-textarea:focus {
          outline: none;
          border-color: #0ea5e9;
          box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
        }

        .form-textarea {
          min-height: 80px;
          line-height: 1.5;
        }

        .inspiration {
          background: #f0f9ff;
          border: 1px solid #0ea5e9;
          border-radius: 8px;
          padding: 20px;
          margin-top: 20px;
        }

        .inspiration h4 {
          color: #0c4a6e;
          margin: 0 0 10px 0;
          font-size: 16px;
        }

        .inspiration ul {
          margin: 0;
          padding-left: 20px;
          color: #0369a1;
        }

        .inspiration li {
          margin-bottom: 5px;
        }

        .risk-options {
          display: grid;
          gap: 12px;
        }

        .risk-option {
          padding: 16px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .risk-option:hover {
          border-color: #0ea5e9;
          background: #f8fafc;
        }

        .risk-option.selected {
          border-color: #0ea5e9;
          background: #f0f9ff;
        }

        .risk-name {
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 4px;
        }

        .risk-description {
          font-size: 14px;
          color: #6b7280;
        }

        .confidence-slider {
          margin-top: 10px;
        }

        .slider {
          width: 100%;
          height: 8px;
          border-radius: 4px;
          background: #e5e7eb;
          outline: none;
          margin-bottom: 15px;
        }

        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #0ea5e9;
          cursor: pointer;
        }

        .confidence-display {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .confidence-display span:first-child {
          font-size: 18px;
          font-weight: 600;
          color: #0ea5e9;
        }

        .confidence-label {
          font-size: 14px;
          color: #6b7280;
          font-style: italic;
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
          background: #0ea5e9;
          color: white;
          flex: 1;
        }

        .btn-primary:hover:not(:disabled) {
          background: #0284c7;
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
          border: 1px solid #e0f2fe;
        }

        .footer p {
          color: #0369a1;
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