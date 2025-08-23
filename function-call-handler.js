import express from 'express';
import { createClient } from '@supabase/supabase-js';
import BusinessLaunchChecklist from './business-launch-checklist.js';

const supabase = createClient(
  'https://kxldodhrhqbwyvgyuqfd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4bGRvZGhyaHFid3l2Z3l1cWZkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTEyMDA3OCwiZXhwIjoyMDcwNjk2MDc4fQ.ByC7SLkJ2zeyhDN0nyWUNw-otETetisbjKM1sSCfS2Q'
);

const app = express();
app.use(express.json());

const checklist = new BusinessLaunchChecklist();

// Function call handler
app.post('/api/function-calls', async (req, res) => {
  try {
    const { message } = req.body;
    const functionCall = message.functionCall;
    
    console.log(`📞 Function call: ${functionCall.name}`);
    console.log(`📋 Parameters:`, functionCall.parameters);
    
    let result;
    
    switch (functionCall.name) {
      case 'get_customer_data':
        result = await getCustomerData(functionCall.parameters.phone);
        break;
        
      case 'update_customer_data':
        result = await updateCustomerData(
          functionCall.parameters.phone, 
          functionCall.parameters.data
        );
        break;
        
      default:
        result = { error: 'Unknown function' };
    }
    
    res.json({
      result: result
    });
    
  } catch (error) {
    console.error('Function call error:', error);
    res.json({
      result: { error: error.message }
    });
  }
});

async function getCustomerData(phone) {
  try {
    // Get customer from database
    const { data: customer, error } = await supabase
      .from('users')
      .select('*')
      .eq('customer_phone', phone)
      .single();
    
    if (error || !customer) {
      return {
        isNew: true,
        stage: 1,
        completionPercentage: 0,
        message: "New customer - starting fresh"
      };
    }
    
    // Get completion analysis
    const completion = await checklist.calculateCompletionPercentage(phone);
    
    // Determine stage
    const stage = determineStage(customer);
    
    // Format existing data
    const existingData = {};
    Object.keys(customer).forEach(key => {
      if (customer[key] && 
          customer[key] !== 'Not extracted' && 
          !['id', 'created_at', 'updated_at'].includes(key)) {
        existingData[key] = customer[key];
      }
    });
    
    return {
      stage: stage,
      completionPercentage: completion.completionPercentage,
      completedItems: completion.completedItems,
      totalItems: completion.totalItems,
      existingData: existingData,
      readiness: completion.readiness,
      message: `Customer is ${completion.completionPercentage}% complete (${completion.completedItems}/${completion.totalItems} items)`
    };
    
  } catch (error) {
    return { error: error.message };
  }
}

async function updateCustomerData(phone, newData) {
  try {
    // Update customer record
    const { error } = await supabase
      .from('users')
      .upsert({
        customer_phone: phone,
        ...newData,
        updated_at: new Date().toISOString()
      });
    
    if (error) {
      return { error: error.message };
    }
    
    // Get updated completion
    const completion = await checklist.calculateCompletionPercentage(phone);
    
    return {
      success: true,
      newCompletionPercentage: completion.completionPercentage,
      completedItems: completion.completedItems,
      message: `Updated! Now ${completion.completionPercentage}% complete`
    };
    
  } catch (error) {
    return { error: error.message };
  }
}

function determineStage(customer) {
  if (!customer.call_1_completed) return 1;
  if (!customer.call_2_completed) return 2;
  if (!customer.call_3_completed) return 3;
  if (!customer.call_4_completed) return 4;
  return 4;
}

export default app;