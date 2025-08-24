import { NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase'

// Types
interface DreamField {
  id: string
  user_id: string
  field_name: string
  locked_value?: string
  suggested_value?: string
  display_value?: string
  field_status: 'empty' | 'suggested' | 'locked'
  confidence_score?: number
  confidence_threshold: number
  locked_at?: string
  suggested_at?: string
  locked_source?: string
  suggested_source?: string
  user_rejected_suggestion: boolean
  user_edit_count: number
  field_category: string
  priority_level: number
  required_for_formation: boolean
  last_updated: string
}

// GET - Retrieve all Dream DNA fields for a user
export async function GET(request: Request) {
  try {
    const supabase = createSupabaseClient()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    if (!userId) {
      return NextResponse.json({
        success: false,
        message: 'User ID is required'
      }, { status: 400 })
    }

    // Get user session for verification
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session?.user) {
      return NextResponse.json({
        success: false,
        message: 'Authentication required'
      }, { status: 401 })
    }

    // For now, return mock data - replace with actual database query
    const mockFields = generateMockDreamFields(userId)
    
    return NextResponse.json({
      success: true,
      fields: mockFields,
      stats: calculateFieldStats(mockFields)
    })

  } catch (error) {
    console.error('Error fetching Dream DNA fields:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch Dream DNA fields'
    }, { status: 500 })
  }
}

// PUT - Update a Dream DNA field
export async function PUT(request: Request) {
  try {
    const supabase = createSupabaseClient()
    const body = await request.json()
    
    const { 
      user_id, 
      field_name, 
      action, // 'accept_suggestion' | 'reject_suggestion' | 'manual_edit' | 'lock_value'
      value,
      source 
    } = body

    if (!user_id || !field_name || !action) {
      return NextResponse.json({
        success: false,
        message: 'user_id, field_name, and action are required'
      }, { status: 400 })
    }

    // Get user session for verification
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session?.user) {
      return NextResponse.json({
        success: false,
        message: 'Authentication required'
      }, { status: 401 })
    }

    // Process the action
    let updatedField: Partial<DreamField> = {
      user_id,
      field_name,
      last_updated: new Date().toISOString()
    }

    switch (action) {
      case 'accept_suggestion':
        // Move suggested value to locked value
        updatedField = {
          ...updatedField,
          field_status: 'locked',
          locked_at: new Date().toISOString(),
          locked_source: source || 'user_action',
          suggested_value: undefined // Clear suggestion
        }
        break

      case 'reject_suggestion':
        // Clear suggestion and mark as empty
        updatedField = {
          ...updatedField,
          field_status: 'empty',
          suggested_value: undefined,
          user_rejected_suggestion: true
        }
        break

      case 'manual_edit':
        // Set new value and lock it
        updatedField = {
          ...updatedField,
          locked_value: value,
          field_status: 'locked',
          locked_at: new Date().toISOString(),
          locked_source: 'manual_edit',
          user_edit_count: 1 // In real implementation, increment existing count
        }
        break

      case 'lock_value':
        // Lock current value without changing it
        updatedField = {
          ...updatedField,
          field_status: 'locked',
          locked_at: new Date().toISOString(),
          locked_source: source || 'user_action'
        }
        break

      default:
        return NextResponse.json({
          success: false,
          message: 'Invalid action'
        }, { status: 400 })
    }

    // In real implementation, update the database
    console.log('Field update:', updatedField)

    return NextResponse.json({
      success: true,
      message: 'Field updated successfully',
      field: updatedField
    })

  } catch (error) {
    console.error('Error updating Dream DNA field:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to update Dream DNA field'
    }, { status: 500 })
  }
}

// POST - Bulk update multiple fields
export async function POST(request: Request) {
  try {
    const supabase = createSupabaseClient()
    const body = await request.json()
    
    const { user_id, updates } = body

    if (!user_id || !updates || !Array.isArray(updates)) {
      return NextResponse.json({
        success: false,
        message: 'user_id and updates array are required'
      }, { status: 400 })
    }

    // Get user session for verification
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session?.user) {
      return NextResponse.json({
        success: false,
        message: 'Authentication required'
      }, { status: 401 })
    }

    // Process bulk updates
    const results = []
    
    for (const update of updates) {
      const { field_name, action, value, source } = update
      
      if (!field_name || !action) {
        results.push({
          field_name,
          success: false,
          message: 'field_name and action are required'
        })
        continue
      }

      // Process each update (same logic as PUT endpoint)
      let updatedField: Partial<DreamField> = {
        user_id,
        field_name,
        last_updated: new Date().toISOString()
      }

      switch (action) {
        case 'accept_suggestion':
          updatedField.field_status = 'locked'
          updatedField.locked_at = new Date().toISOString()
          updatedField.locked_source = source || 'bulk_action'
          break

        case 'reject_suggestion':
          updatedField.field_status = 'empty'
          updatedField.user_rejected_suggestion = true
          break

        case 'manual_edit':
          updatedField.locked_value = value
          updatedField.field_status = 'locked'
          updatedField.locked_at = new Date().toISOString()
          updatedField.locked_source = 'bulk_edit'
          break
      }

      results.push({
        field_name,
        success: true,
        field: updatedField
      })
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${results.length} field updates`,
      results
    })

  } catch (error) {
    console.error('Error bulk updating Dream DNA fields:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to bulk update Dream DNA fields'
    }, { status: 500 })
  }
}

// Helper Functions
function generateMockDreamFields(userId: string): DreamField[] {
  const now = new Date().toISOString()
  
  return [
    // Business Foundation
    {
      id: `${userId}_business_name`,
      user_id: userId,
      field_name: 'business_name',
      locked_value: 'DreamTech Solutions',
      display_value: 'DreamTech Solutions',
      field_status: 'locked',
      locked_at: '2025-08-23T10:30:00Z',
      locked_source: 'call_1',
      field_category: 'business_foundation',
      priority_level: 10,
      required_for_formation: true,
      confidence_threshold: 0.75,
      user_rejected_suggestion: false,
      user_edit_count: 0,
      last_updated: now
    },
    {
      id: `${userId}_what_problem`,
      user_id: userId,
      field_name: 'what_problem',
      suggested_value: 'Small businesses struggle with outdated website technology that limits their growth',
      display_value: 'Small businesses struggle with outdated website technology that limits their growth',
      field_status: 'suggested',
      confidence_score: 0.87,
      suggested_at: '2025-08-24T14:20:00Z',
      suggested_source: 'call_3',
      field_category: 'business_foundation',
      priority_level: 9,
      required_for_formation: true,
      confidence_threshold: 0.75,
      user_rejected_suggestion: false,
      user_edit_count: 0,
      last_updated: now
    },
    {
      id: `${userId}_who_serves`,
      user_id: userId,
      field_name: 'who_serves',
      field_status: 'empty',
      field_category: 'business_foundation',
      priority_level: 9,
      required_for_formation: true,
      confidence_threshold: 0.75,
      user_rejected_suggestion: false,
      user_edit_count: 0,
      last_updated: now
    },
    {
      id: `${userId}_how_different`,
      user_id: userId,
      field_name: 'how_different',
      suggested_value: 'We provide modern, AI-powered web solutions specifically designed for small business needs',
      display_value: 'We provide modern, AI-powered web solutions specifically designed for small business needs',
      field_status: 'suggested',
      confidence_score: 0.79,
      suggested_at: '2025-08-24T14:25:00Z',
      suggested_source: 'call_3',
      field_category: 'business_foundation',
      priority_level: 8,
      required_for_formation: false,
      confidence_threshold: 0.75,
      user_rejected_suggestion: false,
      user_edit_count: 0,
      last_updated: now
    },
    
    // Financial Planning
    {
      id: `${userId}_target_revenue`,
      user_id: userId,
      field_name: 'target_revenue',
      locked_value: '500000',
      display_value: '$500,000',
      field_status: 'locked',
      locked_at: '2025-08-22T16:45:00Z',
      locked_source: 'call_2',
      field_category: 'financial_planning',
      priority_level: 8,
      required_for_formation: false,
      confidence_threshold: 0.75,
      user_rejected_suggestion: false,
      user_edit_count: 0,
      last_updated: now
    },
    {
      id: `${userId}_business_model`,
      user_id: userId,
      field_name: 'business_model',
      suggested_value: 'SaaS with professional services',
      display_value: 'SaaS with professional services',
      field_status: 'suggested',
      confidence_score: 0.82,
      suggested_at: '2025-08-24T14:30:00Z',
      suggested_source: 'call_3',
      field_category: 'financial_planning',
      priority_level: 7,
      required_for_formation: false,
      confidence_threshold: 0.75,
      user_rejected_suggestion: false,
      user_edit_count: 0,
      last_updated: now
    },
    
    // Legal Structure
    {
      id: `${userId}_business_state`,
      user_id: userId,
      field_name: 'business_state',
      suggested_value: 'Delaware',
      display_value: 'Delaware',
      field_status: 'suggested',
      confidence_score: 0.72,
      suggested_at: '2025-08-24T09:15:00Z',
      suggested_source: 'domain_selection',
      field_category: 'legal_structure',
      priority_level: 10,
      required_for_formation: true,
      confidence_threshold: 0.75,
      user_rejected_suggestion: false,
      user_edit_count: 0,
      last_updated: now
    },
    {
      id: `${userId}_entity_type`,
      user_id: userId,
      field_name: 'entity_type',
      locked_value: 'LLC',
      display_value: 'LLC',
      field_status: 'locked',
      locked_at: '2025-08-20T11:00:00Z',
      locked_source: 'manual',
      field_category: 'legal_structure',
      priority_level: 10,
      required_for_formation: true,
      confidence_threshold: 0.75,
      user_rejected_suggestion: false,
      user_edit_count: 1,
      last_updated: now
    }
  ]
}

function calculateFieldStats(fields: DreamField[]) {
  const total = fields.length
  const locked = fields.filter(f => f.field_status === 'locked').length
  const suggested = fields.filter(f => f.field_status === 'suggested').length
  const empty = fields.filter(f => f.field_status === 'empty').length
  const critical = fields.filter(f => f.required_for_formation).length
  const criticalCompleted = fields.filter(f => f.required_for_formation && f.field_status === 'locked').length
  
  return {
    total,
    locked,
    suggested,
    empty,
    completion_percentage: total > 0 ? Math.round((locked / total) * 100) : 0,
    critical_fields: critical,
    critical_completed: criticalCompleted,
    formation_ready_percentage: critical > 0 ? Math.round((criticalCompleted / critical) * 100) : 0
  }
}