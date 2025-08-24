const axios = require('axios');

async function testTranscriptRetrieval() {
  console.log('🔍 Testing Transcript Retrieval...\n');
  
  try {
    // First, let's check what's in the database
    console.log('📊 Checking database for transcripts...');
    
    // Test the RAG system with a simple query
    const response = await axios.post('http://localhost:3000/api/vapi-rag', {
      message: 'What did we discuss?',
      userId: 'test-user-1755997569967', // Use the user ID from the previous test
      callStage: 1,
      includeTranscripts: true,
      includeKnowledge: true,
      includeDreamDNA: true
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log('✅ RAG Response:');
    console.log('📊 Context:', JSON.stringify(response.data.context, null, 2));
    console.log('💬 Response:', response.data.response.substring(0, 200) + '...');
    
    // Let's also test with a different user ID to see if that's the issue
    console.log('\n🔍 Testing with different user ID...');
    
    const response2 = await axios.post('http://localhost:3000/api/vapi-rag', {
      message: 'What did we discuss?',
      userId: 'test-user', // Try the original test user ID
      callStage: 1,
      includeTranscripts: true,
      includeKnowledge: true,
      includeDreamDNA: true
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log('✅ RAG Response 2:');
    console.log('📊 Context:', JSON.stringify(response2.data.context, null, 2));
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testTranscriptRetrieval();

