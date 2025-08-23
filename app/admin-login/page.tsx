'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createSupabaseClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { checkUserRole } from '@/lib/auth-roles'

export default function AdminLoginPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const supabase = createSupabaseClient()
  const router = useRouter()

  useEffect(() => {
    const handleAuthStateChange = async () => {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setLoading(true)
          const roleCheck = await checkUserRole()
          
          if (roleCheck.isAdmin) {
            router.push('/admin-dashboard')
          } else {
            setError('Access denied. Admin credentials required.')
            await supabase.auth.signOut()
          }
          setLoading(false)
        } else if (event === 'SIGNED_OUT') {
          setError('')
          setLoading(false)
        }
      })

      return () => subscription.unsubscribe()
    }

    handleAuthStateChange()
  }, [supabase.auth, router])

  useEffect(() => {
    const checkExistingAuth = async () => {
      const roleCheck = await checkUserRole()
      if (roleCheck.isAdmin) {
        router.push('/admin-dashboard')
      } else {
        setLoading(false)
      }
    }

    checkExistingAuth()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p>Verifying admin credentials...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🔐 Admin Portal</h1>
          <p className="text-gray-600">DreamSeed Administrative Access</p>
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
        </div>
        
        <Auth
          supabaseClient={supabase}
          appearance={{ 
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#dc2626',
                  brandAccent: '#b91c1c',
                }
              }
            }
          }}
          providers={['google']}
          redirectTo={typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : '/auth/callback'}
        />

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 mb-3">
            Administrative access only.
          </p>
          <a href="/login" className="text-sm text-blue-600 hover:text-blue-800 underline">
            Customer Login →
          </a>
        </div>
      </div>
    </div>
  )
}