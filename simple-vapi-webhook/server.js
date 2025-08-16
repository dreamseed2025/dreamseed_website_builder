require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const RequirementsExtractor = require('./requirements/extraction-logic');
const { analyzeTranscriptWithAI, saveToSupabase } = require('./ai-transcript-analyzer');
const DynamicVAPIManager = require('./dynamic-vapi-integration');
const WebhookMonitor = require('./webhook-monitor');
const IntelligentCallSystem = require('./intelligent-call-system');
const BackgroundCallProcessor = require('./background-call-processor');
const InboundCallHandler = require('./inbound-call-handler');
const TruthTableExtractor = require('./truth-table-extractor');
const RetroactiveProcessor = require('./retroactive-processor');
const OpenAI = require('openai');

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.static(__dirname));

// Initialize services
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const extractor = new RequirementsExtractor();
const vapiManager = new DynamicVAPIManager();
const monitor = new WebhookMonitor();
const intelligentCallSystem = new IntelligentCallSystem(supabase, vapiManager, extractor);
const backgroundProcessor = new BackgroundCallProcessor();
const inboundHandler = new InboundCallHandler();
const truthTableExtractor = new TruthTableExtractor();
const retroactiveProcessor = new RetroactiveProcessor();

// Load historical monitoring data
monitor.loadFromFile();

// Start background call processor
backgroundProcessor.start();

// Auto-scheduling configuration
const AUTO_SCHEDULE_DELAYS = {
    1: 5 * 60 * 1000,    // 5 minutes after Call 1
    2: 5 * 60 * 1000,    // 5 minutes after Call 2  
    3: 5 * 60 * 1000     // 5 minutes after Call 3
};

// Auto-schedule next call after current call ends
async function autoScheduleNextCall(webhookData) {
    try {
        const callId = webhookData.callId || webhookData.call?.id;
        const customerNumber = webhookData.customerNumber || webhookData.call?.customer?.number;
        
        console.log(`🔄 Auto-scheduling check for call ${callId}...`);
        
        if (!customerNumber) {
            console.log('⚠️ No customer number - skipping auto-schedule');
            return;
        }
        
        // Find customer by phone number using inbound handler
        const customer = await inboundHandler.identifyCustomer(customerNumber);
        
        if (!customer) {
            console.log(`⚠️ Customer not found for ${customerNumber} - skipping auto-schedule`);
            return;
        }
        
        // Analyze transcript to determine what stages were completed
        const transcript = webhookData.message?.artifact?.messages || webhookData.artifact?.messages || [];
        let completedStages = [];
        let transcriptText = '';
        
        // Extract transcript text
        for (const msg of transcript) {
            if (msg.role === 'user' || msg.role === 'assistant' || msg.role === 'bot') {
                transcriptText += msg.message || msg.content || '';
            }
        }
        
        console.log(`📝 Analyzing transcript for completion detection...`);
        
        // Detect stage completion based on conversation content
        if (transcriptText.includes('foundation') || transcriptText.includes('business name') || transcriptText.includes('contact')) {
            completedStages.push(1);
        }
        if (transcriptText.includes('brand DNA') || transcriptText.includes('values') || transcriptText.includes('mission')) {
            completedStages.push(2);
        }
        if (transcriptText.includes('operations') || transcriptText.includes('business location') || transcriptText.includes('banking') || transcriptText.includes('compliance') || transcriptText.includes('technology') || transcriptText.includes('insurance')) {
            completedStages.push(3);
        }
        if (transcriptText.includes('launch') || transcriptText.includes('final') || completedStages.includes(3)) {
            completedStages.push(4);
        }
        
        // Update customer progress
        const highestStage = Math.max(...completedStages, customer.current_call_stage || 1);
        const updates = {
            current_call_stage: highestStage,
            updated_at: new Date().toISOString()
        };
        
        // Mark specific calls as completed
        if (completedStages.includes(1)) updates.call_1_completed = true;
        if (completedStages.includes(2)) updates.call_2_completed = true;
        if (completedStages.includes(3)) updates.call_3_completed = true;
        if (completedStages.includes(4)) updates.call_4_completed = true;
        
        // Schedule next call if not at final stage
        if (highestStage < 4) {
            const nextStage = highestStage + 1;
            const scheduleDelay = AUTO_SCHEDULE_DELAYS[highestStage] || 24 * 60 * 60 * 1000;
            const nextCallTime = new Date(Date.now() + scheduleDelay);
            
            updates.next_call_scheduled = nextCallTime.toISOString();
            // Skip next_call_stage since column doesn't exist
            
            console.log(`📅 Auto-scheduled Call ${nextStage} for ${customer.customer_name} at ${nextCallTime}`);
        }
        
        // Update customer record
        const { data: updateResult, error: updateError } = await supabase
            .from('users')
            .update(updates)
            .eq('customer_email', customer.customer_email);
            
        if (updateError) {
            console.error('❌ Database update error:', updateError);
            throw updateError;
        }
            
        console.log(`✅ Updated ${customer.customer_name} - Completed stages: [${completedStages.join(', ')}]`);
        console.log(`📊 Updates applied:`, updates);
        
    } catch (error) {
        console.error('❌ Auto-schedule error:', error);
    }
}

// Send email reminder for scheduled call
async function sendCallReminderEmail(customer, callStage, scheduledTime) {
    try {
        // Email notification with trigger link
        const triggerLink = `http://localhost:3002/trigger-call/${customer.customer_email}/${callStage}`;
        
        console.log(`📧 Email reminder for ${customer.customer_name}:`);
        console.log(`   Call ${callStage} scheduled for: ${scheduledTime}`);
        console.log(`   Trigger link: ${triggerLink}`);
        
        // Store trigger link in database for tracking
        await supabase
            .from('users')
            .update({
                trigger_link: triggerLink,
                email_sent_at: new Date().toISOString()
            })
            .eq('customer_email', customer.customer_email);
            
    } catch (error) {
        console.error('❌ Email reminder error:', error);
    }
}

// Kill any existing process on port 3002
const { exec } = require('child_process');

function killExistingServer() {
    return new Promise((resolve) => {
        exec('lsof -ti:3002', (error, stdout) => {
            if (stdout.trim()) {
                const pids = stdout.trim().split('\n');
                console.log(`🔄 Killing existing processes on port 3002: ${pids.join(', ')}`);
                exec(`kill -9 ${pids.join(' ')}`, (killError) => {
                    if (killError) {
                        console.log('⚠️ Some processes may not have been killed:', killError.message);
                    } else {
                        console.log('✅ Existing processes killed successfully');
                    }
                    setTimeout(resolve, 1000); // Wait 1 second after killing
                });
            } else {
                console.log('✅ Port 3002 is available');
                resolve();
            }
        });
    });
}

console.log('🚀 Starting DreamSeed Server with Requirements Framework...');
console.log('📋 Requirements framework loaded and ready');

// Legacy API endpoint
app.get('/api/all', async (req, res) => {
  const { data } = await supabase.from('dream_dashboard').select('*').limit(10);
  res.json(data || []);
});

// Enhanced analyzeTranscriptWithAI using requirements framework
async function analyzeTranscriptWithRequirements(transcript, existingData = {}, callStage = 1) {
    try {
        console.log(`🤖 Analyzing transcript for Call Stage ${callStage}...`);
        
        // Get call-specific prompt
        const prompt = extractor.getCallSpecificPrompt(callStage, transcript, existingData);
        
        // Call OpenAI with structured prompt
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.3,
            max_tokens: 2000
        });
        
        // Parse and validate response
        let extractedData;
        try {
            const cleanJson = response.choices[0].message.content.replace(/```json\n?|\n?```/g, '').trim();
            extractedData = JSON.parse(cleanJson);
        } catch (parseError) {
            console.error('❌ JSON Parse Error:', parseError.message);
            throw new Error('Failed to parse AI response as JSON');
        }
        
        // Validate extracted data
        const validation = extractor.validateExtractedData(extractedData, callStage);
        
        // Generate missing information report
        const missingInfo = extractor.generateMissingInfoReport(extractedData, callStage);
        
        return {
            ...extractedData,
            validation: validation,
            missingInfo: missingInfo,
            callStage: callStage,
            extractionTimestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error('❌ Requirements extraction error:', error);
        // Fallback to legacy extraction
        console.log('⚠️ Falling back to legacy AI extraction...');
        return await analyzeTranscriptWithAI(transcript, callStage);
    }
}

// VAPI Webhook endpoint with monitoring
app.post('/api/vapi-webhook', async (req, res) => {
    try {
        const webhookType = req.body?.type || req.body.message?.type || 'unknown';
        const callId = req.body.callId || req.body.call?.id || 'unknown';
        
        console.log(`🎤 VAPI Webhook received: ${webhookType} for call ${callId}`);
        
        // Debug: Log full webhook payload for unknown webhooks
        if (webhookType === 'unknown' || callId === 'unknown') {
            console.log(`🔍 DEBUG - Full webhook payload:`, JSON.stringify(req.body, null, 2));
        }
        
        // Handle different webhook types
        if (webhookType === 'call-start' || webhookType === 'call.started' || 
            (webhookType === 'status-update' && req.body.message?.status === 'in-progress')) {
            // Check if this is an inbound call  
            const callType = req.body.call?.type || req.body.message?.call?.type || req.body.type;
            const isInbound = callType === 'inbound' || callType === 'inboundPhoneCall';
            
            console.log(`🔍 Call type check: "${callType}" | Is inbound: ${isInbound}`);
            
            if (isInbound) {
                console.log(`📞 INBOUND CALL DETECTED - Processing with smart identification`);
                
                try {
                    // Debug: Full webhook structure for inbound calls
                    console.log(`🔍 FULL INBOUND WEBHOOK:`, JSON.stringify(req.body, null, 2));
                    console.log(`🔍 Call object:`, JSON.stringify(req.body.call, null, 2));
                    console.log(`🔍 Customer data:`, JSON.stringify(req.body.call?.customer, null, 2));
                    console.log(`🔍 Message data:`, JSON.stringify(req.body.message, null, 2));
                    console.log(`🔍 Customer number from call: "${req.body.call?.customer?.number}"`);
                    console.log(`🔍 Phone from message: "${req.body.message?.call?.customer?.number}"`);
                    console.log(`🔍 Raw phone from req: "${req.body.call?.customer?.phoneNumber}"`);
                    
                    // Handle inbound call with smart customer identification
                    const inboundResult = await inboundHandler.handleInboundCall({
                        id: callId,
                        customer: req.body.call?.customer,
                        from: req.body.call?.customer?.number,
                        callId: callId
                    });
                    
                    console.log(`🎯 Inbound call configured: ${inboundResult.greeting}`);
                    
                    // Track the inbound call start
                    monitor.onCallStarted({
                        callId: callId,
                        customerEmail: inboundResult.customer?.customer_email || 'inbound_unknown',
                        customerName: inboundResult.customer?.customer_name || 'Inbound Caller',
                        businessName: inboundResult.customer?.business_name || 'TBD',
                        callStage: inboundResult.stage,
                        callType: 'inbound'
                    });
                    
                } catch (inboundError) {
                    console.error('❌ Inbound call processing error:', inboundError);
                    // Fall back to regular call tracking
                }
                
            } else {
                // Regular outbound call tracking
                monitor.onCallStarted({
                    callId: callId,
                    customerEmail: req.body.call?.customer?.email || req.body.customerEmail,
                    customerName: req.body.call?.customer?.name || req.body.customerName,
                    businessName: req.body.businessName,
                    callStage: req.body.callStage || req.body.serverMessage?.callStage || 1,
                    callType: 'outbound'
                });
            }
            
        } else if (webhookType === 'transcript' && req.body?.transcript) {
            const transcript = req.body.transcript;
            
            console.log('📝 Processing transcript:', transcript.substring(0, 100) + '...');
            
            // Track transcript received
            monitor.onTranscriptReceived({
                callId: callId,
                transcript: transcript,
                type: webhookType,
                speaker: req.body.speaker || 'unknown'
            });
            
            // Determine call stage
            const callStage = req.body.callStage || req.body.serverMessage?.callStage || 1;
            
            // Get existing customer data if available
            let existingData = {};
            const customerEmail = req.body.customerEmail || req.body.serverMessage?.customerEmail;
            if (customerEmail) {
                const { data } = await supabase
                    .from('users')
                    .select('*')
                    .eq('customer_email', customerEmail)
                    .single();
                existingData = data || {};
            }
            
            // Check for email identification in transcript first
            const emailIdentification = await inboundHandler.processEmailIdentification(transcript, callId);
            
            if (emailIdentification) {
                console.log(`📧 Email identification processed for call ${callId}`);
                
                // Track the email identification
                monitor.onExtractionCompleted(callId, {
                    customer_email: emailIdentification.customer?.customer_email,
                    identification_method: 'email',
                    stage: emailIdentification.stage
                });
                
                res.json({
                    success: true,
                    message: `Email identification processed`,
                    identification: emailIdentification
                });
                return;
            }
            
            // Regular transcript analysis
            const analysisResult = await analyzeTranscriptWithRequirements(transcript, existingData, callStage);
            
            // Track extraction completion
            monitor.onExtractionCompleted(callId, analysisResult);
            
            // Save to database
            const saveResult = await saveToSupabase(analysisResult);
            
            console.log('✅ Analysis and save completed');
            
            res.json({
                success: true,
                callId: callId,
                analysisResult: analysisResult,
                saveResult: saveResult
            });
            
        } else if (webhookType === 'call-end' || webhookType === 'call.ended' || webhookType === 'end-of-call-report' || 
                  (webhookType === 'status-update' && req.body.message?.status === 'ended')) {
            console.log(`📞 Call ended: ${webhookType} - Processing completion`);
            
            // Track call completion
            monitor.onCallCompleted(callId, {
                reason: req.body.endedReason || req.body.message?.endedReason || 'completed',
                duration: req.body.call?.duration
            });
            
            // 🔥 NEW: Process comprehensive truth table extraction
            console.log('📋 Running post-call truth table analysis...');
            try {
                const truthTableSuccess = await truthTableExtractor.processPostCallWebhook(req.body);
                if (truthTableSuccess) {
                    console.log('✅ Truth table extraction completed successfully');
                } else {
                    console.log('⚠️ Truth table extraction had issues - check logs');
                }
            } catch (truthTableError) {
                console.error('❌ Truth table extraction failed:', truthTableError);
            }
            
            // Extract customer info for auto-scheduling
            const customerNumber = req.body.call?.customer?.number || req.body.customer?.number;
            
            // Auto-schedule next call if transcript was processed
            await autoScheduleNextCall({
                ...req.body,
                customerNumber: customerNumber,
                callId: callId
            });
            
            res.json({ success: true, message: 'Call ended successfully' });
            
        } else if (webhookType === 'error' || webhookType === 'call.failed') {
            // Track call failure
            monitor.onCallFailed(callId, {
                message: req.body.error || 'Unknown error',
                details: req.body
            });
            
            res.json({ success: true, message: 'Call error tracked' });
            
        } else {
            res.json({ success: true, message: `Webhook ${webhookType} received but not processed` });
        }
        
    } catch (error) {
        console.error('❌ Webhook processing error:', error);
        
        // Track the error if we have a call ID
        const callId = req.body?.callId || req.body?.call?.id;
        if (callId) {
            monitor.onCallFailed(callId, error);
        }
        
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Customer completeness tracking API
app.get('/api/customer-completeness/:email', async (req, res) => {
    try {
        const email = req.params.email;
        
        // Get customer data
        const { data: customer, error } = await supabase
            .from('users')
            .select('*')
            .eq('customer_email', email)
            .single();
        
        if (error || !customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        
        // Calculate completeness using extractor
        const validation = extractor.validateExtractedData(customer, customer.current_call_stage || 1);
        const missingInfo = extractor.generateMissingInfoReport(customer, customer.current_call_stage || 1);
        
        res.json({
            customerName: customer.customer_name,
            email: customer.customer_email,
            phone: customer.customer_phone,
            businessName: customer.business_name,
            completionScore: validation.completionScore,
            lastUpdated: customer.updated_at,
            currentCallStage: customer.current_call_stage || 1,
            missingInfo: missingInfo.nextQuestions,
            readyForNextCall: missingInfo.readyForNextCall
        });
    } catch (error) {
        console.error('❌ Customer completeness error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Missing information report API
app.get('/api/missing-info/:email', async (req, res) => {
    try {
        const email = req.params.email;
        const callStage = parseInt(req.query.callStage) || 1;
        
        // Get customer data
        const { data: customer, error } = await supabase
            .from('users')
            .select('*')
            .eq('customer_email', email)
            .single();
        
        if (error || !customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        
        // Generate missing information report
        const missingInfo = extractor.generateMissingInfoReport(customer, callStage);
        
        res.json(missingInfo);
    } catch (error) {
        console.error('❌ Missing info error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Next call questions API
app.get('/api/next-questions/:email', async (req, res) => {
    try {
        const email = req.params.email;
        
        // Get customer data
        const { data: customer, error } = await supabase
            .from('users')
            .select('*')
            .eq('customer_email', email)
            .single();
        
        if (error || !customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        
        const currentStage = customer.current_call_stage || 1;
        const missingInfo = extractor.generateMissingInfoReport(customer, currentStage);
        
        res.json({
            currentCallStage: currentStage,
            questions: missingInfo.nextQuestions,
            completionScore: missingInfo.completionScore,
            readyForNextCall: missingInfo.readyForNextCall
        });
    } catch (error) {
        console.error('❌ Next questions error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Test extraction endpoint
app.post('/api/test-extraction', async (req, res) => {
    try {
        const { transcript, callStage = 1, existingData = {} } = req.body;
        
        if (!transcript) {
            return res.status(400).json({ error: 'Transcript is required' });
        }
        
        const result = await analyzeTranscriptWithRequirements(transcript, existingData, callStage);
        
        res.json({
            success: true,
            result: result
        });
    } catch (error) {
        console.error('❌ Test extraction error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Dynamic VAPI Call Initiation APIs

// Start call with specific stage
app.post('/api/start-call', async (req, res) => {
    try {
        const { customerEmail, callStage, customerData = {} } = req.body;
        
        if (!customerEmail) {
            return res.status(400).json({ error: 'Customer email is required' });
        }
        
        // Get customer data from database if not provided
        let customerInfo = customerData;
        if (!customerData.name || !customerData.phone) {
            const { data } = await supabase
                .from('users')
                .select('*')
                .eq('customer_email', customerEmail)
                .single();
            
            if (data) {
                customerInfo = {
                    name: data.customer_name,
                    email: data.customer_email,
                    phone: data.customer_phone,
                    businessName: data.business_name,
                    state: data.state_of_formation,
                    industry: data.business_type,
                    ...customerData
                };
            }
        }
        
        // Determine call stage if not provided
        let targetCallStage = callStage;
        if (!targetCallStage) {
            targetCallStage = await vapiManager.getNextCallStage(customerEmail);
            if (!targetCallStage) {
                return res.status(400).json({ 
                    error: 'Customer has completed all calls',
                    completionStatus: 'All 4 calls completed'
                });
            }
        }
        
        console.log(`📞 Starting Call Stage ${targetCallStage} for ${customerInfo.name || customerEmail}`);
        console.log(`🔍 Customer info for call:`, JSON.stringify(customerInfo, null, 2));
        
        // Start the call with dynamic prompt
        const callResult = await vapiManager.startCallWithStage(targetCallStage, customerInfo);
        
        // Track call initiation in monitor
        if (callResult && callResult.id) {
            monitor.onCallStarted({
                callId: callResult.id,
                customerEmail: customerInfo.email,
                customerName: customerInfo.name,
                businessName: customerInfo.businessName,
                callStage: targetCallStage
            });
        }
        
        // Update customer's current call stage in database
        await supabase
            .from('users')
            .update({ 
                current_call_stage: targetCallStage,
                last_call_initiated: new Date().toISOString()
            })
            .eq('customer_email', customerEmail);
        
        res.json({
            success: true,
            callStage: targetCallStage,
            callResult: callResult,
            customerInfo: customerInfo
        });
        
    } catch (error) {
        console.error('❌ Start call error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update VAPI agent for specific call stage (without starting call)
app.post('/api/update-agent', async (req, res) => {
    try {
        const { callStage, customerData = {} } = req.body;
        
        if (!callStage || callStage < 1 || callStage > 4) {
            return res.status(400).json({ error: 'Valid call stage (1-4) is required' });
        }
        
        console.log(`🔄 Updating VAPI agent for Call Stage ${callStage}`);
        
        const updateResult = await vapiManager.updateAgentForCallStage(callStage, customerData);
        
        res.json({
            success: true,
            callStage: callStage,
            updateResult: updateResult
        });
        
    } catch (error) {
        console.error('❌ Update agent error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get next call stage for customer
app.get('/api/next-call-stage/:email', async (req, res) => {
    try {
        const email = req.params.email;
        
        const nextStage = await vapiManager.getNextCallStage(email);
        
        if (!nextStage) {
            return res.json({
                nextCallStage: null,
                message: 'Customer has completed all 4 calls',
                completionStatus: '100% complete'
            });
        }
        
        res.json({
            nextCallStage: nextStage,
            message: `Ready for Call ${nextStage}`,
            completionStatus: `${(nextStage - 1) * 25}% complete`
        });
        
    } catch (error) {
        console.error('❌ Next call stage error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Test dynamic prompt customization
app.post('/api/test-prompt', async (req, res) => {
    try {
        const { callStage = 1, customerData = {} } = req.body;
        
        if (!vapiManager.callPrompts[callStage]) {
            return res.status(400).json({ error: 'Invalid call stage' });
        }
        
        const basePrompt = vapiManager.callPrompts[callStage];
        const customizedPrompt = vapiManager.customizePrompt(basePrompt, customerData);
        
        res.json({
            success: true,
            callStage: callStage,
            customerData: customerData,
            basePromptLength: basePrompt.length,
            customizedPromptLength: customizedPrompt.length,
            customizedPrompt: customizedPrompt.substring(0, 500) + '...'
        });
        
    } catch (error) {
        console.error('❌ Test prompt error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Intelligent Call System API Endpoints

// Start intelligent call (auto-determines stage and personalizes)
app.post('/api/intelligent-call', async (req, res) => {
    try {
        const { customerEmail, customerData = {} } = req.body;
        
        if (!customerEmail) {
            return res.status(400).json({ error: 'Customer email is required' });
        }
        
        console.log(`🧠 Starting intelligent call for ${customerEmail}`);
        
        const result = await intelligentCallSystem.startIntelligentCall(customerEmail, customerData);
        
        res.json(result);
        
    } catch (error) {
        console.error('❌ Intelligent call error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Trigger Call 1 from online form submission
app.post('/api/trigger-call-1', async (req, res) => {
    try {
        const customerData = req.body;
        
        console.log('🎯 Form submission received for:', customerData.name);
        
        // Validate required fields
        if (!customerData.name || !customerData.email || !customerData.phone) {
            return res.status(400).json({ 
                success: false, 
                error: 'Name, email, and phone are required' 
            });
        }
        
        // Create initial customer profile
        const initialProfile = {
            customer_name: customerData.name,
            customer_email: customerData.email,
            customer_phone: customerData.phone,
            business_name: customerData.businessName,
            business_type: customerData.businessType,
            state_of_operation: customerData.state,
            services: customerData.services,
            timeline: customerData.timeline,
            urgency_level: customerData.urgency,
            entity_type: 'LLC',
            current_call_stage: 1,
            status: 'in_progress',
            call_1_scheduled: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        // Save to database
        await saveToSupabase(initialProfile);
        
        // Schedule Call 1 for 5 minutes from now (demo mode)
        const call1Time = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
        
        await supabase
            .from('users')
            .update({
                next_call_scheduled: call1Time.toISOString(),
                next_call_stage: 1,
                form_submitted_at: new Date().toISOString()
            })
            .eq('customer_email', customerData.email);
        
        console.log(`📅 Call 1 scheduled for ${customerData.name} at ${call1Time}`);
        
        // Send confirmation email with trigger link
        await sendCallReminderEmail(initialProfile, 1, call1Time);
        
        res.json({ 
            success: true, 
            message: 'Call 1 scheduled successfully',
            scheduledTime: call1Time,
            triggerLink: `http://localhost:3002/trigger-call/${customerData.email}/1`
        });
        
    } catch (error) {
        console.error('❌ Form submission error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Email trigger link for specific call stages
app.get('/trigger-call/:email/:stage', async (req, res) => {
    try {
        const { email, stage } = req.params;
        const callStage = parseInt(stage);
        
        console.log(`🔗 Trigger link clicked: Call ${callStage} for ${email}`);
        
        // Get customer data
        const { data: customer } = await supabase
            .from('users')
            .select('*')
            .eq('customer_email', email)
            .single();
            
        if (!customer) {
            return res.status(404).send(`
                <html>
                <body style="font-family: Arial; text-align: center; padding: 50px;">
                    <h2>❌ Customer Not Found</h2>
                    <p>No customer found with email: ${email}</p>
                </body>
                </html>
            `);
        }
        
        // Initiate the call using intelligent call system
        const callResult = await intelligentCallSystem.initiateIntelligentCall({
            customerEmail: email,
            forceStage: callStage
        });
        
        // Update trigger click tracking
        await supabase
            .from('users')
            .update({
                trigger_clicked_at: new Date().toISOString(),
                last_trigger_stage: callStage
            })
            .eq('customer_email', email);
        
        res.send(`
            <html>
            <head>
                <title>Call Initiated</title>
                <style>
                    body { font-family: Arial; text-align: center; padding: 50px; background: #f8f9fa; }
                    .container { background: white; padding: 40px; border-radius: 10px; max-width: 500px; margin: 0 auto; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                    .success { color: #28a745; }
                    .phone { font-size: 1.2em; font-weight: bold; color: #007bff; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h2 class="success">📞 Call ${callStage} Initiated!</h2>
                    <p>Hello ${customer.customer_name}!</p>
                    <p>Your Call ${callStage} is starting now. You should receive a call at:</p>
                    <p class="phone">${customer.customer_phone}</p>
                    <p>Please answer when the call comes in. Our AI consultant is ready to help with your business formation!</p>
                    <small>Call ID: ${callResult.callId || 'N/A'}</small>
                </div>
            </body>
            </html>
        `);
        
    } catch (error) {
        console.error('❌ Trigger call error:', error);
        res.status(500).send(`
            <html>
            <body style="font-family: Arial; text-align: center; padding: 50px;">
                <h2>❌ Error Initiating Call</h2>
                <p>${error.message}</p>
            </body>
            </html>
        `);
    }
});

// Process historical call data retroactively
app.post('/api/process-historical-data/:customerEmail', async (req, res) => {
    try {
        const { customerEmail } = req.params;
        
        console.log(`🔄 Starting retroactive processing for: ${customerEmail}`);
        
        let result;
        
        // Special handling for Alberto with sample data
        if (customerEmail === 'alberto@ching.com') {
            result = await retroactiveProcessor.processAlbertoWithSampleData();
        } else {
            // For other customers, would need actual transcripts
            return res.status(400).json({ 
                error: 'Retroactive processing requires actual call transcripts',
                message: 'This endpoint currently only supports Alberto\'s sample data processing'
            });
        }
        
        res.json({
            success: true,
            message: 'Historical data processing completed',
            result: result
        });
        
    } catch (error) {
        console.error('❌ Retroactive processing error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get truth table completion report
app.get('/api/truth-table/:customerEmail', async (req, res) => {
    try {
        const { customerEmail } = req.params;
        
        console.log(`📋 Generating truth table report for: ${customerEmail}`);
        
        const report = await truthTableExtractor.getTruthTableReport(customerEmail);
        
        if (!report) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        
        res.json({
            success: true,
            report: report,
            summary: {
                completion: `${report.overallCompletion}%`,
                completedFields: report.completedFields.length,
                missingFields: report.missingFields.length,
                callProgress: report.callProgress
            }
        });
        
    } catch (error) {
        console.error('❌ Truth table report error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Test inbound call identification
app.post('/api/test-inbound-call', async (req, res) => {
    try {
        const { phoneNumber } = req.body;
        
        if (!phoneNumber) {
            return res.status(400).json({ error: 'Phone number is required' });
        }
        
        console.log(`🧪 Testing inbound call identification for: ${phoneNumber}`);
        
        const result = await inboundHandler.handleInboundCall({
            id: 'test-call-' + Date.now(),
            customer: { number: phoneNumber },
            from: phoneNumber,
            callId: 'test-call'
        });
        
        res.json({
            success: true,
            result: result,
            message: `Inbound call configured for ${result.customer?.customer_name || 'New Caller'}`
        });
        
    } catch (error) {
        console.error('❌ Inbound call test error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Background processor status and control
app.get('/api/background-processor/status', async (req, res) => {
    try {
        const status = await backgroundProcessor.getQueueStatus();
        res.json(status);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/background-processor/process-now/:email', async (req, res) => {
    try {
        const { email } = req.params;
        const result = await backgroundProcessor.processCustomerNow(email);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/background-processor/start', (req, res) => {
    backgroundProcessor.start();
    res.json({ success: true, message: 'Background processor started' });
});

app.post('/api/background-processor/stop', (req, res) => {
    backgroundProcessor.stop();
    res.json({ success: true, message: 'Background processor stopped' });
});

// Get customer journey/progress
app.get('/api/customer-journey/:email', async (req, res) => {
    try {
        const email = req.params.email;
        
        const journey = await intelligentCallSystem.getCustomerJourney(email);
        
        res.json(journey);
        
    } catch (error) {
        console.error('❌ Customer journey error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get customer progress dashboard
app.get('/api/progress-dashboard/:email', async (req, res) => {
    try {
        const email = req.params.email;
        
        const dashboard = await intelligentCallSystem.getProgressDashboard(email);
        
        res.json(dashboard);
        
    } catch (error) {
        console.error('❌ Progress dashboard error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Process post-call data and determine next steps
app.post('/api/process-post-call', async (req, res) => {
    try {
        const { customerEmail, callStage, extractedData } = req.body;
        
        if (!customerEmail || !callStage || !extractedData) {
            return res.status(400).json({ error: 'Customer email, call stage, and extracted data are required' });
        }
        
        const result = await intelligentCallSystem.processPostCall(customerEmail, callStage, extractedData);
        
        res.json(result);
        
    } catch (error) {
        console.error('❌ Post-call processing error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Generate personalized prompt preview
app.post('/api/personalized-prompt', async (req, res) => {
    try {
        const { customerEmail, targetCallStage } = req.body;
        
        if (!customerEmail || !targetCallStage) {
            return res.status(400).json({ error: 'Customer email and target call stage are required' });
        }
        
        const prompt = await intelligentCallSystem.generatePersonalizedPrompt(customerEmail, targetCallStage);
        
        res.json({
            success: true,
            customerEmail: customerEmail,
            targetCallStage: targetCallStage,
            personalizedPrompt: prompt,
            promptLength: prompt.length
        });
        
    } catch (error) {
        console.error('❌ Personalized prompt error:', error);
        res.status(500).json({ error: error.message });
    }
});

// === Web Call Configuration ===

// Serve VAPI configuration for web calls (using environment variables)
app.get('/api/vapi-config', (req, res) => {
    // Use public key if available, otherwise fall back to API key with warning
    const publicKey = process.env.VAPI_PUBLIC_KEY || process.env.VAPI_API_KEY;
    const isUsingPrivateKey = !process.env.VAPI_PUBLIC_KEY;
    
    res.json({
        publicKey: publicKey,
        assistantId: process.env.VAPI_AGENT_ID,
        webhookUrl: `http://localhost:${process.env.PORT || 3002}`,
        warning: isUsingPrivateKey ? "Using private key - web calls may not work. Get a public key from VAPI dashboard." : null,
        keyType: isUsingPrivateKey ? "private" : "public"
    });
});

// Create a web call session using the server's API key
app.post('/api/create-web-session', async (req, res) => {
    try {
        const { phone, email, name, business } = req.body;
        
        console.log('🌐 Creating web call session for:', { phone, email, name });
        
        // Try to create a temporary session or token using VAPI API
        const response = await axios.post(
            'https://api.vapi.ai/call/web',
            {
                assistantId: process.env.VAPI_AGENT_ID,
                customer: {
                    number: phone,
                    name: name,
                    email: email
                },
                metadata: {
                    business: business,
                    source: 'web-session'
                }
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.VAPI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Web session created:', response.data);
        res.json({
            success: true,
            session: response.data
        });
        
    } catch (error) {
        console.error('❌ Failed to create web session:', error.response?.data || error.message);
        
        // Fallback: Return configuration for direct use
        res.json({
            success: false,
            fallback: true,
            config: {
                assistantId: process.env.VAPI_AGENT_ID,
                // Try to generate a temporary token or use the API key
                apiKey: process.env.VAPI_API_KEY,
                message: 'Direct web session creation failed. Using fallback configuration.'
            }
        });
    }
});

// Generate personalized web call URL for customers
app.get('/api/customer-call-url/:email', async (req, res) => {
    try {
        const customerEmail = req.params.email;
        
        // Get customer data from database
        const { data: customer } = await supabase
            .from('users')
            .select('*')
            .eq('customer_email', customerEmail)
            .single();
        
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        
        // Generate personalized URL with customer parameters  
        const baseUrl = `http://localhost:3002/web-call-button.html`;
        const params = new URLSearchParams({
            email: customer.customer_email,
            phone: customer.customer_phone || '',
            name: customer.customer_name || '',
            business: customer.business_name || ''
        });
        
        const personalizedUrl = `${baseUrl}?${params.toString()}`;
        
        res.json({
            success: true,
            customer: {
                name: customer.customer_name,
                email: customer.customer_email,
                business: customer.business_name
            },
            callUrl: personalizedUrl,
            instructions: "Send this URL to the customer for easy web calling"
        });
        
    } catch (error) {
        console.error('❌ Customer URL generation error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Generate personalized customer dashboard URL
app.get('/api/customer-dashboard-url/:email', async (req, res) => {
    try {
        const customerEmail = req.params.email;
        
        // Get customer data from database
        const { data: customer } = await supabase
            .from('users')
            .select('*')
            .eq('customer_email', customerEmail)
            .single();
        
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        
        // Generate personalized dashboard URL with customer parameters  
        const baseUrl = `http://localhost:3002/customer-dashboard.html`;
        const params = new URLSearchParams({
            email: customer.customer_email,
            phone: customer.customer_phone || '',
            name: customer.customer_name || '',
            business: customer.business_name || ''
        });
        
        const dashboardUrl = `${baseUrl}?${params.toString()}`;
        
        // Calculate progress
        const calls = [
            customer.call_1_completed,
            customer.call_2_completed, 
            customer.call_3_completed,
            customer.call_4_completed
        ];
        const completed = calls.filter(Boolean).length;
        
        res.json({
            success: true,
            customer: {
                name: customer.customer_name,
                email: customer.customer_email,
                business: customer.business_name,
                progress: `${completed}/4 calls completed`,
                progressPercent: Math.round((completed / 4) * 100)
            },
            dashboardUrl: dashboardUrl,
            instructions: "Send this personalized dashboard URL to the customer"
        });
        
    } catch (error) {
        console.error('❌ Dashboard URL generation error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Monitoring API Endpoints

// Get current monitoring status
app.get('/api/monitor/status', async (req, res) => {
    try {
        const status = monitor.getStatus();
        res.json(status);
    } catch (error) {
        console.error('❌ Monitor status error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get call details
app.get('/api/monitor/call/:callId', async (req, res) => {
    try {
        const callId = req.params.callId;
        const callDetails = monitor.getCallDetails(callId);
        
        if (!callDetails) {
            return res.status(404).json({ error: 'Call not found' });
        }
        
        res.json(callDetails);
    } catch (error) {
        console.error('❌ Monitor call details error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get customer call history
app.get('/api/monitor/customer/:email', async (req, res) => {
    try {
        const email = req.params.email;
        const history = monitor.getCustomerHistory(email);
        res.json(history);
    } catch (error) {
        console.error('❌ Monitor customer history error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get stage analytics
app.get('/api/monitor/stage/:stage', async (req, res) => {
    try {
        const stage = parseInt(req.params.stage);
        if (stage < 1 || stage > 4) {
            return res.status(400).json({ error: 'Invalid stage (1-4)' });
        }
        
        const report = monitor.generateStageReport(stage);
        res.json(report);
    } catch (error) {
        console.error('❌ Monitor stage report error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get system analytics report
app.get('/api/monitor/report', async (req, res) => {
    try {
        const report = monitor.generateSystemReport();
        res.json(report);
    } catch (error) {
        console.error('❌ Monitor system report error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Save monitoring data
app.post('/api/monitor/save', async (req, res) => {
    try {
        monitor.saveToFile();
        res.json({ success: true, message: 'Monitoring data saved' });
    } catch (error) {
        console.error('❌ Monitor save error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Simulate webhook for testing
app.post('/api/monitor/simulate', async (req, res) => {
    try {
        const { type, callId, data } = req.body;
        
        switch (type) {
            case 'call_started':
                monitor.onCallStarted({ callId, ...data });
                break;
            case 'transcript':
                monitor.onTranscriptReceived({ callId, ...data });
                break;
            case 'extraction':
                monitor.onExtractionCompleted(callId, data);
                break;
            case 'call_completed':
                monitor.onCallCompleted(callId, data);
                break;
            case 'call_failed':
                monitor.onCallFailed(callId, data);
                break;
            default:
                return res.status(400).json({ error: 'Invalid simulation type' });
        }
        
        res.json({ success: true, message: `Simulated ${type} event` });
    } catch (error) {
        console.error('❌ Monitor simulation error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Start server with automatic port cleanup
async function startServer() {
    await killExistingServer();
    
    app.listen(3002, () => {
        console.log('✅ Server running on http://localhost:3002');
        console.log('📊 Legacy API: http://localhost:3002/api/all');
        console.log('🎤 VAPI Webhook: http://localhost:3002/api/vapi-webhook');
        console.log('👤 Customer API: http://localhost:3002/api/customer-completeness/:email');
        console.log('❓ Missing Info: http://localhost:3002/api/missing-info/:email');
        console.log('🔬 Test Extraction: http://localhost:3002/api/test-extraction');
        console.log('📈 Info Tracker: http://localhost:3002/info-tracker.html');
        console.log('');
        console.log('🧠 Intelligent Call System:');
        console.log('🚀 Smart Call: POST http://localhost:3002/api/intelligent-call');
        console.log('🗺️  Customer Journey: GET http://localhost:3002/api/customer-journey/:email');
        console.log('📊 Progress Dashboard: GET http://localhost:3002/api/progress-dashboard/:email');
        console.log('📝 Personalized Prompt: POST http://localhost:3002/api/personalized-prompt');
        console.log('');
        console.log('🚀 Dynamic VAPI Endpoints:');
        console.log('📞 Start Call: POST http://localhost:3002/api/start-call');
        console.log('🔄 Update Agent: POST http://localhost:3002/api/update-agent');
        console.log('🎯 Next Stage: GET http://localhost:3002/api/next-call-stage/:email');
        console.log('📝 Test Prompt: POST http://localhost:3002/api/test-prompt');
        console.log('');
        console.log('🌐 Web Call System:');
        console.log('⚙️  VAPI Config: GET http://localhost:3002/api/vapi-config');
        console.log('🔗 Customer URL: GET http://localhost:3002/api/customer-call-url/:email');
        console.log('📊 Dashboard URL: GET http://localhost:3002/api/customer-dashboard-url/:email');
        console.log('');
        console.log('📊 Monitoring Endpoints:');
        console.log('📈 Monitor Status: GET http://localhost:3002/api/monitor/status');
        console.log('🔍 Call Details: GET http://localhost:3002/api/monitor/call/:callId');
        console.log('📋 Customer History: GET http://localhost:3002/api/monitor/customer/:email');
        console.log('📊 Stage Analytics: GET http://localhost:3002/api/monitor/stage/:stage');
        console.log('📑 System Report: GET http://localhost:3002/api/monitor/report');
        console.log('🎭 Simulate Events: POST http://localhost:3002/api/monitor/simulate');
        console.log('');
        console.log('🖥️  Dashboards:');
        console.log('🏠 System Home (Table of Contents): http://localhost:3002/system-home.html');
        console.log('📊 Stage Monitor: http://localhost:3002/stage-monitor.html');
        console.log('📞 Call Dashboard: http://localhost:3002/call-dashboard.html');
        console.log('📞 Web Call Dashboard: http://localhost:3002/web-call-dashboard.html');
        console.log('🎤 Web Call Button: http://localhost:3002/web-call-button.html');
        console.log('👤 Customer Dashboard: http://localhost:3002/customer-dashboard.html');
        console.log('🔧 Admin Dashboard: http://localhost:3002/admin-dashboard.html');
    });
}

startServer().catch(console.error);
