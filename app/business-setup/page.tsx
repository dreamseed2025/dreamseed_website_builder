'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface BusinessData {
  businessName: string
  businessType: string
  industry: string
  description: string
  targetCustomers: string
  state: string
  entityType: string
}

export default function BusinessSetup() {
  const [step, setStep] = useState(1)
  const [businessData, setBusinessData] = useState<BusinessData>({
    businessName: '',
    businessType: '',
    industry: '',
    description: '',
    targetCustomers: '',
    state: '',
    entityType: 'LLC'
  })
  const router = useRouter()

  const totalSteps = 4

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    } else {
      // Save data and move to domain assistant
      sessionStorage.setItem('businessSetup', JSON.stringify(businessData))
      
      // Check if coming from dream DNA setup
      const urlParams = new URLSearchParams(window.location.search)
      const source = urlParams.get('source')
      
      if (source === 'dream-dna') {
        router.push('/voice-domain-assistant?onboarding=complete')
      } else {
        router.push('/voice-domain-assistant?onboarding=true')
      }
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const updateBusinessData = (field: keyof BusinessData, value: string) => {
    setBusinessData(prev => ({ ...prev, [field]: value }))
  }

  const isStepValid = () => {
    switch (step) {
      case 1:
        return businessData.businessName.trim() && businessData.businessType.trim()
      case 2:
        return businessData.industry.trim() && businessData.description.trim()
      case 3:
        return businessData.targetCustomers.trim()
      case 4:
        return businessData.state.trim() && businessData.entityType.trim()
      default:
        return false
    }
  }

  return (
    <div className="setup-container">
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
        <div className="header-top">
          <div>
            <h1>🚀 Let's Build Your Dream Business</h1>
            <p>Tell us about your business idea and we'll help you bring it to life</p>
          </div>
          <button onClick={() => router.push('/')} className="back-btn">
            ← Back to Home
          </button>
        </div>
      </div>

      {/* Step Content */}
      <div className="step-content">
        {step === 1 && (
          <div className="step">
            <h2>What's your business about?</h2>
            <div className="form-group">
              <label>Business Name</label>
              <input
                type="text"
                placeholder="e.g., TechStart Solutions"
                value={businessData.businessName}
                onChange={(e) => updateBusinessData('businessName', e.target.value)}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Business Type</label>
              <select
                value={businessData.businessType}
                onChange={(e) => updateBusinessData('businessType', e.target.value)}
                className="form-select"
              >
                <option value="">Select your business type</option>
                <option value="Consulting">Consulting</option>
                <option value="E-commerce">E-commerce</option>
                <option value="SaaS">Software as a Service</option>
                <option value="Restaurant">Restaurant/Food Service</option>
                <option value="Retail">Retail</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Education">Education/Training</option>
                <option value="Marketing">Marketing/Advertising</option>
                <option value="Real Estate">Real Estate</option>
                <option value="Professional Services">Professional Services</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="step">
            <h2>Tell us more about your vision</h2>
            <div className="form-group">
              <label>Industry Focus</label>
              <input
                type="text"
                placeholder="e.g., AI-powered software, fitness, fintech"
                value={businessData.industry}
                onChange={(e) => updateBusinessData('industry', e.target.value)}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Business Description</label>
              <textarea
                placeholder="Describe what your business does and what makes it unique..."
                value={businessData.description}
                onChange={(e) => updateBusinessData('description', e.target.value)}
                className="form-textarea"
                rows={4}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="step">
            <h2>Who are your customers?</h2>
            <div className="form-group">
              <label>Target Customers</label>
              <textarea
                placeholder="e.g., Small to medium businesses looking for custom software solutions..."
                value={businessData.targetCustomers}
                onChange={(e) => updateBusinessData('targetCustomers', e.target.value)}
                className="form-textarea"
                rows={4}
              />
            </div>
            <div className="tips">
              <h4>💡 Think about:</h4>
              <ul>
                <li>What size companies do you serve?</li>
                <li>What industries are you targeting?</li>
                <li>What problems do you solve for them?</li>
              </ul>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="step">
            <h2>Legal structure & location</h2>
            <div className="form-group">
              <label>Business Entity Type</label>
              <div className="entity-options">
                {[
                  { value: 'LLC', name: 'LLC (Limited Liability Company)', description: 'Popular choice for small businesses' },
                  { value: 'Corporation', name: 'Corporation', description: 'Best for raising investment' },
                  { value: 'Partnership', name: 'Partnership', description: 'For businesses with multiple owners' },
                  { value: 'Sole Proprietorship', name: 'Sole Proprietorship', description: 'Simplest option for individual owners' }
                ].map((entity) => (
                  <div
                    key={entity.value}
                    className={`entity-option ${businessData.entityType === entity.value ? 'selected' : ''}`}
                    onClick={() => updateBusinessData('entityType', entity.value)}
                  >
                    <div className="entity-name">{entity.name}</div>
                    <div className="entity-description">{entity.description}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>State of Operation</label>
              <select
                value={businessData.state}
                onChange={(e) => updateBusinessData('state', e.target.value)}
                className="form-select"
              >
                <option value="">Select your state</option>
                <option value="CA">California</option>
                <option value="NY">New York</option>
                <option value="TX">Texas</option>
                <option value="FL">Florida</option>
                <option value="DE">Delaware</option>
                <option value="NV">Nevada</option>
                <option value="Other">Other</option>
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
          disabled={!isStepValid()}
          className="btn-primary"
        >
          {step === totalSteps ? '🎤 Find My Domain' : 'Continue →'}
        </button>
      </div>

      {/* Footer */}
      <div className="footer">
        <p>Next: We'll help you find the perfect domain name for your business using AI</p>
      </div>

      <style jsx>{`
        .setup-container {
          max-width: 600px;
          margin: 0 auto;
          padding: 40px 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          min-height: 100vh;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
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
          margin-bottom: 40px;
        }
        
        .header-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
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
        
        .back-btn {
          background: #f8f9fa;
          color: #495057;
          border: 1px solid #e9ecef;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
          text-decoration: none;
        }
        
        .back-btn:hover {
          background: #e9ecef;
          border-color: #2563eb;
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

        .form-input, .form-select, .form-textarea {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 16px;
          transition: border-color 0.2s;
          font-family: inherit;
        }

        .form-input:focus, .form-select:focus, .form-textarea:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .form-textarea {
          resize: vertical;
          min-height: 100px;
        }

        .entity-options {
          display: grid;
          gap: 12px;
        }

        .entity-option {
          padding: 16px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .entity-option:hover {
          border-color: #2563eb;
          background: #f8fafc;
        }

        .entity-option.selected {
          border-color: #2563eb;
          background: #eff6ff;
        }

        .entity-name {
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 4px;
        }

        .entity-description {
          font-size: 14px;
          color: #6b7280;
        }

        .tips {
          background: #f0f9ff;
          border: 1px solid #0ea5e9;
          border-radius: 8px;
          padding: 20px;
          margin-top: 20px;
        }

        .tips h4 {
          color: #0c4a6e;
          margin: 0 0 10px 0;
          font-size: 16px;
        }

        .tips ul {
          margin: 0;
          padding-left: 20px;
          color: #0369a1;
        }

        .tips li {
          margin-bottom: 5px;
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
          .setup-container {
            padding: 20px 15px;
          }

          .step-content {
            padding: 25px;
          }

          .header h1 {
            font-size: 28px;
          }
          
          .header-top {
            flex-direction: column;
            gap: 16px;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  )
}