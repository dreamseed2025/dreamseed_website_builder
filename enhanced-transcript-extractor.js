import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

class EnhancedTranscriptExtractor {
  
  constructor() {
    this.extractionRules = this.initializeExtractionRules();
  }

  initializeExtractionRules() {
    return {
      // Call 1: Foundation & Contact Info
      1: {
        contact_info: [
          { field: 'first_name', patterns: [/(?:my name is|i am|this is|i'm)\s+([a-zA-Z]+)/i], priority: 'high' },
          { field: 'last_name', patterns: [/(?:my name is|i am|this is|i'm)\s+[a-zA-Z]+\s+([a-zA-Z]+)/i], priority: 'high' },
          { field: 'customer_email', patterns: [/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i], priority: 'critical' },
          { field: 'address', patterns: [/(?:i live at|my address is|located at)\s+([^,.]+)/i], priority: 'medium' },
          { field: 'city', patterns: [/(?:in|from)\s+([a-zA-Z\s]+)(?:,|\s+[a-zA-Z]{2})/i], priority: 'medium' },
          { field: 'zip', patterns: [/(\d{5}(?:-\d{4})?)/], priority: 'low' }
        ],
        llc_filing: [
          { field: 'business_name', patterns: [/(?:business|company).*?(?:called|named)\s+([^,.]+)/i], priority: 'critical' },
          { field: 'entity_type', patterns: [/(LLC|Corporation|Partnership|Sole Proprietorship)/i], priority: 'critical' },
          { field: 'business_purpose', patterns: [/(?:we do|business does|we specialize in|we provide)\s+([^,.]+)/i], priority: 'high' },
          { field: 'naics_code', patterns: [/(?:naics|industry code)\s+(\d+)/i], priority: 'low' }
        ]
      },

      // Call 2: Brand Identity & Domain
      2: {
        brand_identity: [
          { field: 'industry_sector', patterns: [/(?:industry|sector|field)\s+(?:is|of)\s+([^,.]+)/i], priority: 'high' },
          { field: 'brand_personality', patterns: [/(?:brand|personality|feel|vibe)\s+(?:is|should be|feels)\s+([^,.]+)/i], priority: 'high' },
          { field: 'target_audience', patterns: [/(?:target|customers|audience|clients)\s+(?:are|is)\s+([^,.]+)/i], priority: 'high' },
          { field: 'color_preferences', patterns: [/(?:colors|color scheme|brand colors)\s+(?:are|should be|like)\s+([^,.]+)/i], priority: 'medium' },
          { field: 'style_direction', patterns: [/(?:style|design|look)\s+(?:should be|is|like)\s+([^,.]+)/i], priority: 'medium' },
          { field: 'logo_type_preference', patterns: [/(text-only|icon.*text|icon-only|just text|text and icon|symbol only)/i], priority: 'medium' }
        ],
        website_content: [
          { field: 'business_name_tagline', patterns: [/(?:tagline|slogan|motto)\s+(?:is|should be)\s+([^,.]+)/i], priority: 'medium' },
          { field: 'unique_value_proposition', patterns: [/(?:unique|different|special)\s+(?:about|because)\s+([^,.]+)/i], priority: 'high' },
          { field: 'primary_services_products', patterns: [/(?:services|products|offerings)\s+(?:include|are)\s+([^,.]+)/i], priority: 'high' }
        ]
      },

      // Call 3: Operations & Financial
      3: {
        financial_operational: [
          { field: 'business_banking', patterns: [/(?:bank|banking)\s+(?:with|at|prefer)\s+([^,.]+)/i], priority: 'high' },
          { field: 'accounting_software', patterns: [/(?:accounting|bookkeeping)\s+(?:software|using|with)\s+([^,.]+)/i], priority: 'high' },
          { field: 'payment_processing', patterns: [/(?:payment|payments|processing)\s+(?:through|with|using)\s+([^,.]+)/i], priority: 'medium' },
          { field: 'business_location_type', patterns: [/(?:operate|work|located)\s+(?:from|at)\s+(home|office|retail|warehouse|online)/i], priority: 'medium' },
          { field: 'business_insurance', patterns: [/(?:insurance|coverage)\s+(?:need|require|want)\s+([^,.]+)/i], priority: 'medium' }
        ],
        website_content: [
          { field: 'business_address', patterns: [/(?:business|office)\s+(?:address|located)\s+(?:is|at)\s+([^,.]+)/i], priority: 'medium' },
          { field: 'business_phone', patterns: [/(?:business|office)\s+(?:phone|number)\s+(?:is|will be)\s+([\d\-\(\)\s]+)/i], priority: 'medium' },
          { field: 'hours_of_operation', patterns: [/(?:hours|open|operating)\s+(?:are|from)\s+([^,.]+)/i], priority: 'low' },
          { field: 'service_areas', patterns: [/(?:serve|service area|work in)\s+([^,.]+)/i], priority: 'medium' }
        ]
      },

      // Call 4: Launch & Marketing
      4: {
        launch_marketing: [
          { field: 'launch_timeline', patterns: [/(?:launch|start|open|begin)\s+(?:in|by|on)\s+([^,.]+)/i], priority: 'critical' },
          { field: 'marketing_channels', patterns: [/(?:marketing|advertise|promote)\s+(?:on|through|via)\s+([^,.]+)/i], priority: 'high' },
          { field: 'target_market_definition', patterns: [/(?:target market|ideal customer|focus on)\s+(?:is|are)\s+([^,.]+)/i], priority: 'high' },
          { field: 'marketing_budget', patterns: [/(?:budget|spend|invest)\s+(?:is|about|around)\s+\$?(\d+)/i], priority: 'medium' },
          { field: 'content_strategy', patterns: [/(?:content|social media|posting)\s+(?:strategy|plan)\s+([^,.]+)/i], priority: 'medium' }
        ]
      }
    };
  }

  async extractComprehensiveData(transcript, callStage) {
    try {
      console.log(`🧠 Extracting comprehensive data for Call ${callStage}...`);
      
      // Combine rule-based and AI-powered extraction
      const ruleBasedData = await this.extractWithRules(transcript, callStage);
      const aiExtractedData = await this.extractWithAI(transcript, callStage);
      
      // Merge and prioritize results
      const combinedData = this.mergeExtractionResults(ruleBasedData, aiExtractedData);
      
      console.log(`✅ Extracted ${Object.keys(combinedData).length} data points for Call ${callStage}`);
      return combinedData;
      
    } catch (error) {
      console.error('❌ Enhanced extraction error:', error);
      return {};
    }
  }

  async extractWithRules(transcript, callStage) {
    const extractedData = {};
    const stageRules = this.extractionRules[callStage] || {};
    
    for (const [category, fields] of Object.entries(stageRules)) {
      for (const fieldRule of fields) {
        const { field, patterns, priority } = fieldRule;
        
        for (const pattern of patterns) {
          const match = transcript.match(pattern);
          if (match && match[1]) {
            extractedData[field] = match[1].trim();
            console.log(`📝 Rule-based: ${field} = "${match[1].trim()}" (${priority})`);
            break; // Use first successful match
          }
        }
      }
    }
    
    return extractedData;
  }

  async extractWithAI(transcript, callStage) {
    try {
      const stagePrompts = {
        1: `Extract contact and business formation details from this transcript. Focus on:
        - Personal information (name, email, phone, address)
        - Business basics (name, entity type, state, purpose)
        - Timeline and urgency
        
        Return JSON with extracted fields or null for missing data.`,
        
        2: `Extract brand identity and website content from this transcript. Focus on:
        - Brand personality, colors, style preferences
        - Target audience and market positioning
        - Logo requirements and design direction
        - Business description and value proposition
        
        Return JSON with extracted fields or null for missing data.`,
        
        3: `Extract operational and financial setup details from this transcript. Focus on:
        - Banking and accounting preferences
        - Payment processing needs
        - Business location and operations
        - Insurance and legal requirements
        - Website operational details
        
        Return JSON with extracted fields or null for missing data.`,
        
        4: `Extract launch strategy and marketing details from this transcript. Focus on:
        - Launch timeline and milestones
        - Marketing channels and strategies
        - Target market definition
        - Budget and resource allocation
        - Growth and scaling plans
        
        Return JSON with extracted fields or null for missing data.`
      };

      const prompt = `${stagePrompts[callStage]}

Transcript:
${transcript}

Extract data in this JSON format:
{
  "field_name": "extracted_value",
  "another_field": "another_value"
}

Only include fields with actual extracted data. Use null for unclear/missing information.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1000,
        temperature: 0.1,
        response_format: { type: "json_object" }
      });

      const aiData = JSON.parse(response.choices[0].message.content);
      console.log(`🤖 AI extracted ${Object.keys(aiData).length} fields for Call ${callStage}`);
      
      return aiData;

    } catch (error) {
      console.error('❌ AI extraction error:', error);
      return {};
    }
  }

  mergeExtractionResults(ruleBasedData, aiData) {
    const merged = { ...aiData }; // Start with AI data as base
    
    // Override with rule-based data (higher confidence)
    for (const [field, value] of Object.entries(ruleBasedData)) {
      if (value && value.trim() !== '' && value !== 'Not extracted') {
        merged[field] = value;
        console.log(`🔄 Rule override: ${field} = "${value}"`);
      }
    }
    
    // Clean up extracted data
    return this.cleanExtractedData(merged);
  }

  cleanExtractedData(data) {
    const cleaned = {};
    
    for (const [field, value] of Object.entries(data)) {
      if (value && value !== null && value.toString().trim() !== '') {
        let cleanValue = value.toString().trim();
        
        // Clean up common extraction artifacts
        cleanValue = cleanValue.replace(/^["']|["']$/g, ''); // Remove quotes
        cleanValue = cleanValue.replace(/\.$/, ''); // Remove trailing period
        cleanValue = cleanValue.replace(/\s+/g, ' '); // Normalize whitespace
        
        // Skip very short or generic values
        if (cleanValue.length > 1 && !['not sure', 'unknown', 'tbd', 'n/a'].includes(cleanValue.toLowerCase())) {
          cleaned[field] = cleanValue;
        }
      }
    }
    
    return cleaned;
  }

  // Legacy method compatibility
  async extractDataFromTranscript(transcript, callStage = 1) {
    return await this.extractComprehensiveData(transcript, callStage);
  }
}

export default EnhancedTranscriptExtractor;