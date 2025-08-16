// Inbound Call Handler - Smart caller identification and progress continuation
const { createClient } = require('@supabase/supabase-js');
const DynamicVAPIManager = require('./dynamic-vapi-integration');
const RequirementsExtractor = require('./requirements/extraction-logic');

class InboundCallHandler {
    constructor() {
        this.supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );
        
        this.extractor = new RequirementsExtractor();
        this.vapiManager = new DynamicVAPIManager();
    }
    
    // Main inbound call processing
    async handleInboundCall(callData) {
        try {
            // Try multiple possible phone number fields
            const callerNumber = callData.customer?.number || 
                                callData.customer?.phoneNumber || 
                                callData.customer?.phone || 
                                callData.from || 
                                callData.phoneNumber;
            const callId = callData.id || callData.callId;
            
            console.log(`📞 Inbound call received from: ${callerNumber}`);
            console.log(`🆔 Call ID: ${callId}`);
            
            // Step 1: Identify the caller
            const customer = await this.identifyCustomer(callerNumber);
            
            if (customer) {
                // Step 2: Get their current progress
                const progress = await this.getCustomerProgress(customer);
                
                // Step 3: Generate context-aware prompt
                const contextPrompt = await this.generateContextualPrompt(customer, progress);
                
                // Step 4: Update VAPI agent with personalized prompt
                await this.vapiManager.updateAgentWithCustomPrompt(
                    progress.nextStage, 
                    contextPrompt, 
                    customer
                );
                
                console.log(`✅ Inbound call configured for ${customer.customer_name} - Stage ${progress.nextStage}`);
                
                return {
                    success: true,
                    customer: customer,
                    progress: progress,
                    stage: progress.nextStage,
                    greeting: this.generateGreeting(customer, progress)
                };
                
            } else {
                // Step 5: Handle unknown caller - try email identification
                const emailPrompt = this.generateEmailIdentificationPrompt();
                
                await this.vapiManager.updateAgentWithCustomPrompt(
                    1, 
                    emailPrompt
                );
                
                console.log(`👋 Unknown caller from ${callerNumber} - asking for email identification`);
                
                return {
                    success: true,
                    customer: null,
                    progress: { nextStage: 1, completionScore: 0 },
                    stage: 1,
                    greeting: "Welcome! Are you an existing DreamSeed customer or is this your first time calling us?",
                    needsEmailIdentification: true
                };
            }
            
        } catch (error) {
            console.error('❌ Inbound call handler error:', error);
            throw error;
        }
    }
    
    // Identify customer by email address
    async identifyCustomerByEmail(email) {
        try {
            console.log(`🔍 Looking up customer by email: ${email}`);
            
            const { data: customer } = await this.supabase
                .from('users')
                .select('*')
                .eq('customer_email', email)
                .single();
            
            if (customer) {
                console.log(`✅ Customer identified by email: ${customer.customer_name}`);
                return customer;
            } else {
                console.log(`❓ Unknown email: ${email}`);
                return null;
            }
            
        } catch (error) {
            console.log(`❓ Customer email lookup error: ${error.message}`);
            return null;
        }
    }
    
    // Process email identification from transcript
    async processEmailIdentification(transcript, callId) {
        try {
            // Look for email pattern in transcript
            const emailMatch = transcript.match(/CUSTOMER_EMAIL:\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
            
            if (emailMatch) {
                const email = emailMatch[1].toLowerCase();
                console.log(`📧 Email identified from transcript: ${email}`);
                
                // Look up customer by email
                const customer = await this.identifyCustomerByEmail(email);
                
                if (customer) {
                    // Customer found - update agent with their context
                    const progress = await this.getCustomerProgress(customer);
                    const contextPrompt = await this.generateContextualPrompt(customer, progress);
                    
                    await this.vapiManager.updateAgentWithCustomPrompt(
                        progress.nextStage, 
                        contextPrompt, 
                        customer
                    );
                    
                    console.log(`✅ Call ${callId} updated for ${customer.customer_name} - Stage ${progress.nextStage}`);
                    
                    return {
                        success: true,
                        customer: customer,
                        progress: progress,
                        stage: progress.nextStage
                    };
                } else {
                    // Email not found - switch to new customer flow
                    const newCallerPrompt = this.generateNewCallerPrompt();
                    
                    await this.vapiManager.updateAgentWithCustomPrompt(1, newCallerPrompt);
                    
                    console.log(`❓ Email ${email} not found - switching to new customer flow`);
                    
                    return {
                        success: true,
                        customer: null,
                        progress: { nextStage: 1, completionScore: 0 },
                        stage: 1,
                        emailNotFound: true
                    };
                }
            }
            
            return null; // No email found in transcript
            
        } catch (error) {
            console.error('❌ Email identification error:', error);
            return null;
        }
    }
    
    // Identify customer by phone number
    async identifyCustomer(phoneNumber) {
        try {
            console.log(`🔍 Raw phone number received: "${phoneNumber}"`);
            // Clean and format phone number for lookup
            const cleanNumber = this.cleanPhoneNumber(phoneNumber);
            
            console.log(`🔍 Looking up customer by phone: ${cleanNumber}`);
            
            // Try exact match first
            let { data: customer } = await this.supabase
                .from('users')
                .select('*')
                .eq('customer_phone', cleanNumber)
                .single();
            
            if (!customer) {
                // Try without country code
                const withoutCountryCode = cleanNumber.replace('+1', '');
                const { data: customer2 } = await this.supabase
                    .from('users')
                    .select('*')
                    .like('customer_phone', `%${withoutCountryCode}`)
                    .single();
                customer = customer2;
            }
            
            if (customer) {
                console.log(`✅ Customer identified: ${customer.customer_name}`);
                console.log(`📊 Customer progress: Call 1=${customer.call_1_completed}, Call 2=${customer.call_2_completed}, Call 3=${customer.call_3_completed}, Stage=${customer.current_call_stage}`);
                return customer;
            } else {
                console.log(`❓ Unknown caller: ${cleanNumber}`);
                return null;
            }
            
        } catch (error) {
            console.log(`❓ Customer lookup error: ${error.message}`);
            return null;
        }
    }
    
    // Get customer's current progress and next steps
    async getCustomerProgress(customer) {
        try {
            // Calculate completion using requirements extractor
            const validation = this.extractor.validateExtractedData(customer, customer.current_call_stage || 1);
            const missingInfo = this.extractor.generateMissingInfoReport(customer, customer.current_call_stage || 1);
            
            // Determine next call stage based on completed calls
            let nextStage = 1;
            if (customer.call_4_completed) {
                nextStage = 5; // All calls completed - use follow-up/support prompt
            } else if (customer.call_3_completed) {
                nextStage = 4; // Ready for final launch call
            } else if (customer.call_2_completed) {
                nextStage = 3; // Ready for operations call
            } else if (customer.call_1_completed) {
                nextStage = 2; // Ready for brand DNA call
            }
            
            console.log(`🎯 Stage progression: Next stage = ${nextStage} (Call 1: ${customer.call_1_completed}, Call 2: ${customer.call_2_completed}, Call 3: ${customer.call_3_completed}, Call 4: ${customer.call_4_completed})`);
            
            return {
                nextStage: nextStage,
                completionScore: validation.completionScore,
                missingInfo: missingInfo.nextQuestions,
                readyForNextCall: missingInfo.readyForNextCall,
                lastCallCompleted: customer.current_call_stage || 0,
                callHistory: {
                    call1: customer.call_1_completed || false,
                    call2: customer.call_2_completed || false,
                    call3: customer.call_3_completed || false,
                    call4: customer.call_4_completed || false
                }
            };
            
        } catch (error) {
            console.error('❌ Progress calculation error:', error);
            return {
                nextStage: 1,
                completionScore: 0,
                missingInfo: [],
                readyForNextCall: true,
                lastCallCompleted: 0,
                callHistory: { call1: false, call2: false, call3: false, call4: false }
            };
        }
    }
    
    // Generate context-aware prompt for returning customers
    async generateContextualPrompt(customer, progress) {
        const stage = progress.nextStage;
        const { completionScore, missingInfo } = progress;
        
        console.log(`🎯 Prompt selection: Stage ${stage}, Completion ${completionScore}%`);
        
        // If customer has completed previous call stages, use the next stage prompt
        const callsCompleted = (customer.call_1_completed ? 1 : 0) + 
                             (customer.call_2_completed ? 1 : 0) + 
                             (customer.call_3_completed ? 1 : 0) + 
                             (customer.call_4_completed ? 1 : 0);
        
        if (stage === 5) {
            // Customer has completed all calls - use follow-up prompt
            console.log(`🎉 Using post-completion follow-up prompt (all 4 calls completed)`);
            return this.generateCompletionFollowUpPrompt(customer, progress);
        } else if (callsCompleted > 0 && stage > 1) {
            // Customer has completed full call stages - use next stage prompt
            console.log(`📞 Using Call ${stage} prompt (completed ${callsCompleted} full calls)`);
            const basePrompt = this.vapiManager.callPrompts[stage];
            if (!basePrompt) {
                throw new Error(`No prompt found for stage ${stage}`);
            }
            return basePrompt;
        } else if (completionScore >= 50 && stage === 1) {
            // Customer is partially complete within stage 1 - use gap-filling
            console.log(`🔧 Using gap-filling prompt (${completionScore}% complete within stage 1)`);
            return this.generateGapFillingPrompt(customer, progress);
        } else {
            // New customer or low completion - use standard stage prompt
            console.log(`📝 Using standard stage ${stage} prompt`);
            const basePrompt = this.vapiManager.callPrompts[stage];
            if (!basePrompt) {
                throw new Error(`No prompt found for stage ${stage}`);
            }
            return basePrompt;
        }
    }
    
    // Generate smart gap-filling prompt
    generateGapFillingPrompt(customer, progress) {
        const { completionScore, missingInfo } = progress;
        
        return `# SMART GAP-FILLING CONVERSATION

## SYSTEM PROMPT

You are a professional business formation consultant for DreamSeed. This is a RETURNING CUSTOMER who is ${completionScore}% complete with their business formation process.

**Your Mission:** Efficiently fill in the remaining ${100 - completionScore}% of missing information to complete their current stage.

## CUSTOMER CONTEXT

**Name:** ${customer.customer_name}
**Business:** ${customer.business_name || 'TBD'}  
**Completion:** ${completionScore}%

**✅ INFORMATION WE ALREADY HAVE:**
${customer.customer_name ? `- Full name: ${customer.customer_name}` : ''}
${customer.customer_email ? `- Email: ${customer.customer_email}` : ''}
${customer.customer_phone ? `- Phone: ${customer.customer_phone}` : ''}
${customer.business_name ? `- Business name: ${customer.business_name}` : ''}
${customer.business_type ? `- Business type: ${customer.business_type}` : ''}
${customer.state_of_operation ? `- State: ${customer.state_of_operation}` : ''}
${customer.services ? `- Services: ${customer.services}` : ''}

**❓ WHAT WE STILL NEED:**
${missingInfo && missingInfo.length > 0 ? 
  missingInfo.slice(0, 5).map(item => `- ${item.question}`).join('\n') : 
  '- No major gaps identified'}

## CONVERSATION FLOW

### 1. EFFICIENT GREETING
"Hello ${customer.customer_name}! Great to hear from you about ${customer.business_name || 'your business'}. I can see you're ${completionScore}% complete with your business formation - excellent progress! Let me just fill in the remaining ${100 - completionScore}% of details we need to move you forward."

### 2. FOCUSED QUESTIONS
**ONLY ask for the missing information listed above.**

**DON'T ask about:**
- Information we already have
- Redundant contact details
- Things already covered

### 3. EFFICIENT PROGRESSION
- Get missing info quickly
- Confirm what we have is correct
- Move toward completion
- Set up next call stage when ready

### 4. SMART VALIDATION
"Perfect! Now I have everything I need for your foundation. You're ready to move on to Call 2 - Brand DNA. Shall we schedule that or would you like to continue now?"

## IMPORTANT RULES

1. **BE EFFICIENT** - Don't waste time on info we have
2. **ACKNOWLEDGE PROGRESS** - Celebrate their completion percentage  
3. **FOCUS ON GAPS** - Only ask for what's missing
4. **MOVE FORWARD** - Progress them to next stage when ready
5. **BE PERSONAL** - Use their name and business name frequently

## SUCCESS CRITERIA

- Fill all missing information gaps
- Reach 100% completion for current stage
- Transition to next call stage
- Keep call under 10 minutes (focused efficiency)`;
    }
    
    // Build customer context section with smart gap identification
    buildContextSection(customer, progress) {
        const { callHistory, lastCallCompleted, missingInfo, completionScore } = progress;
        
        let context = `# RETURNING CUSTOMER - SMART GAP FILLING\n\n`;
        context += `**Customer**: ${customer.customer_name}\n`;
        context += `**Email**: ${customer.customer_email}\n`;
        context += `**Business**: ${customer.business_name || 'TBD'}\n`;
        context += `**State**: ${customer.state_of_operation || 'TBD'}\n`;
        context += `**Completion**: ${completionScore}%\n\n`;
        
        // Show what we HAVE
        context += `**✅ INFORMATION WE ALREADY HAVE:**\n`;
        if (customer.customer_name) context += `- Full name: ${customer.customer_name}\n`;
        if (customer.customer_email) context += `- Email: ${customer.customer_email}\n`;
        if (customer.customer_phone) context += `- Phone: ${customer.customer_phone}\n`;
        if (customer.business_name) context += `- Business name: ${customer.business_name}\n`;
        if (customer.business_type) context += `- Business type: ${customer.business_type}\n`;
        if (customer.state_of_operation) context += `- State: ${customer.state_of_operation}\n`;
        if (customer.services) context += `- Services: ${customer.services}\n`;
        if (customer.timeline) context += `- Timeline: ${customer.timeline}\n`;
        if (customer.urgency_level) context += `- Urgency: ${customer.urgency_level}\n`;
        
        // Show what we NEED
        context += `\n**❓ MISSING INFORMATION (${100 - completionScore}% remaining):**\n`;
        if (missingInfo && missingInfo.length > 0) {
            missingInfo.slice(0, 5).forEach(item => {
                context += `- ${item.question}\n`;
            });
        } else {
            context += `- No major gaps identified\n`;
        }
        
        context += `\n**🎯 SMART GREETING INSTRUCTIONS:**\n`;
        context += `1. Greet them by name: "Hello ${customer.customer_name}!"\n`;
        context += `2. Reference their business: "${customer.business_name || 'your business'}"\n`;
        context += `3. Acknowledge progress: "I can see you're ${completionScore}% complete"\n`;
        context += `4. Focus on gaps: "Let me just fill in the remaining ${100 - completionScore}% of details we need"\n`;
        context += `5. BE EFFICIENT: Only ask for the missing information listed above\n`;
        context += `6. DON'T repeat questions about information we already have\n\n`;
        
        return context;
    }
    
    // Generate greeting for returning customers
    generateGreeting(customer, progress) {
        const { nextStage, callHistory } = progress;
        
        let greeting = `Hello ${customer.customer_name}! `;
        
        if (customer.business_name) {
            greeting += `Great to hear from you about ${customer.business_name}. `;
        }
        
        if (nextStage === 5) {
            greeting += `It's wonderful to hear from you! Congratulations again on completing your entire business formation journey. How has the launch been going since we last spoke?`;
        } else if (nextStage === 2 && callHistory.call1) {
            greeting += `I see you completed our foundation call. Ready to dive into your brand DNA?`;
        } else if (nextStage === 3 && callHistory.call2) {
            greeting += `Perfect timing! We covered your brand identity last time. Let's talk operations.`;
        } else if (nextStage === 4 && callHistory.call3) {
            greeting += `Excellent! We're ready for your final launch preparation call.`;
        } else if (nextStage === 1) {
            greeting += `Let's start with the foundation of your business.`;
        } else {
            greeting += `Let's continue where we left off with your business formation.`;
        }
        
        return greeting;
    }
    
    // Generate prompt for email identification
    generateEmailIdentificationPrompt() {
        return `# INBOUND CALLER - EMAIL IDENTIFICATION NEEDED

## SYSTEM PROMPT

You are a professional business formation consultant for DreamSeed. This is an INBOUND call from someone whose phone number we don't recognize, but they may be an existing customer.

**Your Goals:**
1. Warmly welcome them to DreamSeed
2. Check if they're an existing customer by email
3. If found, continue their journey; if new, start Call 1

## CONVERSATION FLOW

### 1. WARM WELCOME
"Hello, this is [Your Name] from DreamSeed! Thanks for calling. How can I help you with your business today?"

### 2. CUSTOMER IDENTIFICATION
**Ask immediately:**
"Are you an existing DreamSeed customer, or is this your first time reaching out to us?"

**If existing customer:**
"Perfect! What's the email address we have on file for you? I'll pull up your information."

**If new customer:**
"Wonderful! You've reached exactly the right place. What's your name?"

### 3. EMAIL LOOKUP INSTRUCTIONS
**When they provide email:**
- Say: "Let me pull up your account... one moment please."
- **CRITICAL**: Include their email in your next response using this exact format:
  "CUSTOMER_EMAIL: [their_email@domain.com]"
- This will trigger our system to look them up and continue their journey

**Example:**
Customer: "My email is john@example.com"
AI: "Perfect! Let me pull up your account... CUSTOMER_EMAIL: john@example.com ... Great! I can see your information now. Let's continue where we left off!"

### 4. POST-IDENTIFICATION
**If customer found:** Continue with their specific call stage and context
**If customer not found:** "I don't see that email in our system yet. No problem - let's start your business formation journey!"

## IMPORTANT NOTES
- Always ask for email identification early in unknown calls
- Use the CUSTOMER_EMAIL format to trigger system lookup
- Be prepared to seamlessly continue their journey once identified`;
    }
    
    // Generate prompt for customers who completed all 4 calls
    generateCompletionFollowUpPrompt(customer, progress) {
        return `# COMPLETED CUSTOMER - Post-Formation Support & Check-in

## SYSTEM PROMPT

You are a professional business formation consultant for DreamSeed. This is **${customer.customer_name}**, who has COMPLETED all 4 calls in our systematic business formation process for **${customer.business_name}**.

**Customer Status: 🎉 FORMATION COMPLETE**
- ✅ Call 1: Foundation & Vision (COMPLETED)
- ✅ Call 2: Brand DNA & Identity (COMPLETED) 
- ✅ Call 3: Operations & Systems (COMPLETED)
- ✅ Call 4: Launch Strategy & Support (COMPLETED)

**Your Goals:**
1. Warmly congratulate them on completing the entire program
2. Check on their progress since completion
3. Provide ongoing support and guidance
4. Address any new questions or challenges
5. Offer additional services or next steps

## CONVERSATION FLOW

### 1. CELEBRATION GREETING
"Hi Alberto! It's wonderful to hear from you! Congratulations again on completing your entire business formation journey with Alberto's Apples. You went through all four calls and built such a comprehensive foundation. How are things going with your launch?"

### 2. PROGRESS CHECK-IN
**Ask about their current status:**
- "How has the launch been going since we last spoke?"
- "Have you filed your Florida LLC yet?"
- "How is the apple business progressing? Getting customers?"
- "Any challenges or questions that have come up since completion?"
- "What's working well so far?"

### 3. SUPPORT & GUIDANCE
**Be ready to help with:**
- Follow-up questions about implementation
- New challenges they're facing
- Scaling and growth questions
- Legal or operational updates
- Marketing and customer acquisition support
- Connecting them with additional resources

### 4. CONCRETE NEXT STEPS & ACTION ITEMS
**Always provide specific next steps based on their responses:**

**If they haven't filed LLC yet:**
- "Let me connect you with our Florida LLC filing service - we can get that done this week for $299 plus state fees."
- "I'll send you the exact checklist and forms you need to file in Florida."

**If they need customers:**
- "Based on your apple business, I recommend starting with 3 farmers markets this month. I'll send you our vendor application templates."
- "Let's schedule a 30-minute marketing strategy call to map out your customer acquisition plan."

**If they're operational but want to scale:**
- "You're ready for our Growth Accelerator program - 90 days of weekly coaching to scale to $10k/month."
- "I'll introduce you to our wholesale grocery buyer who works with 50+ Florida stores."

**If they have specific challenges:**
- "That's exactly what our ongoing business coaching addresses. For $497/month, you get weekly calls and direct access to me."
- "Let me connect you with [specific expert] who specializes in that exact issue."

**Always end with:**
"What sounds most valuable to help Alberto's Apples reach the next level? I can set up any of these next steps for you right now."

### 5. CONCRETE COMMITMENTS
**Before ending the call, secure ONE specific commitment:**
- Schedule follow-up call (specific date/time)
- Send specific resources (LLC forms, market applications, contacts)
- Connect them with specific expert or service
- Enroll them in coaching program
- Set up introduction to buyer/partner

**Example close:**
"Perfect! I'm scheduling your Growth Strategy call for next Tuesday at 2 PM, and I'll email you the 3 farmers market applications today. You'll have your next customers lined up by next week. Sound good?"

## CONVERSATION STYLE

- **Results-focused**: Every suggestion leads to specific action
- **Solution-oriented**: Address real business challenges with real solutions
- **Consultative**: Provide expert guidance with clear next steps
- **Commitment-driven**: Always secure a specific next action before ending

## IMPORTANT NOTES

- ALWAYS provide at least 2 specific next steps
- Make offers concrete with pricing, timelines, and deliverables
- Secure ONE commitment before ending the call
- Position additional services as natural next evolution
- Focus on RESULTS and GROWTH, not just support

## SUCCESS CRITERIA

- Provide minimum 2 concrete next steps with specific details
- Secure 1 specific commitment (call, service, introduction)
- Position DreamSeed as ongoing growth partner
- Give them clear path to next level of success
- Leave them with actionable items they can execute immediately`;
    }

    // Generate prompt for new callers
    generateNewCallerPrompt() {
        return `# NEW INBOUND CALLER - Call 1: Foundation & Vision
        
## SYSTEM PROMPT

You are a professional business formation consultant for DreamSeed. This is an INBOUND call from someone who called us directly. They may be:
- A new prospect who found our number
- Someone who was expecting a callback
- A referral from another customer

**Your Goals:**
1. Warmly welcome them to DreamSeed
2. Understand why they're calling
3. Gather their basic information
4. Start the Call 1 foundation process

## CONVERSATION FLOW

### 1. WARM WELCOME
"Hello, this is [Your Name] from DreamSeed! Thanks for calling. How can I help you start your business today?"

**Listen for:**
- "I filled out a form online"
- "I was expecting a call back"
- "Someone referred me"
- "I found your number and want to start a business"

### 2. CONTEXT GATHERING
**Ask:**
- "What's your name?"
- "What brings you to DreamSeed today?"
- "Are you looking to start a new business or work on an existing one?"

### 3. TRANSITION TO CALL 1
"Perfect! You've reached exactly the right place. We have a systematic 4-call process that makes business formation simple and comprehensive. Since you're here, let's start with Call 1 - the foundation of your business."

Then proceed with the standard Call 1 flow...

## IMPORTANT NOTES
- Be extra welcoming since they took initiative to call
- Thank them for reaching out directly
- Position the call as "perfect timing" 
- Make them feel they made the right choice calling DreamSeed`;
    }
    
    // Utility function to clean phone numbers
    cleanPhoneNumber(phoneNumber) {
        if (!phoneNumber) return '';
        
        console.log(`🔧 Cleaning phone number: "${phoneNumber}"`);
        
        // Remove all non-digit characters except +
        let cleaned = phoneNumber.replace(/[^0-9+]/g, '');
        console.log(`🔧 After regex: "${cleaned}"`);
        
        // Ensure it starts with +1 for US numbers
        if (!cleaned.startsWith('+')) {
            if (cleaned.startsWith('1') && cleaned.length === 11) {
                cleaned = '+' + cleaned;
            } else if (cleaned.length === 10) {
                cleaned = '+1' + cleaned;
            }
        }
        
        console.log(`🔧 Final cleaned: "${cleaned}"`);
        return cleaned;
    }
}

module.exports = InboundCallHandler;