'use client'

import { useState, useEffect } from 'react'
import { createSupabaseClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

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

interface User {
  id: string
  customer_name: string
  customer_email: string
  business_name?: string
  status?: string
}

interface EditableField {
  key: keyof DreamDNATruth
  label: string
  type: 'text' | 'textarea' | 'select' | 'number'
  placeholder: string
  options?: string[]
  category: string
  icon: string
  description: string
  useCase: string
}

export default function DreamDNAOverview() {
  const [user, setUser] = useState<User | null>(null)
  const [dreamDNATruth, setDreamDNATruth] = useState<DreamDNATruth | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [predictions, setPredictions] = useState<Record<string, any>>({})
  const [loadingPredictions, setLoadingPredictions] = useState(false)
  const [showDeepDive, setShowDeepDive] = useState(false)
  const supabase = createSupabaseClient()
  const router = useRouter()

  // Editable fields configuration
  const editableFields: EditableField[] = [
    // Business Foundation
    { 
      key: 'business_name', 
      label: 'Business Name', 
      type: 'text', 
      placeholder: 'Enter your business name', 
      category: 'Business Foundation', 
      icon: '🏢',
      description: 'Your company name for branding and legal formation',
      useCase: 'Used for: Website generation, legal docs, branding, domain names'
    },
    { 
      key: 'what_problem', 
      label: 'What Problem', 
      type: 'textarea', 
      placeholder: 'What problem does your business solve?', 
      category: 'Business Foundation', 
      icon: '🎯',
      description: 'The core problem your business addresses',
      useCase: 'Core DNA - Drives entire business narrative, value proposition, marketing messaging'
    },
    { 
      key: 'who_serves', 
      label: 'Who Serves', 
      type: 'textarea', 
      placeholder: 'Who is your target audience?', 
      category: 'Business Foundation', 
      icon: '👥',
      description: 'Your target market and customer personas',
      useCase: 'Core DNA - Defines customer base, marketing strategy, messaging'
    },
    { 
      key: 'how_different', 
      label: 'How Different', 
      type: 'textarea', 
      placeholder: 'How is your business different?', 
      category: 'Business Foundation', 
      icon: '⭐',
      description: 'Your unique positioning and differentiation',
      useCase: 'Core DNA - Competitive advantage, USP, brand positioning'
    },
    
    // Service & Revenue
    { 
      key: 'primary_service', 
      label: 'Primary Service', 
      type: 'textarea', 
      placeholder: 'What is your main service or product?', 
      category: 'Service & Revenue', 
      icon: '💰',
      description: 'Your main product or service offering',
      useCase: 'Core DNA - Business model foundation, operations, revenue model'
    },
    { 
      key: 'target_revenue', 
      label: 'Target Revenue', 
      type: 'number', 
      placeholder: 'Enter target annual revenue', 
      category: 'Service & Revenue', 
      icon: '📈',
      description: 'Your annual revenue goal',
      useCase: 'Financial planning, package recommendations, scaling plans, growth projections'
    },
    { 
      key: 'business_model', 
      label: 'Business Model', 
      type: 'select', 
      placeholder: 'Select business model', 
      options: ['SaaS', 'E-commerce', 'Service-based', 'Marketplace', 'Consulting', 'Other'], 
      category: 'Service & Revenue', 
      icon: '🏗️',
      description: 'How your business generates revenue',
      useCase: 'Revenue strategy, operations planning, investor pitches, service classification'
    },
    
    // Competitive Edge
    { 
      key: 'unique_value_proposition', 
      label: 'Unique Value Prop', 
      type: 'textarea', 
      placeholder: 'What makes you unique?', 
      category: 'Competitive Edge', 
      icon: '💎',
      description: 'Your unique value proposition',
      useCase: 'Marketing copy, elevator pitch, website content, automated content generation'
    },
    { 
      key: 'competitive_advantage', 
      label: 'Competitive Advantage', 
      type: 'textarea', 
      placeholder: 'What is your competitive advantage?', 
      category: 'Competitive Edge', 
      icon: '⚡',
      description: 'What gives you an edge over competitors',
      useCase: 'Strategic positioning, investor materials, differentiation, business strategy'
    },
    { 
      key: 'brand_personality', 
      label: 'Brand Personality', 
      type: 'select', 
      placeholder: 'Select brand personality', 
      options: ['Professional', 'Friendly', 'Innovative', 'Trustworthy', 'Creative', 'Bold'], 
      category: 'Competitive Edge', 
      icon: '🎨',
      description: 'Your brand voice and personality',
      useCase: 'Website templates, voice/tone, marketing style, template selection'
    },
    
    // Business Details
    { 
      key: 'business_stage', 
      label: 'Business Stage', 
      type: 'select', 
      placeholder: 'Select business stage', 
      options: ['Idea', 'Startup', 'Growth', 'Established', 'Pivot'], 
      category: 'Business Details', 
      icon: '🚀',
      description: 'Current stage of your business',
      useCase: 'Workflow routing, package selection, guidance level, service matching'
    },
    { 
      key: 'industry_category', 
      label: 'Industry Category', 
      type: 'select', 
      placeholder: 'Select industry', 
      options: ['Technology', 'Healthcare', 'Finance', 'Education', 'Retail', 'Manufacturing', 'Services', 'Other'], 
      category: 'Business Details', 
      icon: '🏭',
      description: 'Your industry classification',
      useCase: 'Template matching, regulatory requirements, market analysis, industry guidance'
    },
    { 
      key: 'geographic_focus', 
      label: 'Geographic Focus', 
      type: 'text', 
      placeholder: 'Where do you operate?', 
      category: 'Business Details', 
      icon: '🌍',
      description: 'Your target geographic market',
      useCase: 'Legal formation state, tax implications, market strategy, compliance'
    },
    { 
      key: 'timeline_to_launch', 
      label: 'Timeline to Launch', 
      type: 'number', 
      placeholder: 'Months to launch', 
      category: 'Business Details', 
      icon: '⏰',
      description: 'How many months until launch',
      useCase: 'Project management, urgency routing, resource allocation, package selection'
    },
  ]

  useEffect(() => {
    loadUserData()
  }, [])

  // Redirect to setup if no Dream DNA exists, or to login if not authenticated
  useEffect(() => {
    if (!loading) {
      if (error && error.includes('sign in')) {
        console.log('Not authenticated, redirecting to login...')
        router.push('/login')
      } else if (!error && !dreamDNATruth) {
        console.log('No Dream DNA found, redirecting to onboarding...')
        router.push('/onboarding')
      }
    }
  }, [loading, error, dreamDNATruth, router])

  const loadUserData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get current user session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('Session error:', sessionError)
        setError('Failed to get user session')
        setLoading(false)
        return
      }

      if (!session?.user) {
        console.log('No authenticated user')
        setError('Please sign in to access your Dream DNA')
        setLoading(false)
        return
      }

      console.log('Loading Dream DNA data for:', session.user.email)

      // Call the user profile API to get user data
      const response = await fetch('/api/user-profile')
      const result = await response.json()

      if (result.success && result.profile) {
        console.log('User data loaded from API:', result.profile)
        
        const userData: User = {
          id: result.profile.id,
          customer_name: result.profile.customer_name || session.user.user_metadata?.full_name || 'User',
          customer_email: result.profile.customer_email || session.user.email || '',
          business_name: result.profile.business_name || '',
          status: result.profile.status || 'active'
        }
        
        setUser(userData)

        // Set Dream DNA truth data if available
        if (result.profile.dream_dna_truth) {
          setDreamDNATruth(result.profile.dream_dna_truth)
        }
      } else {
        console.error('Failed to load user data from API:', result.message)
        setError('Failed to load user data')
      }

    } catch (err) {
      console.error('User data loading error:', err)
      setError('Failed to load user data')
    } finally {
      setLoading(false)
    }
  }

  const getFieldStatus = (value: any): 'filled' | 'empty' | 'partial' => {
    if (!value || value === '' || value === 0) return 'empty'
    if (typeof value === 'string' && value.length < 10) return 'partial'
    return 'filled'
  }

  const getFieldIcon = (status: 'filled' | 'empty' | 'partial') => {
    switch (status) {
      case 'filled': return '✅'
      case 'partial': return '⚠️'
      case 'empty': return '❌'
    }
  }

  const getFieldColor = (status: 'filled' | 'empty' | 'partial') => {
    switch (status) {
      case 'filled': return '#10b981'
      case 'partial': return '#f59e0b'
      case 'empty': return '#ef4444'
    }
  }

  const getCompletionPercentage = () => {
    if (!dreamDNATruth) return 0
    
    const fields = [
      dreamDNATruth.business_name,
      dreamDNATruth.what_problem,
      dreamDNATruth.who_serves,
      dreamDNATruth.how_different,
      dreamDNATruth.primary_service,
      dreamDNATruth.target_revenue,
      dreamDNATruth.business_model,
      dreamDNATruth.unique_value_proposition,
      dreamDNATruth.competitive_advantage,
      dreamDNATruth.brand_personality,
      dreamDNATruth.business_stage,
      dreamDNATruth.industry_category,
      dreamDNATruth.geographic_focus,
      dreamDNATruth.timeline_to_launch
    ]
    
    const filledFields = fields.filter(field => getFieldStatus(field) === 'filled').length
    return Math.round((filledFields / fields.length) * 100)
  }

  const handleEditField = (fieldKey: string) => {
    setEditingField(fieldKey)
  }

  const handleSaveField = async (fieldKey: keyof DreamDNATruth, value: any) => {
    if (!dreamDNATruth?.id) return
    
    setSaving(true)
    try {
      const { error } = await supabase
        .from('dream_dna_truth')
        .update({ 
          [fieldKey]: value,
          updated_at: new Date().toISOString()
        })
        .eq('id', dreamDNATruth.id)

      if (error) throw error

      // Update local state
      setDreamDNATruth(prev => prev ? { ...prev, [fieldKey]: value } : null)
      setEditingField(null)
    } catch (err) {
      console.error('Error saving field:', err)
      setError('Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  const handleFieldBlur = async (fieldKey: keyof DreamDNATruth, value: any) => {
    // Only save if the value has actually changed
    const currentValue = dreamDNATruth?.[fieldKey]
    if (value !== currentValue) {
      await handleSaveField(fieldKey, value)
    } else {
      // If no change, just close the edit mode
      setEditingField(null)
    }
  }

  const handleCancelEdit = () => {
    setEditingField(null)
  }

  const generatePredictions = async () => {
    if (!dreamDNATruth?.id) return
    
    setLoadingPredictions(true)
    try {
      // Get current filled values for context
      const filledValues = {
        business_name: dreamDNATruth.business_name,
        what_problem: dreamDNATruth.what_problem,
        who_serves: dreamDNATruth.who_serves,
        how_different: dreamDNATruth.how_different,
        primary_service: dreamDNATruth.primary_service,
        target_revenue: dreamDNATruth.target_revenue,
        business_model: dreamDNATruth.business_model,
        unique_value_proposition: dreamDNATruth.unique_value_proposition,
        competitive_advantage: dreamDNATruth.competitive_advantage,
        brand_personality: dreamDNATruth.brand_personality,
        business_stage: dreamDNATruth.business_stage,
        industry_category: dreamDNATruth.industry_category,
        geographic_focus: dreamDNATruth.geographic_focus,
        timeline_to_launch: dreamDNATruth.timeline_to_launch
      }

      // Create probability truth record with AI predictions
      const probabilityData: any = {
        dream_id: dreamDNATruth.id,
        user_id: user?.id,
        dream_type: 'business_formation',
        extraction_source: 'ai_prediction',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // Copy existing truth values
      Object.keys(filledValues).forEach(key => {
        if (filledValues[key as keyof typeof filledValues]) {
          probabilityData[key] = filledValues[key as keyof typeof filledValues]
        }
      })

      // Generate AI predictions for empty fields with confidence scores
      if (!filledValues.what_problem && filledValues.business_name) {
        probabilityData.what_problem = `Help ${filledValues.business_name} solve common industry challenges`
        probabilityData.what_problem_probability = 0.85
      }

      if (!filledValues.who_serves && filledValues.business_name) {
        probabilityData.who_serves = `Small to medium businesses in the ${filledValues.business_name} industry`
        probabilityData.who_serves_probability = 0.80
      }

      if (!filledValues.how_different && filledValues.business_name) {
        probabilityData.how_different = `Unique ${filledValues.business_name} approach with personalized solutions`
        probabilityData.how_different_probability = 0.75
      }

      if (!filledValues.primary_service && filledValues.business_name) {
        probabilityData.primary_service = `${filledValues.business_name} consulting and strategy`
        probabilityData.primary_service_probability = 0.82
      }

      if (!filledValues.target_revenue) {
        probabilityData.target_revenue = 100000
        probabilityData.target_revenue_probability = 0.70
      }

      if (!filledValues.business_model) {
        probabilityData.business_model = 'Service-based'
        probabilityData.business_model_probability = 0.78
      }

      if (!filledValues.unique_value_proposition && filledValues.business_name) {
        probabilityData.unique_value_proposition = `${filledValues.business_name} expertise with proven results`
        probabilityData.unique_value_proposition_probability = 0.83
      }

      if (!filledValues.competitive_advantage && filledValues.business_name) {
        probabilityData.competitive_advantage = `Deep ${filledValues.business_name} industry knowledge and experience`
        probabilityData.competitive_advantage_probability = 0.79
      }

      if (!filledValues.brand_personality) {
        probabilityData.brand_personality = 'Professional'
        probabilityData.brand_personality_probability = 0.76
      }

      if (!filledValues.business_stage) {
        probabilityData.business_stage = 'Startup'
        probabilityData.business_stage_probability = 0.81
      }

      if (!filledValues.industry_category) {
        probabilityData.industry_category = 'Services'
        probabilityData.industry_category_probability = 0.77
      }

      if (!filledValues.geographic_focus) {
        probabilityData.geographic_focus = 'Local'
        probabilityData.geographic_focus_probability = 0.74
      }

      if (!filledValues.timeline_to_launch) {
        probabilityData.timeline_to_launch = 12
        probabilityData.timeline_to_launch_probability = 0.72
      }

      // Save to dream_dna_probability_truth table
      const { error } = await supabase
        .from('dream_dna_probability_truth')
        .upsert(probabilityData, { 
          onConflict: 'dream_id',
          ignoreDuplicates: false 
        })

      if (error) throw error

      console.log('AI predictions saved to probability truth table:', probabilityData)
      
      // Update local state to show predictions
      setPredictions(probabilityData)
      
    } catch (err) {
      console.error('Error generating predictions:', err)
    } finally {
      setLoadingPredictions(false)
    }
  }

  // Load probability data and generate predictions when dream data loads
  useEffect(() => {
    if (dreamDNATruth?.id) {
      loadProbabilityData()
      if (Object.keys(predictions).length === 0) {
        generatePredictions()
      }
    }
  }, [dreamDNATruth])

  const loadProbabilityData = async () => {
    if (!dreamDNATruth?.id) return
    
    try {
      const { data, error } = await supabase
        .from('dream_dna_probability_truth')
        .select('*')
        .eq('dream_id', dreamDNATruth.id)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error loading probability data:', error)
        return
      }

      if (data) {
        setPredictions(data)
        console.log('Loaded probability data:', data)
      }
    } catch (err) {
      console.error('Error loading probability data:', err)
    }
  }

  const renderEditableField = (field: EditableField) => {
    const value = dreamDNATruth?.[field.key] || ''
    const isEditing = editingField === field.key
    const status = getFieldStatus(value)
    const prediction = predictions[field.key]
    const predictionProbability = predictions[`${field.key}_probability`]
    const hasPrediction = prediction && !value && (predictionProbability as number) > 0.7

    if (isEditing) {
      return (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span>{field.icon}</span>
            <strong style={{ color: '#56b978' }}>{field.label}</strong>
          </div>
          
          {field.type === 'textarea' ? (
            <textarea
              data-field={field.key}
              defaultValue={value as string}
              placeholder={field.placeholder}
              onBlur={(e) => handleFieldBlur(field.key, e.target.value)}
              style={{
                width: '100%',
                minHeight: '80px',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'white',
                fontSize: '14px',
                resize: 'vertical'
              }}
            />
          ) : field.type === 'select' ? (
            <select
              data-field={field.key}
              defaultValue={value as string}
              onChange={(e) => handleFieldBlur(field.key, e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'white',
                fontSize: '14px'
              }}
            >
              <option value="">{field.placeholder}</option>
              {field.options?.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          ) : (
            <input
              data-field={field.key}
              type={field.type}
              defaultValue={value as string}
              placeholder={field.placeholder}
              onBlur={(e) => {
                const value = field.type === 'number' ? Number(e.target.value) : e.target.value
                handleFieldBlur(field.key, value)
              }}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'white',
                fontSize: '14px'
              }}
            />
          )}
          
          {saving && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              marginTop: '8px',
              color: '#56b978',
              fontSize: '14px'
            }}>
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid rgba(86, 185, 120, 0.3)',
                borderTop: '2px solid #56b978',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              Saving...
            </div>
          )}
        </div>
      )
    }

    return (
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>{getFieldIcon(status)}</span>
            <span>{field.icon}</span>
            <strong style={{ color: getFieldColor(status) }}>{field.label}</strong>
          </div>
          <button
            onClick={() => handleEditField(field.key)}
            style={{
              padding: '4px 8px',
              background: 'transparent',
              color: '#56b978',
              border: '1px solid #56b978',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Edit
          </button>
        </div>
        <div style={{ color: '#cccccc', fontSize: '14px', paddingLeft: '24px' }}>
          {value || (hasPrediction ? (
            <div>
              <div style={{ color: '#ffc107', fontStyle: 'italic' }}>
                🤖 AI Suggestion: {prediction}
              </div>
              <div style={{ color: '#666666', fontSize: '12px', marginTop: '4px' }}>
                Confidence: {Math.round((predictionProbability as number) * 100)}%
              </div>
            </div>
          ) : 'Not set')}
        </div>
        <div style={{ color: '#999999', fontSize: '12px', paddingLeft: '24px', marginTop: '4px' }}>
          {field.description}
        </div>
        <div style={{ color: '#666666', fontSize: '11px', paddingLeft: '24px', marginTop: '2px', fontStyle: 'italic' }}>
          {field.useCase}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        background: 'linear-gradient(135deg, #000000 0%, #1a0000 50%, #000000 100%)',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '48px', 
            height: '48px', 
            border: '3px solid rgba(255, 255, 255, 0.3)', 
            borderTop: '3px solid #56b978', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ fontSize: '18px', fontFamily: 'Poppins, sans-serif' }}>Loading your Dream DNA...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <style jsx global>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        background: 'linear-gradient(135deg, #000000 0%, #1a0000 50%, #000000 100%)',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '18px', fontFamily: 'Poppins, sans-serif', marginBottom: '16px' }}>⚠️ {error}</p>
          <button 
            onClick={() => window.location.href = '/login'}
            style={{ 
              background: '#56b978', 
              color: 'white', 
              border: 'none', 
              padding: '12px 24px', 
              borderRadius: '8px', 
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  const completionPercentage = getCompletionPercentage()

  return (
    <>
      <div style={{
        background: 'linear-gradient(135deg, #000000 0%, #1a0000 50%, #000000 100%)',
        minHeight: 'calc(100vh - 80px)',
        color: 'white',
        fontFamily: 'Inter, sans-serif',
        paddingTop: '0'
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
          minHeight: 'calc(100vh - 80px)'
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
              🧬 Dream DNA Editor
            </h1>
            <p style={{
              fontSize: '20px',
              color: '#cccccc',
              marginBottom: '8px'
            }}>
              {completionPercentage === 100 ? 'Complete & Editable Business Profile' : 'Edit Your Business Profile'}
            </p>
            <p style={{
              fontSize: '16px',
              color: '#999999'
            }}>
              {completionPercentage === 100 ? 
                'Your Dream DNA is complete! Click "Edit" next to any field to update your information' : 
                'Complete your Dream DNA by editing the fields below. Click "Edit" to update any field'
              }
            </p>
            <p style={{
              fontSize: '14px',
              color: '#666666',
              fontStyle: 'italic'
            }}>
              💡 Changes save automatically when you click away from a field
            </p>
            <button
              onClick={generatePredictions}
              disabled={loadingPredictions}
              style={{
                marginTop: '16px',
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #6f42c1 0%, #5a32a3 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: loadingPredictions ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                opacity: loadingPredictions ? 0.6 : 1
              }}
            >
              {loadingPredictions ? '🤖 Generating AI Predictions...' : '🤖 Generate AI Predictions'}
            </button>
          </div>

          {/* Completion Status */}
          <div style={{
            background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
            padding: '2rem',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            marginBottom: '2rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: '#56b978', fontSize: '28px' }}>📊 Completion Status</h2>
              <div style={{
                padding: '8px 16px',
                background: dreamDNATruth?.validated_by_user ? 'rgba(86, 185, 120, 0.2)' : 'rgba(255, 193, 7, 0.2)',
                borderRadius: '8px',
                border: `1px solid ${dreamDNATruth?.validated_by_user ? '#56b978' : '#ffc107'}`,
                color: dreamDNATruth?.validated_by_user ? '#56b978' : '#ffc107',
                fontSize: '14px'
              }}>
                {dreamDNATruth?.validated_by_user ? '✅ Validated' : '⏳ Pending Validation'}
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#cccccc' }}>Completion</span>
                  <span style={{ color: '#56b978', fontWeight: 'bold' }}>{completionPercentage}%</span>
                </div>
                <div style={{
                  width: '100%',
                  height: '12px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${completionPercentage}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #56b978, #45a367)',
                    transition: 'width 0.3s ease'
                  }}></div>
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', color: '#56b978' }}>{completionPercentage}%</div>
                <div style={{ fontSize: '12px', color: '#999999' }}>Complete</div>
              </div>
            </div>
          </div>

          {/* Editable Dream DNA Fields */}
          <div style={{
            background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
            padding: '2rem',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            marginBottom: '2rem'
          }}>
            <h2 style={{ margin: '0 0 20px 0', color: '#56b978', fontSize: '28px' }}>✏️ Edit Your Dream DNA</h2>
            <p style={{ color: '#cccccc', fontSize: '16px', marginBottom: '20px' }}>
              Click "Edit" next to any field, make your changes, then click away to save automatically
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
              {/* Business Foundation */}
              <div style={{ padding: '20px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px' }}>
                <h3 style={{ margin: '0 0 16px 0', color: '#56b978', fontSize: '20px' }}>🏢 Business Foundation</h3>
                {editableFields
                  .filter(field => field.category === 'Business Foundation')
                  .map(field => (
                    <div key={field.key} data-field={field.key}>
                      {renderEditableField(field)}
                    </div>
                  ))}
              </div>

              {/* Service & Revenue */}
              <div style={{ padding: '20px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px' }}>
                <h3 style={{ margin: '0 0 16px 0', color: '#56b978', fontSize: '20px' }}>💰 Service & Revenue</h3>
                {editableFields
                  .filter(field => field.category === 'Service & Revenue')
                  .map(field => (
                    <div key={field.key} data-field={field.key}>
                      {renderEditableField(field)}
                    </div>
                  ))}
              </div>

              {/* Competitive Edge */}
              <div style={{ padding: '20px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px' }}>
                <h3 style={{ margin: '0 0 16px 0', color: '#56b978', fontSize: '20px' }}>⚡ Competitive Edge</h3>
                {editableFields
                  .filter(field => field.category === 'Competitive Edge')
                  .map(field => (
                    <div key={field.key} data-field={field.key}>
                      {renderEditableField(field)}
                    </div>
                  ))}
              </div>

              {/* Business Details */}
              <div style={{ padding: '20px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px' }}>
                <h3 style={{ margin: '0 0 16px 0', color: '#56b978', fontSize: '20px' }}>📈 Business Details</h3>
                {editableFields
                  .filter(field => field.category === 'Business Details')
                  .map(field => (
                    <div key={field.key} data-field={field.key}>
                      {renderEditableField(field)}
                    </div>
                  ))}
              </div>
                      </div>
        </div>

        {/* Deep Dive Toggle */}
        <div style={{
          background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
          padding: '1.5rem',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          <button
            onClick={() => setShowDeepDive(!showDeepDive)}
            style={{
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              color: 'white',
              border: 'none',
              padding: '16px 32px',
              borderRadius: '12px',
              fontSize: '18px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              margin: '0 auto'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            {showDeepDive ? '🔽 Hide Deep Dive' : '🔍 Show Deep Dive'}
            <span style={{ fontSize: '14px', opacity: 0.8 }}>
              {showDeepDive ? 'Collapse detailed view' : 'Expand for comprehensive insights'}
            </span>
          </button>
        </div>

        {/* Deep Dive Section */}
        {showDeepDive && (
          <>
            
          </>
        )}

        {/* Dream DNA Applications */}
          <div style={{
            background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
            padding: '2rem',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            marginBottom: '2rem'
          }}>
            <h2 style={{ margin: '0 0 20px 0', color: '#56b978', fontSize: '28px' }}>🚀 Dream DNA Applications</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              
              {/* AI Voice Assistant */}
              <div style={{ padding: '20px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px' }}>
                <h3 style={{ margin: '0 0 16px 0', color: '#56b978', fontSize: '20px' }}>🤖 AI Voice Assistant (VAPI)</h3>
                <ul style={{ color: '#cccccc', fontSize: '14px', paddingLeft: '20px', margin: 0 }}>
                  <li>Context Awareness: Current business stage & completion status</li>
                  <li>Personalized Responses: Uses business name, industry, goals</li>
                  <li>Progressive Guidance: Adapts to call progression (1-4)</li>
                  <li>Package Routing: Matches urgency/complexity to service level</li>
                </ul>
              </div>

              {/* Website Generation */}
              <div style={{ padding: '20px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px' }}>
                <h3 style={{ margin: '0 0 16px 0', color: '#56b978', fontSize: '20px' }}>🌐 Website Generation</h3>
                <ul style={{ color: '#cccccc', fontSize: '14px', paddingLeft: '20px', margin: 0 }}>
                  <li>Template Selection: Industry + brand personality → template</li>
                  <li>Content Generation: Problem/solution → value propositions</li>
                  <li>SEO Optimization: Target customers → keyword strategy</li>
                  <li>Brand Voice: Vision + purpose → tone and messaging</li>
                </ul>
              </div>

              {/* Marketing Automation */}
              <div style={{ padding: '20px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px' }}>
                <h3 style={{ margin: '0 0 16px 0', color: '#56b978', fontSize: '20px' }}>📧 Marketing Automation</h3>
                <ul style={{ color: '#cccccc', fontSize: '14px', paddingLeft: '20px', margin: 0 }}>
                  <li>Segmentation: Industry, stage, urgency level</li>
                  <li>Personalization: Business name, specific goals, pain points</li>
                  <li>Campaign Triggers: Timeline, budget mentions, validation status</li>
                  <li>Content Adaptation: Different messages for different business types</li>
                </ul>
              </div>

              {/* Business Formation */}
              <div style={{ padding: '20px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px' }}>
                <h3 style={{ margin: '0 0 16px 0', color: '#56b978', fontSize: '20px' }}>💼 Business Formation</h3>
                <ul style={{ color: '#cccccc', fontSize: '14px', paddingLeft: '20px', margin: 0 }}>
                  <li>Entity Selection: Business model + revenue goals → structure</li>
                  <li>State Selection: Geographic focus + tax considerations</li>
                  <li>Timeline Management: Urgency level + timeline preference</li>
                  <li>Package Matching: Complexity + support needs → service level</li>
                </ul>
              </div>

              {/* Business Intelligence */}
              <div style={{ padding: '20px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px' }}>
                <h3 style={{ margin: '0 0 16px 0', color: '#56b978', fontSize: '20px' }}>📊 Business Intelligence</h3>
                <ul style={{ color: '#cccccc', fontSize: '14px', paddingLeft: '20px', margin: 0 }}>
                  <li>Pattern Recognition: Common problems, successful models</li>
                  <li>Predictive Analytics: Success likelihood based on DNA patterns</li>
                  <li>Market Analysis: Industry trends, competitive landscapes</li>
                  <li>ROI Optimization: Package fit accuracy, timeline predictions</li>
                </ul>
              </div>

              {/* Advanced Features */}
              <div style={{ padding: '20px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px' }}>
                <h3 style={{ margin: '0 0 16px 0', color: '#56b978', fontSize: '20px' }}>🔮 Advanced Features</h3>
                <ul style={{ color: '#cccccc', fontSize: '14px', paddingLeft: '20px', margin: 0 }}>
                  <li>Multi-Source Data Fusion: Voice, forms, domain selection</li>
                  <li>Confidence Scoring: AI reliability scores per field</li>
                  <li>Dynamic Profiling: Archetype classification & risk profiles</li>
                  <li>Progressive Refinement: Multi-call data improvement</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Extended Dream DNA System */}
          <div style={{
            background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
            padding: '2rem',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            marginBottom: '2rem'
          }}>
            <h2 style={{ margin: '0 0 20px 0', color: '#56b978', fontSize: '28px' }}>🔍 Extended Dream DNA System</h2>
            <p style={{ color: '#cccccc', fontSize: '16px', marginBottom: '20px' }}>
              Advanced psychological profiling and business intelligence fields available in the legacy system
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              
              {/* Vision & Purpose */}
              <div style={{ padding: '20px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px' }}>
                <h3 style={{ margin: '0 0 16px 0', color: '#56b978', fontSize: '20px' }}>💭 Vision & Purpose</h3>
                <ul style={{ color: '#cccccc', fontSize: '14px', paddingLeft: '20px', margin: 0 }}>
                  <li><strong>vision_statement:</strong> "I want to..." patterns</li>
                  <li><strong>core_purpose:</strong> "Because..." patterns</li>
                  <li><strong>impact_goal:</strong> "To help..." patterns</li>
                  <li><strong>legacy_vision:</strong> "So that..." patterns</li>
                  <li><strong>passion_driver:</strong> "I'm excited about..."</li>
                </ul>
              </div>

              {/* Business Dream Details */}
              <div style={{ padding: '20px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px' }}>
                <h3 style={{ margin: '0 0 16px 0', color: '#56b978', fontSize: '20px' }}>💼 Business Dream Details</h3>
                <ul style={{ color: '#cccccc', fontSize: '14px', paddingLeft: '20px', margin: 0 }}>
                  <li><strong>business_concept:</strong> "Start a..." patterns</li>
                  <li><strong>target_customers:</strong> "For...who" patterns</li>
                  <li><strong>unique_value_prop:</strong> "Different because..."</li>
                  <li><strong>scalability_vision:</strong> "Scale to..." patterns</li>
                  <li><strong>revenue_goals:</strong> "$X per month" patterns</li>
                </ul>
              </div>

              {/* Success Metrics & Goals */}
              <div style={{ padding: '20px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px' }}>
                <h3 style={{ margin: '0 0 16px 0', color: '#56b978', fontSize: '20px' }}>🎯 Success Metrics & Goals</h3>
                <ul style={{ color: '#cccccc', fontSize: '14px', paddingLeft: '20px', margin: 0 }}>
                  <li><strong>lifestyle_goals:</strong> "Give me freedom to..."</li>
                  <li><strong>freedom_level:</strong> Desired autonomy</li>
                  <li><strong>growth_timeline:</strong> Timeline expectations</li>
                  <li><strong>exit_strategy:</strong> Long-term plans</li>
                  <li><strong>success_milestones:</strong> Structured goals (JSONB)</li>
                </ul>
              </div>

              {/* Psychological Profile */}
              <div style={{ padding: '20px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px' }}>
                <h3 style={{ margin: '0 0 16px 0', color: '#56b978', fontSize: '20px' }}>🧠 Psychological Profile</h3>
                <ul style={{ color: '#cccccc', fontSize: '14px', paddingLeft: '20px', margin: 0 }}>
                  <li><strong>risk_tolerance:</strong> Risk appetite indicators</li>
                  <li><strong>urgency_level:</strong> "Need to start ASAP"</li>
                  <li><strong>confidence_level:</strong> Confidence indicators (1-10)</li>
                  <li><strong>support_needs:</strong> Help requirements</li>
                  <li><strong>motivation_factors:</strong> What drives them (JSONB)</li>
                </ul>
              </div>

              {/* Package & Preferences */}
              <div style={{ padding: '20px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px' }}>
                <h3 style={{ margin: '0 0 16px 0', color: '#56b978', fontSize: '20px' }}>💰 Package & Preferences</h3>
                <ul style={{ color: '#cccccc', fontSize: '14px', paddingLeft: '20px', margin: 0 }}>
                  <li><strong>package_preference:</strong> Package mentions</li>
                  <li><strong>budget_range:</strong> Budget indicators</li>
                  <li><strong>budget_mentioned:</strong> Specific amounts</li>
                  <li><strong>timeline_preference:</strong> Desired timeline</li>
                  <li><strong>key_requirements:</strong> Must-have features (JSONB)</li>
                </ul>
              </div>

              {/* AI Analysis Fields */}
              <div style={{ padding: '20px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px' }}>
                <h3 style={{ margin: '0 0 16px 0', color: '#56b978', fontSize: '20px' }}>🤖 AI Analysis Fields</h3>
                <ul style={{ color: '#cccccc', fontSize: '14px', paddingLeft: '20px', margin: 0 }}>
                  <li><strong>confidence_score:</strong> AI reliability scores (0.0-1.0)</li>
                  <li><strong>extraction_source:</strong> Data provenance tracking</li>
                  <li><strong>validated_by_user:</strong> User confirmation status</li>
                  <li><strong>archetype_classification:</strong> Innovator/Optimizer/Traditionalist</li>
                  <li><strong>growth_ambition:</strong> Lifestyle/Growth/Scale</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
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
              {completionPercentage < 100 ? (
                <button 
                  onClick={() => router.push('/dream-dna-setup')}
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
                  🧬 Complete Dream DNA
                </button>
              ) : (
                <button 
                  onClick={() => router.push('/dream-dna-setup')}
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
                  🧬 Update Dream DNA
                </button>
              )}
              <button 
                onClick={() => router.push('/user-profile')}
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
                👤 User Profile
              </button>
              <button 
                onClick={() => router.push('/simple-portal')}
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
              <button 
                onClick={() => router.push('/voice-domain-assistant')}
                style={{
                  background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
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
                🎤 Voice Assistant
              </button>
              <button 
                onClick={() => router.push('/domain-checker')}
                style={{
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
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
            <p style={{ margin: 0 }}>Dream DNA powers AI voice assistance, website generation, marketing automation, and intelligent business formation</p>
          </div>
        </div>
      </div>
    </>
  )
}
