const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kxldodhrhqbwyvgyuqfd.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4bGRvZGhyaHFid3l2Z3l1cWZkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTEyMDA3OCwiZXhwIjoyMDcwNjk2MDc4fQ.ByC7SLkJ2zeyhDN0nyWUNw-otETetisbjKM1sSCfS2Q';

async function testDomainAuthFlow() {
  console.log('🧪 Testing domain authentication flow...\n');
  
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
  
  try {
    // Create a temporary test user for domain testing
    const testEmail = `domain-test-${Date.now()}@dreamseed.com`;
    const testPassword = 'DomainTest123!';
    
    console.log('👤 Creating test user for domain authentication...');
    const { data: signUpData, error: signUpError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true
    });
    
    if (signUpError) {
      console.error('❌ Failed to create test user:', signUpError.message);
      return;
    }
    
    console.log('✅ Test user created:', testEmail);
    console.log('🆔 User ID:', signUpData.user.id);
    
    // Sign in the user to get a session token
    console.log('\n🔐 Signing in user to get session token...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (signInError) {
      console.error('❌ Sign in failed:', signInError.message);
      return;
    }
    
    console.log('✅ User signed in successfully');
    console.log('🎫 Access token:', signInData.session.access_token.substring(0, 20) + '...');
    
    // Test the domain save API with the actual session token
    console.log('\n💾 Testing domain save API with session token...');
    
    const fetch = (await import('node-fetch')).default;
    
    const response = await fetch('http://localhost:3000/api/save-domain', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${signInData.session.access_token}`
      },
      body: JSON.stringify({
        domain: 'test-authentication.com',
        price: 1299,
        currency: 'USD'
      })
    });
    
    const result = await response.json();
    console.log('📊 Response status:', response.status);
    console.log('📄 API result:', result);
    
    if (response.status === 200 && result.success) {
      console.log('✅ Domain authentication working properly!');
    } else {
      console.log('❌ Authentication still failing:', result.error);
    }
    
    // Clean up test user
    console.log('\n🧹 Cleaning up test user...');
    await supabase.auth.admin.deleteUser(signUpData.user.id);
    console.log('✅ Test user deleted');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testDomainAuthFlow().catch(console.error);