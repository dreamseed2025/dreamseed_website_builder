#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceKey);

async function tryApiApproaches() {
  console.log('🔬 Trying different API approaches to add columns...\n');
  
  // Approach 1: Try using the REST API directly
  console.log('Approach 1: Direct REST API call...');
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceKey}`,
        'apikey': serviceKey
      },
      body: JSON.stringify({
        sql: "ALTER TABLE users ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid';"
      })
    });
    
    const result = await response.text();
    console.log('REST API response:', response.status, result);
  } catch (error) {
    console.log('❌ REST API failed:', error.message);
  }
  
  // Approach 2: Try using PostgREST directly
  console.log('\nApproach 2: PostgREST query...');
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/sql',
        'Authorization': `Bearer ${serviceKey}`,
        'apikey': serviceKey,
        'Accept': 'application/json'
      },
      body: "ALTER TABLE users ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid';"
    });
    
    const result = await response.text();
    console.log('PostgREST response:', response.status, result);
  } catch (error) {
    console.log('❌ PostgREST failed:', error.message);
  }
  
  // Approach 3: Try creating a custom RPC function first
  console.log('\nApproach 3: Check available RPC functions...');
  try {
    const { data, error } = await supabase.rpc('version');
    if (error) {
      console.log('❌ RPC test failed:', error.message);
    } else {
      console.log('✅ RPC works, version:', data);
    }
  } catch (error) {
    console.log('❌ RPC error:', error.message);
  }
  
  // Approach 4: Try using the database connection string directly
  console.log('\nApproach 4: Check if we can get DB connection info...');
  try {
    // This won't work but let's see what error we get
    const connectionString = `postgresql://postgres:[password]@db.${supabaseUrl.split('//')[1].split('.')[0]}.supabase.co:5432/postgres`;
    console.log('Would need connection string like:', connectionString.replace('[password]', '[YOUR_DB_PASSWORD]'));
    console.log('This requires the database password which isn\'t available via API');
  } catch (error) {
    console.log('❌ Connection string approach not viable');
  }
  
  // Approach 5: Check what's actually possible with service role
  console.log('\nApproach 5: Testing service role capabilities...');
  try {
    // Try to get schema information
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('*')
      .eq('table_name', 'users')
      .eq('table_schema', 'public');
      
    if (error) {
      console.log('❌ Cannot access schema info:', error.message);
    } else {
      console.log('✅ Can read schema info');
      const columnNames = data.map(col => col.column_name);
      console.log('Current columns:', columnNames.join(', '));
      
      const missingColumns = ['payment_status', 'subscription_type', 'individual_assistant_id', 'assistant_type'];
      const missing = missingColumns.filter(col => !columnNames.includes(col));
      console.log('Missing columns:', missing.join(', '));
    }
  } catch (error) {
    console.log('❌ Schema access failed:', error.message);
  }
  
  console.log('\n📋 CONCLUSION:');
  console.log('The Supabase client libraries and REST API are designed for data operations,');
  console.log('not schema modifications. DDL operations require either:');
  console.log('1. Direct database access (connection string + password)');
  console.log('2. Supabase Dashboard SQL Editor');
  console.log('3. Database migration tools');
  console.log('\nThe SQL Editor is the intended way to modify schema in hosted Supabase.');
}

tryApiApproaches().catch(console.error);