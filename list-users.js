#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function listUsers() {
  console.log('📋 Checking existing users...\n');
  
  const { data: users, error } = await supabase
    .from('users')
    .select('customer_email, customer_name, account_type, payment_status, subscription_type, individual_assistant_id')
    .order('created_at', { ascending: false })
    .limit(10);
    
  if (error) {
    console.log('❌ Error:', error.message);
    return;
  }
  
  if (users.length === 0) {
    console.log('🔍 No users found in database');
    console.log('\n💡 Options:');
    console.log('1. Create a test user profile');
    console.log('2. Sign up through /auth/signup.html');
    console.log('3. Import existing user data');
    return;
  }
  
  console.log(`Found ${users.length} users:`);
  console.log('=====================================');
  
  users.forEach((user, i) => {
    const assistantType = user.individual_assistant_id ? '⭐ Individual' : '🤝 Shared';
    console.log(`${i+1}. Email: ${user.customer_email}`);
    console.log(`   Name: ${user.customer_name || 'Not set'}`);
    console.log(`   Role: ${user.account_type} | Payment: ${user.payment_status} | Plan: ${user.subscription_type || 'basic'}`);
    console.log(`   Assistant: ${assistantType}`);
    console.log('');
  });
  
  console.log('💡 To test voice interface:');
  console.log('1. Go to /voice-call-enhanced.html');
  console.log('2. Enter one of the emails above');
  console.log('3. Click "Load My Profile"');
  console.log('4. Start voice conversation');
}

listUsers().catch(console.error);