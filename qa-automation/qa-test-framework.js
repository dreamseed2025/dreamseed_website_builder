#!/usr/bin/env node

/**
 * 🤖 DreamSeed Automated QA Framework
 * 
 * Comprehensive end-to-end testing system that:
 * - Tests all pages and user flows
 * - Generates dynamic test data
 * - Automates user creation and AI interactions
 * - Provides detailed reporting
 */

const puppeteer = require('puppeteer')
const fs = require('fs').promises
const path = require('path')

class DreamSeedQAFramework {
  constructor() {
    this.browser = null
    this.page = null
    this.testResults = []
    this.baseURL = 'http://localhost:3000'
    this.testData = new TestDataGenerator()
    this.logger = new QALogger()
  }

  async initialize() {
    this.browser = await puppeteer.launch({
      headless: false, // Set to true for CI/CD
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    this.page = await this.browser.newPage()
    
    // Enable request interception for API testing
    await this.page.setRequestInterception(true)
    this.page.on('request', this.handleRequest.bind(this))
    
    await this.logger.initialize()
  }

  async runFullQASuite() {
    await this.logger.log('🚀 Starting DreamSeed QA Test Suite')
    
    try {
      // 1. Test Static Pages
      await this.testStaticPages()
      
      // 2. Test User Registration Flow
      await this.testUserRegistration()
      
      // 3. Test Business Assessment
      await this.testBusinessAssessment()
      
      // 4. Test Admin Dashboard
      await this.testAdminDashboard()
      
      // 5. Test Customer Portal
      await this.testCustomerPortal()
      
      // 6. Test AI Dream Coach Integration
      await this.testAIDreamCoach()
      
      // 7. Test Voice Assistant
      await this.testVoiceAssistant()
      
      // 8. Test API Endpoints
      await this.testAPIEndpoints()
      
      // 9. Generate Report
      await this.generateQAReport()
      
    } catch (error) {
      await this.logger.error('QA Suite Failed', error)
    }
  }

  async testStaticPages() {
    await this.logger.log('📄 Testing Static Pages')
    
    const pages = [
      '/',
      '/business-assessment',
      '/login',
      '/admin-login',
      '/optimized-voice-demo'
    ]

    for (const pagePath of pages) {
      const result = await this.testPage(pagePath)
      this.testResults.push(result)
    }
  }

  async testPage(path) {
    const testName = `Page: ${path}`
    await this.logger.log(`Testing ${testName}`)
    
    try {
      const response = await this.page.goto(`${this.baseURL}${path}`)
      
      const result = {
        test: testName,
        status: 'PASS',
        url: `${this.baseURL}${path}`,
        responseCode: response.status(),
        loadTime: Date.now(),
        checks: []
      }

      // Check response status
      if (response.status() !== 200) {
        result.status = 'FAIL'
        result.error = `HTTP ${response.status()}`
      }

      // Check for console errors
      const consoleErrors = await this.getConsoleErrors()
      if (consoleErrors.length > 0) {
        result.checks.push({ check: 'Console Errors', status: 'WARN', details: consoleErrors })
      }

      // Check page title
      const title = await this.page.title()
      result.checks.push({ check: 'Page Title', status: title ? 'PASS' : 'FAIL', details: title })

      // Check for critical elements
      const criticalElements = await this.checkCriticalElements(path)
      result.checks.push(...criticalElements)

      await this.logger.log(`✅ ${testName} - ${result.status}`)
      return result

    } catch (error) {
      await this.logger.error(`❌ ${testName} - FAIL`, error)
      return {
        test: testName,
        status: 'FAIL',
        error: error.message
      }
    }
  }

  async testUserRegistration() {
    await this.logger.log('👤 Testing User Registration Flow')
    
    const testUser = this.testData.generateUser()
    
    try {
      // Navigate to registration
      await this.page.goto(`${this.baseURL}/login`)
      
      // Fill registration form (assuming Supabase auth component)
      await this.page.waitForSelector('input[type="email"]')
      await this.page.type('input[type="email"]', testUser.email)
      await this.page.type('input[type="password"]', testUser.password)
      
      // Submit form
      await this.page.click('button[type="submit"]')
      
      // Wait for redirect
      await this.page.waitForNavigation()
      
      const currentUrl = this.page.url()
      const isSuccess = currentUrl.includes('/customer-portal') || currentUrl.includes('/admin-dashboard')
      
      this.testResults.push({
        test: 'User Registration',
        status: isSuccess ? 'PASS' : 'FAIL',
        details: { email: testUser.email, redirectUrl: currentUrl }
      })
      
    } catch (error) {
      this.testResults.push({
        test: 'User Registration',
        status: 'FAIL',
        error: error.message
      })
    }
  }

  async testBusinessAssessment() {
    await this.logger.log('📋 Testing Business Assessment Flow')
    
    const assessmentData = this.testData.generateBusinessAssessment()
    
    try {
      await this.page.goto(`${this.baseURL}/business-assessment`)
      
      // Step 1: Business Idea
      await this.page.waitForSelector('textarea[name="businessIdea"]')
      await this.page.type('textarea[name="businessIdea"]', assessmentData.businessIdea)
      await this.page.select('select[name="businessType"]', assessmentData.businessType)
      await this.page.click('button:contains("Next")')
      
      // Step 2: Contact Details
      await this.page.waitForSelector('input[name="fullName"]')
      await this.page.type('input[name="fullName"]', assessmentData.fullName)
      await this.page.type('input[name="email"]', assessmentData.email)
      await this.page.type('input[name="phone"]', assessmentData.phone)
      await this.page.click('button:contains("Next")')
      
      // Step 3: Timeline & Experience
      await this.page.select('select[name="timeline"]', assessmentData.timeline)
      await this.page.select('select[name="experience"]', assessmentData.experience)
      await this.page.click('button:contains("Next")')
      
      // Step 4: Goals
      await this.page.type('textarea[name="goals"]', assessmentData.goals)
      await this.page.click('button:contains("Complete Assessment")')
      
      // Verify completion
      await this.page.waitForNavigation()
      const isSuccess = this.page.url().includes('/login')
      
      this.testResults.push({
        test: 'Business Assessment',
        status: isSuccess ? 'PASS' : 'FAIL',
        details: assessmentData
      })
      
    } catch (error) {
      this.testResults.push({
        test: 'Business Assessment',
        status: 'FAIL',
        error: error.message
      })
    }
  }

  async testAIDreamCoach() {
    await this.logger.log('🤖 Testing AI Dream Coach Integration')
    
    try {
      // Navigate to customer portal (assuming user is logged in)
      await this.page.goto(`${this.baseURL}/customer-portal`)
      
      // Test voice widget initialization
      await this.page.waitForSelector('.optimized-voice-widget')
      
      // Click start conversation
      await this.page.click('button:contains("Start")')
      
      // Simulate voice interaction (mock)
      const testMessage = "I want to start a consulting business"
      
      // Inject test message directly into the widget
      await this.page.evaluate((message) => {
        window.testVoiceMessage = message
        // Trigger the voice widget's message handler
        const event = new CustomEvent('testMessage', { detail: message })
        document.dispatchEvent(event)
      }, testMessage)
      
      // Wait for AI response
      await this.page.waitForTimeout(3000)
      
      // Check for conversation history
      const conversationExists = await this.page.$('.conversation-history') !== null
      
      this.testResults.push({
        test: 'AI Dream Coach',
        status: conversationExists ? 'PASS' : 'FAIL',
        details: { testMessage }
      })
      
    } catch (error) {
      this.testResults.push({
        test: 'AI Dream Coach',
        status: 'FAIL',
        error: error.message
      })
    }
  }

  async testVoiceAssistant() {
    await this.logger.log('🎤 Testing Voice Assistant Features')
    
    try {
      await this.page.goto(`${this.baseURL}/optimized-voice-demo`)
      
      // Test widget loading
      await this.page.waitForSelector('.optimized-voice-widget')
      
      // Test start button
      const startButton = await this.page.$('button:contains("Start")')
      const isStartButtonVisible = startButton !== null
      
      // Test voice assistant configuration
      const assistantConfig = await this.page.evaluate(() => {
        const widget = document.querySelector('.optimized-voice-widget')
        return widget ? {
          hasWidget: true,
          hasStartButton: !!document.querySelector('button'),
          hasStatusDisplay: !!document.querySelector('[style*="status"]')
        } : { hasWidget: false }
      })
      
      this.testResults.push({
        test: 'Voice Assistant',
        status: assistantConfig.hasWidget ? 'PASS' : 'FAIL',
        details: assistantConfig
      })
      
    } catch (error) {
      this.testResults.push({
        test: 'Voice Assistant',
        status: 'FAIL',
        error: error.message
      })
    }
  }

  async testAPIEndpoints() {
    await this.logger.log('🔌 Testing API Endpoints')
    
    const endpoints = [
      { path: '/api/vapi-integration', method: 'POST' },
      { path: '/api/elevenlabs-speech', method: 'POST' },
      { path: '/api/check-domains', method: 'POST' }
    ]

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${this.baseURL}${endpoint.path}`, {
          method: endpoint.method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.testData.generateAPITestData(endpoint.path))
        })
        
        this.testResults.push({
          test: `API: ${endpoint.path}`,
          status: response.status < 500 ? 'PASS' : 'FAIL',
          details: { 
            status: response.status,
            method: endpoint.method
          }
        })
        
      } catch (error) {
        this.testResults.push({
          test: `API: ${endpoint.path}`,
          status: 'FAIL',
          error: error.message
        })
      }
    }
  }

  async generateQAReport() {
    await this.logger.log('📊 Generating QA Report')
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.testResults.length,
        passed: this.testResults.filter(r => r.status === 'PASS').length,
        failed: this.testResults.filter(r => r.status === 'FAIL').length,
        warnings: this.testResults.filter(r => r.status === 'WARN').length
      },
      results: this.testResults
    }

    // Save report
    await fs.writeFile(
      path.join(__dirname, `qa-report-${Date.now()}.json`),
      JSON.stringify(report, null, 2)
    )

    // Generate HTML report
    await this.generateHTMLReport(report)
    
    await this.logger.log(`✅ QA Report Generated - ${report.summary.passed}/${report.summary.total} tests passed`)
    
    return report
  }

  async generateHTMLReport(report) {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>DreamSeed QA Report</title>
    <style>
        body { font-family: system-ui, sans-serif; margin: 40px; }
        .summary { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .test-result { margin: 10px 0; padding: 15px; border-radius: 6px; }
        .pass { background: #d4edda; border-left: 4px solid #28a745; }
        .fail { background: #f8d7da; border-left: 4px solid #dc3545; }
        .warn { background: #fff3cd; border-left: 4px solid #ffc107; }
        .details { margin-top: 10px; font-size: 0.9em; color: #666; }
    </style>
</head>
<body>
    <h1>🤖 DreamSeed QA Test Report</h1>
    <div class="summary">
        <h2>📊 Summary</h2>
        <p><strong>Total Tests:</strong> ${report.summary.total}</p>
        <p><strong>Passed:</strong> ${report.summary.passed}</p>
        <p><strong>Failed:</strong> ${report.summary.failed}</p>
        <p><strong>Warnings:</strong> ${report.summary.warnings}</p>
        <p><strong>Success Rate:</strong> ${Math.round((report.summary.passed / report.summary.total) * 100)}%</p>
    </div>
    
    <h2>📋 Test Results</h2>
    ${report.results.map(result => `
        <div class="test-result ${result.status.toLowerCase()}">
            <strong>${result.test}</strong> - ${result.status}
            ${result.error ? `<div class="details">Error: ${result.error}</div>` : ''}
            ${result.details ? `<div class="details">Details: ${JSON.stringify(result.details, null, 2)}</div>` : ''}
        </div>
    `).join('')}
</body>
</html>
    `

    await fs.writeFile(
      path.join(__dirname, `qa-report-${Date.now()}.html`),
      html
    )
  }

  async handleRequest(request) {
    // Log API calls for testing
    if (request.url().includes('/api/')) {
      await this.logger.log(`API Call: ${request.method()} ${request.url()}`)
    }
    
    request.continue()
  }

  async getConsoleErrors() {
    return await this.page.evaluate(() => {
      return window.consoleErrors || []
    })
  }

  async checkCriticalElements(path) {
    const checks = []
    
    switch (path) {
      case '/':
        checks.push(await this.checkElement('h1', 'Main heading'))
        checks.push(await this.checkElement('nav', 'Navigation'))
        break
        
      case '/business-assessment':
        checks.push(await this.checkElement('form', 'Assessment form'))
        checks.push(await this.checkElement('button[type="submit"]', 'Submit button'))
        break
        
      case '/customer-portal':
        checks.push(await this.checkElement('.optimized-voice-widget', 'Voice widget'))
        break
    }
    
    return checks
  }

  async checkElement(selector, description) {
    const exists = await this.page.$(selector) !== null
    return {
      check: description,
      status: exists ? 'PASS' : 'FAIL',
      details: `Element: ${selector}`
    }
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close()
    }
  }
}

class TestDataGenerator {
  generateUser() {
    const timestamp = Date.now()
    return {
      email: `test-user-${timestamp}@dreamseed-qa.com`,
      password: 'TestPassword123!',
      fullName: 'QA Test User',
      role: 'customer'
    }
  }

  generateBusinessAssessment() {
    const businessTypes = ['LLC', 'Corporation', 'Partnership', 'Sole Proprietorship']
    const timelines = ['1-3 months', '3-6 months', '6-12 months', '1+ years']
    const experiences = ['First time', 'Some experience', 'Very experienced']
    
    return {
      businessIdea: 'AI-powered consulting services for small businesses looking to optimize their operations',
      businessType: businessTypes[Math.floor(Math.random() * businessTypes.length)],
      fullName: 'QA Test Business Owner',
      email: `business-${Date.now()}@dreamseed-qa.com`,
      phone: '+1-555-0123',
      timeline: timelines[Math.floor(Math.random() * timelines.length)],
      experience: experiences[Math.floor(Math.random() * experiences.length)],
      goals: 'Scale operations, increase revenue, improve customer satisfaction'
    }
  }

  generateAPITestData(endpoint) {
    switch (endpoint) {
      case '/api/vapi-integration':
        return {
          message: 'Hello, I need help with business formation',
          userId: 'qa-test-user',
          dreamId: 'qa-test-dream',
          businessName: 'QA Test Business',
          businessType: 'LLC',
          callStage: 1,
          useVAPI: true,
          voiceId: 'harry'
        }
        
      case '/api/elevenlabs-speech':
        return {
          text: 'This is a test message for speech synthesis',
          voiceId: '21m00Tcm4TlvDq8ikWAM',
          modelId: 'eleven_monolingual_v1'
        }
        
      case '/api/check-domains':
        return {
          domains: ['qa-test-business.com', 'test-company.org']
        }
        
      default:
        return {}
    }
  }
}

class QALogger {
  constructor() {
    this.logs = []
  }

  async initialize() {
    this.startTime = Date.now()
    await this.log('🚀 QA Framework Initialized')
  }

  async log(message) {
    const timestamp = new Date().toISOString()
    const logEntry = `[${timestamp}] ${message}`
    
    this.logs.push(logEntry)
    console.log(logEntry)
  }

  async error(message, error) {
    const timestamp = new Date().toISOString()
    const logEntry = `[${timestamp}] ERROR: ${message} - ${error.message}`
    
    this.logs.push(logEntry)
    console.error(logEntry)
  }

  async saveLogs() {
    await fs.writeFile(
      path.join(__dirname, `qa-logs-${Date.now()}.log`),
      this.logs.join('\n')
    )
  }
}

// CLI Interface
async function main() {
  const qa = new DreamSeedQAFramework()
  
  try {
    await qa.initialize()
    await qa.runFullQASuite()
  } catch (error) {
    console.error('QA Framework Failed:', error)
    process.exit(1)
  } finally {
    await qa.cleanup()
  }
}

// Export for programmatic use
module.exports = { DreamSeedQAFramework, TestDataGenerator, QALogger }

// Run if called directly
if (require.main === module) {
  main()
}