const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupDreamDNATable() {
  console.log('🧬 Setting up Dream DNA table...')
  
  try {
    // Create dream_dna table with all columns
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS dream_dna (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        
        -- Vision & Purpose
        vision_statement TEXT,
        core_purpose TEXT,
        impact_goal TEXT,
        legacy_vision TEXT,
        passion_driver TEXT,
        
        -- Business Dream Details
        business_concept TEXT,
        target_customers TEXT,
        unique_value_prop TEXT,
        scalability_vision TEXT,
        revenue_goals TEXT,
        services_offered TEXT,
        
        -- Success Metrics & Goals
        lifestyle_goals TEXT,
        freedom_level TEXT,
        growth_timeline TEXT,
        exit_strategy TEXT,
        success_milestones JSONB,
        
        -- Psychological Profile
        risk_tolerance TEXT,
        urgency_level TEXT DEFAULT 'Medium',
        confidence_level INTEGER CHECK (confidence_level >= 1 AND confidence_level <= 10),
        support_needs TEXT,
        pain_points TEXT,
        motivation_factors JSONB,
        
        -- Package & Timeline Preferences
        package_preference TEXT,
        budget_range TEXT,
        budget_mentioned TEXT,
        timeline_preference TEXT,
        next_steps TEXT,
        key_requirements JSONB,
        
        -- Analysis Metadata
        completeness_score INTEGER DEFAULT 0,
        last_analyzed_at TIMESTAMP WITH TIME ZONE,
        analysis_notes TEXT
      );
    `
    
    const { error: createError } = await supabase.rpc('exec_sql', { sql: createTableSQL })
    
    if (createError) {
      console.log('⚠️ Table creation error (might already exist):', createError.message)
    } else {
      console.log('✅ Dream DNA table created successfully')
    }
    
    // Add columns if they don't exist
    const addColumnsSQL = `
      ALTER TABLE dream_dna 
      ADD COLUMN IF NOT EXISTS core_purpose TEXT,
      ADD COLUMN IF NOT EXISTS impact_goal TEXT,
      ADD COLUMN IF NOT EXISTS legacy_vision TEXT,
      ADD COLUMN IF NOT EXISTS passion_driver TEXT,
      ADD COLUMN IF NOT EXISTS business_concept TEXT,
      ADD COLUMN IF NOT EXISTS target_customers TEXT,
      ADD COLUMN IF NOT EXISTS unique_value_prop TEXT,
      ADD COLUMN IF NOT EXISTS scalability_vision TEXT,
      ADD COLUMN IF NOT EXISTS revenue_goals TEXT,
      ADD COLUMN IF NOT EXISTS services_offered TEXT,
      ADD COLUMN IF NOT EXISTS lifestyle_goals TEXT,
      ADD COLUMN IF NOT EXISTS freedom_level TEXT,
      ADD COLUMN IF NOT EXISTS growth_timeline TEXT,
      ADD COLUMN IF NOT EXISTS exit_strategy TEXT,
      ADD COLUMN IF NOT EXISTS success_milestones JSONB,
      ADD COLUMN IF NOT EXISTS risk_tolerance TEXT,
      ADD COLUMN IF NOT EXISTS urgency_level TEXT DEFAULT 'Medium',
      ADD COLUMN IF NOT EXISTS confidence_level INTEGER,
      ADD COLUMN IF NOT EXISTS support_needs TEXT,
      ADD COLUMN IF NOT EXISTS pain_points TEXT,
      ADD COLUMN IF NOT EXISTS motivation_factors JSONB,
      ADD COLUMN IF NOT EXISTS package_preference TEXT,
      ADD COLUMN IF NOT EXISTS budget_range TEXT,
      ADD COLUMN IF NOT EXISTS budget_mentioned TEXT,
      ADD COLUMN IF NOT EXISTS timeline_preference TEXT,
      ADD COLUMN IF NOT EXISTS next_steps TEXT,
      ADD COLUMN IF NOT EXISTS key_requirements JSONB,
      ADD COLUMN IF NOT EXISTS completeness_score INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS last_analyzed_at TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS analysis_notes TEXT;
    `
    
    const { error: alterError } = await supabase.rpc('exec_sql', { sql: addColumnsSQL })
    
    if (alterError) {
      console.log('⚠️ Column addition error (might already exist):', alterError.message)
    } else {
      console.log('✅ Dream DNA columns added successfully')
    }
    
    // Create indexes
    const createIndexesSQL = `
      CREATE INDEX IF NOT EXISTS idx_dream_dna_user_id ON dream_dna(user_id);
      CREATE INDEX IF NOT EXISTS idx_dream_dna_completeness ON dream_dna(completeness_score);
      CREATE INDEX IF NOT EXISTS idx_dream_dna_urgency ON dream_dna(urgency_level);
      CREATE INDEX IF NOT EXISTS idx_dream_dna_package ON dream_dna(package_preference);
    `
    
    const { error: indexError } = await supabase.rpc('exec_sql', { sql: createIndexesSQL })
    
    if (indexError) {
      console.log('⚠️ Index creation error:', indexError.message)
    } else {
      console.log('✅ Dream DNA indexes created successfully')
    }
    
    // Enable RLS
    const enableRLSSQL = `
      ALTER TABLE dream_dna ENABLE ROW LEVEL SECURITY;
      
      DROP POLICY IF EXISTS "Allow all operations on dream_dna" ON dream_dna;
      
      CREATE POLICY "Allow all operations on dream_dna" ON dream_dna
        FOR ALL USING (true);
    `
    
    const { error: rlsError } = await supabase.rpc('exec_sql', { sql: enableRLSSQL })
    
    if (rlsError) {
      console.log('⚠️ RLS setup error:', rlsError.message)
    } else {
      console.log('✅ Dream DNA RLS enabled successfully')
    }
    
    // Test the table
    console.log('\n🧪 Testing Dream DNA table...')
    
    const { data: testData, error: testError } = await supabase
      .from('dream_dna')
      .select('*')
      .limit(1)
    
    if (testError) {
      console.error('❌ Dream DNA table test failed:', testError.message)
    } else {
      console.log('✅ Dream DNA table is working correctly')
      console.log('📊 Sample data structure:', Object.keys(testData[0] || {}))
    }
    
    console.log('\n🎉 Dream DNA table setup complete!')
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message)
  }
}

setupDreamDNATable()
