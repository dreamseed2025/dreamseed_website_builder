import SmartPromptGenerator from './smart-prompt-generator.js';

const generator = new SmartPromptGenerator();

async function testPersonalization() {
  console.log('🧪 TESTING SMART PROMPT GENERATION');
  console.log('==================================');
  
  // Test with your customer who completed all 4 calls
  console.log('\n📞 Testing with completed customer (+17279006911):');
  const result1 = await generator.generateAndUpdatePrompt('+17279006911');
  
  console.log('\n📞 Testing with partial customer (+15559876543):');
  const result2 = await generator.generateAndUpdatePrompt('+15559876543');
  
  console.log('\n📞 Testing with new customer (+15551112222):');
  const result3 = await generator.generateAndUpdatePrompt('+15551112222');
  
  console.log('\n🎯 PERSONALIZATION RESULTS:');
  console.log('- Completed customer: Stage', result1.stage, result1.success ? '✅' : '❌');
  console.log('- Partial customer: Stage', result2.stage, result2.success ? '✅' : '❌');  
  console.log('- New customer: Stage', result3.stage, result3.success ? '✅' : '❌');
  
  console.log('\n📋 SAMPLE GENERATED PROMPTS:');
  if (result2.prompt) {
    console.log('\nPartial Customer Prompt Preview:');
    console.log(result2.prompt.substring(0, 300) + '...');
  }
}

testPersonalization().catch(console.error);