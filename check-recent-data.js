import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://kxldodhrhqbwyvgyuqfd.supabase.co',
  'sb_secret_GsVwx89kbQsB6LukLj7qdA_MUcB6-ZU'
);

async function checkRecentData() {
  console.log('🔍 Checking for recent data in last 10 minutes...\n');
  
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  
  try {
    const { data, error } = await supabase
      .from('business_formations')
      .select('*')
      .gte('created_at', tenMinutesAgo)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.log('❌ Error:', error.message);
      return;
    }
    
    console.log(`📊 Found ${data.length} recent record(s):`);
    
    data.forEach((record, index) => {
      console.log(`\n${index + 1}. Record ID: ${record.id}`);
      console.log(`   • Name: ${record.customer_name || 'N/A'}`);
      console.log(`   • Email: ${record.customer_email || 'N/A'}`);
      console.log(`   • Phone: ${record.customer_phone || 'N/A'}`);
      console.log(`   • Business: ${record.business_name || 'N/A'}`);
      console.log(`   • State: ${record.state_of_operation || 'N/A'}`);
      console.log(`   • Created: ${record.created_at}`);
      if (record.call_1_transcript) {
        console.log(`   • Transcript: ${record.call_1_transcript.substring(0, 100)}...`);
      }
    });
    
    if (data.length === 0) {
      console.log('❌ No data was saved from the recent call');
      console.log('💡 This suggests the MCP function was not triggered');
    }
    
  } catch (error) {
    console.error('❌ Error checking data:', error.message);
  }
}

checkRecentData();