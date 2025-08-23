#!/bin/bash

# GoDaddy Domain Availability Checker with Smart Suggestions
# Check if domains are available and suggest alternatives when taken
# 
# Usage: ./check-domain-smart.sh [options] domain1.com [domain2.net ...]
# 
# Options:
#   --no-suggestions    Don't check alternative TLDs when domain is taken
#   --max-suggestions N Maximum number of alternative TLDs to check (default: 5)
# 
# Required environment variables:
#   GODADDY_KEY    - Your GoDaddy API key
#   GODADDY_SECRET - Your GoDaddy API secret

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
MAX_SUGGESTIONS=5
SHOW_SUGGESTIONS=true

# Popular TLD alternatives (in order of preference)
POPULAR_TLDS=(
    "com" "net" "org" "io" "co" "app" "dev" "tech" "ai" "me"
    "biz" "info" "online" "site" "website" "store" "shop" "blog"
    "cloud" "digital" "solutions" "services" "agency" "studio"
)

# Function to show usage
show_usage() {
    echo "Usage: $0 [options] domain1.com [domain2.net domain3.org ...]"
    echo ""
    echo "Check domain availability using GoDaddy API with smart TLD suggestions"
    echo ""
    echo "Options:"
    echo "  --no-suggestions       Don't check alternative TLDs when domain is taken"
    echo "  --max-suggestions N    Maximum number of alternative TLDs to check (default: 5)"
    echo "  -h, --help            Show this help message"
    echo ""
    echo "Required environment variables:"
    echo "  GODADDY_KEY    - Your GoDaddy API key"
    echo "  GODADDY_SECRET - Your GoDaddy API secret"
    echo ""
    echo "Examples:"
    echo "  $0 example.com"
    echo "  $0 --max-suggestions 3 example.com"
    echo "  $0 --no-suggestions example.com example.net"
    echo ""
    echo "Set API credentials with:"
    echo "  export GODADDY_KEY='your-api-key'"
    echo "  export GODADDY_SECRET='your-api-secret'"
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

# Function to extract domain name without TLD
get_domain_name() {
    local domain="$1"
    echo "$domain" | sed 's/\.[^.]*$//'
}

# Function to extract TLD from domain
get_tld() {
    local domain="$1"
    echo "$domain" | sed 's/^[^.]*\.//'
}

# Function to check domain availability (silent version for suggestions)
check_domain_silent() {
    local domain="$1"
    local api_url="https://api.godaddy.com/v1/domains/available?domain=${domain}"
    
    # Make API request
    local response
    local http_code
    
    response=$(curl -s -w "%{http_code}" \
        -H "Authorization: sso-key ${GODADDY_KEY}:${GODADDY_SECRET}" \
        -H "Accept: application/json" \
        "$api_url" 2>/dev/null)
    
    # Extract HTTP status code and response body
    http_code="${response: -3}"
    local json_response="${response%???}"
    
    # Check for API errors
    if [ "$http_code" != "200" ]; then
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
    
    # Return result as formatted string
    if [ "$available" = "true" ]; then
        local formatted_price
        formatted_price=$(format_price "$price_micros")
        if [ "$formatted_price" != "N/A" ]; then
            echo "AVAILABLE|\$${formatted_price} ${currency}"
        else
            echo "AVAILABLE|"
        fi
        return 0
    else
        echo "TAKEN|"
        return 1
    fi
}

# Function to check domain availability with output
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
        return 0
    else
        echo -e "${RED}❌ $domain TAKEN${NC}"
        
        # Check for alternatives if enabled
        if [ "$SHOW_SUGGESTIONS" = "true" ]; then
            check_alternatives "$domain"
        fi
        
        return 1
    fi
}

# Function to check alternative TLDs
check_alternatives() {
    local original_domain="$1"
    local domain_name=$(get_domain_name "$original_domain")
    local original_tld=$(get_tld "$original_domain")
    
    echo -e "${CYAN}   Checking alternatives for ${domain_name}...${NC}"
    
    local suggestions_found=0
    local checked_count=0
    
    for tld in "${POPULAR_TLDS[@]}"; do
        # Skip if this is the original TLD
        if [ "$tld" = "$original_tld" ]; then
            continue
        fi
        
        # Stop if we've reached max suggestions
        if [ $suggestions_found -ge $MAX_SUGGESTIONS ]; then
            break
        fi
        
        local alternative_domain="${domain_name}.${tld}"
        local result
        
        # Check availability silently
        if result=$(check_domain_silent "$alternative_domain"); then
            local status=$(echo "$result" | cut -d'|' -f1)
            local price=$(echo "$result" | cut -d'|' -f2)
            
            if [ "$status" = "AVAILABLE" ]; then
                if [ -n "$price" ]; then
                    echo -e "${GREEN}   💡 $alternative_domain AVAILABLE — $price${NC}"
                else
                    echo -e "${GREEN}   💡 $alternative_domain AVAILABLE${NC}"
                fi
                ((suggestions_found++))
            fi
        fi
        
        ((checked_count++))
        
        # Add small delay to avoid hitting rate limits
        sleep 0.1
    done
    
    if [ $suggestions_found -eq 0 ]; then
        echo -e "${YELLOW}   💭 No available alternatives found in popular TLDs${NC}"
    fi
}

# Parse command line arguments
DOMAINS=()

while [[ $# -gt 0 ]]; do
    case $1 in
        --no-suggestions)
            SHOW_SUGGESTIONS=false
            shift
            ;;
        --max-suggestions)
            if [[ -n "${2:-}" ]] && [[ "$2" =~ ^[0-9]+$ ]]; then
                MAX_SUGGESTIONS="$2"
                shift 2
            else
                echo -e "${RED}Error: --max-suggestions requires a number${NC}" >&2
                exit 1
            fi
            ;;
        -h|--help)
            show_usage
            ;;
        -*)
            echo -e "${RED}Error: Unknown option $1${NC}" >&2
            show_usage
            ;;
        *)
            DOMAINS+=("$1")
            shift
            ;;
    esac
done

# Check if domains are provided
if [ ${#DOMAINS[@]} -eq 0 ]; then
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

# Show configuration
echo "Checking domain availability..."
if [ "$SHOW_SUGGESTIONS" = "true" ]; then
    echo -e "${BLUE}Smart suggestions enabled (max: $MAX_SUGGESTIONS alternatives)${NC}"
else
    echo -e "${YELLOW}Smart suggestions disabled${NC}"
fi
echo ""

# Track if any errors occurred
error_count=0

# Check each domain
for domain in "${DOMAINS[@]}"; do
    if ! check_domain "$domain"; then
        ((error_count++))
    fi
    echo ""
done

# Exit with error code if any checks failed
if [ $error_count -gt 0 ]; then
    echo -e "${RED}$error_count domain check(s) failed${NC}" >&2
    exit 1
else
    echo -e "${GREEN}All domain checks completed successfully${NC}"
    exit 0
fi