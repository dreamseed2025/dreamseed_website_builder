#!/bin/bash

# GoDaddy Domain Availability Checker
# Check if domains are available for registration using GoDaddy API
# 
# Usage: ./check-domain.sh domain1.com [domain2.net domain3.org ...]
# 
# Required environment variables:
#   GODADDY_KEY    - Your GoDaddy API key
#   GODADDY_SECRET - Your GoDaddy API secret

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to show usage
show_usage() {
    echo "Usage: $0 domain1.com [domain2.net domain3.org ...]"
    echo ""
    echo "Check domain availability using GoDaddy API"
    echo ""
    echo "Required environment variables:"
    echo "  GODADDY_KEY    - Your GoDaddy API key"
    echo "  GODADDY_SECRET - Your GoDaddy API secret"
    echo ""
    echo "Examples:"
    echo "  $0 example.com"
    echo "  $0 example.com example.net example.org"
    exit 1
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to parse JSON without jq (fallback)
parse_json_fallback() {
    local json="$1"
    local key="$2"
    
    # Simple regex-based JSON parsing for boolean and numeric values
    if echo "$json" | grep -q "\"$key\"[[:space:]]*:[[:space:]]*true"; then
        echo "true"
    elif echo "$json" | grep -q "\"$key\"[[:space:]]*:[[:space:]]*false"; then
        echo "false"
    elif echo "$json" | grep -q "\"$key\"[[:space:]]*:[[:space:]]*[0-9]"; then
        echo "$json" | sed -n "s/.*\"$key\"[[:space:]]*:[[:space:]]*\([0-9]*\).*/\1/p" | head -1
    else
        echo ""
    fi
}

# Function to parse JSON with jq if available, fallback otherwise
parse_json() {
    local json="$1"
    local key="$2"
    
    if command_exists jq; then
        echo "$json" | jq -r ".$key // empty"
    else
        parse_json_fallback "$json" "$key"
    fi
}

# Function to format price from micros to USD
format_price() {
    local micros="$1"
    if [ -n "$micros" ] && [ "$micros" != "null" ] && [ "$micros" -gt 0 ]; then
        # Convert micros to dollars (divide by 1,000,000)
        local dollars=$((micros / 1000000))
        local cents=$(((micros % 1000000) / 10000))
        printf "%d.%02d" "$dollars" "$cents"
    else
        echo "N/A"
    fi
}

# Function to check domain availability
check_domain() {
    local domain="$1"
    local api_url="https://api.godaddy.com/v1/domains/available?domain=${domain}"
    
    # Make API request
    local response
    local http_code
    
    response=$(curl -s -w "%{http_code}" \
        -H "Authorization: sso-key ${GODADDY_KEY}:${GODADDY_SECRET}" \
        -H "Accept: application/json" \
        "$api_url")
    
    # Extract HTTP status code and response body
    http_code="${response: -3}"
    local json_response="${response%???}"
    
    # Check for API errors
    if [ "$http_code" != "200" ]; then
        echo -e "${RED}❌ ERROR checking $domain (HTTP $http_code)${NC}"
        if [ -n "$json_response" ]; then
            local error_msg
            error_msg=$(parse_json "$json_response" "message")
            if [ -n "$error_msg" ] && [ "$error_msg" != "null" ]; then
                echo -e "${RED}   Error: $error_msg${NC}"
            fi
        fi
        return 1
    fi
    
    # Parse availability and price
    local available
    local price_micros
    local currency
    
    available=$(parse_json "$json_response" "available")
    price_micros=$(parse_json "$json_response" "price")
    currency=$(parse_json "$json_response" "currency")
    
    # Default currency to USD if not specified
    if [ -z "$currency" ] || [ "$currency" = "null" ]; then
        currency="USD"
    fi
    
    # Display result
    if [ "$available" = "true" ]; then
        local formatted_price
        formatted_price=$(format_price "$price_micros")
        if [ "$formatted_price" != "N/A" ]; then
            echo -e "${GREEN}✅ $domain AVAILABLE — \$${formatted_price} ${currency}${NC}"
        else
            echo -e "${GREEN}✅ $domain AVAILABLE${NC}"
        fi
    else
        echo -e "${RED}❌ $domain TAKEN${NC}"
    fi
    
    return 0
}

# Main script

# Check if domains are provided
if [ $# -eq 0 ]; then
    echo -e "${RED}Error: No domains specified${NC}" >&2
    echo ""
    show_usage
fi

# Check for required environment variables
if [ -z "${GODADDY_KEY:-}" ]; then
    echo -e "${RED}Error: GODADDY_KEY environment variable is required${NC}" >&2
    echo "Set it with: export GODADDY_KEY='your-api-key'"
    exit 1
fi

if [ -z "${GODADDY_SECRET:-}" ]; then
    echo -e "${RED}Error: GODADDY_SECRET environment variable is required${NC}" >&2
    echo "Set it with: export GODADDY_SECRET='your-api-secret'"
    exit 1
fi

# Check if curl is available
if ! command_exists curl; then
    echo -e "${RED}Error: curl is required but not installed${NC}" >&2
    exit 1
fi

# Inform user about jq availability
if ! command_exists jq; then
    echo -e "${YELLOW}Note: jq not found, using fallback JSON parsing${NC}" >&2
fi

echo "Checking domain availability..."
echo ""

# Track if any errors occurred
error_count=0

# Check each domain
for domain in "$@"; do
    if ! check_domain "$domain"; then
        ((error_count++))
    fi
done

echo ""

# Exit with error code if any checks failed
if [ $error_count -gt 0 ]; then
    echo -e "${RED}$error_count domain check(s) failed${NC}" >&2
    exit 1
else
    echo -e "${GREEN}All domain checks completed successfully${NC}"
    exit 0
fi