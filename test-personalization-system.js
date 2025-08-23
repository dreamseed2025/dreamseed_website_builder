#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import SmartPromptGenerator from './smart-prompt-generator.js';
import EnhancedTranscriptExtractor from './enhanced-transcript-extractor.js';
import BusinessLaunchChecklist from './business-launch-checklist.js';

const supabase = createClient(
  'https://kxldodhrhqbwyvgyuqfd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4bGRvZGhyaHFid3l2Z3l1cWZkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTEyMDA3OCwiZXhwIjoyMDcwNjk2MDc4fQ.ByC7SLkJ2zeyhDN0nyWUNw-otETetisbjKM1sSCfS2Q'
);

class PersonalizationTester {
  constructor() {
    this.promptGenerator = new SmartPromptGenerator();
    this.extractor = new EnhancedTranscriptExtractor();
    this.checklist = new BusinessLaunchChecklist();
    this.testResults = [];
  }

  // Test case definitions with different customer scenarios
  getTestCases() {
    return [
      {
        id: 'new_customer',
        name: 'Brand New Customer',
        phone: '+15551234001',
        description: 'First-time caller with no data',
        expectedData: {},
        expectedStage: 1,
        expectedMemory: 'Should ask for basic info from scratch'
      },
      {
        id: 'call_1_complete',
        name: 'Call 1 Completed Customer',
        phone: '+15551234002',
        description: 'Customer who completed foundation call',
        setupData: {
          customer_name: 'John Smith',
          customer_email: 'john@startup.com',
          business_name: 'Startup Innovations LLC',
          entity_type: 'LLC',
          state_of_operation: 'Delaware',
          urgency_level: 'Medium - 2-3 months',
          call_1_completed: true
        },
        expectedStage: 2,
        expectedMemory: 'Should reference previous call and focus on branding'
      },
      {
        id: 'mid_journey',
        name: 'Mid-Journey Customer',
        phone: '+15551234003',
        description: 'Customer halfway through process',
        setupData: {
          customer_name: 'Sarah Johnson',
          customer_email: 'sarah@techcorp.com',
          business_name: 'TechCorp Solutions',
          entity_type: 'Corporation',
          state_of_operation: 'California',
          urgency_level: 'High - ASAP',
          call_1_completed: true,
          call_2_completed: true
        },
        expectedStage: 3,
        expectedMemory: 'Should know name, business, and focus on operations'
      },
      {
        id: 'almost_complete',
        name: 'Nearly Complete Customer',
        phone: '+15551234004',
        description: 'Customer who completed most calls',
        setupData: {
          customer_name: 'Mike Chen',
          customer_email: 'mike@consulting.biz',
          business_name: 'Chen Consulting Group LLC',
          entity_type: 'LLC',
          state_of_operation: 'Texas',
          urgency_level: 'High - launch within 30 days',
          call_1_completed: true,
          call_2_completed: true,
          call_3_completed: true
        },
        expectedStage: 4,
        expectedMemory: 'Should focus on final launch details and next steps'
      },
      {
        id: 'complete_customer',
        name: 'Completed Customer',
        phone: '+15551234005',
        description: 'Customer who completed all 4 calls',
        setupData: {
          customer_name: 'Lisa Park',
          customer_email: 'lisa@restaurant.com',
          business_name: 'Park Family Restaurant LLC',
          entity_type: 'LLC',
          state_of_operation: 'New York',
          urgency_level: 'Medium - seasonal launch',
          call_1_completed: true,
          call_2_completed: true,
          call_3_completed: true,
          call_4_completed: true
        },
        expectedStage: 4,
        expectedMemory: 'Should offer follow-up services and additional support'
      }
    ];
  }

  async runAllTests() {
    console.log('🧪 PERSONALIZATION SYSTEM E2E TESTING');
    console.log('=' .repeat(60));
    console.log(`📅 Started: ${new Date().toISOString()}`);
    console.log(`🎯 Testing ${this.getTestCases().length} scenarios\n`);

    for (const testCase of this.getTestCases()) {
      await this.runTestCase(testCase);
      await this.sleep(1000); // Brief pause between tests
    }

    this.generateReport();
  }

  async runTestCase(testCase) {
    console.log(`\n🔬 Testing: ${testCase.name}`);
    console.log(`📞 Phone: ${testCase.phone}`);
    console.log(`📋 Description: ${testCase.description}`);

    const result = {
      testCase: testCase.id,
      name: testCase.name,
      passed: false,
      issues: [],
      details: {}
    };

    try {
      // Step 1: Clean slate
      await this.cleanupTestUser(testCase.phone);
      
      // Step 2: Setup test data if provided
      if (testCase.setupData) {
        await this.setupTestUser(testCase.phone, testCase.setupData);
        console.log('✅ Test data setup complete');
      }

      // Step 3: Test data analysis
      const analysis = await this.promptGenerator.analyzeCustomerData(testCase.phone);
      result.details.analysis = {
        stage: analysis.stage,
        isNew: analysis.isNew,
        isComplete: analysis.isComplete,
        completionPercentage: analysis.checklist?.completionPercentage || 0
      };

      // Step 4: Test prompt generation
      const promptResult = await this.promptGenerator.generatePersonalizedPrompt(analysis);
      result.details.promptGenerated = !!promptResult;
      result.details.promptLength = promptResult ? promptResult.length : 0;

      // Step 5: Validate stage detection
      if (analysis.stage === testCase.expectedStage) {
        console.log(`✅ Stage detection: ${analysis.stage} (expected ${testCase.expectedStage})`);
      } else {
        console.log(`❌ Stage detection: ${analysis.stage} (expected ${testCase.expectedStage})`);
        result.issues.push(`Wrong stage: got ${analysis.stage}, expected ${testCase.expectedStage}`);
      }

      // Step 6: Validate memory context
      const memoryValidation = this.validateMemoryContext(promptResult, testCase);
      if (memoryValidation.passed) {
        console.log('✅ Memory context validation passed');
      } else {
        console.log(`❌ Memory context issues: ${memoryValidation.issues.join(', ')}`);
        result.issues.push(...memoryValidation.issues);
      }

      // Step 7: Test completion percentage calculation
      if (testCase.setupData) {
        const expectedCompletion = this.calculateExpectedCompletion(testCase.setupData);
        const actualCompletion = analysis.checklist?.completionPercentage || 0;
        
        if (Math.abs(actualCompletion - expectedCompletion) <= 5) { // 5% tolerance
          console.log(`✅ Completion calculation: ${actualCompletion}% (expected ~${expectedCompletion}%)`);
        } else {
          console.log(`❌ Completion calculation: ${actualCompletion}% (expected ~${expectedCompletion}%)`);
          result.issues.push(`Completion mismatch: got ${actualCompletion}%, expected ~${expectedCompletion}%`);
        }
      }

      // Step 8: Test prompt update (without actually calling VAPI)
      const updateResult = await this.testPromptUpdate(testCase.phone);
      if (updateResult.success) {
        console.log('✅ Prompt update simulation passed');
      } else {
        console.log(`❌ Prompt update failed: ${updateResult.error}`);
        result.issues.push(`Prompt update failed: ${updateResult.error}`);
      }

      result.passed = result.issues.length === 0;
      
      if (result.passed) {
        console.log('🎉 Test PASSED');
      } else {
        console.log(`💥 Test FAILED (${result.issues.length} issues)`);
      }

    } catch (error) {
      console.log(`💥 Test ERROR: ${error.message}`);
      result.issues.push(`Test execution error: ${error.message}`);
    }

    this.testResults.push(result);
  }

  async cleanupTestUser(phone) {
    try {
      // Delete existing test user and their transcripts
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('customer_phone', phone)
        .single();

      if (user) {
        await supabase.from('call_transcripts').delete().eq('user_id', user.id);
        await supabase.from('users').delete().eq('customer_phone', phone);
      }
    } catch (error) {
      // Ignore cleanup errors
    }
  }

  async setupTestUser(phone, data) {
    const userData = {
      customer_phone: phone,
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('users')
      .insert(userData);

    if (error) {
      throw new Error(`Setup failed: ${error.message}`);
    }
  }

  validateMemoryContext(prompt, testCase) {
    const result = { passed: true, issues: [] };

    if (!prompt) {
      result.passed = false;
      result.issues.push('No prompt generated');
      return result;
    }

    // Check for expected content based on test case
    if (testCase.setupData) {
      // Should mention customer name
      if (testCase.setupData.customer_name && !prompt.includes(testCase.setupData.customer_name)) {
        result.passed = false;
        result.issues.push(`Missing customer name: ${testCase.setupData.customer_name}`);
      }

      // Should mention business name
      if (testCase.setupData.business_name && !prompt.includes(testCase.setupData.business_name)) {
        result.passed = false;
        result.issues.push(`Missing business name: ${testCase.setupData.business_name}`);
      }

      // Should have "WHAT YOU ALREADY KNOW" section for returning customers
      if (!prompt.includes('WHAT YOU ALREADY KNOW')) {
        result.passed = false;
        result.issues.push('Missing "WHAT YOU ALREADY KNOW" section');
      }

      // Should have conversation approach
      if (!prompt.includes('CONVERSATION APPROACH')) {
        result.passed = false;
        result.issues.push('Missing conversation approach guidance');
      }
    } else {
      // New customer should have new customer prompt
      if (!prompt.includes('new customer')) {
        result.passed = false;
        result.issues.push('New customer not properly identified');
      }
    }

    return result;
  }

  calculateExpectedCompletion(setupData) {
    // Rough calculation based on fields provided
    const totalFields = 108;
    const providedFields = Object.keys(setupData).length;
    return Math.round((providedFields / totalFields) * 100);
  }

  async testPromptUpdate(phone) {
    try {
      // Simulate prompt update without actually calling VAPI
      const analysis = await this.promptGenerator.analyzeCustomerData(phone);
      const prompt = this.promptGenerator.generatePersonalizedPrompt(analysis);
      
      return {
        success: true,
        promptLength: prompt.length,
        stage: analysis.stage
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  generateReport() {
    console.log('\n\n📊 TESTING REPORT');
    console.log('=' .repeat(60));
    
    const passed = this.testResults.filter(r => r.passed).length;
    const failed = this.testResults.filter(r => !r.passed).length;
    const total = this.testResults.length;

    console.log(`✅ Passed: ${passed}/${total}`);
    console.log(`❌ Failed: ${failed}/${total}`);
    console.log(`📈 Success Rate: ${Math.round((passed/total) * 100)}%\n`);

    // Detailed results
    this.testResults.forEach(result => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} - ${result.name}`);
      
      if (!result.passed && result.issues.length > 0) {
        result.issues.forEach(issue => {
          console.log(`     🔸 ${issue}`);
        });
      }
      
      if (result.details.analysis) {
        console.log(`     📊 Stage: ${result.details.analysis.stage}, Completion: ${result.details.analysis.completionPercentage}%`);
      }
      console.log('');
    });

    // Summary recommendations
    console.log('🎯 RECOMMENDATIONS:');
    const allIssues = this.testResults.flatMap(r => r.issues);
    const issueTypes = this.categorizeIssues(allIssues);
    
    Object.entries(issueTypes).forEach(([category, count]) => {
      console.log(`   • ${category}: ${count} occurrences`);
    });

    console.log(`\n🏁 Testing completed at ${new Date().toISOString()}`);
  }

  categorizeIssues(issues) {
    const categories = {};
    issues.forEach(issue => {
      if (issue.includes('stage')) categories['Stage Detection'] = (categories['Stage Detection'] || 0) + 1;
      else if (issue.includes('name')) categories['Name Recognition'] = (categories['Name Recognition'] || 0) + 1;
      else if (issue.includes('completion')) categories['Completion Calculation'] = (categories['Completion Calculation'] || 0) + 1;
      else if (issue.includes('prompt')) categories['Prompt Generation'] = (categories['Prompt Generation'] || 0) + 1;
      else categories['Other'] = (categories['Other'] || 0) + 1;
    });
    return categories;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Run the tests
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new PersonalizationTester();
  tester.runAllTests().catch(console.error);
}

export default PersonalizationTester;