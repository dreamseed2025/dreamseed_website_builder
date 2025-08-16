#!/usr/bin/env node

const { analyzeTranscriptWithAI, saveToSupabase } = require('./simple-vapi-webhook/ai-transcript-analyzer.js');

async function testDiploExtraction() {
  console.log('🧪 Testing Diplo AI Extraction\n');
  console.log('=' .repeat(60));
  
  const diploTranscript = `User: My name is Diplo, and I'd like to start a music music LLC. In California.
AI: Great, Diplo. Me save that information right away.
AI: I'm entering the following details. Name, Diplo. Business idea. Music focused. LLC. State, California. Me quickly save this. Calling the extract and save business data tool now. Give me a moment. Perfect, Diplo. I've saved your information successfully.
AI: Now could you share your our email and phone number so I can update your file and keep in touch?
User: 6 1 9 8 5 1 0 2 2. And diplo at m e dot com.
AI: Just a sec.
AI: Perfect. I've saved your phone number and email, Diplo.
AI: Let's dive deeper into, um, your music LLC idea. Are you planning for a record label, production company, uh, talent management, or something else?
User: Record label production company.
AI: Give me a moment.
AI: Great, Diplo.
AI: I've saved your idea for a record label, uh, production company. You're aiming for an LLC, in California, I can share the state specific requirements Want me to check that out?
User: That's okay.
AI: Alright. Thinking check name validation. Also, get initial cost estimates. Let me know to help further. Want timeline or
User: Okay. I'm good.
AI: alright then. Me a moment. Definitely looking forward. Schedule call 2. Follow-up call within 35 days. Validate.
User: Okay. Sounds good. Thank you. Goodbye.
AI: Thank you, Diplo. Looking forward to our next chat Goodbye, and thank you.`;
  
  console.log('📝 Diplo Transcript Length:', diploTranscript.length);
  console.log('-'.repeat(60));
  
  try {
    console.log('🤖 Running AI extraction on Diplo transcript...');
    const result = await analyzeTranscriptWithAI(diploTranscript, 1);
    
    console.log('\n🎯 AI Extraction Results:');
    console.log(JSON.stringify(result, null, 2));
    
    console.log('\n📊 Summary:');
    console.log('✅ Name:', result.customer_name || '❌ Not found');
    console.log('✅ Email:', result.customer_email || '❌ Not found');
    console.log('✅ Phone:', result.customer_phone || '❌ Not found');
    console.log('✅ Business Type:', result.business_type || '❌ Not found');
    console.log('✅ State:', result.state_of_operation || '❌ Not found');
    console.log('✅ Entity Type:', result.entity_type || '❌ Not found');
    console.log('✅ Services:', result.services || '❌ Not found');
    console.log('\n💯 Completeness Score:', result.data_completeness_score + '%');
    console.log('🎯 AI Confidence:', result.ai_confidence_score + '%');
    
    // Now try to save to Supabase
    console.log('\n💾 Attempting to save to Supabase...');
    const saved = await saveToSupabase(result);
    console.log('✅ Saved to Supabase successfully! ID:', saved.id);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
  }
  
  console.log('\n' + '=' .repeat(60));
}

testDiploExtraction();