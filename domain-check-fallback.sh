#!/bin/bash
#
# Domain Availability Checker with Multiple Fallback Methods
# Tries GoDaddy API first, then falls back to alternative methods
#
set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

error() { echo -e "${RED}Error: $1${NC}" >&2; }
warn() { echo -e "${YELLOW}Warning: $1${NC}" >&2; }
success() { echo -e "${GREEN}$1${NC}"; }
info() { echo -e "${BLUE}$1${NC}"; }

# Method 1: GoDaddy API (if credentials available)
check_godaddy_api() {
    local domain="$1"
    
    if [[ -z "${GODADDY_KEY:-}" ]] || [[ -z "${GODADDY_SECRET:-}" ]]; then
        return 1
    fi
    
    local response
    local http_code
    
    response=$(curl -s -w "%{http_code}" \
        -H "Authorization: sso-key ${GODADDY_KEY}:${GODADDY_SECRET}" \
        -H "Accept: application/json" \
        "https://api.godaddy.com/v1/domains/available?domain=${domain}" 2>/dev/null || echo "000")
    
    http_code="${response: -3}"
    
    if [[ "$http_code" == "200" ]]; then
        local json_body="${response%???}"
        if command -v jq >/dev/null 2>&1; then
            local available=$(echo "$json_body" | jq -r '.[0].available')
            if [[ "$available" == "true" ]]; then
                success "✅ $domain AVAILABLE (GoDaddy API)"
            else
                echo "❌ $domain TAKEN (GoDaddy API)"
            fi
            return 0
        fi
    fi
    
    return 1
}

# Method 2: WHOIS lookup fallback
check_whois_fallback() {
    local domain="$1"
    
    if ! command -v whois >/dev/null 2>&1; then
        return 1
    fi
    
    info "Using WHOIS fallback for $domain..."
    
    local whois_result
    whois_result=$(whois "$domain" 2>/dev/null | head -20 || echo "")
    
    if [[ -z "$whois_result" ]]; then
        return 1
    fi
    
    # Check for common "not found" indicators
    if echo "$whois_result" | grep -qi "no match\|not found\|no entries found\|domain not found"; then
        success "✅ $domain AVAILABLE (WHOIS)"
        return 0
    elif echo "$whois_result" | grep -qi "creation date\|created\|registered"; then
        echo "❌ $domain TAKEN (WHOIS)"
        return 0
    fi
    
    return 1
}

# Method 3: DNS lookup fallback
check_dns_fallback() {
    local domain="$1"
    
    if ! command -v dig >/dev/null 2>&1; then
        return 1
    fi
    
    info "Using DNS fallback for $domain..."
    
    # Try to resolve the domain
    local dns_result
    dns_result=$(dig +short "$domain" 2>/dev/null || echo "")
    
    if [[ -z "$dns_result" ]]; then
        # No DNS record, likely available
        warn "⚠️  $domain NO DNS RECORD (likely available)"
        return 0
    else
        echo "❌ $domain HAS DNS RECORD (likely taken)"
        return 0
    fi
}

# Method 4: HTTP check fallback
check_http_fallback() {
    local domain="$1"
    
    info "Using HTTP fallback for $domain..."
    
    # Try to connect to the domain
    if curl -s --max-time 5 --head "http://$domain" >/dev/null 2>&1 || \
       curl -s --max-time 5 --head "https://$domain" >/dev/null 2>&1; then
        echo "❌ $domain WEBSITE RESPONDING (taken)"
        return 0
    else
        warn "⚠️  $domain NO WEBSITE (possibly available)"
        return 0
    fi
}

# Main check function with fallbacks
check_domain() {
    local domain="$1"
    
    echo "Checking: $domain"
    echo "------------------------"
    
    # Try GoDaddy API first
    if check_godaddy_api "$domain"; then
        return 0
    fi
    
    warn "GoDaddy API unavailable, trying fallback methods..."
    
    # Try WHOIS
    if check_whois_fallback "$domain"; then
        return 0
    fi
    
    # Try DNS
    if check_dns_fallback "$domain"; then
        return 0
    fi
    
    # Try HTTP as last resort
    if check_http_fallback "$domain"; then
        return 0
    fi
    
    error "Unable to check $domain with any method"
    return 1
}

# Main script
main() {
    if [[ $# -eq 0 ]]; then
        echo "Usage: $0 <domain[,domain2,...]>"
        echo
        echo "Examples:"
        echo "  $0 example.com"
        echo "  $0 one.com,two.net,three.ai"
        echo
        echo "Methods used (in order):"
        echo "  1. GoDaddy API (if GODADDY_KEY/SECRET set)"
        echo "  2. WHOIS lookup"
        echo "  3. DNS resolution"
        echo "  4. HTTP connection test"
        exit 1
    fi
    
    local domains="$1"
    IFS=',' read -ra DOMAIN_ARRAY <<< "$domains"
    
    for domain in "${DOMAIN_ARRAY[@]}"; do
        domain=$(echo "$domain" | tr -d ' ') # Remove spaces
        check_domain "$domain"
        echo
    done
}

main "$@"