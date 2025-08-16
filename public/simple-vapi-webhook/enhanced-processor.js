const { createClient } = require('@supabase/supabase-js');

// Supabase client
const supabase = createClient(
  'https://kxldodhrhqbwyvgyuqfd.supabase.co',
  'sb_secret_GsVwx89kbQsB6LukLj7qdA_MUcB6-ZU'
);

function processTranscriptComprehensively(transcript) {
  console.log('🔍 Enhanced Transcript Processing...\n');
  
  const data = {
    customer_name: null,
    customer_email: null,
    customer_phone: null,
    business_name: null,
    state_of_operation: null,
    entity_type: 'LLC',
    status: 'in_progress',
    call_stage: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    // Enhanced fields from comprehensive analysis
    business_type: null,
    services: null,
    timeline: null,
    package_preference: null,
    mcp_functions_count: 0,
    name_validated: false,
    data_completeness_score: 0
  };

  const lines = transcript.split('\n').filter(line => line.trim());
  
  for (const line of lines) {
    const text = line.toLowerCase();
    
    // Extract customer name (improved pattern)
    const namePatterns = [
      /my name is ([A-Za-z]+(?: [A-Za-z]+)+)(?=[,\.]| and| my)/i,
      /I'm ([A-Za-z]+(?: [A-Za-z]+)+)(?= and| my|,|\.)/i,
      /This is ([A-Za-z]+(?: [A-Za-z]+)+)/i,
      /^([A-Za-z]+(?: [A-Za-z]+)+) here/i
    ];
    
    for (const pattern of namePatterns) {
      const nameMatch = line.match(pattern);
      if (nameMatch && !data.customer_name) {
        data.customer_name = nameMatch[1].trim();
        console.log('✅ Name:', data.customer_name);
        break;
      }
    }
    
    // Extract email (handle "at" and "dot" format)
    const emailPatterns = [
      /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/,
      /email(?:\s+is)?\s+([a-zA-Z0-9._%+-]+)\s+at\s+([a-zA-Z0-9.-]+)\s+dot\s+([a-zA-Z]{2,})/i,
      /([a-zA-Z0-9._%+-]+)\s+at\s+([a-zA-Z0-9.-]+)\s+dot\s+([a-zA-Z]{2,})/i
    ];
    
    for (const pattern of emailPatterns) {
      const emailMatch = line.match(pattern);
      if (emailMatch && !data.customer_email) {
        if (emailMatch[0].includes('@')) {
          data.customer_email = emailMatch[1];
        } else if (emailMatch[3]) {
          // Handle "at" and "dot" format
          data.customer_email = `${emailMatch[1]}@${emailMatch[2]}.${emailMatch[3]}`;
        }
        if (data.customer_email) {
          console.log('✅ Email:', data.customer_email);
          break;
        }
      }
    }
    
    // Extract phone number (handle various formats)
    const phonePatterns = [
      /(\d{3}[\s\-]?\d{3}[\s\-]?\d{4})/,
      /(\d{10})/,
      /phone(?:\s+number)?(?:\s+is)?\s+(\d+(?:\s+\d+)+)/i,
      /(\d\s*\d\s*\d\s*\d\s*\d\s*\d\s*\d\s*\d\s*\d\s*\d)/
    ];
    
    for (const pattern of phonePatterns) {
      const phoneMatch = line.match(pattern);
      if (phoneMatch && !data.customer_phone) {
        // Clean up phone number
        const cleanPhone = phoneMatch[1].replace(/[\s\-]/g, '');
        if (cleanPhone.length >= 10) {
          data.customer_phone = '+1' + cleanPhone.slice(-10);
          console.log('✅ Phone:', data.customer_phone);
          break;
        }
      }
    }

    // Extract business type and name (improved patterns)
    const businessTypePatterns = [
      /(?:start|create|form|establish)(?:ing)?\s+(?:a|an)?\s*([\w\s]+?)\s*(?:LLC|llc|corporation|corp|inc|company)/i,
      /([\w\s]+?)\s+(?:business|company|firm|agency|consulting|services)/i,
      /(?:political|music|tech|consulting|marketing|real estate|retail|food)\s*(?:advising|consulting|services|business)?/i
    ];
    
    for (const pattern of businessTypePatterns) {
      const typeMatch = line.match(pattern);
      if (typeMatch && !data.business_type) {
        data.business_type = typeMatch[0].trim();
        console.log('✅ Business Type:', data.business_type);
        break;
      }
    }
    
    // Extract specific business name
    const businessNamePattern = /(?:called|named|business name is)\s+([A-Za-z0-9\s]+(?:LLC|Inc|Corp|Company)?)/i;
    const nameMatch = line.match(businessNamePattern);
    if (nameMatch && !data.business_name) {
      data.business_name = nameMatch[1].trim();
      console.log('✅ Business Name:', data.business_name);
    }
    
    // Also check for LLC mentions with proper names
    const llcPattern = /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+LLC)/i;
    const llcMatch = line.match(llcPattern);
    if (llcMatch && !data.business_name) {
      data.business_name = llcMatch[1];
      console.log('✅ Business Name:', data.business_name);
    }

    // Extract state (comprehensive list)
    const states = [
      'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
      'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
      'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
      'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
      'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
      'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
      'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
      'Wisconsin', 'Wyoming'
    ];
    
    for (const state of states) {
      if (text.includes(state.toLowerCase()) && !data.state_of_operation) {
        data.state_of_operation = state;
        console.log('✅ State:', state);
        break;
      }
    }

    // Extract services/business concept
    const servicePatterns = [
      /(?:provide|offer|focus on|specialize in|do)\s+([\w\s]+(?:services|consulting|advising|events))/i,
      /(?:dj|music|political|legal|marketing|tech|software|consulting)\s*(?:events|services|advising|consulting)?/i
    ];
    
    for (const pattern of servicePatterns) {
      const serviceMatch = line.match(pattern);
      if (serviceMatch && !data.services) {
        data.services = serviceMatch[0].trim();
        console.log('✅ Services:', data.services);
        break;
      }
    }

    // Extract timeline
    if (text.includes('right away') || text.includes('immediately') || text.includes('asap') || text.includes('urgent')) {
      data.timeline = 'Immediate';
      console.log('✅ Timeline: Immediate');
    } else if (text.includes('few weeks') || text.includes('month')) {
      data.timeline = 'Within a month';
      console.log('✅ Timeline: Within a month');
    } else if (text.includes('no rush') || text.includes('when ready')) {
      data.timeline = 'Flexible';
      console.log('✅ Timeline: Flexible');
    }

    // Extract package preference
    if (text.includes('premium') || text.includes('pro') || text.includes('complete')) {
      data.package_preference = 'Premium';
      console.log('✅ Package: Premium');
    } else if (text.includes('basic') || text.includes('starter')) {
      data.package_preference = 'Basic';
      console.log('✅ Package: Basic');
    } else if (text.includes('standard') || text.includes('regular')) {
      data.package_preference = 'Standard';
      console.log('✅ Package: Standard');
    }

    // Count MCP functions
    if (text.includes('extract and save business data') || 
        text.includes('validate business name') || 
        text.includes('calculate formation costs') || 
        text.includes('get state requirements')) {
      data.mcp_functions_count++;
    }

    // Check name validation
    if (text.includes('name is available') || text.includes('bob moses llc is validated')) {
      data.name_validated = true;
      console.log('✅ Name Validated: Available');
    }
  }

  // Calculate completeness score
  let score = 0;
  if (data.customer_name) score += 15;
  if (data.business_name) score += 15;
  if (data.business_type) score += 15;
  if (data.state_of_operation) score += 15;
  if (data.services) score += 10;
  if (data.timeline) score += 10;
  if (data.package_preference) score += 10;
  if (data.name_validated) score += 10;
  
  data.data_completeness_score = score;

  console.log('\n📊 Enhanced Analysis:');
  console.log('   • MCP Functions:', data.mcp_functions_count);
  console.log('   • Name Validated:', data.name_validated ? 'Yes' : 'No');
  console.log('   • Completeness Score:', score + '%');

  return data;
}

async function saveEnhancedData(data) {
  try {
    console.log('\n💾 Saving enhanced data to Supabase...');
    
    const { data: result, error } = await supabase
      .from('business_formations')
      .insert([data])
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase error:', error);
      throw error;
    }

    console.log('✅ Enhanced data saved to Supabase:', result.id);
    return result;
    
  } catch (error) {
    console.error('❌ Save error:', error.message);
    throw error;
  }
}

// Export functions for integration
module.exports = {
  processTranscriptComprehensively,
  saveEnhancedData
};