'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase'

interface AssessmentData {
  businessIdea: string
  fullName: string
  email: string
  phone: string
  timeline: string
  experience: string
  businessType: string
  mainGoal: string
}

export default function BusinessAssessment() {
  const [formData, setFormData] = useState<AssessmentData>({
    businessIdea: '',
    fullName: '',
    email: '',
    phone: '',
    timeline: '',
    experience: '',
    businessType: '',
    mainGoal: ''
  })
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createSupabaseClient()

  const totalSteps = 4

  const handleInputChange = (field: keyof AssessmentData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    
    try {
      // Save assessment data to Supabase
      const { error } = await supabase
        .from('business_assessments')
        .insert([{
          business_idea: formData.businessIdea,
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          timeline: formData.timeline,
          experience: formData.experience,
          business_type: formData.businessType,
          main_goal: formData.mainGoal,
          created_at: new Date().toISOString()
        }])

      if (error) {
        console.error('Error saving assessment:', error)
      }

      // Store data in localStorage for login flow
      localStorage.setItem('assessmentData', JSON.stringify(formData))
      
      // Redirect to login with assessment completed
      router.push('/login?assessment=completed')
      
    } catch (error) {
      console.error('Error submitting assessment:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-content">
            <h2>Tell us about your business idea</h2>
            <p className="step-description">Help us understand what you want to build</p>
            <div className="form-group">
              <label htmlFor="businessIdea">What's your business idea?</label>
              <textarea
                id="businessIdea"
                value={formData.businessIdea}
                onChange={(e) => handleInputChange('businessIdea', e.target.value)}
                placeholder="Describe your business idea, product, or service..."
                rows={4}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="businessType">What type of business?</label>
              <select
                id="businessType"
                value={formData.businessType}
                onChange={(e) => handleInputChange('businessType', e.target.value)}
                required
              >
                <option value="">Select business type</option>
                <option value="service">Service Business</option>
                <option value="product">Product Business</option>
                <option value="consulting">Consulting</option>
                <option value="ecommerce">E-commerce</option>
                <option value="saas">SaaS/Software</option>
                <option value="restaurant">Restaurant/Food</option>
                <option value="retail">Retail</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="step-content">
            <h2>Let's get your details</h2>
            <p className="step-description">We need this to personalize your business formation journey</p>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="Your full name"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="(555) 123-4567"
                required
              />
              <small>We'll use this for your personalized AI consultation calls</small>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="step-content">
            <h2>Timeline and Experience</h2>
            <p className="step-description">Help us tailor the process to your needs</p>
            <div className="form-group">
              <label htmlFor="timeline">When do you want to launch?</label>
              <select
                id="timeline"
                value={formData.timeline}
                onChange={(e) => handleInputChange('timeline', e.target.value)}
                required
              >
                <option value="">Select timeline</option>
                <option value="asap">As soon as possible</option>
                <option value="1month">Within 1 month</option>
                <option value="3months">Within 3 months</option>
                <option value="6months">Within 6 months</option>
                <option value="exploring">Just exploring</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="experience">Business experience level?</label>
              <select
                id="experience"
                value={formData.experience}
                onChange={(e) => handleInputChange('experience', e.target.value)}
                required
              >
                <option value="">Select experience</option>
                <option value="first-time">First-time entrepreneur</option>
                <option value="some">Some business experience</option>
                <option value="experienced">Experienced entrepreneur</option>
                <option value="serial">Serial entrepreneur</option>
              </select>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="step-content">
            <h2>What's your main goal?</h2>
            <p className="step-description">This helps us prioritize your business formation steps</p>
            <div className="form-group">
              <label>Select your primary goal:</label>
              <div className="radio-group">
                {[
                  { value: 'revenue', label: 'Start generating revenue quickly' },
                  { value: 'legal', label: 'Get legal protection and structure' },
                  { value: 'funding', label: 'Prepare for investment/funding' },
                  { value: 'tax', label: 'Optimize tax situation' },
                  { value: 'credibility', label: 'Build business credibility' },
                  { value: 'explore', label: 'Just exploring options' }
                ].map((option) => (
                  <label key={option.value} className="radio-option">
                    <input
                      type="radio"
                      name="mainGoal"
                      value={option.value}
                      checked={formData.mainGoal === option.value}
                      onChange={(e) => handleInputChange('mainGoal', e.target.value)}
                      required
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.businessIdea.trim() && formData.businessType
      case 2:
        return formData.fullName.trim() && formData.email.trim() && formData.phone.trim()
      case 3:
        return formData.timeline && formData.experience
      case 4:
        return formData.mainGoal
      default:
        return false
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Setting up your personalized business plan...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Step {currentStep} of {totalSteps}
              </span>
              <span className="text-sm text-gray-500">
                {Math.round((currentStep / totalSteps) * 100)}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            {renderStep()}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className={`px-6 py-3 rounded-lg font-medium transition ${
                  currentStep === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Previous
              </button>

              {currentStep < totalSteps ? (
                <button
                  onClick={handleNext}
                  disabled={!isStepValid()}
                  className={`px-6 py-3 rounded-lg font-medium transition ${
                    isStepValid()
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Next Step
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!isStepValid()}
                  className={`px-8 py-3 rounded-lg font-medium transition ${
                    isStepValid()
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Start My Business Journey →
                </button>
              )}
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-600 mb-4">
              🔒 Your information is secure and will only be used to personalize your experience
            </p>
            <div className="flex justify-center space-x-8 text-sm text-gray-500">
              <span>✓ AI-Powered Guidance</span>
              <span>✓ 4-Call Formation Process</span>
              <span>✓ Legal Compliance</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .container {
          max-width: 1200px;
        }
        
        .form-group {
          margin-bottom: 1.5rem;
        }
        
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        
        label {
          display: block;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
        }
        
        input, textarea, select {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #e5e7eb;
          border-radius: 0.5rem;
          font-size: 1rem;
          transition: border-color 0.2s;
        }
        
        input:focus, textarea:focus, select:focus {
          outline: none;
          border-color: #3b82f6;
        }
        
        small {
          display: block;
          color: #6b7280;
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }
        
        .step-content h2 {
          font-size: 1.875rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }
        
        .step-description {
          color: #6b7280;
          margin-bottom: 2rem;
        }
        
        .radio-group {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .radio-option {
          display: flex;
          align-items: center;
          padding: 0.75rem;
          border: 2px solid #e5e7eb;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .radio-option:hover {
          border-color: #3b82f6;
          background-color: #f3f4f6;
        }
        
        .radio-option input {
          width: auto;
          margin-right: 0.75rem;
        }
        
        .radio-option input:checked + span {
          color: #3b82f6;
          font-weight: 600;
        }
        
        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}