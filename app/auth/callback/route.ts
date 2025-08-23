import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (data.user && !error) {
      // Check if user has completed ALL required onboarding steps
      const { data: existingUser } = await supabase
        .from('users')
        .select('status, customer_name, customer_phone, state_of_operation, urgency_level, timeline')
        .eq('customer_email', data.user.email)
        .single()
      
      const { data: dreamDNA } = await supabase
        .from('dream_dna')
        .select('vision_statement, business_concept, target_customers, unique_value_prop')
        .eq('user_id', data.user.id)
        .single()
      
      // Check if ALL critical fields are completed
      const hasPersonalInfo = existingUser && 
        existingUser.customer_name && 
        existingUser.customer_phone && 
        existingUser.state_of_operation && 
        existingUser.urgency_level && 
        existingUser.timeline
      
      const hasDreamDNA = dreamDNA && 
        dreamDNA.vision_statement && 
        dreamDNA.business_concept && 
        dreamDNA.target_customers && 
        dreamDNA.unique_value_prop
      
      // Only allow dashboard access if EVERYTHING is complete
      if (hasPersonalInfo && hasDreamDNA && existingUser.status === 'onboarding_complete') {
        return NextResponse.redirect(requestUrl.origin + '/dashboard')
      }
      
      // If personal info incomplete, start at onboarding
      if (!hasPersonalInfo) {
        return NextResponse.redirect(requestUrl.origin + '/onboarding')
      }
      
      // If dream DNA incomplete, go to dream DNA
      if (!hasDreamDNA) {
        return NextResponse.redirect(requestUrl.origin + '/dream-dna-setup')
      }
      
      // Default to onboarding for any edge cases
      return NextResponse.redirect(requestUrl.origin + '/onboarding')
    }
  }

  // Fallback to dashboard if something goes wrong
  return NextResponse.redirect(requestUrl.origin + '/dashboard')
}