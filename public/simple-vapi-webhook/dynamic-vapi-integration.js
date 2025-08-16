// Dynamic VAPI Integration - Change System Prompt Per Call
const fs = require('fs');
const path = require('path');

class DynamicVAPIManager {
    constructor() {
        this.vapiApiKey = process.env.VAPI_API_KEY;
        this.vapiBaseUrl = 'https://api.vapi.ai';
        this.agentId = process.env.VAPI_AGENT_ID; // Single agent ID
        
        // Load all call stage prompts
        this.loadCallStagePrompts();
    }
    
    loadCallStagePrompts() {
        const promptsDir = path.join(__dirname, 'vapi-agent-configs');
        
        this.callPrompts = {
            1: fs.readFileSync(path.join(promptsDir, 'call-1-agent-prompt.md'), 'utf8'),
            2: fs.readFileSync(path.join(promptsDir, 'call-2-agent-prompt.md'), 'utf8'),
            3: fs.readFileSync(path.join(promptsDir, 'call-3-agent-prompt.md'), 'utf8'),
            4: fs.readFileSync(path.join(promptsDir, 'call-4-agent-prompt.md'), 'utf8')
        };
    }
    
    async updateAgentForCallStage(callStage, customerData = {}) {
        try {
            console.log(`🔄 Updating VAPI agent for Call Stage ${callStage}...`);
            
            // Get the appropriate prompt for this call stage
            const systemPrompt = this.callPrompts[callStage];
            if (!systemPrompt) {
                throw new Error(`No prompt found for call stage ${callStage}`);
            }
            
            // Customize prompt with customer data if available
            const customizedPrompt = this.customizePrompt(systemPrompt, customerData);
            
            // Update the VAPI agent via API - with correct VAPI structure for timeout prevention
            const updatePayload = {
                model: {
                    provider: "openai",
                    model: "gpt-4o",
                    temperature: 0.3,
                    messages: [
                        {
                            role: "system",
                            content: customizedPrompt
                        }
                    ]
                },
                endCallPhrases: [
                    "goodbye", 
                    "thank you for your time", 
                    "end call",
                    "that concludes our call",
                    "talk to you soon",
                    "have a great day"
                ],
                voice: {
                    provider: "11labs",
                    voiceId: "21m00Tcm4TlvDq8ikWAM",  // Professional voice
                    speed: 1.0,
                    stability: 0.8
                }
            };
            
            console.log(`🔧 VAPI API Call: PATCH ${this.vapiBaseUrl}/assistant/${this.agentId}`);
            console.log(`🔑 API Key: ${this.vapiApiKey.substring(0, 8)}...`);
            console.log(`📦 Payload:`, JSON.stringify(updatePayload, null, 2));
            
            const response = await fetch(`${this.vapiBaseUrl}/assistant/${this.agentId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${this.vapiApiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatePayload)
            });
            
            if (!response.ok) {
                throw new Error(`VAPI API error: ${response.status} ${response.statusText}`);
            }
            
            const result = await response.json();
            console.log(`✅ VAPI agent updated for Call Stage ${callStage}`);
            
            return result;
            
        } catch (error) {
            console.error(`❌ Error updating VAPI agent:`, error);
            throw error;
        }
    }
    
    customizePrompt(basePrompt, customerData) {
        let customized = basePrompt;
        
        // Replace placeholders with actual customer data
        if (customerData.name) {
            customized = customized.replace(/\[Name\]/g, customerData.name);
        }
        
        if (customerData.businessName) {
            customized = customized.replace(/\[Business Name\]/g, customerData.businessName);
        }
        
        if (customerData.state) {
            customized = customized.replace(/\[State\]/g, customerData.state);
        }
        
        if (customerData.industry) {
            customized = customized.replace(/\[Industry\]/g, customerData.industry);
        }
        
        return customized;
    }
    
    async startCallWithStage(callStage, customerData = {}) {
        try {
            // Validate phone number format
            if (!customerData.phone) {
                throw new Error('Phone number is required for call initiation');
            }
            
            // Ensure phone number is in proper E.164 format
            let phoneNumber = customerData.phone.toString().trim();
            
            // Remove all non-digit characters except +
            phoneNumber = phoneNumber.replace(/[^\d+]/g, '');
            
            // If it doesn't start with +, assume it's a US number
            if (!phoneNumber.startsWith('+')) {
                // Remove any leading 1 for US numbers
                if (phoneNumber.startsWith('1') && phoneNumber.length === 11) {
                    phoneNumber = phoneNumber.substring(1);
                }
                // Add +1 country code for US
                phoneNumber = '+1' + phoneNumber;
            }
            
            // Validate E.164 format (+ followed by 1-15 digits)
            if (!/^\+[1-9]\d{1,14}$/.test(phoneNumber)) {
                throw new Error(`Invalid phone number format: ${phoneNumber}. Must be E.164 format (e.g., +15551234567)`);
            }
            
            console.log(`📞 Initiating call to: ${phoneNumber}`);
            
            // First update the agent for this call stage
            await this.updateAgentForCallStage(callStage, customerData);
            
            // Then initiate the call - Use configured VAPI phone number
            const callPayload = {
                assistantId: this.agentId,
                phoneNumberId: "2d5a3ced-7573-4482-bc71-1e5ad4e5af97", // Your VAPI phone number ID
                customer: {
                    number: phoneNumber
                }
            };
            
            console.log(`🔧 Call Payload:`, JSON.stringify(callPayload, null, 2));
            
            const response = await fetch(`${this.vapiBaseUrl}/call`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.vapiApiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(callPayload)
            });
            
            if (!response.ok) {
                const errorBody = await response.text();
                console.error('❌ VAPI call error details:', errorBody);
                throw new Error(`VAPI call initiation error: ${response.status} ${response.statusText} - ${errorBody}`);
            }
            
            const result = await response.json();
            console.log(`📞 Call ${callStage} initiated for ${customerData.name}`);
            
            return result;
            
        } catch (error) {
            console.error(`❌ Error starting call:`, error);
            throw error;
        }
    }
    
    async getNextCallStage(customerEmail) {
        try {
            // Check customer's current progress
            const response = await fetch(`http://localhost:3002/api/customer-completeness/${encodeURIComponent(customerEmail)}`);
            
            if (!response.ok) {
                // New customer, start with Call 1
                return 1;
            }
            
            const customerData = await response.json();
            
            // Determine next call stage based on completion
            if (customerData.completionScore < 25) return 1;
            if (customerData.completionScore < 50) return 2;
            if (customerData.completionScore < 75) return 3;
            if (customerData.completionScore < 100) return 4;
            
            // All calls complete
            return null;
            
        } catch (error) {
            console.error('Error determining next call stage:', error);
            return 1; // Default to Call 1 on error
        }
    }
    
    // Update agent with custom prompt (for intelligent call system)
    async updateAgentWithCustomPrompt(callStage, customPrompt, customerData = {}) {
        try {
            console.log(`🎨 Updating VAPI agent with custom prompt for Call Stage ${callStage}...`);
            
            const updatePayload = {
                model: {
                    provider: "openai",
                    model: "gpt-4o",
                    temperature: 0.3,
                    messages: [
                        {
                            role: "system",
                            content: customPrompt
                        }
                    ]
                },
                endCallPhrases: [
                    "goodbye", 
                    "thank you for your time", 
                    "end call",
                    "that concludes our call",
                    "talk to you soon",
                    "have a great day"
                ],
                voice: {
                    provider: "11labs",
                    voiceId: "21m00Tcm4TlvDq8ikWAM",  // Professional voice
                    speed: 1.0,
                    stability: 0.8
                }
            };
            
            const response = await fetch(`${this.vapiBaseUrl}/assistant/${this.agentId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${this.vapiApiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatePayload)
            });
            
            if (!response.ok) {
                throw new Error(`VAPI API error: ${response.status} ${response.statusText}`);
            }
            
            const result = await response.json();
            console.log(`✅ VAPI agent updated with custom prompt for Call Stage ${callStage}`);
            
            return result;
            
        } catch (error) {
            console.error(`❌ Error updating VAPI agent with custom prompt:`, error);
            throw error;
        }
    }
}

module.exports = DynamicVAPIManager;