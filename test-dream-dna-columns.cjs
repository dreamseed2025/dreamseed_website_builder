const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testDreamDnaColumns() {
  try {
    console.log('🔍 Testing dream_dna table columns...')
    
    // Test 1: Try to select all columns
    console.log('📝 Test 1: Selecting all columns from dream_dna...')
    const { data: selectData, error: selectError } = await supabase
      .from('dream_dna')
      .select('*')
      .limit(1)
    
    if (selectError) {
      console.error('❌ Select error:', selectError.message)
    } else {
      console.log('✅ Select successful')
      if (selectData && selectData.length > 0) {
        console.log('📋 Available columns:', Object.keys(selectData[0]))
      }
    }
    
    // Test 2: Try to insert with minimal required fields
    console.log('📝 Test 2: Testing minimal insert...')
    const { data: insertData, error: insertError } = await supabase
      .from('dream_dna')
      .insert({
        user_id: '00000000-0000-0000-0000-000000000000',
        vision_statement: 'Test vision',
        business_concept: 'Test concept',
        target_customers: 'Test customers'
      })
      .select()
    
    if (insertError) {
      console.error('❌ Insert error:', insertError.message)
      console.error('❌ Error details:', insertError)
    } else {
      console.log('✅ Insert successful:', insertData)
      
      // Clean up the test record
      if (insertData && insertData[0]) {
        const { error: deleteError } = await supabase
          .from('dream_dna')
          .delete()
          .eq('id', insertData[0].id)
        
        if (deleteError) {
          console.error('⚠️ Could not delete test record:', deleteError.message)
        } else {
          console.log('✅ Test record cleaned up')
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message)
  }
}

testDreamDnaColumns()

