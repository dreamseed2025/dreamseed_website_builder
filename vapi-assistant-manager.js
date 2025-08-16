/**
 * VAPI Assistant Manager
 * Handles creation and management of individual VAPI assistants for premium users
 */

class VAPIAssistantManager {
    constructor(apiKey, supabase) {
        this.apiKey = apiKey;
        this.supabase = supabase;
        this.baseUrl = 'https://api.vapi.ai';
        
        // Default assistant IDs
        this.sharedAssistantId = 'af397e88-c286-416f-9f74-e7665401bdb7';
        this.adminAssistantId = 'admin-assistant-id'; // Replace with actual admin assistant ID
    }

    /**
     * Get the appropriate assistant ID for a user
     */
    async getAssistantForUser(userEmail) {
        try {
            console.log('Getting assistant for user:', userEmail);
            
            if (!this.supabase) {
                console.log('No Supabase connection, using shared assistant');
                return this.sharedAssistantId;
            }

            // Get user data and assistant assignment
            const { data: users, error } = await this.supabase
                .from('users')
                .select('auth_user_id, account_type, payment_status, subscription_type, individual_assistant_id, assistant_type')
                .eq('customer_email', userEmail)
                .limit(1);

            if (error || !users || users.length === 0) {
                console.log('User not found, using shared assistant');
                return this.sharedAssistantId;
            }

            const user = users[0];
            console.log('User data:', user);

            // Check what type of assistant they should have
            const { data: assignment, error: assignError } = await this.supabase
                .rpc('assign_assistant_type', { 
                    user_auth_id: user.auth_user_id 
                });

            if (assignError) {
                console.error('Error checking assistant assignment:', assignError);
                return this.sharedAssistantId;
            }

            const assistantInfo = assignment[0];
            console.log('Assistant assignment:', assistantInfo);

            // Handle different assistant types
            if (assistantInfo.assistant_type === 'admin') {
                return this.adminAssistantId;
            }

            if (assistantInfo.assistant_type === 'individual') {
                if (assistantInfo.individual_assistant_id) {
                    console.log('Using existing individual assistant:', assistantInfo.individual_assistant_id);
                    return assistantInfo.individual_assistant_id;
                } else if (assistantInfo.needs_creation) {
                    console.log('Creating new individual assistant for user');
                    return await this.createIndividualAssistant(user);
                }
            }

            // Default to shared assistant
            console.log('Using shared assistant');
            return this.sharedAssistantId;

        } catch (error) {
            console.error('Error getting assistant for user:', error);
            return this.sharedAssistantId;
        }
    }

    /**
     * Create an individual VAPI assistant for a premium user
     */
    async createIndividualAssistant(user) {
        try {
            console.log('Creating individual assistant for:', user.customer_email);

            const assistantConfig = {
                name: `DreamSeed Assistant - ${user.customer_name || user.customer_email}`,
                model: {
                    provider: "openai",
                    model: "gpt-4",
                    temperature: 0.7,
                    maxTokens: 500
                },
                voice: {
                    provider: "11labs",
                    voiceId: "21m00Tcm4TlvDq8ikWAM" // Replace with your preferred voice
                },
                firstMessage: `Hello ${user.customer_name || 'valued customer'}! I'm your personal DreamSeed business formation assistant. I'll remember our conversations and help guide you through your ${user.subscription_type} package. How can I assist you today?`,
                systemMessage: this.generatePersonalizedSystemMessage(user),
                transcriber: {
                    provider: "deepgram",
                    model: "nova-2",
                    language: "en-US"
                },
                endCallMessage: "Thank you for your consultation. I'll remember everything we discussed for our next conversation. Have a great day!",
                endCallPhrases: ["goodbye", "talk to you later", "bye", "end call"],
                recordingEnabled: true,
                silenceTimeoutSeconds: 30,
                maxDurationSeconds: 1800, // 30 minutes
                backgroundSound: "office",
                metadata: {
                    userId: user.auth_user_id,
                    userEmail: user.customer_email,
                    subscriptionType: user.subscription_type,
                    createdAt: new Date().toISOString()
                }
            };

            const response = await fetch(`${this.baseUrl}/assistant`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(assistantConfig)
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`VAPI API error: ${response.status} - ${errorData}`);
            }

            const newAssistant = await response.json();
            console.log('Created new assistant:', newAssistant.id);

            // Save the assistant ID to Supabase
            const { error: saveError } = await this.supabase
                .rpc('save_individual_assistant', {
                    user_auth_id: user.auth_user_id,
                    assistant_id: newAssistant.id,
                    assistant_name: assistantConfig.name
                });

            if (saveError) {
                console.error('Error saving assistant ID to database:', saveError);
                // Still return the assistant ID even if saving fails
            }

            return newAssistant.id;

        } catch (error) {
            console.error('Error creating individual assistant:', error);
            // Fallback to shared assistant if creation fails
            return this.sharedAssistantId;
        }
    }

    /**
     * Generate personalized system message for individual assistant
     */
    generatePersonalizedSystemMessage(user) {
        const baseMessage = `You are ${user.customer_name || user.customer_email}'s personal DreamSeed business formation consultant.`;
        
        let personalizedMessage = baseMessage + `

CUSTOMER PROFILE:
- Name: ${user.customer_name || 'Customer'}
- Email: ${user.customer_email}
- Subscription: ${user.subscription_type} ($${this.getSubscriptionPrice(user.subscription_type)})
- Account Type: ${user.account_type}
- Payment Status: ${user.payment_status}

PERSONALIZATION INSTRUCTIONS:
- Always remember this customer's name and preferences
- Reference their ${user.subscription_type} subscription benefits
- Maintain conversation history and context between calls
- Provide ${user.subscription_type}-level service and detail
- Focus on their specific business formation needs

SUBSCRIPTION BENEFITS:
${this.getSubscriptionBenefits(user.subscription_type)}

Your personality should be:
- Professional but friendly and personable
- Knowledgeable about business formation
- Attentive to their specific needs and timeline
- Proactive in suggesting next steps
- Confident in DreamSeed's services

Always maintain context from previous conversations and provide personalized guidance based on their journey with DreamSeed.`;

        return personalizedMessage;
    }

    /**
     * Get subscription price for display
     */
    getSubscriptionPrice(subscriptionType) {
        const prices = {
            'basic': '299',
            'premium': '599', 
            'enterprise': '999'
        };
        return prices[subscriptionType] || '299';
    }

    /**
     * Get subscription benefits for system message
     */
    getSubscriptionBenefits(subscriptionType) {
        const benefits = {
            'basic': '- LLC formation and state filing\n- Basic support during business hours',
            'premium': '- LLC formation and state filing\n- EIN (Tax ID) application\n- Operating Agreement template\n- Priority support\n- 4 consultation calls',
            'enterprise': '- Everything in Premium\n- Custom Operating Agreement\n- Legal document review\n- Priority phone support\n- Unlimited consultation calls\n- White-glove service'
        };
        return benefits[subscriptionType] || benefits['basic'];
    }

    /**
     * Update existing assistant with new user context
     */
    async updateAssistantContext(assistantId, userContext) {
        try {
            const updateConfig = {
                systemMessage: this.generatePersonalizedSystemMessage(userContext),
                metadata: {
                    ...userContext,
                    lastUpdated: new Date().toISOString()
                }
            };

            const response = await fetch(`${this.baseUrl}/assistant/${assistantId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateConfig)
            });

            if (!response.ok) {
                throw new Error(`Failed to update assistant: ${response.status}`);
            }

            console.log('Assistant context updated successfully');
            return true;

        } catch (error) {
            console.error('Error updating assistant context:', error);
            return false;
        }
    }

    /**
     * Get assistant usage statistics
     */
    async getAssistantStats(assistantId) {
        try {
            const response = await fetch(`${this.baseUrl}/assistant/${assistantId}/calls`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to get assistant stats: ${response.status}`);
            }

            const calls = await response.json();
            return {
                totalCalls: calls.length,
                totalDuration: calls.reduce((sum, call) => sum + (call.duration || 0), 0),
                lastCallDate: calls.length > 0 ? calls[0].createdAt : null
            };

        } catch (error) {
            console.error('Error getting assistant stats:', error);
            return null;
        }
    }
}

// Export for use in browser
if (typeof window !== 'undefined') {
    window.VAPIAssistantManager = VAPIAssistantManager;
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VAPIAssistantManager;
}