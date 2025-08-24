/**
 * 🎯 Dynamic QA Data Generator
 * 
 * Generates realistic test data with context-aware comments
 * for comprehensive automated testing
 */

class QADataGenerator {
  constructor() {
    this.businessTypes = [
      'LLC', 'Corporation', 'Partnership', 'Sole Proprietorship',
      'S-Corp', 'C-Corp', 'Non-Profit', 'Cooperative'
    ]
    
    this.businessCategories = [
      'Technology', 'Healthcare', 'Finance', 'Education', 'Retail',
      'Consulting', 'Manufacturing', 'Real Estate', 'Food & Beverage',
      'Entertainment', 'Transportation', 'Energy', 'Agriculture'
    ]
    
    this.voiceTestPhrases = [
      "I want to start a consulting business",
      "How do I form an LLC in California?",
      "What are the tax implications of incorporation?",
      "I need help with business registration",
      "Can you explain the difference between LLC and Corporation?",
      "What permits do I need for my restaurant?",
      "Help me choose the right business structure",
      "I'm starting a tech startup, what should I know?",
      "What are the ongoing compliance requirements?",
      "How much does business formation cost?"
    ]
  }

  /**
   * Generate comprehensive user test data with context
   */
  generateTestUser(scenario = 'default') {
    const timestamp = Date.now()
    const userTypes = ['first-time-entrepreneur', 'experienced-business-owner', 'serial-entrepreneur']
    const userType = userTypes[Math.floor(Math.random() * userTypes.length)]
    
    const userData = {
      // Basic Info
      email: `qa-${scenario}-${timestamp}@dreamseed-test.com`,
      password: 'QATestPass123!',
      fullName: this.generateName(),
      phone: this.generatePhoneNumber(),
      
      // Context
      userType,
      scenario,
      timestamp,
      
      // Business Context
      businessExperience: this.getExperienceLevel(userType),
      industry: this.businessCategories[Math.floor(Math.random() * this.businessCategories.length)],
      
      // Test Comments
      comments: {
        purpose: `Testing ${scenario} user flow`,
        userType: `${userType} with ${this.getExperienceLevel(userType)} experience`,
        expectedBehavior: this.getExpectedUserBehavior(userType),
        testScenarios: this.getUserTestScenarios(userType)
      }
    }
    
    return userData
  }

  /**
   * Generate business assessment data with realistic context
   */
  generateBusinessAssessment(businessType = null, complexity = 'medium') {
    const selectedType = businessType || this.businessCategories[Math.floor(Math.random() * this.businessCategories.length)]
    const businessIdeas = this.getBusinessIdeasByType(selectedType)
    
    const assessment = {
      // Step 1: Business Idea
      businessIdea: businessIdeas[Math.floor(Math.random() * businessIdeas.length)],
      businessType: this.businessTypes[Math.floor(Math.random() * this.businessTypes.length)],
      
      // Step 2: Contact
      fullName: this.generateName(),
      email: `business-${Date.now()}@dreamseed-test.com`,
      phone: this.generatePhoneNumber(),
      
      // Step 3: Timeline & Experience
      timeline: this.getRandomTimeline(),
      experience: this.getRandomExperience(),
      
      // Step 4: Goals
      goals: this.generateBusinessGoals(selectedType, complexity),
      
      // Test Context
      testContext: {
        industry: selectedType,
        complexity,
        expectedCallStage: this.getExpectedCallStage(complexity),
        testScenarios: this.getAssessmentTestScenarios(selectedType),
        validationPoints: this.getValidationPoints()
      },
      
      // Comments for QA
      comments: {
        purpose: `Testing ${complexity} business assessment flow`,
        industry: `${selectedType} business formation`,
        expectedOutcome: `Should progress to Call Stage ${this.getExpectedCallStage(complexity)}`,
        criticalPaths: this.getCriticalAssessmentPaths()
      }
    }
    
    return assessment
  }

  /**
   * Generate AI Dream Coach test scenarios
   */
  generateAICoachingScenarios(callStage = 1) {
    const scenarios = {
      1: { // Foundation & Vision
        testPhrases: [
          "I want to start a consulting business",
          "Help me understand business formation",
          "What's the difference between LLC and Corporation?",
          "I need help choosing the right structure"
        ],
        expectedResponses: [
          "business structure",
          "LLC",
          "Corporation",
          "consultation"
        ]
      },
      2: { // Brand Identity  
        testPhrases: [
          "Help me with branding",
          "I need a business name",
          "What about trademark protection?",
          "Domain name availability"
        ],
        expectedResponses: [
          "brand",
          "trademark",
          "domain",
          "identity"
        ]
      },
      3: { // Operations Setup
        testPhrases: [
          "What permits do I need?",
          "Help with tax setup",
          "Business bank account requirements",
          "Operating agreement details"
        ],
        expectedResponses: [
          "permits",
          "tax",
          "banking",
          "operations"
        ]
      },
      4: { // Launch Strategy
        testPhrases: [
          "Marketing strategy help",
          "Launch timeline planning",
          "Customer acquisition",
          "Revenue projections"
        ],
        expectedResponses: [
          "marketing",
          "launch",
          "customers",
          "revenue"
        ]
      }
    }

    const stageData = scenarios[callStage] || scenarios[1]
    
    return {
      callStage,
      testPhrases: stageData.testPhrases,
      expectedResponses: stageData.expectedResponses,
      voiceTestData: {
        userId: `qa-voice-test-${Date.now()}`,
        dreamId: `qa-dream-${callStage}`,
        businessName: `QA Test Business ${callStage}`,
        businessType: 'LLC',
        callStage
      },
      comments: {
        purpose: `Testing AI Dream Coach Stage ${callStage}`,
        stageName: this.getCallStageName(callStage),
        expectedBehavior: `Should provide ${this.getCallStageName(callStage).toLowerCase()} guidance`,
        testCriteria: this.getCoachingTestCriteria(callStage)
      }
    }
  }

  /**
   * Generate API test data with comprehensive scenarios
   */
  generateAPITestData(endpoint, scenario = 'success') {
    const baseData = {
      '/api/vapi-integration': {
        success: {
          message: this.voiceTestPhrases[Math.floor(Math.random() * this.voiceTestPhrases.length)],
          userId: `qa-api-user-${Date.now()}`,
          dreamId: `qa-api-dream-${Date.now()}`,
          businessName: 'QA Test Business API',
          businessType: 'LLC',
          callStage: Math.floor(Math.random() * 4) + 1,
          useVAPI: true,
          voiceId: 'harry'
        },
        error: {
          message: '', // Empty message to trigger error
          userId: null,
          dreamId: null
        },
        timeout: {
          message: 'Very long message that might cause timeout issues in the API processing system and could potentially fail',
          userId: `timeout-test-${Date.now()}`,
          dreamId: `timeout-dream-${Date.now()}`,
          businessName: 'Timeout Test Business',
          businessType: 'Corporation',
          callStage: 1,
          useVAPI: true,
          voiceId: 'harry'
        }
      },
      
      '/api/elevenlabs-speech': {
        success: {
          text: 'This is a test message for speech synthesis quality testing',
          voiceId: '21m00Tcm4TlvDq8ikWAM',
          modelId: 'eleven_monolingual_v1'
        },
        error: {
          text: '', // Empty text
          voiceId: 'invalid-voice-id'
        },
        long: {
          text: 'This is an extremely long text message that tests the API limits and response times for speech synthesis. '.repeat(10),
          voiceId: '21m00Tcm4TlvDq8ikWAM',
          modelId: 'eleven_monolingual_v1'
        }
      },
      
      '/api/check-domains': {
        success: {
          domains: ['qa-test-business.com', 'test-company-name.org', 'startup-test.net']
        },
        error: {
          domains: [] // Empty array
        },
        large: {
          domains: Array.from({length: 50}, (_, i) => `test-domain-${i}.com`)
        }
      }
    }

    const data = baseData[endpoint]?.[scenario] || {}
    
    return {
      ...data,
      testContext: {
        endpoint,
        scenario,
        timestamp: Date.now(),
        expectedResult: this.getExpectedAPIResult(endpoint, scenario),
        comments: {
          purpose: `Testing ${endpoint} with ${scenario} scenario`,
          expectedBehavior: this.getExpectedAPIBehavior(endpoint, scenario),
          validationPoints: this.getAPIValidationPoints(endpoint)
        }
      }
    }
  }

  /**
   * Generate comprehensive test suites with scenarios
   */
  generateTestSuite(complexity = 'full') {
    const suites = {
      smoke: {
        name: 'Smoke Test Suite',
        description: 'Basic functionality verification',
        tests: [
          { type: 'page', target: '/' },
          { type: 'page', target: '/business-assessment' },
          { type: 'api', endpoint: '/api/vapi-integration', scenario: 'success' }
        ]
      },
      
      regression: {
        name: 'Regression Test Suite', 
        description: 'Comprehensive functionality testing',
        tests: [
          { type: 'user-flow', scenario: 'first-time-user' },
          { type: 'business-assessment', complexity: 'simple' },
          { type: 'ai-coaching', callStage: 1 },
          { type: 'voice-assistant', scenario: 'basic-conversation' }
        ]
      },
      
      full: {
        name: 'Full QA Test Suite',
        description: 'Complete end-to-end testing',
        tests: [
          { type: 'user-flow', scenario: 'experienced-user' },
          { type: 'business-assessment', complexity: 'complex' },
          { type: 'ai-coaching', callStage: 'all-stages' },
          { type: 'voice-assistant', scenario: 'advanced-features' },
          { type: 'admin-dashboard', scenario: 'full-management' },
          { type: 'api-stress', scenario: 'high-load' }
        ]
      }
    }

    const selectedSuite = suites[complexity] || suites.full
    
    return {
      ...selectedSuite,
      generated: Date.now(),
      testData: selectedSuite.tests.map(test => this.generateTestData(test)),
      comments: {
        purpose: `${selectedSuite.name} execution`,
        scope: selectedSuite.description,
        expectedDuration: this.getExpectedDuration(selectedSuite.tests.length),
        criticalPaths: this.getCriticalTestPaths(selectedSuite.tests)
      }
    }
  }

  // Helper methods
  generateName() {
    const firstNames = ['Alex', 'Jordan', 'Casey', 'Morgan', 'Taylor', 'Riley', 'Cameron', 'Avery']
    const lastNames = ['Johnson', 'Smith', 'Brown', 'Davis', 'Wilson', 'Miller', 'Garcia', 'Martinez']
    
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    
    return `${firstName} ${lastName}`
  }

  generatePhoneNumber() {
    const areaCode = Math.floor(Math.random() * 900) + 100
    const exchange = Math.floor(Math.random() * 900) + 100
    const number = Math.floor(Math.random() * 9000) + 1000
    
    return `+1-${areaCode}-${exchange}-${number}`
  }

  getBusinessIdeasByType(type) {
    const ideas = {
      'Technology': [
        'AI-powered business automation platform',
        'Mobile app development consultancy',
        'Cybersecurity services for small businesses',
        'Cloud migration consulting'
      ],
      'Healthcare': [
        'Telemedicine platform for remote consultations',
        'Medical device manufacturing',
        'Healthcare data analytics',
        'Wellness coaching services'
      ],
      'Consulting': [
        'Business strategy consulting',
        'Digital transformation advisory',
        'Operational efficiency consulting',
        'Leadership development coaching'
      ]
    }
    
    return ideas[type] || ideas['Consulting']
  }

  getExpectedUserBehavior(userType) {
    const behaviors = {
      'first-time-entrepreneur': 'Needs extensive guidance, asks basic questions',
      'experienced-business-owner': 'Focused on specific needs, knows terminology',
      'serial-entrepreneur': 'Quick decisions, interested in advanced features'
    }
    
    return behaviors[userType] || behaviors['first-time-entrepreneur']
  }

  getExpectedCallStage(complexity) {
    const stages = {
      'simple': 1,
      'medium': 2,
      'complex': 3,
      'advanced': 4
    }
    
    return stages[complexity] || 1
  }

  getCallStageName(stage) {
    const names = {
      1: 'Foundation & Vision',
      2: 'Brand Identity', 
      3: 'Operations Setup',
      4: 'Launch Strategy'
    }
    
    return names[stage] || 'Foundation & Vision'
  }

  generateBusinessGoals(type, complexity) {
    const baseGoals = [
      'Establish legal business entity',
      'Minimize tax liability',
      'Protect personal assets',
      'Enable business growth'
    ]
    
    const complexGoals = [
      'Multi-state operations setup',
      'Investment funding preparation', 
      'International expansion planning',
      'Complex partnership structures'
    ]
    
    return complexity === 'complex' ? 
      [...baseGoals, ...complexGoals].join(', ') :
      baseGoals.join(', ')
  }

  getRandomTimeline() {
    const timelines = ['Immediately', '1-3 months', '3-6 months', '6-12 months', '1+ years']
    return timelines[Math.floor(Math.random() * timelines.length)]
  }

  getRandomExperience() {
    const experiences = ['First time', 'Some experience', 'Very experienced']
    return experiences[Math.floor(Math.random() * experiences.length)]
  }

  getExperienceLevel(userType) {
    const levels = {
      'first-time-entrepreneur': 'First time',
      'experienced-business-owner': 'Very experienced',
      'serial-entrepreneur': 'Very experienced'
    }
    
    return levels[userType] || 'Some experience'
  }

  getExpectedAPIResult(endpoint, scenario) {
    const results = {
      '/api/vapi-integration': {
        'success': 'Valid AI response with business guidance',
        'error': 'Error message about missing data',
        'timeout': 'Timeout or processing delay'
      }
    }
    
    return results[endpoint]?.[scenario] || 'Standard API response'
  }

  getExpectedAPIBehavior(endpoint, scenario) {
    return `${endpoint} should handle ${scenario} scenario appropriately`
  }

  getAPIValidationPoints(endpoint) {
    const points = {
      '/api/vapi-integration': [
        'Response time < 5 seconds',
        'Valid JSON response',
        'Contains business guidance',
        'Proper error handling'
      ]
    }
    
    return points[endpoint] || ['Valid response', 'Proper status code']
  }

  getUserTestScenarios(userType) {
    return [
      'Registration flow',
      'Assessment completion',
      'Portal access',
      'AI interaction'
    ]
  }

  getAssessmentTestScenarios(industry) {
    return [
      'Form validation',
      'Data persistence', 
      'Step navigation',
      'Completion redirect'
    ]
  }

  getCoachingTestCriteria(callStage) {
    return [
      'Response relevance',
      'Voice clarity',
      'Conversation flow',
      'Stage-appropriate guidance'
    ]
  }

  getValidationPoints() {
    return [
      'All required fields completed',
      'Valid email format',
      'Phone number format',
      'Business type selection'
    ]
  }

  getCriticalAssessmentPaths() {
    return [
      'Step 1 → Step 2 progression',
      'Data persistence across steps',
      'Final submission success',
      'Redirect to login'
    ]
  }

  getCriticalTestPaths(tests) {
    return tests.map(test => `${test.type} execution`).join(', ')
  }

  getExpectedDuration(testCount) {
    const baseTime = 2 // minutes per test
    return `~${testCount * baseTime} minutes`
  }

  generateTestData(test) {
    switch (test.type) {
      case 'user-flow':
        return this.generateTestUser(test.scenario)
      case 'business-assessment':
        return this.generateBusinessAssessment(null, test.complexity)
      case 'ai-coaching':
        return this.generateAICoachingScenarios(test.callStage)
      case 'api':
        return this.generateAPITestData(test.endpoint, test.scenario)
      default:
        return { type: test.type, ...test }
    }
  }
}

module.exports = { QADataGenerator }