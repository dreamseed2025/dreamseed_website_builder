const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testDreamDnaTruthTable() {
  try {
    console.log('🔍 Testing dream_dna_truth table...')
    
    // Test 1: Try to select from the table
    console.log('📝 Test 1: Selecting from dream_dna_truth...')
    const { data: selectData, error: selectError } = await supabase
      .from('dream_dna_truth')
      .select('*')
      .limit(1)
    
    if (selectError) {
      console.error('❌ Select error:', selectError.message)
      console.error('❌ Error details:', selectError)
    } else {
      console.log('✅ Select successful:', selectData)
    }
    
    // Test 2: Try to insert a test record
    console.log('📝 Test 2: Inserting test record...')
    const { data: insertData, error: insertError } = await supabase
      .from('dream_dna_truth')
      .insert({
        user_id: '00000000-0000-0000-0000-000000000000',
        what_problem: 'Test problem',
        who_serves: 'Test customers',
        how_different: 'Test differentiation',
        primary_service: 'Test service'
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
          .from('dream_dna_truth')
          .delete()
          .eq('id', insertData[0].id)
        
        if (deleteError) {
          console.error('⚠️ Could not delete test record:', deleteError.message)
        } else {
          console.log('✅ Test record cleaned up')
        }
      }
    }
    
    // Test 3: Check table structure
    console.log('📝 Test 3: Checking table structure...')
    const { data: structureData, error: structureError } = await supabase
      .rpc('get_table_structure', { table_name: 'dream_dna_truth' })
    
    if (structureError) {
      console.log('⚠️ Could not get table structure (function may not exist):', structureError.message)
    } else {
      console.log('✅ Table structure:', structureData)
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message)
  }
}

testDreamDnaTruthTable()

