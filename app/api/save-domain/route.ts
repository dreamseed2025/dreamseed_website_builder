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

      // Save domain information directly to dream_dna truth table with business context
      console.log('💾 Saving domain to dream_dna truth table...')
      
      const priceText = price ? `$${(price / 100).toFixed(2)} ${currency || 'USD'}` : 'Available'
      
      const dreamDNARecord = {
        what_problem: `Establishing online presence with domain ${domain} - ${priceText}`,
        who_serves: `${updatedBusinessName} - targeting customers seeking ${updatedBusinessName.toLowerCase()} services`,
        how_different: `Secured premium domain ${domain} through AI-powered search and real-time availability checking`,
        primary_service: `Online presence for ${updatedBusinessName}`,
        price_level: price && price > 2000 ? 'premium' : price && price > 1000 ? 'mid-market' : 'budget',
        brand_vibe: 'professional',
        color_preference: 'cool'
      }

      const { data: dreamDNAData, error: dreamDNAError } = await supabase
        .from('dream_dna')
        .insert(dreamDNARecord)
        .select()

      if (dreamDNAError) {
        console.error('❌ Error saving to dream_dna:', dreamDNAError.message)
        
        return NextResponse.json({ 
          success: true, 
          message: 'Domain saved to user profile (dream_dna table constraints prevent direct save)',
          user_id: existingUser.id,
          domain: domain,
          business_name: updatedBusinessName,
          saved_to: 'users.business_name',
          dream_dna_error: dreamDNAError.message,
          note: 'Domain is part of user business formation journey'
        })
      }

      // Successfully saved to dream_dna table
      return NextResponse.json({ 
        success: true, 
        message: 'Domain successfully saved to dream DNA truth table',
        user_id: existingUser.id,
        domain: domain,
        business_name: updatedBusinessName,
        dream_dna_id: dreamDNAData?.[0]?.id,
        saved_to: 'dream_dna + users.business_name',
        price: priceText,
        data: dreamDNAData?.[0]
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

      // Save domain to dream_dna table for new user
      if (newUserData && newUserData.length > 0) {
        const businessName = domain.split('.')[0]
        const priceText = price ? `$${(price / 100).toFixed(2)} ${currency || 'USD'}` : 'Available'
        
        const dreamDNARecord = {
          what_problem: `Starting new business with domain ${domain} - ${priceText}`,
          who_serves: `${businessName} - new business targeting potential customers`,
          how_different: `Launching with premium domain ${domain} secured through AI-powered domain search`,
          primary_service: `New business venture: ${businessName}`,
          price_level: price && price > 2000 ? 'premium' : price && price > 1000 ? 'mid-market' : 'budget',
          brand_vibe: 'professional',
          color_preference: 'cool'
        }

        const { data: dreamDNAData, error: dreamDNAError } = await supabase
          .from('dream_dna')
          .insert(dreamDNARecord)
          .select()

        if (!dreamDNAError && dreamDNAData) {
          return NextResponse.json({ 
            success: true, 
            message: 'Domain successfully saved to dream DNA truth table for new user',
            user_id: newUserData[0].id,
            domain: domain,
            business_name: businessName,
            dream_dna_id: dreamDNAData[0].id,
            saved_to: 'dream_dna + users.business_name',
            price: priceText,
            data: dreamDNAData[0]
          })
        } else {
          console.log('⚠️ Dream DNA insert failed for new user:', dreamDNAError?.message)
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