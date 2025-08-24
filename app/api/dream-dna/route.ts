import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const phone = searchParams.get('phone')
    const email = searchParams.get('email')
    
    if (!userId && !phone && !email) {
      return NextResponse.json({ 
        error: 'At least one identifier (userId, phone, or email) is required' 
      }, { status: 400 })
    }
    
    let resolvedUserId = userId
    
    // If we have phone or email, resolve to user ID
    if (!userId && (phone || email)) {
      try {
        const lookupResponse = await fetch('http://localhost:3000/api/user-lookup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: phone || null,
            email: email || null,
            createIfMissing: false
          })
        })
        
        if (lookupResponse.ok) {
          const lookupData = await lookupResponse.json()
          if (lookupData.success && lookupData.user) {
            resolvedUserId = lookupData.user.id
            console.log(`🔍 Resolved user ID for Dream DNA: ${phone || email} -> ${resolvedUserId}`)
          }
        }
      } catch (lookupError) {
        console.log('⚠️ User lookup failed for Dream DNA:', lookupError.message)
      }
    }
    
    if (!resolvedUserId) {
      return NextResponse.json({ 
        error: 'Could not resolve user ID' 
      }, { status: 404 })
    }
    
    // Get Dream DNA for the user
    const { data: dreamDNA, error } = await supabase
      .from('dream_dna')
      .select('*')
      .eq('user_id', resolvedUserId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No Dream DNA found
        return NextResponse.json({
          success: false,
          message: 'No Dream DNA found for this user',
          dreamDNA: null,
          userId: resolvedUserId
        })
      }
      throw error
    }
    
    return NextResponse.json({
      success: true,
      dreamDNA,
      userId: resolvedUserId
    })
    
  } catch (error) {
    console.error('❌ Dream DNA retrieval error:', error)
    return NextResponse.json({ 
      error: 'Dream DNA retrieval failed',
      details: error.message 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, phone, email, dreamDNA, createUserIfMissing = false } = await request.json()
    
    console.log('🧬 Dream DNA creation/update request:', { userId, phone, email, createUserIfMissing })
    
    if (!userId && !phone && !email) {
      return NextResponse.json({ 
        error: 'At least one identifier (userId, phone, or email) is required' 
      }, { status: 400 })
    }
    
    let resolvedUserId = userId
    
    // If we have phone or email, resolve to user ID
    if (!userId && (phone || email)) {
      try {
        const lookupResponse = await fetch('http://localhost:3000/api/user-lookup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: phone || null,
            email: email || null,
            createIfMissing: createUserIfMissing
          })
        })
        
        if (lookupResponse.ok) {
          const lookupData = await lookupResponse.json()
          if (lookupData.success && lookupData.user) {
            resolvedUserId = lookupData.user.id
            console.log(`🔍 Resolved user ID for Dream DNA: ${phone || email} -> ${resolvedUserId}`)
          }
        }
      } catch (lookupError) {
        console.log('⚠️ User lookup failed for Dream DNA:', lookupError.message)
      }
    }
    
    if (!resolvedUserId) {
      return NextResponse.json({ 
        error: 'Could not resolve user ID' 
      }, { status: 404 })
    }
    
    // Prepare Dream DNA data
    const dreamDNAData = {
      user_id: resolvedUserId,
      ...dreamDNA,
      updated_at: new Date().toISOString()
    }
    
    // Check if Dream DNA already exists
    const { data: existingDreamDNA } = await supabase
      .from('dream_dna')
      .select('id')
      .eq('user_id', resolvedUserId)
      .single()
    
    let result
    if (existingDreamDNA) {
      // Update existing Dream DNA
      const { data, error } = await supabase
        .from('dream_dna')
        .update(dreamDNAData)
        .eq('user_id', resolvedUserId)
        .select()
        .single()
      
      if (error) throw error
      result = data
      console.log(`✅ Updated Dream DNA for user: ${resolvedUserId}`)
    } else {
      // Create new Dream DNA
      dreamDNAData.created_at = new Date().toISOString()
      const { data, error } = await supabase
        .from('dream_dna')
        .insert([dreamDNAData])
        .select()
        .single()
      
      if (error) throw error
      result = data
      console.log(`✅ Created Dream DNA for user: ${resolvedUserId}`)
    }
    
    return NextResponse.json({
      success: true,
      dreamDNA: result,
      userId: resolvedUserId,
      action: existingDreamDNA ? 'updated' : 'created'
    })
    
  } catch (error) {
    console.error('❌ Dream DNA creation/update error:', error)
    return NextResponse.json({ 
      error: 'Dream DNA operation failed',
      details: error.message 
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  return POST(request) // Alias for POST
}
