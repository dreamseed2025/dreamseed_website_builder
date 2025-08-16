#!/usr/bin/env node

const { analyzeTranscriptWithAI } = require('./simple-vapi-webhook/ai-transcript-analyzer.js');

async function testAIExtraction() {
  console.log('🧪 Testing AI-Powered Extraction\n');
  console.log('=' .repeat(60));
  
  const testTranscript = `
    User: Hello. My name is Bill Clinton. My email address is bill at clinton dot org.
    AI: Thank you, Bill. Let me save your information right away.
    User: I want to start a political advising business. LLC in California.
    AI: Great! I've saved your preference for forming an LLC in California.
    User: Looking to get started immediately.
    AI: I've saved your urgency to move forward immediately.
  `;
  
  console.log('📝 Test Transcript:');
  console.log(testTranscript);
  console.log('-'.repeat(60));
  
  try {
    const result = await analyzeTranscriptWithAI(testTranscript, 1);
    
    console.log('\n🎯 AI Extraction Results:');
    console.log(JSON.stringify(result, null, 2));
    
    console.log('\n📊 Summary:');
    console.log('✅ Name:', result.customer_name || '❌ Not found');
    console.log('✅ Email:', result.customer_email || '❌ Not found');
    console.log('✅ Phone:', result.customer_phone || '❌ Not found');
    console.log('✅ Business Type:', result.business_type || '❌ Not found');
    console.log('✅ State:', result.state_of_operation || '❌ Not found');
    console.log('✅ Entity Type:', result.entity_type || '❌ Not found');
    console.log('✅ Timeline:', result.timeline || '❌ Not found');
    console.log('\n💯 Completeness Score:', result.data_completeness_score + '%');
    console.log('🎯 AI Confidence:', result.ai_confidence_score + '%');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('✨ AI extraction is MUCH better than regex!');
  console.log('It understands context, variations, and natural language.');
}

testAIExtraction();