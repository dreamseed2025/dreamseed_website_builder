const axios = require('axios');

// Test data simulating a VAPI webhook
const testWebhookData = {
  type: 'call-end',
  callId: 'test-call-' + Date.now(),
  call: {
    id: 'test-call-' + Date.now(),
    customer: {
      number: '+15551234567',
      email: 'test@example.com'
    }
  },
  artifact: {
    messages: [
      {
        role: 'user',
        content: 'Hi, my name is John Smith and I want to start an LLC for my consulting business. I do technology consulting and want to form the business in Delaware. My email is john.smith@techconsulting.com.'
      },
      {
        role: 'assistant',
        content: 'Great to meet you John! I can help you form an LLC for your technology consulting business. Delaware is an excellent choice for LLC formation due to its strong legal protections and privacy benefits. Let me gather some more information about your business.'
      },
      {
        role: 'user',
        content: 'I want to call it Smith Tech Consulting LLC. I need this done as soon as possible because I have clients waiting. My budget is around $1000 for the formation.'
      },
      {
        role: 'assistant',
        content: 'Perfect! Smith Tech Consulting LLC sounds great. I understand the urgency and your budget of $1000. Delaware LLC formation typically costs between $800-1200, so we\'re in the right range. Let me help you get this set up quickly.'
      }
    ]
  }
};

async function testTranscriptProcessing() {
  console.log('🧪 Testing Enhanced Transcript Processing...\n');
  
  try {
    console.log('📤 Sending test webhook to /api/webhook...');
    console.log('📊 Test data:', JSON.stringify(testWebhookData, null, 2));
    
    const response = await axios.post('http://localhost:3000/api/webhook', testWebhookData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('\n✅ Webhook processed successfully!');
    console.log('📋 Response:', JSON.stringify(response.data, null, 2));
    
    // Test RAG system with the processed data
    console.log('\n🔍 Testing RAG system with processed transcript...');
    
    const ragResponse = await axios.post('http://localhost:3000/api/vapi-rag', {
      message: 'What did we discuss about my business formation?',
      userId: 'test-user',
      callStage: 1,
      includeTranscripts: true,
      includeKnowledge: true,
      includeDreamDNA: true
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('\n🧠 RAG Response:', JSON.stringify(ragResponse.data, null, 2));
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testTranscriptProcessing();
