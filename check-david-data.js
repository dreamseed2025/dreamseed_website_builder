import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://kxldodhrhqbwyvgyuqfd.supabase.co',
  'sb_secret_GsVwx89kbQsB6LukLj7qdA_MUcB6-ZU'
);

async function checkDavidData() {
  console.log('🔍 Searching for David Rodriguez data...\n');
  
  try {
    // Search by name
    const { data: nameData, error: nameError } = await supabase
      .from('business_formations')
      .select('*')
      .ilike('customer_name', '%david%')
      .order('created_at', { ascending: false });
    
    // Search by email
    const { data: emailData, error: emailError } = await supabase
      .from('business_formations')
      .select('*')
      .ilike('customer_email', '%cleanenergy%')
      .order('created_at', { ascending: false });
    
    // Search by business name
    const { data: businessData, error: businessError } = await supabase
      .from('business_formations')
      .select('*')
      .ilike('business_name', '%clean energy%')
      .order('created_at', { ascending: false });
    
    console.log('📊 Search Results:');
    console.log('By name "David":', nameData?.length || 0, 'records');
    console.log('By email "cleanenergy":', emailData?.length || 0, 'records');
    console.log('By business "clean energy":', businessData?.length || 0, 'records');
    
    const allResults = [...(nameData || []), ...(emailData || []), ...(businessData || [])];
    const uniqueResults = allResults.filter((record, index, self) => 
      index === self.findIndex(r => r.id === record.id)
    );
    
    if (uniqueResults.length > 0) {
      console.log('\n✅ Found David Rodriguez records:');
      uniqueResults.forEach((record, index) => {
        console.log(`\n${index + 1}. Record ID: ${record.id}`);
        console.log(`   • Name: ${record.customer_name || 'N/A'}`);
        console.log(`   • Email: ${record.customer_email || 'N/A'}`);
        console.log(`   • Phone: ${record.customer_phone || 'N/A'}`);
        console.log(`   • Business: ${record.business_name || 'N/A'}`);
        console.log(`   • State: ${record.state_of_operation || 'N/A'}`);
        console.log(`   • Created: ${record.created_at}`);
      });
    } else {
      console.log('\n❌ No David Rodriguez data found in database');
      console.log('💡 The function call may have failed or gone elsewhere');
    }
    
  } catch (error) {
    console.error('❌ Error searching data:', error.message);
  }
}

checkDavidData();