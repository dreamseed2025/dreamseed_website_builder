import axios from 'axios';

// VAPI Configuration
const VAPI_PRIVATE_KEY = '3359a2eb-02e4-4f31-a5aa-37c2a020a395';
const NEW_WEBHOOK_URL = 'https://0d884bddc56b.ngrok-free.app/api/webhook';

// Current active assistant from API response
const ASSISTANT_IDS = [
    'af397e88-c286-416f-9f74-e7665401bdb7'  // DreamSeed Call 1 - Foundation
];

async function updateVAPIWebhooks() {
    console.log('🔧 Updating VAPI webhook URLs...');
    console.log(`📍 New webhook URL: ${NEW_WEBHOOK_URL}`);
    
    const headers = {
        'Authorization': `Bearer ${VAPI_PRIVATE_KEY}`,
        'Content-Type': 'application/json'
    };
    
    let successCount = 0;
    
    for (let i = 0; i < ASSISTANT_IDS.length; i++) {
        const assistantId = ASSISTANT_IDS[i];
        const callStage = i + 1;
        
        try {
            console.log(`\n📞 Updating Call ${callStage} Assistant (${assistantId})...`);
            
            // First, get the current assistant configuration
            const getResponse = await axios.get(
                `https://api.vapi.ai/assistant/${assistantId}`,
                { headers }
            );
            
            const currentConfig = getResponse.data;
            console.log(`✅ Retrieved current config for Call ${callStage}`);
            
            // Update only the webhook configuration
            const webhookUpdate = {
                server: {
                    url: NEW_WEBHOOK_URL,
                    timeoutSeconds: 30
                }
            };
            
            // Update the assistant
            const updateResponse = await axios.patch(
                `https://api.vapi.ai/assistant/${assistantId}`,
                webhookUpdate,
                { headers }
            );
            
            console.log(`✅ Updated Call ${callStage} webhook successfully!`);
            successCount++;
            
        } catch (error) {
            console.log(`❌ Failed to update Call ${callStage}:`, error.response?.data || error.message);
        }
    }
    
    console.log(`\n🎉 Webhook update complete!`);
    console.log(`✅ Successfully updated: ${successCount}/${ASSISTANT_IDS.length} assistants`);
    console.log(`\n📱 Your next call will now be processed by our truth table system!`);
}

// Run the update
updateVAPIWebhooks().catch(console.error);