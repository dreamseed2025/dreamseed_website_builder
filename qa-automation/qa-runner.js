#!/usr/bin/env node

/**
 * 🚀 QA Test Runner
 * 
 * Main orchestration script that runs the complete QA suite
 * with comprehensive reporting and logging
 */

const puppeteer = require('puppeteer')
const fs = require('fs').promises
const path = require('path')
const { DreamSeedQAFramework } = require('./qa-test-framework')
const { UserFlowAutomation, AdminFlowAutomation } = require('./user-flow-automation')
const { QADataGenerator } = require('./qa-data-generator')

class QATestRunner {
  constructor(options = {}) {
    this.options = {
      headless: options.headless || false,
      baseURL: options.baseURL || 'http://localhost:3000',
      testSuite: options.testSuite || 'full', // smoke, regression, full
      parallel: options.parallel || false,
      outputDir: options.outputDir || './qa-reports',
      ...options
    }
    
    this.browser = null
    this.results = {
      summary: {},
      static: [],
      userFlows: [],
      apis: [],
      performance: [],
      errors: []
    }
    
    this.startTime = Date.now()
  }

  /**
   * Main execution entry point
   */
  async run() {
    try {
      console.log('🚀 Starting DreamSeed QA Test Suite')
      console.log(`📅 ${new Date().toISOString()}`)
      console.log(`🔧 Suite: ${this.options.testSuite}`)
      console.log(`🌐 Base URL: ${this.options.baseURL}`)
      
      await this.initialize()
      await this.executeTestSuite()
      await this.generateReports()
      
      const duration = Math.round((Date.now() - this.startTime) / 1000)
      console.log(`✅ QA Test Suite Complete (${duration}s)`)
      
      return this.results
      
    } catch (error) {
      console.error('❌ QA Test Suite Failed:', error)
      this.results.errors.push({
        type: 'SUITE_FAILURE',
        message: error.message,
        timestamp: new Date().toISOString()
      })
      throw error
      
    } finally {
      await this.cleanup()
    }
  }

  async initialize() {
    // Create output directory
    await fs.mkdir(this.options.outputDir, { recursive: true })
    
    // Initialize browser
    this.browser = await puppeteer.launch({
      headless: this.options.headless,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
    })
    
    console.log('✅ QA Framework Initialized')
  }

  async executeTestSuite() {
    const suiteConfig = this.getSuiteConfiguration()
    
    console.log(`📋 Executing ${suiteConfig.name}`)
    console.log(`📊 ${suiteConfig.tests.length} test categories`)
    
    for (const testConfig of suiteConfig.tests) {
      try {
        await this.executeTestCategory(testConfig)
      } catch (error) {
        console.error(`❌ Test category failed: ${testConfig.type}`, error)
        this.results.errors.push({
          type: 'CATEGORY_FAILURE',
          category: testConfig.type,
          message: error.message,
          timestamp: new Date().toISOString()
        })
      }
    }
  }

  async executeTestCategory(testConfig) {
    console.log(`\n🔄 Executing: ${testConfig.type}`)
    
    switch (testConfig.type) {
      case 'static-pages':
        await this.runStaticPageTests()
        break
        
      case 'user-flows':
        await this.runUserFlowTests(testConfig.scenarios || ['first-time-entrepreneur'])
        break
        
      case 'admin-flows':
        await this.runAdminFlowTests()
        break
        
      case 'api-tests':
        await this.runAPITests(testConfig.endpoints || 'all')
        break
        
      case 'performance':
        await this.runPerformanceTests()
        break
        
      case 'voice-assistant':
        await this.runVoiceAssistantTests()
        break
        
      default:
        console.log(`⚠️  Unknown test type: ${testConfig.type}`)
    }
  }

  async runStaticPageTests() {
    const page = await this.browser.newPage()
    const framework = new DreamSeedQAFramework()
    framework.browser = this.browser
    framework.page = page
    
    try {
      await framework.testStaticPages()
      this.results.static = framework.testResults
      
      console.log(`✅ Static Pages: ${framework.testResults.length} tests`)
      
    } finally {
      await page.close()
    }
  }

  async runUserFlowTests(scenarios) {
    console.log(`👤 Testing user flows: ${scenarios.join(', ')}`)
    
    for (const scenario of scenarios) {
      const page = await this.browser.newPage()
      const logger = new ConsoleLogger(`UserFlow-${scenario}`)
      const automation = new UserFlowAutomation(page, logger)
      
      try {
        const result = await automation.executeUserJourney(scenario)
        this.results.userFlows.push(result)
        
        console.log(`✅ User Flow [${scenario}]: ${result.success ? 'PASS' : 'FAIL'}`)
        
      } finally {
        await page.close()
      }
    }
  }

  async runAdminFlowTests() {
    console.log('🔐 Testing admin flows')
    
    const page = await this.browser.newPage()
    const logger = new ConsoleLogger('AdminFlow')
    const adminAutomation = new AdminFlowAutomation(page, logger)
    
    try {
      const result = await adminAutomation.executeAdminJourney()
      this.results.userFlows.push(result)
      
      console.log(`✅ Admin Flow: ${result.success ? 'PASS' : 'FAIL'}`)
      
    } finally {
      await page.close()
    }
  }

  async runAPITests(endpoints) {
    console.log('🔌 Testing API endpoints')
    
    const testData = new QADataGenerator()
    const apiTests = [
      { endpoint: '/api/vapi-integration', scenarios: ['success', 'error'] },
      { endpoint: '/api/elevenlabs-speech', scenarios: ['success', 'error'] },
      { endpoint: '/api/check-domains', scenarios: ['success', 'error'] }
    ]

    for (const test of apiTests) {
      for (const scenario of test.scenarios) {
        try {
          const data = testData.generateAPITestData(test.endpoint, scenario)
          const result = await this.testAPIEndpoint(test.endpoint, data, scenario)
          
          this.results.apis.push(result)
          
        } catch (error) {
          this.results.apis.push({
            endpoint: test.endpoint,
            scenario,
            status: 'FAIL',
            error: error.message
          })
        }
      }
    }
    
    console.log(`✅ API Tests: ${this.results.apis.length} endpoints`)
  }

  async testAPIEndpoint(endpoint, data, scenario) {
    const startTime = Date.now()
    
    try {
      const response = await fetch(`${this.options.baseURL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      const responseTime = Date.now() - startTime
      const responseData = await response.text()
      
      return {
        endpoint,
        scenario,
        status: response.status < 500 ? 'PASS' : 'FAIL',
        httpStatus: response.status,
        responseTime,
        dataSize: responseData.length
      }
      
    } catch (error) {
      return {
        endpoint,
        scenario,
        status: 'FAIL',
        error: error.message,
        responseTime: Date.now() - startTime
      }
    }
  }

  async runPerformanceTests() {
    console.log('⚡ Testing performance metrics')
    
    const pages = ['/', '/business-assessment', '/customer-portal', '/optimized-voice-demo']
    
    for (const pagePath of pages) {
      const metrics = await this.measurePagePerformance(pagePath)
      this.results.performance.push(metrics)
    }
    
    console.log(`✅ Performance: ${this.results.performance.length} pages`)
  }

  async measurePagePerformance(pagePath) {
    const page = await this.browser.newPage()
    
    try {
      const startTime = Date.now()
      
      // Enable performance monitoring
      await page.tracing.start({ screenshots: true, path: null })
      
      const response = await page.goto(`${this.options.baseURL}${pagePath}`)
      await page.waitForLoadState('networkidle')
      
      const loadTime = Date.now() - startTime
      
      // Get performance metrics
      const metrics = await page.evaluate(() => ({
        timing: performance.timing,
        navigation: performance.navigation,
        memory: performance.memory
      }))
      
      const trace = await page.tracing.stop()
      
      return {
        page: pagePath,
        loadTime,
        httpStatus: response.status(),
        metrics,
        traceSize: trace ? trace.length : 0
      }
      
    } finally {
      await page.close()
    }
  }

  async runVoiceAssistantTests() {
    console.log('🎤 Testing voice assistant functionality')
    
    const page = await this.browser.newPage()
    
    try {
      await page.goto(`${this.options.baseURL}/optimized-voice-demo`)
      
      // Test widget loading
      const widgetLoaded = await page.waitForSelector('.optimized-voice-widget', { timeout: 5000 })
        .then(() => true)
        .catch(() => false)
      
      // Test button presence
      const hasStartButton = await page.locator('button:has-text("Start")').isVisible()
      
      this.results.performance.push({
        test: 'Voice Assistant Widget',
        widgetLoaded,
        hasStartButton,
        status: widgetLoaded && hasStartButton ? 'PASS' : 'FAIL'
      })
      
      console.log(`✅ Voice Assistant: ${widgetLoaded && hasStartButton ? 'PASS' : 'FAIL'}`)
      
    } finally {
      await page.close()
    }
  }

  async generateReports() {
    console.log('📊 Generating QA Reports')
    
    // Calculate summary
    this.results.summary = this.calculateSummary()
    
    // Generate JSON report
    const jsonReport = {
      timestamp: new Date().toISOString(),
      duration: Math.round((Date.now() - this.startTime) / 1000),
      configuration: this.options,
      results: this.results
    }
    
    await fs.writeFile(
      path.join(this.options.outputDir, `qa-report-${Date.now()}.json`),
      JSON.stringify(jsonReport, null, 2)
    )
    
    // Generate HTML report
    await this.generateHTMLReport(jsonReport)
    
    // Generate CSV summary
    await this.generateCSVReport(jsonReport)
    
    // Print summary to console
    this.printSummary()
  }

  calculateSummary() {
    const allResults = [
      ...this.results.static,
      ...this.results.userFlows,
      ...this.results.apis,
      ...this.results.performance
    ]
    
    const passed = allResults.filter(r => r.status === 'PASS' || r.success === true).length
    const failed = allResults.filter(r => r.status === 'FAIL' || r.success === false).length
    const warnings = allResults.filter(r => r.status === 'WARN').length
    
    return {
      total: allResults.length,
      passed,
      failed,
      warnings,
      successRate: Math.round((passed / allResults.length) * 100),
      categories: {
        staticPages: this.results.static.length,
        userFlows: this.results.userFlows.length,
        apis: this.results.apis.length,
        performance: this.results.performance.length
      }
    }
  }

  async generateHTMLReport(report) {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DreamSeed QA Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .summary-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; }
        .summary-card h3 { margin: 0 0 10px 0; color: #333; }
        .summary-card .number { font-size: 2em; font-weight: bold; margin: 10px 0; }
        .pass .number { color: #28a745; }
        .fail .number { color: #dc3545; }
        .warn .number { color: #ffc107; }
        .section { background: white; margin: 20px 0; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .test-result { margin: 10px 0; padding: 15px; border-radius: 6px; border-left: 4px solid #ddd; }
        .test-result.pass { border-left-color: #28a745; background: #d4edda; }
        .test-result.fail { border-left-color: #dc3545; background: #f8d7da; }
        .test-result.warn { border-left-color: #ffc107; background: #fff3cd; }
        .details { margin-top: 10px; font-size: 0.9em; color: #666; }
        .badge { padding: 4px 8px; border-radius: 4px; font-size: 0.8em; font-weight: bold; }
        .badge.pass { background: #28a745; color: white; }
        .badge.fail { background: #dc3545; color: white; }
        .badge.warn { background: #ffc107; color: black; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🤖 DreamSeed QA Test Report</h1>
            <p>Generated: ${report.timestamp}</p>
            <p>Duration: ${report.duration}s | Suite: ${report.configuration.testSuite}</p>
        </div>
        
        <div class="summary">
            <div class="summary-card pass">
                <h3>Passed</h3>
                <div class="number">${report.results.summary.passed}</div>
                <p>${report.results.summary.successRate}% Success Rate</p>
            </div>
            <div class="summary-card fail">
                <h3>Failed</h3>
                <div class="number">${report.results.summary.failed}</div>
            </div>
            <div class="summary-card warn">
                <h3>Warnings</h3>
                <div class="number">${report.results.summary.warnings}</div>
            </div>
            <div class="summary-card">
                <h3>Total Tests</h3>
                <div class="number">${report.results.summary.total}</div>
            </div>
        </div>
        
        ${this.generateHTMLSection('Static Pages', report.results.static)}
        ${this.generateHTMLSection('User Flows', report.results.userFlows)}
        ${this.generateHTMLSection('API Tests', report.results.apis)}
        ${this.generateHTMLSection('Performance', report.results.performance)}
        
        ${report.results.errors.length > 0 ? `
        <div class="section">
            <h2>❌ Errors</h2>
            ${report.results.errors.map(error => `
                <div class="test-result fail">
                    <strong>${error.type}</strong>
                    <div class="details">${error.message}</div>
                    <div class="details">${error.timestamp}</div>
                </div>
            `).join('')}
        </div>
        ` : ''}
    </div>
</body>
</html>
    `

    await fs.writeFile(
      path.join(this.options.outputDir, `qa-report-${Date.now()}.html`),
      html
    )
  }

  generateHTMLSection(title, results) {
    if (!results.length) return ''
    
    return `
    <div class="section">
        <h2>${title}</h2>
        ${results.map(result => {
          const status = result.status || (result.success ? 'pass' : 'fail')
          return `
            <div class="test-result ${status}">
                <strong>${result.test || result.scenario || result.endpoint || 'Test'}</strong>
                <span class="badge ${status}">${status.toUpperCase()}</span>
                ${result.details ? `<div class="details">${JSON.stringify(result.details, null, 2)}</div>` : ''}
                ${result.error ? `<div class="details">Error: ${result.error}</div>` : ''}
            </div>
          `
        }).join('')}
    </div>
    `
  }

  async generateCSVReport(report) {
    const csv = [
      'Category,Test,Status,Details,Timestamp',
      ...this.results.static.map(r => `Static,${r.test},${r.status},"${JSON.stringify(r.details)}",${report.timestamp}`),
      ...this.results.userFlows.map(r => `UserFlow,${r.scenario},${r.success ? 'PASS' : 'FAIL'},"${r.error || ''}",${report.timestamp}`),
      ...this.results.apis.map(r => `API,${r.endpoint},${r.status},"${r.error || ''}",${report.timestamp}`),
      ...this.results.performance.map(r => `Performance,${r.test || r.page},${r.status || 'PASS'},"${r.loadTime || ''}",${report.timestamp}`)
    ].join('\n')

    await fs.writeFile(
      path.join(this.options.outputDir, `qa-summary-${Date.now()}.csv`),
      csv
    )
  }

  printSummary() {
    console.log('\n📊 QA Test Summary')
    console.log('==================')
    console.log(`✅ Passed: ${this.results.summary.passed}`)
    console.log(`❌ Failed: ${this.results.summary.failed}`)
    console.log(`⚠️  Warnings: ${this.results.summary.warnings}`)
    console.log(`📊 Success Rate: ${this.results.summary.successRate}%`)
    console.log(`⏱️  Duration: ${Math.round((Date.now() - this.startTime) / 1000)}s`)
    
    if (this.results.errors.length > 0) {
      console.log(`\n❌ Errors: ${this.results.errors.length}`)
      this.results.errors.forEach(error => {
        console.log(`   - ${error.type}: ${error.message}`)
      })
    }
    
    console.log(`\n📁 Reports saved to: ${this.options.outputDir}`)
  }

  getSuiteConfiguration() {
    const suites = {
      smoke: {
        name: 'Smoke Test Suite',
        tests: [
          { type: 'static-pages' },
          { type: 'api-tests', endpoints: ['/api/vapi-integration'] }
        ]
      },
      
      regression: {
        name: 'Regression Test Suite',
        tests: [
          { type: 'static-pages' },
          { type: 'user-flows', scenarios: ['first-time-entrepreneur'] },
          { type: 'api-tests' },
          { type: 'voice-assistant' }
        ]
      },
      
      full: {
        name: 'Full QA Test Suite',
        tests: [
          { type: 'static-pages' },
          { type: 'user-flows', scenarios: ['first-time-entrepreneur', 'experienced-business-owner'] },
          { type: 'admin-flows' },
          { type: 'api-tests' },
          { type: 'performance' },
          { type: 'voice-assistant' }
        ]
      }
    }
    
    return suites[this.options.testSuite] || suites.full
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close()
    }
  }
}

/**
 * Simple console logger for automation classes
 */
class ConsoleLogger {
  constructor(prefix = '') {
    this.prefix = prefix
  }
  
  async log(message) {
    console.log(`${this.prefix ? `[${this.prefix}] ` : ''}${message}`)
  }
  
  async error(message, error) {
    console.error(`${this.prefix ? `[${this.prefix}] ` : ''}${message}`, error)
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2)
  const options = {}
  
  // Parse command line arguments
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace(/^--/, '')
    const value = args[i + 1]
    
    if (value !== undefined) {
      options[key] = value === 'true' ? true : value === 'false' ? false : value
    }
  }
  
  const runner = new QATestRunner(options)
  
  try {
    await runner.run()
    process.exit(0)
  } catch (error) {
    console.error('QA Runner failed:', error)
    process.exit(1)
  }
}

// Export for programmatic use
module.exports = { QATestRunner, ConsoleLogger }

// Run if called directly
if (require.main === module) {
  main()
}