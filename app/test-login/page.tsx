'use client'

import { useState, useEffect } from 'react'
import { createSupabaseClient } from '@/lib/supabase'

export default function TestLogin() {
  const [status, setStatus] = useState('Initializing...')
  const [error, setError] = useState<string | null>(null)
  const supabase = createSupabaseClient()

  useEffect(() => {
    testLoginFlow()
  }, [])

  const testLoginFlow = async () => {
    try {
      setStatus('Step 1: Checking Supabase client...')
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setStatus('Step 2: Getting current session...')
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        throw new Error(`Session error: ${sessionError.message}`)
      }
      
      setStatus(`Step 3: Session status - ${session ? 'Logged in' : 'Not logged in'}`)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (session) {
        setStatus('Step 4: User is already logged in, redirecting...')
        window.location.href = '/customer-portal'
        return
      }
      
      setStatus('Step 5: Setting up auth listener...')
      
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth event:', event, session)
        setStatus(`Auth event: ${event}`)
        
        if (event === 'SIGNED_IN' && session) {
          setStatus('Step 6: User signed in, redirecting...')
          window.location.href = '/customer-portal'
        }
      })
      
      setStatus('✅ Ready for login! Auth listener is active.')
      
      // Cleanup subscription after 30 seconds
      setTimeout(() => {
        subscription.unsubscribe()
        setStatus('⚠️ Auth listener timed out after 30 seconds')
      }, 30000)
      
    } catch (err) {
      console.error('Test error:', err)
      setError(err.message)
      setStatus('❌ Error occurred')
    }
  }

  const testSignIn = async () => {
    try {
      setStatus('Testing sign in...')
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'testpassword123'
      })
      
      if (error) {
        setError(`Sign in error: ${error.message}`)
        setStatus('❌ Sign in failed')
      } else {
        setStatus('✅ Sign in successful!')
      }
    } catch (err) {
      setError(err.message)
      setStatus('❌ Sign in error')
    }
  }

  const testSignUp = async () => {
    try {
      setStatus('Testing sign up...')
      const { data, error } = await supabase.auth.signUp({
        email: 'test@example.com',
        password: 'testpassword123'
      })
      
      if (error) {
        setError(`Sign up error: ${error.message}`)
        setStatus('❌ Sign up failed')
      } else {
        setStatus('✅ Sign up successful!')
      }
    } catch (err) {
      setError(err.message)
      setStatus('❌ Sign up error')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">🔍 Login Test Page</h1>
        
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Status:</h2>
          <div className="p-3 bg-gray-100 rounded">
            <p className="text-sm">{status}</p>
          </div>
        </div>
        
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded">
            <h3 className="text-red-800 font-semibold mb-1">Error:</h3>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
        
        <div className="space-y-3">
          <button
            onClick={testSignUp}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Test Sign Up
          </button>
          
          <button
            onClick={testSignIn}
            className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
          >
            Test Sign In
          </button>
          
          <button
            onClick={() => window.location.href = '/login'}
            className="w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700"
          >
            Go to Real Login Page
          </button>
        </div>
        
        <div className="mt-6 text-xs text-gray-500">
          <p>This page tests the login flow step by step to identify where it hangs.</p>
        </div>
      </div>
    </div>
  )
}

