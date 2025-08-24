import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Add paths that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/admin-login',
  '/business-assessment', 
  '/signup',
  '/domain-checker',
  '/voice-widget-browser-test',
  '/vapi-web-demo',
  '/optimized-voice-demo',
  '/vapi-elliot-test',
  '/elliot-test',
  '/vapi-dashboard-widget',
  '/vapi-widget-simple',
  '/test-elliot',
  '/vapi-elliot-real',
  '/vapi-elliot-simple',
  '/configure-elliot-voice',
  '/widget-configurator',
  '/apply-widget-config',
  '/api/vapi-widget-embed',
  '/api/vapi-rag',
  '/api/user-lookup',
  '/api/dream-dna',
  '/api/vapi-personalize',
  '/api/transcript-dashboard',
  '/api/transcript-processor',
  '/transcript-dashboard',
  '/personalized-voice-chat',
  '/customer-portal',
  '/voice-chat',
  '/test-login',
  '/simple-portal',
  '/vapi-hosted-widget-simple',
  '/user-profile',
  '/vapi-hosted-widget',
  '/auth/callback',
  '/test-manual-flow.html'
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the path is a public route
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )

  // If it's a public route, allow access
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // For now, allow all access - proper Supabase auth will be handled in components
  // TODO: Implement proper Supabase session checking here
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}