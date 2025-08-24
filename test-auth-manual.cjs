const { createClient } = require('@supabase/supabase-js');

// Test the auth system directly
async function testAuthSystem() {
  console.log('🧪 Testing auth system directly...\n');
  
  const supabaseUrl = 'https://kxldodhrhqbwyvgyuqfd.supabase.co';
  const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4bGRvZGhyaHFid3l2Z3l1cWZkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTEyMDA3OCwiZXhwIjoyMDcwNjk2MDc4fQ.ByC7SLkJ2zeyhDN0nyWUNw-otETetisbjKM1sSCfS2Q';
  
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
  
  try {
    // Create test user for debugging
    const testEmail = `manual-test-${Date.now()}@dreamseed.com`;
    const testPassword = 'ManualTest123!';
    
    console.log('👤 Creating test user for manual testing:', testEmail);
    console.log('🔑 Password:', testPassword);
    
    const { data: signUpData, error: signUpError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true
    });
    
    if (signUpError) {
      console.error('❌ Error creating test user:', signUpError.message);
      return;
    }
    
    console.log('✅ Test user created successfully!');
    console.log('📧 Email:', testEmail);
    console.log('🔑 Password:', testPassword);
    
    console.log('\n📝 MANUAL TEST INSTRUCTIONS:');
    console.log('1. Open http://localhost:3000 in your browser');
    console.log('2. Open browser developer tools (F12)');
    console.log('3. Go to Console tab to see detailed logs');
    console.log('4. Click "Create Account & Get Started"');
    console.log('5. On login page, use these credentials:');
    console.log(`   Email: ${testEmail}`);
    console.log(`   Password: ${testPassword}`);
    console.log('6. Watch the browser console for detailed logs');
    console.log('7. Check the terminal running npm run dev for server logs');
    
    console.log('\n🔍 WHAT TO LOOK FOR:');
    console.log('- "🔄 Auth state changed" messages in browser console');
    console.log('- "🔐 User signed in, checking role..." message');
    console.log('- "✅ Role check result" or timeout messages');
    console.log('- Network requests in browser Network tab');
    console.log('- Any error messages in red');
    
    console.log('\n⏱️  This test user will remain active for debugging.');
    console.log('💡 Run this script again to create a fresh test user if needed.');
    
  } catch (error) {
    console.error('❌ Test setup failed:', error.message);
  }
}

testAuthSystem().catch(console.error);