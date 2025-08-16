#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function fixDatabase() {
  console.log('🔧 Manually fixing database schema...\n');
  
  try {
    // Add payment columns directly
    console.log('Adding payment_status column...');
    const { error: error1 } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE users ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'pending', 'paid', 'failed', 'refunded', 'trial'));`
    });
    if (error1) console.log('Note:', error1.message);
    
    console.log('Adding subscription_type column...');
    const { error: error2 } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_type TEXT CHECK (subscription_type IN ('basic', 'premium', 'enterprise', 'one-time'));`
    });
    if (error2) console.log('Note:', error2.message);
    
    console.log('Adding individual_assistant_id column...');
    const { error: error3 } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE users ADD COLUMN IF NOT EXISTS individual_assistant_id TEXT;`
    });
    if (error3) console.log('Note:', error3.message);
    
    console.log('Adding assistant_type column...');
    const { error: error4 } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE users ADD COLUMN IF NOT EXISTS assistant_type TEXT DEFAULT 'shared' CHECK (assistant_type IN ('shared', 'individual', 'admin'));`
    });
    if (error4) console.log('Note:', error4.message);
    
    // Try alternative approach with direct SQL execution
    console.log('\nTrying direct SQL execution...');
    
    // Test if columns exist first
    console.log('Testing column existence...');
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('payment_status, subscription_type, individual_assistant_id, assistant_type')
      .limit(1);
      
    if (testError) {
      console.log('❌ Columns still missing. Error:', testError.message);
      
      // Try raw SQL approach
      console.log('Attempting raw SQL execution...');
      
      const queries = [
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid';",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_type TEXT DEFAULT 'basic';", 
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS individual_assistant_id TEXT;",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS assistant_type TEXT DEFAULT 'shared';"
      ];
      
      for (const query of queries) {
        try {
          console.log(`Executing: ${query}`);
          const { error } = await supabase.rpc('exec_sql', { sql: query });
          if (error) {
            console.log(`⚠️ ${error.message}`);
          } else {
            console.log('✅ Success');
          }
        } catch (err) {
          console.log(`❌ Failed: ${err.message}`);
        }
      }
    } else {
      console.log('✅ All columns exist and accessible!');
      console.log('Sample data:', testData);
    }
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message);
  }
}

fixDatabase().catch(console.error);