'use client'

import { useEffect, useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { checkUserRole } from '@/lib/auth-roles'
import type { User } from '@supabase/supabase-js'

export default function CustomerPortal() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createSupabaseClient()
  const router = useRouter()

  useEffect(() => {
    const initializeCustomerPortal = async () => {
      const roleCheck = await checkUserRole()
      
      if (!roleCheck.isAuthenticated) {
        router.push('/login')
        return
      }

      if (roleCheck.isAdmin) {
        router.push('/admin-dashboard')
        return
      }

      setUser(roleCheck.user)
      setLoading(false)
    }

    initializeCustomerPortal()
  }, [supabase, router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading your business portal...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">🌱 DreamSeed Portal</h1>
              <p className="text-gray-600">Welcome back, {user?.email?.split('@')[0]}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">🚀 Your Business Formation Journey</h2>
          
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🌱</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Start Your Business?</h3>
            <p className="text-gray-600 mb-6">
              Our AI-powered system will guide you through 4 personalized calls to launch your dream business.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <p className="text-blue-800 font-medium">
                📞 Call us to get started: <a href="tel:+1-555-DREAM-BIZ" className="underline">+1 (555) DREAM-BIZ</a>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">🛠️ Quick Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a 
              href="/domain-checker"
              className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition"
            >
              <div className="text-2xl mb-2">🌐</div>
              <h3 className="font-semibold">Domain Checker</h3>
              <p className="text-sm text-gray-600">Find the perfect domain for your business</p>
            </a>
            <a 
              href="/voice-domain-assistant"
              className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition"
            >
              <div className="text-2xl mb-2">🎤</div>
              <h3 className="font-semibold">Voice Assistant</h3>
              <p className="text-sm text-gray-600">Get help using voice commands</p>
            </a>
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="text-2xl mb-2">📞</div>
              <h3 className="font-semibold">Schedule Call</h3>
              <p className="text-sm text-gray-600">Call +1 (555) DREAM-BIZ to continue your journey</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}