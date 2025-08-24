const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testBrandVibeValues() {
  try {
    console.log('🔍 Testing simple brand_vibe values...')
    
    // Test very simple, short values
    const simpleValues = [
      'Pro',
      'Fun',
      'Cool',
      'Nice',
      'Good',
      'Bad',
      'Hot',
      'Warm',
      'Cold',
      'Fast',
      'Slow',
      'Big',
      'Small',
      'New',
      'Old',
      'Red',
      'Blue',
      'Green',
      'Auto',
      'Default'
    ]
    
    for (const value of simpleValues) {
      console.log(`Testing brand_vibe: "${value}"`)
      
      const { data, error } = await supabase
        .from('dream_dna')
        .insert({
          business_id: '00000000-0000-0000-0000-000000000000',
          what_problem: 'Test problem',
          who_serves: 'Test customers',
          how_different: 'Test differentiation',
          primary_service: 'Test service',
          price_level: 'Medium',
          brand_vibe: value,
          color_preference: 'Blue'
        })
        .select()
      
      if (error) {
        console.error(`❌ "${value}" failed:`, error.message)
      } else {
        console.log(`✅ "${value}" successful`)
        
        // Clean up the test record
        if (data && data[0]) {
          const { error: deleteError } = await supabase
            .from('dream_dna')
            .delete()
            .eq('id', data[0].id)
          
          if (deleteError) {
            console.error(`⚠️ Could not delete test record for "${value}":`, deleteError.message)
          }
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message)
  }
}

testBrandVibeValues()

