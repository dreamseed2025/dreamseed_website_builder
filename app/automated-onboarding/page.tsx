'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

interface OnboardingData {
  email: string
  full_name: string
  phone_number: string
  business_type: 'new' | 'existing'
  business_name: string
}

export default function AutomatedOnboardingPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [data, setData] = useState<OnboardingData>({
    email: '',
    full_name: '',
    phone_number: '',
    business_type: 'new',
    business_name: ''
  })
  const router = useRouter()

  const handleInputChange = (field: keyof OnboardingData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }))
    setError(null)
  }

  const handleNextStep = () => {
    // Validate current step
    if (step === 1) {
      if (!data.email || !data.full_name) {
        setError('Please fill in all required fields')
        return
      }
      if (!data.email.includes('@')) {
        setError('Please enter a valid email address')
        return
      }
    }
    
    if (step === 2) {
      if (!data.business_type) {
        setError('Please select your business type')
        return
      }
    }

    if (step === 3 && data.business_type === 'existing' && !data.business_name) {
      setError('Please enter your business name')
      return
    }

    setStep(prev => prev + 1)
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/automated-onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          auto_login: true
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to complete onboarding')
      }

      console.log('✅ Onboarding completed:', result)
      setSuccess(true)
      
      // Auto-redirect after success
      setTimeout(() => {
        if (result.session?.login_url) {
          window.location.href = result.session.login_url
        } else {
          router.push('/login')
        }
      }, 2000)

    } catch (error: any) {
      console.error('❌ Onboarding error:', error)
      setError(error.message || 'Failed to complete onboarding')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #000000 0%, #1a0000 50%, #000000 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <div style={{
          maxWidth: '500px',
          background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
          borderRadius: '24px',
          padding: '3rem',
          textAlign: 'center',
          boxShadow: '0 25px 50px rgba(0, 255, 0, 0.3)',
          border: '1px solid rgba(0, 255, 0, 0.2)'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '1rem' }}>🎉</div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#141416',
            marginBottom: '1rem',
            fontFamily: 'Poppins, sans-serif'
          }}>
            Welcome to DreamSeed!
          </h1>
          <p style={{
            fontSize: '18px',
            color: '#666',
            marginBottom: '2rem',
            fontFamily: 'Inter, sans-serif'
          }}>
            Your account has been created successfully. You're being redirected to start your business formation journey!
          </p>
          <div style={{
            display: 'inline-block',
            background: '#d4edda',
            color: '#155724',
            padding: '12px 24px',
            borderRadius: '20px',
            fontSize: '16px',
            fontWeight: 'bold'
          }}>
            🚀 Setting up your dashboard...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #000000 0%, #1a0000 50%, #000000 100%)',
      padding: '2rem',
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
        maxWidth: '600px',
        margin: '0 auto',
        background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
        borderRadius: '24px',
        padding: '2rem',
        boxShadow: '0 25px 50px rgba(139, 0, 0, 0.3)',
        border: '1px solid rgba(139, 0, 0, 0.2)',
        position: 'relative',
        zIndex: 2
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '36px',
            fontWeight: 'bold',
            color: '#141416',
            marginBottom: '8px',
            fontFamily: 'Poppins, sans-serif'
          }}>
            🌱 Launch Your DreamSeed
          </h1>
          <p style={{
            color: '#666',
            fontSize: '18px',
            fontFamily: 'Inter, sans-serif'
          }}>
            Complete automated business formation in 3 simple steps
          </p>
        </div>

        {/* Progress Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '2rem'
        }}>
          {[1, 2, 3, 4].map((stepNum) => (
            <div key={stepNum} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: step >= stepNum ? '#8B0000' : '#e0e0e0',
                color: step >= stepNum ? 'white' : '#666',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontFamily: 'Inter, sans-serif'
              }}>
                {stepNum}
              </div>
              {stepNum < 4 && (
                <div style={{
                  width: '60px',
                  height: '2px',
                  background: step > stepNum ? '#8B0000' : '#e0e0e0',
                  margin: '0 8px'
                }} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        {step === 1 && (
          <div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#141416',
              marginBottom: '1rem',
              fontFamily: 'Poppins, sans-serif'
            }}>
              👤 Personal Information
            </h2>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: 'bold',
                color: '#333',
                fontFamily: 'Inter, sans-serif'
              }}>
                Full Name *
              </label>
              <input
                type="text"
                value={data.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #ddd',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontFamily: 'Inter, sans-serif',
                  background: '#fff'
                }}
                placeholder="Enter your full name"
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: 'bold',
                color: '#333',
                fontFamily: 'Inter, sans-serif'
              }}>
                Email Address *
              </label>
              <input
                type="email"
                value={data.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #ddd',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontFamily: 'Inter, sans-serif',
                  background: '#fff'
                }}
                placeholder="your.email@example.com"
              />
            </div>
            <div style={{ marginBottom: '2rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: 'bold',
                color: '#333',
                fontFamily: 'Inter, sans-serif'
              }}>
                Phone Number
              </label>
              <input
                type="tel"
                value={data.phone_number}
                onChange={(e) => handleInputChange('phone_number', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #ddd',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontFamily: 'Inter, sans-serif',
                  background: '#fff'
                }}
                placeholder="(555) 123-4567"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#141416',
              marginBottom: '1rem',
              fontFamily: 'Poppins, sans-serif'
            }}>
              🏢 Business Type Selection
            </h2>
            <div style={{ marginBottom: '2rem' }}>
              <div 
                style={{
                  border: `3px solid ${data.business_type === 'new' ? '#8B0000' : '#ddd'}`,
                  borderRadius: '16px',
                  padding: '2rem',
                  marginBottom: '1rem',
                  cursor: 'pointer',
                  background: data.business_type === 'new' ? '#fff5f5' : '#fff',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => handleInputChange('business_type', 'new')}
              >
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#141416',
                  marginBottom: '8px',
                  fontFamily: 'Poppins, sans-serif'
                }}>
                  🚀 New Dream Business
                </h3>
                <p style={{
                  color: '#666',
                  fontSize: '16px',
                  fontFamily: 'Inter, sans-serif',
                  margin: 0
                }}>
                  I'm starting a completely new business venture and need guidance from ideation to formation
                </p>
              </div>
              
              <div 
                style={{
                  border: `3px solid ${data.business_type === 'existing' ? '#8B0000' : '#ddd'}`,
                  borderRadius: '16px',
                  padding: '2rem',
                  cursor: 'pointer',
                  background: data.business_type === 'existing' ? '#fff5f5' : '#fff',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => handleInputChange('business_type', 'existing')}
              >
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#141416',
                  marginBottom: '8px',
                  fontFamily: 'Poppins, sans-serif'
                }}>
                  🏢 Existing Business
                </h3>
                <p style={{
                  color: '#666',
                  fontSize: '16px',
                  fontFamily: 'Inter, sans-serif',
                  margin: 0
                }}>
                  I have an existing business that needs formalization, growth, or optimization
                </p>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#141416',
              marginBottom: '1rem',
              fontFamily: 'Poppins, sans-serif'
            }}>
              {data.business_type === 'new' ? '💡 Business Concept' : '🏢 Business Details'}
            </h2>
            
            {data.business_type === 'existing' ? (
              <div style={{ marginBottom: '2rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: 'bold',
                  color: '#333',
                  fontFamily: 'Inter, sans-serif'
                }}>
                  Business Name *
                </label>
                <input
                  type="text"
                  value={data.business_name}
                  onChange={(e) => handleInputChange('business_name', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #ddd',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontFamily: 'Inter, sans-serif',
                    background: '#fff'
                  }}
                  placeholder="Enter your business name"
                />
              </div>
            ) : (
              <div style={{
                background: 'linear-gradient(135deg, #e8f5e8 0%, #d4edda 100%)',
                borderRadius: '16px',
                padding: '2rem',
                marginBottom: '2rem',
                border: '1px solid #56b978'
              }}>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#155724',
                  marginBottom: '1rem',
                  fontFamily: 'Poppins, sans-serif'
                }}>
                  🎯 Perfect! We'll help you develop your business concept
                </h3>
                <p style={{
                  color: '#155724',
                  fontSize: '16px',
                  fontFamily: 'Inter, sans-serif',
                  margin: 0,
                  lineHeight: '1.5'
                }}>
                  Our AI-powered voice assistant will guide you through defining your business idea, 
                  identifying your target market, and developing your unique value proposition.
                </p>
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div style={{ textAlign: 'center' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#141416',
              marginBottom: '1rem',
              fontFamily: 'Poppins, sans-serif'
            }}>
              ✅ Ready to Launch!
            </h2>
            <div style={{
              background: 'linear-gradient(135deg, #e8f5e8 0%, #d4edda 100%)',
              borderRadius: '16px',
              padding: '2rem',
              marginBottom: '2rem',
              border: '1px solid #56b978',
              textAlign: 'left'
            }}>
              <h4 style={{
                color: '#155724',
                marginBottom: '1rem',
                fontFamily: 'Poppins, sans-serif'
              }}>
                📋 Your Onboarding Summary:
              </h4>
              <ul style={{
                color: '#155724',
                fontFamily: 'Inter, sans-serif',
                lineHeight: '1.6'
              }}>
                <li><strong>Name:</strong> {data.full_name}</li>
                <li><strong>Email:</strong> {data.email}</li>
                <li><strong>Business Type:</strong> {data.business_type === 'new' ? 'New Dream Business' : 'Existing Business'}</li>
                {data.business_name && <li><strong>Business Name:</strong> {data.business_name}</li>}
                {data.phone_number && <li><strong>Phone:</strong> {data.phone_number}</li>}
              </ul>
            </div>
            
            <div style={{
              background: 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)',
              borderRadius: '16px',
              padding: '1.5rem',
              marginBottom: '2rem',
              border: '1px solid #ffc107'
            }}>
              <h4 style={{
                color: '#856404',
                marginBottom: '8px',
                fontFamily: 'Poppins, sans-serif'
              }}>
                🚀 Next Steps:
              </h4>
              <p style={{
                color: '#856404',
                fontFamily: 'Inter, sans-serif',
                margin: 0,
                fontSize: '14px',
                lineHeight: '1.4'
              }}>
                {data.business_type === 'new' ? 
                  'Start with our AI voice consultant to develop your business concept and create your Dream DNA profile.' :
                  'Review your business details and optimize your existing operations with AI-powered insights.'
                }
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div style={{
            background: '#f8d7da',
            color: '#721c24',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '1rem',
            border: '1px solid #f5c6cb'
          }}>
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {step > 1 && (
            <button
              onClick={() => setStep(prev => prev - 1)}
              disabled={loading}
              style={{
                background: 'transparent',
                color: '#8B0000',
                border: '2px solid #8B0000',
                padding: '12px 24px',
                borderRadius: '12px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              ← Back
            </button>
          )}

          <div style={{ flex: 1 }} />

          {step < 4 ? (
            <button
              onClick={handleNextStep}
              disabled={loading}
              style={{
                background: 'linear-gradient(135deg, #8B0000 0%, #A00000 100%)',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '12px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                minWidth: '120px'
              }}
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                background: loading ? '#ccc' : 'linear-gradient(135deg, #56b978 0%, #45a367 100%)',
                color: 'white',
                border: 'none',
                padding: '16px 32px',
                borderRadius: '12px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                fontSize: '18px'
              }}
            >
              {loading ? '🚀 Creating Account...' : '🌱 Launch DreamSeed!'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}