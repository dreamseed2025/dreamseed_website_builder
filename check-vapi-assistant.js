#!/usr/bin/env node

const VAPI_PRIVATE_KEY = '3359a2eb-02e4-4f31-a5aa-37c2a020a395';
const ASSISTANT_ID = '5ef9abf6-66b4-4457-9848-ee5436d6191f'; // First assistant

async function getAssistant() {
  try {
    console.log('🔍 Fetching current assistant configuration...');
    
    const response = await fetch(`https://api.vapi.ai/assistant/${ASSISTANT_ID}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${VAPI_PRIVATE_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }

    const assistant = await response.json();
    console.log('📋 Current Assistant Configuration:');
    console.log(JSON.stringify(assistant, null, 2));
    
    return assistant;
    
  } catch (error) {
    console.error('❌ Failed to fetch assistant:', error.message);
    throw error;
  }
}

getAssistant().catch(console.error);