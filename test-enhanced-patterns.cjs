#!/usr/bin/env node

// Test the improved enhanced processor patterns
const enhancedProcessor = require('./simple-vapi-webhook/enhanced-processor.js');

const testCases = [
  {
    name: "Bill Clinton Test",
    transcript: `Hello. My name is Bill Clinton. My email address is bill at clinton dot org.
I want to start a political advising business. LLC in California.
Looking to get started immediately.`,
    expected: {
      customer_name: "Bill Clinton",
      customer_email: "bill@clinton.org",
      business_type: "political advising",
      state: "California",
      timeline: "Immediate"
    }
  },
  {
    name: "Katie Berry Test",
    transcript: `My name is Katie Berry. I'd like to start a business Katy Perry LLC, in California. 
My phone number is 6 1 9 6 5 4 4 3 2 1. My email address is katie at perry dot com.`,
    expected: {
      customer_name: "Katie Berry",
      customer_email: "katie@perry.com",
      customer_phone: "+16196544321",
      business_name: "Katy Perry LLC",
      state: "California"
    }
  },
  {
    name: "Standard Email Test",
    transcript: `Hi, I'm John Smith and my email is john@example.com. 
I want to form a tech consulting LLC in Texas. Phone: 512-555-1234.`,
    expected: {
      customer_name: "John Smith",
      customer_email: "john@example.com",
      customer_phone: "+15125551234",
      business_type: "tech consulting",
      state: "Texas"
    }
  }
];

console.log('🧪 Testing Enhanced Processor Patterns\n');
console.log('=' .repeat(50));

testCases.forEach(test => {
  console.log(`\n📋 ${test.name}:`);
  console.log('-'.repeat(40));
  
  const result = enhancedProcessor.processTranscriptComprehensively(test.transcript);
  
  // Check each expected field
  let passed = 0;
  let failed = 0;
  
  Object.keys(test.expected).forEach(key => {
    const fieldMap = {
      state: 'state_of_operation'
    };
    const actualKey = fieldMap[key] || key;
    
    if (result[actualKey] === test.expected[key]) {
      console.log(`✅ ${key}: ${result[actualKey]}`);
      passed++;
    } else {
      console.log(`❌ ${key}: Expected "${test.expected[key]}", Got "${result[actualKey] || 'null'}"`);
      failed++;
    }
  });
  
  console.log(`\n📊 Score: ${passed}/${passed + failed} fields correct`);
  console.log(`💯 Completeness: ${result.data_completeness_score}%`);
});

console.log('\n' + '='.repeat(50));
console.log('🎉 Pattern Testing Complete!');