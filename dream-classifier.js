import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

class DreamClassifier {
  
  async classifyDream(transcript) {
    try {
      const prompt = `Analyze this customer conversation and classify their business dream/goal.

Transcript: "${transcript}"

Classify into one of these categories:
1. "business_formation" - Starting a traditional business (LLC, Corporation, etc.)
2. "real_estate" - Real estate investment, flipping, rental properties
3. "e_commerce" - Online store, dropshipping, Amazon business
4. "consulting" - Coaching, consulting, professional services
5. "restaurant" - Food service, restaurant, catering business
6. "tech_startup" - Software, app, tech company
7. "creative" - Art, design, photography, creative services
8. "health_wellness" - Fitness, wellness, healthcare services
9. "education" - Training, courses, educational services
10. "other" - Doesn't fit above categories

Also provide:
- Confidence level (0-100%)
- Specific business type (more detailed)
- Key indicators that led to this classification

Return JSON format:
{
  "dream_category": "business_formation",
  "confidence": 85,
  "specific_type": "LLC for consulting business",
  "indicators": ["mentioned LLC", "wants to start consulting", "professional services"],
  "recommended_flow": "standard_4_call_formation"
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 300,
        temperature: 0.1,
        response_format: { type: "json_object" }
      });

      const classification = JSON.parse(response.choices[0].message.content);
      
      console.log(`🎯 Dream Classification:`, classification);
      return classification;
      
    } catch (error) {
      console.error('❌ Dream classification error:', error);
      return {
        dream_category: "business_formation",
        confidence: 50,
        specific_type: "default business formation",
        indicators: ["fallback classification"],
        recommended_flow: "standard_4_call_formation"
      };
    }
  }

  getDreamFlowConfig(dreamCategory) {
    const dreamFlows = {
      business_formation: {
        calls: 4,
        stages: ['Foundation', 'Brand Identity', 'Operations', 'Launch'],
        schema: 'standard_business_formation',
        assistants: {
          1: '60400523-a331-4c4b-935d-b666ee013d42',
          2: '2496625c-6fe8-4304-8b6d-045870680189', 
          3: 'b9f38474-a065-458f-bb03-eb62d21f529a',
          4: '87416134-cfc7-47de-ad97-4951d3905ea9'
        }
      },
      
      real_estate: {
        calls: 3,
        stages: ['Investment Goals', 'Market Analysis', 'Action Plan'],
        schema: 'real_estate_investment',
        assistants: {
          1: 'real-estate-assistant-1',
          2: 'real-estate-assistant-2',
          3: 'real-estate-assistant-3'
        }
      },
      
      e_commerce: {
        calls: 4,
        stages: ['Product Research', 'Store Setup', 'Marketing', 'Scaling'],
        schema: 'ecommerce_launch',
        assistants: {
          1: 'ecommerce-assistant-1',
          2: 'ecommerce-assistant-2',
          3: 'ecommerce-assistant-3',
          4: 'ecommerce-assistant-4'
        }
      },
      
      restaurant: {
        calls: 5,
        stages: ['Concept', 'Location', 'Menu', 'Operations', 'Marketing'],
        schema: 'restaurant_launch',
        assistants: {
          1: 'restaurant-assistant-1',
          2: 'restaurant-assistant-2',
          3: 'restaurant-assistant-3',
          4: 'restaurant-assistant-4',
          5: 'restaurant-assistant-5'
        }
      }
    };
    
    return dreamFlows[dreamCategory] || dreamFlows.business_formation;
  }
  
  async routeToDreamFlow(customerPhone, dreamCategory) {
    const flowConfig = this.getDreamFlowConfig(dreamCategory);
    
    console.log(`🚀 Routing ${customerPhone} to ${dreamCategory} flow (${flowConfig.calls} calls)`);
    
    // Update customer record with dream classification
    // Route to appropriate assistant for their dream type
    // Load dream-specific checklist and requirements
    
    return flowConfig;
  }
}

export default DreamClassifier;

// Example usage
async function testDreamClassification() {
  const classifier = new DreamClassifier();
  
  const testTranscripts = [
    "I want to start an LLC for my consulting business",
    "I'm looking to flip houses and need help with real estate investing", 
    "I want to open a restaurant in downtown and need business formation",
    "I'm starting an online store selling handmade jewelry"
  ];
  
  for (const transcript of testTranscripts) {
    console.log(`\n📝 Transcript: "${transcript}"`);
    const result = await classifier.classifyDream(transcript);
    const flowConfig = classifier.getDreamFlowConfig(result.dream_category);
    console.log(`🎯 Category: ${result.dream_category} (${result.confidence}% confidence)`);
    console.log(`📞 Flow: ${flowConfig.calls} calls - ${flowConfig.stages.join(' → ')}`);
  }
}

// Uncomment to test
// testDreamClassification().catch(console.error);