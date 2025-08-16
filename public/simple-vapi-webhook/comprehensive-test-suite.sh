#!/bin/bash

echo "🧪 DreamSeed Comprehensive Test Suite"
echo "===================================="
echo "Testing all backend components and integration points"
echo ""

SERVER_URL="http://localhost:3002"
TEST_EMAIL="comprehensive-test@dreamtest.com"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test tracking
TESTS_PASSED=0
TESTS_FAILED=0
FAILED_TESTS=()

log_test() {
    local test_name="$1"
    local status="$2"
    local details="$3"
    
    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✅ PASS${NC}: $test_name"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC}: $test_name"
        echo -e "   ${YELLOW}Details: $details${NC}"
        ((TESTS_FAILED++))
        FAILED_TESTS+=("$test_name")
    fi
}

echo "📊 Step 1: Server Health Check"
echo "-----------------------------"

# Test server status
response=$(curl -s -w "%{http_code}" -o /dev/null "$SERVER_URL/api/all")
if [ "$response" = "200" ]; then
    log_test "Server responding" "PASS" ""
else
    log_test "Server responding" "FAIL" "HTTP $response"
fi

echo ""
echo "🤖 Step 2: AI Extraction Testing (All Call Stages)"
echo "--------------------------------------------------"

# Test Call 1 Extraction
echo "Testing Call 1 (Foundation & Vision)..."
call1_response=$(curl -s -X POST "$SERVER_URL/api/test-extraction" \
  -H "Content-Type: application/json" \
  -d "{
    \"transcript\": \"Hi there! I'm Jessica Martinez and I want to start a digital marketing consulting business. I've been working in marketing for 8 years and want to help small businesses grow their online presence. I want to call it Growth Digital Solutions. I'm in Texas, so I'd like to file my LLC there. My email is jessica@growthdigital.com and my phone is 512-555-0156. I have about $15,000 saved up and want to launch in the next 2 months.\",
    \"callStage\": 1,
    \"existingData\": {}
  }")

call1_score=$(echo "$call1_response" | jq -r '.result.validation.completionScore // "null"')
if [ "$call1_score" != "null" ] && [ "$call1_score" -gt 100 ]; then
    log_test "Call 1 AI Extraction" "PASS" "Score: $call1_score"
else
    log_test "Call 1 AI Extraction" "FAIL" "Score: $call1_score"
fi

# Test Call 2 Extraction
echo "Testing Call 2 (Brand DNA & Market)..."
call2_response=$(curl -s -X POST "$SERVER_URL/api/test-extraction" \
  -H "Content-Type: application/json" \
  -d "{
    \"transcript\": \"Hi Jessica! For your brand personality, I want to come across as professional but approachable, like a trusted advisor. For colors, I love deep blues and clean whites - something that feels trustworthy and modern. I want a logo with an icon and text, maybe something that suggests growth or digital connectivity. My main competitors are big marketing agencies, but I'm different because I focus specifically on small businesses and provide personalized attention they can't get from larger firms.\",
    \"callStage\": 2,
    \"existingData\": {
      \"customer_name\": \"Jessica Martinez\",
      \"business_name\": \"Growth Digital Solutions\"
    }
  }")

call2_score=$(echo "$call2_response" | jq -r '.result.validation.completionScore // "null"')
if [ "$call2_score" != "null" ] && [ "$call2_score" -gt 50 ]; then
    log_test "Call 2 AI Extraction" "PASS" "Score: $call2_score"
else
    log_test "Call 2 AI Extraction" "FAIL" "Score: $call2_score"
fi

# Test Call 3 Extraction
echo "Testing Call 3 (Operations & Implementation)..."
call3_response=$(curl -s -X POST "$SERVER_URL/api/test-extraction" \
  -H "Content-Type: application/json" \
  -d "{
    \"transcript\": \"I'll work from home initially - I have a dedicated office space. I bank with Wells Fargo so I'll probably use them for business banking too. For accounting, I'm thinking QuickBooks. I want to accept credit cards and ACH payments, probably through Stripe. I have a good laptop and will need a CRM system - maybe HubSpot. For insurance, I definitely need professional liability since I'm giving marketing advice. I don't have a business attorney yet but know I'll need one.\",
    \"callStage\": 3,
    \"existingData\": {
      \"customer_name\": \"Jessica Martinez\",
      \"business_name\": \"Growth Digital Solutions\",
      \"brand_personality\": \"Professional but approachable\"
    }
  }")

call3_score=$(echo "$call3_response" | jq -r '.result.validation.completionScore // "null"')
if [ "$call3_score" != "null" ] && [ "$call3_score" -gt 75 ]; then
    log_test "Call 3 AI Extraction" "PASS" "Score: $call3_score"
else
    log_test "Call 3 AI Extraction" "FAIL" "Score: $call3_score"
fi

# Test Call 4 Extraction
echo "Testing Call 4 (Launch Strategy & Support)..."
call4_response=$(curl -s -X POST "$SERVER_URL/api/test-extraction" \
  -H "Content-Type: application/json" \
  -d "{
    \"transcript\": \"I want to launch by March 1st. My goal is to get 5 clients in the first month and grow to $10,000 monthly revenue by month 6. I'll focus on LinkedIn marketing and local networking to find clients. I'm thinking $2,500 per month for ongoing marketing consulting. I want to measure success by client retention and revenue growth they achieve. Long-term, I'd love to build a team of 3-4 marketing specialists and potentially franchise the model.\",
    \"callStage\": 4,
    \"existingData\": {
      \"customer_name\": \"Jessica Martinez\",
      \"business_name\": \"Growth Digital Solutions\",
      \"brand_personality\": \"Professional but approachable\",
      \"business_location_type\": \"Home office\"
    }
  }")

call4_score=$(echo "$call4_response" | jq -r '.result.validation.completionScore // "null"')
if [ "$call4_score" != "null" ] && [ "$call4_score" -gt 50 ]; then
    log_test "Call 4 AI Extraction" "PASS" "Score: $call4_score"
else
    log_test "Call 4 AI Extraction" "FAIL" "Score: $call4_score"
fi

echo ""
echo "🎤 Step 3: VAPI Webhook Integration Testing"
echo "-------------------------------------------"

# Test VAPI Webhook Call 1
webhook1_response=$(curl -s -X POST "$SERVER_URL/api/vapi-webhook" \
  -H "Content-Type: application/json" \
  -d "{
    \"type\": \"transcript\",
    \"callId\": \"test-webhook-call-1-$TIMESTAMP\",
    \"callStage\": 1,
    \"customerEmail\": \"$TEST_EMAIL\",
    \"transcript\": \"Hi, I'm Michael Chen and I want to start a fitness coaching business in California. My email is michael@fitcoach.com and phone is 415-555-0198. I want to call it FitLife Coaching.\"
  }")

webhook1_success=$(echo "$webhook1_response" | jq -r '.success // "null"')
webhook1_user_id=$(echo "$webhook1_response" | jq -r '.saveResult.user.id // "null"')

if [ "$webhook1_success" = "true" ] && [ "$webhook1_user_id" != "null" ]; then
    log_test "VAPI Webhook Call 1" "PASS" "User created: $webhook1_user_id"
else
    log_test "VAPI Webhook Call 1" "FAIL" "Success: $webhook1_success"
fi

# Test VAPI Webhook Call 2
webhook2_response=$(curl -s -X POST "$SERVER_URL/api/vapi-webhook" \
  -H "Content-Type: application/json" \
  -d "{
    \"type\": \"transcript\",
    \"callId\": \"test-webhook-call-2-$TIMESTAMP\",
    \"callStage\": 2,
    \"customerEmail\": \"$TEST_EMAIL\",
    \"transcript\": \"For my brand, I want energetic and motivating, with bright colors like orange and blue. I want to inspire people to achieve their fitness goals.\"
  }")

webhook2_success=$(echo "$webhook2_response" | jq -r '.success // "null"')
if [ "$webhook2_success" = "true" ]; then
    log_test "VAPI Webhook Call 2" "PASS" ""
else
    log_test "VAPI Webhook Call 2" "FAIL" "Success: $webhook2_success"
fi

echo ""
echo "📊 Step 4: Customer Tracking API Testing"
echo "----------------------------------------"

# Give database a moment to process
sleep 2

# Test customer completeness
completeness_response=$(curl -s "$SERVER_URL/api/customer-completeness/morgan@gmail.com")
completeness_score=$(echo "$completeness_response" | jq -r '.completionScore // "null"')

if [ "$completeness_score" != "null" ] && [ "$completeness_score" -gt 0 ]; then
    log_test "Customer Completeness API" "PASS" "Score: $completeness_score"
else
    log_test "Customer Completeness API" "FAIL" "Score: $completeness_score"
fi

# Test missing information API
missing_info_response=$(curl -s "$SERVER_URL/api/missing-info/morgan@gmail.com?callStage=2")
missing_score=$(echo "$missing_info_response" | jq -r '.completionScore // "null"')

if [ "$missing_score" != "null" ] && [ "$missing_score" -gt 0 ]; then
    log_test "Missing Information API" "PASS" "Score: $missing_score"
else
    log_test "Missing Information API" "FAIL" "Score: $missing_score"
fi

# Test next questions API
next_questions_response=$(curl -s "$SERVER_URL/api/next-questions/emily@foodieflow.com")
questions_count=$(echo "$next_questions_response" | jq -r '.questions | length // "null"')

if [ "$questions_count" != "null" ] && [ "$questions_count" -gt 0 ]; then
    log_test "Next Questions API" "PASS" "Questions: $questions_count"
else
    log_test "Next Questions API" "FAIL" "Questions: $questions_count"
fi

echo ""
echo "🧠 Step 5: Requirements Framework Testing"
echo "-----------------------------------------"

# Test requirements extractor directly
if [ -f "$SERVER_URL/../requirements/extraction-logic.js" ]; then
    log_test "Requirements Framework Files" "PASS" "extraction-logic.js exists"
else
    log_test "Requirements Framework Files" "FAIL" "extraction-logic.js missing"
fi

# Test schema files
schema_response=$(curl -s "$SERVER_URL/requirements/schemas/customer-data-schema.json")
if echo "$schema_response" | jq . > /dev/null 2>&1; then
    log_test "Customer Data Schema" "PASS" "Valid JSON schema"
else
    log_test "Customer Data Schema" "FAIL" "Invalid or missing schema"
fi

validation_response=$(curl -s "$SERVER_URL/requirements/schemas/validation-rules.json")
if echo "$validation_response" | jq . > /dev/null 2>&1; then
    log_test "Validation Rules Schema" "PASS" "Valid JSON schema"
else
    log_test "Validation Rules Schema" "FAIL" "Invalid or missing schema"
fi

echo ""
echo "🌐 Step 6: Dashboard and UI Testing"
echo "-----------------------------------"

# Test customer dashboard
dashboard_response=$(curl -s -w "%{http_code}" -o /dev/null "$SERVER_URL/info-tracker.html")
if [ "$dashboard_response" = "200" ]; then
    log_test "Customer Info Tracker Dashboard" "PASS" "HTML served successfully"
else
    log_test "Customer Info Tracker Dashboard" "FAIL" "HTTP $dashboard_response"
fi

# Test interactive test dashboard
test_dashboard_response=$(curl -s -w "%{http_code}" -o /dev/null "$SERVER_URL/dashboard-test.html")
if [ "$test_dashboard_response" = "200" ]; then
    log_test "Interactive Test Dashboard" "PASS" "HTML served successfully"
else
    log_test "Interactive Test Dashboard" "FAIL" "HTTP $test_dashboard_response"
fi

echo ""
echo "📁 Step 7: VAPI Configuration Files Testing"
echo "-------------------------------------------"

# Check VAPI agent configuration files
vapi_configs=(
    "call-1-agent-prompt.md"
    "call-2-agent-prompt.md"
    "call-3-agent-prompt.md"
    "call-4-agent-prompt.md"
    "VAPI_SETUP_GUIDE.md"
)

for config in "${vapi_configs[@]}"; do
    if [ -f "/Users/morganwalker/DreamSeed/simple-vapi-webhook/vapi-agent-configs/$config" ]; then
        log_test "VAPI Config: $config" "PASS" "File exists and ready"
    else
        log_test "VAPI Config: $config" "FAIL" "File missing"
    fi
done

echo ""
echo "🔧 Step 8: Error Handling and Edge Cases"
echo "----------------------------------------"

# Test with invalid email
invalid_email_response=$(curl -s "$SERVER_URL/api/customer-completeness/invalid-email")
if echo "$invalid_email_response" | grep -q "error"; then
    log_test "Invalid Email Handling" "PASS" "Proper error response"
else
    log_test "Invalid Email Handling" "FAIL" "No error for invalid email"
fi

# Test with empty transcript
empty_transcript_response=$(curl -s -X POST "$SERVER_URL/api/test-extraction" \
  -H "Content-Type: application/json" \
  -d '{"transcript": "", "callStage": 1}')

if echo "$empty_transcript_response" | grep -q "error"; then
    log_test "Empty Transcript Handling" "PASS" "Proper error response"
else
    log_test "Empty Transcript Handling" "FAIL" "No error for empty transcript"
fi

# Test with invalid call stage
invalid_stage_response=$(curl -s -X POST "$SERVER_URL/api/test-extraction" \
  -H "Content-Type: application/json" \
  -d '{"transcript": "test", "callStage": 99}')

if echo "$invalid_stage_response" | jq . > /dev/null 2>&1; then
    log_test "Invalid Call Stage Handling" "PASS" "Graceful handling"
else
    log_test "Invalid Call Stage Handling" "FAIL" "System error"
fi

echo ""
echo "📈 Step 9: Performance and Load Testing"
echo "---------------------------------------"

# Test multiple rapid requests
start_time=$(date +%s)
for i in {1..5}; do
    curl -s "$SERVER_URL/api/all" > /dev/null
done
end_time=$(date +%s)
duration=$((end_time - start_time))

if [ "$duration" -lt 10 ]; then
    log_test "Multiple Requests Performance" "PASS" "${duration}s for 5 requests"
else
    log_test "Multiple Requests Performance" "FAIL" "${duration}s too slow"
fi

echo ""
echo "🎯 COMPREHENSIVE TEST RESULTS"
echo "=============================="
echo -e "${GREEN}✅ Tests Passed: $TESTS_PASSED${NC}"
echo -e "${RED}❌ Tests Failed: $TESTS_FAILED${NC}"

if [ $TESTS_FAILED -gt 0 ]; then
    echo ""
    echo -e "${YELLOW}Failed Tests:${NC}"
    for failed_test in "${FAILED_TESTS[@]}"; do
        echo -e "  ${RED}• $failed_test${NC}"
    done
fi

echo ""
echo "📊 Overall Success Rate: $(( TESTS_PASSED * 100 / (TESTS_PASSED + TESTS_FAILED) ))%"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED! System is ready for production.${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  Some tests failed. Review issues before production use.${NC}"
    exit 1
fi