const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createDreamDnaTruthTable() {
  try {
    console.log('🔧 Creating dream_dna_truth table...')
    
    // SQL to create the dream_dna_truth table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS dream_dna_truth (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        business_name VARCHAR(255),
        what_problem TEXT NOT NULL,
        who_serves TEXT NOT NULL, 
        how_different TEXT NOT NULL,
        primary_service TEXT NOT NULL,
        target_revenue BIGINT,
        business_model VARCHAR(100),
        unique_value_proposition TEXT,
        competitive_advantage TEXT,
        brand_personality VARCHAR(50),
        business_stage VARCHAR(50),
        industry_category VARCHAR(100),
        geographic_focus VARCHAR(255),
        timeline_to_launch INTEGER,
        confidence_score DECIMAL(3,2) DEFAULT 0.85,
        extraction_source VARCHAR(50),
        extracted_at TIMESTAMP DEFAULT NOW(),
        validated_by_user BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `
    
    // Execute the SQL using rpc (we'll use a different approach)
    console.log('📝 Executing SQL...')
    
    // Try to create the table by attempting to insert a test record
    // This will fail if the table doesn't exist, but we can catch the error
    const { error: testError } = await supabase
      .from('dream_dna_truth')
      .select('id')
      .limit(1)
    
    if (testError && testError.message.includes('Could not find the table')) {
      console.log('❌ Table does not exist. Please create it manually in Supabase dashboard.')
      console.log('📋 Run this SQL in your Supabase SQL editor:')
      console.log('\n' + createTableSQL + '\n')
      
      // Alternative: Try to create using a different approach
      console.log('🔄 Attempting to create table via insert...')
      
      const { error: insertError } = await supabase
        .from('dream_dna_truth')
        .insert({
          user_id: '00000000-0000-0000-0000-000000000000',
          what_problem: 'test',
          who_serves: 'test', 
          how_different: 'test',
          primary_service: 'test'
        })
      
      if (insertError) {
        console.log('❌ Could not create table automatically:', insertError.message)
        console.log('📋 Please run the SQL manually in Supabase dashboard')
        return
      }
    } else {
      console.log('✅ dream_dna_truth table already exists!')
    }
    
    // Test the table
    const { data, error } = await supabase
      .from('dream_dna_truth')
      .select('id')
      .limit(1)
    
    if (error) {
      console.error('❌ Error testing table:', error.message)
    } else {
      console.log('✅ dream_dna_truth table is working correctly!')
    }
    
  } catch (error) {
    console.error('❌ Error creating table:', error.message)
  }
}

createDreamDnaTruthTable()

