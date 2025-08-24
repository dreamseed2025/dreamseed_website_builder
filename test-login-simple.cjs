const { createClient } = require('@supabase/supabase-js');
const faker = require('@faker-js/faker');

// Supabase configuration
const supabaseUrl = 'https://kxldodhrhqbwyvgyuqfd.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4bGRvZGhyaHFid3l2Z3l1cWZkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTEyMDA3OCwiZXhwIjoyMDcwNjk2MDc4fQ.ByC7SLkJ2zeyhDN0nyWUNw-otETetisbjKM1sSCfS2Q';

async function testLoginFlow() {
  console.log('🔍 Testing login flow with simplified redirect...\n');
  
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
  
  try {
    // Test 1: Create a test user
    const testEmail = `test-login-${Date.now()}@dreamseed.com`;
    const testPassword = 'TestPassword123!';
    
    console.log('👤 Creating test user:', testEmail);
    
    const { data: signUpData, error: signUpError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true
    });
    
    if (signUpError) {
      console.error('❌ Sign up error:', signUpError.message);
      return;
    }
    
    console.log('✅ Test user created:', signUpData.user.id);
    
    // Test 2: Test login API endpoint
    console.log('\n🔐 Testing login API...');
    
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (loginError) {
      console.error('❌ Login error:', loginError.message);
      return;
    }
    
    console.log('✅ Login successful:', {
      userId: loginData.user.id,
      email: loginData.user.email,
      hasSession: !!loginData.session
    });
    
    // Test 3: Check if simple-portal page exists
    console.log('\n📄 Checking if simple-portal page exists...');
    
    const fetch = (await import('node-fetch')).default;
    
    try {
      const response = await fetch('http://localhost:3000/simple-portal');
      console.log('Simple Portal Status:', response.status);
      
      if (response.status === 404) {
        console.log('⚠️  /simple-portal page does not exist!');
        console.log('🔧 Login page redirects to /simple-portal but this page is missing.');
        console.log('📝 This is likely why users get stuck after login.');
      } else {
        console.log('✅ Simple portal page exists');
      }
      
    } catch (fetchError) {
      console.error('❌ Error checking simple-portal:', fetchError.message);
    }
    
    // Test 4: Check customer-portal page
    console.log('\n📄 Checking customer-portal page...');
    
    try {
      const response = await fetch('http://localhost:3000/customer-portal');
      console.log('Customer Portal Status:', response.status);
      
      if (response.status === 200) {
        console.log('✅ Customer portal page exists and works');
      }
      
    } catch (fetchError) {
      console.error('❌ Error checking customer-portal:', fetchError.message);
    }
    
    // Test 5: Test the auth callback
    console.log('\n🔄 Testing auth callback endpoint...');
    
    try {
      const response = await fetch('http://localhost:3000/auth/callback');
      console.log('Auth Callback Status:', response.status);
      
    } catch (fetchError) {
      console.error('❌ Error checking auth callback:', fetchError.message);
    }
    
    console.log('\n📊 DIAGNOSIS:');
    console.log('1. Authentication system: ✅ Working');
    console.log('2. User creation: ✅ Working');  
    console.log('3. Login API: ✅ Working');
    console.log('4. Redirect target: ❌ /simple-portal likely missing');
    console.log('\n💡 SOLUTION: Either create /simple-portal page or change redirect back to /customer-portal');
    
    // Clean up test user
    console.log('\n🧹 Cleaning up test user...');
    await supabase.auth.admin.deleteUser(signUpData.user.id);
    console.log('✅ Test user deleted');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testLoginFlow().catch(console.error);