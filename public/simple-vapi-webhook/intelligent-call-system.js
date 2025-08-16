// Intelligent 4-Call Progression System
// Handles information carryover, smart scheduling, and personalized prompts

class IntelligentCallSystem {
    constructor(supabase, vapiManager, extractor) {
        this.supabase = supabase;
        this.vapi = vapiManager;
        this.extractor = extractor;
    }
    
    // Get customer's complete journey so far
    async getCustomerJourney(customerEmail) {
        try {
            const { data: customer, error } = await this.supabase
                .from('users')
                .select('*')
                .eq('customer_email', customerEmail)
                .single();
            
            if (error || !customer) {
                return {
                    isNewCustomer: true,
                    completionPercentage: 0,
                    nextCallStage: 1,
                    collectedInfo: {},
                    missingInfo: [],
                    callHistory: []
                };
            }
            
            // Calculate completion percentage
            const validation = this.extractor.validateExtractedData(customer, customer.current_call_stage || 1);
            const missingInfo = this.extractor.generateMissingInfoReport(customer, customer.current_call_stage || 1);
            
            // Get call history
            const callHistory = await this.getCallHistory(customerEmail);
            
            return {
                isNewCustomer: false,
                customer: customer,
                completionPercentage: validation.completionScore,
                nextCallStage: this.determineNextCallStage(validation.completionScore),
                collectedInfo: customer,
                missingInfo: missingInfo.nextQuestions,
                callHistory: callHistory,
                readyForNextCall: missingInfo.readyForNextCall
            };
            
        } catch (error) {
            console.error('Error getting customer journey:', error);
            throw error;
        }
    }
    
    // Get customer's call history
    async getCallHistory(customerEmail) {
        try {
            // This would come from call logs/monitoring data
            // For now, return basic structure
            return [
                // { callStage: 1, date: '2024-01-01', duration: 900, completionScore: 25 }
            ];
        } catch (error) {
            console.error('Error getting call history:', error);
            return [];
        }
    }
    
    // Determine next call stage based on completion
    determineNextCallStage(completionPercentage) {
        if (completionPercentage < 25) return 1;
        if (completionPercentage < 50) return 2;
        if (completionPercentage < 75) return 3;
        if (completionPercentage < 100) return 4;
        return null; // All calls complete
    }
    
    // Generate personalized prompt for next call
    async generatePersonalizedPrompt(customerEmail, targetCallStage) {
        try {
            const journey = await this.getCustomerJourney(customerEmail);
            const basePrompt = this.vapi.callPrompts[targetCallStage];
            
            if (journey.isNewCustomer) {
                return this.vapi.customizePrompt(basePrompt, {});
            }
            
            // Create context from previous calls
            const previousContext = this.buildPreviousCallContext(journey.collectedInfo, targetCallStage);
            const personalizedPrompt = this.injectPreviousContext(basePrompt, previousContext);
            
            return this.vapi.customizePrompt(personalizedPrompt, journey.collectedInfo);
            
        } catch (error) {
            console.error('Error generating personalized prompt:', error);
            throw error;
        }
    }
    
    // Build context from previous calls
    buildPreviousCallContext(customerData, currentStage) {
        const context = {
            customerName: customerData.customer_name || 'the customer',
            businessName: customerData.business_name || 'their business',
            previousInfo: [],
            gaps: []
        };
        
        // Add known information based on stage
        if (currentStage >= 2 && customerData.business_name) {
            context.previousInfo.push(`business name: ${customerData.business_name}`);
        }
        
        if (currentStage >= 2 && customerData.state_of_formation) {
            context.previousInfo.push(`state of formation: ${customerData.state_of_formation}`);
        }
        
        if (currentStage >= 2 && customerData.business_type) {
            context.previousInfo.push(`industry: ${customerData.business_type}`);
        }
        
        if (currentStage >= 3 && customerData.target_customers) {
            context.previousInfo.push(`target customers: ${customerData.target_customers}`);
        }
        
        if (currentStage >= 3 && customerData.brand_personality) {
            context.previousInfo.push(`brand personality: ${customerData.brand_personality}`);
        }
        
        if (currentStage >= 4 && customerData.business_location) {
            context.previousInfo.push(`business location: ${customerData.business_location}`);
        }
        
        return context;
    }
    
    // Inject previous call context into prompt
    injectPreviousContext(basePrompt, context) {
        const contextHeader = this.generateContextHeader(context);
        
        // Insert context after the opening but before the main conversation flow
        const sections = basePrompt.split('## CONVERSATION FLOW');
        if (sections.length === 2) {
            return sections[0] + contextHeader + '\\n\\n## CONVERSATION FLOW' + sections[1];
        }
        
        // Fallback: add context at the beginning
        return contextHeader + '\\n\\n' + basePrompt;
    }
    
    // Generate context header for prompt
    generateContextHeader(context) {
        if (context.previousInfo.length === 0) {
            return '';
        }
        
        let header = `\\n**PREVIOUS CALL INFORMATION:**\\n`;
        header += `You are continuing the conversation with ${context.customerName}`;
        
        if (context.businessName !== 'their business') {
            header += ` about ${context.businessName}`;
        }
        
        header += `. Here's what you already know:\\n`;
        
        context.previousInfo.forEach(info => {
            header += `- ${info}\\n`;
        });
        
        header += `\\n**IMPORTANT:** Acknowledge what you already know and build on it. Don't re-ask questions you already have answers to. Reference previous conversations naturally.\\n`;
        
        return header;
    }
    
    // Start intelligent call (determines stage and personalizes)
    async startIntelligentCall(customerEmail, customerData = {}) {
        try {
            console.log(`🧠 Starting intelligent call assessment for ${customerEmail}`);
            
            // Get customer journey
            const journey = await this.getCustomerJourney(customerEmail);
            
            if (journey.nextCallStage === null) {
                throw new Error('Customer has completed all 4 calls');
            }
            
            console.log(`📊 Customer completion: ${journey.completionPercentage}%`);
            console.log(`🎯 Next call stage: ${journey.nextCallStage}`);
            
            // Generate personalized prompt
            const personalizedPrompt = await this.generatePersonalizedPrompt(customerEmail, journey.nextCallStage);
            
            // Update VAPI agent with personalized prompt
            await this.vapi.updateAgentWithCustomPrompt(journey.nextCallStage, personalizedPrompt, customerData);
            
            // Start the call
            const callResult = await this.vapi.startCallWithStage(journey.nextCallStage, {
                ...customerData,
                email: customerEmail,
                previousCallStage: journey.nextCallStage - 1,
                completionPercentage: journey.completionPercentage
            });
            
            // Update customer record
            await this.supabase
                .from('users')
                .upsert({
                    customer_email: customerEmail,
                    customer_name: customerData.name || journey.customer?.customer_name,
                    current_call_stage: journey.nextCallStage,
                    last_call_initiated: new Date().toISOString(),
                    completion_percentage: journey.completionPercentage
                })
                .eq('customer_email', customerEmail);
            
            return {
                success: true,
                callStage: journey.nextCallStage,
                completionPercentage: journey.completionPercentage,
                callResult: callResult,
                journey: journey
            };
            
        } catch (error) {
            console.error('❌ Intelligent call start error:', error);
            throw error;
        }
    }
    
    // Process post-call and determine next steps
    async processPostCall(customerEmail, callStage, extractedData) {
        try {
            console.log(`📝 Processing post-call data for ${customerEmail}, Call ${callStage}`);
            
            // Save extracted data
            await this.supabase
                .from('users')
                .upsert({
                    ...extractedData,
                    customer_email: customerEmail,
                    current_call_stage: callStage,
                    last_call_completed: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('customer_email', customerEmail);
            
            // Get updated journey
            const journey = await this.getCustomerJourney(customerEmail);
            
            // Determine if ready for next call
            const readyForNext = journey.readyForNextCall && journey.nextCallStage <= 4;
            
            // Schedule next call if ready
            let nextCallScheduled = null;
            if (readyForNext && journey.nextCallStage <= 4) {
                nextCallScheduled = await this.scheduleNextCall(customerEmail, journey.nextCallStage);
            }
            
            return {
                success: true,
                completionPercentage: journey.completionPercentage,
                nextCallStage: journey.nextCallStage,
                readyForNextCall: readyForNext,
                nextCallScheduled: nextCallScheduled,
                missingInfo: journey.missingInfo
            };
            
        } catch (error) {
            console.error('❌ Post-call processing error:', error);
            throw error;
        }
    }
    
    // Schedule next call (could integrate with calendar system)
    async scheduleNextCall(customerEmail, nextStage) {
        try {
            // For now, just return suggested timing
            const stageTiming = {
                2: '3-5 days after Call 1',
                3: '1 week after Call 2', 
                4: '1-2 weeks after Call 3'
            };
            
            return {
                suggestedTiming: stageTiming[nextStage],
                nextStage: nextStage,
                customerEmail: customerEmail,
                autoSchedule: false // Could be enabled later
            };
            
        } catch (error) {
            console.error('❌ Next call scheduling error:', error);
            return null;
        }
    }
    
    // Get customer progress dashboard data
    async getProgressDashboard(customerEmail) {
        try {
            const journey = await this.getCustomerJourney(customerEmail);
            
            return {
                customer: journey.customer,
                completionPercentage: journey.completionPercentage,
                currentStage: journey.nextCallStage || 'Complete',
                callsCompleted: (journey.nextCallStage || 5) - 1,
                callsRemaining: journey.nextCallStage ? 5 - journey.nextCallStage : 0,
                readyForNextCall: journey.readyForNextCall,
                missingInfo: journey.missingInfo,
                callHistory: journey.callHistory,
                stageBreakdown: {
                    stage1: journey.completionPercentage >= 25 ? 'Complete' : 'Pending',
                    stage2: journey.completionPercentage >= 50 ? 'Complete' : 'Pending',
                    stage3: journey.completionPercentage >= 75 ? 'Complete' : 'Pending',
                    stage4: journey.completionPercentage >= 100 ? 'Complete' : 'Pending'
                }
            };
            
        } catch (error) {
            console.error('❌ Progress dashboard error:', error);
            throw error;
        }
    }
}

module.exports = IntelligentCallSystem;