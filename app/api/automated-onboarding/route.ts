import { createSupabaseClient } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

interface OnboardingRequest {
  email: string
  business_type?: 'new' | 'existing'
  business_name?: string
  phone_number?: string
  full_name?: string
  auto_login?: boolean
}

export async function POST(request: NextRequest) {
  try {
    const body: OnboardingRequest = await request.json()
    
    if (!body.email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Use service role client for admin operations
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
    console.log('🚀 Starting automated user onboarding for:', body.email)

    // Step 1: Create or get user in Supabase Auth
    let authUser
    let isNewUser = false
    
    try {
      // Try to sign up the user (this will fail if user already exists)
      const tempPassword = generateTemporaryPassword()
      const { data: signUpData, error: signUpError } = await supabase.auth.admin.createUser({
        email: body.email,
        password: tempPassword,
        email_confirm: true // Auto-confirm email for automated flow
      })

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          console.log('👤 User already exists, retrieving existing user...')
          // Get existing user
          const { data: existingUsers, error: getUserError } = await supabase.auth.admin.listUsers()
          if (getUserError) throw getUserError
          
          authUser = existingUsers.users.find(u => u.email === body.email)
          if (!authUser) {
            throw new Error('User exists but could not be retrieved')
          }
        } else {
          throw signUpError
        }
      } else {
        console.log('✅ New user created in Supabase Auth')
        authUser = signUpData.user
        isNewUser = true
      }
    } catch (error: any) {
      console.error('❌ Auth user creation/retrieval failed:', error)
      return NextResponse.json({ 
        error: 'Failed to create or retrieve user', 
        details: error.message 
      }, { status: 500 })
    }

    if (!authUser) {
      return NextResponse.json({ error: 'Failed to process user authentication' }, { status: 500 })
    }

    // Step 2: Create or update user profile in users table
    const userProfileData = {
      auth_user_id: authUser.id,
      customer_email: body.email,
      customer_name: body.full_name || body.email.split('@')[0],
      customer_phone: body.phone_number || null,
      business_name: body.business_name || null,
      business_type: body.business_type || 'new',
      current_call_stage: 1,
      status: 'active',
      account_type: 'customer',
      email_confirmed: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    let userProfile
    try {
      if (isNewUser) {
        // Create new user profile
        const { data: newProfile, error: profileError } = await supabase
          .from('users')
          .insert(userProfileData)
          .select()
          .single()

        if (profileError) throw profileError
        userProfile = newProfile
        console.log('✅ New user profile created:', userProfile.id)
      } else {
        // Check if user profile already exists
        const { data: existingProfile } = await supabase
          .from('users')
          .select('*')
          .eq('auth_user_id', authUser.id)
          .single()

        if (existingProfile) {
          // Update existing profile
          const { data: updatedProfile, error: updateError } = await supabase
            .from('users')
            .update({
              customer_name: userProfileData.customer_name,
              customer_phone: userProfileData.customer_phone,
              business_name: userProfileData.business_name,
              business_type: userProfileData.business_type,
              updated_at: new Date().toISOString()
            })
            .eq('auth_user_id', authUser.id)
            .select()
            .single()

          if (updateError) throw updateError
          userProfile = updatedProfile
          console.log('✅ Existing user profile updated:', userProfile.id)
        } else {
          // Create new profile for existing auth user
          const { data: newProfile, error: createError } = await supabase
            .from('users')
            .insert(userProfileData)
            .select()
            .single()

          if (createError) throw createError
          userProfile = newProfile
          console.log('✅ New user profile created for existing auth user:', userProfile.id)
        }
      }
    } catch (error: any) {
      console.error('❌ User profile creation/update failed:', error)
      return NextResponse.json({ 
        error: 'Failed to create user profile', 
        details: error.message 
      }, { status: 500 })
    }

    // Step 3: Initialize Dream DNA based on business type
    if (body.business_type === 'new') {
      await initializeNewBusinessDreamDNA(supabase, userProfile.id, body)
    } else if (body.business_type === 'existing') {
      await initializeExistingBusinessDreamDNA(supabase, userProfile.id, body)
    }

    // Step 4: Create auto-login session if requested
    let sessionData = null
    if (body.auto_login) {
      try {
        const { data: session, error: sessionError } = await supabase.auth.admin.generateLink({
          type: 'magiclink',
          email: body.email
        })

        if (!sessionError && session) {
          sessionData = {
            access_token: session.properties?.access_token,
            refresh_token: session.properties?.refresh_token,
            login_url: session.properties?.action_link
          }
          console.log('✅ Auto-login session created')
        }
      } catch (error) {
        console.log('⚠️ Auto-login session creation failed, user can login manually')
      }
    }

    return NextResponse.json({
      success: true,
      message: isNewUser ? 'User created and onboarded successfully' : 'User updated and onboarded successfully',
      user: {
        id: userProfile.id,
        auth_user_id: authUser.id,
        email: body.email,
        name: userProfile.customer_name,
        business_type: body.business_type,
        is_new_user: isNewUser
      },
      business_selection: {
        type: body.business_type || 'new',
        name: body.business_name || null,
        dream_dna_initialized: true
      },
      next_steps: {
        recommended_action: body.business_type === 'new' ? 'start_voice_consultation' : 'review_business_details',
        portal_url: '/simple-portal',
        voice_assistant_url: '/optimized-voice-demo',
        domain_checker_url: '/domain-checker'
      },
      session: sessionData
    })

  } catch (error: any) {
    console.error('❌ Automated onboarding error:', error)
    return NextResponse.json({ 
      error: 'Automated onboarding failed', 
      details: error.message 
    }, { status: 500 })
  }
}

async function initializeNewBusinessDreamDNA(supabase: any, userId: string, data: OnboardingRequest) {
  console.log('🧬 Initializing Dream DNA for new business...')
  
  try {
    const dreamDNATruthRecord = {
      user_id: userId,
      business_name: data.business_name || `${data.full_name || 'New'}'s Business`,
      what_problem: 'New business seeking to identify and solve market problems',
      who_serves: 'Target customers to be determined through consultation process',
      how_different: 'Unique value proposition to be developed',
      primary_service: 'Business service offering to be defined',
      business_stage: 'ideation',
      industry_category: 'general',
      confidence_score: 0.3,
      extraction_source: 'automated_onboarding',
      validated_by_user: false
    }

    const { error: truthError } = await supabase
      .from('dream_dna_truth')
      .insert(dreamDNATruthRecord)

    if (!truthError) {
      console.log('✅ Dream DNA truth record created for new business')
      
      // Create business type classification
      const typeRecord = {
        user_id: userId,
        business_archetype: 'explorer',
        industry_vertical: 'general',
        business_model_type: 'service',
        risk_tolerance: 'medium',
        innovation_level: 'medium',
        scale_ambition: 'regional',
        template_category: 'general-business'
      }
      
      await supabase.from('dream_dna_type').insert(typeRecord)
      console.log('✅ Business type classification created')
    } else {
      console.log('⚠️ Could not create Dream DNA truth, using legacy fallback')
      await createLegacyDreamDNA(supabase, data)
    }
  } catch (error) {
    console.log('⚠️ Dream DNA initialization failed, continuing...')
  }
}

async function initializeExistingBusinessDreamDNA(supabase: any, userId: string, data: OnboardingRequest) {
  console.log('🧬 Initializing Dream DNA for existing business...')
  
  try {
    const dreamDNATruthRecord = {
      user_id: userId,
      business_name: data.business_name || 'Existing Business',
      what_problem: 'Existing business seeking growth and optimization',
      who_serves: 'Current customer base with potential for expansion',
      how_different: 'Established market position with room for differentiation',
      primary_service: 'Existing service offerings with potential enhancements',
      business_stage: 'established',
      industry_category: 'general',
      confidence_score: 0.6,
      extraction_source: 'automated_onboarding',
      validated_by_user: false
    }

    const { error: truthError } = await supabase
      .from('dream_dna_truth')
      .insert(dreamDNATruthRecord)

    if (!truthError) {
      console.log('✅ Dream DNA truth record created for existing business')
      
      // Create business type classification
      const typeRecord = {
        user_id: userId,
        business_archetype: 'optimizer',
        industry_vertical: 'general',
        business_model_type: 'service',
        risk_tolerance: 'medium',
        innovation_level: 'incremental',
        scale_ambition: 'regional',
        template_category: 'general-business'
      }
      
      await supabase.from('dream_dna_type').insert(typeRecord)
      console.log('✅ Business type classification created')
    } else {
      console.log('⚠️ Could not create Dream DNA truth, using legacy fallback')
      await createLegacyDreamDNA(supabase, data)
    }
  } catch (error) {
    console.log('⚠️ Dream DNA initialization failed, continuing...')
  }
}

async function createLegacyDreamDNA(supabase: any, data: OnboardingRequest) {
  const legacyRecord = {
    what_problem: 'Business formation and growth',
    who_serves: 'Target customers to be defined',
    how_different: 'Unique value proposition development',
    primary_service: 'Service offering definition',
    price_level: 'mid-market',
    brand_vibe: 'professional',
    color_preference: 'cool'
  }
  
  await supabase.from('dream_dna').insert(legacyRecord)
  console.log('✅ Legacy Dream DNA record created')
}

function generateTemporaryPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let password = ''
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password + '!'
}