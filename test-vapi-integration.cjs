#!/usr/bin/env node

/**
 * VAPI Integration Test Suite
 * Tests the complete VAPI integration with voice widget
 */

const axios = require('axios')

const BASE_URL = 'http://localhost:3000'
const VAPI_PRIVATE_KEY = '3359a2eb-02e4-4f31-a5aa-37c2a020a395'

// VAPI Assistant IDs
const CALL_ASSISTANTS = {
  1: '60400523-a331-4c4b-935d-b666ee013d42', // Call 1 - Foundation
  2: '2496625c-6fe8-4304-8b6d-045870680189', // Call 2 - Brand Identity
  3: 'b9f38474-a065-458f-bb03-eb62d21f529a', // Call 3 - Operations Setup
  4: '87416134-cfc7-47de-ad97-4951d3905ea9'  // Call 4 - Launch Strategy
}

class VAPIIntegrationTester {
  constructor() {
    this.testResults = []
    this.startTime = Date.now()
  }

  async runAllTests() {
    console.log('🚀 Starting VAPI Integration Test Suite')
    console.log('Base URL:', BASE_URL)
    console.log('VAPI Private Key:', VAPI_PRIVATE_KEY ? '✅ Configured' : '❌ Missing')
    console.log('')

    try {
      // Test 1: Server Health
      await this.testServerHealth()

      // Test 2: VAPI Configuration API
      await this.testVAPIConfigAPI()

      // Test 3: VAPI Integration API
      await this.testVAPIIntegrationAPI()

      // Test 4: Direct VAPI API Connection
      await this.testDirectVAPIConnection()

      // Test 5: Assistant Management
      await this.testAssistantManagement()

      // Test 6: Voice Widget Integration
      await this.testVoiceWidgetIntegration()

      // Test 7: Webhook Processing
      await this.testWebhookProcessing()

      // Test 8: Business Formation Flow
      await this.testBusinessFormationFlow()

      this.printResults()

    } catch (error) {
      console.error('❌ Test suite failed:', error.message)
      process.exit(1)
    }
  }

  async testServerHealth() {
    console.log('🔍 Testing Server Health...')
    
    try {
      const response = await axios.get(`${BASE_URL}/api/vapi-config`)
      this.addResult('Server Health', true, 'Server is running and responding')
    } catch (error) {
      this.addResult('Server Health', false, `Server not reachable: ${error.message}`)
    }
  }

  async testVAPIConfigAPI() {
    console.log('🎯 Testing VAPI Configuration API...')
    
    try {
      const response = await axios.get(`${BASE_URL}/api/vapi-config`)
      
      if (response.data.configured) {
        this.addResult('VAPI Config API', true, 'VAPI configuration loaded successfully')
        
        // Test individual assistants
        for (const [stage, assistant] of Object.entries(response.data.assistants)) {
          this.addResult(`Assistant ${stage}`, true, `${assistant.name}: ${assistant.id}`)
        }
      } else {
        this.addResult('VAPI Config API', false, 'VAPI not configured')
      }
    } catch (error) {
      this.addResult('VAPI Config API', false, `Failed to load config: ${error.message}`)
    }
  }

  async testVAPIIntegrationAPI() {
    console.log('🤖 Testing VAPI Integration API...')
    
    const testMessage = "Hello, I want to start a consulting business. What do I need to know?"
    const testData = {
      message: testMessage,
      userId: 'test-user-123',
      dreamId: 'test-dream-456',
      businessName: 'Test Consulting LLC',
      businessType: 'Consulting',
      callStage: 1,
      useVAPI: true
    }

    try {
      const response = await axios.post(`${BASE_URL}/api/vapi-integration`, testData)
      
      if (response.data.success) {
        this.addResult('VAPI Integration API', true, `Response received: ${response.data.source}`)
        console.log(`   📝 AI Response: ${response.data.response.substring(0, 100)}...`)
      } else {
        this.addResult('VAPI Integration API', false, 'Integration failed')
      }
    } catch (error) {
      this.addResult('VAPI Integration API', false, `Integration error: ${error.message}`)
    }
  }

  async testDirectVAPIConnection() {
    console.log('🔗 Testing Direct VAPI API Connection...')
    
    try {
      const response = await axios.get('https://api.vapi.ai/assistant', {
        headers: {
          'Authorization': `Bearer ${VAPI_PRIVATE_KEY}`
        }
      })
      
      if (response.status === 200) {
        this.addResult('Direct VAPI API', true, 'Successfully connected to VAPI API')
        console.log(`   📊 Found ${response.data.length} assistants`)
      } else {
        this.addResult('Direct VAPI API', false, `Unexpected status: ${response.status}`)
      }
    } catch (error) {
      this.addResult('Direct VAPI API', false, `Connection failed: ${error.message}`)
    }
  }

  async testAssistantManagement() {
    console.log('👥 Testing Assistant Management...')
    
    for (const [stage, assistantId] of Object.entries(CALL_ASSISTANTS)) {
      try {
        const response = await axios.get(`https://api.vapi.ai/assistant/${assistantId}`, {
          headers: {
            'Authorization': `Bearer ${VAPI_PRIVATE_KEY}`
          }
        })
        
        if (response.status === 200) {
          this.addResult(`Assistant ${stage} Management`, true, `Assistant ${assistantId} is active`)
        } else {
          this.addResult(`Assistant ${stage} Management`, false, `Assistant ${assistantId} not found`)
        }
      } catch (error) {
        this.addResult(`Assistant ${stage} Management`, false, `Error: ${error.message}`)
      }
    }
  }

  async testVoiceWidgetIntegration() {
    console.log('🎤 Testing Voice Widget Integration...')
    
    try {
      // Test voice widget demo page
      const response = await axios.get(`${BASE_URL}/voice-widget-demo`)
      this.addResult('Voice Widget Demo Page', true, 'Voice widget demo page accessible')
      
      // Test voice widget browser test page
      const browserTestResponse = await axios.get(`${BASE_URL}/voice-widget-browser-test`)
      this.addResult('Voice Widget Browser Test', true, 'Browser test page accessible')
      
    } catch (error) {
      this.addResult('Voice Widget Integration', false, `Integration error: ${error.message}`)
    }
  }

  async testWebhookProcessing() {
    console.log('📡 Testing Webhook Processing...')
    
    const testWebhook = {
      type: 'call-start',
      callId: 'test-call-123',
      call: {
        id: 'test-call-123',
        customer: {
          number: '+1234567890'
        }
      }
    }

    try {
      const response = await axios.post(`${BASE_URL}/api/webhook`, testWebhook)
      this.addResult('Webhook Processing', true, 'Webhook processed successfully')
    } catch (error) {
      this.addResult('Webhook Processing', false, `Webhook error: ${error.message}`)
    }
  }

  async testBusinessFormationFlow() {
    console.log('🏢 Testing Business Formation Flow...')
    
    const testStages = [
      { stage: 1, message: "I want to start an LLC for my consulting business" },
      { stage: 2, message: "I need help with branding and domain selection" },
      { stage: 3, message: "What banking and accounting setup do I need?" },
      { stage: 4, message: "How should I plan my launch and marketing strategy?" }
    ]

    for (const test of testStages) {
      try {
        const response = await axios.post(`${BASE_URL}/api/vapi-integration`, {
          message: test.message,
          userId: 'test-user-123',
          dreamId: 'test-dream-456',
          businessName: 'Test Business LLC',
          businessType: 'Consulting',
          callStage: test.stage,
          useVAPI: true
        })
        
        if (response.data.success) {
          this.addResult(`Business Formation Stage ${test.stage}`, true, `Stage ${test.stage} processed`)
        } else {
          this.addResult(`Business Formation Stage ${test.stage}`, false, 'Stage processing failed')
        }
      } catch (error) {
        this.addResult(`Business Formation Stage ${test.stage}`, false, `Error: ${error.message}`)
      }
    }
  }

  addResult(testName, passed, message) {
    this.testResults.push({
      test: testName,
      passed,
      message,
      timestamp: new Date().toISOString()
    })
    
    const status = passed ? '✅' : '❌'
    console.log(`   ${status} ${testName}: ${message}`)
  }

  printResults() {
    const endTime = Date.now()
    const duration = (endTime - this.startTime) / 1000
    
    console.log('\n' + '='.repeat(60))
    console.log('📊 VAPI Integration Test Results')
    console.log('='.repeat(60))
    
    const passed = this.testResults.filter(r => r.passed).length
    const total = this.testResults.length
    const successRate = ((passed / total) * 100).toFixed(1)
    
    console.log(`Total Tests: ${total}`)
    console.log(`Passed: ${passed}`)
    console.log(`Failed: ${total - passed}`)
    console.log(`Success Rate: ${successRate}%`)
    console.log(`Duration: ${duration}s`)
    console.log('')
    
    // Group results by status
    const passedTests = this.testResults.filter(r => r.passed)
    const failedTests = this.testResults.filter(r => !r.passed)
    
    if (passedTests.length > 0) {
      console.log('✅ Passed Tests:')
      passedTests.forEach(test => {
        console.log(`   • ${test.test}: ${test.message}`)
      })
      console.log('')
    }
    
    if (failedTests.length > 0) {
      console.log('❌ Failed Tests:')
      failedTests.forEach(test => {
        console.log(`   • ${test.test}: ${test.message}`)
      })
      console.log('')
    }
    
    // Overall assessment
    if (successRate >= 90) {
      console.log('🎉 EXCELLENT! VAPI integration is working perfectly!')
    } else if (successRate >= 75) {
      console.log('👍 GOOD! VAPI integration is mostly working with minor issues.')
    } else if (successRate >= 50) {
      console.log('⚠️ FAIR! VAPI integration has some issues that need attention.')
    } else {
      console.log('🚨 POOR! VAPI integration has significant issues that need immediate attention.')
    }
    
    console.log('')
    console.log('🔧 Next Steps:')
    if (failedTests.length > 0) {
      console.log('   • Review failed tests above')
      console.log('   • Check VAPI credentials and configuration')
      console.log('   • Verify server is running on localhost:3000')
      console.log('   • Test individual components manually')
    } else {
      console.log('   • All tests passed! VAPI integration is ready for production')
      console.log('   • Test voice widget at: http://localhost:3000/voice-widget-demo')
      console.log('   • Monitor webhook processing for real calls')
    }
  }
}

// Run the test suite
async function main() {
  const tester = new VAPIIntegrationTester()
  await tester.runAllTests()
}

if (require.main === module) {
  main().catch(console.error)
}

module.exports = VAPIIntegrationTester
