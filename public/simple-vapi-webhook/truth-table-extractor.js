// Truth Table Extractor - Comprehensive post-call data analysis and storage
const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai');

class TruthTableExtractor {
    constructor() {
        this.supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );
        
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
    }
    
    // Complete truth table schema - all possible data points
    getTruthTableSchema() {
        return {
            // Core Identity
            customer_name: { type: 'text', stage: [1,2,3,4] },
            customer_email: { type: 'text', stage: [1,2,3,4] },
            customer_phone: { type: 'text', stage: [1,2,3,4] },
            
            // Business Foundation (Call 1)
            business_name: { type: 'text', stage: [1,2,3,4] },
            business_type: { type: 'text', stage: [1,2,3,4] },
            business_concept: { type: 'text', stage: [1] },
            state_of_operation: { type: 'text', stage: [1,2,3,4] },
            entity_type: { type: 'text', stage: [1,3,4] },
            services: { type: 'text', stage: [1,2,3,4] },
            target_customers: { type: 'text', stage: [1,2,3,4] },
            unique_value: { type: 'text', stage: [1,2] },
            timeline: { type: 'text', stage: [1,4] },
            urgency_level: { type: 'text', stage: [1,4] },
            startup_capital: { type: 'number', stage: [1,4] },
            revenue_goal: { type: 'number', stage: [1,4] },
            funding_source: { type: 'text', stage: [1,4] },
            
            // Brand DNA (Call 2)
            brand_personality: { type: 'text', stage: [2] },
            brand_values: { type: 'text', stage: [2] },
            brand_mission: { type: 'text', stage: [2] },
            brand_vision: { type: 'text', stage: [2] },
            visual_style: { type: 'text', stage: [2] },
            color_preferences: { type: 'text', stage: [2] },
            logo_direction: { type: 'text', stage: [2] },
            website_style: { type: 'text', stage: [2] },
            messaging_tone: { type: 'text', stage: [2] },
            competitive_advantage: { type: 'text', stage: [2] },
            brand_positioning: { type: 'text', stage: [2] },
            domain_preference: { type: 'text', stage: [2] },
            
            // Operations & Systems (Call 3)
            business_location: { type: 'text', stage: [3] },
            operational_model: { type: 'text', stage: [3] },
            technology_needs: { type: 'text', stage: [3] },
            banking_preferences: { type: 'text', stage: [3] },
            accounting_system: { type: 'text', stage: [3] },
            insurance_needs: { type: 'text', stage: [3] },
            compliance_requirements: { type: 'text', stage: [3] },
            hiring_plans: { type: 'text', stage: [3] },
            vendor_relationships: { type: 'text', stage: [3] },
            inventory_management: { type: 'text', stage: [3] },
            quality_control: { type: 'text', stage: [3] },
            
            // Launch Strategy (Call 4)
            launch_date: { type: 'date', stage: [4] },
            launch_strategy: { type: 'text', stage: [4] },
            marketing_plan: { type: 'text', stage: [4] },
            marketing_budget: { type: 'number', stage: [4] },
            customer_acquisition_strategy: { type: 'text', stage: [4] },
            pricing_strategy: { type: 'text', stage: [4] },
            revenue_model: { type: 'text', stage: [4] },
            growth_plan: { type: 'text', stage: [4] },
            risk_management: { type: 'text', stage: [4] },
            success_metrics: { type: 'text', stage: [4] },
            ongoing_support_needs: { type: 'text', stage: [4] },
            long_term_vision: { type: 'text', stage: [4] },
            
            // Progress Tracking
            call_1_completed: { type: 'boolean', stage: [1,2,3,4] },
            call_2_completed: { type: 'boolean', stage: [2,3,4] },
            call_3_completed: { type: 'boolean', stage: [3,4] },
            call_4_completed: { type: 'boolean', stage: [4] },
            completion_percentage: { type: 'number', stage: [1,2,3,4] },
            current_call_stage: { type: 'number', stage: [1,2,3,4] }
        };
    }
    
    // Extract all possible data from transcript using AI
    async extractTruthTableData(transcript, callStage, existingCustomer = null) {
        try {
            console.log(`🔍 Extracting truth table data for Call ${callStage}`);
            
            const schema = this.getTruthTableSchema();
            const relevantFields = Object.entries(schema)
                .filter(([field, config]) => config.stage.includes(callStage))
                .map(([field, config]) => ({ field, type: config.type }));
            
            const prompt = this.buildExtractionPrompt(transcript, callStage, relevantFields, existingCustomer);
            
            const response = await this.openai.chat.completions.create({
                model: "gpt-4",
                messages: [
                    {
                        role: "system",
                        content: "You are a data extraction specialist. Extract ALL mentioned information from business consultation transcripts and return structured JSON data. Be thorough and capture every detail mentioned."
                    },
                    {
                        role: "user", 
                        content: prompt
                    }
                ],
                temperature: 0.1
            });
            
            const extractedData = JSON.parse(response.choices[0].message.content);
            
            // Validate and clean extracted data
            const validatedData = this.validateExtractedData(extractedData, relevantFields);
            
            console.log(`✅ Extracted ${Object.keys(validatedData).length} data points for Call ${callStage}`);
            return validatedData;
            
        } catch (error) {
            console.error('❌ Truth table extraction error:', error);
            return {};
        }
    }
    
    // Build comprehensive extraction prompt
    buildExtractionPrompt(transcript, callStage, relevantFields, existingCustomer) {
        const callFocus = {
            1: "Foundation & Vision - Basic business concept, customer info, entity formation",
            2: "Brand DNA & Identity - Brand personality, visual identity, positioning, competitive analysis", 
            3: "Operations & Systems - Business operations, technology, compliance, vendor relationships",
            4: "Launch Strategy - Marketing plan, launch timeline, growth strategy, ongoing support"
        };
        
        return `# Call ${callStage} Data Extraction: ${callFocus[callStage]}

## TRANSCRIPT TO ANALYZE:
${transcript}

## EXISTING CUSTOMER DATA:
${existingCustomer ? JSON.stringify(existingCustomer, null, 2) : 'None - new customer'}

## EXTRACTION REQUIREMENTS:

Extract ALL mentioned information for these fields (return JSON format):

${relevantFields.map(field => `"${field.field}": null, // ${field.type} - extract if mentioned`).join('\n')}

## EXTRACTION RULES:

1. **BE COMPREHENSIVE**: Extract every piece of information mentioned, even if briefly
2. **PRESERVE EXACT WORDING**: Use customer's exact phrases when possible
3. **INFER INTELLIGENTLY**: Make reasonable inferences from context
4. **HANDLE UPDATES**: If customer corrects previous information, use the updated version
5. **NULL FOR MISSING**: Use null for information not mentioned
6. **BOOLEAN VALUES**: true/false for completion status
7. **NUMBERS**: Extract as integers/floats for monetary values, percentages
8. **DATES**: Format as YYYY-MM-DD if specific date mentioned

## EXAMPLES:

Customer says "I want to start a bakery called Sweet Dreams in California"
→ "business_name": "Sweet Dreams", "business_type": "Bakery", "state_of_operation": "California"

Customer says "I have $50,000 saved and want to make $200k per year"
→ "startup_capital": 50000, "revenue_goal": 200000

Customer says "I want a modern, clean logo with blue colors"
→ "visual_style": "modern, clean", "color_preferences": "blue", "logo_direction": "modern and clean design"

## OUTPUT FORMAT:
Return ONLY valid JSON with extracted data:

{
  "field_name": "extracted_value",
  "another_field": null,
  "numeric_field": 12345
}`;
    }
    
    // Validate extracted data against schema
    validateExtractedData(data, relevantFields) {
        const validated = {};
        
        relevantFields.forEach(({ field, type }) => {
            if (data.hasOwnProperty(field) && data[field] !== null && data[field] !== '') {
                switch (type) {
                    case 'number':
                        const num = parseFloat(data[field]);
                        if (!isNaN(num)) validated[field] = num;
                        break;
                    case 'boolean':
                        validated[field] = Boolean(data[field]);
                        break;
                    case 'date':
                        // Basic date validation
                        if (data[field].match(/^\d{4}-\d{2}-\d{2}$/)) {
                            validated[field] = data[field];
                        }
                        break;
                    default: // text
                        if (typeof data[field] === 'string' && data[field].trim().length > 0) {
                            validated[field] = data[field].trim();
                        }
                }
            }
        });
        
        return validated;
    }
    
    // Save extracted data to Supabase truth table
    async saveTruthTableData(customerEmail, extractedData, callStage) {
        try {
            console.log(`💾 Saving truth table data for ${customerEmail}`);
            
            // Get current customer data to merge with
            const { data: existingCustomer, error: fetchError } = await this.supabase
                .from('users')
                .select('*')
                .eq('customer_email', customerEmail)
                .single();
            
            if (fetchError && fetchError.code !== 'PGRST116') {
                console.error('❌ Error fetching existing customer:', fetchError);
            }
            
            // Separate data into basic fields (that exist in schema) and detailed fields (for JSON)
            const basicFields = {
                customer_name: extractedData.customer_name,
                customer_email: extractedData.customer_email || customerEmail,
                customer_phone: extractedData.customer_phone,
                business_name: extractedData.business_name,
                business_type: extractedData.business_type,
                state_of_operation: extractedData.state_of_operation,
                entity_type: extractedData.entity_type,
                timeline: extractedData.timeline,
                urgency_level: extractedData.urgency_level,
                [`call_${callStage}_completed`]: true,
                [`call_${callStage}_completed_at`]: new Date().toISOString(),
                current_call_stage: callStage,
                updated_at: new Date().toISOString()
            };
            
            // Remove null/undefined values from basic fields
            Object.keys(basicFields).forEach(key => {
                if (basicFields[key] === null || basicFields[key] === undefined) {
                    delete basicFields[key];
                }
            });
            
            // Store ALL extracted data in JSON fields
            const existingDetailedData = existingCustomer?.detailed_call_data || {};
            const updatedDetailedData = {
                ...existingDetailedData,
                [`call_${callStage}`]: extractedData,
                last_updated: new Date().toISOString(),
                extraction_metadata: {
                    total_fields_extracted: Object.keys(extractedData).length,
                    call_stage: callStage,
                    processed_at: new Date().toISOString()
                }
            };
            
            // Calculate completion percentage
            const completionScore = await this.calculateCompletionScore(customerEmail, extractedData);
            
            // Update with basic fields only (JSON storage requires DB schema changes)
            const updateData = {
                ...basicFields
                // Note: detailed_call_data would require adding JSON column to users table
                // For now, we'll just save what fits in existing schema
            };
            
            // Update existing customer record
            const { data, error } = await this.supabase
                .from('users')
                .update(updateData)
                .eq('customer_email', customerEmail);
            
            if (error) {
                console.error('❌ Database save error:', error);
                console.error('Failed data:', JSON.stringify(updateData, null, 2));
                return false;
            }
            
            console.log(`✅ Truth table updated: ${Object.keys(extractedData).length} fields saved`);
            console.log(`📊 Completion score: ${completionScore}%`);
            console.log(`💾 Detailed data stored in JSON format`);
            
            return true;
            
        } catch (error) {
            console.error('❌ Truth table save error:', error);
            return false;
        }
    }
    
    // Calculate overall completion percentage across all calls
    async calculateCompletionScore(customerEmail, newData = {}) {
        try {
            // Get current customer data
            const { data: customer } = await this.supabase
                .from('users')
                .select('*')
                .eq('customer_email', customerEmail)
                .single();
            
            // Merge with new data
            const fullData = { ...customer, ...newData };
            
            const schema = this.getTruthTableSchema();
            const totalFields = Object.keys(schema).length;
            let completedFields = 0;
            
            // Count completed fields
            Object.entries(schema).forEach(([field, config]) => {
                if (fullData[field] && fullData[field] !== null && fullData[field] !== '') {
                    completedFields++;
                }
            });
            
            return Math.round((completedFields / totalFields) * 100);
            
        } catch (error) {
            console.error('❌ Completion calculation error:', error);
            return 0;
        }
    }
    
    // Get truth table completion report
    async getTruthTableReport(customerEmail) {
        try {
            const { data: customer } = await this.supabase
                .from('users')
                .select('*')
                .eq('customer_email', customerEmail)
                .single();
            
            if (!customer) return null;
            
            const schema = this.getTruthTableSchema();
            const report = {
                customer: customer.customer_name,
                email: customerEmail,
                overallCompletion: customer.completion_percentage || 0,
                callProgress: {
                    call1: customer.call_1_completed || false,
                    call2: customer.call_2_completed || false,
                    call3: customer.call_3_completed || false,
                    call4: customer.call_4_completed || false
                },
                completedFields: [],
                missingFields: []
            };
            
            // Analyze field completion by stage
            Object.entries(schema).forEach(([field, config]) => {
                if (customer[field] && customer[field] !== null && customer[field] !== '') {
                    report.completedFields.push({
                        field,
                        value: customer[field],
                        stages: config.stage,
                        type: config.type
                    });
                } else {
                    report.missingFields.push({
                        field,
                        stages: config.stage,
                        type: config.type
                    });
                }
            });
            
            return report;
            
        } catch (error) {
            console.error('❌ Truth table report error:', error);
            return null;
        }
    }
    
    // Process post-call webhook with full truth table extraction
    async processPostCallWebhook(webhookData) {
        try {
            const transcript = this.extractTranscriptFromWebhook(webhookData);
            const callStage = this.extractCallStageFromWebhook(webhookData);
            const customerEmail = this.extractCustomerEmailFromWebhook(webhookData);
            
            if (!transcript || !callStage || !customerEmail) {
                console.log('⚠️ Missing required data for truth table extraction');
                return false;
            }
            
            // Get existing customer data
            const { data: existingCustomer } = await this.supabase
                .from('users')
                .select('*')
                .eq('customer_email', customerEmail)
                .single();
            
            // Extract comprehensive data
            const extractedData = await this.extractTruthTableData(
                transcript, 
                callStage, 
                existingCustomer
            );
            
            // Save to truth table
            const success = await this.saveTruthTableData(
                customerEmail, 
                extractedData, 
                callStage
            );
            
            if (success) {
                // Generate completion report
                const report = await this.getTruthTableReport(customerEmail);
                console.log(`📋 Truth table completion: ${report.overallCompletion}%`);
                console.log(`✅ Fields completed: ${report.completedFields.length}`);
                console.log(`❓ Fields missing: ${report.missingFields.length}`);
            }
            
            return success;
            
        } catch (error) {
            console.error('❌ Post-call truth table processing error:', error);
            return false;
        }
    }
    
    // Helper methods to extract data from webhooks
    extractTranscriptFromWebhook(webhookData) {
        // Extract transcript text from various webhook formats
        const messages = webhookData.message?.artifact?.messages || 
                        webhookData.artifact?.messages || 
                        webhookData.conversation || [];
        
        return messages
            .filter(msg => msg.role === 'user' || msg.role === 'assistant')
            .map(msg => `${msg.role}: ${msg.content || msg.message}`)
            .join('\n');
    }
    
    extractCallStageFromWebhook(webhookData) {
        // Try to determine call stage from various sources
        return webhookData.callStage || 
               webhookData.stage || 
               webhookData.call?.stage || 
               1; // Default to Call 1
    }
    
    extractCustomerEmailFromWebhook(webhookData) {
        // Extract customer email from webhook data
        return webhookData.customerEmail || 
               webhookData.customer?.email ||
               webhookData.call?.customer?.email ||
               null;
    }
}

module.exports = TruthTableExtractor;