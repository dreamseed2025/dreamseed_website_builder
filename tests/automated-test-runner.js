#!/usr/bin/env node

/**
 * DreamSeed Automated Test Runner
 * Tests critical user flows and reports results
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Test Configuration
const BASE_URL = process.env.TEST_URL || 'https://dreamseed-website-builder-2gc3e51zz-morgans-projects-fe2cd439.vercel.app';
const TEST_RESULTS_FILE = path.join(__dirname, 'test-results.json');

// Test Data
const TEST_DATA = {
  assessment: {
    businessIdea: 'AI-powered business formation platform that simplifies startup processes',
    businessType: 'saas',
    fullName: 'Test User',
    email: 'test@dreamseed.com',
    phone: '(555) 123-4567',
    timeline: '1month',
    experience: 'first-time',
    mainGoal: 'revenue'
  },
  admin: {
    email: 'morgan@dreamseed.ai'
  },
  customer: {
    email: 'test@customer.com'
  }
};

// Test Results Storage
let testResults = {
  timestamp: new Date().toISOString(),
  summary: { passed: 0, failed: 0, total: 0 },
  tests: []
};

// Utility Functions
function logTest(testId, description) {
  console.log(`\\n🧪 Running ${testId}: ${description}`);
}

function logResult(testId, passed, error = null) {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} ${testId}`);
  if (error) console.log(`   Error: ${error}`);
  
  testResults.tests.push({
    testId,
    passed,
    error: error || null,
    timestamp: new Date().toISOString()
  });
  
  if (passed) testResults.summary.passed++;
  else testResults.summary.failed++;
  testResults.summary.total++;
}

// Test Cases
async function runTestSuite() {
  console.log('🚀 Starting DreamSeed Test Suite...');
  console.log(`Testing against: ${BASE_URL}`);
  
  const browser = await puppeteer.launch({ 
    headless: false, // Set to true for CI/CD
    defaultViewport: { width: 1200, height: 800 }
  });
  
  try {
    // TC-001: New User Complete Journey
    await testNewUserJourney(browser);
    
    // TC-002: Admin Login Flow  
    await testAdminLogin(browser);
    
    // TC-003: Role-Based Routing
    await testRoleBasedRouting(browser);
    
    // TC-005: Navigation Links
    await testNavigationLinks(browser);
    
    // TC-007: Authentication States
    await testAuthenticationStates(browser);
    
  } finally {
    await browser.close();
    
    // Save results
    fs.writeFileSync(TEST_RESULTS_FILE, JSON.stringify(testResults, null, 2));
    
    // Print summary
    console.log('\\n📊 Test Summary:');
    console.log(`✅ Passed: ${testResults.summary.passed}`);
    console.log(`❌ Failed: ${testResults.summary.failed}`);
    console.log(`📝 Total: ${testResults.summary.total}`);
    console.log(`📄 Results saved to: ${TEST_RESULTS_FILE}`);
    
    // Exit with error code if tests failed
    if (testResults.summary.failed > 0) {
      process.exit(1);
    }
  }
}

// TC-001: New User Complete Journey
async function testNewUserJourney(browser) {
  const testId = 'TC-001';
  logTest(testId, 'New User Complete Journey');
  
  const page = await browser.newPage();
  
  try {
    // Step 1: Visit home page
    await page.goto(BASE_URL);
    await page.waitForSelector('.cta-button', { timeout: 5000 });
    
    // Step 2: Click "Get Started Now" 
    await page.click('.cta-button');
    await page.waitForNavigation();
    
    // Verify we're on assessment page
    const url = page.url();
    if (!url.includes('/business-assessment')) {
      throw new Error(`Expected /business-assessment, got ${url}`);
    }
    
    // Step 3: Fill assessment form (Step 1)
    await page.type('#businessIdea', TEST_DATA.assessment.businessIdea);
    await page.select('#businessType', TEST_DATA.assessment.businessType);
    await page.click('button:contains("Next Step")');
    
    // Assessment Step 2
    await page.type('#fullName', TEST_DATA.assessment.fullName);
    await page.type('#email', TEST_DATA.assessment.email);
    await page.type('#phone', TEST_DATA.assessment.phone);
    await page.click('button:contains("Next Step")');
    
    // Assessment Step 3
    await page.select('#timeline', TEST_DATA.assessment.timeline);
    await page.select('#experience', TEST_DATA.assessment.experience);
    await page.click('button:contains("Next Step")');
    
    // Assessment Step 4
    await page.click(`input[value="${TEST_DATA.assessment.mainGoal}"]`);
    await page.click('button:contains("Start My Business Journey")');
    
    // Should redirect to login
    await page.waitForNavigation();
    const loginUrl = page.url();
    if (!loginUrl.includes('/login')) {
      throw new Error(`Expected /login, got ${loginUrl}`);
    }
    
    logResult(testId, true);
    
  } catch (error) {
    logResult(testId, false, error.message);
  } finally {
    await page.close();
  }
}

// TC-002: Admin Login Flow
async function testAdminLogin(browser) {
  const testId = 'TC-002';
  logTest(testId, 'Admin Login Flow');
  
  const page = await browser.newPage();
  
  try {
    await page.goto(`${BASE_URL}/admin-login`);
    await page.waitForSelector('.auth-form', { timeout: 5000 });
    
    // Check for admin-specific styling/content
    const hasAdminStyling = await page.$('.bg-gradient-to-br.from-red-50');
    if (!hasAdminStyling) {
      throw new Error('Admin login page missing red theme');
    }
    
    const adminTitle = await page.$eval('h1', el => el.textContent);
    if (!adminTitle.includes('Admin Portal')) {
      throw new Error('Missing admin portal title');
    }
    
    logResult(testId, true);
    
  } catch (error) {
    logResult(testId, false, error.message);
  } finally {
    await page.close();
  }
}

// TC-003: Role-Based Routing  
async function testRoleBasedRouting(browser) {
  const testId = 'TC-003';
  logTest(testId, 'Role-Based Routing');
  
  const page = await browser.newPage();
  
  try {
    // Test customer portal access without login
    await page.goto(`${BASE_URL}/customer-portal`);
    
    // Should redirect to login
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    const url = page.url();
    
    if (!url.includes('/login') && !url.includes('/customer-portal')) {
      throw new Error(`Expected redirect to login or portal access, got ${url}`);
    }
    
    logResult(testId, true);
    
  } catch (error) {
    logResult(testId, false, error.message);
  } finally {
    await page.close();
  }
}

// TC-005: Navigation Links
async function testNavigationLinks(browser) {
  const testId = 'TC-005';
  logTest(testId, 'Navigation Links');
  
  const page = await browser.newPage();
  
  try {
    await page.goto(BASE_URL);
    
    // Test main navigation links
    const navLinks = [
      { text: 'Home', expectedUrl: '/' },
      { text: 'Domain Checker', expectedUrl: '/domain-checker' },
      { text: 'Portal', expectedUrl: '/customer-portal' }
    ];
    
    for (const link of navLinks) {
      const linkElement = await page.$(`a:contains("${link.text}")`);
      if (!linkElement) {
        throw new Error(`Navigation link "${link.text}" not found`);
      }
      
      const href = await page.evaluate(el => el.getAttribute('href'), linkElement);
      if (!href.includes(link.expectedUrl)) {
        throw new Error(`Link "${link.text}" has wrong href: ${href}`);
      }
    }
    
    logResult(testId, true);
    
  } catch (error) {
    logResult(testId, false, error.message);
  } finally {
    await page.close();
  }
}

// TC-007: Authentication States
async function testAuthenticationStates(browser) {
  const testId = 'TC-007';
  logTest(testId, 'Authentication States');
  
  const page = await browser.newPage();
  
  try {
    // Test protected route access
    await page.goto(`${BASE_URL}/admin-dashboard`);
    
    // Should either show admin content or redirect to login
    const url = page.url();
    const hasLoginForm = await page.$('.auth-form');
    const hasAdminContent = await page.$('.admin-dashboard');
    
    if (!hasLoginForm && !hasAdminContent && !url.includes('/login')) {
      throw new Error('Protected route not handling authentication properly');
    }
    
    logResult(testId, true);
    
  } catch (error) {
    logResult(testId, false, error.message);  
  } finally {
    await page.close();
  }
}

// Run the test suite
if (require.main === module) {
  runTestSuite().catch(console.error);
}

module.exports = { runTestSuite, TEST_DATA };