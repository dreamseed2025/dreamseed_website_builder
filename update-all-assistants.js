import axios from 'axios';

const VAPI_PRIVATE_KEY = '3359a2eb-02e4-4f31-a5aa-37c2a020a395';
const NEW_WEBHOOK_URL = 'https://0d2cc330a98d.ngrok-free.app/api/webhook';

const ASSISTANT_IDS = [
  '60400523-a331-4c4b-935d-b666ee013d42', // Call 1 - Foundation
  '2496625c-6fe8-4304-8b6d-045870680189', // Call 2 - Brand Identity  
  'b9f38474-a065-458f-bb03-eb62d21f529a', // Call 3 - Operations Setup
  '87416134-cfc7-47de-ad97-4951d3905ea9'  // Call 4 - Launch Strategy
];

async function updateAllAssistants() {
  console.log('🔧 Updating all VAPI assistants...');
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
      
      const webhookUpdate = {
        server: {
          url: NEW_WEBHOOK_URL,
          timeoutSeconds: 30
        }
      };
      
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
}

updateAllAssistants().catch(console.error);