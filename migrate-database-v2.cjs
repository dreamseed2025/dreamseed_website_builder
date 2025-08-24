#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://kxldodhrhqbwyvgyuqfd.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4bGRvZGhyaHFid3l2Z3l1cWZkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTEyMDA3OCwiZXhwIjoyMDcwNjk2MDc4fQ.ByC7SLkJ2zeyhDN0nyWUNw-otETetisbjKM1sSCfS2Q';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function migrateDatabaseV2() {
  console.log('🚀 Starting DreamSeed Database Migration v2.0');
  console.log('==================================================\n');

  // Read the schema file
  const schemaSQL = fs.readFileSync('./database-schema.sql', 'utf8');
  
  // Split into individual statements
  const statements = schemaSQL
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt && !stmt.startsWith('--') && stmt !== '');

  console.log(`📄 Found ${statements.length} SQL statements to execute\n`);

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    
    if (statement.includes('COMMENT ON') || statement.includes('vector_cosine_ops')) {
      console.log(`⏭️  Skipping: ${statement.substring(0, 50)}...`);
      continue;
    }

    try {
      console.log(`🔄 Executing statement ${i + 1}/${statements.length}`);
      console.log(`   ${statement.substring(0, 80)}...`);
      
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: statement + ';'
      });

      if (error) {
        console.log(`❌ Error: ${error.message}`);
        errorCount++;
        
        // Try alternative approach for some statements
        if (statement.includes('CREATE TABLE')) {
          console.log(`🔄 Retrying with direct table creation...`);
          // We'll handle table creation differently if needed
        }
      } else {
        console.log(`✅ Success`);
        successCount++;
      }
    } catch (err) {
      console.log(`❌ Exception: ${err.message}`);
      errorCount++;
    }
    
    console.log('');
  }

  console.log('\n📊 Migration Summary:');
  console.log(`✅ Successful operations: ${successCount}`);
  console.log(`❌ Failed operations: ${errorCount}`);
  
  if (errorCount === 0) {
    console.log('\n🎉 Database migration completed successfully!');
  } else {
    console.log('\n⚠️  Migration completed with some errors. Manual intervention may be required.');
  }

  // Test the new tables
  console.log('\n🧪 Testing new table structure...');
  await testNewTables();
}

async function testNewTables() {
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
      const { count, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`❌ ${tableName}: ${error.message}`);
      } else {
        console.log(`✅ ${tableName}: Table exists (${count || 0} records)`);
      }
    } catch (err) {
      console.log(`❌ ${tableName}: ${err.message}`);
    }
  }

  console.log('\n🎯 Next steps:');
  console.log('1. Update API endpoints to use new schema');
  console.log('2. Migrate existing dream_dna data to dream_dna_truth');
  console.log('3. Update frontend components');
  console.log('4. Test voice call integration with new transcript tables');
  console.log('5. Implement website generation pipeline');
}

if (require.main === module) {
  migrateDatabaseV2().catch(console.error);
}

module.exports = { migrateDatabaseV2 };