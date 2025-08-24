import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const VAPI_PRIVATE_KEY = process.env.VAPI_PRIVATE_KEY!

export async function POST(request: NextRequest) {
  try {
    const { userId, phone, email, assessmentData } = await request.json()
    
    console.log('🎯 Personalizing VAPI assistant for user:', { userId, phone, email })
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // 1. Resolve user ID
    let resolvedUserId = userId
    if (!resolvedUserId) {
      if (phone) {
        const { data: userData } = await supabase
          .from('users')
          .select('id')
          .eq('customer_phone', phone)
          .single()
        if (userData) resolvedUserId = userData.id
      } else if (email) {
        const { data: userData } = await supabase
          .from('users')
          .select('id')
          .eq('customer_email', email)
          .single()
        if (userData) resolvedUserId = userData.id
      }
    }
    
    // 2. Get or create user profile
    let user = null
    let userError = null
    
    if (resolvedUserId) {
      const { data: userData, error: userDataError } = await supabase
        .from('users')
        .select('*')
        .eq('id', resolvedUserId)
        .single()
      
      user = userData
      userError = userDataError
    }
    
    // If user doesn't exist, create a basic profile for personalization
    if (userError || !user) {
      console.log('User not found in database, creating basic profile for personalization')
      user = {
        id: resolvedUserId || 'demo-user',
        customer_name: 'Demo User',
        customer_phone: phone || '+15551234567',
        customer_email: email || 'demo@dreamseed.com',
        business_name: 'Demo Business',
        current_call_stage: 1,
        status: 'active'
      }
    }
    
    // 3. Get Dream DNA from new system
    let dreamDNA = null
    let dreamDNATruth = null
    let dreamDNAType = null
    
    try {
      // Try new dream_dna_truth table first
      const { data: truthResponse, error: truthError } = await supabase
        .from('dream_dna_truth')
        .select('*')
        .eq('user_id', resolvedUserId)
        .single()
      
      if (!truthError && truthResponse) {
        dreamDNATruth = truthResponse
        console.log('✅ Found Dream DNA Truth for user')
      }

      // Get business classification
      const { data: typeResponse, error: typeError } = await supabase
        .from('dream_dna_type')
        .select('*')
        .eq('user_id', resolvedUserId)
        .single()
      
      if (!typeError && typeResponse) {
        dreamDNAType = typeResponse
        console.log('✅ Found Dream DNA Type classification for user')
      }

      // Fallback to legacy dream_dna table
      if (!dreamDNATruth) {
        const { data: legacyResponse, error: legacyError } = await supabase
          .from('dream_dna')
          .select('*')
          .eq('business_id', resolvedUserId)
          .single()
        
        if (!legacyError && legacyResponse) {
          dreamDNA = legacyResponse
          console.log('✅ Found legacy Dream DNA for user')
        }
      }
    } catch (error) {
      console.log('⚠️ Dream DNA not found or error:', error)
    }
    
    // 4. Get recent conversation history
    const { data: recentTranscripts, error: transcriptError } = await supabase
      .from('call_transcripts')
      .select('semantic_summary, call_stage, created_at')
      .eq('user_id', resolvedUserId)
      .order('created_at', { ascending: false })
      .limit(3)
    
    // 5. Build personalized system prompt
    let personalizedPrompt = `You are Elliot, a professional business formation consultant for DreamSeed.

CURRENT USER CONTEXT:
- Name: ${user.customer_name || 'Client'}
- Business: ${user.business_name || 'Not specified'}
- Phone: ${user.customer_phone || 'Not provided'}
- Email: ${user.customer_email || 'Not provided'}
- Entity Type: ${user.entity_type || 'Not specified'}
- Urgency Level: ${user.urgency_level || 'Not specified'}
- Current Call Stage: ${user.current_call_stage || 1}/4

RAG CAPABILITIES:
- Previous conversation context available
- Business formation knowledge base
- Vector similarity search enabled

ASSESSMENT DATA:
${assessmentData ? `
- Business Idea: ${assessmentData.businessIdea || 'Not specified'}
- Business Type: ${assessmentData.businessType || 'Not specified'}
- Timeline: ${assessmentData.timeline || 'Not specified'}
- Experience Level: ${assessmentData.experience || 'Not specified'}
- Main Goal: ${assessmentData.mainGoal || 'Not specified'}` : '- No assessment data available'}`

    // Add Dream DNA if available (new system first, fallback to legacy)
    if (dreamDNATruth) {
      personalizedPrompt += `

🧬 DREAM DNA TRUTH - Business Vision:
- Business Name: ${dreamDNATruth.business_name || 'Not specified'}
- Problem Solving: ${dreamDNATruth.what_problem || 'Not specified'}
- Target Market: ${dreamDNATruth.who_serves || 'Not specified'}
- Competitive Advantage: ${dreamDNATruth.how_different || 'Not specified'}
- Primary Service: ${dreamDNATruth.primary_service || 'Not specified'}
- Target Revenue: ${dreamDNATruth.target_revenue || 'Not specified'}
- Business Model: ${dreamDNATruth.business_model || 'Not specified'}
- Business Stage: ${dreamDNATruth.business_stage || 'Not specified'}
- Industry Category: ${dreamDNATruth.industry_category || 'Not specified'}
- Confidence Score: ${dreamDNATruth.confidence_score || 'Not specified'}

Use this Dream DNA Truth to provide highly personalized guidance that aligns with their specific business vision and goals.`
    } else if (dreamDNA) {
      personalizedPrompt += `

🧬 DREAM DNA - Business Vision (Legacy):
- Core Purpose: ${dreamDNA.core_purpose || 'Not specified'}
- Target Audience: ${dreamDNA.target_audience || 'Not specified'}
- Unique Value Proposition: ${dreamDNA.unique_value_proposition || 'Not specified'}
- Business Model: ${dreamDNA.business_model || 'Not specified'}
- Competitive Advantage: ${dreamDNA.competitive_advantage || 'Not specified'}
- Growth Strategy: ${dreamDNA.growth_strategy || 'Not specified'}
- Vision Statement: ${dreamDNA.vision_statement || 'Not specified'}
- Mission Statement: ${dreamDNA.mission_statement || 'Not specified'}

Use this Dream DNA to provide highly personalized guidance that aligns with their specific business vision and goals.`
    }

    // Add business classification if available
    if (dreamDNAType) {
      personalizedPrompt += `

🏢 BUSINESS CLASSIFICATION:
- Business Archetype: ${dreamDNAType.business_archetype || 'Not specified'}
- Industry Vertical: ${dreamDNAType.industry_vertical || 'Not specified'}
- Business Model Type: ${dreamDNAType.business_model_type || 'Not specified'}
- Risk Tolerance: ${dreamDNAType.risk_tolerance || 'Not specified'}
- Innovation Level: ${dreamDNAType.innovation_level || 'Not specified'}
- Scale Ambition: ${dreamDNAType.scale_ambition || 'Not specified'}
- Template Category: ${dreamDNAType.template_category || 'Not specified'}

Use this classification to tailor your advice to their business personality and growth style.`
    }
    
    // Add conversation history if available
    if (recentTranscripts && recentTranscripts.length > 0 && !transcriptError) {
      personalizedPrompt += `

📞 RECENT CONVERSATION HISTORY:
${recentTranscripts.map((t, i) => `Call ${i + 1} (Stage ${t.call_stage}): ${t.semantic_summary || 'No summary available'}`).join('\n')}

Build upon previous conversations and avoid repeating information already covered.`
    }
    
    // Add stage-specific guidance
    const stageGuidance = {
      1: 'Focus on business foundation: legal structure, business plan, market research, and initial setup requirements.',
      2: 'Focus on brand identity: business name, logo, website, marketing strategy, and brand positioning.',
      3: 'Focus on operations: systems, processes, team structure, technology stack, and operational workflows.',
      4: 'Focus on launch strategy: go-to-market plan, customer acquisition, funding, partnerships, and growth metrics.'
    }
    
    personalizedPrompt += `

🎯 CURRENT STAGE FOCUS (Stage ${user.current_call_stage}):
${stageGuidance[user.current_call_stage as keyof typeof stageGuidance] || 'General business formation guidance.'}

Remember: You are speaking with ${user.customer_name || 'the client'} about their business "${user.business_name || 'their business'}". Be conversational, helpful, and specific to their needs.`
    
    // 6. Update VAPI assistant with personalized prompt
    const assistantId = 'af397e88-c286-416f-9f74-e7665401bdb7' // Your assistant ID
    
    const updateResponse = await fetch(`https://api.vapi.ai/assistant/${assistantId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${VAPI_PRIVATE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: {
          provider: "openai",
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: personalizedPrompt
            }
          ],
          temperature: 0.7,
          maxTokens: 1000
        }
      })
    })
    
    if (!updateResponse.ok) {
      const errorText = await updateResponse.text()
      console.error('❌ VAPI assistant update failed:', errorText)
      return NextResponse.json({
        error: 'Failed to update VAPI assistant',
        details: `VAPI API returned ${updateResponse.status}: ${errorText}`
      }, { status: 500 })
    }
    
    const updateResult = await updateResponse.json()
    
    console.log('✅ VAPI assistant personalized successfully')
    
    return NextResponse.json({
      success: true,
      userId: resolvedUserId,
      userProfile: {
        name: user.customer_name,
        business: user.business_name,
        stage: user.current_call_stage
      },
      dreamDNAIncluded: !!dreamDNA && !dreamError,
      conversationHistoryIncluded: recentTranscripts?.length > 0 && !transcriptError,
      promptLength: personalizedPrompt.length,
      vapiUpdateResult: updateResult,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Personalization error:', error)
    return NextResponse.json({
      error: 'Personalization failed',
      details: error.message
    }, { status: 500 })
  }
}
