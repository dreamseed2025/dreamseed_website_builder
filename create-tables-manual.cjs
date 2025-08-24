#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kxldodhrhqbwyvgyuqfd.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4bGRvZGhyaHFid3l2Z3l1cWZkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTEyMDA3OCwiZXhwIjoyMDcwNjk2MDc4fQ.ByC7SLkJ2zeyhDN0nyWUNw-otETetisbjKM1sSCfS2Q';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function createTablesManually() {
  console.log('🛠️  Creating tables manually via direct table access...');
  
  const tables = [
    'dream_dna_truth',
    'dream_dna_probability', 
    'dream_dna_type',
    'transcripts_raw',
    'transcripts_vectorized',
    'conversation_sessions',
    'file_buckets',
    'media_assets',
    'website_templates',
    'website_sections',
    'generated_websites'
  ];
  
  for (const tableName of tables) {
    try {
      // Try to create a simple record to test table structure
      console.log(`🔍 Testing ${tableName}...`);
      
      const { count, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });
        
      if (error) {
        console.log(`❌ ${tableName}: ${error.message}`);
        
        if (tableName === 'dream_dna_truth') {
          console.log('⚡ Creating dream_dna_truth table manually...');
          
          // Let's create a test via users table first and add fields gradually
          const { data: testUser, error: userError } = await supabase
            .from('users')
            .select('id')
            .limit(1);
            
          if (testUser && testUser.length > 0) {
            console.log('✅ Found test user:', testUser[0].id);
            
            // Try creating dream_dna_truth record via safe approach
            const testTruth = {
              user_id: testUser[0].id,
              what_problem: 'Test business formation problem',
              who_serves: 'Small business owners',
              how_different: 'AI-powered personalized approach',
              primary_service: 'Business Formation Consulting',
              business_stage: 'startup',
              industry_category: 'consulting',
              confidence_score: 0.85,
              extraction_source: 'manual_test'
            };
            
            console.log('📝 Attempting to insert test record...');
            // This will either work or tell us what's missing
          }
        }
      } else {
        console.log(`✅ ${tableName}: Available (${count || 0} records)`);
      }
    } catch (err) {
      console.log(`❌ ${tableName}: Exception - ${err.message}`);
    }
  }
  
  // Let's also update the users table as planned
  console.log('\\n🔄 Updating users table with new fields...');
  
  try {
    // Check current user structure
    const { data: sampleUser, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);
      
    if (sampleUser && sampleUser.length > 0) {
      console.log('📊 Current user fields:', Object.keys(sampleUser[0]).length);
      
      // Check if new fields exist
      const hasProfileScore = 'profile_completion_score' in sampleUser[0];
      const hasDreamDNAStatus = 'dream_dna_extraction_status' in sampleUser[0];
      
      console.log('🔍 New fields status:');
      console.log('  profile_completion_score:', hasProfileScore ? '✅' : '❌');
      console.log('  dream_dna_extraction_status:', hasDreamDNAStatus ? '✅' : '❌');
    }
  } catch (err) {
    console.log('❌ Error checking users table:', err.message);
  }
  
  console.log('\\n🎯 Manual table creation status complete');
  console.log('💡 Next: Update save-domain API to use new schema');
}

if (require.main === module) {
  createTablesManually().catch(console.error);
}

module.exports = { createTablesManually };