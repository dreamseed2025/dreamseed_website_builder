#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function addMissingColumns() {
  console.log('🔧 Adding missing database columns...\n');
  
  try {
    // First check what columns currently exist
    console.log('Checking current table structure...');
    const { data: existingUsers, error: checkError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
      
    if (checkError) {
      console.log('❌ Cannot access users table:', checkError.message);
      return;
    }
    
    console.log('✅ Users table accessible');
    if (existingUsers && existingUsers.length > 0) {
      console.log('Current columns:', Object.keys(existingUsers[0]).join(', '));
    }
    
    // Since we can't add columns via the API, let's create a temporary test record
    // with the expected structure to see what's missing
    console.log('\nTesting required columns by creating a test user...');
    
    const testUserData = {
      customer_email: 'test-structure@example.com',
      customer_name: 'Structure Test',
      business_name: 'Test Business',
      business_type: 'Technology',
      state_of_operation: 'Delaware',
      entity_type: 'LLC',
      account_type: 'customer',
      current_call_stage: 1,
      status: 'in_progress'
    };
    
    // Try to insert without payment columns first
    console.log('Inserting basic user data...');
    const { data: basicUser, error: basicError } = await supabase
      .from('users')
      .insert([testUserData])
      .select()
      .single();
      
    if (basicError) {
      console.log('❌ Basic insert failed:', basicError.message);
    } else {
      console.log('✅ Basic user created with ID:', basicUser.id);
      
      // Now try to update with payment columns
      console.log('Testing payment column updates...');
      
      const paymentUpdates = {
        payment_status: 'unpaid',
        subscription_type: 'basic',
        individual_assistant_id: null,
        assistant_type: 'shared'
      };
      
      const { error: updateError } = await supabase
        .from('users')
        .update(paymentUpdates)
        .eq('id', basicUser.id);
        
      if (updateError) {
        console.log('❌ Payment columns missing:', updateError.message);
        console.log('\n🚨 MANUAL ACTION REQUIRED:');
        console.log('You need to manually add these columns in Supabase SQL Editor:');
        console.log('');
        console.log('ALTER TABLE users ADD COLUMN payment_status TEXT DEFAULT \'unpaid\';');
        console.log('ALTER TABLE users ADD COLUMN subscription_type TEXT DEFAULT \'basic\';');
        console.log('ALTER TABLE users ADD COLUMN individual_assistant_id TEXT;');
        console.log('ALTER TABLE users ADD COLUMN assistant_type TEXT DEFAULT \'shared\';');
        console.log('');
        console.log('Go to: https://supabase.com/dashboard/project/[your-project]/sql');
        console.log('Run the above SQL commands, then try the voice interface again.');
      } else {
        console.log('✅ All payment columns exist and working!');
      }
      
      // Clean up test user
      await supabase.from('users').delete().eq('id', basicUser.id);
      console.log('🧹 Cleaned up test user');
    }
    
  } catch (error) {
    console.error('❌ Script failed:', error.message);
  }
}

addMissingColumns().catch(console.error);