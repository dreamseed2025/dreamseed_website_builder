import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'

interface UserProfile {
  id: string
  customer_name?: string
  customer_email?: string
  business_name?: string
  business_type?: string
  state_of_operation?: string
  entity_type?: string
  status?: string
  dream_dna?: {
    vision_statement?: string
    business_concept?: string
    target_customers?: string
    services_offered?: string
    industry_keywords?: string[]
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({
        success: false,
        message: 'Authentication required',
        profile: null
      }, { status: 401 })
    }

    // Fetch user profile data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('customer_email', user.email)
      .single()

    // Fetch dream DNA data if user exists
    let dreamDnaData = null
    if (userData && !userError) {
      const { data: dreamData } = await supabase
        .from('dream_dna')
        .select('*')
        .eq('user_id', userData.id)
        .single()
      
      dreamDnaData = dreamData
    }

    // If no profile exists, create a basic one
    if (userError && userError.code === 'PGRST116') {
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          customer_email: user.email,
          customer_name: user.user_metadata?.full_name || user.email?.split('@')[0],
          status: 'in_progress'
        })
        .select()
        .single()

      if (createError) {
        return NextResponse.json({
          success: false,
          message: 'Failed to create user profile',
          profile: null
        }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: 'Profile created',
        profile: {
          id: newUser.id,
          customer_name: newUser.customer_name,
          customer_email: newUser.customer_email,
          business_name: null,
          business_type: null,
          state_of_operation: null,
          entity_type: newUser.entity_type,
          status: newUser.status,
          dream_dna: null
        }
      })
    }

    if (userError) {
      return NextResponse.json({
        success: false,
        message: 'Failed to fetch user profile',
        profile: null
      }, { status: 500 })
    }

    // Extract industry keywords from profile data
    const industryKeywords = extractIndustryKeywords(userData, dreamDnaData)

    const profile: UserProfile = {
      id: userData.id,
      customer_name: userData.customer_name,
      customer_email: userData.customer_email,
      business_name: userData.business_name,
      business_type: userData.business_type,
      state_of_operation: userData.state_of_operation,
      entity_type: userData.entity_type,
      status: userData.status,
      dream_dna: dreamDnaData ? {
        vision_statement: dreamDnaData.vision_statement,
        business_concept: dreamDnaData.business_concept,
        target_customers: dreamDnaData.target_customers,
        services_offered: dreamDnaData.services_offered,
        industry_keywords: industryKeywords
      } : null
    }

    return NextResponse.json({
      success: true,
      message: 'Profile retrieved successfully',
      profile: profile
    })

  } catch (error) {
    console.error('User profile API error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      profile: null
    }, { status: 500 })
  }
}

// Helper function to extract industry keywords from profile data
function extractIndustryKeywords(userData: any, dreamDnaData: any): string[] {
  const keywords = new Set<string>()
  
  // Extract from business type
  if (userData.business_type) {
    const businessWords = userData.business_type.toLowerCase()
      .replace(/[^a-z\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2)
    businessWords.forEach(word => keywords.add(word))
  }

  // Extract from business name
  if (userData.business_name) {
    const nameWords = userData.business_name.toLowerCase()
      .replace(/[^a-z\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2 && !['llc', 'inc', 'corp', 'ltd'].includes(word))
    nameWords.forEach(word => keywords.add(word))
  }

  if (dreamDnaData) {
    // Extract from business concept
    if (dreamDnaData.business_concept) {
      const conceptWords = dreamDnaData.business_concept.toLowerCase()
        .match(/\b[a-z]{3,}\b/g) || []
      conceptWords.slice(0, 5).forEach(word => keywords.add(word))
    }

    // Extract from services offered
    if (dreamDnaData.services_offered) {
      const serviceWords = dreamDnaData.services_offered.toLowerCase()
        .match(/\b[a-z]{3,}\b/g) || []
      serviceWords.slice(0, 5).forEach(word => keywords.add(word))
    }

    // Extract from target customers
    if (dreamDnaData.target_customers) {
      const customerWords = dreamDnaData.target_customers.toLowerCase()
        .match(/\b[a-z]{3,}\b/g) || []
      customerWords.slice(0, 3).forEach(word => keywords.add(word))
    }
  }

  // Filter out common words
  const commonWords = new Set(['the', 'and', 'for', 'with', 'business', 'company', 'service', 'services', 'providing', 'offering', 'customers', 'clients'])
  
  return Array.from(keywords)
    .filter(word => !commonWords.has(word))
    .slice(0, 10) // Limit to 10 most relevant keywords
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({
        success: false,
        message: 'Authentication required'
      }, { status: 401 })
    }

    const updateData = await request.json()
    
    // Update user profile
    const { error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('customer_email', user.email)

    if (updateError) {
      return NextResponse.json({
        success: false,
        message: 'Failed to update profile'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully'
    })

  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}