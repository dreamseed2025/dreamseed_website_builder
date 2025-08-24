import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const { phone, email, userId, createIfMissing = false } = await request.json()
    
    console.log('🔍 User lookup request:', { phone, email, userId, createIfMissing })
    
    if (!phone && !email && !userId) {
      return NextResponse.json({ 
        error: 'At least one identifier (phone, email, or userId) is required' 
      }, { status: 400 })
    }
    
    let user = null
    
    // Try to find user by different identifiers
    if (userId) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (!error && data) {
        user = data
        console.log(`✅ Found user by ID: ${userId}`)
      }
    }
    
    if (!user && email) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('customer_email', email)
        .single()
      
      if (!error && data) {
        user = data
        console.log(`✅ Found user by email: ${email}`)
      }
    }
    
    if (!user && phone) {
      // Clean phone number for lookup
      const cleanPhone = phone.replace(/\D/g, '')
      
      // Try exact match first
      let { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('customer_phone', phone)
        .single()
      
      if (!error && data) {
        user = data
        console.log(`✅ Found user by exact phone: ${phone}`)
      } else {
        // Try with different formats
        const phoneFormats = [
          `+1${cleanPhone}`,
          cleanPhone,
          `(${cleanPhone.slice(0,3)}) ${cleanPhone.slice(3,6)}-${cleanPhone.slice(6)}`,
          `${cleanPhone.slice(0,3)}-${cleanPhone.slice(3,6)}-${cleanPhone.slice(6)}`
        ]
        
        for (const format of phoneFormats) {
          const { data: formatData, error: formatError } = await supabase
            .from('users')
            .select('*')
            .eq('customer_phone', format)
            .single()
          
          if (!formatError && formatData) {
            user = formatData
            console.log(`✅ Found user by phone format: ${format}`)
            break
          }
        }
      }
    }
    
    // If user not found and createIfMissing is true, create a new user
    if (!user && createIfMissing) {
      const newUser = {
        customer_email: email || null,
        customer_phone: phone || null,
        customer_name: email ? email.split('@')[0] : 'New User',
        business_name: 'My Business',
        business_type: 'General',
        current_call_stage: 1,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      const { data: createdUser, error: createError } = await supabase
        .from('users')
        .insert([newUser])
        .select()
        .single()
      
      if (createError) {
        console.error('❌ User creation error:', createError)
        return NextResponse.json({ 
          error: 'Failed to create user',
          details: createError.message 
        }, { status: 500 })
      }
      
      user = createdUser
      console.log(`✅ Created new user: ${user.id}`)
    }
    
    if (!user) {
      return NextResponse.json({ 
        error: 'User not found',
        searchedBy: { phone, email, userId }
      }, { status: 404 })
    }
    
    // Return user data with lookup info
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        customer_name: user.customer_name,
        customer_email: user.customer_email,
        customer_phone: user.customer_phone,
        business_name: user.business_name,
        business_type: user.business_type,
        current_call_stage: user.current_call_stage,
        status: user.status,
        created_at: user.created_at,
        updated_at: user.updated_at
      },
      lookupInfo: {
        foundBy: userId ? 'userId' : email ? 'email' : 'phone',
        identifier: userId || email || phone
      }
    })
    
  } catch (error) {
    console.error('❌ User lookup error:', error)
    return NextResponse.json({ 
      error: 'User lookup failed',
      details: error.message 
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'User Lookup API',
    description: 'Find users by phone, email, or user ID',
    endpoints: {
      POST: {
        description: 'Look up user by identifiers',
        body: {
          phone: 'Phone number (optional)',
          email: 'Email address (optional)',
          userId: 'User ID (optional)',
          createIfMissing: 'Create user if not found (default: false)'
        }
      }
    }
  })
}
