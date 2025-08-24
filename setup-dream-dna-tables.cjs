const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupDreamDNATables() {
  try {
    console.log('🔧 Setting up Dream DNA tables...')
    
    // Read the SQL file
    const fs = require('fs')
    const sqlContent = fs.readFileSync('create-dream-dna-truth-table.sql', 'utf8')
    
    console.log('📝 Executing SQL commands...')
    
    // Split the SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    console.log(`📋 Found ${statements.length} SQL statements to execute`)
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (statement.trim()) {
        console.log(`\n🔨 Executing statement ${i + 1}/${statements.length}...`)
        console.log(`📄 ${statement.substring(0, 100)}...`)
        
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' })
          
          if (error) {
            console.log(`⚠️ Statement ${i + 1} result:`, error.message)
            // Continue with other statements even if one fails
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`)
          }
        } catch (err) {
          console.log(`❌ Statement ${i + 1} failed:`, err.message)
        }
      }
    }
    
    console.log('\n🎉 Dream DNA tables setup complete!')
    
    // Verify tables exist
    console.log('\n🔍 Verifying tables...')
    
    const tables = ['dream_dna_truth', 'dream_dna_probability_truth', 'dream_dna_type']
    
    for (const tableName of tables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('id')
          .limit(1)
        
        if (error) {
          console.log(`❌ ${tableName}: ${error.message}`)
        } else {
          console.log(`✅ ${tableName}: Table exists and accessible`)
        }
      } catch (err) {
        console.log(`❌ ${tableName}: ${err.message}`)
      }
    }
    
  } catch (error) {
    console.error('❌ Setup failed:', error)
  }
}

// Run the setup
setupDreamDNATables()
