import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Business formation knowledge base
const BUSINESS_KNOWLEDGE_BASE = [
  {
    category: "LLC Formation",
    content: "LLC (Limited Liability Company) formation provides personal liability protection while offering tax flexibility. Key steps: 1) Choose business name and verify availability, 2) File Articles of Organization with state, 3) Create Operating Agreement, 4) Obtain EIN from IRS, 5) Open business bank account, 6) Get required licenses/permits."
  },
  {
    category: "State Selection",
    content: "Most businesses file in their home state for simplicity. Delaware offers strong legal protections and privacy. Nevada has no state income tax. Wyoming has low fees and strong privacy. Consider: business location, tax implications, legal requirements, and ongoing compliance costs."
  },
  {
    category: "Business Name Requirements",
    content: "Business name must be unique in your state, not misleading, and include proper entity identifier (LLC, Corp, etc.). Avoid names similar to existing businesses. Check domain availability. Consider trademark implications. Name should reflect your brand and be memorable."
  },
  {
    category: "Operating Agreement",
    content: "Operating Agreement is crucial for LLCs - it defines ownership, management structure, profit distribution, and dispute resolution. Even single-member LLCs should have one for liability protection. Include: member roles, capital contributions, voting rights, buyout provisions, and dissolution procedures."
  },
  {
    category: "EIN Application",
    content: "EIN (Employer Identification Number) is required for business bank accounts, hiring employees, and tax purposes. Apply online at IRS.gov for immediate issuance. Free service. Required for: LLCs with employees, multi-member LLCs, or if you want to avoid using SSN for business."
  },
  {
    category: "Business Bank Account",
    content: "Separate business and personal finances immediately after formation. Required for: liability protection, professional appearance, easier accounting, and tax compliance. Bring: EIN, Articles of Organization, Operating Agreement, and personal ID. Consider online banks for convenience."
  },
  {
    category: "Licenses and Permits",
    content: "Requirements vary by industry and location. Common needs: business license, professional licenses, health permits, zoning permits, sales tax permit. Check with: city/county clerk, state licensing boards, industry associations. Failure to obtain can result in fines or business closure."
  },
  {
    category: "Tax Considerations",
    content: "LLCs offer tax flexibility: default pass-through taxation, option to elect corporate taxation. Consider: self-employment taxes, state taxes, sales taxes, estimated tax payments. Track all business expenses. Consider hiring a tax professional for complex situations."
  },
  {
    category: "Insurance Requirements",
    content: "Essential coverage: general liability insurance, professional liability (errors & omissions), workers' compensation (if employees), property insurance. Consider: cyber liability, business interruption, key person insurance. Shop around for best rates and coverage."
  },
  {
    category: "Compliance Requirements",
    content: "Annual requirements: state filings, tax returns, license renewals, insurance updates. Track deadlines with calendar system. Consider compliance software or professional services. Failure can result in: fines, loss of liability protection, business dissolution."
  }
]

export async function POST(request: NextRequest) {
  try {
    const { 
      message, 
      userId, 
      dreamId, 
      callStage = 1,
      includeTranscripts = true,
      includeKnowledge = true,
      includeDreamDNA = true
    } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    console.log(`🔍 RAG Query: "${message}" for user ${userId}, stage ${callStage}`)

    // Step 1: Generate embedding for the query
    const queryEmbedding = await generateEmbedding(message)
    
    // Step 2: Retrieve relevant information
    const retrievedContext = await retrieveRelevantContext(
      queryEmbedding, 
      userId, 
      callStage, 
      includeTranscripts, 
      includeKnowledge, 
      includeDreamDNA
    )

    // Step 3: Generate enhanced response
    const enhancedResponse = await generateEnhancedResponse(message, retrievedContext, userId, callStage)

    return NextResponse.json({
      success: true,
      response: enhancedResponse,
      context: {
        retrievedTranscripts: retrievedContext.transcripts.length,
        retrievedKnowledge: retrievedContext.knowledge.length,
        dreamDNAIncluded: retrievedContext.dreamDNA ? true : false
      }
    })

  } catch (error) {
    console.error('RAG API error:', error)
    return NextResponse.json({
      error: 'Failed to process RAG request',
      details: error.message
    }, { status: 500 })
  }
}

async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
      encoding_format: "float",
    })
    
    return response.data[0].embedding
  } catch (error) {
    console.error('Embedding generation error:', error)
    throw new Error('Failed to generate embedding')
  }
}

async function retrieveRelevantContext(
  queryEmbedding: number[],
  userId: string,
  callStage: number,
  includeTranscripts: boolean,
  includeKnowledge: boolean,
  includeDreamDNA: boolean
) {
  const context = {
    transcripts: [],
    knowledge: [],
    dreamDNA: null,
    truthTableGaps: null
  }

  try {
    // 1. Retrieve relevant transcripts with vector similarity
    if (includeTranscripts) {
      context.transcripts = await retrieveRelevantTranscripts(queryEmbedding, userId, callStage)
    }

    // 2. Retrieve relevant knowledge base content
    if (includeKnowledge) {
      context.knowledge = await retrieveRelevantKnowledge(queryEmbedding, callStage)
    }

    // 3. Retrieve user's Dream DNA
    if (includeDreamDNA) {
      context.dreamDNA = await retrieveUserDreamDNA(userId)
    }

    // 4. Analyze truth table gaps for systematic coverage
    context.truthTableGaps = await analyzeTruthTableGaps(userId, callStage)

  } catch (error) {
    console.error('Context retrieval error:', error)
  }

  return context
}

async function retrieveRelevantTranscripts(queryEmbedding: number[], userId: string, callStage: number) {
  try {
    // First, try to resolve the user ID using the lookup system
    let resolvedUserId = userId
    
    // If userId looks like a phone number or email, try to resolve it
    if (userId.includes('@') || userId.includes('+') || userId.includes('-') || userId.includes('(')) {
      try {
        const lookupResponse = await fetch('http://localhost:3000/api/user-lookup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: userId.includes('+') || userId.includes('-') || userId.includes('(') ? userId : null,
            email: userId.includes('@') ? userId : null,
            createIfMissing: false
          })
        })
        
        if (lookupResponse.ok) {
          const lookupData = await lookupResponse.json()
          if (lookupData.success && lookupData.user) {
            resolvedUserId = lookupData.user.id
            console.log(`🔍 Resolved user ID: ${userId} -> ${resolvedUserId}`)
          }
        }
      } catch (lookupError) {
        console.log('⚠️ User lookup failed, using original userId:', lookupError.message)
      }
    }
    
    // Try new transcripts_vectorized table first
    let transcripts = []
    let error = null
    
    try {
      const { data: vectorizedTranscripts, error: vectorizedError } = await supabase
        .from('transcripts_vectorized')
        .select(`
          id,
          call_session_id,
          content_summary,
          key_topics,
          business_insights,
          sentiment_score,
          vector_embeddings,
          processing_metadata,
          created_at
        `)
        .eq('user_id', resolvedUserId)
        .order('created_at', { ascending: false })
        .limit(5)

      if (!vectorizedError && vectorizedTranscripts) {
        // Transform to match expected format
        transcripts = vectorizedTranscripts.map(t => ({
          id: t.id,
          call_id: t.call_session_id,
          call_stage: JSON.parse(t.processing_metadata || '{}').call_stage || 1,
          full_transcript: null, // Not stored in vectorized table
          semantic_summary: t.content_summary,
          extracted_data: JSON.parse(t.processing_metadata || '{}').extracted_data || {},
          created_at: t.created_at,
          full_transcript_vector: t.vector_embeddings,
          semantic_summary_vector: null,
          key_topics: JSON.parse(t.key_topics || '[]'),
          business_insights: JSON.parse(t.business_insights || '[]'),
          sentiment_score: t.sentiment_score
        }))
        console.log('✅ Retrieved transcripts from new vectorized table')
      } else {
        error = vectorizedError
      }
    } catch (newTableError) {
      console.log('⚠️ New transcripts table not available, falling back to legacy')
    }

    // Fallback to legacy call_transcripts table
    if (transcripts.length === 0) {
      const { data: legacyTranscripts, error: legacyError } = await supabase
        .from('call_transcripts')
        .select(`
          id,
          call_id,
          call_stage,
          full_transcript,
          semantic_summary,
          extracted_data,
          created_at,
          full_transcript_vector,
          semantic_summary_vector
        `)
        .eq('user_id', resolvedUserId)
        .order('created_at', { ascending: false })
        .limit(5)

      if (!legacyError && legacyTranscripts) {
        transcripts = legacyTranscripts
        console.log('✅ Retrieved transcripts from legacy table')
      } else {
        error = legacyError
      }
    }

    if (error) {
      console.error('Transcript retrieval error:', error)
      return []
    }

    if (!transcripts || transcripts.length === 0) {
      console.log('⚠️ No transcripts found for user')
      return []
    }

    // If we have vector embeddings, use similarity search
    const transcriptsWithVectors = transcripts.filter(t => t.full_transcript_vector)
    
    if (transcriptsWithVectors.length > 0) {
      // Calculate similarity scores (simplified for demo - in production use pgvector)
      const scoredTranscripts = transcriptsWithVectors.map(transcript => ({
        ...transcript,
        similarity: calculateSimilarity(queryEmbedding, transcript.full_transcript_vector)
      }))
      
      // Sort by similarity and return top 3
      return scoredTranscripts
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 3)
    }

    // Fallback to recent transcripts
    return transcripts.slice(0, 3)
  } catch (error) {
    console.error('Transcript retrieval failed:', error)
    return []
  }
}

function calculateSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0
  
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0)
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0))
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0))
  
  return dotProduct / (magnitudeA * magnitudeB)
}

async function retrieveRelevantKnowledge(queryEmbedding: number[], callStage: number) {
  try {
    // For now, return relevant knowledge based on call stage
    const stageRelevantKnowledge = BUSINESS_KNOWLEDGE_BASE.filter(item => {
      const content = item.content.toLowerCase()
      const query = queryEmbedding.join(' ').toLowerCase() // Simplified for demo
      
      // Simple keyword matching (in production, use proper vector similarity)
      const keywords = ['llc', 'formation', 'business', 'name', 'state', 'tax', 'license', 'insurance']
      return keywords.some(keyword => content.includes(keyword) || query.includes(keyword))
    })

    return stageRelevantKnowledge.slice(0, 3) // Return top 3 relevant items
  } catch (error) {
    console.error('Knowledge retrieval error:', error)
    return []
  }
}

async function retrieveUserDreamDNA(userId: string) {
  try {
    // First, try to resolve the user ID using the lookup system
    let resolvedUserId = userId
    
    // If userId looks like a phone number or email, try to resolve it
    if (userId.includes('@') || userId.includes('+') || userId.includes('-') || userId.includes('(')) {
      try {
        const lookupResponse = await fetch('http://localhost:3000/api/user-lookup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: userId.includes('+') || userId.includes('-') || userId.includes('(') ? userId : null,
            email: userId.includes('@') ? userId : null,
            createIfMissing: false
          })
        })
        
        if (lookupResponse.ok) {
          const lookupData = await lookupResponse.json()
          if (lookupData.success && lookupData.user) {
            resolvedUserId = lookupData.user.id
            console.log(`🔍 Resolved user ID for Dream DNA: ${userId} -> ${resolvedUserId}`)
          }
        }
      } catch (lookupError) {
        console.log('⚠️ User lookup failed for Dream DNA, using original userId:', lookupError.message)
      }
    }
    
    // For now, use the user ID directly as business ID (simplified approach)
    let businessId = resolvedUserId
    
    const { data: dreamDNA, error } = await supabase
      .from('dream_dna')
      .select('*')
      .eq('business_id', businessId)
      .single()

    if (error) {
      console.error('Dream DNA retrieval error:', error)
      return null
    }

    return dreamDNA
  } catch (error) {
    console.error('Dream DNA retrieval failed:', error)
    return null
  }
}

async function analyzeTruthTableGaps(userId: string, callStage: number) {
  try {
    // First, try to resolve the user ID using the lookup system
    let resolvedUserId = userId
    
    // If userId looks like a phone number or email, try to resolve it
    if (userId.includes('@') || userId.includes('+') || userId.includes('-') || userId.includes('(')) {
      try {
        const lookupResponse = await fetch('http://localhost:3000/api/user-lookup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: userId.includes('+') || userId.includes('-') || userId.includes('(') ? userId : null,
            email: userId.includes('@') ? userId : null,
            createIfMissing: false
          })
        })
        
        if (lookupResponse.ok) {
          const lookupData = await lookupResponse.json()
          if (lookupData.success && lookupData.user) {
            resolvedUserId = lookupData.user.id
            console.log(`🔍 Resolved user ID for gap analysis: ${userId} -> ${resolvedUserId}`)
          }
        }
      } catch (lookupError) {
        console.log('⚠️ User lookup failed for gap analysis, using original userId:', lookupError.message)
      }
    }
    
    // Get user's current data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', resolvedUserId)
      .single()

    if (userError) {
      console.error('User data retrieval error:', userError)
      return null
    }

    // Get Dream DNA data
    const { data: dreamDNA, error: dreamError } = await supabase
      .from('dream_dna')
      .select('*')
      .eq('user_id', userId)
      .single()

    // Define required fields for each call stage
    const stageRequirements = {
      1: {
        required: ['full_name', 'email', 'business_name', 'business_type', 'state_of_operation'],
        important: ['business_concept', 'target_customers', 'timeline', 'urgency_level'],
        optional: ['unique_value_prop', 'startup_capital', 'revenue_goals']
      },
      2: {
        required: ['brand_personality', 'brand_values', 'visual_style', 'color_preferences'],
        important: ['brand_mission', 'brand_vision', 'logo_direction', 'website_style'],
        optional: ['competitive_advantage', 'brand_positioning', 'domain_preference']
      },
      3: {
        required: ['business_location', 'operational_model', 'team_structure'],
        important: ['processes', 'systems', 'technology_needs'],
        optional: ['partnerships', 'suppliers', 'logistics']
      },
      4: {
        required: ['launch_strategy', 'marketing_plan', 'sales_process'],
        important: ['customer_acquisition', 'growth_plan', 'success_metrics'],
        optional: ['exit_strategy', 'scaling_plan', 'funding_needs']
      }
    }

    const currentStage = stageRequirements[callStage as keyof typeof stageRequirements]
    if (!currentStage) {
      return { stage: callStage, missing: [], complete: 0, total: 0 }
    }

    // Analyze what's missing
    const missing = {
      required: [] as string[],
      important: [] as string[],
      optional: [] as string[]
    }

    // Check user table fields
    currentStage.required.forEach(field => {
      if (!userData[field] || userData[field] === '') {
        missing.required.push(field)
      }
    })

    currentStage.important.forEach(field => {
      if (!userData[field] || userData[field] === '') {
        missing.important.push(field)
      }
    })

    currentStage.optional.forEach(field => {
      if (!userData[field] || userData[field] === '') {
        missing.optional.push(field)
      }
    })

    // Check Dream DNA fields if available
    if (dreamDNA) {
      const dreamDNAFields = ['vision_statement', 'core_purpose', 'business_concept', 'target_customers']
      dreamDNAFields.forEach(field => {
        if (!dreamDNA[field] || dreamDNA[field] === '') {
          if (!missing.important.includes(field)) {
            missing.important.push(field)
          }
        }
      })
    }

    // Calculate completion percentage
    const totalFields = currentStage.required.length + currentStage.important.length + currentStage.optional.length
    const completedFields = totalFields - missing.required.length - missing.important.length - missing.optional.length
    const completionPercentage = Math.round((completedFields / totalFields) * 100)

    return {
      stage: callStage,
      missing,
      complete: completedFields,
      total: totalFields,
      completionPercentage,
      priority: missing.required.length > 0 ? 'critical' : missing.important.length > 0 ? 'important' : 'optional'
    }

  } catch (error) {
    console.error('Truth table gap analysis error:', error)
    return null
  }
}

async function generateEnhancedResponse(
  message: string, 
  context: any, 
  userId: string, 
  callStage: number
) {
  try {
    // Build context string
    let contextString = ''
    
    if (context.transcripts.length > 0) {
      contextString += '\n\n## Previous Conversation Context:\n'
      context.transcripts.forEach((transcript: any, index: number) => {
        contextString += `\nCall ${index + 1} (${transcript.call_stage}): ${transcript.semantic_summary || 'No summary available'}`
        if (transcript.similarity) {
          contextString += ` (Relevance: ${Math.round(transcript.similarity * 100)}%)`
        }
        contextString += '\n'
      })
    }

    if (context.knowledge.length > 0) {
      contextString += '\n\n## Relevant Business Formation Knowledge:\n'
      context.knowledge.forEach((item: any) => {
        contextString += `\n${item.category}: ${item.content}\n`
      })
    }

    if (context.dreamDNA) {
      contextString += '\n\n## User Dream DNA Context:\n'
      contextString += `Vision: ${context.dreamDNA.vision_statement || 'Not specified'}\n`
      contextString += `Business Concept: ${context.dreamDNA.business_concept || 'Not specified'}\n`
      contextString += `Target Customers: ${context.dreamDNA.target_customers || 'Not specified'}\n`
      contextString += `Urgency Level: ${context.dreamDNA.urgency_level || 'Medium'}\n`
      contextString += `Confidence Level: ${context.dreamDNA.confidence_level || 'Not specified'}/10\n`
    }

    if (context.truthTableGaps) {
      contextString += '\n\n## Truth Table Gap Analysis:\n'
      contextString += `Call Stage ${context.truthTableGaps.stage} Progress: ${context.truthTableGaps.completionPercentage}% complete\n`
      contextString += `Priority: ${context.truthTableGaps.priority}\n`
      
      if (context.truthTableGaps.missing.required.length > 0) {
        contextString += `Critical Missing: ${context.truthTableGaps.missing.required.join(', ')}\n`
      }
      if (context.truthTableGaps.missing.important.length > 0) {
        contextString += `Important Missing: ${context.truthTableGaps.missing.important.join(', ')}\n`
      }
      if (context.truthTableGaps.missing.optional.length > 0) {
        contextString += `Optional Missing: ${context.truthTableGaps.missing.optional.join(', ')}\n`
      }
    }

    // Create enhanced system prompt
    const enhancedSystemPrompt = `You are Elliot, a professional business formation consultant for DreamSeed with advanced RAG capabilities. This is Call ${callStage} of 4 in our systematic business formation process.

${contextString}

**Instructions:**
- Use the provided context to give personalized, accurate advice
- Reference previous conversations when relevant for continuity
- Cite specific business formation knowledge when applicable
- Consider the user's Dream DNA context for personalization
- Use truth table gap analysis to identify what's still missing
- Keep responses conversational and actionable
- Focus on the current call stage objectives
- If critical information is missing, prioritize gathering it
- If conversation context is relevant, reference it naturally

**Response Strategy:**
1. **Conversation Memory**: Reference previous discussions when relevant
2. **Knowledge Base**: Provide accurate business formation information
3. **Dream DNA**: Personalize based on user's vision and goals
4. **Gap Analysis**: Focus on missing critical information
5. **Progress Tracking**: Acknowledge completion status

**Current User Query:** ${message}

Provide a helpful, personalized response that leverages all available context and guides the user toward completing their business formation requirements.`

    // Generate response using OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: enhancedSystemPrompt },
        { role: 'user', content: message }
      ],
      max_tokens: 300,
      temperature: 0.7,
      user: userId
    })

    return completion.choices[0]?.message?.content || "I'm sorry, I couldn't process your request."

  } catch (error) {
    console.error('Enhanced response generation error:', error)
    return "I'm sorry, I encountered an error while processing your request."
  }
}
