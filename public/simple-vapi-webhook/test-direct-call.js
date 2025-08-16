// Direct VAPI call test to isolate the issue
require('dotenv').config();

async function testDirectVAPICall() {
    const agentId = process.env.VAPI_AGENT_ID;
    const apiKey = process.env.VAPI_API_KEY;
    
    console.log('🧪 Testing direct VAPI call...');
    console.log('Agent ID:', agentId);
    console.log('API Key:', apiKey.substring(0, 8) + '...');
    
    // First, get current agent configuration
    console.log('\n📋 Getting current agent configuration...');
    let response = await fetch(`https://api.vapi.ai/assistant/${agentId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        }
    });
    
    const agentConfig = await response.json();
    console.log('Agent serverMessages:', agentConfig.serverMessages);
    console.log('Agent serverUrl:', agentConfig.serverUrl);
    
    // Try a call payload with just customer (outbound call)
    const callPayload = {
        assistantId: agentId,
        customer: {
            number: '+17279006911'
        },
        phoneNumberId: null // Let VAPI use default phone number
    };
    
    console.log('\n📞 Testing call with minimal payload...');
    console.log('Call payload:', JSON.stringify(callPayload, null, 2));
    
    response = await fetch('https://api.vapi.ai/call', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(callPayload)
    });
    
    const result = await response.json();
    
    if (response.ok) {
        console.log('✅ Call successful!');
        console.log('Call ID:', result.id);
        console.log('Call status:', result.status);
    } else {
        console.log('❌ Call failed:');
        console.log('Status:', response.status);
        console.log('Error:', JSON.stringify(result, null, 2));
    }
}

testDirectVAPICall().catch(console.error);