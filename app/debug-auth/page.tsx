'use client'

import { useState, useEffect } from 'react'
import { createSupabaseClient } from '@/lib/supabase'

export default function DebugAuth() {
  const [authState, setAuthState] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createSupabaseClient()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        setAuthState({
          hasSession: !!session,
          session: session,
          error: error,
          user: session?.user,
          timestamp: new Date().toISOString()
        })
      } catch (err) {
        setAuthState({
          hasSession: false,
          error: err,
          timestamp: new Date().toISOString()
        })
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session)
      setAuthState({
        hasSession: !!session,
        session: session,
        event: event,
        user: session?.user,
        timestamp: new Date().toISOString()
      })
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  if (loading) {
    return (
      <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
        <h1>🔍 Debug Auth - Loading...</h1>
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace', maxWidth: '800px' }}>
      <h1>🔍 Debug Authentication State</h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <h2>Current State:</h2>
        <pre style={{ 
          background: '#f5f5f5', 
          padding: '1rem', 
          borderRadius: '4px',
          overflow: 'auto',
          fontSize: '12px'
        }}>
          {JSON.stringify(authState, null, 2)}
        </pre>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>Quick Actions:</h2>
        <button 
          onClick={() => window.location.href = '/login'}
          style={{ 
            background: '#007bff', 
            color: 'white', 
            border: 'none', 
            padding: '10px 20px', 
            marginRight: '10px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Go to Login
        </button>
        
        <button 
          onClick={() => window.location.href = '/simple-portal'}
          style={{ 
            background: '#28a745', 
            color: 'white', 
            border: 'none', 
            padding: '10px 20px', 
            marginRight: '10px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Go to Simple Portal
        </button>

        <button 
          onClick={async () => {
            await supabase.auth.signOut()
            window.location.reload()
          }}
          style={{ 
            background: '#dc3545', 
            color: 'white', 
            border: 'none', 
            padding: '10px 20px', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Sign Out
        </button>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>Test API Call:</h2>
        <button 
          onClick={async () => {
            try {
              const response = await fetch('/api/user-profile')
              const result = await response.json()
              alert(`API Response: ${JSON.stringify(result, null, 2)}`)
            } catch (err) {
              alert(`API Error: ${err}`)
            }
          }}
          style={{ 
            background: '#6f42c1', 
            color: 'white', 
            border: 'none', 
            padding: '10px 20px', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Test /api/user-profile
        </button>
      </div>
    </div>
  )
}

