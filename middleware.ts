import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  
  // Public routes that don't require auth
  const publicRoutes = ['/', '/login', '/auth/callback', '/voice-widget-demo', '/realtime-voice-demo', '/voice-widget-browser-test', '/vapi-web-demo']
  const apiRoutes = ['/api/']
  
  // Allow all API routes and public routes
  if (publicRoutes.includes(pathname) || apiRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }
  
  // For now, allow all routes (we'll add auth back later)
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}