// Simple Demo: How 4 Calls Build on Each Other
// This shows the exact flow you'll experience with the intelligent system

const DynamicVAPIManager = require('./dynamic-vapi-integration');
const RequirementsExtractor = require('./requirements/extraction-logic');

// Mock customer data that accumulates through the 4 calls
const customerJourney = {
    email: 'demo@example.com',
    
    // What we know after each call
    afterCall1: {
        customer_name: 'Sarah Johnson',
        business_name: 'Johnson Consulting',
        business_type: 'Professional Services',
        state_of_formation: 'California',
        target_customers: 'Small business owners'
    },
    
    afterCall2: {
        customer_name: 'Sarah Johnson',
        business_name: 'Johnson Consulting', 
        business_type: 'Professional Services',
        state_of_formation: 'California',
        target_customers: 'Small business owners',
        brand_personality: 'Professional and approachable',
        color_preferences: 'Blue and white',
        competitive_advantage: '20 years experience'
    },
    
    afterCall3: {
        customer_name: 'Sarah Johnson',
        business_name: 'Johnson Consulting',
        business_type: 'Professional Services', 
        state_of_formation: 'California',
        target_customers: 'Small business owners',
        brand_personality: 'Professional and approachable',
        color_preferences: 'Blue and white',
        competitive_advantage: '20 years experience',
        business_location: 'Home office, San Francisco',
        startup_budget: '$10,000',
        equipment_needs: 'Laptop, phone system'
    }
};

async function demonstrateCallProgression() {
    console.log('🎯 INTELLIGENT 4-CALL SYSTEM DEMONSTRATION');
    console.log('=' .repeat(60));
    console.log('Customer: Sarah Johnson (Johnson Consulting)');
    console.log('=' .repeat(60));
    
    const vapiManager = new DynamicVAPIManager();
    const extractor = new RequirementsExtractor();
    
    // Mock intelligent system methods
    const mockIntelligentSystem = {
        buildPreviousCallContext: (customerData, callStage) => {
            const context = {
                customerName: customerData.customer_name || 'the customer',
                businessName: customerData.business_name || 'their business', 
                previousInfo: []
            };
            
            if (callStage >= 2 && customerData.business_name) {
                context.previousInfo.push(`business name: ${customerData.business_name}`);
            }
            if (callStage >= 2 && customerData.state_of_formation) {
                context.previousInfo.push(`state of formation: ${customerData.state_of_formation}`);
            }
            if (callStage >= 2 && customerData.business_type) {
                context.previousInfo.push(`industry: ${customerData.business_type}`);
            }
            if (callStage >= 3 && customerData.brand_personality) {
                context.previousInfo.push(`brand personality: ${customerData.brand_personality}`);
            }
            if (callStage >= 3 && customerData.color_preferences) {
                context.previousInfo.push(`brand colors: ${customerData.color_preferences}`);
            }
            if (callStage >= 4 && customerData.business_location) {
                context.previousInfo.push(`business location: ${customerData.business_location}`);
            }
            
            return context;
        },
        
        generateContextHeader: (context) => {
            if (context.previousInfo.length === 0) return '';
            
            let header = `\\n**PREVIOUS CALL INFORMATION:**\\n`;
            header += `You are continuing the conversation with ${context.customerName}`;
            if (context.businessName !== 'their business') {
                header += ` about ${context.businessName}`;
            }
            header += `. Here's what you already know:\\n`;
            
            context.previousInfo.forEach(info => {
                header += `- ${info}\\n`;
            });
            
            header += `\\n**IMPORTANT:** Reference previous conversations naturally. Don't re-ask questions you already have answers to.\\n`;
            return header;
        }
    };
    
    // Demonstrate each call stage
    for (let callStage = 1; callStage <= 4; callStage++) {
        console.log(`\\n📞 CALL ${callStage} DEMONSTRATION`);
        console.log('-'.repeat(40));
        
        // Get customer data up to this point
        let customerData = {};
        if (callStage >= 2) customerData = customerJourney.afterCall1;
        if (callStage >= 3) customerData = customerJourney.afterCall2;
        if (callStage >= 4) customerData = customerJourney.afterCall3;
        
        // Show what context carries forward
        const context = mockIntelligentSystem.buildPreviousCallContext(customerData, callStage);
        
        console.log(`🧠 Information Available:`);
        if (context.previousInfo.length > 0) {
            context.previousInfo.forEach((info, index) => {
                console.log(`   ✓ ${info}`);
            });
        } else {
            console.log(`   • First call - starting fresh`);
        }
        
        // Show how the prompt gets personalized
        const basePrompt = vapiManager.callPrompts[callStage];
        const contextHeader = mockIntelligentSystem.generateContextHeader(context);
        
        console.log(`\\n📝 Prompt Personalization:`);
        console.log(`   Base prompt: ${basePrompt.length} characters`);
        console.log(`   Context added: ${contextHeader.length} characters`);
        
        if (contextHeader.length > 0) {
            console.log(`\\n🎨 Context Header Example:`);
            console.log(`"${contextHeader.substring(0, 200)}..."`);
        }
        
        // Show completion progression
        const completion = callStage * 25;
        console.log(`\\n📊 After Call ${callStage}:`);
        console.log(`   Completion: ${completion}%`);
        console.log(`   Next Stage: ${callStage < 4 ? callStage + 1 : 'Complete!'}`);
        
        // Show what new information this call collects
        console.log(`\\n🆕 New Information Collected:`);
        switch(callStage) {
            case 1:
                console.log(`   • Basic business info, contact details`);
                console.log(`   • Business concept and target market`);
                console.log(`   • LLC filing requirements`);
                break;
            case 2:
                console.log(`   • Brand personality and visual preferences`);
                console.log(`   • Logo requirements and color direction`);
                console.log(`   • Competitive positioning`);
                break;
            case 3:
                console.log(`   • Operations and compliance requirements`);
                console.log(`   • Financial planning and banking needs`);
                console.log(`   • Technology and equipment requirements`);
                break;
            case 4:
                console.log(`   • Launch strategy and marketing plan`);
                console.log(`   • Professional support team needs`);
                console.log(`   • Growth and exit strategy`);
                break;
        }
    }
    
    console.log(`\\n` + '=' .repeat(60));
    console.log('✅ 4-CALL PROGRESSION DEMONSTRATION COMPLETE');
    console.log('=' .repeat(60));
    
    console.log(`\\n🎯 Key Benefits Demonstrated:`);
    console.log(`✓ Natural conversation flow between calls`);
    console.log(`✓ No repeated questions from previous calls`);
    console.log(`✓ Context builds progressively: 0 → 3 → 5 → 6 items`);
    console.log(`✓ Personalized prompts reference customer & business`);
    console.log(`✓ Systematic 25% → 50% → 75% → 100% progression`);
    
    console.log(`\\n🚀 How This Works in Practice:`);
    console.log(`1. Call 1: "Hi Sarah! Let's start with your business idea..."`);
    console.log(`2. Call 2: "Hi Sarah! Let's build on Johnson Consulting's brand..."`);
    console.log(`3. Call 3: "Hi Sarah! Now let's plan Johnson Consulting's operations..."`);
    console.log(`4. Call 4: "Hi Sarah! Time to finalize Johnson Consulting's launch..."`);
    
    console.log(`\\n💡 Instead of 4 separate agents, you have:`);
    console.log(`   🎯 1 intelligent agent that adapts per call`);
    console.log(`   🧠 Smart context from all previous conversations`);
    console.log(`   📈 Progressive information building`);
    console.log(`   🎨 Personalized prompts for each stage`);
}

demonstrateCallProgression().catch(console.error);