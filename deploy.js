// deploy.js
import fetch from 'node-fetch';

// Add your Vapi API key here
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

// Simple assistant creation function
async function createAssistant(name, prompt) {
  const config = {
    name: name,
    voice: {
      provider: "11labs",  // ✅ Fixed: was "eleven-labs"
      voiceId: "21m00Tcm4TlvDq8ikWAM"
    },
    model: {
      provider: "openai",
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: prompt
        }
      ]
    },
    recordingEnabled: true,
    endCallPhrases: ["goodbye", "thank you", "bye", "end call"]
  };
  
  return await vapiApiCall('/assistant', 'POST', config);
}

// Deploy all 4 assistants
async function deployAssistants() {
  console.log('🚀 Creating your 4 business formation assistants...');
  
  const assistants = {};
  
  try {
    // Call 1: Basic concept
    const call1 = await createAssistant(
      "Business Formation - Call 1",
      `You are Alex, a business formation specialist. This is CALL 1 of 4.
      
      START: "Hi! I'm Alex with business formation services. What's your name and what state will you be forming your LLC in?"
      
      COLLECT: Name, state, business concept, business name, personal email, phone
      
      END: "Perfect! Tomorrow I'll call to get the legal details. This is call 2 of 4."`
    );
    
    assistants.call_1 = call1.id;
    console.log('✅ Call 1 Assistant created:', call1.id);
    
    // Call 2: Legal formation
    const call2 = await createAssistant(
      "Business Formation - Call 2", 
      `You are Alex calling for CALL 2 of 4 - legal formation details.
      
      START: "Hi [Name]! Ready to get [Business Name] legally filed?"
      
      COLLECT: Business address, registered agent, ownership details, state requirements
      
      END: "Great! Your LLC will be filed within 5 days. Call 3 tomorrow for banking setup."`
    );
    
    assistants.call_2 = call2.id;
    console.log('✅ Call 2 Assistant created:', call2.id);
    
    // Call 3: Banking & operations
    const call3 = await createAssistant(
      "Business Formation - Call 3",
      `You are Alex calling for CALL 3 of 4 - banking and operations.
      
      START: "Hi [Name]! Good news - [Business Name] is approved! Let's set up banking."
      
      COLLECT: Banking preferences, business phone, domain, business cards
      
      END: "Almost done! Final call tomorrow for your website setup."`
    );
    
    assistants.call_3 = call3.id;
    console.log('✅ Call 3 Assistant created:', call3.id);
    
    // Call 4: Website
    const call4 = await createAssistant(
      "Business Formation - Call 4",
      `You are Alex calling for CALL 4 of 4 - FINAL website setup.
      
      START: "Hi [Name]! Final step - let's create your professional website!"
      
      COLLECT: Website content, design preferences, features needed, social media
      
      END: "Congratulations! [Business Name] is 100% complete!"`
    );
    
    assistants.call_4 = call4.id;
    console.log('✅ Call 4 Assistant created:', call4.id);
    
    console.log('\n🎉 All assistants created successfully!');
    console.log('Your Assistant IDs:');
    console.log(JSON.stringify(assistants, null, 2));
    
    return assistants;
    
  } catch (error) {
    console.error('❌ Error creating assistants:', error.message);
  }
}

// Run the deployment
deployAssistants();