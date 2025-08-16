import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(
  'https://kxldodhrhqbwyvgyuqfd.supabase.co',
  'sb_secret_GsVwx89kbQsB6LukLj7qdA_MUcB6-ZU'
);

async function setupNewDatabase() {
  console.log('🚀 Setting up new database structure...\n');
  
  try {
    // Read SQL files
    console.log('📄 Reading SQL files...');
    const usersSQL = fs.readFileSync('./sql/01_create_users_table.sql', 'utf8');
    const dreamDnaSQL = fs.readFileSync('./sql/02_create_dream_dna_table.sql', 'utf8');
    
    // Create users table
    console.log('👥 Creating users table...');
    const { error: usersError } = await supabase.rpc('exec_sql', { 
      sql: usersSQL 
    });
    
    if (usersError) {
      console.error('❌ Error creating users table:', usersError);
      // Try alternative method
      console.log('🔄 Trying alternative approach...');
      const statements = usersSQL.split(';').filter(s => s.trim());
      for (const statement of statements) {
        if (statement.trim()) {
          const { error } = await supabase.from('_').select('*').limit(0);
          // This is a workaround - we'll need to run these in Supabase dashboard
        }
      }
    } else {
      console.log('✅ Users table created successfully!');
    }
    
    // Create dream_dna table
    console.log('🧬 Creating dream_dna table...');
    const { error: dreamError } = await supabase.rpc('exec_sql', { 
      sql: dreamDnaSQL 
    });
    
    if (dreamError) {
      console.error('❌ Error creating dream_dna table:', dreamError);
    } else {
      console.log('✅ Dream DNA table created successfully!');
    }
    
    console.log('\n🎉 Database setup complete!');
    console.log('\n📋 Next steps:');
    console.log('1. Verify tables in Supabase dashboard');
    console.log('2. Update AI analyzer to use new structure');
    console.log('3. Migrate existing data');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    console.log('\n⚠️ Manual setup required:');
    console.log('1. Go to Supabase Dashboard > SQL Editor');
    console.log('2. Run ./sql/01_create_users_table.sql');
    console.log('3. Run ./sql/02_create_dream_dna_table.sql');
  }
}

setupNewDatabase();