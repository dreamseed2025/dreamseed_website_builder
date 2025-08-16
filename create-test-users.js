#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function createTestUsers() {
  console.log('🧪 Creating test user profiles for voice interface testing...\n');
  
  const testUsers = [
    {
      customer_email: 'test.basic@dreamseed.com',
      customer_name: 'John Basic',
      business_name: 'Basic LLC Test',
      business_type: 'Technology',
      state_of_operation: 'Delaware',
      entity_type: 'LLC',
      account_type: 'customer',
      current_call_stage: 1,
      status: 'in_progress'
    },
    {
      customer_email: 'test.premium@dreamseed.com', 
      customer_name: 'Sarah Premium',
      business_name: 'Premium Consulting LLC',
      business_type: 'Consulting',
      state_of_operation: 'California',
      entity_type: 'LLC',
      account_type: 'customer',
      current_call_stage: 2,
      status: 'in_progress',
      call_1_completed: true,
      call_1_completed_at: new Date().toISOString()
    },
    {
      customer_email: 'admin@dreamseed.com',
      customer_name: 'Admin User',
      business_name: 'DreamSeed Admin',
      business_type: 'Business Services',
      state_of_operation: 'Delaware',
      entity_type: 'LLC',
      account_type: 'admin',
      current_call_stage: 4,
      status: 'completed',
      call_1_completed: true,
      call_2_completed: true,
      call_3_completed: true,
      call_4_completed: true
    }
  ];

  try {
    for (const user of testUsers) {
      console.log(`Creating user: ${user.customer_email}...`);
      
      const { data, error } = await supabase
        .from('users')
        .insert([user])
        .select()
        .single();
        
      if (error) {
        if (error.message.includes('duplicate key') || error.message.includes('already exists')) {
          console.log(`   ⚠️ User ${user.customer_email} already exists`);
        } else {
          console.log(`   ❌ Error: ${error.message}`);
        }
      } else {
        console.log(`   ✅ Created user with ID: ${data.id}`);
        
        // Create a dream for this user
        if (user.customer_email !== 'admin@dreamseed.com') {
          await createDreamForUser(data.id, user);
        }
      }
    }
    
    console.log('\n🎉 Test users created successfully!');
    await listAvailableProfiles();
    
  } catch (error) {
    console.error('❌ Failed to create test users:', error.message);
  }
}

async function createDreamForUser(userId, user) {
  const dreamData = {
    user_id: userId,
    vision_statement: `${user.business_name} - ${user.business_type} company`,
    core_purpose: `Provide excellent ${user.business_type.toLowerCase()} services`,
    target_market: 'Small to medium businesses',
    competitive_advantage: 'Personalized service and innovative solutions',
    completeness_score: Math.floor(Math.random() * 100) + 1
  };
  
  const { error } = await supabase
    .from('dream_dna')
    .insert([dreamData]);
    
  if (error && !error.message.includes('duplicate')) {
    console.log(`   ⚠️ Dream creation warning: ${error.message}`);
  } else {
    console.log(`   ✅ Created dream/project for ${user.customer_name}`);
  }
}

async function listAvailableProfiles() {
  console.log('\n📋 Available Test Profiles:');
  console.log('=======================================');
  
  const profiles = [
    {
      email: 'test.basic@dreamseed.com',
      name: 'John Basic', 
      type: 'Basic Customer',
      assistant: '🤝 Shared Assistant',
      description: 'Basic user with shared assistant and context injection'
    },
    {
      email: 'test.premium@dreamseed.com',
      name: 'Sarah Premium',
      type: 'Premium Customer', 
      assistant: '⭐ Individual Assistant',
      description: 'Premium user gets personal assistant with memory'
    },
    {
      email: 'admin@dreamseed.com',
      name: 'Admin User',
      type: 'Admin Staff',
      assistant: '👑 Admin Assistant', 
      description: 'Admin user with business insights and management features'
    }
  ];
  
  profiles.forEach((profile, i) => {
    console.log(`${i+1}. Email: ${profile.email}`);
    console.log(`   Name: ${profile.name}`);
    console.log(`   Type: ${profile.type}`);
    console.log(`   Assistant: ${profile.assistant}`);
    console.log(`   Description: ${profile.description}`);
    console.log('');
  });
  
  console.log('🎤 To test voice interface:');
  console.log('1. Go to your deployed site + /voice-call-enhanced.html');
  console.log('2. Enter one of the emails above');
  console.log('3. Click "Load My Profile"');
  console.log('4. Start voice conversation');
}

createTestUsers().catch(console.error);