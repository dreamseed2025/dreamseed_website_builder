import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://kxldodhrhqbwyvgyuqfd.supabase.co',
  'sb_secret_GsVwx89kbQsB6LukLj7qdA_MUcB6-ZU'
);

async function checkSarahData() {
  console.log('🔍 Checking for Sarah Johnson\'s data...\n');
  
  try {
    // Check for the specific record ID from the logs
    const { data: specificRecord, error: specificError } = await supabase
      .from('business_formations')
      .select('*')
      .eq('id', '19173fac-720c-4f17-9d5e-89e927395c51')
      .single();
    
    if (specificError) {
      console.log('❌ Could not find specific record:', specificError.message);
    } else {
      console.log('✅ Found record!');
      console.log('📋 Record details:');
      console.log('   • ID:', specificRecord.id);
      console.log('   • Name:', specificRecord.customer_name);
      console.log('   • Email:', specificRecord.customer_email);
      console.log('   • Phone:', specificRecord.customer_phone);
      console.log('   • Business:', specificRecord.business_name);
      console.log('   • State:', specificRecord.state_of_operation);
      console.log('   • Created:', specificRecord.created_at);
      console.log('   • Call Stage:', specificRecord.call_stage);
      console.log('\n📝 Transcript saved:');
      console.log('   ', specificRecord.call_1_transcript || 'No transcript found');
    }
    
    // Also check by phone number
    const { data: allRecords, error: allError } = await supabase
      .from('business_formations')
      .select('*')
      .eq('customer_phone', '+16198510666');
    
    if (allError) {
      console.log('\n❌ Could not search by phone:', allError.message);
    } else {
      console.log(`\n📞 Found ${allRecords.length} record(s) for phone +16198510666`);
      if (allRecords.length > 0) {
        console.log('   Latest record:');
        const latest = allRecords[allRecords.length - 1];
        console.log('   • Name:', latest.customer_name);
        console.log('   • Business:', latest.business_name);
        console.log('   • State:', latest.state_of_operation);
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking data:', error.message);
  }
}

checkSarahData();