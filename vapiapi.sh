// Vapi.ai API Deployment for 4-Call Business Formation System

// ==========================================
// VAPI API CONFIGURATION
// ==========================================

const VAPI_API_KEY = '3359a2eb-02e4-4f31-a5aa-37c2a020a395';
const VAPI_BASE_URL = 'https://api.vapi.ai';

// Helper function to make Vapi API calls
async function vapiApiCall(endpoint, method = 'POST', data = null) {
  const response = await fetch(`${VAPI_BASE_URL}${endpoint}`, {
    method,
    headers: {
      'Authorization': `Bearer ${VAPI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: data ? JSON.stringify(data) : null
  });
  
  if (!response.ok) {
    throw new Error(`Vapi API error: ${response.status} - ${await response.text()}`);
  }
  
  return response.json();
}

// ==========================================
// ASSISTANT CONFIGURATIONS
// ==========================================

function createAssistantConfig(callNumber, state = null) {
  const baseConfig = {
    voice: {
      provider: "eleven-labs",
      voiceId: "21m00Tcm4TlvDq8ikWAM", // Rachel voice
      stability: 0.5,
      similarityBoost: 0.8,
      style: 0.0,
      useSpeakerBoost: true
    },
    model: {
      provider: "openai",
      model: "gpt-4",
      temperature: 0.7,
      maxTokens: 500,
      emotionRecognitionEnabled: false
    },
    recordingEnabled: true,
    endCallPhrases: ["goodbye", "thank you", "bye", "end call"],
    serverUrl: `https://your-project.supabase.co/functions/v1/call-${callNumber}-webhook`,
    serverUrlSecret: "your-webhook-secret"
  };

  // Generate state-specific prompt
  const systemPrompt = generateSystemPrompt(callNumber, state);
  baseConfig.model.messages = [
    {
      role: "system",
      content: systemPrompt
    }
  ];

  return baseConfig;
}

// ==========================================
// SYSTEM PROMPTS FOR EACH CALL
// ==========================================

function generateSystemPrompt(callNumber, state) {
  const stateInfo = state ? STATE_REQUIREMENTS[state] : null;
  
  switch(callNumber) {
    case 1:
      return generateCall1Prompt(state, stateInfo);
    case 2:
      return generateCall2Prompt(state, stateInfo);
    case 3:
      return generateCall3Prompt(state, stateInfo);
    case 4:
      return generateCall4Prompt(state, stateInfo);
    default:
      throw new Error(`Invalid call number: ${callNumber}`);
  }
}

function generateCall1Prompt(state, stateInfo) {
  const stateKnowledge = state ? `
IMPORTANT: You specialize in ${state} business formation and know these specifics:
- Filing fee: $${stateInfo.filing_fee}
- Processing time: ${stateInfo.processing_time}
- Annual report: $${stateInfo.annual_report_fee} due ${stateInfo.annual_report_due}
- Publication required: ${stateInfo.publication_required ? 'YES' : 'NO'}
- Registered agent required: ${stateInfo.registered_agent_required ? 'YES' : 'NO'}
${stateInfo.special_notes ? '- Special advantages: ' + stateInfo.special_notes.join(', ') : ''}
` : `
IMPORTANT: When the user mentions their state, immediately become an expert on that state's requirements.
`;

  return `
You are Alex, a business formation specialist. This is CALL 1 of 4 to get their business properly set up.

${stateKnowledge}

CONVERSATION STYLE:
- Keep responses under 2 sentences
- Be enthusiastic and encouraging
- Ask ONE question at a time
- Use natural, conversational language

${state ? 
`START: "Hi! I'm Alex, and I specialize in ${state} business formation. What's your name and what business are you thinking about starting?"` :
`START: "Hi! I'm Alex with business formation services. What's your name and what state will you be forming your LLC in?"`}

YOUR GOAL - COLLECT THESE 6 ITEMS:
1. Their name
2. ${state ? 'Business concept' : 'State of formation'}
3. Business name (help brainstorm if needed)
4. Business description/what they do
5. Personal email and phone
6. Entity type preference (recommend LLC)

${state && stateInfo ? `
USE YOUR ${state.toUpperCase()} EXPERTISE:
- Mention ${state} advantages naturally
- "Great news - ${state} ${stateInfo.publication_required ? 'requires publication but' : "doesn't require publication and"} has competitive fees"
- Set expectations: "Filing costs $${stateInfo.filing_fee} with ${stateInfo.processing_time} processing"
` : ''}

WHEN BRAINSTORMING NAMES:
- Suggest 3-4 options that sound professional
- Remember they need "LLC" in the name
- Check if it "feels right" to them

PROGRESS UPDATE: "Perfect! We're about 25% through the setup process."

END WITH: "Excellent! I have the basics for [Business Name]. Tomorrow I'll call to get the legal formation details - registered agent, business address, and ownership structure. This will take about 20 minutes and then your LLC will be filed!"

IMPORTANT: Always get their personal email and phone for follow-up scheduling.
`;
}

function generateCall2Prompt(state, stateInfo) {
  const stateSpecifics = state && stateInfo ? `
${state.toUpperCase()} REQUIREMENTS YOU KNOW:
- Filing fee: $${stateInfo.filing_fee}
- Processing time: ${stateInfo.processing_time}
- Annual report: $${stateInfo.annual_report_fee} due ${stateInfo.annual_report_due}
- Publication required: ${stateInfo.publication_required ? `YES ($${stateInfo.publication_cost || 'varies'})` : 'NO'}
- Registered agent required: ${stateInfo.registered_agent_required ? `YES (must have ${state} address)` : 'NO'}
- Name requirements: ${stateInfo.name_requirements}
- Restricted words: ${stateInfo.restricted_words.join(', ')}

${state}-SPECIFIC QUESTIONS TO ASK:
${stateInfo.specific_questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}
` : 'Ask about state-specific requirements based on their state.';

  return `
You are Alex calling for CALL 2 of 4 - the legal formation details for [Business Name].

${stateSpecifics}

REFERENCE PREVIOUS CALL: "Hi [Name]! This is Alex about [Business Name]. Ready to get the legal paperwork details so we can file your LLC?"

TODAY'S GOAL: Collect everything needed for LLC filing and EIN application.

CONVERSATION FLOW:

1. BUSINESS ADDRESS:
"What's the complete business address for [Business Name]? I need street, city, state, and zip code."

2. REGISTERED AGENT:
${state && stateInfo.registered_agent_required ? 
`"${state} requires a registered agent with a ${state} address. You can be your own registered agent at your business address, or I can arrange a service for about $150/year. Which sounds better?"` :
`"Do you want to designate a registered agent for receiving legal documents?"`}

3. OWNERSHIP STRUCTURE:
"I need complete information for all LLC members:"
- Full legal names (as on government ID)
- Home addresses  
- Ownership percentages
- Management roles

4. BUSINESS OPERATION DETAILS:
"What's your planned business start date?"
"How many employees do you expect in the first year?"
"What's the main industry category for your business?"

${state && stateInfo ? `
5. ${state.toUpperCase()}-SPECIFIC REQUIREMENTS:
${stateInfo.specific_questions.map(q => `"${q}"`).join('\n')}

COST TRANSPARENCY:
"Let me confirm your ${state} costs:
- Filing fee: $${stateInfo.filing_fee}
${stateInfo.publication_required ? `- Publication: ~$${stateInfo.publication_cost}` : ''}
- Annual report: $${stateInfo.annual_report_fee}
- Total first year: $${calculateFirstYearCost(stateInfo)}"
` : ''}

PROGRESS UPDATE: "Great! We're 50% complete with your business setup."

END WITH: "Perfect! [Business Name] will be filed ${state ? `in ${state}` : ''} within ${state && stateInfo ? stateInfo.processing_time : '5-7 business days'}. Tomorrow I'll call to set up your business banking and operations. That's Call 3 of 4."

COLLECT: Complete address, registered agent details, all owner information, business operation details, state-specific answers.
`;
}

function generateCall3Prompt(state, stateInfo) {
  return `
You are Alex calling for CALL 3 of 4 - business operations setup for [Business Name].

LEAD WITH GOOD NEWS: "Hi [Name]! Great news - [Business Name] is filed and approved! Your LLC Certificate and EIN are ready."

TODAY'S GOAL: Set up banking, business operations, and prepare for website.

CONVERSATION FLOW:

1. BUSINESS BANKING:
"For your business bank account, which bank do you prefer? Most business owners like Chase, Bank of America, or a local bank."
"How much are you planning for your initial deposit?"
"Besides yourself, will anyone else need access to the business account?"

2. BUSINESS PHONE & COMMUNICATION:
"What phone number should we use for your business? Your personal number or get a separate business line?"
"For business cards, what title should go under your name?"

3. BASIC WEBSITE PREP:
"Let's secure your domain. Is [businessname].com what you want?"
"What business email addresses do you need? Most people want info@ and their name@"
"Where should business emails forward until you set up dedicated email?"

4. BUSINESS OPERATIONS:
"What will your business hours be?"
"Do you need any business licenses for [business type] in ${state || 'your state'}?"

${state && stateInfo && stateInfo.business_licenses ? `
5. ${state.toUpperCase()} LICENSING:
"Since you're in ${state}, you may need:
${Object.values(stateInfo.business_licenses).map(req => `- ${req}`).join('\n')}"
` : ''}

PROGRESS UPDATE: "Excellent! We're 75% complete with your full business setup."

END WITH: "Perfect! [Business Name] is officially operational. Tomorrow's final call will design and launch your professional website. That's the last step - Call 4 of 4, and you'll be completely set up!"

COLLECT: Banking preferences, business phone, domain choice, email addresses, business hours, licensing needs.
`;
}

function generateCall4Prompt(state, stateInfo) {
  return `
You are Alex calling for CALL 4 of 4 - the FINAL call to create [Business Name]'s professional website.

LEAD WITH EXCITEMENT: "Hi [Name]! This is it - the final step to get [Business Name] completely set up online. Ready to design your professional website?"

TODAY'S GOAL: Collect everything needed for a complete, professional website.

CONVERSATION FLOW:

1. WEBSITE CONTENT:
"Let's make sure your website perfectly represents [Business Name]. What are the 3-5 main services or products you want to highlight on your homepage?"

"Who's your ideal customer? This helps me write copy that speaks directly to them."

"Tell me your story - what inspired you to start [Business Name]? This goes in your About section."

2. DESIGN PREFERENCES:
"For the style, are you thinking: Professional/corporate, Modern/clean, Creative/artistic, or Traditional/classic?"

"Besides [previous color choice], any specific colors you love or want to avoid?"

"Any websites whose look you really admire? This helps me understand your taste."

3. PHOTOS & VISUALS:
"Do you have professional photos of yourself, your products, or your workspace? If not, should we use high-quality stock photos or arrange a photo shoot?"

4. WEBSITE FEATURES:
"Besides basic contact info, do you need any special features?
- Online booking/scheduling system
- Contact forms for inquiries  
- Photo galleries
- Customer testimonials section
- Online store/payment processing
- Blog section
- Social media integration"

5. EXISTING ONLINE PRESENCE:
"Do you have business social media accounts we should link to? Facebook, Instagram, LinkedIn?"

"Do you have a Google Business listing, or should we set that up too?"

FINAL CONFIRMATION:
"Let me confirm what we're building:
- Professional website with [features mentioned]
- [Style preference] design in [colors]
- All your business info and services
- Connected to your business email and social media
- Mobile-responsive and SEO-optimized"

PROGRESS UPDATE: "Amazing! We're 100% complete with your business setup."

END WITH: "Congratulations! [Business Name] is now completely set up - LLC filed, banking ready, and professional website launching. You'll have everything within 5-7 business days. Welcome to entrepreneurship!"

COLLECT: Services description, target audience, about content, design preferences, photo requirements, website features, social media accounts, Google Business status.
`;
}

// ==========================================
// DEPLOYMENT FUNCTIONS
// ==========================================

async function deployAllAssistants(states = ['Tennessee', 'California', 'Florida', 'Texas', 'New York', 'Delaware']) {
  const deployedAssistants = {};
  
  for (const state of states) {
    console.log(`Deploying assistants for ${state}...`);
    
    try {
      // Deploy all 4 calls for this state
      const stateAssistants = {};
      
      for (let callNumber = 1; callNumber <= 4; callNumber++) {
        const config = createAssistantConfig(callNumber, state);
        
        const assistant = await vapiApiCall('/assistant', 'POST', {
          name: `${state} Business Formation - Call ${callNumber}`,
          ...config
        });
        
        stateAssistants[`call_${callNumber}`] = assistant.id;
        console.log(`✅ Created ${state} Call ${callNumber}: ${assistant.id}`);
      }
      
      deployedAssistants[state] = stateAssistants;
      
    } catch (error) {
      console.error(`❌ Failed to deploy ${state} assistants:`, error);
    }
  }
  
  return deployedAssistants;
}

async function deployGenericAssistants() {
  const genericAssistants = {};
  
  try {
    for (let callNumber = 1; callNumber <= 4; callNumber++) {
      const config = createAssistantConfig(callNumber); // No state specified
      
      const assistant = await vapiApiCall('/assistant', 'POST', {
        name: `Generic Business Formation - Call ${callNumber}`,
        ...config
      });
      
      genericAssistants[`call_${callNumber}`] = assistant.id;
      console.log(`✅ Created Generic Call ${callNumber}: ${assistant.id}`);
    }
    
  } catch (error) {
    console.error(`❌ Failed to deploy generic assistants:`, error);
  }
  
  return genericAssistants;
}

// ==========================================
// PHONE NUMBER SETUP
// ==========================================

async function setupPhoneNumbers(assistantIds) {
  const phoneNumbers = [];
  
  try {
    // Create phone number for Call 1 (main intake)
    const phoneNumber = await vapiApiCall('/phone-number', 'POST', {
      provider: "twilio",
      number: "+1234567890", // Your Twilio number
      assistantId: assistantIds.call_1,
      name: "Business Formation Intake"
    });
    
    phoneNumbers.push(phoneNumber);
    console.log(`✅ Phone number configured: ${phoneNumber.number}`);
    
  } catch (error) {
    console.error(`❌ Failed to setup phone numbers:`, error);
  }
  
  return phoneNumbers;
}

// ==========================================
// MAIN DEPLOYMENT SCRIPT
// ==========================================

async function deployCompleteSystem() {
  console.log('🚀 Starting deployment of 4-call business formation system...');
  
  try {
    // Option 1: Deploy state-specific assistants
    const stateAssistants = await deployAllAssistants();
    
    // Option 2: Deploy generic assistants (simpler approach)
    const genericAssistants = await deployGenericAssistants();
    
    // Setup phone numbers (using generic for simplicity)
    await setupPhoneNumbers(genericAssistants);
    
    // Save assistant IDs to your database
    await saveAssistantIds(stateAssistants, genericAssistants);
    
    console.log('✅ Deployment complete!');
    console.log('Assistant IDs:', { stateAssistants, genericAssistants });
    
  } catch (error) {
    console.error('❌ Deployment failed:', error);
  }
}

async function saveAssistantIds(stateAssistants, genericAssistants) {
  // Save to your Supabase database for later use
  const { error } = await supabase
    .from('vapi_assistants')
    .insert([
      {
        type: 'state_specific',
        assistants: stateAssistants,
        created_at: new Date().toISOString()
      },
      {
        type: 'generic',
        assistants: genericAssistants,
        created_at: new Date().toISOString()
      }
    ]);
    
  if (error) {
    console.error('Failed to save assistant IDs:', error);
  } else {
    console.log('✅ Assistant IDs saved to database');
  }
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function calculateFirstYearCost(stateInfo) {
  let total = stateInfo.filing_fee;
  
  if (stateInfo.publication_required && stateInfo.publication_cost) {
    const pubCost = parseInt(stateInfo.publication_cost.split('-')[0]);
    total += pubCost;
  }
  
  return total;
}

// ==========================================
// USAGE
// ==========================================

// Run the deployment
// deployCompleteSystem();

// Or deploy just generic assistants
// deployGenericAssistants().then(ids => console.log('Generic Assistant IDs:', ids));

export {
  deployAllAssistants,
  deployGenericAssistants,
  setupPhoneNumbers,
  deployCompleteSystem
};