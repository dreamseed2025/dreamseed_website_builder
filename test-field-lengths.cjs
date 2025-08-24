const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testFieldLengths() {
  try {
    console.log('🔍 Testing field lengths...')
    
    // Test each field individually with different lengths
    const testCases = [
      {
        name: 'what_problem',
        data: { business_id: '00000000-0000-0000-0000-000000000000', what_problem: 'A'.repeat(50) }
      },
      {
        name: 'who_serves', 
        data: { business_id: '00000000-0000-0000-0000-000000000000', who_serves: 'A'.repeat(50) }
      },
      {
        name: 'how_different',
        data: { business_id: '00000000-0000-0000-0000-000000000000', how_different: 'A'.repeat(50) }
      },
      {
        name: 'primary_service',
        data: { business_id: '00000000-0000-0000-0000-000000000000', primary_service: 'A'.repeat(50) }
      },
      {
        name: 'brand_vibe',
        data: { business_id: '00000000-0000-0000-0000-000000000000', brand_vibe: 'A'.repeat(50) }
      }
    ]
    
    for (const testCase of testCases) {
      console.log(`📝 Testing ${testCase.name} with 50 characters...`)
      
      const { data, error } = await supabase
        .from('dream_dna')
        .insert(testCase.data)
        .select()
      
      if (error) {
        console.error(`❌ ${testCase.name} error:`, error.message)
        if (error.message.includes('too long')) {
          console.error(`   This field has a length limit!`)
        }
      } else {
        console.log(`✅ ${testCase.name} successful`)
        
        // Clean up the test record
        if (data && data[0]) {
          const { error: deleteError } = await supabase
            .from('dream_dna')
            .delete()
            .eq('id', data[0].id)
          
          if (deleteError) {
            console.error(`⚠️ Could not delete test record for ${testCase.name}:`, deleteError.message)
          }
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message)
  }
}

testFieldLengths()

