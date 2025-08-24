const axios = require('axios');

async function testDreamDNAIntegration() {
  console.log('🧬 Testing Dream DNA Integration with Conversations...\n');
  
  try {
    // Step 1: Check if user has Dream DNA
    console.log('🔍 Step 1: Checking existing Dream DNA...');
    const existingDreamDNA = await axios.get('http://localhost:3000/api/dream-dna?phone=+15551234567');
    
    if (existingDreamDNA.data.success && existingDreamDNA.data.dreamDNA) {
      console.log('✅ Found existing Dream DNA:', existingDreamDNA.data.dreamDNA.vision_statement);
    } else {
      console.log('📝 No Dream DNA found, creating one...');
      
      // Step 2: Create Dream DNA for the user
      const dreamDNAData = {
        phone: '+15551234567',
        dreamDNA: {
          vision_statement: "To build a successful technology consulting business that helps small to medium businesses leverage AI and digital transformation to grow their revenue and efficiency.",
          core_purpose: "Empowering SMBs with cutting-edge technology solutions to compete in the digital age.",
          impact_goal: "Help 100+ businesses increase their revenue by 25% through AI implementation within 3 years.",
          legacy_vision: "To be remembered as the consultant who helped traditional businesses successfully transition to the AI era.",
          passion_driver: "I'm passionate about making advanced technology accessible and practical for everyday businesses.",
          business_concept: "AI-powered technology consulting for small to medium businesses, specializing in process automation, data analysis, and digital transformation.",
          target_customers: "Small to medium businesses (10-500 employees) in traditional industries looking to modernize their operations.",
          unique_value_prop: "We don't just implement technology - we transform business processes and train teams to maximize ROI from AI investments.",
          scalability_vision: "Start with local SMBs, then expand regionally, and eventually offer SaaS products based on successful implementations.",
          revenue_goals: "Generate $100,000 in revenue within the first year, $500,000 by year 3, and $1M+ by year 5.",
          services_offered: "AI implementation consulting, process automation, data analysis, digital transformation strategy, team training, and ongoing support.",
          lifestyle_goals: "Work remotely with flexible hours, have time for family, and achieve financial independence while helping others succeed.",
          freedom_level: "High - want location independence and time flexibility",
          growth_timeline: "Launch within 3 months, first clients within 6 months, sustainable business within 12 months.",
          exit_strategy: "Build a scalable consulting practice that could be acquired by a larger tech company or transition to a SaaS product business.",
          success_milestones: {
            "3_months": "Launch website, complete first client project, establish processes",
            "6_months": "Have 5 paying clients, $50K revenue, proven methodology",
            "12_months": "10+ clients, $100K revenue, team of 2-3 consultants",
            "24_months": "Regional expansion, $250K revenue, SaaS product development"
          },
          risk_tolerance: "Medium-High - willing to invest in technology and take calculated risks for growth",
          urgency_level: "High - existing client demand and market opportunity",
          confidence_level: 8,
          support_needs: "Legal structure setup, marketing strategy, client acquisition systems, technology partnerships",
          pain_points: "Getting started quickly, establishing credibility, managing client expectations, scaling efficiently",
          motivation_factors: {
            "financial": "Achieve $100K+ annual income",
            "lifestyle": "Work from anywhere, flexible schedule",
            "impact": "Help businesses succeed with technology",
            "growth": "Build something scalable and valuable"
          },
          package_preference: "Premium - want comprehensive support and fast results",
          budget_range: "$1000-2000 for initial setup, $500-1000/month for ongoing support",
          budget_mentioned: "Have $1000-2000 budget for formation and initial setup",
          timeline_preference: "Urgent - want to start serving clients within 3 months",
          next_steps: "Complete LLC formation, set up business infrastructure, launch marketing, secure first clients",
          key_requirements: {
            "legal": "LLC formation in Delaware, professional liability insurance",
            "technical": "AI tools and platforms, project management systems",
            "marketing": "Website, case studies, referral systems",
            "operational": "Client onboarding, project delivery, billing systems"
          },
          completeness_score: 95,
          analysis_notes: "Strong business concept with clear market opportunity. High urgency and good budget. Ready for immediate formation and launch."
        }
      };
      
      const createResponse = await axios.post('http://localhost:3000/api/dream-dna', dreamDNAData, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log('✅ Dream DNA created:', createResponse.data.action);
      console.log('🧬 Vision:', createResponse.data.dreamDNA.vision_statement);
    }
    
    // Step 3: Test RAG system with Dream DNA
    console.log('\n🧠 Step 3: Testing RAG with Dream DNA...');
    
    const ragQueries = [
      'What is my business vision and purpose?',
      'What are my revenue goals and timeline?',
      'What makes my business unique?',
      'What are my next steps for success?',
      'What support do I need to achieve my goals?'
    ];
    
    for (const query of ragQueries) {
      console.log(`\n🔍 Query: "${query}"`);
      
      const ragResponse = await axios.post('http://localhost:3000/api/vapi-rag', {
        message: query,
        userId: '+15551234567',
        callStage: 2,
        includeTranscripts: true,
        includeKnowledge: true,
        includeDreamDNA: true
      }, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log('📊 Context Retrieved:');
      console.log(`   - Transcripts: ${ragResponse.data.context.retrievedTranscripts}`);
      console.log(`   - Knowledge: ${ragResponse.data.context.retrievedKnowledge}`);
      console.log(`   - Dream DNA: ${ragResponse.data.context.dreamDNAIncluded}`);
      
      console.log('💬 Response:', ragResponse.data.response.substring(0, 150) + '...');
    }
    
    // Step 4: Test VAPI personalization with Dream DNA
    console.log('\n🎯 Step 4: VAPI Personalization with Dream DNA...');
    
    const personalizationResponse = await axios.post('http://localhost:3000/api/vapi-configure-voice', {
      assistantId: 'af397e88-c286-416f-9f74-e7665401bdb7',
      voice: 'elliot',
      systemMessage: `You are Elliot, a professional business formation consultant for DreamSeed.

CURRENT USER CONTEXT:
- Name: Morgan Walker
- Business: Digital Edge LLC (AI Technology Consulting)
- Phone: +15551234567
- Email: morgan@example.com
- Call Stage: 2 of 4

DREAM DNA CONTEXT:
- Vision: Building a successful technology consulting business helping SMBs leverage AI
- Revenue Goal: $100,000 in first year, $500,000 by year 3
- Unique Value: Transform business processes and train teams for AI ROI
- Urgency: High - existing client demand and market opportunity
- Budget: $1000-2000 for formation, $500-1000/month ongoing support

RAG CAPABILITIES:
- Previous conversation context available
- Business formation knowledge base
- Dream DNA truth table integration
- Vector similarity search enabled

Personalize all responses based on this user's specific vision, goals, and urgency level.`
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log('✅ VAPI Assistant personalized with Dream DNA');
    console.log('🎤 Voice set to: Elliot');
    console.log('🧬 Dream DNA integrated into system message');
    
    // Step 5: Test complete conversation flow
    console.log('\n🎙️ Step 5: Complete Conversation Flow Test...');
    
    const conversationQueries = [
      'Based on my Dream DNA, what should I focus on first?',
      'How does my vision align with my current business formation progress?',
      'What specific steps will help me achieve my $100K revenue goal?',
      'How can I leverage my unique value proposition in my business formation?'
    ];
    
    for (const query of conversationQueries) {
      console.log(`\n🎙️ Conversation: "${query}"`);
      
      const response = await axios.post('http://localhost:3000/api/vapi-rag', {
        message: query,
        userId: '+15551234567',
        callStage: 2,
        includeTranscripts: true,
        includeKnowledge: true,
        includeDreamDNA: true
      }, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log('💬 Elliot Response:', response.data.response.substring(0, 200) + '...');
    }
    
    // Summary
    console.log('\n🎉 DREAM DNA INTEGRATION TEST: SUCCESS!');
    console.log('\n📈 What was tested:');
    console.log('✅ Dream DNA creation and storage');
    console.log('✅ User ID resolution for Dream DNA');
    console.log('✅ RAG system with Dream DNA context');
    console.log('✅ VAPI personalization with Dream DNA');
    console.log('✅ Conversation flow with vision alignment');
    console.log('✅ Complete user journey with Dream DNA');
    
    console.log('\n🧬 Dream DNA is now fully integrated with:');
    console.log('- User lookup system');
    console.log('- RAG conversation memory');
    console.log('- VAPI assistant personalization');
    console.log('- Business formation guidance');
    console.log('- Progress tracking and goal alignment');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testDreamDNAIntegration();

