#!/bin/bash

# GoDaddy Domain Availability Checker for API Integration
# Designed to work with Next.js API and return JSON output
# 
# Usage: ./check-domain-api.sh [options] domain1.com [domain2.net ...]
# 
# Options:
#   --json              Output JSON format
#   --no-suggestions    Don't check alternative TLDs when domain is taken
#   --max-suggestions N Maximum number of alternative TLDs to check (default: 5)
#   --method METHOD     Method to use (for compatibility, currently uses GoDaddy)
# 
# Required environment variables:
#   GODADDY_KEY    - Your GoDaddy API key
#   GODADDY_SECRET - Your GoDaddy API secret

set -euo pipefail

# Configuration
MAX_SUGGESTIONS=5
SHOW_SUGGESTIONS=true
OUTPUT_JSON=false
METHOD="godaddy"

# Popular TLD alternatives (in order of preference)
POPULAR_TLDS=(
    "com" "net" "org" "io" "co" "app" "dev" "tech" "ai" "me"
    "biz" "info" "online" "site" "website" "store" "shop" "blog"
    "cloud" "digital" "solutions" "services" "agency" "studio"
)

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to parse JSON without jq (fallback)
parse_json_fallback() {
    local json="$1"
    local key="$2"
    
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
    
    # Return result as JSON
    if [ "$available" = "true" ]; then
        if [ -n "$price_micros" ] && [ "$price_micros" != "null" ] && [ "$price_micros" -gt 0 ]; then
            echo "{\"domain\":\"$domain\",\"available\":true,\"price\":$price_micros,\"currency\":\"$currency\"}"
        else
            echo "{\"domain\":\"$domain\",\"available\":true,\"currency\":\"$currency\"}"
        fi
        return 0
    else
        echo "{\"domain\":\"$domain\",\"available\":false,\"currency\":\"$currency\"}"
        return 1
    fi
}

# Function to check domain availability with suggestions
check_domain_with_suggestions() {
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
        if [ "$OUTPUT_JSON" = "true" ]; then
            echo "{\"domain\":\"$domain\",\"available\":null,\"method\":\"$METHOD\",\"error\":\"API request failed with status $http_code\"}"
        else
            echo "❌ ERROR checking $domain (HTTP $http_code)"
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
    
    # Build result object
    local result="{\"domain\":\"$domain\",\"available\":$available,\"method\":\"$METHOD\""
    
    if [ -n "$price_micros" ] && [ "$price_micros" != "null" ] && [ "$price_micros" -gt 0 ]; then
        result="${result},\"price\":$price_micros"
    fi
    
    if [ -n "$currency" ] && [ "$currency" != "null" ]; then
        result="${result},\"currency\":\"$currency\""
    fi
    
    # Check for alternatives if domain is taken and suggestions are enabled
    local suggestions=""
    if [ "$available" = "false" ] && [ "$SHOW_SUGGESTIONS" = "true" ]; then
        suggestions=$(get_domain_suggestions "$domain")
        if [ -n "$suggestions" ]; then
            result="${result},\"suggestions\":[$suggestions]"
        fi
    fi
    
    result="${result}}"
    
    if [ "$OUTPUT_JSON" = "true" ]; then
        echo "$result"
    else
        # Format for human readable output
        if [ "$available" = "true" ]; then
            if [ -n "$price_micros" ] && [ "$price_micros" != "null" ] && [ "$price_micros" -gt 0 ]; then
                local dollars=$((price_micros / 1000000))
                local cents=$(((price_micros % 1000000) / 10000))
                printf "✅ %s AVAILABLE — \$%d.%02d %s\n" "$domain" "$dollars" "$cents" "$currency"
            else
                echo "✅ $domain AVAILABLE"
            fi
        else
            echo "❌ $domain TAKEN"
        fi
    fi
    
    return 0
}

# Function to get domain suggestions
get_domain_suggestions() {
    local original_domain="$1"
    local domain_name=$(get_domain_name "$original_domain")
    local original_tld=$(get_tld "$original_domain")
    
    local suggestions_json=""
    local suggestions_found=0
    
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
            if [ $suggestions_found -gt 0 ]; then
                suggestions_json="${suggestions_json},"
            fi
            suggestions_json="${suggestions_json}${result}"
            ((suggestions_found++))
        fi
        
        # Add small delay to avoid hitting rate limits
        sleep 0.1
    done
    
    echo "$suggestions_json"
}

# Parse command line arguments
DOMAINS=()

while [[ $# -gt 0 ]]; do
    case $1 in
        --json)
            OUTPUT_JSON=true
            shift
            ;;
        --no-suggestions)
            SHOW_SUGGESTIONS=false
            shift
            ;;
        --max-suggestions)
            if [[ -n "${2:-}" ]] && [[ "$2" =~ ^[0-9]+$ ]]; then
                MAX_SUGGESTIONS="$2"
                shift 2
            else
                echo "Error: --max-suggestions requires a number" >&2
                exit 1
            fi
            ;;
        --method)
            if [[ -n "${2:-}" ]]; then
                METHOD="$2"
                shift 2
            else
                echo "Error: --method requires a value" >&2
                exit 1
            fi
            ;;
        -*)
            echo "Error: Unknown option $1" >&2
            exit 1
            ;;
        *)
            # Handle comma-separated domains
            IFS=',' read -ra DOMAIN_LIST <<< "$1"
            for domain in "${DOMAIN_LIST[@]}"; do
                domain=$(echo "$domain" | tr -d ' ') # Remove spaces
                if [ -n "$domain" ]; then
                    DOMAINS+=("$domain")
                fi
            done
            shift
            ;;
    esac
done

# Check if domains are provided
if [ ${#DOMAINS[@]} -eq 0 ]; then
    if [ "$OUTPUT_JSON" = "true" ]; then
        echo "{\"error\":\"No domains specified\"}"
    else
        echo "Error: No domains specified" >&2
    fi
    exit 1
fi

# Check for required environment variables
if [ -z "${GODADDY_KEY:-}" ]; then
    if [ "$OUTPUT_JSON" = "true" ]; then
        echo "{\"error\":\"GODADDY_KEY environment variable is required\"}"
    else
        echo "Error: GODADDY_KEY environment variable is required" >&2
    fi
    exit 1
fi

if [ -z "${GODADDY_SECRET:-}" ]; then
    if [ "$OUTPUT_JSON" = "true" ]; then
        echo "{\"error\":\"GODADDY_SECRET environment variable is required\"}"
    else
        echo "Error: GODADDY_SECRET environment variable is required" >&2
    fi
    exit 1
fi

# Check if curl is available
if ! command_exists curl; then
    if [ "$OUTPUT_JSON" = "true" ]; then
        echo "{\"error\":\"curl is required but not installed\"}"
    else
        echo "Error: curl is required but not installed" >&2
    fi
    exit 1
fi

# Check each domain
for domain in "${DOMAINS[@]}"; do
    check_domain_with_suggestions "$domain"
done