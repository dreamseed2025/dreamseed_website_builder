import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const openaiKey = process.env.OPENAI_API_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)
const openai = new OpenAI({ apiKey: openaiKey })

export async function POST(request: NextRequest) {
  try {
    const { userId, transcriptText, callStage, callId } = await request.json()
    
    console.log('🎯 Processing transcript with new Dream DNA system...')
    
    // Step 1: Extract business insights using AI
    const businessInsights = await extractBusinessInsights(transcriptText, callStage)
    
    // Step 2: Generate vector embeddings
    const embeddings = await generateEmbeddings(transcriptText)
    
    // Step 3: Update Dream DNA truth table
    const dreamDNAUpdate = await updateDreamDNA(userId, businessInsights, callStage)
    
    // Step 4: Create probability analysis
    const probabilityAnalysis = await createProbabilityAnalysis(userId, businessInsights)
    
    // Step 5: Update business classification
    const businessClassification = await updateBusinessClassification(userId, businessInsights)
    
    return NextResponse.json({
      success: true,
      businessInsights,
      dreamDNAUpdated: dreamDNAUpdate,
      probabilityAnalysis,
      businessClassification,
      embeddings: {
        dimensions: embeddings.length,
        model: 'text-embedding-3-small'
      }
    })
    
  } catch (error: any) {
    console.error('❌ Transcript processor error:', error)
    return NextResponse.json({ 
      error: 'Transcript processing failed',
      details: error.message 
    }, { status: 500 })
  }
}

async function extractBusinessInsights(transcript: string, callStage: number) {
  const systemPrompt = `You are an expert business analyst. Extract key business insights from this conversation.
  
  Focus on:
  - Business model and revenue streams
  - Target market and customer segments
  - Competitive advantages and differentiation
  - Pain points and problems being solved
  - Business stage and growth plans
  - Industry classification and vertical
  - Risk tolerance and innovation level
  
  Return a structured JSON object with these insights.`

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Extract business insights from Call ${callStage}:\n\n${transcript}` }
    ],
    temperature: 0.1
  })

  try {
    const responseText = completion.choices[0].message.content
    const cleanJson = responseText.replace(/```json\n?|\n?```/g, '').trim()
    return JSON.parse(cleanJson)
  } catch (error) {
    console.error('JSON parse error:', error)
    return {}
  }
}

async function generateEmbeddings(text: string) {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
    encoding_format: "float",
  })
  return response.data[0].embedding
}

async function updateDreamDNA(userId: string, insights: any, callStage: number) {
  try {
    // Check if dream_dna_truth record exists
    const { data: existing } = await supabase
      .from('dream_dna_truth')
      .select('*')
      .eq('user_id', userId)
      .single()

    const dreamDNARecord = {
      user_id: userId,
      business_name: insights.business_name || existing?.business_name,
      what_problem: insights.problem_solving || existing?.what_problem,
      who_serves: insights.target_market || existing?.who_serves,
      how_different: insights.competitive_advantage || existing?.how_different,
      primary_service: insights.primary_service || existing?.primary_service,
      target_revenue: insights.revenue_model || existing?.target_revenue,
      business_model: insights.business_model || existing?.business_model,
      business_stage: insights.business_stage || existing?.business_stage,
      industry_category: insights.industry || existing?.industry_category,
      confidence_score: calculateConfidenceScore(insights),
      extraction_source: `call_${callStage}`,
      validated_by_user: false,
      updated_at: new Date().toISOString()
    }

    if (existing) {
      // Update existing record
      const { error } = await supabase
        .from('dream_dna_truth')
        .update(dreamDNARecord)
        .eq('user_id', userId)
      
      if (error) throw error
      return { updated: true, record: dreamDNARecord }
    } else {
      // Create new record
      const { error } = await supabase
        .from('dream_dna_truth')
        .insert(dreamDNARecord)
      
      if (error) throw error
      return { created: true, record: dreamDNARecord }
    }
  } catch (error) {
    console.error('Dream DNA update error:', error)
    return { error: error.message }
  }
}

async function createProbabilityAnalysis(userId: string, insights: any) {
  try {
    const probabilityRecord = {
      user_id: userId,
      primary_interpretation: JSON.stringify(insights),
      alternative_1: JSON.stringify(generateAlternative(insights, 1)),
      alternative_2: JSON.stringify(generateAlternative(insights, 2)),
      alternative_3: JSON.stringify(generateAlternative(insights, 3)),
      confidence_scores: JSON.stringify({
        primary: 0.85,
        alt1: 0.75,
        alt2: 0.65,
        alt3: 0.55
      }),
      ai_reasoning: `Analysis based on conversation patterns and business indicators`,
      user_validation: null,
      created_at: new Date().toISOString()
    }

    const { error } = await supabase
      .from('dream_dna_probability')
      .upsert(probabilityRecord, { onConflict: 'user_id' })

    if (error) throw error
    return { success: true, record: probabilityRecord }
  } catch (error) {
    console.error('Probability analysis error:', error)
    return { error: error.message }
  }
}

async function updateBusinessClassification(userId: string, insights: any) {
  try {
    const classificationRecord = {
      user_id: userId,
      business_archetype: determineArchetype(insights),
      industry_vertical: insights.industry || 'general',
      business_model_type: insights.business_model || 'service',
      risk_tolerance: determineRiskTolerance(insights),
      innovation_level: determineInnovationLevel(insights),
      scale_ambition: determineScaleAmbition(insights),
      template_category: determineTemplateCategory(insights),
      created_at: new Date().toISOString()
    }

    const { error } = await supabase
      .from('dream_dna_type')
      .upsert(classificationRecord, { onConflict: 'user_id' })

    if (error) throw error
    return { success: true, record: classificationRecord }
  } catch (error) {
    console.error('Business classification error:', error)
    return { error: error.message }
  }
}

// Helper functions
function calculateConfidenceScore(insights: any): number {
  let score = 0.5 // Base score
  if (insights.business_name) score += 0.1
  if (insights.target_market) score += 0.1
  if (insights.problem_solving) score += 0.1
  if (insights.revenue_model) score += 0.1
  if (insights.industry) score += 0.1
  return Math.min(score, 1.0)
}

function generateAlternative(insights: any, version: number) {
  // Generate alternative interpretations
  const alternatives = {
    1: { ...insights, business_model: 'subscription' },
    2: { ...insights, business_model: 'marketplace' },
    3: { ...insights, business_model: 'consulting' }
  }
  return alternatives[version as keyof typeof alternatives] || insights
}

function determineArchetype(insights: any): string {
  if (insights.innovation_level === 'high') return 'innovator'
  if (insights.risk_tolerance === 'high') return 'pioneer'
  if (insights.scale_ambition === 'global') return 'scaler'
  return 'optimizer'
}

function determineRiskTolerance(insights: any): string {
  const keywords = insights.toString().toLowerCase()
  if (keywords.includes('disrupt') || keywords.includes('revolutionary')) return 'high'
  if (keywords.includes('proven') || keywords.includes('traditional')) return 'low'
  return 'medium'
}

function determineInnovationLevel(insights: any): string {
  const keywords = insights.toString().toLowerCase()
  if (keywords.includes('ai') || keywords.includes('technology')) return 'high'
  if (keywords.includes('traditional') || keywords.includes('manual')) return 'low'
  return 'medium'
}

function determineScaleAmbition(insights: any): string {
  const keywords = insights.toString().toLowerCase()
  if (keywords.includes('global') || keywords.includes('worldwide')) return 'global'
  if (keywords.includes('local') || keywords.includes('community')) return 'local'
  return 'regional'
}

function determineTemplateCategory(insights: any): string {
  if (insights.industry === 'technology') return 'tech-startup'
  if (insights.industry === 'consulting') return 'consulting'
  if (insights.industry === 'ecommerce') return 'ecommerce'
  return 'general-business'
}