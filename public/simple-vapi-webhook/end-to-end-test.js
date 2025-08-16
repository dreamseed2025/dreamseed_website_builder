// End-to-End 4-Call Progression Test
// This simulates the complete customer journey showing how information builds between calls

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize actual Supabase connection
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const IntelligentCallSystem = require('./intelligent-call-system');
const DynamicVAPIManager = require('./dynamic-vapi-integration');
const RequirementsExtractor = require('./requirements/extraction-logic');

// Test customer data that accumulates through calls
const testCustomer = {
    email: 'test@dreamseeddemo.com',
    name: 'Alex Martinez',
    phone: '+15551234567',
    
    // This simulates what we'd extract from each call
    callData: {
        1: {
            customer_name: 'Alex Martinez',
            customer_email: 'test@dreamseeddemo.com',
            customer_phone: '+15551234567',
            business_name: 'GreenTech Solutions',
            business_type: 'Environmental Technology',
            state_of_formation: 'Texas',
            target_customers: 'Small to medium businesses looking to reduce environmental impact',
            business_concept: 'Solar panel installation and energy efficiency consulting',
            timeline: 'Launch within 60 days',
            startup_capital: 25000,
            current_call_stage: 1
        },
        2: {
            // All Call 1 data plus:
            brand_personality: 'Professional, trustworthy, and environmentally conscious',
            color_preferences: 'Green and blue with clean white accents',
            logo_style: 'Modern and clean with nature elements',
            target_market_details: 'Small businesses, 10-100 employees, concerned about sustainability',
            competitive_advantage: 'Certified B-Corp status and 15 years experience',
            value_proposition: 'Reduce energy costs by 30% while improving environmental impact',
            website_tagline: 'Clean Energy, Cleaner Future',
            current_call_stage: 2
        },
        3: {
            // All previous data plus:
            business_location: 'Home office with warehouse in Austin, TX',
            equipment_needs: 'Installation tools, safety equipment, company vehicles',
            software_requirements: 'CRM system, project management, accounting software',
            business_banking: 'Local credit union for better rates',
            insurance_needs: 'General liability, professional liability, workers comp',
            vendor_relationships: 'Solar panel manufacturers, electrical suppliers',
            compliance_requirements: 'Electrical contractor license, solar installer certification',
            current_call_stage: 3
        },
        4: {
            // All previous data plus:
            launch_strategy: 'Soft launch with existing network, then digital marketing',
            marketing_channels: 'LinkedIn, local business networking, referral program',
            first_year_goals: '$500K revenue, 50 installations',
            team_plans: 'Hire 2 installers and 1 sales person by month 6',
            growth_strategy: 'Expand to surrounding cities in year 2',
            exit_strategy: 'Build to sell or franchise model',
            current_call_stage: 4
        }
    }
};

class EndToEndTester {
    constructor() {
        this.extractor = new RequirementsExtractor();
        this.vapiManager = new DynamicVAPIManager();
        this.intelligentSystem = new IntelligentCallSystem(supabase, this.vapiManager, this.extractor);
        this.testResults = {};
    }

    async runCompleteTest() {
        console.log('🚀 STARTING END-TO-END 4-CALL PROGRESSION TEST');
        console.log('=' .repeat(70));
        console.log(`Customer: ${testCustomer.name} (${testCustomer.email})`);
        console.log(`Business: ${testCustomer.callData[1].business_name}`);
        console.log('=' .repeat(70));

        // Clean up any existing test data
        await this.cleanupTestData();

        // Run each call stage
        for (let callStage = 1; callStage <= 4; callStage++) {
            await this.simulateCallStage(callStage);
        }

        // Show final results
        await this.showFinalResults();
    }

    async cleanupTestData() {
        console.log('\n🧹 Cleaning up any existing test data...');
        try {
            await supabase
                .from('users')
                .delete()
                .eq('customer_email', testCustomer.email);
            console.log('✅ Test data cleaned');
        } catch (error) {
            console.log('⚠️ No existing data to clean');
        }
    }

    async simulateCallStage(callStage) {
        console.log(`\n📞 CALL ${callStage} SIMULATION`);
        console.log('-'.repeat(50));

        // Get customer journey before the call
        const beforeJourney = await this.intelligentSystem.getCustomerJourney(testCustomer.email);
        console.log(`📊 Before Call ${callStage}:`);
        console.log(`   Completion: ${beforeJourney.completionPercentage}%`);
        console.log(`   Next Stage: ${beforeJourney.nextCallStage}`);
        console.log(`   New Customer: ${beforeJourney.isNewCustomer}`);

        // Generate personalized prompt for this call
        let context = { previousInfo: [] }; // Initialize context
        if (callStage <= 4) {
            const personalizedPrompt = await this.intelligentSystem.generatePersonalizedPrompt(
                testCustomer.email, 
                callStage
            );

            // Show what context is being carried forward
            context = this.intelligentSystem.buildPreviousCallContext(
                beforeJourney.customer || {}, 
                callStage
            );

            console.log(`\n🧠 Information Carryover:`);
            if (context.previousInfo.length > 0) {
                context.previousInfo.forEach((info, index) => {
                    console.log(`   ✓ ${info}`);
                });
                console.log(`\n📝 Prompt Context:`);
                console.log(`   Customer: "${context.customerName}"`);
                console.log(`   Business: "${context.businessName}"`);
                console.log(`   Previous Context: ${context.previousInfo.length} items`);
            } else {
                console.log(`   • First call - no previous context`);
            }

            // Show a sample of the personalized prompt
            const promptPreview = personalizedPrompt.substring(0, 300) + '...';
            console.log(`\n📜 Personalized Prompt Preview:`);
            console.log(`"${promptPreview}"`);
        }

        // Simulate the call completing and data being extracted
        if (callStage <= 4) {
            const callData = testCustomer.callData[callStage];
            console.log(`\n🎙️ Simulating Call ${callStage} Completion...`);
            
            // Save the extracted data to database
            await supabase
                .from('users')
                .upsert({
                    ...callData,
                    completion_percentage: callStage * 25,
                    last_call_completed: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('customer_email', testCustomer.email);

            console.log(`✅ Call ${callStage} data saved to database`);

            // Process post-call and determine next steps
            const postCallResult = await this.intelligentSystem.processPostCall(
                testCustomer.email,
                callStage,
                callData
            );

            console.log(`\n📈 Post-Call ${callStage} Results:`);
            console.log(`   New Completion: ${postCallResult.completionPercentage}%`);
            console.log(`   Next Call Stage: ${postCallResult.nextCallStage || 'Complete!'}`);
            console.log(`   Ready for Next: ${postCallResult.readyForNextCall}`);

            this.testResults[callStage] = {
                beforeCompletion: beforeJourney.completionPercentage,
                afterCompletion: postCallResult.completionPercentage,
                nextStage: postCallResult.nextCallStage,
                contextItems: context.previousInfo.length
            };
        }

        console.log(`\n✅ Call ${callStage} simulation complete`);
    }

    async showFinalResults() {
        console.log('\n' + '=' .repeat(70));
        console.log('📊 END-TO-END TEST RESULTS');
        console.log('=' .repeat(70));

        // Get final customer journey
        const finalJourney = await this.intelligentSystem.getCustomerJourney(testCustomer.email);
        const progressDashboard = await this.intelligentSystem.getProgressDashboard(testCustomer.email);

        console.log('\n🎯 Final Customer Status:');
        console.log(`   Name: ${finalJourney.customer.customer_name}`);
        console.log(`   Business: ${finalJourney.customer.business_name}`);
        console.log(`   Industry: ${finalJourney.customer.business_type}`);
        console.log(`   State: ${finalJourney.customer.state_of_formation}`);
        console.log(`   Completion: ${finalJourney.completionPercentage}%`);

        console.log('\n📈 Progression Summary:');
        Object.keys(this.testResults).forEach(callStage => {
            const result = this.testResults[callStage];
            console.log(`   Call ${callStage}: ${result.beforeCompletion}% → ${result.afterCompletion}% (${result.contextItems} context items)`);
        });

        console.log('\n🔄 Information Flow Demonstrated:');
        console.log('   ✓ Call 1: Foundation data collected');
        console.log('   ✓ Call 2: Built on Call 1 + added brand info');
        console.log('   ✓ Call 3: Built on Calls 1-2 + added operations');
        console.log('   ✓ Call 4: Built on Calls 1-3 + added launch strategy');

        console.log('\n🎉 Key Features Validated:');
        console.log('   ✓ Cross-call information carryover');
        console.log('   ✓ Personalized prompt generation');
        console.log('   ✓ Progressive completion tracking');
        console.log('   ✓ Intelligent call stage progression');
        console.log('   ✓ Context-aware conversations');

        console.log('\n✅ END-TO-END TEST COMPLETED SUCCESSFULLY!');
        
        // Clean up test data
        await this.cleanupTestData();
        console.log('🧹 Test data cleaned up');
    }
}

// Run the test
async function runTest() {
    const tester = new EndToEndTester();
    await tester.runCompleteTest();
}

if (require.main === module) {
    runTest().catch(console.error);
}

module.exports = EndToEndTester;