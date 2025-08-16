#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
// Load environment variables
config();
// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL || 'https://plmmudazcsiksgmgphte.supabase.co', process.env.SUPABASE_SERVICE_ROLE_KEY || '', {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});
// State requirements data
const STATE_REQUIREMENTS = {
    "California": {
        filing_fee: 70,
        processing_time: "10-15 business days",
        requirements: ["Operating Agreement", "Articles of Organization", "Statement of Information"],
        annual_fee: 20,
        franchise_tax: 800
    },
    "Delaware": {
        filing_fee: 90,
        processing_time: "7-10 business days",
        requirements: ["Certificate of Formation", "Operating Agreement"],
        annual_fee: 300,
        franchise_tax: 300
    },
    "Texas": {
        filing_fee: 300,
        processing_time: "5-7 business days",
        requirements: ["Certificate of Formation", "Operating Agreement"],
        annual_fee: 0,
        franchise_tax: 0
    },
    "Florida": {
        filing_fee: 125,
        processing_time: "5-7 business days",
        requirements: ["Articles of Organization", "Operating Agreement"],
        annual_fee: 138.75,
        franchise_tax: 0
    },
    "New York": {
        filing_fee: 200,
        processing_time: "7-10 business days",
        requirements: ["Articles of Organization", "Operating Agreement", "Publication Requirement"],
        annual_fee: 9,
        franchise_tax: 25
    }
};
// Create MCP server
const server = new Server({
    name: "business-formation-server",
    version: "1.0.0",
}, {
    capabilities: {
        tools: {},
    },
});
// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "extract_and_save_business_data",
                description: "Extract business formation data from conversation text and save to database",
                inputSchema: {
                    type: "object",
                    properties: {
                        conversation_text: {
                            type: "string",
                            description: "The conversation text to extract data from"
                        },
                        call_stage: {
                            type: "number",
                            description: "Which call stage this is (1-4)",
                            enum: [1, 2, 3, 4]
                        },
                        customer_phone: {
                            type: "string",
                            description: "Customer phone number for identification"
                        }
                    },
                    required: ["conversation_text", "call_stage"]
                }
            },
            {
                name: "get_customer_progress",
                description: "Get customer's business formation progress",
                inputSchema: {
                    type: "object",
                    properties: {
                        customer_phone: {
                            type: "string",
                            description: "Customer phone number"
                        },
                        customer_email: {
                            type: "string",
                            description: "Customer email address"
                        }
                    }
                }
            },
            {
                name: "get_state_requirements",
                description: "Get LLC formation requirements for a specific state",
                inputSchema: {
                    type: "object",
                    properties: {
                        state: {
                            type: "string",
                            description: "State name (e.g., California, Delaware, Texas)"
                        }
                    },
                    required: ["state"]
                }
            },
            {
                name: "validate_business_name",
                description: "Check if business name is valid and available for the state",
                inputSchema: {
                    type: "object",
                    properties: {
                        business_name: {
                            type: "string",
                            description: "Proposed business name"
                        },
                        state: {
                            type: "string",
                            description: "State for formation"
                        }
                    },
                    required: ["business_name", "state"]
                }
            },
            {
                name: "calculate_formation_costs",
                description: "Calculate total costs for business formation in a specific state",
                inputSchema: {
                    type: "object",
                    properties: {
                        state: {
                            type: "string",
                            description: "State for formation"
                        },
                        entity_type: {
                            type: "string",
                            description: "Type of entity (LLC, Corporation, etc.)",
                            default: "LLC"
                        },
                        package_type: {
                            type: "string",
                            description: "Service package level",
                            enum: ["Launch Basic", "Launch Pro", "Launch Complete"],
                            default: "Launch Basic"
                        }
                    },
                    required: ["state"]
                }
            },
            {
                name: "get_formation_analytics",
                description: "Get analytics on business formations",
                inputSchema: {
                    type: "object",
                    properties: {
                        metric_type: {
                            type: "string",
                            enum: ["overview", "by_state", "by_package", "conversion_funnel"],
                            description: "Type of analytics to retrieve"
                        },
                        date_range: {
                            type: "string",
                            description: "Date range for analytics (e.g., '30_days', '3_months')",
                            default: "30_days"
                        }
                    }
                }
            }
        ]
    };
});
// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        switch (name) {
            case "extract_and_save_business_data":
                return await extractAndSaveBusinessData(args?.conversation_text, args?.call_stage, args?.customer_phone);
            case "get_customer_progress":
                return await getCustomerProgress(args?.customer_phone, args?.customer_email);
            case "get_state_requirements":
                return await getStateRequirements(args?.state);
            case "validate_business_name":
                return await validateBusinessName(args?.business_name, args?.state);
            case "calculate_formation_costs":
                return await calculateFormationCosts(args?.state, args?.entity_type, args?.package_type);
            case "get_formation_analytics":
                return await getFormationAnalytics(args?.metric_type, args?.date_range);
            default:
                return {
                    content: [
                        {
                            type: "text",
                            text: `Unknown tool: ${name}`
                        }
                    ],
                    isError: true
                };
        }
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error: ${error.message}`
                }
            ],
            isError: true
        };
    }
});
// Tool implementations
async function extractAndSaveBusinessData(conversationText, callStage, customerPhone) {
    // Extract data using AI-powered patterns
    const extractedData = extractDataFromText(conversationText, callStage);
    if (customerPhone) {
        extractedData.customer_phone = customerPhone;
    }
    // Save to Supabase
    const { data, error } = await supabase
        .from('business_formations')
        .upsert([extractedData], {
        onConflict: 'customer_phone',
        ignoreDuplicates: false
    })
        .select()
        .single();
    if (error)
        throw error;
    return {
        content: [
            {
                type: "text",
                text: `✅ Business data extracted and saved for call stage ${callStage}!\n\nExtracted:\n${JSON.stringify(extractedData, null, 2)}\n\nRecord ID: ${data.id}`
            }
        ]
    };
}
async function getCustomerProgress(customerPhone, customerEmail) {
    let query = supabase.from('business_formations').select('*');
    if (customerPhone) {
        query = query.eq('customer_phone', customerPhone);
    }
    else if (customerEmail) {
        query = query.eq('customer_email', customerEmail);
    }
    else {
        throw new Error('Either customer_phone or customer_email is required');
    }
    const { data, error } = await query.single();
    if (error && error.code !== 'PGRST116')
        throw error;
    if (!data) {
        return {
            content: [
                {
                    type: "text",
                    text: "No business formation record found for this customer. This appears to be a new customer."
                }
            ]
        };
    }
    const progress = calculateProgress(data);
    return {
        content: [
            {
                type: "text",
                text: `📊 Customer Progress for ${data.customer_name || 'Customer'}:\n\n` +
                    `Business: ${data.business_name || 'TBD'}\n` +
                    `State: ${data.state_of_operation || 'TBD'}\n` +
                    `Entity Type: ${data.entity_type || 'TBD'}\n\n` +
                    `Progress: ${progress.percentage}% complete\n` +
                    `Completed Calls: ${progress.completedCalls.join(', ')}\n` +
                    `Next Step: ${progress.nextStep}`
            }
        ]
    };
}
async function getStateRequirements(state) {
    const requirements = STATE_REQUIREMENTS[state];
    if (!requirements) {
        return {
            content: [
                {
                    type: "text",
                    text: `State requirements not available for ${state}. Available states: ${Object.keys(STATE_REQUIREMENTS).join(', ')}`
                }
            ]
        };
    }
    return {
        content: [
            {
                type: "text",
                text: `📋 ${state} LLC Formation Requirements:\n\n` +
                    `Filing Fee: $${requirements.filing_fee}\n` +
                    `Processing Time: ${requirements.processing_time}\n` +
                    `Annual Fee: $${requirements.annual_fee}\n` +
                    `Franchise Tax: $${requirements.franchise_tax}\n\n` +
                    `Required Documents:\n${requirements.requirements.map((req) => `• ${req}`).join('\n')}`
            }
        ]
    };
}
async function validateBusinessName(businessName, state) {
    // Basic validation rules
    const validationResults = {
        isValid: true,
        issues: [],
        suggestions: []
    };
    // Check for required suffixes
    const hasLLCSuffix = /\b(LLC|L\.L\.C\.|Limited Liability Company)\b/i.test(businessName);
    if (!hasLLCSuffix) {
        validationResults.issues.push("LLC name must include 'LLC', 'L.L.C.', or 'Limited Liability Company'");
        validationResults.suggestions.push(`${businessName} LLC`);
    }
    // Check for restricted words
    const restrictedWords = ['Bank', 'Insurance', 'Trust', 'Corporation', 'Corp', 'Inc'];
    for (const word of restrictedWords) {
        if (new RegExp(`\\b${word}\\b`, 'i').test(businessName)) {
            validationResults.issues.push(`'${word}' may require special licensing or be restricted`);
            validationResults.isValid = false;
        }
    }
    // Check length
    if (businessName.length > 120) {
        validationResults.issues.push("Business name should be under 120 characters");
        validationResults.isValid = false;
    }
    if (validationResults.issues.length > 0) {
        validationResults.isValid = false;
    }
    return {
        content: [
            {
                type: "text",
                text: `🔍 Business Name Validation for "${businessName}" in ${state}:\n\n` +
                    `Status: ${validationResults.isValid ? '✅ Valid' : '❌ Issues Found'}\n\n` +
                    (validationResults.issues.length > 0 ?
                        `Issues:\n${validationResults.issues.map(issue => `• ${issue}`).join('\n')}\n\n` : '') +
                    (validationResults.suggestions.length > 0 ?
                        `Suggestions:\n${validationResults.suggestions.map(sug => `• ${sug}`).join('\n')}` : '')
            }
        ]
    };
}
async function calculateFormationCosts(state, entityType = 'LLC', packageType = 'Launch Basic') {
    const stateReqs = STATE_REQUIREMENTS[state];
    if (!stateReqs) {
        throw new Error(`State requirements not available for ${state}`);
    }
    const packageCosts = {
        'Launch Basic': 999,
        'Launch Pro': 1799,
        'Launch Complete': 3499
    };
    const stateFees = stateReqs.filing_fee + stateReqs.annual_fee;
    const serviceFee = packageCosts[packageType] || packageCosts['Launch Basic'];
    const total = stateFees + serviceFee;
    return {
        content: [
            {
                type: "text",
                text: `💰 ${entityType} Formation Costs in ${state} (${packageType}):\n\n` +
                    `State Filing Fee: $${stateReqs.filing_fee}\n` +
                    `Annual State Fee: $${stateReqs.annual_fee}\n` +
                    `Service Package: $${serviceFee}\n` +
                    `─────────────────\n` +
                    `Total Cost: $${total}\n\n` +
                    `Processing Time: ${stateReqs.processing_time}\n` +
                    `Franchise Tax: $${stateReqs.franchise_tax} (annual)`
            }
        ]
    };
}
async function getFormationAnalytics(metricType = 'overview', dateRange = '30_days') {
    const daysBack = dateRange === '30_days' ? 30 : dateRange === '3_months' ? 90 : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);
    try {
        switch (metricType) {
            case 'overview':
                const { data: overview } = await supabase
                    .from('business_formations')
                    .select('*')
                    .gte('created_at', startDate.toISOString());
                const totalFormations = overview?.length || 0;
                const completedFormations = overview?.filter(f => f.status === 'completed').length || 0;
                const states = [...new Set(overview?.map((f) => f.state_of_operation).filter(Boolean))];
                return {
                    content: [
                        {
                            type: "text",
                            text: `📊 Formation Analytics (${dateRange}):\n\n` +
                                `Total Formations: ${totalFormations}\n` +
                                `Completed: ${completedFormations}\n` +
                                `Completion Rate: ${totalFormations > 0 ? Math.round(completedFormations / totalFormations * 100) : 0}%\n` +
                                `Active States: ${states.length}\n` +
                                `Top States: ${states.slice(0, 3).join(', ')}`
                        }
                    ]
                };
            default:
                return {
                    content: [
                        {
                            type: "text",
                            text: `Analytics type '${metricType}' not implemented yet. Available: overview, by_state, by_package, conversion_funnel`
                        }
                    ]
                };
        }
    }
    catch (error) {
        throw new Error(`Analytics error: ${error.message}`);
    }
}
// Helper functions
function extractDataFromText(text, callStage) {
    const data = {
        [`call_${callStage}_completed_at`]: new Date().toISOString(),
        [`call_${callStage}_transcript`]: text
    };
    // Extract customer info
    const nameMatch = text.match(/(?:my name is|i'm|i am)\s+([A-Z][a-z]+\s+[A-Z][a-z]+)/i);
    if (nameMatch)
        data.customer_name = nameMatch[1];
    const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    if (emailMatch)
        data.customer_email = emailMatch[1];
    const phoneMatch = text.match(/(\+?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4})/);
    if (phoneMatch)
        data.customer_phone = phoneMatch[1];
    // Extract business info
    const businessMatch = text.match(/(?:business|company|startup|venture)(?:\s+(?:is|called|named))?\s+([^.!?]+)/i);
    if (businessMatch)
        data.business_description = businessMatch[1];
    const stateMatch = text.match(/\b(California|Florida|Texas|Tennessee|New York|Delaware|Alabama|Alaska|Arizona|Arkansas|Colorado|Connecticut|Georgia|Hawaii|Idaho|Illinois|Indiana|Iowa|Kansas|Kentucky|Louisiana|Maine|Maryland|Massachusetts|Michigan|Minnesota|Mississippi|Missouri|Montana|Nebraska|Nevada|New Hampshire|New Jersey|New Mexico|North Carolina|North Dakota|Ohio|Oklahoma|Oregon|Pennsylvania|Rhode Island|South Carolina|South Dakota|Utah|Vermont|Virginia|Washington|West Virginia|Wisconsin|Wyoming)\b/i);
    if (stateMatch)
        data.state_of_operation = stateMatch[1];
    const entityMatch = text.match(/\b(LLC|Limited Liability Company|S-Corp|C-Corp|Corporation)\b/i);
    if (entityMatch)
        data.entity_type = entityMatch[1];
    else
        data.entity_type = 'LLC'; // default
    return data;
}
function calculateProgress(formationData) {
    const completedCalls = [];
    let percentage = 0;
    if (formationData.call_1_completed_at) {
        completedCalls.push('Call 1');
        percentage += 25;
    }
    if (formationData.call_2_completed_at) {
        completedCalls.push('Call 2');
        percentage += 25;
    }
    if (formationData.call_3_completed_at) {
        completedCalls.push('Call 3');
        percentage += 25;
    }
    if (formationData.call_4_completed_at) {
        completedCalls.push('Call 4');
        percentage += 25;
    }
    const nextStep = completedCalls.length === 0 ? 'Call 1: Business Concept Discovery' :
        completedCalls.length === 1 ? 'Call 2: Legal Formation Planning' :
            completedCalls.length === 2 ? 'Call 3: Banking & Operations Setup' :
                completedCalls.length === 3 ? 'Call 4: Website & Marketing Planning' :
                    'Formation Complete!';
    return { completedCalls, percentage, nextStep };
}
// Start the server
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Business Formation MCP Server running on stdio");
}
main().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
});
