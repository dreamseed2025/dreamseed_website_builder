# GoDaddy Domain Check - Curl One-liners

## Raw JSON Response
```bash
curl -s -H "Authorization: sso-key ${GODADDY_KEY}:${GODADDY_SECRET}" \
     -H "Accept: application/json" \
     "https://api.godaddy.com/v1/domains/available?domain=example.com"
```

## Extract Available Status Only (requires jq)
```bash
curl -s -H "Authorization: sso-key ${GODADDY_KEY}:${GODADDY_SECRET}" \
     -H "Accept: application/json" \
     "https://api.godaddy.com/v1/domains/available?domain=example.com" | \
     jq -r '.[] | "\(.domain): \(if .available then "AVAILABLE" else "TAKEN" end)"'
```

## Bulk Check Multiple Domains
```bash
curl -s -H "Authorization: sso-key ${GODADDY_KEY}:${GODADDY_SECRET}" \
     -H "Accept: application/json" \
     "https://api.godaddy.com/v1/domains/available?domain=one.com,two.net,three.ai" | \
     jq -r '.[] | "\(.domain): \(if .available then "✅ AVAILABLE" else "❌ TAKEN" end)"'
```

## Shell Function (paste into your shell)

```bash
checkdomain() {
    local domain="$1"
    if [[ -z "$domain" ]]; then
        echo "Usage: checkdomain <domain>"
        return 1
    fi
    
    if [[ -z "${GODADDY_KEY:-}" ]] || [[ -z "${GODADDY_SECRET:-}" ]]; then
        echo "Error: Set GODADDY_KEY and GODADDY_SECRET environment variables"
        return 1
    fi
    
    local response=$(curl -s -H "Authorization: sso-key ${GODADDY_KEY}:${GODADDY_SECRET}" \
                         -H "Accept: application/json" \
                         "https://api.godaddy.com/v1/domains/available?domain=${domain}")
    
    if command -v jq >/dev/null 2>&1; then
        echo "$response" | jq -r --arg domain "$domain" '
            .[] | select(.domain == $domain) | 
            if .available then 
                "✅ \(.domain) AVAILABLE" + (if .price then " — $" + ((.price/1000000)|tostring) + " " + .currency else "" end)
            else 
                "❌ \(.domain) TAKEN" 
            end'
    else
        # Fallback without jq
        if echo "$response" | grep -q '"available":true'; then
            echo "✅ $domain AVAILABLE"
        else
            echo "❌ $domain TAKEN"
        fi
    fi
}
```

## Advanced Shell Function with Price Formatting

```bash
checkdomain_advanced() {
    local domains="$1"
    if [[ -z "$domains" ]]; then
        echo "Usage: checkdomain_advanced <domain[,domain2,...]>"
        return 1
    fi
    
    if [[ -z "${GODADDY_KEY:-}" ]] || [[ -z "${GODADDY_SECRET:-}" ]]; then
        echo "Error: Set GODADDY_KEY and GODADDY_SECRET environment variables"
        return 1
    fi
    
    local response=$(curl -s -H "Authorization: sso-key ${GODADDY_KEY}:${GODADDY_SECRET}" \
                         -H "Accept: application/json" \
                         "https://api.godaddy.com/v1/domains/available?domain=${domains}")
    
    if command -v jq >/dev/null 2>&1; then
        echo "$response" | jq -r '.[] | 
            if .available then 
                "✅ \(.domain) AVAILABLE" + 
                (if .price and .price != null then 
                    " — $" + ((.price/1000000)*100|round/100|tostring) + " " + (.currency // "USD")
                else 
                    "" 
                end)
            else 
                "❌ \(.domain) TAKEN" 
            end'
    else
        echo "Note: Install jq for better formatting"
        echo "$response"
    fi
}
```