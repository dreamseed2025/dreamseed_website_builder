import { createClient } from '@supabase/supabase-js'
import { createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// For client components
export const createSupabaseClient = () => createClientComponentClient()

// For server components (only import cookies when actually used)
export const createSupabaseServerClient = () => {
  const { cookies } = require('next/headers')
  return createServerComponentClient({ cookies })
}

// For API routes and server actions
export const supabase = createClient(supabaseUrl, supabaseAnonKey)