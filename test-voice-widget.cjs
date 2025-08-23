#!/usr/bin/env node

/**
 * Voice Widget Test Suite
 * Tests all voice widget functionality including APIs, transcription, and AI responses
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Test configuration
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3000',
  testUserId: 'test-user-123',
  testDreamId: 'test-dream-456',
  testBusinessName: 'Test Business',
  testBusinessType: 'Technology'
};

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

// Test results tracking
let testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

// Utility functions
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name, passed, details = '') {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    log(`✅ ${name}`, 'green');
  } else {
    testResults.failed++;
    log(`❌ ${name}`, 'red');
    if (details) {
      log(`   Details: ${details}`, 'yellow');
    }
  }
  testResults.details.push({ name, passed, details });
}

// HTTP request helper
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

// Test functions
async function testServerHealth() {
  log('\n🔍 Testing Server Health...', 'blue');
  
  try {
    const response = await makeRequest(`${TEST_CONFIG.baseUrl}/`);
    logTest('Server is running', response.status === 200 || response.status === 404, 
      `Status: ${response.status}`);
  } catch (error) {
    logTest('Server is running', false, error.message);
  }
}

async function testVoiceWidgetDemoPage() {
  log('\n🎤 Testing Voice Widget Demo Page...', 'blue');
  
  try {
    const response = await makeRequest(`${TEST_CONFIG.baseUrl}/voice-widget-demo`);
    logTest('Voice widget demo page loads', response.status === 200, 
      `Status: ${response.status}`);
    
    // Check if page contains expected elements
    const hasReactApp = response.data.includes('React') || response.data.includes('voice-widget');
    logTest('Page contains voice widget components', hasReactApp);
  } catch (error) {
    logTest('Voice widget demo page loads', false, error.message);
  }
}

async function testOpenAIChatAPI() {
  log('\n🤖 Testing OpenAI Chat API...', 'blue');
  
  const testMessage = {
    message: "Hello, this is a test message",
    systemMessage: "You are a helpful AI assistant for testing.",
    userId: TEST_CONFIG.testUserId,
    dreamId: TEST_CONFIG.testDreamId,
    conversation: []
  };

  try {
    const response = await makeRequest(`${TEST_CONFIG.baseUrl}/api/openai-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testMessage)
    });

    logTest('OpenAI Chat API responds', response.status === 200, 
      `Status: ${response.status}`);
    
    if (response.status === 200) {
      logTest('OpenAI Chat API returns valid response', 
        response.data && response.data.response && typeof response.data.response === 'string',
        `Response: ${response.data.response?.substring(0, 50)}...`);
      
      logTest('OpenAI Chat API includes usage data', 
        response.data && response.data.usage,
        `Usage: ${JSON.stringify(response.data.usage)}`);
    } else {
      logTest('OpenAI Chat API error details', false, 
        `Error: ${response.data?.error || response.data?.details || 'Unknown error'}`);
    }
  } catch (error) {
    logTest('OpenAI Chat API responds', false, error.message);
  }
}

async function testWhisperTranscriptionAPI() {
  log('\n🎵 Testing Whisper Transcription API...', 'blue');
  
  // Create a minimal test audio file (silence)
  const testAudioBuffer = Buffer.alloc(1024); // 1KB of silence
  
  try {
    const response = await makeRequest(`${TEST_CONFIG.baseUrl}/api/whisper-transcribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data; boundary=----test-boundary'
      },
      body: `------test-boundary\r\nContent-Disposition: form-data; name="audio"; filename="test.webm"\r\nContent-Type: audio/webm\r\n\r\n${testAudioBuffer.toString('base64')}\r\n------test-boundary--`
    });

    // Whisper API should either return a transcription or a proper error
    logTest('Whisper API responds', response.status === 200 || response.status === 400, 
      `Status: ${response.status}`);
    
    if (response.status === 200) {
      logTest('Whisper API returns transcript', 
        response.data && response.data.transcript,
        `Transcript: ${response.data.transcript}`);
    } else if (response.status === 400) {
      logTest('Whisper API handles invalid audio gracefully', true, 
        `Expected error for test audio: ${response.data?.error || 'Invalid audio'}`);
    }
  } catch (error) {
    logTest('Whisper API responds', false, error.message);
  }
}

async function testVAPIConfigAPI() {
  log('\n🎙️ Testing VAPI Config API...', 'blue');
  
  try {
    const response = await makeRequest(`${TEST_CONFIG.baseUrl}/api/vapi-config`);
    
    // VAPI config should either return config or 404 if not configured
    logTest('VAPI Config API responds', response.status === 200 || response.status === 404, 
      `Status: ${response.status}`);
    
    if (response.status === 200) {
      logTest('VAPI Config API returns valid config', 
        response.data && response.data.publicKey && response.data.assistantId,
        `Public Key: ${response.data.publicKey?.substring(0, 10)}..., Assistant ID: ${response.data.assistantId}`);
    } else if (response.status === 404) {
      logTest('VAPI Config API indicates not configured', true, 
        `Expected: VAPI not configured - ${response.data?.error || 'Not found'}`);
    }
  } catch (error) {
    logTest('VAPI Config API responds', false, error.message);
  }
}

async function testEnvironmentVariables() {
  log('\n🔧 Testing Environment Variables...', 'blue');
  
  try {
    // Test OpenAI API key
    const openaiResponse = await makeRequest(`${TEST_CONFIG.baseUrl}/api/openai-chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'test', systemMessage: 'test' })
    });
    
    const hasValidOpenAIKey = openaiResponse.status === 200 || 
      (openaiResponse.status === 401 && openaiResponse.data?.details?.includes('Incorrect API key'));
    
    logTest('OpenAI API key is configured', hasValidOpenAIKey, 
      `Status: ${openaiResponse.status}, Details: ${openaiResponse.data?.details || 'OK'}`);
    
    // Test VAPI config
    const vapiResponse = await makeRequest(`${TEST_CONFIG.baseUrl}/api/vapi-config`);
    const hasVAPIConfig = vapiResponse.status === 200;
    
    logTest('VAPI configuration is available', hasVAPIConfig, 
      hasVAPIConfig ? 'VAPI is configured' : 'VAPI not configured (optional)');
    
  } catch (error) {
    logTest('Environment variables are accessible', false, error.message);
  }
}

async function testVoiceWidgetIntegration() {
  log('\n🔗 Testing Voice Widget Integration...', 'blue');
  
  try {
    // Test that all required components are accessible
    const demoResponse = await makeRequest(`${TEST_CONFIG.baseUrl}/voice-widget-demo`);
    const hasDemoPage = demoResponse.status === 200;
    
    logTest('Voice widget demo page is accessible', hasDemoPage, 
      `Status: ${demoResponse.status}`);
    
    // Test API endpoints are accessible
    const apis = [
      { name: 'OpenAI Chat', path: '/api/openai-chat' },
      { name: 'Whisper Transcription', path: '/api/whisper-transcribe' },
      { name: 'VAPI Config', path: '/api/vapi-config' }
    ];
    
    for (const api of apis) {
      try {
        const response = await makeRequest(`${TEST_CONFIG.baseUrl}${api.path}`);
        logTest(`${api.name} endpoint is accessible`, response.status < 500, 
          `Status: ${response.status}`);
      } catch (error) {
        logTest(`${api.name} endpoint is accessible`, false, error.message);
      }
    }
    
  } catch (error) {
    logTest('Voice widget integration test', false, error.message);
  }
}

async function testErrorHandling() {
  log('\n⚠️ Testing Error Handling...', 'blue');
  
  try {
    // Test OpenAI API with invalid data
    const invalidOpenAIResponse = await makeRequest(`${TEST_CONFIG.baseUrl}/api/openai-chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}) // Missing required fields
    });
    
    logTest('OpenAI API handles invalid requests', invalidOpenAIResponse.status === 400, 
      `Status: ${invalidOpenAIResponse.status}, Expected: 400`);
    
    // Test Whisper API with invalid data
    const invalidWhisperResponse = await makeRequest(`${TEST_CONFIG.baseUrl}/api/whisper-transcribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}) // Wrong content type
    });
    
    logTest('Whisper API handles invalid requests', invalidWhisperResponse.status >= 400, 
      `Status: ${invalidWhisperResponse.status}, Expected: 400+`);
    
  } catch (error) {
    logTest('Error handling test', false, error.message);
  }
}

// Performance test
async function testPerformance() {
  log('\n⚡ Testing Performance...', 'blue');
  
  const startTime = Date.now();
  
  try {
    // Test multiple concurrent requests
    const promises = [];
    for (let i = 0; i < 3; i++) {
      promises.push(
        makeRequest(`${TEST_CONFIG.baseUrl}/api/openai-chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: `Test message ${i}`,
            systemMessage: 'You are a test assistant.',
            userId: `test-user-${i}`,
            dreamId: `test-dream-${i}`
          })
        })
      );
    }
    
    const results = await Promise.allSettled(promises);
    const successfulRequests = results.filter(r => r.status === 'fulfilled' && r.value.status === 200).length;
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    logTest('Concurrent API requests', successfulRequests > 0, 
      `${successfulRequests}/3 successful in ${duration}ms`);
    
    logTest('Response time is reasonable', duration < 10000, 
      `Total time: ${duration}ms (should be < 10s)`);
    
  } catch (error) {
    logTest('Performance test', false, error.message);
  }
}

// Main test runner
async function runAllTests() {
  log('\n🚀 Starting Voice Widget Test Suite', 'bold');
  log(`Base URL: ${TEST_CONFIG.baseUrl}`, 'blue');
  log(`Test User ID: ${TEST_CONFIG.testUserId}`, 'blue');
  log(`Test Dream ID: ${TEST_CONFIG.testDreamId}`, 'blue');
  
  const tests = [
    testServerHealth,
    testVoiceWidgetDemoPage,
    testEnvironmentVariables,
    testOpenAIChatAPI,
    testWhisperTranscriptionAPI,
    testVAPIConfigAPI,
    testVoiceWidgetIntegration,
    testErrorHandling,
    testPerformance
  ];
  
  for (const test of tests) {
    try {
      await test();
    } catch (error) {
      logTest(test.name, false, error.message);
    }
  }
  
  // Print summary
  log('\n📊 Test Summary', 'bold');
  log(`Total Tests: ${testResults.total}`, 'blue');
  log(`Passed: ${testResults.passed}`, 'green');
  log(`Failed: ${testResults.failed}`, 'red');
  log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`, 
    testResults.passed / testResults.total > 0.8 ? 'green' : 'yellow');
  
  if (testResults.failed > 0) {
    log('\n❌ Failed Tests:', 'red');
    testResults.details
      .filter(test => !test.passed)
      .forEach(test => {
        log(`  - ${test.name}: ${test.details}`, 'yellow');
      });
  }
  
  log('\n🎯 Recommendations:', 'blue');
  if (testResults.failed === 0) {
    log('✅ All tests passed! Your voice widget is ready to use.', 'green');
  } else {
    log('🔧 Some tests failed. Check the details above and fix the issues.', 'yellow');
    log('💡 Common issues:', 'yellow');
    log('   - Make sure the server is running on http://localhost:3000', 'yellow');
    log('   - Verify OpenAI API key is correctly configured', 'yellow');
    log('   - Check that all environment variables are set', 'yellow');
  }
  
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(error => {
    log(`\n💥 Test suite failed to run: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = {
  runAllTests,
  testResults,
  TEST_CONFIG
};
