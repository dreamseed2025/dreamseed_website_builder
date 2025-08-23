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
  '/auth/callback'
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