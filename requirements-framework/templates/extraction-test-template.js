// DreamSeed Requirements Framework - Extraction Test Template
// This file provides test templates for validating AI extraction functionality

const testTranscripts = {
    call1_sample: `
        Hi Sarah, thanks for calling DreamSeed. I'm excited to help you start your business! 
        
        So tell me, what's the business idea you want to pursue?
        
        Well, I want to start a consulting business helping small restaurants improve their operations and profitability. I've been working in restaurant management for 15 years and I see so many places struggling with inefficient processes.
        
        That sounds like a great opportunity! What would you like to call this business?
        
        I'm thinking "Restaurant Success Solutions" or maybe "Culinary Operations Consulting." I like the first one better.
        
        Perfect! And what state are you looking to file your LLC in?
        
        I'm in California, so probably there. Is that the best choice?
        
        We can definitely explore that. Now for contact information - what's the best email and phone number to reach you?
        
        My email is sarah.johnson@email.com and my cell is 555-123-4567.
        
        Great! And what's driving this decision to start your own business now?
        
        Honestly, I'm tired of working for other people and not being able to implement the changes I know would work. I want to help restaurants succeed and build something of my own. I've saved up about $25,000 to get started.
        
        That's a solid foundation! What specific services do you envision offering to these restaurants?
        
        I'd do operational audits, staff training, menu optimization, cost control systems, and ongoing consulting. Basically everything to make them more profitable and efficient.
        
        And who's your ideal client - what size restaurants are you targeting?
        
        Small to medium independent restaurants, maybe 20-100 seats. The family-owned places that don't have dedicated operations managers but really need the help.
    `,
    
    call2_sample: `
        Hi Sarah, great to continue our conversation about Restaurant Success Solutions! 
        
        Let's dive into your brand identity. How would you describe your brand personality?
        
        I want to come across as professional but approachable. Knowledgeable but not intimidating. I want restaurant owners to feel like I understand their struggles and I'm here to help, not judge.
        
        Perfect! When you think about colors that represent your business, what comes to mind?
        
        I'm drawn to warm, earthy tones. Maybe deep greens and warm grays? I want it to feel stable and trustworthy but also fresh and modern. Not too corporate.
        
        Great choices! What about your logo style - are you thinking more text-based or would you like an icon?
        
        I think I'd like an icon with the text. Maybe something that suggests growth or efficiency? Not a literal restaurant icon though.
        
        Who do you see as your main competitors in this space?
        
        There are some big consulting firms that work with restaurant chains, but they're expensive and impersonal. Then there are individual consultants like me, but most focus on just one area like marketing or food costs. I want to be the full-service operations expert for independent restaurants.
        
        What makes you different from those other consultants?
        
        My 15 years of hands-on restaurant management experience. I've actually run the day-to-day operations, dealt with staff issues, managed costs during tough times. Most consultants have theory but I have real-world experience. Plus I focus specifically on independent restaurants, not chains.
        
        How would you describe your services to a potential client?
        
        I help independent restaurants increase profitability and operational efficiency through comprehensive audits, staff training, and ongoing support. I work with owners to identify what's not working and implement practical solutions that actually stick.
        
        What's the main message you want on your website homepage?
        
        Something like "Turn your restaurant passion into sustainable profit" or "Operational excellence for independent restaurants." I want owners to immediately know I understand their challenges and have solutions.
    `,
    
    call3_sample: `
        Hi Sarah! Ready to talk about the operational side of getting Restaurant Success Solutions up and running?
        
        Absolutely! I'm excited to make this real.
        
        Let's start with where you'll operate from. Are you planning a home office or commercial space?
        
        I'll start from home. I have a dedicated office space, and most of my work will be at client locations anyway. I might need a commercial space later if I grow, but home office works for now.
        
        Perfect. Now, are there any professional licenses or permits you need for restaurant consulting in California?
        
        I don't think there are specific licenses for restaurant consulting, but I should double-check. I might want to get some food safety certifications to add credibility.
        
        Good thinking. For your business banking, do you have a preferred bank?
        
        I've been with Chase for personal banking for years, so probably them. They have good business accounts and online tools.
        
        What about accounting software? Any preferences there?
        
        I've heard good things about QuickBooks. I want something that can handle invoicing and expense tracking but isn't overly complicated.
        
        How do you want to handle payments from clients?
        
        Credit cards definitely, probably ACH for larger projects. I'm thinking net 30 payment terms for most work, but maybe 50% upfront for big projects.
        
        What technology do you need to run your business effectively?
        
        I have a good laptop already. I'll need project management software - maybe Asana or Trello. Definitely need a good CRM to track clients and prospects. For the restaurants, I might need some industry-specific audit tools.
        
        Any insurance considerations we should discuss?
        
        Professional liability for sure, since I'm giving business advice. General liability too. I should probably talk to an insurance agent about what consultants typically need.
        
        Do you have professional support lined up - attorney, accountant, that kind of thing?
        
        Not yet. I know I'll need an attorney for contracts and business setup. For accounting, I might start with a bookkeeper and upgrade to a CPA later as I grow.
    `,
    
    call4_sample: `
        Sarah, this is our final call to nail down your launch strategy and long-term plans for Restaurant Success Solutions!
        
        I'm so ready! This feels real now.
        
        When are you hoping to officially launch?
        
        I'd love to launch by October 1st. That gives me time to get everything set up and it's before the busy holiday season when restaurants really need operational help.
        
        Great timeline! What's your customer acquisition strategy?
        
        I want to start with networking - local restaurant association meetings, chamber of commerce events. I'm planning to do some free workshops at industry events to demonstrate my expertise. Social media too, especially LinkedIn for reaching restaurant owners.
        
        What are your revenue goals for the first year?
        
        I'd like to hit $75,000 in the first year. That's conservative but realistic while I'm building my reputation. I'm thinking $150-200 per hour for consulting, or package deals for bigger projects.
        
        How will you measure success with your clients?
        
        Concrete metrics - increased profit margins, reduced food costs, improved staff retention, faster table turns. I want to be able to show real ROI for every engagement.
        
        What about scaling the business - how do you see it growing?
        
        Eventually I might hire other consultants or partner with specialists in areas like marketing or technology. Maybe develop some standardized training programs I can license to other consultants.
        
        Any concerns keeping you up at night about this business?
        
        Finding enough clients initially. Making sure I can deliver results that justify my fees. And managing cash flow - consulting can be feast or famine.
        
        What ongoing support do you think you'll need?
        
        Definitely want to keep learning - maybe join a consultant association, attend industry conferences. I'll need ongoing marketing help and probably a business coach as I scale.
        
        How will you stay current with industry changes?
        
        Restaurant industry publications, trade shows, networking with other restaurant professionals. I want to always be learning about new trends and technologies.
        
        What's your long-term vision - where do you see this in 5 years?
        
        I'd love to have a team of 3-5 consultants covering the whole state. Maybe some proprietary tools or systems that other consultants want to license. Possibly even franchise the model to other markets.
    `
};

const expectedExtractions = {
    call1_expected: {
        customer_id: "test_uuid",
        call_stage: 1,
        completion_percentage: 25,
        contact_info: {
            first_name: "Sarah",
            last_name: "Johnson", 
            email: "sarah.johnson@email.com",
            phone: "555-123-4567"
        },
        llc_filing: {
            business_name: "Restaurant Success Solutions",
            entity_type: "LLC",
            state_of_formation: "CA"
        },
        business_concept: {
            business_idea: "Consulting business helping small restaurants improve operations and profitability",
            target_customers: "Small to medium independent restaurants, 20-100 seats, family-owned",
            services_products: ["Operational audits", "Staff training", "Menu optimization", "Cost control systems", "Ongoing consulting"],
            startup_capital: "$25,000"
        }
    },
    
    call2_expected: {
        call_stage: 2,
        completion_percentage: 50,
        brand_identity: {
            brand_personality: "Professional but approachable, knowledgeable but not intimidating",
            color_preferences: "Deep greens and warm grays, warm earthy tones",
            logo_type_preference: "Icon with text",
            brand_values: ["Professional", "Approachable", "Trustworthy", "Experienced"]
        },
        competitive_positioning: {
            main_competitors: ["Big consulting firms for restaurant chains", "Individual specialized consultants"],
            competitive_advantage: "15 years hands-on restaurant management experience, full-service operations expert for independent restaurants",
            market_differentiation: "Real-world experience vs theory, focus on independent restaurants not chains"
        },
        website_content: {
            hero_message: "Turn your restaurant passion into sustainable profit",
            business_description: "Help independent restaurants increase profitability and operational efficiency through comprehensive audits, staff training, and ongoing support"
        }
    }
};

// Test utility functions
function validateExtraction(actual, expected, callStage) {
    const results = {
        callStage: callStage,
        passed: 0,
        failed: 0,
        missing: [],
        errors: []
    };
    
    function checkField(actualObj, expectedObj, path = '') {
        for (const key in expectedObj) {
            const currentPath = path ? `${path}.${key}` : key;
            
            if (typeof expectedObj[key] === 'object' && !Array.isArray(expectedObj[key])) {
                if (!actualObj[key]) {
                    results.missing.push(currentPath);
                    results.failed++;
                } else {
                    checkField(actualObj[key], expectedObj[key], currentPath);
                }
            } else {
                if (!actualObj[key]) {
                    results.missing.push(currentPath);
                    results.failed++;
                } else if (Array.isArray(expectedObj[key])) {
                    // For arrays, check if at least some expected items are present
                    const actualArray = Array.isArray(actualObj[key]) ? actualObj[key] : [actualObj[key]];
                    const hasExpectedItems = expectedObj[key].some(expectedItem => 
                        actualArray.some(actualItem => 
                            actualItem.toLowerCase().includes(expectedItem.toLowerCase()) ||
                            expectedItem.toLowerCase().includes(actualItem.toLowerCase())
                        )
                    );
                    
                    if (hasExpectedItems) {
                        results.passed++;
                    } else {
                        results.failed++;
                        results.errors.push(`${currentPath}: Expected items not found in ${JSON.stringify(actualArray)}`);
                    }
                } else {
                    // For strings, check if the actual value contains key concepts from expected
                    const actualStr = String(actualObj[key]).toLowerCase();
                    const expectedStr = String(expectedObj[key]).toLowerCase();
                    
                    if (actualStr.includes(expectedStr) || expectedStr.includes(actualStr)) {
                        results.passed++;
                    } else {
                        results.failed++;
                        results.errors.push(`${currentPath}: "${actualObj[key]}" doesn't match expected pattern "${expectedObj[key]}"`);
                    }
                }
            }
        }
    }
    
    checkField(actual, expected);
    
    results.successRate = results.passed / (results.passed + results.failed) * 100;
    return results;
}

function runExtractionTest(extractedData, callStage) {
    const expected = expectedExtractions[`call${callStage}_expected`];
    if (!expected) {
        console.error(`No expected data found for call stage ${callStage}`);
        return null;
    }
    
    const results = validateExtraction(extractedData, expected, callStage);
    
    console.log(`\n=== Call ${callStage} Extraction Test Results ===`);
    console.log(`Success Rate: ${results.successRate.toFixed(1)}%`);
    console.log(`Passed: ${results.passed}`);
    console.log(`Failed: ${results.failed}`);
    
    if (results.missing.length > 0) {
        console.log(`\nMissing Fields:`);
        results.missing.forEach(field => console.log(`  - ${field}`));
    }
    
    if (results.errors.length > 0) {
        console.log(`\nValidation Errors:`);
        results.errors.forEach(error => console.log(`  - ${error}`));
    }
    
    return results;
}

module.exports = {
    testTranscripts,
    expectedExtractions,
    validateExtraction,
    runExtractionTest
};