import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://kxldodhrhqbwyvgyuqfd.supabase.co',
  'sb_secret_GsVwx89kbQsB6LukLj7qdA_MUcB6-ZU'
);

async function checkVeryRecentData() {
  console.log('🔍 Checking for data in last 3 minutes...\n');
  
  const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000).toISOString();
  
  try {
    const { data, error } = await supabase
      .from('business_formations')
      .select('*')
      .gte('created_at', threeMinutesAgo)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.log('❌ Error:', error.message);
      return;
    }
    
    console.log(`📊 Found ${data.length} very recent record(s):`);
    
    data.forEach((record, index) => {
      console.log(`\n${index + 1}. Record ID: ${record.id}`);
      console.log(`   • Name: ${record.customer_name || 'N/A'}`);
      console.log(`   • Email: ${record.customer_email || 'N/A'}`);
      console.log(`   • Phone: ${record.customer_phone || 'N/A'}`);
      console.log(`   • Business: ${record.business_name || 'N/A'}`);
      console.log(`   • State: ${record.state_of_operation || 'N/A'}`);
      console.log(`   • Created: ${record.created_at}`);
      if (record.call_1_transcript) {
        console.log(`   • Transcript snippet: ${record.call_1_transcript.substring(0, 150)}...`);
      }
    });
    
    if (data.length === 0) {
      console.log('❌ No new data from the recent call');
      console.log('💡 The MCP function was still not triggered automatically');
    }
    
  } catch (error) {
    console.error('❌ Error checking data:', error.message);
  }
}

checkVeryRecentData();