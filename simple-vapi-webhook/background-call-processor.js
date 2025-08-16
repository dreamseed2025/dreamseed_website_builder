// Background Call Processor - Automatically executes scheduled calls
const { createClient } = require('@supabase/supabase-js');
const IntelligentCallSystem = require('./intelligent-call-system');
const DynamicVAPIManager = require('./dynamic-vapi-integration');
const RequirementsExtractor = require('./requirements/extraction-logic');

class BackgroundCallProcessor {
    constructor() {
        this.supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );
        
        this.extractor = new RequirementsExtractor();
        this.vapiManager = new DynamicVAPIManager();
        this.intelligentCallSystem = new IntelligentCallSystem(
            this.supabase, 
            this.vapiManager, 
            this.extractor
        );
        
        this.isRunning = false;
        this.checkInterval = 5 * 60 * 1000; // Check every 5 minutes
        this.processingQueue = new Set(); // Prevent duplicate processing
    }
    
    start() {
        if (this.isRunning) {
            console.log('⚠️ Background call processor already running');
            return;
        }
        
        this.isRunning = true;
        console.log('🚀 Background call processor started - checking every 5 minutes');
        
        // Run immediately, then on interval
        this.processScheduledCalls();
        this.intervalId = setInterval(() => {
            this.processScheduledCalls();
        }, this.checkInterval);
    }
    
    stop() {
        if (!this.isRunning) {
            return;
        }
        
        this.isRunning = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
        console.log('🛑 Background call processor stopped');
    }
    
    async processScheduledCalls() {
        if (!this.isRunning) return;
        
        try {
            console.log('🔍 Checking for scheduled calls...');
            
            // Get all customers with scheduled calls that are due
            const now = new Date();
            const { data: scheduledCustomers, error } = await this.supabase
                .from('users')
                .select('*')
                .not('next_call_scheduled', 'is', null)
                .lte('next_call_scheduled', now.toISOString())
                .order('next_call_scheduled', { ascending: true });
            
            if (error) {
                console.error('❌ Error fetching scheduled calls:', error);
                return;
            }
            
            if (!scheduledCustomers || scheduledCustomers.length === 0) {
                console.log('📭 No scheduled calls due at this time');
                return;
            }
            
            console.log(`📋 Found ${scheduledCustomers.length} scheduled calls to process`);
            
            // Process each scheduled call
            for (const customer of scheduledCustomers) {
                await this.processCustomerCall(customer);
            }
            
        } catch (error) {
            console.error('❌ Background processor error:', error);
        }
    }
    
    async processCustomerCall(customer) {
        const customerId = customer.customer_email;
        
        // Prevent duplicate processing
        if (this.processingQueue.has(customerId)) {
            console.log(`⏭️ Skipping ${customer.customer_name} - already processing`);
            return;
        }
        
        this.processingQueue.add(customerId);
        
        try {
            const callStage = customer.next_call_stage || 1;
            console.log(`📞 Processing scheduled Call ${callStage} for ${customer.customer_name}`);
            
            // Validate call timing (not too early/late)
            const now = new Date();
            const hour = now.getHours();
            
            if (hour < 9 || hour > 18) {
                console.log(`⏰ Delaying call for ${customer.customer_name} - outside business hours (${hour}:00)`);
                
                // Reschedule for next business day at 9 AM
                const nextBusinessDay = new Date(now);
                nextBusinessDay.setDate(nextBusinessDay.getDate() + 1);
                nextBusinessDay.setHours(9, 0, 0, 0);
                
                await this.supabase
                    .from('users')
                    .update({
                        next_call_scheduled: nextBusinessDay.toISOString(),
                        last_schedule_reason: 'outside_business_hours'
                    })
                    .eq('customer_email', customerId);
                
                return;
            }
            
            // Initiate the call
            const callResult = await this.intelligentCallSystem.initiateIntelligentCall({
                customerEmail: customerId,
                forceStage: callStage,
                source: 'background_processor'
            });
            
            // Update customer record - clear scheduled call
            await this.supabase
                .from('users')
                .update({
                    next_call_scheduled: null,
                    next_call_stage: null,
                    last_call_initiated: now.toISOString(),
                    last_call_stage: callStage,
                    call_initiation_method: 'auto_scheduled',
                    background_call_id: callResult.callId
                })
                .eq('customer_email', customerId);
            
            console.log(`✅ Successfully initiated Call ${callStage} for ${customer.customer_name}`);
            console.log(`   Call ID: ${callResult.callId}`);
            
        } catch (error) {
            console.error(`❌ Error processing call for ${customer.customer_name}:`, error);
            
            // Update customer with error info and reschedule
            const retryTime = new Date(Date.now() + 30 * 60 * 1000); // Retry in 30 minutes
            
            await this.supabase
                .from('users')
                .update({
                    next_call_scheduled: retryTime.toISOString(),
                    last_call_error: error.message,
                    call_retry_count: (customer.call_retry_count || 0) + 1
                })
                .eq('customer_email', customerId);
                
        } finally {
            this.processingQueue.delete(customerId);
        }
    }
    
    async getQueueStatus() {
        try {
            const now = new Date();
            const { data: scheduled, error } = await this.supabase
                .from('users')
                .select('customer_name, customer_email, next_call_scheduled, next_call_stage')
                .not('next_call_scheduled', 'is', null)
                .order('next_call_scheduled', { ascending: true });
            
            if (error) throw error;
            
            const due = scheduled.filter(c => new Date(c.next_call_scheduled) <= now);
            const upcoming = scheduled.filter(c => new Date(c.next_call_scheduled) > now);
            
            return {
                isRunning: this.isRunning,
                totalScheduled: scheduled.length,
                due: due.length,
                upcoming: upcoming.length,
                processingNow: this.processingQueue.size,
                scheduledCalls: scheduled.map(c => ({
                    name: c.customer_name,
                    email: c.customer_email,
                    stage: c.next_call_stage,
                    scheduled: c.next_call_scheduled,
                    status: new Date(c.next_call_scheduled) <= now ? 'due' : 'upcoming'
                }))
            };
            
        } catch (error) {
            console.error('❌ Error getting queue status:', error);
            return { error: error.message };
        }
    }
    
    // Manual trigger for testing
    async processCustomerNow(customerEmail) {
        try {
            const { data: customer } = await this.supabase
                .from('users')
                .select('*')
                .eq('customer_email', customerEmail)
                .single();
                
            if (!customer) {
                throw new Error('Customer not found');
            }
            
            await this.processCustomerCall(customer);
            return { success: true, message: `Processed call for ${customer.customer_name}` };
            
        } catch (error) {
            console.error('❌ Manual processing error:', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = BackgroundCallProcessor;