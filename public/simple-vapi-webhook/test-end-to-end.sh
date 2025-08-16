#!/bin/bash

echo "🧪 DreamSeed End-to-End Testing Suite"
echo "====================================="

SERVER_URL="http://localhost:3002"

echo ""
echo "📋 Step 1: Testing Call 1 (Foundation & Vision) - 25% Target"
echo "------------------------------------------------------------"

# Test Call 1 with restaurant consulting example
curl -X POST ${SERVER_URL}/api/test-extraction \
  -H "Content-Type: application/json" \
  -d '{
    "transcript": "Hi there! Thanks for calling DreamSeed. I am Sarah Johnson and I want to start a consulting business helping small restaurants improve their operations and profitability. I have been working in restaurant management for 15 years and I see so many places struggling with inefficient processes. I want to call this business Restaurant Success Solutions. I am in California, so I would like to file my LLC there. My email is sarah.johnson@email.com and my cell is 555-123-4567. I have about $25,000 saved up to get started and I am hoping to launch within the next 3 months.",
    "callStage": 1,
    "existingData": {}
  }' | jq '.'

echo ""
echo "📋 Step 2: Testing Call 2 (Brand DNA & Market) - 50% Target"
echo "----------------------------------------------------------"

# Test Call 2 with brand identity focus
curl -X POST ${SERVER_URL}/api/test-extraction \
  -H "Content-Type: application/json" \
  -d '{
    "transcript": "Hi Sarah! Great to continue our conversation about Restaurant Success Solutions. Let me ask about your brand identity. I want to come across as professional but approachable, knowledgeable but not intimidating. I want restaurant owners to feel like I understand their struggles. For colors, I am drawn to warm, earthy tones - maybe deep greens and warm grays. I want it to feel stable and trustworthy but also fresh and modern. For my logo, I think I would like an icon with the text, maybe something that suggests growth or efficiency. My main competitors are big consulting firms that work with restaurant chains, but they are expensive and impersonal. What makes me different is my 15 years of hands-on restaurant management experience - I have actually run day-to-day operations. I want my main website message to be something like Turn your restaurant passion into sustainable profit.",
    "callStage": 2,
    "existingData": {
      "customer_name": "Sarah Johnson",
      "customer_email": "sarah.johnson@email.com",
      "business_name": "Restaurant Success Solutions"
    }
  }' | jq '.'

echo ""
echo "📋 Step 3: Testing VAPI Webhook (Simulated Voice Call)"
echo "-----------------------------------------------------"

# Test VAPI webhook endpoint
curl -X POST ${SERVER_URL}/api/vapi-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "type": "transcript",
    "callId": "test-call-123",
    "callStage": 1,
    "customerEmail": "sarah.johnson@email.com",
    "transcript": "Hi, this is Sarah Johnson again. I want to add that I also do menu optimization and cost control systems for restaurants. I work specifically with family-owned places that dont have dedicated operations managers but really need the help."
  }' | jq '.'

echo ""
echo "📋 Step 4: Testing Customer Completeness Tracking"
echo "------------------------------------------------"

# Test customer completeness API
curl -X GET "${SERVER_URL}/api/customer-completeness/sarah.johnson@email.com" | jq '.'

echo ""
echo "📋 Step 5: Testing Missing Information Report"
echo "--------------------------------------------"

# Test missing information API
curl -X GET "${SERVER_URL}/api/missing-info/sarah.johnson@email.com?callStage=2" | jq '.'

echo ""
echo "📋 Step 6: Testing Next Questions Suggestions"
echo "--------------------------------------------"

# Test next questions API
curl -X GET "${SERVER_URL}/api/next-questions/sarah.johnson@email.com" | jq '.'

echo ""
echo "✅ End-to-End Testing Complete!"
echo "==============================="
echo ""
echo "🌐 View Results:"
echo "• Customer Dashboard: ${SERVER_URL}/info-tracker.html"
echo "• Enter email: sarah.johnson@email.com"
echo ""