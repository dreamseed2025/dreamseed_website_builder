import { createSupabaseClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      // Return demo context for unauthenticated users
      return NextResponse.json({
        user_id: 'demo-user',
        current_step: 2,
        business_type: 'new',
        business_name: 'Demo Dream Business',
        completed_calls: 1,
        dream_dna_data: {
          what_problem: 'Starting a new business venture in the digital space',
          who_serves: 'Entrepreneurs and small business owners',
          stage: 'planning'
        }
      })
    }

    console.log('🔍 Loading user context for:', user.email)

    // Get user profile
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_user_id', user.id)
      .single()

    if (profileError || !userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Get Dream DNA data
    let dreamDNAData = null
    try {
      const { data: dreamData } = await supabase
        .from('dream_dna_truth')
        .select('*')
        .eq('user_id', userProfile.id)
        .order('created_at', { ascending: false })
        .limit(1)

      if (dreamData && dreamData.length > 0) {
        dreamDNAData = dreamData[0]
      } else {
        // Fallback to legacy dream_dna table
        const { data: legacyData } = await supabase
          .from('dream_dna')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
        
        if (legacyData && legacyData.length > 0) {
          dreamDNAData = legacyData[0]
        }
      }
    } catch (error) {
      console.log('⚠️ Could not load Dream DNA data')
    }

    // Determine current step based on completed calls and data
    let currentStep = 1
    const completedCalls = userProfile.current_call_stage || 0
    
    if (completedCalls >= 3) currentStep = 4
    else if (completedCalls >= 2) currentStep = 3  
    else if (completedCalls >= 1) currentStep = 2
    else currentStep = 1

    const context = {
      user_id: userProfile.id,
      auth_user_id: user.id,
      email: user.email,
      current_step: currentStep,
      business_type: userProfile.business_type || 'new',
      business_name: userProfile.business_name || dreamDNAData?.business_name,
      completed_calls: completedCalls,
      dream_dna_data: {
        what_problem: dreamDNAData?.what_problem,
        who_serves: dreamDNAData?.who_serves,
        how_different: dreamDNAData?.how_different,
        primary_service: dreamDNAData?.primary_service,
        stage: dreamDNAData?.business_stage || 'ideation'
      },
      next_recommended_action: getNextAction(currentStep, userProfile.business_type)
    }

    console.log('✅ User context loaded:', { 
      step: currentStep, 
      business: context.business_name,
      type: context.business_type 
    })

    return NextResponse.json(context)

  } catch (error: any) {
    console.error('❌ Error loading user context:', error)
    return NextResponse.json({ error: 'Failed to load user context' }, { status: 500 })
  }
}

function getNextAction(step: number, businessType: string): string {
  const actions = {
    1: businessType === 'new' ? 'Define your business concept and problem statement' : 'Review your existing business model',
    2: 'Identify your target market and unique value proposition',
    3: 'Choose business structure and formation requirements',
    4: 'Finalize legal documents and launch your business'
  }
  
  return actions[step as keyof typeof actions] || 'Continue your business formation journey'
}