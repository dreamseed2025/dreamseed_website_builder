import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

// Simplified extraction config built into the webhook
const CALL_1_FIELDS = {
  customer_name: {
    patterns: ["(?:my name is|i'm|i am)\\s+([A-Z][a-z]+\\s+[A-Z][a-z]+)"],
    questions: ["name"]
  },
  customer_email: {
    patterns: ["[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}"]
  },
  business_name: {
    questions: ["business name", "name your business", "what to call"]
  },
  business_description: {
    questions: ["what business", "what kind of business", "what does your business"]
  },
  state_of_operation: {
    patterns: ["\\b(California|Florida|Texas|Tennessee|New York|Delaware|Alabama|Alaska|Arizona|Arkansas|Colorado|Connecticut|Georgia|Hawaii|Idaho|Illinois|Indiana|Iowa|Kansas|Kentucky|Louisiana|Maine|Maryland|Massachusetts|Michigan|Minnesota|Mississippi|Missouri|Montana|Nebraska|Nevada|New Hampshire|New Jersey|New Mexico|North Carolina|North Dakota|Ohio|Oklahoma|Oregon|Pennsylvania|Rhode Island|South Carolina|South Dakota|Utah|Vermont|Virginia|Washington|West Virginia|Wisconsin|Wyoming)\\b"]
  },
  entity_type: {
    patterns: ["\\b(LLC|Limited Liability Company|S-Corp|C-Corp|Corporation)\\b"],
    default: "LLC"
  }
}

Deno.serve(async (req) => {
  try {
    const vapiData = await req.json()
    const messages = vapiData.call?.messages || []
    const transcript = vapiData.call?.transcript || ''
    
    // Extract data using the simplified config
    const extractedData = {
      customer_phone: vapiData.call?.phoneNumber,
      call_1_transcript: transcript,
      status: 'call_1_complete',
      call_1_completed_at: new Date().toISOString()
    }

    // Extract each configured field
    for (const [fieldName, fieldConfig] of Object.entries(CALL_1_FIELDS)) {
      const value = extractField(fieldName, fieldConfig, messages, transcript)
      if (value) {
        extractedData[fieldName] = value
      } else if (fieldConfig.default) {
        extractedData[fieldName] = fieldConfig.default
      }
    }
    
    console.log('Extracted business data:', extractedData)
    
    const { data, error } = await supabase
      .from('business_formations')
      .insert([extractedData])
      .select()
      .single()

    if (error) throw error

    return new Response(JSON.stringify({ 
      success: true, 
      record_id: data.id,
      extracted_data: extractedData
    }))

  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})

// Enhanced extraction function
function extractField(fieldName, fieldConfig, messages, transcript) {
  // Try context-based extraction first (assistant questions)
  if (fieldConfig.questions) {
    const contextValue = extractByContext(messages, fieldConfig.questions)
    if (contextValue) return contextValue.trim()
  }

  // Try pattern-based extraction
  if (fieldConfig.patterns) {
    for (const pattern of fieldConfig.patterns) {
      const patternValue = extractByPattern(messages, transcript, pattern)
      if (patternValue) return patternValue.trim()
    }
  }

  return null
}

function extractByContext(messages, assistantQuestions) {
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i]
    if (msg.role === 'user') {
      const prevMsg = messages[i - 1]
      if (prevMsg && prevMsg.role === 'assistant') {
        for (const question of assistantQuestions) {
          if (prevMsg.message.toLowerCase().includes(question.toLowerCase())) {
            return msg.message
          }
        }
      }
    }
  }
  return null
}

function extractByPattern(messages, transcript, pattern) {
  const regex = new RegExp(pattern, 'i')
  
  // Try messages first
  for (const msg of messages) {
    if (msg.role === 'user') {
      const match = msg.message.match(regex)
      if (match && match[1]) return match[1]
    }
  }
  
  // Try full transcript
  const match = transcript.match(regex)
  return match && match[1] ? match[1] : null
}