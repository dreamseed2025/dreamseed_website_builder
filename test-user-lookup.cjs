const axios = require('axios');

async function testUserLookup() {
  console.log('🔍 Testing User Lookup System...\n');
  
  try {
    // Test 1: Look up by phone number
    console.log('📱 Test 1: Looking up by phone number...');
    const phoneLookup = await axios.post('http://localhost:3000/api/user-lookup', {
      phone: '+15551234567'
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log('✅ Phone lookup result:', JSON.stringify(phoneLookup.data, null, 2));
    
    // Test 2: Look up by email
    console.log('\n📧 Test 2: Looking up by email...');
    const emailLookup = await axios.post('http://localhost:3000/api/user-lookup', {
      email: 'test@dreamseed.com'
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log('✅ Email lookup result:', JSON.stringify(emailLookup.data, null, 2));
    
    // Test 3: Create user if missing
    console.log('\n🆕 Test 3: Creating user if missing...');
    const createLookup = await axios.post('http://localhost:3000/api/user-lookup', {
      phone: '+15559876543',
      email: 'newuser@dreamseed.com',
      createIfMissing: true
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log('✅ Create lookup result:', JSON.stringify(createLookup.data, null, 2));
    
    // Test 4: Test RAG system with phone number
    console.log('\n🧠 Test 4: Testing RAG system with phone number...');
    const ragResponse = await axios.post('http://localhost:3000/api/vapi-rag', {
      message: 'What did we discuss about my business formation?',
      userId: '+15551234567', // Use phone number as userId
      callStage: 1,
      includeTranscripts: true,
      includeKnowledge: true,
      includeDreamDNA: true
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log('✅ RAG response with phone lookup:');
    console.log('📊 Context:', JSON.stringify(ragResponse.data.context, null, 2));
    console.log('💬 Response:', ragResponse.data.response.substring(0, 200) + '...');
    
    // Test 5: Test RAG system with email
    console.log('\n🧠 Test 5: Testing RAG system with email...');
    const ragResponse2 = await axios.post('http://localhost:3000/api/vapi-rag', {
      message: 'What did we discuss about my business formation?',
      userId: 'test@dreamseed.com', // Use email as userId
      callStage: 1,
      includeTranscripts: true,
      includeKnowledge: true,
      includeDreamDNA: true
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log('✅ RAG response with email lookup:');
    console.log('📊 Context:', JSON.stringify(ragResponse2.data.context, null, 2));
    console.log('💬 Response:', ragResponse2.data.response.substring(0, 200) + '...');
    
    console.log('\n🎉 User Lookup System Test: SUCCESS!');
    console.log('\n📈 What was tested:');
    console.log('- Phone number lookup');
    console.log('- Email lookup');
    console.log('- User creation if missing');
    console.log('- RAG system integration with phone lookup');
    console.log('- RAG system integration with email lookup');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testUserLookup();
