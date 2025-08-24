// Simple test runner to verify user flow with dynamic test data
const { faker } = require('@faker-js/faker');

// Generate test user data
function generateTestUser() {
  const testUser = {
    email: faker.internet.email(),
    password: faker.internet.password({ length: 12, prefix: 'Test!' }),
    name: faker.person.fullName(),
    business: faker.company.name(),
    phone: faker.phone.number(),
    entityType: faker.helpers.arrayElement(['LLC', 'Corporation', 'Partnership', 'Sole Proprietorship']),
    urgency: faker.helpers.arrayElement(['Low', 'Medium', 'High', 'Urgent'])
  };
  
  console.log('🧪 Generated Test User:');
  console.log(`   📧 Email: ${testUser.email}`);
  console.log(`   🔑 Password: ${testUser.password}`);
  console.log(`   👤 Name: ${testUser.name}`);
  console.log(`   🏢 Business: ${testUser.business}`);
  console.log(`   📱 Phone: ${testUser.phone}`);
  console.log(`   🏛️ Entity Type: ${testUser.entityType}`);
  console.log(`   ⚡ Urgency: ${testUser.urgency}`);
  console.log('');
  
  return testUser;
}

// Test URL accessibility
async function testPageAccessibility(url, pageName) {
  try {
    console.log(`🔍 Testing ${pageName} (${url})`);
    const response = await fetch(url, { 
      method: 'GET',
      headers: { 'User-Agent': 'QA-Test-Bot' }
    });
    
    if (response.ok) {
      console.log(`✅ ${pageName} is accessible (${response.status})`);
      return true;
    } else {
      console.log(`❌ ${pageName} returned ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${pageName} failed: ${error.message}`);
    return false;
  }
}

async function runUserFlowTests() {
  console.log('🚀 Starting User Flow Tests with Dynamic Test Data\n');
  
  // Generate multiple test users
  console.log('📊 Generating Test Data:');
  const testUsers = [];
  for (let i = 0; i < 3; i++) {
    testUsers.push(generateTestUser());
  }
  
  console.log('🌐 Testing Page Accessibility:');
  const baseUrl = 'http://localhost:3000';
  
  const pages = [
    { url: `${baseUrl}/`, name: 'Homepage' },
    { url: `${baseUrl}/login`, name: 'Login Page' },
    { url: `${baseUrl}/customer-portal`, name: 'Customer Portal' },
    { url: `${baseUrl}/optimized-voice-demo`, name: 'Business Coach' },
    { url: `${baseUrl}/admin-dashboard`, name: 'Admin Dashboard' }
  ];
  
  const results = [];
  for (const page of pages) {
    const result = await testPageAccessibility(page.url, page.name);
    results.push({ ...page, accessible: result });
  }
  
  console.log('\n📈 Test Results Summary:');
  const passedTests = results.filter(r => r.accessible).length;
  console.log(`✅ Passed: ${passedTests}/${results.length} pages accessible`);
  
  if (passedTests === results.length) {
    console.log('🎉 All pages are accessible!');
  } else {
    console.log('⚠️  Some pages need attention');
    results.filter(r => !r.accessible).forEach(page => {
      console.log(`   ❌ ${page.name}: ${page.url}`);
    });
  }
  
  console.log('\n🧪 Test Data Generated:');
  console.log(`   📊 Created ${testUsers.length} test users with dynamic data`);
  console.log(`   🔄 Each user has randomized business details`);
  console.log(`   📧 Email domains vary for testing different scenarios`);
  console.log(`   🔐 Passwords meet security requirements`);
  
  console.log('\n💡 Next Steps for Full E2E Testing:');
  console.log('   1. Use generated test data for Supabase user registration');
  console.log('   2. Test auth flow with each generated user');
  console.log('   3. Validate VAPI integration with business coach');
  console.log('   4. Verify data persistence across user sessions');
  
  return {
    totalPages: results.length,
    passedPages: passedTests,
    testUsers: testUsers.length,
    success: passedTests === results.length
  };
}

// Run the tests
runUserFlowTests().catch(console.error);