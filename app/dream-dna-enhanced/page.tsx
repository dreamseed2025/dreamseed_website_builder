'use client'

import { useState, useEffect } from 'react'
import { createSupabaseClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

// Types
interface DreamField {
  id: string
  field_name: string
  locked_value?: string
  suggested_value?: string
  display_value?: string
  field_status: 'empty' | 'suggested' | 'locked'
  confidence_score?: number
  locked_at?: string
  suggested_at?: string
  locked_source?: string
  suggested_source?: string
  user_rejected_suggestion?: boolean
  field_category: string
  priority_level: number
  required_for_formation: boolean
}

interface FieldCategory {
  id: string
  name: string
  icon: string
  description: string
  fields: DreamField[]
  expanded: boolean
}

export default function DreamDNAEnhanced() {
  const [user, setUser] = useState<any>(null)
  const [categories, setCategories] = useState<FieldCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<string, boolean>>({})
  
  const supabase = createSupabaseClient()
  const router = useRouter()

  // Field Descriptions Configuration
  const fieldDescriptions: Record<string, { description: string; uses: string[]; neuralNetworkValue: string }> = {
    // Business Foundation
    'business_name': {
      description: 'The legal name of your business entity that will appear on all official documents and registrations.',
      uses: ['Legal formation documents', 'Business registration', 'Domain suggestions', 'Branding consistency', 'Banking and contracts'],
      neuralNetworkValue: 'Primary business identifier for entity formation, domain matching, and brand consistency algorithms.'
    },
    'what_problem': {
      description: 'The core problem or pain point your business solves for customers. This defines your value proposition.',
      uses: ['Marketing messaging', 'Website content', 'Investor pitches', 'Product positioning', 'Customer acquisition'],
      neuralNetworkValue: 'Core value proposition vector for market positioning, competitive analysis, and customer targeting models.'
    },
    'who_serves': {
      description: 'Your target customer base - the specific group of people or businesses who need your solution.',
      uses: ['Marketing strategy', 'Customer personas', 'Sales targeting', 'Product development', 'Market sizing'],
      neuralNetworkValue: 'Customer segmentation data for demographic targeting, market analysis, and persona matching algorithms.'
    },
    'how_different': {
      description: 'What makes your business unique compared to competitors. Your competitive advantage or differentiation.',
      uses: ['Competitive analysis', 'Marketing positioning', 'Investor materials', 'Pricing strategy', 'Brand messaging'],
      neuralNetworkValue: 'Differentiation vector for competitive positioning models and unique value proposition algorithms.'
    },
    'primary_service': {
      description: 'The main product or service your business provides to generate revenue.',
      uses: ['Business model design', 'Revenue projections', 'Operations planning', 'Service delivery', 'Pricing strategy'],
      neuralNetworkValue: 'Service classification for business model matching, industry categorization, and revenue prediction models.'
    },

    // Financial Planning
    'target_revenue': {
      description: 'Your revenue goal for the first year of operations. Used for financial planning and business scaling.',
      uses: ['Financial projections', 'Funding requirements', 'Business scaling', 'Package selection', 'Growth planning'],
      neuralNetworkValue: 'Revenue target for financial modeling, package recommendation algorithms, and growth trajectory prediction.'
    },
    'business_model': {
      description: 'How your business generates revenue (SaaS, E-commerce, Services, etc.).',
      uses: ['Financial structure', 'Operations planning', 'Investor materials', 'Scalability assessment', 'Resource allocation'],
      neuralNetworkValue: 'Business model classification for revenue prediction, operational requirement matching, and scaling algorithms.'
    },
    'startup_capital_needed': {
      description: 'The amount of initial funding required to start and operate your business until profitability.',
      uses: ['Funding strategy', 'Financial planning', 'Investor discussions', 'Package selection', 'Cash flow planning'],
      neuralNetworkValue: 'Capital requirement input for funding recommendation models and financial planning algorithms.'
    },
    'revenue_projections_year1': {
      description: 'Detailed revenue forecast for your first year, broken down by quarters or months.',
      uses: ['Business plan', 'Investor presentations', 'Financial modeling', 'Growth tracking', 'Performance metrics'],
      neuralNetworkValue: 'Revenue projection data for financial forecasting models and business performance prediction algorithms.'
    },
    'funding_sources': {
      description: 'Where you plan to get funding (personal savings, investors, loans, grants, etc.).',
      uses: ['Financial strategy', 'Investor outreach', 'Business plan', 'Risk assessment', 'Capital structure'],
      neuralNetworkValue: 'Funding source classification for capital strategy matching and risk assessment models.'
    },

    // Legal Structure
    'business_state': {
      description: 'The state where you want to legally form your business entity. Affects taxes and legal requirements.',
      uses: ['Legal formation', 'Tax planning', 'Compliance requirements', 'Business registration', 'Annual reporting'],
      neuralNetworkValue: 'Jurisdiction selection for legal requirement matching, tax optimization, and compliance automation algorithms.'
    },
    'entity_type': {
      description: 'The legal structure of your business (LLC, Corporation, Partnership, etc.).',
      uses: ['Legal formation', 'Tax implications', 'Liability protection', 'Ownership structure', 'Investment readiness'],
      neuralNetworkValue: 'Entity type classification for legal requirement matching, tax optimization, and formation process automation.'
    },
    'registered_agent_name': {
      description: 'The person or company designated to receive legal documents on behalf of your business.',
      uses: ['Legal compliance', 'Service of process', 'State requirements', 'Business privacy', 'Legal notifications'],
      neuralNetworkValue: 'Registered agent requirement for compliance automation and legal document routing algorithms.'
    },
    'registered_agent_address': {
      description: 'The physical address where your registered agent can be reached during business hours.',
      uses: ['Legal compliance', 'State filing', 'Legal document delivery', 'Business registration', 'Annual reports'],
      neuralNetworkValue: 'Address validation for compliance verification and legal requirement matching algorithms.'
    },
    'business_purpose': {
      description: 'A legal statement describing what your business does, required for formation documents.',
      uses: ['Legal formation', 'Articles of incorporation', 'Business registration', 'License applications', 'Banking'],
      neuralNetworkValue: 'Business purpose classification for legal document generation and regulatory compliance matching.'
    },

    // Operations & Team
    'number_of_employees_planned': {
      description: 'How many people you plan to hire in your first year of operations.',
      uses: ['Payroll planning', 'Tax requirements', 'Insurance needs', 'Office space planning', 'HR compliance'],
      neuralNetworkValue: 'Employee count for operational requirement prediction, tax obligation calculation, and scaling timeline models.'
    },
    'will_have_physical_location': {
      description: 'Whether your business will operate from a physical storefront, office, or warehouse.',
      uses: ['Licensing requirements', 'Zoning compliance', 'Insurance needs', 'Tax implications', 'Operations planning'],
      neuralNetworkValue: 'Location requirement for zoning compliance, licensing automation, and operational setup matching algorithms.'
    },
    'home_based_business': {
      description: 'Whether you plan to operate your business from your home address.',
      uses: ['Zoning compliance', 'Tax deductions', 'Insurance considerations', 'License requirements', 'Business setup'],
      neuralNetworkValue: 'Home-based classification for regulatory compliance, tax optimization, and setup requirement matching.'
    },
    'equipment_needed': {
      description: 'Specific equipment, machinery, or tools required to operate your business.',
      uses: ['Capital planning', 'Insurance coverage', 'Tax deductions', 'Operations setup', 'Financing needs'],
      neuralNetworkValue: 'Equipment requirements for capital planning models, insurance calculation, and operational setup automation.'
    },
    'technology_requirements': {
      description: 'Software, hardware, and technology infrastructure needed to run your business.',
      uses: ['IT planning', 'Budget allocation', 'Security requirements', 'Scalability planning', 'Vendor selection'],
      neuralNetworkValue: 'Technology stack classification for IT requirement matching, security assessment, and integration planning algorithms.'
    },

    // Market Strategy
    'industry_category': {
      description: 'The primary industry or market sector your business operates in.',
      uses: ['Market analysis', 'Regulatory requirements', 'Industry-specific licensing', 'Competitive research', 'Investor targeting'],
      neuralNetworkValue: 'Industry classification for regulatory requirement matching, market analysis, and competitive intelligence algorithms.'
    },
    'geographic_focus': {
      description: 'The geographic area where you plan to serve customers (local, regional, national, global).',
      uses: ['Market strategy', 'Marketing budget', 'Licensing requirements', 'Tax implications', 'Logistics planning'],
      neuralNetworkValue: 'Geographic scope for market sizing, regulatory compliance, and expansion strategy algorithms.'
    },
    'unique_value_proposition': {
      description: 'A clear statement of what unique value your business provides that competitors don\'t.',
      uses: ['Marketing messaging', 'Sales materials', 'Website content', 'Investor pitches', 'Brand positioning'],
      neuralNetworkValue: 'Value proposition vector for competitive differentiation, marketing optimization, and positioning algorithms.'
    },
    'competitive_advantage': {
      description: 'Specific advantages your business has over competitors (technology, cost, location, expertise, etc.).',
      uses: ['Strategic planning', 'Marketing strategy', 'Investor materials', 'Pricing decisions', 'Market positioning'],
      neuralNetworkValue: 'Competitive advantage classification for strategic planning, market positioning, and differentiation algorithms.'
    },
    'target_customer_demographics': {
      description: 'Detailed characteristics of your ideal customers (age, income, location, business type, etc.).',
      uses: ['Marketing strategy', 'Customer acquisition', 'Product development', 'Pricing strategy', 'Channel selection'],
      neuralNetworkValue: 'Demographic data for customer targeting models, acquisition optimization, and persona matching algorithms.'
    },

    // Brand & Digital
    'brand_personality': {
      description: 'The personality traits and characteristics that define your brand (professional, friendly, innovative, etc.).',
      uses: ['Brand messaging', 'Website design', 'Marketing tone', 'Customer communication', 'Visual identity'],
      neuralNetworkValue: 'Brand personality classification for template matching, messaging optimization, and visual design algorithms.'
    },
    'preferred_domain_name': {
      description: 'The website domain name you want for your business (e.g., yourbusiness.com).',
      uses: ['Website creation', 'Email setup', 'Brand consistency', 'Online presence', 'SEO foundation'],
      neuralNetworkValue: 'Domain preference for availability checking, suggestion algorithms, and brand consistency matching.'
    },
    'website_needed': {
      description: 'Whether your business needs a website for online presence and customer engagement.',
      uses: ['Digital strategy', 'Budget planning', 'Marketing channels', 'Customer acquisition', 'Online sales'],
      neuralNetworkValue: 'Website requirement classification for digital strategy planning and resource allocation algorithms.'
    },
    'social_media_strategy': {
      description: 'Your plan for using social media platforms to market and grow your business.',
      uses: ['Marketing strategy', 'Customer engagement', 'Brand building', 'Content planning', 'Lead generation'],
      neuralNetworkValue: 'Social media strategy classification for marketing automation, content planning, and engagement optimization.'
    },
    'logo_needed': {
      description: 'Whether your business needs a professional logo for brand identity.',
      uses: ['Brand identity', 'Marketing materials', 'Website design', 'Business cards', 'Legal documents'],
      neuralNetworkValue: 'Logo requirement for brand development timeline and design resource allocation algorithms.'
    },

    // Timeline & Goals
    'timeline_to_launch': {
      description: 'How many months until you want your business to be fully operational and serving customers.',
      uses: ['Project planning', 'Resource allocation', 'Milestone setting', 'Urgency assessment', 'Package selection'],
      neuralNetworkValue: 'Launch timeline for project scheduling algorithms, resource planning, and urgency-based routing.'
    },
    'growth_timeline': {
      description: 'Your planned timeline for business growth milestones and expansion phases.',
      uses: ['Strategic planning', 'Investment planning', 'Resource forecasting', 'Performance tracking', 'Scaling decisions'],
      neuralNetworkValue: 'Growth timeline data for scaling prediction models, resource planning algorithms, and milestone tracking.'
    },
    'success_milestones': {
      description: 'Specific measurable goals and achievements you want to reach at different stages.',
      uses: ['Performance tracking', 'Goal setting', 'Progress measurement', 'Investor updates', 'Team motivation'],
      neuralNetworkValue: 'Success milestone data for performance prediction models, goal tracking algorithms, and achievement analytics.'
    },
    'exit_strategy': {
      description: 'Your long-term plan for the business (sell, pass down, IPO, keep forever, etc.).',
      uses: ['Strategic planning', 'Investment decisions', 'Business structure', 'Financial planning', 'Investor discussions'],
      neuralNetworkValue: 'Exit strategy classification for long-term planning algorithms, investment matching, and strategic decision models.'
    },
    'lifestyle_goals': {
      description: 'How you want the business to fit into and improve your personal life and lifestyle.',
      uses: ['Work-life balance', 'Business model design', 'Operational structure', 'Growth decisions', 'Personal motivation'],
      neuralNetworkValue: 'Lifestyle goal classification for business model matching, operational design, and personal satisfaction optimization.'
    },

    // Psychology Profile
    'risk_tolerance': {
      description: 'Your comfort level with business and financial risk (conservative, moderate, aggressive).',
      uses: ['Business strategy', 'Investment decisions', 'Growth planning', 'Package selection', 'Decision making'],
      neuralNetworkValue: 'Risk tolerance classification for recommendation algorithms, strategy matching, and decision support models.'
    },
    'urgency_level': {
      description: 'How quickly you need to get your business started and operational.',
      uses: ['Service prioritization', 'Resource allocation', 'Timeline planning', 'Package selection', 'Support level'],
      neuralNetworkValue: 'Urgency classification for priority routing, resource allocation algorithms, and service level matching.'
    },
    'confidence_level': {
      description: 'How confident you feel about starting and running your business (1-10 scale).',
      uses: ['Support needs assessment', 'Coaching level', 'Resource allocation', 'Service customization', 'Success prediction'],
      neuralNetworkValue: 'Confidence scoring for support level algorithms, coaching intensity matching, and success probability models.'
    },
    'support_needs': {
      description: 'Areas where you need the most help and guidance in starting your business.',
      uses: ['Service customization', 'Resource allocation', 'Expert matching', 'Training priorities', 'Success planning'],
      neuralNetworkValue: 'Support requirement classification for service matching algorithms, expert allocation, and success optimization models.'
    },
    'motivation_factors': {
      description: 'What drives and motivates you to start this business (financial freedom, passion, impact, etc.).',
      uses: ['Personal coaching', 'Goal alignment', 'Strategy customization', 'Success metrics', 'Decision guidance'],
      neuralNetworkValue: 'Motivation factor analysis for personalization algorithms, goal alignment matching, and engagement optimization models.'
    }
  }

  const toggleDescriptionExpanded = (fieldName: string) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [fieldName]: !prev[fieldName]
    }))
  }

  // Field Categories Configuration
  const categoryConfig = [
    {
      id: 'business_foundation',
      name: 'Business Foundation',
      icon: '🏢',
      description: 'Core business concept and value proposition',
      fields: ['business_name', 'what_problem', 'who_serves', 'how_different', 'primary_service']
    },
    {
      id: 'financial_planning', 
      name: 'Financial Planning',
      icon: '💰',
      description: 'Revenue goals, funding, and financial structure',
      fields: ['target_revenue', 'business_model', 'startup_capital_needed', 'revenue_projections_year1', 'funding_sources']
    },
    {
      id: 'legal_structure',
      name: 'Legal Structure', 
      icon: '⚖️',
      description: 'Entity formation and legal requirements',
      fields: ['business_state', 'entity_type', 'registered_agent_name', 'registered_agent_address', 'business_purpose']
    },
    {
      id: 'operations',
      name: 'Operations & Team',
      icon: '👥', 
      description: 'Operational structure and team planning',
      fields: ['number_of_employees_planned', 'will_have_physical_location', 'home_based_business', 'equipment_needed', 'technology_requirements']
    },
    {
      id: 'market_strategy',
      name: 'Market Strategy',
      icon: '📈',
      description: 'Market positioning and competitive strategy', 
      fields: ['industry_category', 'geographic_focus', 'unique_value_proposition', 'competitive_advantage', 'target_customer_demographics']
    },
    {
      id: 'brand_identity',
      name: 'Brand & Digital',
      icon: '🎨',
      description: 'Brand personality and digital presence',
      fields: ['brand_personality', 'preferred_domain_name', 'website_needed', 'social_media_strategy', 'logo_needed']
    },
    {
      id: 'timeline_goals',
      name: 'Timeline & Goals',
      icon: '⏱️',
      description: 'Launch timeline and success milestones',
      fields: ['timeline_to_launch', 'growth_timeline', 'success_milestones', 'exit_strategy', 'lifestyle_goals']
    },
    {
      id: 'psychology_profile',
      name: 'Psychology Profile', 
      icon: '🧠',
      description: 'Risk tolerance and motivation factors',
      fields: ['risk_tolerance', 'urgency_level', 'confidence_level', 'support_needs', 'motivation_factors']
    }
  ]

  useEffect(() => {
    loadUserAndFields()
  }, [])

  const loadUserAndFields = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get user session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        setError('Failed to get user session')
        return
      }

      if (!session?.user) {
        setError('Please sign in to access your Dream DNA')
        return
      }

      // Load user profile
      const response = await fetch('/api/user-profile')
      const result = await response.json()

      if (result.success && result.profile) {
        setUser(result.profile)
        
        // Load Dream DNA fields (mock data for now - replace with actual API)
        const mockFields = generateMockFields(result.profile.id)
        const categorizedFields = organizFieldsByCategory(mockFields)
        setCategories(categorizedFields)
      } else {
        setError('Failed to load user data')
      }

    } catch (err) {
      console.error('Load error:', err)
      setError('Failed to load Dream DNA data')
    } finally {
      setLoading(false)
    }
  }

  const generateMockFields = (userId: string): DreamField[] => {
    // This would be replaced with actual API call to get fields
    const mockData = [
      { field_name: 'business_name', locked_value: 'DreamTech Solutions', field_status: 'locked', locked_source: 'call_1', field_category: 'business_foundation' },
      { field_name: 'what_problem', suggested_value: 'Small businesses struggle with outdated website technology', field_status: 'suggested', confidence_score: 0.87, suggested_source: 'call_3', field_category: 'business_foundation' },
      { field_name: 'who_serves', field_status: 'empty', field_category: 'business_foundation' },
      { field_name: 'target_revenue', locked_value: '500000', field_status: 'locked', locked_source: 'call_2', field_category: 'financial_planning' },
      { field_name: 'business_state', suggested_value: 'Delaware', field_status: 'suggested', confidence_score: 0.72, suggested_source: 'domain_selection', field_category: 'legal_structure' },
      { field_name: 'entity_type', locked_value: 'LLC', field_status: 'locked', locked_source: 'manual', field_category: 'legal_structure' },
    ]

    return mockData.map(field => ({
      id: `${userId}_${field.field_name}`,
      field_name: field.field_name,
      locked_value: field.locked_value,
      suggested_value: field.suggested_value,
      display_value: field.locked_value || field.suggested_value || '',
      field_status: field.field_status as 'empty' | 'suggested' | 'locked',
      confidence_score: field.confidence_score,
      locked_source: field.locked_source,
      suggested_source: field.suggested_source,
      field_category: field.field_category,
      priority_level: 5,
      required_for_formation: ['business_name', 'business_state', 'entity_type'].includes(field.field_name)
    }))
  }

  const organizFieldsByCategory = (fields: DreamField[]): FieldCategory[] => {
    return categoryConfig.map(category => {
      const categoryFields = fields.filter(field => 
        category.fields.includes(field.field_name)
      ).sort((a, b) => b.priority_level - a.priority_level)

      return {
        ...category,
        fields: categoryFields,
        expanded: categoryFields.some(f => f.field_status === 'suggested') // Auto-expand if has suggestions
      }
    })
  }

  const toggleCategory = (categoryId: string) => {
    setCategories(prev => prev.map(cat => 
      cat.id === categoryId ? { ...cat, expanded: !cat.expanded } : cat
    ))
  }

  const handleAcceptSuggestion = async (fieldName: string) => {
    setSaving(true)
    try {
      // Update field to locked status
      setCategories(prev => prev.map(category => ({
        ...category,
        fields: category.fields.map(field => 
          field.field_name === fieldName ? {
            ...field,
            locked_value: field.suggested_value,
            field_status: 'locked' as const,
            locked_at: new Date().toISOString(),
            suggested_value: undefined
          } : field
        )
      })))
      
      // API call would go here
      console.log('Accepted suggestion for:', fieldName)
    } catch (error) {
      console.error('Failed to accept suggestion:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleRejectSuggestion = async (fieldName: string) => {
    setSaving(true)
    try {
      // Update field to empty status
      setCategories(prev => prev.map(category => ({
        ...category,
        fields: category.fields.map(field => 
          field.field_name === fieldName ? {
            ...field,
            field_status: 'empty' as const,
            suggested_value: undefined,
            user_rejected_suggestion: true
          } : field
        )
      })))
      
      console.log('Rejected suggestion for:', fieldName)
    } catch (error) {
      console.error('Failed to reject suggestion:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleEditField = (fieldName: string, currentValue: string) => {
    setEditingField(fieldName)
    setEditValue(currentValue)
  }

  const handleSaveEdit = async () => {
    if (!editingField) return
    
    setSaving(true)
    try {
      // Update field with new value
      setCategories(prev => prev.map(category => ({
        ...category,
        fields: category.fields.map(field => 
          field.field_name === editingField ? {
            ...field,
            locked_value: editValue,
            field_status: 'locked' as const,
            locked_at: new Date().toISOString(),
            suggested_value: undefined
          } : field
        )
      })))
      
      setEditingField(null)
      setEditValue('')
      console.log('Saved edit for:', editingField)
    } catch (error) {
      console.error('Failed to save edit:', error)
    } finally {
      setSaving(false)
    }
  }

  const getFieldStatusIcon = (status: string) => {
    switch (status) {
      case 'locked': return '✅'
      case 'suggested': return '🧬'
      case 'empty': return '⚪'
      default: return '⚪'
    }
  }

  const getFieldStatusColor = (status: string) => {
    switch (status) {
      case 'locked': return '#ffffff' // White for locked/confirmed
      case 'suggested': return '#008B8B' // Dark aqua blue for dream state
      case 'empty': return '#666666' // Dark gray for empty
      default: return '#666666'
    }
  }

  const getFieldStatusBg = (status: string) => {
    switch (status) {
      case 'locked': return 'rgba(255, 255, 255, 0.1)' // Light white background
      case 'suggested': return 'rgba(0, 139, 139, 0.1)' // Light aqua background
      case 'empty': return 'rgba(102, 102, 102, 0.05)' // Very light gray
      default: return 'rgba(102, 102, 102, 0.05)'
    }
  }

  const getCompletionStats = () => {
    const allFields = categories.flatMap(cat => cat.fields)
    const locked = allFields.filter(f => f.field_status === 'locked').length
    const suggested = allFields.filter(f => f.field_status === 'suggested').length
    const empty = allFields.filter(f => f.field_status === 'empty').length
    const total = allFields.length
    const percentage = total > 0 ? Math.round((locked / total) * 100) : 0
    
    return { locked, suggested, empty, total, percentage }
  }

  const formatFieldName = (fieldName: string) => {
    return fieldName.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
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
          <p style={{ fontSize: '18px', fontFamily: 'Poppins, sans-serif' }}>Loading Dream DNA Dashboard...</p>
        </div>
        <style jsx>{`
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
            onClick={() => router.push('/login')}
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

  const stats = getCompletionStats()

  return (
    <div style={{
      background: 'linear-gradient(135deg, #000000 0%, #1a0000 50%, #000000 100%)',
      minHeight: '100vh',
      color: 'white',
      fontFamily: 'Inter, sans-serif'
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
        opacity: 0.05
      }} />

      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '2rem',
        position: 'relative',
        zIndex: 10
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '48px',
            fontWeight: 'bold',
            marginBottom: '16px',
            background: 'linear-gradient(135deg, #ffffff 0%, #cccccc 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontFamily: 'Poppins, sans-serif'
          }}>
            🧬 Dream DNA Dashboard
          </h1>
          <p style={{
            fontSize: '20px',
            color: '#cccccc',
            marginBottom: '8px'
          }}>
            Interactive Business Formation Intelligence
          </p>
        </div>

        {/* Completion Summary */}
        <div style={{
          background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
          padding: '1.5rem',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '24px', color: '#ffffff' }}>
              📊 Completion: {stats.percentage}% ({stats.locked}/{stats.total} fields)
            </h2>
            <p style={{ margin: '8px 0 0 0', color: '#cccccc' }}>
              ✅ {stats.locked} Locked • 🧬 {stats.suggested} Suggested • ⚪ {stats.empty} Empty
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => router.push('/simple-portal')}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              🏠 Portal Home
            </button>
            <button
              onClick={() => router.push('/optimized-voice-demo')}
              style={{
                background: 'linear-gradient(135deg, #008B8B 0%, #20B2AA 100%)',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              🎤 Voice Assistant
            </button>
          </div>
        </div>

        {/* Field Categories */}
        <div style={{ display: 'grid', gap: '1rem' }}>
          {categories.map((category) => {
            const categoryStats = {
              total: category.fields.length,
              locked: category.fields.filter(f => f.field_status === 'locked').length,
              suggested: category.fields.filter(f => f.field_status === 'suggested').length
            }
            const categoryPercentage = categoryStats.total > 0 ? 
              Math.round((categoryStats.locked / categoryStats.total) * 100) : 0

            return (
              <div key={category.id} style={{
                background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                overflow: 'hidden'
              }}>
                {/* Category Header */}
                <div 
                  onClick={() => toggleCategory(category.id)}
                  style={{
                    padding: '1.5rem',
                    cursor: 'pointer',
                    borderBottom: category.expanded ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '24px' }}>{category.icon}</span>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '20px', color: '#ffffff' }}>
                        {category.name}
                      </h3>
                      <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#cccccc' }}>
                        {category.description}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ 
                        fontSize: '16px', 
                        fontWeight: 'bold', 
                        color: categoryPercentage === 100 ? '#ffffff' : '#008B8B' 
                      }}>
                        {categoryPercentage}%
                      </div>
                      <div style={{ fontSize: '12px', color: '#999' }}>
                        {categoryStats.locked}/{categoryStats.total}
                      </div>
                    </div>
                    <span style={{ 
                      fontSize: '20px', 
                      transform: category.expanded ? 'rotate(90deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease'
                    }}>
                      ▶
                    </span>
                  </div>
                </div>

                {/* Category Fields */}
                {category.expanded && (
                  <div style={{ padding: '0 1.5rem 1.5rem' }}>
                    {category.fields.length === 0 ? (
                      <p style={{ color: '#999', fontStyle: 'italic', margin: 0 }}>
                        No fields configured for this category yet.
                      </p>
                    ) : (
                      <div style={{ display: 'grid', gap: '1rem' }}>
                        {category.fields.map((field) => (
                          <div key={field.id} style={{
                            background: getFieldStatusBg(field.field_status),
                            padding: '1rem',
                            borderRadius: '12px',
                            border: `1px solid ${getFieldStatusColor(field.field_status)}40`
                          }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                  <span style={{ fontSize: '18px' }}>
                                    {getFieldStatusIcon(field.field_status)}
                                  </span>
                                  <h4 style={{ 
                                    margin: 0, 
                                    fontSize: '16px', 
                                    fontWeight: '600',
                                    color: getFieldStatusColor(field.field_status),
                                    flex: 1
                                  }}>
                                    {formatFieldName(field.field_name)}
                                    {field.required_for_formation && (
                                      <span style={{ 
                                        color: '#DC143C', 
                                        fontSize: '12px',
                                        marginLeft: '8px'
                                      }}>
                                        *Required
                                      </span>
                                    )}
                                  </h4>
                                  {fieldDescriptions[field.field_name] && (
                                    <button
                                      onClick={() => toggleDescriptionExpanded(field.field_name)}
                                      style={{
                                        background: 'none',
                                        border: '1px solid rgba(255, 255, 255, 0.3)',
                                        color: '#cccccc',
                                        borderRadius: '50%',
                                        width: '24px',
                                        height: '24px',
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                      }}
                                      title="Show field description and uses"
                                    >
                                      {expandedDescriptions[field.field_name] ? '−' : 'i'}
                                    </button>
                                  )}
                                </div>

                                {/* Field Description (Expandable) */}
                                {expandedDescriptions[field.field_name] && fieldDescriptions[field.field_name] && (
                                  <div style={{
                                    background: 'rgba(0, 139, 139, 0.1)',
                                    border: '1px solid rgba(0, 139, 139, 0.3)',
                                    borderRadius: '8px',
                                    padding: '12px',
                                    marginBottom: '12px',
                                    fontSize: '13px'
                                  }}>
                                    <div style={{ marginBottom: '8px' }}>
                                      <strong style={{ color: '#008B8B' }}>What it is:</strong>
                                      <p style={{ margin: '4px 0 0 0', color: '#cccccc' }}>
                                        {fieldDescriptions[field.field_name].description}
                                      </p>
                                    </div>
                                    
                                    <div style={{ marginBottom: '8px' }}>
                                      <strong style={{ color: '#008B8B' }}>Used for:</strong>
                                      <ul style={{ margin: '4px 0 0 20px', color: '#cccccc' }}>
                                        {fieldDescriptions[field.field_name].uses.map((use, index) => (
                                          <li key={index} style={{ margin: '2px 0' }}>{use}</li>
                                        ))}
                                      </ul>
                                    </div>

                                    <div>
                                      <strong style={{ color: '#008B8B' }}>Neural Network Value:</strong>
                                      <p style={{ 
                                        margin: '4px 0 0 0', 
                                        color: '#999', 
                                        fontStyle: 'italic',
                                        fontSize: '12px'
                                      }}>
                                        {fieldDescriptions[field.field_name].neuralNetworkValue}
                                      </p>
                                    </div>
                                  </div>
                                )}

                                {/* Field Value Display */}
                                {editingField === field.field_name ? (
                                  <div style={{ marginBottom: '12px' }}>
                                    <input
                                      type="text"
                                      value={editValue}
                                      onChange={(e) => setEditValue(e.target.value)}
                                      style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        borderRadius: '6px',
                                        border: '1px solid #56b978',
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        color: 'white',
                                        fontSize: '14px'
                                      }}
                                      placeholder={`Enter ${formatFieldName(field.field_name).toLowerCase()}...`}
                                    />
                                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                      <button
                                        onClick={handleSaveEdit}
                                        disabled={saving}
                                        style={{
                                          background: '#008B8B',
                                          color: 'white',
                                          border: 'none',
                                          padding: '6px 12px',
                                          borderRadius: '4px',
                                          cursor: 'pointer',
                                          fontSize: '12px'
                                        }}
                                      >
                                        💾 Save
                                      </button>
                                      <button
                                        onClick={() => {
                                          setEditingField(null)
                                          setEditValue('')
                                        }}
                                        style={{
                                          background: '#DC143C',
                                          color: 'white',
                                          border: 'none',
                                          padding: '6px 12px',
                                          borderRadius: '4px',
                                          cursor: 'pointer',
                                          fontSize: '12px'
                                        }}
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div style={{ marginBottom: '12px' }}>
                                    <div style={{ 
                                      fontSize: '14px', 
                                      color: '#ffffff',
                                      fontWeight: '500',
                                      marginBottom: '4px'
                                    }}>
                                      {field.field_status === 'empty' ? (
                                        <span style={{ color: '#999', fontStyle: 'italic' }}>
                                          Click to add {formatFieldName(field.field_name).toLowerCase()}...
                                        </span>
                                      ) : (
                                        field.display_value || 'No value'
                                      )}
                                    </div>
                                    
                                    {/* Metadata */}
                                    <div style={{ fontSize: '12px', color: '#999' }}>
                                      {field.field_status === 'locked' && field.locked_source && (
                                        <>✅ Locked from {field.locked_source}</>
                                      )}
                                      {field.field_status === 'suggested' && field.confidence_score && (
                                        <>🤖 AI suggestion ({Math.round(field.confidence_score * 100)}% confidence)</>
                                      )}
                                      {field.field_status === 'empty' && (
                                        <>❓ Awaiting data</>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Action Buttons */}
                              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                                {field.field_status === 'suggested' && (
                                  <>
                                    <button
                                      onClick={() => handleAcceptSuggestion(field.field_name)}
                                      disabled={saving}
                                      style={{
                                        background: '#008B8B',
                                        color: 'white',
                                        border: 'none',
                                        padding: '6px 12px',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '12px'
                                      }}
                                    >
                                      ✓
                                    </button>
                                    <button
                                      onClick={() => handleRejectSuggestion(field.field_name)}
                                      disabled={saving}
                                      style={{
                                        background: '#DC143C',
                                        color: 'white',
                                        border: 'none',
                                        padding: '6px 12px',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '12px'
                                      }}
                                    >
                                      ✗
                                    </button>
                                  </>
                                )}
                                <button
                                  onClick={() => handleEditField(field.field_name, field.display_value || '')}
                                  style={{
                                    background: 'rgba(255, 255, 255, 0.2)',
                                    color: 'white',
                                    border: '1px solid rgba(255, 255, 255, 0.3)',
                                    padding: '6px 12px',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '12px'
                                  }}
                                >
                                  ✏️
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          padding: '2rem 0',
          marginTop: '2rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          color: '#999',
          fontSize: '14px'
        }}>
          <p style={{ margin: 0 }}>
            🧬 Dream DNA powers intelligent business formation • Built with ❤️ for entrepreneurs
          </p>
        </div>
      </div>
    </div>
  )
}