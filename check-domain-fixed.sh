#!/bin/bash
#
# Universal Domain Availability Checker
# Tries GoDaddy API first, then reliable fallback methods
#
set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_NAME="$(basename "$0")"

# Usage function
usage() {
    cat << EOF
Usage: $SCRIPT_NAME [--json] [--method METHOD] <domain[,domain2,...]>

Universal domain availability checker with multiple methods.

Examples:
  $SCRIPT_NAME example.com
  $SCRIPT_NAME one.com,two.net,three.ai
  $SCRIPT_NAME --json dreamseed.ai
  $SCRIPT_NAME --method whois example.com

Options:
  --json           Output JSON format
  --method METHOD  Force specific method: godaddy, whois, dns, http, auto

Methods (tried in order with --method auto):
  1. GoDaddy API (if credentials available)
  2. WHOIS lookup (most reliable)
  3. DNS resolution check
  4. HTTP connection test

Environment Variables (optional):
  GODADDY_KEY       Your GoDaddy API key
  GODADDY_SECRET    Your GoDaddy API secret
EOF
}

error() { echo -e "${RED}Error: $1${NC}" >&2; }
warn() { echo -e "${YELLOW}Warning: $1${NC}" >&2; }
success() { echo -e "${GREEN}$1${NC}"; }
info() { echo -e "${BLUE}$1${NC}"; }

# GoDaddy API method
check_godaddy() {
    local domain="$1"
    local json_output="$2"
    
    if [[ -z "${GODADDY_KEY:-}" ]] || [[ -z "${GODADDY_SECRET:-}" ]]; then
        [[ "$json_output" != "true" ]] && warn "GoDaddy credentials not set"
        return 1
    fi
    
    local temp_file=$(mktemp)
    trap "rm -f '$temp_file'" RETURN
    
    local http_code
    if ! http_code=$(curl -s -w "%{http_code}" \
        -H "Authorization: sso-key ${GODADDY_KEY}:${GODADDY_SECRET}" \
        -H "Accept: application/json" \
        "https://api.godaddy.com/v1/domains/available?domain=${domain}" \
        -o "$temp_file" 2>/dev/null); then
        return 1
    fi
    
    local response=$(cat "$temp_file")
    
    if [[ "$http_code" == "200" ]]; then
        if [[ "$json_output" == "true" ]]; then
            echo "$response"
            return 0
        fi
        
        if command -v jq >/dev/null 2>&1; then
            local available=$(echo "$response" | jq -r '.[0].available')
            local price=$(echo "$response" | jq -r '.[0].price // empty')
            local currency=$(echo "$response" | jq -r '.[0].currency // "USD"')
            
            if [[ "$available" == "true" ]]; then
                local price_text=""
                if [[ -n "$price" && "$price" != "null" ]]; then
                    local price_dollars=$(echo "scale=2; $price / 1000000" | bc 2>/dev/null || echo "")
                    [[ -n "$price_dollars" ]] && price_text=" — \$${price_dollars} ${currency}"
                fi
                success "✅ $domain AVAILABLE (GoDaddy)$price_text"
            else
                echo "❌ $domain TAKEN (GoDaddy)"
            fi
            return 0
        fi
    fi
    
    [[ "$json_output" != "true" ]] && warn "GoDaddy API error (HTTP $http_code)"
    return 1
}

# WHOIS method
check_whois() {
    local domain="$1"
    local json_output="$2"
    
    if ! command -v whois >/dev/null 2>&1; then
        [[ "$json_output" != "true" ]] && warn "whois command not available"
        return 1
    fi
    
    local whois_result
    whois_result=$(timeout 10 whois "$domain" 2>/dev/null | head -30 || echo "")
    
    if [[ -z "$whois_result" ]]; then
        return 1
    fi
    
    # Check for "not found" patterns
    if echo "$whois_result" | grep -qi "no match\|not found\|no entries found\|domain not found\|no data found\|not registered"; then
        if [[ "$json_output" == "true" ]]; then
            echo "{\"domain\":\"$domain\",\"available\":true,\"method\":\"whois\"}"
        else
            success "✅ $domain AVAILABLE (WHOIS)"
        fi
        return 0
    elif echo "$whois_result" | grep -qi "creation date\|created\|registered\|registrar"; then
        if [[ "$json_output" == "true" ]]; then
            echo "{\"domain\":\"$domain\",\"available\":false,\"method\":\"whois\"}"
        else
            echo "❌ $domain TAKEN (WHOIS)"
        fi
        return 0
    fi
    
    return 1
}

# DNS method
check_dns() {
    local domain="$1"
    local json_output="$2"
    
    if ! command -v dig >/dev/null 2>&1 && ! command -v nslookup >/dev/null 2>&1; then
        [[ "$json_output" != "true" ]] && warn "dig/nslookup not available"
        return 1
    fi
    
    local has_records=false
    
    # Check A record
    if command -v dig >/dev/null 2>&1; then
        local a_record=$(dig +short "$domain" A 2>/dev/null || echo "")
        [[ -n "$a_record" ]] && has_records=true
    fi
    
    # Check MX record
    if command -v dig >/dev/null 2>&1; then
        local mx_record=$(dig +short "$domain" MX 2>/dev/null || echo "")
        [[ -n "$mx_record" ]] && has_records=true
    fi
    
    if [[ "$has_records" == "true" ]]; then
        if [[ "$json_output" == "true" ]]; then
            echo "{\"domain\":\"$domain\",\"available\":false,\"method\":\"dns\",\"confidence\":\"medium\"}"
        else
            echo "❌ $domain HAS DNS RECORDS (likely taken)"
        fi
    else
        if [[ "$json_output" == "true" ]]; then
            echo "{\"domain\":\"$domain\",\"available\":true,\"method\":\"dns\",\"confidence\":\"low\"}"
        else
            warn "⚠️  $domain NO DNS RECORDS (possibly available)"
        fi
    fi
    return 0
}

# HTTP method
check_http() {
    local domain="$1"
    local json_output="$2"
    
    local responds=false
    
    # Try HTTP and HTTPS
    if curl -s --max-time 5 --head "http://$domain" >/dev/null 2>&1 || \
       curl -s --max-time 5 --head "https://$domain" >/dev/null 2>&1; then
        responds=true
    fi
    
    if [[ "$responds" == "true" ]]; then
        if [[ "$json_output" == "true" ]]; then
            echo "{\"domain\":\"$domain\",\"available\":false,\"method\":\"http\",\"confidence\":\"medium\"}"
        else
            echo "❌ $domain WEBSITE RESPONDING (taken)"
        fi
    else
        if [[ "$json_output" == "true" ]]; then
            echo "{\"domain\":\"$domain\",\"available\":true,\"method\":\"http\",\"confidence\":\"low\"}"
        else
            warn "⚠️  $domain NO WEBSITE (possibly available)"
        fi
    fi
    return 0
}

# Auto method (tries all in order)
check_auto() {
    local domain="$1"
    local json_output="$2"
    
    # Try methods in order of reliability
    check_godaddy "$domain" "$json_output" && return 0
    check_whois "$domain" "$json_output" && return 0
    check_dns "$domain" "$json_output" && return 0
    check_http "$domain" "$json_output" && return 0
    
    if [[ "$json_output" == "true" ]]; then
        echo "{\"domain\":\"$domain\",\"available\":null,\"error\":\"Unable to check\"}"
    else
        error "Unable to check $domain with any method"
    fi
    return 1
}

# Main function
main() {
    local json_output="false"
    local method="auto"
    local domains=""
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --json)
                json_output="true"
                shift
                ;;
            --method)
                method="$2"
                shift 2
                ;;
            -h|--help)
                usage
                exit 0
                ;;
            -*)
                error "Unknown option: $1"
                usage >&2
                exit 2
                ;;
            *)
                if [[ -z "$domains" ]]; then
                    domains="$1"
                else
                    error "Too many arguments. Use comma-separated domains."
                    usage >&2
                    exit 2
                fi
                shift
                ;;
        esac
    done
    
    if [[ -z "$domains" ]]; then
        error "No domain specified"
        usage >&2
        exit 2
    fi
    
    # Validate method
    case "$method" in
        godaddy|whois|dns|http|auto) ;;
        *)
            error "Invalid method: $method"
            usage >&2
            exit 2
            ;;
    esac
    
    # Process domains
    IFS=',' read -ra DOMAIN_ARRAY <<< "$domains"
    local results=()
    
    for domain in "${DOMAIN_ARRAY[@]}"; do
        domain=$(echo "$domain" | tr -d ' ') # Remove spaces
        
        if [[ "$json_output" == "true" ]]; then
            case "$method" in
                godaddy) check_godaddy "$domain" "$json_output" ;;
                whois) check_whois "$domain" "$json_output" ;;
                dns) check_dns "$domain" "$json_output" ;;
                http) check_http "$domain" "$json_output" ;;
                auto) check_auto "$domain" "$json_output" ;;
            esac
        else
            echo "Checking: $domain"
            case "$method" in
                godaddy) check_godaddy "$domain" "$json_output" ;;
                whois) check_whois "$domain" "$json_output" ;;
                dns) check_dns "$domain" "$json_output" ;;
                http) check_http "$domain" "$json_output" ;;
                auto) check_auto "$domain" "$json_output" ;;
            esac
            echo
        fi
    done
}

main "$@"