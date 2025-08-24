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
      console.log('✅ User authenticated successfully:', data.user.email)
      
      // Check if user is admin by email (simple approach for now)
      const adminEmails = ['morgan@dreamseed.ai'] // Add admin emails here
      const isAdmin = adminEmails.includes(data.user.email || '')

      if (isAdmin) {
        console.log('🔄 Redirecting admin to dashboard')
        return NextResponse.redirect(requestUrl.origin + '/admin-dashboard')
      } else {
        // All customers go to simple portal (faster loading)
        console.log('🔄 Redirecting customer to simple portal')
        return NextResponse.redirect(requestUrl.origin + '/simple-portal')
      }
    }
  }

  // Fallback to login if something goes wrong
  return NextResponse.redirect(requestUrl.origin + '/login')
}