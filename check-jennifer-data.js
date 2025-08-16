import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://kxldodhrhqbwyvgyuqfd.supabase.co',
  'sb_secret_GsVwx89kbQsB6LukLj7qdA_MUcB6-ZU'
);

async function checkJenniferData() {
  console.log('🔍 Searching for Jennifer Martinez data...\n');
  
  try {
    const { data, error } = await supabase
      .from('business_formations')
      .select('*')
      .ilike('customer_name', '%jennifer%')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.log('❌ Error:', error.message);
      return;
    }
    
    console.log(`📊 Found ${data.length} Jennifer record(s):`);
    
    data.forEach((record, index) => {
      console.log(`\n${index + 1}. Record ID: ${record.id}`);
      console.log(`   • Name: ${record.customer_name || 'N/A'}`);
      console.log(`   • Email: ${record.customer_email || 'N/A'}`);
      console.log(`   • Phone: ${record.customer_phone || 'N/A'}`);
      console.log(`   • Business: ${record.business_name || 'N/A'}`);
      console.log(`   • State: ${record.state_of_operation || 'N/A'}`);
      console.log(`   • Created: ${record.created_at}`);
    });
    
    if (data.length === 0) {
      console.log('❌ No Jennifer data found - function call may not have worked');
    } else {
      console.log('\n✅ Jennifer data found!');
    }
    
  } catch (error) {
    console.error('❌ Error checking data:', error.message);
  }
}

checkJenniferData();