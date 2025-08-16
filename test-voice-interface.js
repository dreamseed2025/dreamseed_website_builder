#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testVoiceInterface() {
  console.log('🎤 Testing voice interface database connection...\n');
  
  // Test the exact same query that the voice interface uses
  const testEmail = 'test.basic@dreamseed.com';
  
  try {
    console.log(`Testing profile load for: ${testEmail}`);
    
    // This is the exact query from voice-call-enhanced.html
    const { data: users, error } = await supabase
      .from('users')
      .select(`
        id,
        auth_user_id,
        customer_name,
        customer_email,
        customer_phone,
        business_name,
        business_type,
        state_of_operation,
        entity_type,
        call_1_completed,
        call_2_completed,
        call_3_completed,
        call_4_completed,
        call_1_completed_at,
        call_2_completed_at,
        call_3_completed_at,
        call_4_completed_at,
        current_call_stage,
        account_type,
        payment_status,
        subscription_type,
        amount_paid,
        payment_date,
        subscription_expires_at,
        individual_assistant_id,
        assistant_type,
        status
      `)
      .eq('customer_email', testEmail);
    
    if (error) {
      console.log('❌ Voice interface query failed:', error.message);
      return;
    }
    
    if (!users || users.length === 0) {
      console.log('❌ No users found for email:', testEmail);
      return;
    }
    
    console.log('✅ Profile query successful!');
    console.log(`Found ${users.length} user(s) for ${testEmail}`);
    
    const user = users[0]; // Use first match
    console.log('\n📋 User Profile Data:');
    console.log(`- ID: ${user.id}`);
    console.log(`- Name: ${user.customer_name}`);
    console.log(`- Email: ${user.customer_email}`);
    console.log(`- Business: ${user.business_name}`);
    console.log(`- Account Type: ${user.account_type}`);
    console.log(`- Payment Status: ${user.payment_status}`);
    console.log(`- Subscription: ${user.subscription_type}`);
    console.log(`- Assistant Type: ${user.assistant_type}`);
    console.log(`- Call Stage: ${user.current_call_stage}`);
    console.log(`- Status: ${user.status}`);
    
    // Test dream data fetch (if any)
    console.log('\n🧬 Testing dream data fetch...');
    const { data: dreams, error: dreamError } = await supabase
      .from('dream_dna')
      .select(`
        id,
        user_id,
        vision_statement,
        core_purpose,
        target_market,
        competitive_advantage,
        completeness_score
      `)
      .eq('user_id', user.id);
      
    if (dreamError) {
      console.log('⚠️ Dream data query failed:', dreamError.message);
    } else {
      console.log(`✅ Found ${dreams.length} dream(s) for user`);
      if (dreams.length > 0) {
        const dream = dreams[0];
        console.log(`- Dream ID: ${dream.id}`);
        console.log(`- Vision: ${dream.vision_statement}`);
        console.log(`- Purpose: ${dream.core_purpose}`);
        console.log(`- Completeness: ${dream.completeness_score}%`);
      }
    }
    
    console.log('\n🎉 Voice interface database connection is working!');
    console.log('Your voice interface should now work properly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testVoiceInterface().catch(console.error);