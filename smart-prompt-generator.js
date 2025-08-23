import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import BusinessLaunchChecklist from './business-launch-checklist.js';

const supabase = createClient(
  'https://kxldodhrhqbwyvgyuqfd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4bGRvZGhyaHFid3l2Z3l1cWZkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTEyMDA3OCwiZXhwIjoyMDcwNjk2MDc4fQ.ByC7SLkJ2zeyhDN0nyWUNw-otETetisbjKM1sSCfS2Q'
);

const VAPI_PRIVATE_KEY = '3359a2eb-02e4-4f31-a5aa-37c2a020a395';

const CALL_ASSISTANTS = {
  1: '60400523-a331-4c4b-935d-b666ee013d42', // Call 1 - Foundation
  2: '2496625c-6fe8-4304-8b6d-045870680189', // Call 2 - Brand Identity
  3: 'b9f38474-a065-458f-bb03-eb62d21f529a', // Call 3 - Operations Setup
  4: '87416134-cfc7-47de-ad97-4951d3905ea9'  // Call 4 - Launch Strategy
};

class SmartPromptGenerator {
  
  constructor() {
    this.businessChecklist = new BusinessLaunchChecklist();
  }
  
  // Define what data each call should collect
  getRequiredFields() {
    return {
      1: { // Foundation Call
        required: ['customer_name', 'customer_email', 'customer_phone', 'entity_type', 'state_of_operation', 'business_concept', 'urgency_level'],
        nice_to_have: ['business_name', 'target_customers', 'timeline_months']
      },
      2: { // Brand Identity Call  
        required: ['business_name', 'brand_colors', 'logo_style', 'domain_preferences'],
        nice_to_have: ['tagline', 'brand_personality', 'competitor_analysis']
      },
      3: { // Operations Call
        required: ['banking_preference', 'accounting_software', 'transaction_volume', 'tax_structure'],
        nice_to_have: ['insurance_needs', 'compliance_requirements', 'operational_location']
      },
      4: { // Launch Call
        required: ['launch_timeline', 'marketing_strategy', 'revenue_goals', 'growth_plan'],
        nice_to_have: ['funding_needs', 'partnership_goals', 'success_metrics']
      }
    };
  }
  
  async analyzeCustomerData(customerPhone) {
    try {
      console.log(`🔍 Analyzing comprehensive business checklist for: ${customerPhone}`);
      
      // Get current customer data
      const { data: customer, error } = await supabase
        .from('users')
        .select('*')
        .eq('customer_phone', customerPhone)
        .single();
      
      if (error || !customer) {
        console.log('📝 New customer - starting fresh');
        return { isNew: true, customer: null, gaps: [], stage: 1, checklist: null };
      }
      
      // Get comprehensive checklist analysis
      const checklistAnalysis = await this.businessChecklist.calculateCompletionPercentage(customerPhone);
      
      // Determine current call stage
      const stage = this.determineNextCallStage(customer);
      
      if (stage > 4) {
        console.log('🎉 Customer completed all calls');
        return { isComplete: true, customer, checklist: checklistAnalysis, stage: 4 };
      }
      
      // Get comprehensive missing data for current stage
      const stageChecklist = this.businessChecklist.getComprehensiveChecklist()[stage];
      const missingItems = this.getComprehensiveMissingItems(customer, stage, stageChecklist);
      
      // Generate priority action items
      const actionItems = this.businessChecklist.generateActionItems(checklistAnalysis.breakdown, customer);
      
      console.log(`📊 Comprehensive Customer Analysis:`);
      console.log(`   👤 Name: ${customer.customer_name || 'Missing'}`);
      console.log(`   📧 Email: ${customer.customer_email || 'Missing'}`);
      console.log(`   🏢 Business: ${customer.business_name || 'Missing'}`);
      console.log(`   📞 Stage: ${stage}`);
      console.log(`   📈 Overall Completion: ${checklistAnalysis.completionPercentage}%`);
      console.log(`   ✅ Items Complete: ${checklistAnalysis.completedItems}/${checklistAnalysis.totalItems}`);
      console.log(`   🎯 Priority Actions: ${actionItems.length} items`);
      
      return {
        customer,
        stage,
        checklist: checklistAnalysis,
        missing: missingItems,
        actionItems: actionItems.slice(0, 5), // Top 5 priority items
        hasData: this.getExistingData(customer),
        isNew: false,
        isComplete: false
      };
      
    } catch (error) {
      console.error('❌ Analysis error:', error);
      return { isNew: true, customer: null, gaps: [], stage: 1, checklist: null };
    }
  }
  
  determineNextCallStage(customer) {
    if (!customer.call_1_completed) return 1;
    if (!customer.call_2_completed) return 2;
    if (!customer.call_3_completed) return 3;
    if (!customer.call_4_completed) return 4;
    return 4; // Completed
  }
  
  findMissingFields(customer, fields) {
    return fields.filter(field => {
      const value = customer[field];
      return !value || value.trim() === '' || value === 'Not extracted';
    });
  }
  
  getComprehensiveMissingItems(customer, stage, stageChecklist) {
    const missing = { critical: [], high: [], medium: [], low: [] };
    
    for (const [category, fields] of Object.entries(stageChecklist)) {
      for (const field of fields) {
        if (!customer[field] || customer[field] === 'Not extracted' || customer[field].trim() === '') {
          // Categorize by priority based on field importance
          const priority = this.getFieldPriority(field, stage);
          missing[priority].push({
            field: field,
            category: category,
            stage: stage,
            question: this.generateQuestionForField(field)
          });
        }
      }
    }
    
    return missing;
  }
  
  getFieldPriority(field, stage) {
    const criticalFields = [
      'customer_name', 'customer_email', 'business_name', 'entity_type', 
      'state_of_operation', 'launch_timeline', 'primary_services_products'
    ];
    
    const highFields = [
      'business_purpose', 'brand_personality', 'target_audience', 'business_banking',
      'accounting_software', 'marketing_channels', 'target_market_definition'
    ];
    
    const mediumFields = [
      'color_preferences', 'logo_type_preference', 'business_address', 'hours_of_operation',
      'payment_processing', 'marketing_budget', 'content_strategy'
    ];
    
    if (criticalFields.includes(field)) return 'critical';
    if (highFields.includes(field)) return 'high';
    if (mediumFields.includes(field)) return 'medium';
    return 'low';
  }
  
  generateQuestionForField(field) {
    const questions = {
      // Contact Info
      'first_name': 'What\'s your first name?',
      'last_name': 'What\'s your last name?',
      'customer_email': 'What\'s your email address?',
      'address': 'What\'s your home address?',
      'city': 'What city are you located in?',
      
      // Business Formation
      'business_name': 'What do you want to call your business?',
      'entity_type': 'What type of business entity? (LLC, Corporation, etc.)',
      'business_purpose': 'What\'s the main purpose of your business?',
      'registered_agent': 'Who will be your registered agent?',
      
      // Brand Identity
      'brand_personality': 'How would you describe your brand personality?',
      'target_audience': 'Who is your target audience?',
      'color_preferences': 'What colors represent your brand?',
      'logo_type_preference': 'What style of logo do you prefer?',
      
      // Operations
      'business_banking': 'Which bank would you prefer for business banking?',
      'accounting_software': 'What accounting software would you like to use?',
      'business_location_type': 'Where will you operate your business?',
      
      // Launch Strategy
      'launch_timeline': 'When do you want to launch your business?',
      'marketing_channels': 'How will you market your business?',
      'target_market_definition': 'Who exactly is your ideal customer?',
      'marketing_budget': 'What\'s your marketing budget?'
    };
    
    return questions[field] || `Tell me about your ${field.replace(/_/g, ' ')}`;
  }

  getExistingData(customer) {
    const existing = {};
    
    // Get all customer fields that have values
    Object.keys(customer).forEach(field => {
      if (customer[field] && 
          customer[field] !== 'Not extracted' && 
          customer[field].toString().trim() !== '' &&
          !['id', 'created_at', 'updated_at', 'status'].includes(field)) {
        existing[field] = customer[field];
      }
    });
    
    return existing;
  }
  
  generatePersonalizedPrompt(analysis) {
    const { customer, stage, checklist, missing, actionItems, hasData, isNew, isComplete } = analysis;
    
    if (isNew) {
      return this.generateNewCustomerPrompt(stage);
    }
    
    if (isComplete) {
      return this.generateCompletionPrompt(customer, checklist);
    }
    
    return this.generateComprehensiveGapFillingPrompt(customer, stage, missing, actionItems, hasData, checklist);
  }
  
  generateNewCustomerPrompt(stage) {
    const prompts = {
      1: `You are Sarah from DreamSeed, helping entrepreneurs start their businesses. This is a new customer's first call.

GOAL: Collect foundation information for business formation.

Ask for these in natural conversation:
- Full name
- Email address  
- Phone number
- What type of business (LLC, Corporation, etc.)
- Which state they want to form in
- Brief business concept/what they do
- How urgent this is (timeline)

Be conversational, warm, and helpful. Don't make it feel like a form.`,

      2: `You are Sarah from DreamSeed. This customer has started their business formation journey.

GOAL: Help with brand identity and visual elements.

Focus on collecting:
- Business name (if not set)
- Brand color preferences
- Logo style preferences  
- Domain name ideas
- Brand personality

Be creative and help them think through their brand identity.`,

      3: `You are Sarah from DreamSeed. This customer is setting up business operations.

GOAL: Help establish business systems and operations.

Focus on:
- Banking preferences (which bank)
- Accounting software choice
- Expected transaction volume
- Tax structure preferences (S-Corp election, etc.)
- Operational considerations

Be practical and guide them through business setup decisions.`,

      4: `You are Sarah from DreamSeed. This customer is planning their business launch.

GOAL: Create launch strategy and growth plan.

Focus on:
- Launch timeline
- Marketing strategy
- Revenue goals (first year)
- Growth plans
- Success metrics

Be strategic and help them plan for success.`
    };
    
    return prompts[stage] || prompts[1];
  }
  
  generateGapFillingPrompt(customer, stage, missing, hasData) {
    const name = customer.customer_name || 'there';
    const businessName = customer.business_name || 'your business';
    
    // Build context from existing data
    let context = `You are Sarah from DreamSeed. You're speaking with ${name}`;
    
    if (hasData.business_name) {
      context += ` about ${hasData.business_name}`;
    }
    if (hasData.entity_type) {
      context += ` (${hasData.entity_type})`;
    }
    if (hasData.state_of_operation) {
      context += ` in ${hasData.state_of_operation}`;
    }
    
    context += `.

WHAT YOU ALREADY KNOW:
`;
    
    // Add existing data context
    Object.entries(hasData).forEach(([key, value]) => {
      const fieldNames = {
        customer_name: 'Name',
        customer_email: 'Email', 
        business_name: 'Business Name',
        entity_type: 'Entity Type',
        state_of_operation: 'State',
        urgency_level: 'Urgency',
        business_concept: 'Business Concept',
        brand_colors: 'Brand Colors',
        logo_style: 'Logo Style',
        banking_preference: 'Banking',
        revenue_goals: 'Revenue Goals'
      };
      
      context += `- ${fieldNames[key] || key}: ${value}\n`;
    });
    
    context += `
WHAT YOU STILL NEED TO ASK:
`;
    
    // Add missing required fields
    if (missing.required.length > 0) {
      context += `REQUIRED:\n`;
      missing.required.forEach(field => {
        const questions = {
          customer_name: '- What\'s your full name?',
          customer_email: '- What\'s your email address?',
          business_name: '- What do you want to call your business?',
          entity_type: '- What type of business entity? (LLC, Corporation, etc.)',
          state_of_operation: '- Which state do you want to form in?',
          urgency_level: '- How urgent is this? What\'s your timeline?',
          business_concept: '- Tell me about your business - what do you do?',
          brand_colors: '- What colors represent your brand?',
          logo_style: '- What style of logo appeals to you?',
          domain_preferences: '- Any ideas for your website domain?',
          banking_preference: '- Which bank would you prefer for business banking?',
          accounting_software: '- What accounting software would you like to use?',
          transaction_volume: '- How many transactions do you expect monthly?',
          tax_structure: '- Any preferences on tax structure (S-Corp election, etc.)?',
          launch_timeline: '- When do you want to launch?',
          marketing_strategy: '- What\'s your marketing strategy?',
          revenue_goals: '- What are your revenue goals for year 1?'
        };
        
        context += `${questions[field] || `- Ask about ${field}`}\n`;
      });
    }
    
    if (missing.nice_to_have.length > 0) {
      context += `\nNICE TO HAVE (if time allows):\n`;
      missing.nice_to_have.forEach(field => {
        context += `- Ask about ${field}\n`;
      });
    }
    
    context += `
Be conversational and natural. Reference what you already know. Don't repeat information you already have. Focus on filling the gaps efficiently.`;
    
    return context;
  }
  
  generateComprehensiveGapFillingPrompt(customer, stage, missing, actionItems, hasData, checklist) {
    const name = customer.customer_name || 'there';
    const businessName = customer.business_name || 'your business';
    
    let context = `You are Sarah from DreamSeed. You're speaking with ${name}`;
    
    if (hasData.business_name) {
      context += ` about ${hasData.business_name}`;
    }
    if (hasData.entity_type) {
      context += ` (${hasData.entity_type})`;
    }
    if (hasData.state_of_operation) {
      context += ` in ${hasData.state_of_operation}`;
    }
    
    context += `.\n\n📊 LLC FORMATION COMPLETION: ${checklist?.completionPercentage || 0}% complete (${checklist?.completedItems || 0}/${checklist?.totalItems || 108} characteristics collected)\n💼 PROGRESS BREAKDOWN: ${checklist?.completedItems || 0} business formation requirements gathered, ${(checklist?.totalItems || 108) - (checklist?.completedItems || 0)} still needed\n\n`;
    
    // Show readiness status
    if (checklist?.readiness) {
      context += `🚀 LAUNCH READINESS:\n`;
      Object.entries(checklist.readiness).forEach(([key, ready]) => {
        const status = ready ? '✅ Ready' : '❌ Not Ready';
        const service = key.replace('ready_for_', '').replace(/_/g, ' ');
        context += `- ${service}: ${status}\n`;
      });
      context += `\n`;
    }
    
    context += `WHAT YOU ALREADY KNOW:\n`;
    
    // Add existing data context with better organization
    const categories = {
      'Personal': ['customer_name', 'customer_email', 'first_name', 'last_name'],
      'Business Basics': ['business_name', 'entity_type', 'state_of_operation', 'business_purpose'],
      'Brand & Identity': ['brand_personality', 'target_audience', 'color_preferences'],
      'Operations': ['business_banking', 'accounting_software', 'business_location_type'],
      'Launch Strategy': ['launch_timeline', 'marketing_channels', 'target_market_definition']
    };
    
    for (const [category, fields] of Object.entries(categories)) {
      const categoryData = fields.filter(field => hasData[field]).map(field => `  - ${this.formatFieldName(field)}: ${hasData[field]}`);
      if (categoryData.length > 0) {
        context += `\n${category}:\n${categoryData.join('\n')}\n`;
      }
    }
    
    context += `\nCRITICAL PRIORITIES FOR THIS CALL:\n`;
    
    // Add critical and high priority missing items
    if (missing.critical.length > 0) {
      context += `🚨 CRITICAL (Must collect):\n`;
      missing.critical.slice(0, 3).forEach(item => {
        context += `- ${item.question}\n`;
      });
    }
    
    if (missing.high.length > 0) {
      context += `\n⚡ HIGH PRIORITY:\n`;
      missing.high.slice(0, 4).forEach(item => {
        context += `- ${item.question}\n`;
      });
    }
    
    if (missing.medium.length > 0) {
      context += `\n📋 IF TIME ALLOWS:\n`;
      missing.medium.slice(0, 3).forEach(item => {
        context += `- ${item.question}\n`;
      });
    }
    
    // Add specific action items
    if (actionItems && actionItems.length > 0) {
      context += `\n🎯 FOCUS AREAS (Based on completion gaps):\n`;
      actionItems.forEach(action => {
        context += `- ${action.category} (${action.completion}% complete)\n`;
      });
    }
    
    context += `\n💡 CONVERSATION APPROACH:
- Be natural and conversational, not like a form
- Reference what you already know to build rapport
- Focus on the critical items first
- Ask follow-up questions to get detailed answers
- Celebrate progress made so far (${checklist?.completionPercentage || 0}% complete!)`;
    
    return context;
  }
  
  formatFieldName(field) {
    return field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  generateCompletionPrompt(customer, checklist) {
    return `You are Sarah from DreamSeed. ${customer.customer_name} has completed all 4 calls for ${customer.business_name}!

📊 BUSINESS FORMATION STATUS: ${checklist?.completionPercentage || 0}% Complete
✅ Items Collected: ${checklist?.completedItems || 0}/${checklist?.totalItems || 108}

🚀 LAUNCH READINESS:
${checklist?.readiness ? Object.entries(checklist.readiness).map(([key, ready]) => {
  const service = key.replace('ready_for_', '').replace(/_/g, ' ');
  return `- ${service}: ${ready ? '✅ Ready' : '❌ Needs attention'}`;
}).join('\n') : ''}

This call is for:
- Follow-up questions and updates
- Addressing any remaining gaps
- Additional services and support
- Launch planning and next steps

Be congratulatory about their progress and help them move toward launch!`;
  }
  
  async updateAssistantPrompt(stage, prompt) {
    try {
      const assistantId = CALL_ASSISTANTS[stage];
      
      const headers = {
        'Authorization': `Bearer ${VAPI_PRIVATE_KEY}`,
        'Content-Type': 'application/json'
      };
      
      const updateData = {
        model: {
          provider: "openai",
          model: "gpt-4o-mini",
          messages: [{
            role: "system",
            content: prompt
          }],
          temperature: 0.7,
          maxTokens: 1000
        }
      };
      
      const response = await axios.patch(
        `https://api.vapi.ai/assistant/${assistantId}`,
        updateData,
        { headers }
      );
      
      console.log(`✅ Updated Call ${stage} assistant with personalized prompt`);
      return true;
      
    } catch (error) {
      console.error(`❌ Failed to update Call ${stage} assistant:`, error.response?.data || error.message);
      return false;
    }
  }
  
  async generateAndUpdatePrompt(customerPhone) {
    try {
      console.log('🧠 Generating personalized assistant prompt...');
      
      // Analyze customer data
      const analysis = await this.analyzeCustomerData(customerPhone);
      
      // Generate personalized prompt
      const prompt = this.generatePersonalizedPrompt(analysis);
      
      // Update the appropriate assistant
      const stage = analysis.stage || 1;
      const success = await this.updateAssistantPrompt(stage, prompt);
      
      if (success) {
        console.log(`🎯 Call ${stage} assistant now has personalized knowledge for ${customerPhone}`);
        console.log(`📋 Prompt preview: "${prompt.substring(0, 100)}..."`);
      }
      
      return { success, stage, analysis, prompt };
      
    } catch (error) {
      console.error('❌ Smart prompt generation failed:', error);
      return { success: false, error: error.message };
    }
  }
}

export default SmartPromptGenerator;