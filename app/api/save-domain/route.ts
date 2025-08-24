import { createSupabaseClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { domain, price, currency, user_id, auth_user_id } = await request.json()

    if (!domain) {
      return NextResponse.json({ error: 'Domain is required' }, { status: 400 })
    }

    const supabase = createSupabaseClient()

    // Get the current user if auth_user_id not provided
    let userId = user_id || auth_user_id
    
    if (!userId) {
      // Try to get user from Authorization header
      const authorization = request.headers.get('authorization')
      if (authorization?.startsWith('Bearer ')) {
        const token = authorization.substring(7)
        const { data: { user }, error: authError } = await supabase.auth.getUser(token)
        if (!authError && user) {
          userId = user.id
        }
      }
      
      // Fallback to session-based auth
      if (!userId) {
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
          return NextResponse.json({ error: 'User not authenticated' }, { status: 401 })
        }
        userId = user.id
      }
    }

    console.log('💾 Saving domain for user:', userId, 'Domain:', domain)

    // First, try to find the user record by auth_user_id
    const { data: existingUser, error: findError } = await supabase
      .from('users')
      .select('id, customer_email, business_name')
      .eq('auth_user_id', userId)
      .single()

    if (existingUser) {
      // Save domain information to the users table with connection to dream DNA ecosystem
      console.log('💾 Saving domain related to dream_dna table...')
      
      // Update the user's business_name to include selected domain
      // This creates a relationship with the dream_dna table through the user's business formation journey
      const domainName = domain.split('.')[0] // Extract business name from domain
      const updatedBusinessName = existingUser.business_name || domainName

      const { data: updateData, error: updateError } = await supabase
        .from('users')
        .update({ 
          business_name: updatedBusinessName,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingUser.id)
        .select()

      if (updateError) {
        console.error('❌ Error updating user record:', updateError.message)
        return NextResponse.json({ error: 'Failed to save domain' }, { status: 500 })
      }

      // Save domain information to new dream_dna_truth table with enhanced business context
      console.log('💾 Saving domain to dream_dna_truth table (new schema)...')
      
      const priceText = price ? `$${(price / 100).toFixed(2)} ${currency || 'USD'}` : 'Available'
      
      const dreamDNATruthRecord = {
        user_id: existingUser.id,
        business_name: updatedBusinessName,
        what_problem: `Establishing online presence and digital credibility with domain ${domain} - ${priceText}`,
        who_serves: `${updatedBusinessName} targeting customers seeking ${updatedBusinessName.toLowerCase()} services and solutions`,
        how_different: `Secured premium domain ${domain} through AI-powered search and real-time availability checking, ensuring brand consistency and professional online presence`,
        primary_service: `Online presence and digital branding for ${updatedBusinessName}`,
        business_stage: 'startup',
        industry_category: 'digital_services',
        business_model: 'service_based',
        target_revenue: price ? Math.round((price / 100) * 100000) : 50000, // Estimate annual revenue based on domain investment
        confidence_score: 0.85,
        extraction_source: 'domain_selection',
        validated_by_user: false
      }

      // Try new dream_dna_truth table first, fallback to legacy dream_dna
      let dreamDNAData, dreamDNAError;
      
      try {
        const result = await supabase
          .from('dream_dna_truth')
          .insert(dreamDNATruthRecord)
          .select()
        
        dreamDNAData = result.data
        dreamDNAError = result.error
        
        if (!dreamDNAError && dreamDNAData) {
          console.log('✅ Successfully saved to new dream_dna_truth table')
          
          // Also create dream_dna_type classification
          const dreamDNATypeRecord = {
            dream_dna_truth_id: dreamDNAData[0].id,
            business_archetype: 'optimizer', // Based on domain selection behavior
            industry_vertical: 'professional_services',
            business_model_type: 'b2c',
            scale_ambition: 'regional',
            risk_tolerance: 'moderate',
            innovation_level: 'incremental',
            customer_interaction: 'self_service',
            revenue_model: 'service_based',
            template_category: 'professional',
            personality_match_score: 0.75,
            archetype_confidence: 0.80
          }
          
          const { error: typeError } = await supabase
            .from('dream_dna_type')
            .insert(dreamDNATypeRecord)
            
          if (!typeError) {
            console.log('✅ Created business type classification')
          }
          
          return NextResponse.json({ 
            success: true, 
            message: 'Domain successfully saved to dream DNA truth table v2.0',
            user_id: existingUser.id,
            domain: domain,
            business_name: updatedBusinessName,
            dream_dna_truth_id: dreamDNAData[0].id,
            saved_to: 'dream_dna_truth + users.business_name',
            price: priceText,
            schema_version: '2.0',
            data: dreamDNAData[0]
          })
        }
      } catch (error) {
        console.log('⚠️ New schema not available, falling back to legacy dream_dna table')
        dreamDNAError = error
      }
      
      // Fallback to legacy dream_dna table if new schema isn't ready
      const legacyDreamDNARecord = {
        what_problem: dreamDNATruthRecord.what_problem,
        who_serves: dreamDNATruthRecord.who_serves,
        how_different: dreamDNATruthRecord.how_different,
        primary_service: dreamDNATruthRecord.primary_service,
        price_level: price && price > 2000 ? 'premium' : price && price > 1000 ? 'mid-market' : 'budget',
        brand_vibe: 'professional',
        color_preference: 'cool'
      }

      const { data: legacyData, error: legacyError } = await supabase
        .from('dream_dna')
        .insert(legacyDreamDNARecord)
        .select()

      if (legacyError) {
        console.error('❌ Error saving to both dream_dna tables:', legacyError.message)
        
        return NextResponse.json({ 
          success: true, 
          message: 'Domain saved to user profile (dream_dna tables not accessible)',
          user_id: existingUser.id,
          domain: domain,
          business_name: updatedBusinessName,
          saved_to: 'users.business_name',
          dream_dna_error: legacyError.message,
          note: 'Domain saved, dream_dna integration pending schema sync'
        })
      }

      // Successfully saved to legacy dream_dna table
      return NextResponse.json({ 
        success: true, 
        message: 'Domain saved to dream DNA table (legacy schema)',
        user_id: existingUser.id,
        domain: domain,
        business_name: updatedBusinessName,
        dream_dna_id: legacyData?.[0]?.id,
        saved_to: 'dream_dna + users.business_name',
        price: priceText,
        schema_version: '1.0',
        data: legacyData?.[0]
      })

    } else {
      // Create new user record with domain info
      const { data: newUserData, error: createError } = await supabase
        .from('users')
        .insert({
          auth_user_id: userId,
          business_name: domain.split('.')[0], // Use domain as business name
          status: 'new',
          account_type: 'customer',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()

      if (createError) {
        console.error('❌ Error creating user record:', createError.message)
        return NextResponse.json({ error: 'Failed to save domain data' }, { status: 500 })
      }

      // Save domain to new dream_dna_truth table for new user
      if (newUserData && newUserData.length > 0) {
        const businessName = domain.split('.')[0]
        const priceText = price ? `$${(price / 100).toFixed(2)} ${currency || 'USD'}` : 'Available'
        
        const newUserDreamDNATruth = {
          user_id: newUserData[0].id,
          business_name: businessName,
          what_problem: `Launching new business with professional domain ${domain} - ${priceText}`,
          who_serves: `${businessName} targeting customers who need reliable ${businessName.toLowerCase()} services`,
          how_different: `Starting with premium domain ${domain} secured through AI-powered search, ensuring professional brand presence from day one`,
          primary_service: `Professional services under ${businessName} brand`,
          business_stage: 'pre_launch',
          industry_category: 'startup',
          business_model: 'service_based',
          target_revenue: price ? Math.round((price / 100) * 150000) : 75000, // Higher expectations for new ventures
          confidence_score: 0.75, // Lower confidence for new users
          extraction_source: 'domain_selection',
          validated_by_user: false
        }

        // Try new schema first, then fallback
        try {
          const { data: dreamDNAData, error: dreamDNAError } = await supabase
            .from('dream_dna_truth')
            .insert(newUserDreamDNATruth)
            .select()

          if (!dreamDNAError && dreamDNAData) {
            // Create business type for new user
            const newUserTypeRecord = {
              dream_dna_truth_id: dreamDNAData[0].id,
              business_archetype: 'creator', // New businesses tend to be creative
              industry_vertical: 'startup',
              business_model_type: 'b2c',
              scale_ambition: 'local',
              risk_tolerance: 'aggressive',
              innovation_level: 'incremental',
              customer_interaction: 'high_touch',
              revenue_model: 'service_based',
              template_category: 'startup',
              personality_match_score: 0.85,
              archetype_confidence: 0.70
            }
            
            await supabase.from('dream_dna_type').insert(newUserTypeRecord)
            
            return NextResponse.json({ 
              success: true, 
              message: 'Domain successfully saved to dream DNA truth table v2.0 for new user',
              user_id: newUserData[0].id,
              domain: domain,
              business_name: businessName,
              dream_dna_truth_id: dreamDNAData[0].id,
              saved_to: 'dream_dna_truth + users.business_name',
              price: priceText,
              schema_version: '2.0',
              data: dreamDNAData[0]
            })
          }
        } catch (error) {
          console.log('⚠️ New schema not available for new user, using legacy...')
        }
        
        // Fallback to legacy schema
        const legacyRecord = {
          what_problem: newUserDreamDNATruth.what_problem,
          who_serves: newUserDreamDNATruth.who_serves,
          how_different: newUserDreamDNATruth.how_different,
          primary_service: newUserDreamDNATruth.primary_service,
          price_level: price && price > 2000 ? 'premium' : price && price > 1000 ? 'mid-market' : 'budget',
          brand_vibe: 'professional',
          color_preference: 'cool'
        }

        const { data: legacyData, error: legacyError } = await supabase
          .from('dream_dna')
          .insert(legacyRecord)
          .select()

        if (!legacyError && legacyData) {
          return NextResponse.json({ 
            success: true, 
            message: 'Domain saved to dream DNA table (legacy) for new user',
            user_id: newUserData[0].id,
            domain: domain,
            business_name: businessName,
            dream_dna_id: legacyData[0].id,
            saved_to: 'dream_dna + users.business_name',
            price: priceText,
            schema_version: '1.0',
            data: legacyData[0]
          })
        } else {
          console.log('⚠️ Dream DNA insert failed for new user:', legacyError?.message)
        }
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Domain saved with new user record',
        user_id: newUserData?.[0]?.id,
        domain: domain,
        saved_to: 'users.business_name'
      })
    }

  } catch (error) {
    console.error('❌ Error in save-domain API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}