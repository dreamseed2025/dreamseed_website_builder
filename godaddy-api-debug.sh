#!/bin/bash
#
# GoDaddy API Debug Script
# Tests different endpoints and configurations to diagnose API access issues
#
set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 GoDaddy API Diagnostics${NC}"
echo "=================================="

# Check credentials
if [[ -z "${GODADDY_KEY:-}" ]] || [[ -z "${GODADDY_SECRET:-}" ]]; then
    echo -e "${RED}❌ Credentials not set. Run:${NC}"
    echo "export GODADDY_KEY=\"your_key\""
    echo "export GODADDY_SECRET=\"your_secret\""
    exit 1
fi

echo -e "${GREEN}✅ Credentials found${NC}"
echo "Key: ${GODADDY_KEY:0:10}..."
echo "Secret: ${GODADDY_SECRET:0:10}..."
echo

# Test different endpoints
echo -e "${YELLOW}Testing different API endpoints...${NC}"
echo

# 1. Test basic authentication with account info
echo "1. Testing account access..."
response=$(curl -s -w "%{http_code}" -H "Authorization: sso-key ${GODADDY_KEY}:${GODADDY_SECRET}" \
    -H "Accept: application/json" \
    "https://api.godaddy.com/v1/shoppers/subaccount" 2>/dev/null || echo "000")

http_code="${response: -3}"
if [[ "$http_code" == "200" ]]; then
    echo -e "   ${GREEN}✅ Account access: OK${NC}"
elif [[ "$http_code" == "403" ]]; then
    echo -e "   ${YELLOW}⚠️  Account access: No permission${NC}"
else
    echo -e "   ${RED}❌ Account access: HTTP $http_code${NC}"
fi

# 2. Test domain availability endpoint (original)
echo "2. Testing domain availability (production)..."
response=$(curl -s -w "%{http_code}" -H "Authorization: sso-key ${GODADDY_KEY}:${GODADDY_SECRET}" \
    -H "Accept: application/json" \
    "https://api.godaddy.com/v1/domains/available?domain=test123456789.com" 2>/dev/null || echo "000")

http_code="${response: -3}"
if [[ "$http_code" == "200" ]]; then
    echo -e "   ${GREEN}✅ Domain availability: OK${NC}"
    echo "   Response: ${response%???}"
elif [[ "$http_code" == "403" ]]; then
    echo -e "   ${RED}❌ Domain availability: Access denied${NC}"
    echo "   Response: ${response%???}"
else
    echo -e "   ${RED}❌ Domain availability: HTTP $http_code${NC}"
    echo "   Response: ${response%???}"
fi

# 3. Test sandbox environment
echo "3. Testing sandbox environment..."
response=$(curl -s -w "%{http_code}" -H "Authorization: sso-key ${GODADDY_KEY}:${GODADDY_SECRET}" \
    -H "Accept: application/json" \
    "https://api.ote-godaddy.com/v1/domains/available?domain=test123456789.com" 2>/dev/null || echo "000")

http_code="${response: -3}"
if [[ "$http_code" == "200" ]]; then
    echo -e "   ${GREEN}✅ Sandbox domain availability: OK${NC}"
    echo "   Response: ${response%???}"
    echo -e "\n${GREEN}🎉 Sandbox works! Update the script to use sandbox URL.${NC}"
elif [[ "$http_code" == "403" ]]; then
    echo -e "   ${YELLOW}⚠️  Sandbox domain availability: Access denied${NC}"
    echo "   Response: ${response%???}"
else
    echo -e "   ${RED}❌ Sandbox domain availability: HTTP $http_code${NC}"
    echo "   Response: ${response%???}"
fi

# 4. Test alternative domain suggestion endpoint
echo "4. Testing domain suggestions..."
response=$(curl -s -w "%{http_code}" -H "Authorization: sso-key ${GODADDY_KEY}:${GODADDY_SECRET}" \
    -H "Accept: application/json" \
    "https://api.godaddy.com/v1/domains/suggest?query=test&country=US&city=Los%20Angeles&sources=CC&tlds=.com&lengthMax=25&lengthMin=1&limit=10&waitMs=1000" 2>/dev/null || echo "000")

http_code="${response: -3}"
if [[ "$http_code" == "200" ]]; then
    echo -e "   ${GREEN}✅ Domain suggestions: OK${NC}"
    echo "   Response: ${response%???}" | head -c 100
    echo "..."
else
    echo -e "   ${RED}❌ Domain suggestions: HTTP $http_code${NC}"
    echo "   Response: ${response%???}"
fi

echo
echo -e "${BLUE}📋 Summary${NC}"
echo "================"
echo "If sandbox works, your credentials are valid but production API access is restricted."
echo "Solutions:"
echo "1. Contact GoDaddy support to enable production domain API access"
echo "2. Use sandbox for testing (update script URL)"
echo "3. Check if your account needs upgraded API permissions"