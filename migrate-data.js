import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  'https://kxldodhrhqbwyvgyuqfd.supabase.co',
  'sb_secret_GsVwx89kbQsB6LukLj7qdA_MUcB6-ZU'
);

async function migrateData() {
  console.log('🔄 Starting data migration from business_formations to users...\n');
  
  try {
    // Step 1: Get all data from business_formations
    console.log('📊 Reading existing data from business_formations table...');
    const { data: businessFormations, error: readError } = await supabase
      .from('business_formations')
      .select('*')
      .order('created_at');
    
    if (readError) {
      console.error('❌ Error reading business_formations:', readError);
      return;
    }
    
    console.log(`✅ Found ${businessFormations.length} records to migrate\n`);
    
    // Step 2: Transform and migrate each record
    let migratedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    
    for (const record of businessFormations) {
      console.log(`🔄 Processing: ${record.customer_name || 'Unknown'} (${record.id})`);
      
      try {
        // Transform business_formations data to users table format
        const userData = {
          customer_name: record.customer_name,
          customer_email: record.customer_email,
          customer_phone: record.customer_phone,
          business_name: record.business_name,
          business_type: record.business_type,
          state_of_operation: record.state_of_operation,
          entity_type: record.entity_type || 'LLC',
          status: record.status || 'in_progress',
          current_call_stage: record.call_stage || 1,
          package_preference: record.package_preference,
          urgency_level: record.urgency_level,
          timeline: record.timeline,
          assistant_id: record.assistant_id,
          created_at: record.created_at,
          updated_at: record.updated_at || new Date().toISOString()
        };
        
        // Set call completion flags based on call_stage
        if (record.call_stage) {
          userData[`call_${record.call_stage}_completed`] = true;
          userData[`call_${record.call_stage}_completed_at`] = record.created_at;
        }
        
        // Remove null/undefined values
        Object.keys(userData).forEach(key => {
          if (userData[key] === null || userData[key] === undefined) {
            delete userData[key];
          }
        });
        
        // Check if user already exists (by phone or email)
        let existingUser = null;
        
        if (record.customer_phone) {
          const { data: phoneUser } = await supabase
            .from('users')
            .select('*')
            .eq('customer_phone', record.customer_phone)
            .single();
          existingUser = phoneUser;
        }
        
        if (!existingUser && record.customer_email) {
          const { data: emailUser } = await supabase
            .from('users')
            .select('*')
            .eq('customer_email', record.customer_email)
            .single();
          existingUser = emailUser;
        }
        
        if (existingUser) {
          // Update existing user with additional data
          const { data: updatedUser, error: updateError } = await supabase
            .from('users')
            .update(userData)
            .eq('id', existingUser.id)
            .select()
            .single();
          
          if (updateError) {
            console.error(`❌ Error updating user ${existingUser.id}:`, updateError.message);
            skippedCount++;
            continue;
          }
          
          console.log(`✅ Updated existing user: ${updatedUser.id}`);
          updatedCount++;
        } else {
          // Create new user
          const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert([userData])
            .select()
            .single();
          
          if (insertError) {
            console.error(`❌ Error creating user for ${record.customer_name}:`, insertError.message);
            skippedCount++;
            continue;
          }
          
          console.log(`✅ Created new user: ${newUser.id}`);
          migratedCount++;
        }
        
      } catch (recordError) {
        console.error(`❌ Error processing record ${record.id}:`, recordError.message);
        skippedCount++;
      }
    }
    
    // Step 3: Summary
    console.log('\n' + '='.repeat(60));
    console.log('🎉 DATA MIGRATION COMPLETE!');
    console.log('='.repeat(60));
    console.log(`📊 Migration Summary:`);
    console.log(`   • Total Records Processed: ${businessFormations.length}`);
    console.log(`   • New Users Created: ${migratedCount}`);
    console.log(`   • Existing Users Updated: ${updatedCount}`);
    console.log(`   • Records Skipped: ${skippedCount}`);
    console.log('');
    
    if (migratedCount + updatedCount > 0) {
      console.log('✅ Migration successful! Your data is now in the users table.');
      console.log('💡 Next steps:');
      console.log('   1. Verify data in Supabase dashboard');
      console.log('   2. Test new calls to ensure they save properly');
      console.log('   3. Consider archiving business_formations table');
    }
    
    // Step 4: Show sample of migrated data
    console.log('\n📋 Sample of migrated users:');
    const { data: sampleUsers } = await supabase
      .from('users')
      .select('customer_name, customer_email, business_name, current_call_stage')
      .limit(5);
    
    sampleUsers?.forEach(user => {
      console.log(`   • ${user.customer_name || 'Unknown'} - ${user.business_name || 'No business'} (Stage ${user.current_call_stage})`);
    });
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

// Run migration
migrateData();