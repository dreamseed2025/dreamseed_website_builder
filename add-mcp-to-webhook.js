// Add MCP function handling to the existing webhook server
// This allows the webhook to handle both webhooks AND MCP function calls

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  'https://kxldodhrhqbwyvgyuqfd.supabase.co',
  'sb_secret_GsVwx89kbQsB6LukLj7qdA_MUcB6-ZU'
);

// Add these routes to your existing server.js file

// MCP Function: extract_and_save_business_data
app.post('/extract_and_save_business_data', async (req, res) => {
    try {
        const { conversation_text, call_stage, customer_phone } = req.body;
        
        console.log('🔧 MCP Function called: extract_and_save_business_data');
        console.log('📞 Phone:', customer_phone);
        console.log('📝 Stage:', call_stage);
        
        // Extract data from conversation
        const extractedData = extractDataFromText(conversation_text, call_stage);
        
        if (customer_phone) {
            extractedData.customer_phone = customer_phone;
        }
        
        extractedData.assistant_id = '5ef9abf6-66b4-4457-9848-ee5436d6191f';
        extractedData.call_stage = call_stage;
        extractedData[`call_${call_stage}_completed_at`] = new Date().toISOString();
        extractedData[`call_${call_stage}_transcript`] = conversation_text;
        
        // Save to Supabase
        const { data, error } = await supabase
            .from('business_formations')
            .upsert([extractedData], {
                onConflict: 'customer_phone',
                ignoreDuplicates: false
            })
            .select()
            .single();
        
        if (error) {
            console.error('❌ Supabase error:', error);
            throw error;
        }
        
        console.log('✅ Data saved to Supabase:', data.id);
        
        res.json({
            success: true,
            message: `Business data extracted and saved for call stage ${call_stage}`,
            record_id: data.id,
            customer: extractedData.customer_name
        });
        
    } catch (error) {
        console.error('❌ MCP Function error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// MCP Function: validate_business_name
app.post('/validate_business_name', async (req, res) => {
    try {
        const { business_name, state } = req.body;
        
        console.log('🔧 MCP Function called: validate_business_name');
        console.log('🏢 Name:', business_name);
        console.log('🗺️ State:', state);
        
        // Basic validation
        const hasLLCSuffix = /\b(LLC|L\.L\.C\.|Limited Liability Company)\b/i.test(business_name);
        const isValid = hasLLCSuffix && business_name.length <= 120;
        
        res.json({
            success: true,
            valid: isValid,
            business_name: business_name,
            state: state,
            issues: hasLLCSuffix ? [] : ["Name should include 'LLC' or 'Limited Liability Company'"],
            suggestions: hasLLCSuffix ? [] : [`${business_name} LLC`]
        });
        
    } catch (error) {
        console.error('❌ Validation error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// MCP Function: calculate_formation_costs
app.post('/calculate_formation_costs', async (req, res) => {
    try {
        const { state, entity_type = 'LLC', package_type = 'Launch Basic' } = req.body;
        
        console.log('🔧 MCP Function called: calculate_formation_costs');
        console.log('🗺️ State:', state);
        console.log('📦 Package:', package_type);
        
        const stateFees = {
            'California': { filing: 70, annual: 20 },
            'Delaware': { filing: 90, annual: 300 },
            'Texas': { filing: 300, annual: 0 },
            'Florida': { filing: 125, annual: 138.75 },
            'New York': { filing: 200, annual: 9 }
        };
        
        const packageCosts = {
            'Launch Basic': 999,
            'Launch Pro': 1799,
            'Launch Complete': 3499
        };
        
        const stateInfo = stateFees[state] || { filing: 200, annual: 50 };
        const serviceFee = packageCosts[package_type] || 999;
        const total = stateInfo.filing + stateInfo.annual + serviceFee;
        
        res.json({
            success: true,
            state: state,
            entity_type: entity_type,
            package_type: package_type,
            state_filing_fee: stateInfo.filing,
            annual_fee: stateInfo.annual,
            service_fee: serviceFee,
            total_cost: total
        });
        
    } catch (error) {
        console.error('❌ Cost calculation error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Enhanced data extraction function
function extractDataFromText(text, callStage) {
    const data = {
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };
    
    // Extract customer info
    const nameMatch = text.match(/(?:my name is|i'm|i am)\s+([A-Z][a-z]+\s+[A-Z][a-z]+)/i);
    if (nameMatch) data.customer_name = nameMatch[1];
    
    const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    if (emailMatch) data.customer_email = emailMatch[1];
    
    const phoneMatch = text.match(/(\d{3}[\s\-]?\d{3}[\s\-]?\d{4})/);
    if (phoneMatch) data.customer_phone = '+1' + phoneMatch[1].replace(/[\s\-]/g, '');
    
    // Extract business info
    const businessMatch = text.match(/(?:business|company|startup|venture|called|named)\s+([A-Z][a-z\s]+)/i);
    if (businessMatch) data.business_name = businessMatch[1].trim();
    
    const stateMatch = text.match(/\b(California|Florida|Texas|Tennessee|New York|Delaware)\b/i);
    if (stateMatch) data.state_of_operation = stateMatch[1];
    
    data.entity_type = 'LLC'; // default
    data.status = 'in_progress';
    
    return data;
}

console.log('🔧 MCP Functions added to webhook server!');
console.log('📝 Available endpoints:');
console.log('   POST /extract_and_save_business_data');
console.log('   POST /validate_business_name'); 
console.log('   POST /calculate_formation_costs');