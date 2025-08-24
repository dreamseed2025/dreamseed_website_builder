import TranscriptIntelligencePredictor from './transcript-intelligence-predictor.js';

// Test the transcript prediction system
async function testTranscriptPredictions() {
  console.log('🧠 Testing Transcript Intelligence Prediction System...\n');

  const predictor = new TranscriptIntelligencePredictor();

  // Test user ID (replace with actual user ID from your database)
  const testUserId = 'your-test-user-id-here';

  try {
    // Test 1: Predict specific field
    console.log('📊 Test 1: Predicting industry_category...');
    const industryPrediction = await predictor.predictFieldFromTranscripts(
      testUserId, 
      'industry_category'
    );
    
    if (industryPrediction) {
      console.log('✅ Industry Prediction:', {
        value: industryPrediction.value,
        confidence: industryPrediction.confidence,
        reasoning: industryPrediction.reasoning
      });
    } else {
      console.log('❌ No industry prediction generated');
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 2: Predict business model
    console.log('📊 Test 2: Predicting business_model...');
    const modelPrediction = await predictor.predictFieldFromTranscripts(
      testUserId, 
      'business_model'
    );
    
    if (modelPrediction) {
      console.log('✅ Business Model Prediction:', {
        value: modelPrediction.value,
        confidence: modelPrediction.confidence,
        reasoning: modelPrediction.reasoning
      });
    } else {
      console.log('❌ No business model prediction generated');
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 3: Predict risk tolerance
    console.log('📊 Test 3: Predicting risk_tolerance...');
    const riskPrediction = await predictor.predictFieldFromTranscripts(
      testUserId, 
      'risk_tolerance'
    );
    
    if (riskPrediction) {
      console.log('✅ Risk Tolerance Prediction:', {
        value: riskPrediction.value,
        confidence: riskPrediction.confidence,
        reasoning: riskPrediction.reasoning
      });
    } else {
      console.log('❌ No risk tolerance prediction generated');
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 4: Get prediction analytics
    console.log('📊 Test 4: Getting prediction analytics...');
    const analytics = await predictor.getPredictionAnalytics(testUserId);
    
    if (analytics) {
      console.log('✅ Prediction Analytics:', {
        total_predictions: analytics.total_predictions,
        high_confidence_predictions: analytics.high_confidence_predictions,
        average_confidence: analytics.average_confidence.toFixed(3),
        field_coverage: Object.keys(analytics.field_coverage).length
      });
      
      console.log('\nField Coverage Details:');
      Object.entries(analytics.field_coverage).forEach(([field, data]) => {
        console.log(`  ${field}: "${data.value}" (${data.confidence} confidence)`);
      });
    } else {
      console.log('❌ No prediction analytics found');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Test API endpoints
async function testAPIEndpoints() {
  console.log('\n🌐 Testing API Endpoints...\n');

  const baseUrl = 'http://localhost:3000/api/transcript-predictions';

  try {
    // Test 1: Predict specific field via API
    console.log('📊 Test 1: API - Predicting industry_category...');
    const response1 = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'your-test-user-id-here',
        fieldName: 'industry_category'
      })
    });

    const result1 = await response1.json();
    console.log('API Response:', result1);

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 2: Predict all missing fields via API
    console.log('📊 Test 2: API - Predicting all missing fields...');
    const response2 = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'your-test-user-id-here',
        predictAll: true
      })
    });

    const result2 = await response2.json();
    console.log('API Response:', result2);

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 3: Get analytics via API
    console.log('📊 Test 3: API - Getting prediction analytics...');
    const response3 = await fetch(`${baseUrl}?userId=your-test-user-id-here`);
    const result3 = await response3.json();
    console.log('API Response:', result3);

  } catch (error) {
    console.error('❌ API test failed:', error);
  }
}

// Example usage with sample data
async function demonstrateWithSampleData() {
  console.log('\n🎭 Demonstrating with Sample Data...\n');

  // Sample transcript data (simulating what would be in the database)
  const sampleTranscripts = [
    {
      content_summary: "Entrepreneur discussing a SaaS platform for small business accounting automation. They mention targeting small businesses with 1-50 employees who struggle with bookkeeping. Revenue goal of $50K per month within 2 years. Very confident about the market opportunity and ready to start immediately.",
      business_insights: ["SaaS business model", "Small business target market", "Accounting automation", "High confidence", "Urgent timeline"],
      key_topics: ["accounting", "automation", "SaaS", "small business", "revenue goals"],
      sentiment_score: 0.85
    },
    {
      content_summary: "Follow-up call discussing technical requirements and development timeline. They want to launch MVP in 3 months and are willing to invest $25K in initial development. Prefer guided support package with technical consultation.",
      business_insights: ["3-month MVP timeline", "$25K budget", "Guided support preference", "Technical focus"],
      key_topics: ["MVP", "development", "timeline", "budget", "technical support"],
      sentiment_score: 0.75
    }
  ];

  console.log('📝 Sample Transcript Analysis:');
  sampleTranscripts.forEach((transcript, index) => {
    console.log(`\nCall ${index + 1}:`);
    console.log(`  Summary: ${transcript.content_summary}`);
    console.log(`  Insights: ${transcript.business_insights.join(', ')}`);
    console.log(`  Topics: ${transcript.key_topics.join(', ')}`);
    console.log(`  Sentiment: ${transcript.sentiment_score > 0.5 ? 'Positive' : 'Neutral'}`);
  });

  console.log('\n🤖 Predicted Field Values:');
  console.log('  Industry Category: Technology/SaaS (0.92 confidence)');
  console.log('  Business Model: SaaS/Subscription (0.95 confidence)');
  console.log('  Target Revenue: $50K/month (0.88 confidence)');
  console.log('  Business Stage: Startup (0.85 confidence)');
  console.log('  Risk Tolerance: Moderate-High (0.78 confidence)');
  console.log('  Urgency Level: High (0.90 confidence)');
  console.log('  Confidence Level: 8/10 (0.85 confidence)');
  console.log('  Package Preference: Guided Support (0.82 confidence)');
  console.log('  Budget Range: $20K-$30K (0.80 confidence)');
  console.log('  Timeline Preference: 3 months (0.88 confidence)');
}

// Run tests
async function runAllTests() {
  console.log('🚀 Starting Transcript Intelligence Prediction Tests\n');
  
  await demonstrateWithSampleData();
  await testTranscriptPredictions();
  await testAPIEndpoints();
  
  console.log('\n✅ All tests completed!');
}

// Export for use in other files
export { 
  testTranscriptPredictions, 
  testAPIEndpoints, 
  demonstrateWithSampleData,
  runAllTests 
};

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().catch(console.error);
}
