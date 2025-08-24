import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    console.log('📊 Fetching transcript dashboard data...')
    
    // 1. Get recent call transcripts with user info
    const { data: transcripts, error: transcriptError } = await supabase
      .from('call_transcripts')
      .select(`
        id,
        call_id,
        call_stage,
        full_transcript,
        user_messages,
        assistant_messages,
        semantic_summary,
        extracted_data,
        full_transcript_vector,
        user_messages_vector,
        semantic_summary_vector,
        processed_at,
        created_at,
        user_id
      `)
      .order('created_at', { ascending: false })
      .limit(10)
    
    // 2. Get transcript count
    const { count: transcriptCount, error: countError } = await supabase
      .from('call_transcripts')
      .select('*', { count: 'exact', head: true })
    
    // 3. Get sample users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select(`
        id,
        customer_name,
        customer_phone,
        customer_email,
        business_name,
        current_call_stage,
        status
      `)
      .order('updated_at', { ascending: false })
      .limit(6)
    
    // 4. Get user count
    const { count: userCount, error: userCountError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
    
    // Handle potential errors gracefully
    let dashboardData = {
      transcriptCount: transcriptCount || 0,
      userCount: userCount || 0,
      vectorsEnabled: true, // Assume enabled if we got this far
      recentTranscripts: transcripts || [],
      sampleUsers: users || [],
      webhookStatus: '✅ Active',
      errors: []
    }
    
    // Log any errors but don't fail the request
    if (transcriptError) {
      console.log('⚠️ Transcript fetch error:', transcriptError.message)
      dashboardData.errors.push(`Transcripts: ${transcriptError.message}`)
      
      // Check if call_transcripts table doesn't exist
      if (transcriptError.message.includes('does not exist') || transcriptError.message.includes('relation')) {
        dashboardData.transcriptCount = 0
        dashboardData.recentTranscripts = []
        dashboardData.vectorsEnabled = false
        dashboardData.errors.push('call_transcripts table not found - run create-transcript-table.sql')
      }
    }
    
    if (countError) {
      console.log('⚠️ Count error:', countError.message)
      dashboardData.errors.push(`Count: ${countError.message}`)
    }
    
    if (usersError) {
      console.log('⚠️ Users fetch error:', usersError.message)
      dashboardData.errors.push(`Users: ${usersError.message}`)
    }
    
    if (userCountError) {
      console.log('⚠️ User count error:', userCountError.message)
    }
    
    // Process transcript data for better display
    const processedTranscripts = dashboardData.recentTranscripts.map(t => ({
      ...t,
      full_transcript_vector: !!t.full_transcript_vector,
      user_messages_vector: !!t.user_messages_vector,
      semantic_summary_vector: !!t.semantic_summary_vector,
      user_messages: Array.isArray(t.user_messages) ? t.user_messages : [],
      assistant_messages: Array.isArray(t.assistant_messages) ? t.assistant_messages : []
    }))
    
    console.log(`✅ Dashboard data fetched: ${dashboardData.transcriptCount} transcripts, ${dashboardData.userCount} users`)
    
    return NextResponse.json({
      ...dashboardData,
      recentTranscripts: processedTranscripts,
      timestamp: new Date().toISOString(),
      status: 'success'
    })
    
  } catch (error) {
    console.error('❌ Dashboard API error:', error)
    
    return NextResponse.json({
      transcriptCount: 0,
      userCount: 0,
      vectorsEnabled: false,
      recentTranscripts: [],
      sampleUsers: [],
      webhookStatus: '❌ Error',
      errors: [error.message],
      timestamp: new Date().toISOString(),
      status: 'error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()
    
    if (action === 'test-webhook') {
      // Trigger a test webhook call
      const testData = {
        type: 'call-end',
        callId: 'dashboard-test-' + Date.now(),
        call: {
          id: 'dashboard-test-' + Date.now(),
          customer: {
            number: '+15551234567'
          }
        },
        artifact: {
          messages: [
            {
              role: 'user',
              content: 'This is a test transcript from the dashboard to verify processing.'
            },
            {
              role: 'assistant',
              content: 'Thank you for testing! This will be processed and stored with vector embeddings.'
            }
          ]
        }
      }
      
      // Send to webhook endpoint
      const webhookResponse = await fetch('http://localhost:3000/api/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      })
      
      const result = await webhookResponse.json()
      
      return NextResponse.json({
        success: true,
        testResult: result,
        timestamp: new Date().toISOString()
      })
    }
    
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    
  } catch (error) {
    console.error('❌ Dashboard POST error:', error)
    return NextResponse.json({
      error: 'Dashboard action failed',
      details: error.message
    }, { status: 500 })
  }
}

