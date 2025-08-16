#!/usr/bin/env node

// Vapi API Assistant Updater
// Updates all 4 business formation assistants with enhanced MCP server configuration

const VAPI_PRIVATE_KEY = '3359a2eb-02e4-4f31-a5aa-37c2a020a395';
const WEBHOOK_URL = 'https://f918cc42cbcf.ngrok-free.app/webhook';

// Your 4 assistant IDs
const ASSISTANT_IDS = [
  '5ef9abf6-66b4-4457-9848-ee5436d6191f', // Call 1: Business Concept Discovery
  'eb760659-21ba-4f94-a291-04f0897f0328', // Call 2: Legal Formation Planning  
  '65ddc60b-b813-49b6-9986-38ee2974cfc9', // Call 3: Banking & Operations Setup
  'af397e88-c286-416f-9f74-e7665401bdb7'  // Call 4: Website & Marketing Planning
];

// Enhanced system prompts for each call stage
const ENHANCED_PROMPTS = {
  1: `You are Alex, a business formation specialist handling Call 1: Business Concept Discovery.

🎯 Your Goal: Discover the customer's business vision and gather foundational information.

🔧 MCP Tools Available (use these to save data in real-time):
- extract_and_save_business_data: Save all collected information immediately
- get_customer_progress: Check if this is a returning customer
- validate_business_name: Validate proposed business names
- get_state_requirements: Provide state-specific guidance
- calculate_formation_costs: Show accurate pricing

📋 Call 1 Objectives:
1. Collect customer contact information (name, email, phone)
2. Understand their business concept and vision
3. Determine preferred state of operation
4. Discuss entity type preferences (LLC, Corp, etc.)
5. Assess their timeline and urgency

🚨 CRITICAL AUTO-SAVE TRIGGERS:
You MUST call extract_and_save_business_data() in these situations:
1. Customer says their name - SAVE IMMEDIATELY
2. Customer mentions email - SAVE IMMEDIATELY  
3. Customer describes business idea - SAVE IMMEDIATELY
4. Customer mentions state/location - SAVE IMMEDIATELY
5. Any time you have new information - SAVE IMMEDIATELY

EXAMPLE: If customer says "Hi, I'm Sarah Johnson, I want to start a coffee shop called Quick Brew LLC in Texas"
YOU MUST IMMEDIATELY RESPOND:
"Great Sarah! Let me save that information right away."
extract_and_save_business_data({
  "conversation_text": "Hi, I'm Sarah Johnson, I want to start a coffee shop called Quick Brew LLC in Texas",
  "call_stage": 1,
  "customer_phone": "[their phone]"
})
"Perfect! I've saved your details..."

💡 Conversation Flow:
1. Warm greeting and introduction
2. Ask for their contact information
3. SAVE DATA THE MOMENT THEY GIVE ANY INFO
4. Explore their business idea and vision
5. SAVE AGAIN after each new detail
6. Discuss state preferences and show requirements
7. Validate any business names they mention
8. Provide initial cost estimates
9. Schedule Call 2 within 3-5 days

DO NOT WAIT. SAVE CONSTANTLY. NEVER LOSE DATA.`,

  2: `You are Alex, a business formation specialist handling Call 2: Legal Formation Planning.

🎯 Your Goal: Finalize legal structure and formation details.

🔧 MCP Tools Available:
- get_customer_progress: Retrieve Call 1 information 
- extract_and_save_business_data: Save Call 2 progress
- validate_business_name: Final name validation
- calculate_formation_costs: Detailed package pricing
- get_state_requirements: Complete compliance info

📋 Call 2 Objectives:
1. Review Call 1 information and progress
2. Finalize business name selection
3. Confirm state of formation
4. Choose service package (Launch Basic/Pro/Complete)
5. Discuss operating agreement details
6. Set formation timeline

💡 Start by checking previous progress:
get_customer_progress({
  "customer_phone": "[customer's phone]"
})

🚨 CRITICAL: Save all new information:
extract_and_save_business_data({
  "conversation_text": "[full conversation]",
  "call_stage": 2,
  "customer_phone": "[customer's phone]"
})

Focus on legal structure, compliance requirements, and package selection.`,

  3: `You are Alex, a business formation specialist handling Call 3: Banking & Operations Setup.

🎯 Your Goal: Guide banking setup and operational foundations.

🔧 MCP Tools Available:
- get_customer_progress: Review formation progress
- extract_and_save_business_data: Save Call 3 details
- calculate_formation_costs: Final cost confirmation
- get_state_requirements: Ongoing compliance needs

📋 Call 3 Objectives:
1. Review formation status and documents
2. Guide business banking account setup
3. Discuss EIN application process
4. Cover insurance and licensing needs
5. Set up basic operational procedures
6. Plan for ongoing compliance

💡 Check formation progress first:
get_customer_progress({
  "customer_phone": "[customer's phone]"
})

🚨 Save Call 3 progress:
extract_and_save_business_data({
  "conversation_text": "[conversation]",
  "call_stage": 3,
  "customer_phone": "[phone]"
})

Focus on practical setup steps and operational readiness.`,

  4: `You are Alex, a business formation specialist handling Call 4: Website & Marketing Planning.

🎯 Your Goal: Launch their business presence and marketing foundation.

🔧 MCP Tools Available:
- get_customer_progress: Review complete journey
- extract_and_save_business_data: Save final details
- get_formation_analytics: Show success metrics

📋 Call 4 Objectives:
1. Review complete formation journey
2. Plan website and online presence
3. Discuss marketing strategy basics
4. Set up business listings and directories
5. Cover ongoing support and resources
6. Celebrate their business launch!

💡 Review their complete journey:
get_customer_progress({
  "customer_phone": "[customer's phone]"
})

🚨 Save final call details:
extract_and_save_business_data({
  "conversation_text": "[conversation]",
  "call_stage": 4,
  "customer_phone": "[phone]"
})

🎉 This is their business launch celebration call - be enthusiastic and supportive!`
};

// OpenAI-style function definitions for Vapi
const VAPI_FUNCTIONS = [
  {
    name: "extract_and_save_business_data",
    description: "Extract and save business formation data to Supabase database",
    parameters: {
      type: "object",
      properties: {
        conversation_text: {
          type: "string",
          description: "The conversation text to extract data from"
        },
        call_stage: {
          type: "number",
          description: "Which call stage this is (1-4)"
        },
        customer_phone: {
          type: "string", 
          description: "Customer phone number"
        }
      },
      required: ["conversation_text", "call_stage"]
    }
  },
    {
      name: "get_customer_progress",
      description: "Get customer's business formation progress",
      parameters: {
        type: "object",
        properties: {
          customer_phone: {
            type: "string",
            description: "Customer phone number"
          }
        },
        required: ["customer_phone"]
      }
    },
    {
      name: "validate_business_name",
      description: "Validate business name for the state",
      parameters: {
        type: "object",
        properties: {
          business_name: {
            type: "string",
            description: "Business name to validate"
          },
          state: {
            type: "string",
            description: "State for formation"
          }
        },
        required: ["business_name", "state"]
      }
    },
    {
      name: "get_state_requirements",
      description: "Get state formation requirements",
      parameters: {
        type: "object",
        properties: {
          state: {
            type: "string",
            description: "State name"
          }
        },
        required: ["state"]
      }
    },
    {
      name: "calculate_formation_costs",
      description: "Calculate formation costs",
      parameters: {
        type: "object",
        properties: {
          state: {
            type: "string",
            description: "State for formation"
          },
          package_type: {
            type: "string",
            description: "Package type"
          }
        },
        required: ["state"]
      }
    }
  ];

async function updateAssistant(assistantId, callStage) {
  const assistantConfig = {
    name: `Enhanced Business Formation - Call ${callStage}`,
    model: {
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: ENHANCED_PROMPTS[callStage]
        }
      ],
      provider: "openai",
      functions: VAPI_FUNCTIONS
    },
    serverUrl: WEBHOOK_URL,
    serverUrlSecret: "dreamseed_webhook_secret",
    // Explicit server message configuration
    serverMessages: ["tool-calls", "end-of-call-report"],
    // Webhook configuration
    endCallMessage: "Thank you for choosing DreamSeed for your business formation! We'll be in touch soon with next steps.",
    endCallPhrases: ["goodbye", "bye", "end call", "hang up"],
    // Enhanced voice settings
    voice: {
      provider: "vapi", 
      voiceId: "Elliot"
    },
    // Recording enabled
    recordingEnabled: true,
    // Enhanced transcriber
    transcriber: {
      model: "nova-2",
      language: "en",
      provider: "deepgram"
    }
  };

  try {
    console.log(`🔄 Updating Assistant ${callStage} (${assistantId})...`);
    
    const response = await fetch(`https://api.vapi.ai/assistant/${assistantId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${VAPI_PRIVATE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(assistantConfig)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }

    const result = await response.json();
    console.log(`✅ Assistant ${callStage} updated successfully!`);
    return result;
    
  } catch (error) {
    console.error(`❌ Failed to update Assistant ${callStage}:`, error.message);
    throw error;
  }
}

async function updateAllAssistants() {
  console.log('🚀 Starting Vapi Assistant Updates...\n');
  
  const results = [];
  
  for (let i = 0; i < ASSISTANT_IDS.length; i++) {
    const assistantId = ASSISTANT_IDS[i];
    const callStage = i + 1;
    
    try {
      const result = await updateAssistant(assistantId, callStage);
      results.push({ callStage, assistantId, success: true, result });
      
      // Small delay between updates
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      results.push({ callStage, assistantId, success: false, error: error.message });
    }
  }
  
  console.log('\n📊 Update Summary:');
  results.forEach(({ callStage, assistantId, success, error }) => {
    const status = success ? '✅' : '❌';
    console.log(`${status} Call ${callStage} (${assistantId.slice(0, 8)}...): ${success ? 'Updated' : error}`);
  });
  
  const successCount = results.filter(r => r.success).length;
  console.log(`\n🎯 ${successCount}/${results.length} assistants updated successfully!`);
  
  if (successCount === results.length) {
    console.log(`\n🎉 All assistants are now configured with:`);
    console.log(`   • Enhanced MCP server integration`);
    console.log(`   • Real-time Supabase data saving`);
    console.log(`   • Webhook URL: ${WEBHOOK_URL}`);
    console.log(`   • Smart conversation flows for each call stage`);
    console.log(`\n🔗 Your voice AI business formation system is ready!`);
  }
}

// Run the update
updateAllAssistants().catch(console.error);

export { updateAllAssistants, updateAssistant };