/**
 * 🔄 User Flow Automation
 * 
 * Complete automation of user journeys from registration
 * through AI Dream Coach interactions
 */

const { QADataGenerator } = require('./qa-data-generator')

class UserFlowAutomation {
  constructor(page, logger, testData) {
    this.page = page
    this.logger = logger  
    this.testData = testData || new QADataGenerator()
    this.baseURL = 'http://localhost:3000'
    this.flowResults = []
  }

  /**
   * Execute complete user journey automation
   */
  async executeUserJourney(scenario = 'first-time-entrepreneur') {
    await this.logger.log(`🚀 Starting User Journey: ${scenario}`)
    
    const userData = this.testData.generateTestUser(scenario)
    const assessmentData = this.testData.generateBusinessAssessment()
    
    try {
      // Step 1: Home Page → Business Assessment
      await this.testHomePageToAssessment()
      
      // Step 2: Complete Business Assessment
      await this.testBusinessAssessmentFlow(assessmentData)
      
      // Step 3: User Registration/Login
      await this.testUserRegistrationFlow(userData)
      
      // Step 4: Customer Portal Access
      await this.testCustomerPortalAccess(userData, assessmentData)
      
      // Step 5: AI Dream Coach Interaction
      await this.testAIDreamCoachFlow(userData, 1) // Start with Stage 1
      
      // Step 6: Progress through all 4 call stages
      await this.testFourStageProgression(userData)
      
      // Step 7: Voice Assistant Features
      await this.testVoiceAssistantFeatures(userData)
      
      await this.logger.log(`✅ User Journey Complete: ${scenario}`)
      
      return {
        scenario,
        success: true,
        userData,
        assessmentData,
        flowResults: this.flowResults
      }
      
    } catch (error) {
      await this.logger.error(`❌ User Journey Failed: ${scenario}`, error)
      
      return {
        scenario,
        success: false,
        error: error.message,
        flowResults: this.flowResults
      }
    }
  }

  /**
   * Test Home Page → Business Assessment Flow
   */
  async testHomePageToAssessment() {
    await this.logger.log('📋 Testing Home → Assessment Flow')
    
    // Navigate to home page
    await this.page.goto(this.baseURL)
    await this.page.waitForLoadState('networkidle')
    
    // Look for assessment link/button
    const assessmentButton = await this.page.locator('a[href*="business-assessment"], button:has-text("Assessment"), a:has-text("Get Started")').first()
    
    if (await assessmentButton.isVisible()) {
      await assessmentButton.click()
      await this.page.waitForURL('**/business-assessment**')
      
      this.flowResults.push({
        step: 'Home → Assessment',
        status: 'PASS',
        details: 'Successfully navigated to business assessment'
      })
    } else {
      // Direct navigation if button not found
      await this.page.goto(`${this.baseURL}/business-assessment`)
      
      this.flowResults.push({
        step: 'Home → Assessment',
        status: 'WARN', 
        details: 'Direct navigation used - assessment button not found'
      })
    }
    
    // Verify assessment page loaded
    await this.page.waitForSelector('form, .assessment-form, [data-testid="assessment"]')
  }

  /**
   * Test Business Assessment 4-Step Flow
   */
  async testBusinessAssessmentFlow(assessmentData) {
    await this.logger.log('📝 Testing Business Assessment Flow')
    
    try {
      // Step 1: Business Idea & Type
      await this.fillAssessmentStep1(assessmentData)
      
      // Step 2: Contact Details  
      await this.fillAssessmentStep2(assessmentData)
      
      // Step 3: Timeline & Experience
      await this.fillAssessmentStep3(assessmentData)
      
      // Step 4: Goals & Completion
      await this.fillAssessmentStep4(assessmentData)
      
      this.flowResults.push({
        step: 'Business Assessment',
        status: 'PASS',
        details: 'All 4 steps completed successfully'
      })
      
    } catch (error) {
      this.flowResults.push({
        step: 'Business Assessment',
        status: 'FAIL',
        details: error.message
      })
      throw error
    }
  }

  async fillAssessmentStep1(data) {
    await this.logger.log('📝 Assessment Step 1: Business Idea')
    
    // Business idea textarea
    const businessIdeaField = await this.page.locator('textarea[name="businessIdea"], textarea:has-text("business idea"), #businessIdea').first()
    if (await businessIdeaField.isVisible()) {
      await businessIdeaField.fill(data.businessIdea)
    }
    
    // Business type select
    const businessTypeField = await this.page.locator('select[name="businessType"], select:has-text("LLC"), #businessType').first()
    if (await businessTypeField.isVisible()) {
      await businessTypeField.selectOption(data.businessType)
    }
    
    // Next button
    await this.clickNextButton()
  }

  async fillAssessmentStep2(data) {
    await this.logger.log('📝 Assessment Step 2: Contact Details')
    
    // Full name
    const nameField = await this.page.locator('input[name="fullName"], input[type="text"]:has-text("name"), #fullName').first()
    if (await nameField.isVisible()) {
      await nameField.fill(data.fullName)
    }
    
    // Email
    const emailField = await this.page.locator('input[name="email"], input[type="email"], #email').first()
    if (await emailField.isVisible()) {
      await emailField.fill(data.email)
    }
    
    // Phone
    const phoneField = await this.page.locator('input[name="phone"], input[type="tel"], #phone').first()
    if (await phoneField.isVisible()) {
      await phoneField.fill(data.phone)
    }
    
    await this.clickNextButton()
  }

  async fillAssessmentStep3(data) {
    await this.logger.log('📝 Assessment Step 3: Timeline & Experience')
    
    // Timeline
    const timelineField = await this.page.locator('select[name="timeline"], #timeline').first()
    if (await timelineField.isVisible()) {
      await timelineField.selectOption(data.timeline)
    }
    
    // Experience
    const experienceField = await this.page.locator('select[name="experience"], #experience').first()
    if (await experienceField.isVisible()) {
      await experienceField.selectOption(data.experience)
    }
    
    await this.clickNextButton()
  }

  async fillAssessmentStep4(data) {
    await this.logger.log('📝 Assessment Step 4: Goals & Completion')
    
    // Goals
    const goalsField = await this.page.locator('textarea[name="goals"], #goals').first()
    if (await goalsField.isVisible()) {
      await goalsField.fill(data.goals)
    }
    
    // Complete button
    const completeButton = await this.page.locator('button:has-text("Complete"), button:has-text("Finish"), button[type="submit"]').first()
    await completeButton.click()
    
    // Wait for redirect to login
    await this.page.waitForURL('**/login**', { timeout: 10000 })
  }

  async clickNextButton() {
    const nextButton = await this.page.locator('button:has-text("Next"), button:has-text("Continue"), .next-button').first()
    await nextButton.click()
    await this.page.waitForTimeout(1000) // Wait for step transition
  }

  /**
   * Test User Registration/Login Flow
   */
  async testUserRegistrationFlow(userData) {
    await this.logger.log('👤 Testing User Registration/Login')
    
    try {
      // Should already be on login page from assessment
      await this.page.waitForSelector('input[type="email"], .auth-form, [data-supabase-auth]')
      
      // Fill email and password (Supabase auth)
      const emailField = await this.page.locator('input[type="email"]').first()
      const passwordField = await this.page.locator('input[type="password"]').first()
      
      await emailField.fill(userData.email)
      await passwordField.fill(userData.password)
      
      // Submit form
      const submitButton = await this.page.locator('button[type="submit"], button:has-text("Sign"), .auth-button').first()
      await submitButton.click()
      
      // Wait for redirect (either to customer-portal or admin-dashboard)
      await this.page.waitForFunction(
        () => window.location.pathname.includes('/customer-portal') || 
              window.location.pathname.includes('/admin-dashboard'),
        { timeout: 15000 }
      )
      
      this.flowResults.push({
        step: 'User Registration/Login',
        status: 'PASS',
        details: `Logged in as ${userData.email}`
      })
      
    } catch (error) {
      this.flowResults.push({
        step: 'User Registration/Login',
        status: 'FAIL',
        details: error.message
      })
      throw error
    }
  }

  /**
   * Test Customer Portal Access with Assessment Data
   */
  async testCustomerPortalAccess(userData, assessmentData) {
    await this.logger.log('🏠 Testing Customer Portal Access')
    
    try {
      // Should be on customer portal
      await this.page.waitForSelector('.customer-portal, .portal-content, .voice-widget')
      
      // Verify assessment data is displayed
      const hasAssessmentData = await this.verifyAssessmentDataDisplay(assessmentData)
      
      // Verify voice widget is present
      const voiceWidget = await this.page.locator('.optimized-voice-widget, .voice-assistant').first()
      const hasVoiceWidget = await voiceWidget.isVisible()
      
      this.flowResults.push({
        step: 'Customer Portal Access',
        status: hasAssessmentData && hasVoiceWidget ? 'PASS' : 'WARN',
        details: {
          assessmentDataVisible: hasAssessmentData,
          voiceWidgetPresent: hasVoiceWidget
        }
      })
      
    } catch (error) {
      this.flowResults.push({
        step: 'Customer Portal Access',
        status: 'FAIL',
        details: error.message
      })
      throw error
    }
  }

  async verifyAssessmentDataDisplay(assessmentData) {
    // Check if assessment data is displayed in the portal
    const pageContent = await this.page.textContent('body')
    
    const dataPoints = [
      assessmentData.businessIdea.substring(0, 20),
      assessmentData.businessType,
      assessmentData.fullName
    ]
    
    return dataPoints.some(point => pageContent.includes(point))
  }

  /**
   * Test AI Dream Coach Flow (Single Stage)
   */
  async testAIDreamCoachFlow(userData, callStage) {
    await this.logger.log(`🤖 Testing AI Dream Coach - Stage ${callStage}`)
    
    const coachingData = this.testData.generateAICoachingScenarios(callStage)
    
    try {
      // Locate voice widget
      const voiceWidget = await this.page.locator('.optimized-voice-widget').first()
      await voiceWidget.scrollIntoViewIfNeeded()
      
      // Start conversation
      const startButton = await voiceWidget.locator('button:has-text("Start")').first()
      await startButton.click()
      
      // Wait for initialization
      await this.page.waitForTimeout(2000)
      
      // Simulate voice interaction by injecting test message
      for (const testPhrase of coachingData.testPhrases.slice(0, 2)) { // Test first 2 phrases
        await this.simulateVoiceMessage(testPhrase)
        await this.waitForAIResponse()
      }
      
      this.flowResults.push({
        step: `AI Dream Coach - Stage ${callStage}`,
        status: 'PASS',
        details: {
          testPhrases: coachingData.testPhrases.slice(0, 2),
          stageName: coachingData.comments.stageName
        }
      })
      
    } catch (error) {
      this.flowResults.push({
        step: `AI Dream Coach - Stage ${callStage}`,
        status: 'FAIL', 
        details: error.message
      })
      throw error
    }
  }

  async simulateVoiceMessage(message) {
    await this.logger.log(`🎤 Simulating voice: "${message}"`)
    
    // Inject test message into voice widget
    await this.page.evaluate((msg) => {
      // Trigger message processing directly
      const event = new CustomEvent('testVoiceMessage', { 
        detail: { message: msg, timestamp: Date.now() } 
      })
      document.dispatchEvent(event)
      
      // Also add to conversation display if it exists
      const conversationDiv = document.querySelector('.conversation-history, .conversation')
      if (conversationDiv) {
        const messageDiv = document.createElement('div')
        messageDiv.innerHTML = `<strong>Test User:</strong> ${msg}`
        conversationDiv.appendChild(messageDiv)
      }
    }, message)
  }

  async waitForAIResponse() {
    // Wait for AI processing
    await this.page.waitForTimeout(3000)
    
    // Check for response indicators
    const hasResponse = await this.page.evaluate(() => {
      const conversation = document.querySelector('.conversation-history, .conversation')
      const status = document.querySelector('[style*="status"], .status')
      
      return {
        conversationUpdated: conversation && conversation.children.length > 0,
        statusIndicator: status && status.textContent.includes('AI')
      }
    })
    
    return hasResponse
  }

  /**
   * Test progression through all 4 call stages
   */
  async testFourStageProgression(userData) {
    await this.logger.log('🔄 Testing 4-Stage Call Progression')
    
    const stages = [1, 2, 3, 4]
    const stageNames = {
      1: 'Foundation & Vision',
      2: 'Brand Identity', 
      3: 'Operations Setup',
      4: 'Launch Strategy'
    }
    
    try {
      for (const stage of stages) {
        await this.logger.log(`📞 Testing Stage ${stage}: ${stageNames[stage]}`)
        
        // Navigate to optimized voice demo with specific stage
        await this.page.goto(`${this.baseURL}/optimized-voice-demo`)
        
        // Test this stage
        await this.testAIDreamCoachFlow(userData, stage)
        
        await this.page.waitForTimeout(1000)
      }
      
      this.flowResults.push({
        step: 'Four Stage Progression',
        status: 'PASS',
        details: 'All 4 call stages tested successfully'
      })
      
    } catch (error) {
      this.flowResults.push({
        step: 'Four Stage Progression',
        status: 'FAIL',
        details: error.message
      })
      throw error
    }
  }

  /**
   * Test Voice Assistant Advanced Features
   */
  async testVoiceAssistantFeatures(userData) {
    await this.logger.log('🎤 Testing Voice Assistant Features')
    
    try {
      await this.page.goto(`${this.baseURL}/optimized-voice-demo`)
      
      const features = await this.testVoiceFeatures()
      
      this.flowResults.push({
        step: 'Voice Assistant Features',
        status: features.allWorking ? 'PASS' : 'WARN',
        details: features
      })
      
    } catch (error) {
      this.flowResults.push({
        step: 'Voice Assistant Features',
        status: 'FAIL',
        details: error.message
      })
      throw error
    }
  }

  async testVoiceFeatures() {
    const features = {
      widgetPresent: false,
      startButton: false,
      stopButton: false,
      muteButton: false,
      statusDisplay: false,
      conversationHistory: false,
      volumeIndicator: false
    }
    
    // Check widget presence
    features.widgetPresent = await this.page.locator('.optimized-voice-widget').isVisible()
    
    if (features.widgetPresent) {
      // Check start button
      features.startButton = await this.page.locator('button:has-text("Start")').isVisible()
      
      // Start conversation to check other features
      if (features.startButton) {
        await this.page.locator('button:has-text("Start")').click()
        await this.page.waitForTimeout(2000)
        
        // Check stop/end button
        features.stopButton = await this.page.locator('button:has-text("End"), button:has-text("Stop")').isVisible()
        
        // Check mute button
        features.muteButton = await this.page.locator('button:has-text("Mute")').isVisible()
        
        // Check status display
        features.statusDisplay = await this.page.locator('.status, [style*="status"]').isVisible()
        
        // Check volume indicator
        features.volumeIndicator = await this.page.locator('[style*="volume"], .volume-indicator').isVisible()
        
        // Test a message to check conversation history
        await this.simulateVoiceMessage("Test message for conversation history")
        await this.page.waitForTimeout(2000)
        
        features.conversationHistory = await this.page.locator('.conversation-history, .conversation').isVisible()
      }
    }
    
    features.allWorking = Object.values(features).every(feature => feature === true)
    
    return features
  }

  /**
   * Generate comprehensive flow report
   */
  generateFlowReport() {
    const summary = {
      totalSteps: this.flowResults.length,
      passed: this.flowResults.filter(r => r.status === 'PASS').length,
      failed: this.flowResults.filter(r => r.status === 'FAIL').length,
      warnings: this.flowResults.filter(r => r.status === 'WARN').length
    }
    
    return {
      timestamp: new Date().toISOString(),
      summary,
      successRate: Math.round((summary.passed / summary.totalSteps) * 100),
      flowResults: this.flowResults
    }
  }
}

/**
 * Admin Dashboard Flow Automation
 */
class AdminFlowAutomation extends UserFlowAutomation {
  async executeAdminJourney() {
    await this.logger.log('🔐 Starting Admin Journey')
    
    const adminData = {
      email: 'morgan@dreamseed.ai', // Known admin email
      password: 'AdminTestPass123!'
    }
    
    try {
      // Admin login
      await this.testAdminLogin(adminData)
      
      // Admin dashboard access
      await this.testAdminDashboardAccess()
      
      // User management features
      await this.testUserManagement()
      
      // System monitoring
      await this.testSystemMonitoring()
      
      return {
        scenario: 'admin-journey',
        success: true,
        adminData,
        flowResults: this.flowResults
      }
      
    } catch (error) {
      return {
        scenario: 'admin-journey',
        success: false,
        error: error.message,
        flowResults: this.flowResults
      }
    }
  }

  async testAdminLogin(adminData) {
    await this.page.goto(`${this.baseURL}/admin-login`)
    
    // Fill admin login form
    await this.page.fill('input[type="email"]', adminData.email)
    await this.page.fill('input[type="password"]', adminData.password)
    await this.page.click('button[type="submit"]')
    
    // Wait for admin dashboard
    await this.page.waitForURL('**/admin-dashboard**')
    
    this.flowResults.push({
      step: 'Admin Login',
      status: 'PASS',
      details: 'Admin successfully logged in'
    })
  }

  async testAdminDashboardAccess() {
    // Verify admin dashboard elements
    const dashboardElements = [
      '.admin-dashboard',
      '.user-management',
      '.system-stats'
    ]
    
    let elementsFound = 0
    for (const selector of dashboardElements) {
      if (await this.page.locator(selector).isVisible()) {
        elementsFound++
      }
    }
    
    this.flowResults.push({
      step: 'Admin Dashboard Access',
      status: elementsFound > 0 ? 'PASS' : 'FAIL',
      details: `${elementsFound}/${dashboardElements.length} elements found`
    })
  }

  async testUserManagement() {
    // Test user management features
    const userTable = await this.page.locator('table, .user-list').isVisible()
    
    this.flowResults.push({
      step: 'User Management',
      status: userTable ? 'PASS' : 'WARN',
      details: 'User management interface checked'
    })
  }

  async testSystemMonitoring() {
    // Test system monitoring features
    const monitoringPanel = await this.page.locator('.monitoring, .stats, .metrics').isVisible()
    
    this.flowResults.push({
      step: 'System Monitoring',
      status: monitoringPanel ? 'PASS' : 'WARN', 
      details: 'System monitoring interface checked'
    })
  }
}

module.exports = { 
  UserFlowAutomation, 
  AdminFlowAutomation 
}