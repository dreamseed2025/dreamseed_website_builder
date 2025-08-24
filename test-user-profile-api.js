import { createClient } from '@supabase/supabase-js'

// Test the user profile API
async function testUserProfileAPI() {
  console.log('🧪 Testing User Profile API...')
  
  try {
    // Test the API endpoint directly
    const response = await fetch('http://localhost:3000/api/user-profile', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    const result = await response.json()
    console.log('📊 API Response:', JSON.stringify(result, null, 2))
    
    if (result.success) {
      console.log('✅ User Profile API is working!')
      if (result.profile) {
        console.log('👤 User Profile Data:')
        console.log('  - ID:', result.profile.id)
        console.log('  - Name:', result.profile.customer_name)
        console.log('  - Email:', result.profile.customer_email)
        console.log('  - Status:', result.profile.status)
        console.log('  - Dream DNA:', result.profile.dream_dna ? 'Present' : 'Not present')
      }
    } else {
      console.log('❌ API Error:', result.message)
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

// Test Supabase connection
async function testSupabaseConnection() {
  console.log('\n🔗 Testing Supabase Connection...')
  
  try {
    const supabaseUrl = 'https://kxldodhrhqbwyvgyuqfd.supabase.co'
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4bGRvZGhyaHFid3l2Z3l1cWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxMjAwNzgsImV4cCI6MjA3MDY5NjA3OH0.a7RTzupHtPO_1viiXYvF3SAtGNngiG_IDChCMAZN5mU'
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Test basic connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (error) {
      console.log('❌ Supabase connection failed:', error.message)
    } else {
      console.log('✅ Supabase connection successful!')
      console.log('📊 Users table accessible')
    }
    
  } catch (error) {
    console.error('❌ Supabase test failed:', error.message)
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting User Profile Tests...\n')
  
  await testSupabaseConnection()
  await testUserProfileAPI()
  
  console.log('\n✨ Tests completed!')
}

runTests().catch(console.error)
