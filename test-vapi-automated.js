#!/usr/bin/env node

import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';

// Test configuration
const WEBHOOK_URL = 'http://localhost:3000';
const MCP_FUNCTION_URL = `${WEBHOOK_URL}/extract_and_save_business_data`;

const supabase = createClient(
  'https://kxldodhrhqbwyvgyuqfd.supabase.co',
  'sb_secret_GsVwx89kbQsB6LukLj7qdA_MUcB6-ZU'
);

// Test scenarios
const TEST_SCENARIOS = [
  {
    name: "Sarah Johnson - Coffee Shop",
    conversation_text: "Hi there! My name is Sarah Johnson, my email is sarah@quicktest.com, and my phone number is 555-987-6543. I want to start a coffee shop business called Quick Brew LLC in Texas. I'm passionate about serving premium coffee to busy professionals. The problem I see is that most coffee shops either have great coffee but slow service, or fast service but mediocre coffee. I want to solve both - premium quality with lightning-fast service. My target customers are working professionals who want high-quality coffee but don't have time to wait. I think I can make about $30,000 per month serving the downtown business district in Austin, Texas. I need about $150,000 to start - for equipment, lease deposits, and initial inventory. I choose the Launch Pro package.",
    call_stage: 1,
    customer_phone: "+15559876543",
    expected: {
      customer_name: "Sarah Johnson",
      customer_email: "sarah@quicktest.com", 
      business_name: "Quick Brew LLC",
      state_of_operation: "Texas"
    }
  },
  {
    name: "John Smith - Tech Startup",
    conversation_text: "Hello, I'm John Smith, email john@techstart.com, phone 555-123-4567. I want to create a tech startup called InnovateTech LLC in California. We're building AI-powered solutions for small businesses.",
    call_stage: 1,
    customer_phone: "+15551234567",
    expected: {
      customer_name: "John Smith",
      customer_email: "john@techstart.com",
      business_name: "InnovateTech LLC", 
      state_of_operation: "California"
    }
  },
  {
    name: "Maria Lopez - Restaurant",
    conversation_text: "Hi, my name is Maria Lopez, email maria@restaurant.com, phone 555-999-8888. I want to start a Mexican restaurant called Casa Maria LLC in Florida. I have 10 years of cooking experience.",
    call_stage: 1,
    customer_phone: "+15559998888",
    expected: {
      customer_name: "Maria Lopez", 
      customer_email: "maria@restaurant.com",
      business_name: "Casa Maria LLC",
      state_of_operation: "Florida"
    }
  }
];

// Test functions
async function testMCPFunction(scenario) {
  console.log(`\n🧪 Testing: ${scenario.name}`);
  console.log('═'.repeat(50));
  
  try {
    // Call MCP function
    const response = await fetch(MCP_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        conversation_text: scenario.conversation_text,
        call_stage: scenario.call_stage,
        customer_phone: scenario.customer_phone
      })
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.log('❌ MCP function failed:', result.error);
      return { success: false, error: result.error };
    }

    console.log('✅ MCP function success:', result.message);
    console.log('📄 Record ID:', result.record_id);
    
    // Wait a moment for data to propagate
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Verify data in Supabase
    const { data: record, error } = await supabase
      .from('business_formations')
      .select('*')
      .eq('id', result.record_id)
      .single();
    
    if (error) {
      console.log('❌ Failed to verify in Supabase:', error.message);
      return { success: false, error: error.message };
    }
    
    // Check extracted data matches expectations
    const checks = [];
    for (const [field, expected] of Object.entries(scenario.expected)) {
      const actual = record[field];
      const matches = actual === expected;
      checks.push({
        field,
        expected,
        actual,
        matches
      });
      
      if (matches) {
        console.log(`✅ ${field}: "${actual}"`);
      } else {
        console.log(`❌ ${field}: expected "${expected}", got "${actual}"`);
      }
    }
    
    const allMatched = checks.every(check => check.matches);
    
    return {
      success: allMatched,
      record_id: result.record_id,
      checks,
      record
    };
    
  } catch (error) {
    console.log('❌ Test error:', error.message);
    return { success: false, error: error.message };
  }
}

async function testWebhookEndpoint() {
  console.log('\n🔗 Testing webhook endpoint...');
  
  try {
    const testPayload = {
      type: 'function-call',
      call: {
        id: 'test-call-' + Date.now(),
        assistantId: '5ef9abf6-66b4-4457-9848-ee5436d6191f'
      }
    };
    
    const response = await fetch(`${WEBHOOK_URL}/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Webhook endpoint responding');
      return true;
    } else {
      console.log('❌ Webhook endpoint error:', result);
      return false;
    }
    
  } catch (error) {
    console.log('❌ Webhook test error:', error.message);
    return false;
  }
}

async function cleanupTestData(recordIds) {
  console.log('\n🧹 Cleaning up test data...');
  
  for (const recordId of recordIds) {
    try {
      const { error } = await supabase
        .from('business_formations')
        .delete()
        .eq('id', recordId);
      
      if (error) {
        console.log(`❌ Failed to delete ${recordId}:`, error.message);
      } else {
        console.log(`✅ Deleted test record ${recordId}`);
      }
    } catch (error) {
      console.log(`❌ Cleanup error for ${recordId}:`, error.message);
    }
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Vapi.ai Automated Tests');
  console.log('═'.repeat(60));
  
  // Test webhook endpoint first
  const webhookWorking = await testWebhookEndpoint();
  if (!webhookWorking) {
    console.log('\n❌ Webhook endpoint not responding. Make sure server is running.');
    process.exit(1);
  }
  
  // Run MCP function tests
  const results = [];
  const recordIds = [];
  
  for (const scenario of TEST_SCENARIOS) {
    const result = await testMCPFunction(scenario);
    results.push({ scenario: scenario.name, ...result });
    
    if (result.record_id) {
      recordIds.push(result.record_id);
    }
  }
  
  // Summary
  console.log('\n📊 Test Summary');
  console.log('═'.repeat(30));
  
  const passed = results.filter(r => r.success).length;
  const total = results.length;
  
  console.log(`✅ Passed: ${passed}/${total} tests`);
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.scenario}`);
    if (!result.success && result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  // Cleanup (comment out if you want to keep test data)
  if (recordIds.length > 0) {
    await cleanupTestData(recordIds);
  }
  
  console.log('\n🎯 Test Complete!');
  
  if (passed === total) {
    console.log('🎉 All tests passed! Your Vapi.ai integration is working perfectly.');
  } else {
    console.log('⚠️  Some tests failed. Check the details above.');
    process.exit(1);
  }
}

// Run tests
runTests().catch(console.error);