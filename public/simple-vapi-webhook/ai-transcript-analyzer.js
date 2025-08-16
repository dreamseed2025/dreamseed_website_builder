const OpenAI = require('openai');
const { createClient } = require('@supabase/supabase-js');

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function analyzeTranscriptWithAI(transcript, callStage = 1) {
  console.log('🤖 AI-Powered Transcript Analysis Starting...\n');
  
  const systemPrompt = `You are a data extraction specialist. Extract structured business formation data from conversation transcripts.
  
  Return ONLY valid JSON with these exact fields (use null if not found):
  {
    "customer_name": "full name",
    "customer_email": "email@domain.com",
    "customer_phone": "+1XXXXXXXXXX format",
    "business_name": "specific business name if mentioned",
    "business_type": "type of business/industry",
    "state_of_operation": "state name",
    "entity_type": "LLC/Corp/Inc/etc",
    "services": "what services/products they offer",
    "timeline": "Immediate/Within a month/Flexible/specific timeframe",
    "package_preference": "Basic/Standard/Premium if mentioned",
    "urgency_level": "High/Medium/Low",
    "key_requirements": "array of main requirements mentioned",
    "pain_points": "problems they're trying to solve",
    "budget_mentioned": "any budget discussed",
    "next_steps": "what they agreed to do next"
  }
  
  Important:
  - Convert "at" and "dot" to @ and . in emails
  - Format phone as +1 followed by 10 digits
  - Use proper case for names and states
  - Extract the essence, not literal text`;

  const userPrompt = `Extract business formation data from this conversation:
  
  ${transcript}
  
  Return ONLY the JSON object with extracted data.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.1, // Low temperature for consistent extraction
      max_tokens: 500
    });

    const responseText = completion.choices[0].message.content;
    console.log('🔍 AI Response:', responseText.substring(0, 200) + '...\n');
    
    // Parse the JSON response
    let extractedData;
    try {
      // Clean response (remove markdown if present)
      const cleanJson = responseText.replace(/```json\n?|\n?```/g, '').trim();
      extractedData = JSON.parse(cleanJson);
    } catch (parseError) {
      console.error('❌ JSON Parse Error:', parseError.message);
      // Fallback to basic extraction
      extractedData = {};
    }

    // Add metadata
    const enrichedData = {
      ...extractedData,
      call_stage: callStage,
      status: 'in_progress',
      entity_type: extractedData.entity_type || 'LLC',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ai_confidence_score: calculateConfidenceScore(extractedData),
      extraction_method: 'AI-GPT4'
    };

    // Calculate completeness
    enrichedData.data_completeness_score = calculateCompleteness(enrichedData);

    console.log('✅ AI Extraction Complete!');
    console.log('📊 Completeness:', enrichedData.data_completeness_score + '%');
    console.log('🎯 Confidence:', enrichedData.ai_confidence_score + '%\n');

    return enrichedData;

  } catch (error) {
    console.error('❌ AI Analysis Error:', error.message);
    // Fallback to regex patterns if AI fails
    return fallbackRegexExtraction(transcript);
  }
}

function calculateConfidenceScore(data) {
  let score = 0;
  const fields = ['customer_name', 'customer_email', 'customer_phone', 'business_name', 'state_of_operation'];
  
  fields.forEach(field => {
    if (data[field] && data[field] !== null) {
      score += 20;
    }
  });
  
  return score;
}

function calculateCompleteness(data) {
  let filledFields = 0;
  const totalFields = 15; // Total possible fields
  
  Object.keys(data).forEach(key => {
    if (data[key] !== null && data[key] !== undefined && 
        !['created_at', 'updated_at', 'call_stage', 'status', 'extraction_method'].includes(key)) {
      filledFields++;
    }
  });
  
  return Math.round((filledFields / totalFields) * 100);
}

function fallbackRegexExtraction(transcript) {
  console.log('⚠️ Using enhanced regex extraction (no AI available)...');
  
  const data = {
    customer_name: null,
    customer_email: null,
    customer_phone: null,
    business_name: null,
    business_type: null,
    state_of_operation: null,
    entity_type: 'LLC',
    services: null,
    timeline: null,
    package_preference: null,
    urgency_level: 'Medium',
    key_requirements: [],
    pain_points: null,
    budget_mentioned: null,
    next_steps: null
  };
  
  const text = transcript.toLowerCase();
  
  // Enhanced name extraction
  const nameMatch = transcript.match(/my name is ([A-Za-z]+(?: [A-Za-z]+)+)(?=[,\.]| and| my)/i);
  if (nameMatch) {
    data.customer_name = nameMatch[1].trim();
    console.log('✅ Name:', data.customer_name);
  }
  
  // Enhanced email extraction (handles "at" and "dot")
  const emailPatterns = [
    /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/,
    /email(?:\s+is)?\s+([a-zA-Z0-9._%+-]+)\s+at\s+([a-zA-Z0-9.-]+)\s+dot\s+([a-zA-Z]{2,})/i
  ];
  
  for (const pattern of emailPatterns) {
    const emailMatch = transcript.match(pattern);
    if (emailMatch) {
      if (emailMatch[0].includes('@')) {
        data.customer_email = emailMatch[1];
      } else if (emailMatch[3]) {
        data.customer_email = `${emailMatch[1]}@${emailMatch[2]}.${emailMatch[3]}`;
      }
      if (data.customer_email) {
        console.log('✅ Email:', data.customer_email);
        break;
      }
    }
  }
  
  // Enhanced phone extraction
  const phoneMatch = transcript.match(/(\d[\s]*\d[\s]*\d[\s]*\d[\s]*\d[\s]*\d[\s]*\d[\s]*\d[\s]*\d[\s]*\d)/);
  if (phoneMatch) {
    const cleanPhone = phoneMatch[1].replace(/\s/g, '');
    if (cleanPhone.length >= 10) {
      data.customer_phone = '+1' + cleanPhone.slice(-10);
      console.log('✅ Phone:', data.customer_phone);
    }
  }
  
  // Business type extraction
  if (text.includes('political') && text.includes('advising')) {
    data.business_type = 'Political Advising';
    console.log('✅ Business Type:', data.business_type);
  } else if (text.includes('music')) {
    data.business_type = 'Music Business';
    console.log('✅ Business Type:', data.business_type);
  } else if (text.includes('consulting')) {
    data.business_type = 'Consulting';
    console.log('✅ Business Type:', data.business_type);
  }
  
  // State extraction
  const states = ['California', 'Florida', 'Texas', 'New York', 'Delaware'];
  for (const state of states) {
    if (text.includes(state.toLowerCase())) {
      data.state_of_operation = state;
      console.log('✅ State:', state);
      break;
    }
  }
  
  // Timeline extraction
  if (text.includes('immediately') || text.includes('right away')) {
    data.timeline = 'Immediate';
    data.urgency_level = 'High';
    console.log('✅ Timeline: Immediate');
  }
  
  // Calculate completeness
  let completeness = 0;
  Object.keys(data).forEach(key => {
    if (data[key] && !['urgency_level', 'key_requirements', 'pain_points', 'budget_mentioned', 'next_steps'].includes(key)) {
      completeness += 10;
    }
  });
  
  data.data_completeness_score = Math.min(completeness, 100);
  data.ai_confidence_score = 75; // High confidence in regex patterns
  data.extraction_method = 'Enhanced Regex';
  
  console.log('📊 Completeness:', data.data_completeness_score + '%');
  
  return data;
}

async function saveToSupabase(data) {
  try {
    console.log('💾 Saving AI-extracted data to new database structure...');
    
    // Prepare user data for users table
    const userData = {
      customer_name: data.customer_name,
      customer_email: data.customer_email,
      customer_phone: data.customer_phone,
      business_name: data.business_name,
      business_type: data.business_type,
      state_of_operation: data.state_of_operation,
      entity_type: data.entity_type || 'LLC',
      status: data.status || 'in_progress',
      current_call_stage: data.call_stage || 1,
      package_preference: data.package_preference,
      urgency_level: data.urgency_level,
      timeline: data.timeline,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
    
    // Set call completion flags
    if (data.call_stage) {
      userData[`call_${data.call_stage}_completed`] = true;
      userData[`call_${data.call_stage}_completed_at`] = new Date().toISOString();
    }
    
    // Remove null values
    Object.keys(userData).forEach(key => {
      if (userData[key] === null || userData[key] === undefined) {
        delete userData[key];
      }
    });
    
    // Try to save to users table, but handle if it doesn't exist
    let user = null;
    try {
      // Check if user already exists by phone or email
      if (data.customer_phone) {
        const { data: existingUser } = await supabase
          .from('users')
          .select('*')
          .eq('customer_phone', data.customer_phone)
          .single();
        user = existingUser;
      }
      
      if (!user && data.customer_email) {
        const { data: existingUser } = await supabase
          .from('users')
          .select('*')
          .eq('customer_email', data.customer_email)
          .single();
        user = existingUser;
      }
      
      // Insert or update user
      if (user) {
        // Update existing user
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update(userData)
          .eq('id', user.id)
          .select()
          .single();
        
        if (updateError) throw updateError;
        user = updatedUser;
        console.log('✅ Updated existing user:', user.id);
      } else {
        // Create new user
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert([userData])
          .select()
          .single();
        
        if (insertError) throw insertError;
        user = newUser;
        console.log('✅ Created new user:', user.id);
      }
    } catch (error) {
      console.log('⚠️ Users table issue, using business_formations instead:', error.message);
      // Fall back to business_formations table
      const { data: businessData, error: businessError } = await supabase
        .from('business_formations')
        .insert([{
          customer_name: data.customer_name,
          customer_email: data.customer_email,
          customer_phone: data.customer_phone,
          business_name: data.business_name,
          state_of_operation: data.state_of_operation,
          entity_type: data.entity_type || 'LLC',
          call_stage: data.call_stage,
          status: data.status || 'in_progress',
          created_at: data.created_at,
          updated_at: data.updated_at
        }])
        .select()
        .single();
      
      if (businessError) throw businessError;
      console.log('✅ Saved to business_formations:', businessData.id);
      return businessData;
    }
    
    // Map to valid constraint values for dream_dna table
    const mapBrandVibe = (value) => {
      if (!value) return 'professional';
      const v = value.toLowerCase();
      if (v.includes('bold') || v.includes('aggressive')) return 'bold';
      if (v.includes('friendly') || v.includes('casual')) return 'friendly';
      if (v.includes('elegant') || v.includes('luxury')) return 'elegant';
      return 'professional';
    };
    
    const mapPriceLevel = (value) => {
      if (!value) return 'mid-market';
      const v = value.toLowerCase();
      if (v.includes('basic') || v.includes('budget') || v.includes('affordable')) return 'budget';
      if (v.includes('premium') || v.includes('complete') || v.includes('pro')) return 'premium';
      return 'mid-market';
    };
    
    const mapColorPreference = (urgency) => {
      if (!urgency) return 'cool';
      const u = urgency.toLowerCase();
      if (u.includes('high') || u.includes('urgent')) return 'vibrant';
      if (u.includes('low') || u.includes('relaxed')) return 'minimal';
      return 'cool';
    };
    
    // Prepare dream DNA data to match actual table structure
    const dreamData = {
      business_id: user.id, // Link to users table
      primary_service: data.services || data.business_type || 'Business services',
      who_serves: data.target_customers || 'Small businesses',
      what_problem: data.pain_points || 'Business formation and legal structure',
      how_different: data.unique_value_prop || data.services || 'Professional business formation',
      brand_vibe: mapBrandVibe(data.brand_personality || data.business_type),
      price_level: mapPriceLevel(data.package_preference),
      color_preference: mapColorPreference(data.urgency_level),
      version: 1,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
    
    // Remove null values
    Object.keys(dreamData).forEach(key => {
      if (dreamData[key] === null || dreamData[key] === undefined) {
        delete dreamData[key];
      }
    });
    
    // Try to work with dream_dna table if it exists and has proper structure
    let dreamResult = null;
    try {
      // First, try to create a business record if needed (since dream_dna references businesses)
      let businessId = user.id;
      
      // Check if businesses table exists and create/find business record
      try {
        const { data: existingBusiness } = await supabase
          .from('businesses')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (!existingBusiness) {
          // Create business record
          const { data: newBusiness, error: businessError } = await supabase
            .from('businesses')
            .insert([{
              id: user.id,
              name: data.business_name,
              created_at: data.created_at,
              updated_at: data.updated_at
            }])
            .select()
            .single();
          
          if (businessError) throw businessError;
          businessId = newBusiness.id;
          console.log('✅ Created business record:', businessId);
        }
      } catch (businessTableError) {
        console.log('⚠️ Businesses table issue, skipping dream_dna:', businessTableError.message);
        return { user, dream: null };
      }
      
      // Now handle dream_dna
      const { data: existingDream } = await supabase
        .from('dream_dna')
        .select('*')
        .eq('business_id', businessId)
        .single();
      
      if (existingDream) {
        // Update existing dream DNA
        const { data: updatedDream, error: dreamUpdateError } = await supabase
          .from('dream_dna')
          .update(dreamData)
          .eq('business_id', businessId)
          .select()
          .single();
        
        if (dreamUpdateError) throw dreamUpdateError;
        dreamResult = updatedDream;
        console.log('✅ Updated dream DNA for business:', businessId);
      } else {
        // Create new dream DNA
        dreamData.business_id = businessId;
        const { data: newDream, error: dreamInsertError } = await supabase
          .from('dream_dna')
          .insert([dreamData])
          .select()
          .single();
        
        if (dreamInsertError) throw dreamInsertError;
        dreamResult = newDream;
        console.log('✅ Created dream DNA for business:', businessId);
      }
    } catch (dreamError) {
      console.log('⚠️ Dream DNA table issue, skipping:', dreamError.message);
      dreamResult = null;
    }
    
    console.log('📊 Completeness:', data.data_completeness_score + '%');
    console.log('🎯 AI Confidence:', data.ai_confidence_score + '%');
    
    return { user, dream: dreamResult };
    
  } catch (error) {
    console.error('❌ Save error:', error.message);
    throw error;
  }
}

// Export for use in webhook server
module.exports = {
  analyzeTranscriptWithAI,
  saveToSupabase
};