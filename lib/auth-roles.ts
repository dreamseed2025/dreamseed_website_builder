import { createSupabaseClient } from './supabase'

export type UserRole = 'customer' | 'admin'

export interface RoleCheckResult {
  isAuthenticated: boolean
  role: UserRole | null
  user: any
  isAdmin: boolean
  isCustomer: boolean
}

export async function checkUserRole(): Promise<RoleCheckResult> {
  const supabase = createSupabaseClient()
  
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return {
        isAuthenticated: false,
        role: null,
        user: null,
        isAdmin: false,
        isCustomer: false
      }
    }

    // Check if user is admin by email (simple approach for now)
    const adminEmails = ['morgan@dreamseed.ai'] // Add admin emails here
    const isAdmin = adminEmails.includes(user.email || '')

    if (isAdmin) {
      return {
        isAuthenticated: true,
        role: 'admin',
        user,
        isAdmin: true,
        isCustomer: false
      }
    }

    return {
      isAuthenticated: true,
      role: 'customer',
      user,
      isAdmin: false,
      isCustomer: true
    }

  } catch (error) {
    console.error('Error checking user role:', error)
    return {
      isAuthenticated: false,
      role: null,
      user: null,
      isAdmin: false,
      isCustomer: false
    }
  }
}

export function getRedirectPath(role: UserRole | null): string {
  switch (role) {
    case 'admin':
      return '/admin-dashboard'
    case 'customer':
      return '/customer-portal'
    default:
      return '/login'
  }
}