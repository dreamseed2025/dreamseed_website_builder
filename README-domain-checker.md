# GoDaddy Domain Availability Checker

A minimal, reliable CLI tool to check domain availability using GoDaddy's API. Built with Bash and curl for maximum portability.

## Features

- ✅ Check single or multiple domains in one request
- 💰 Display pricing information when available
- 🎨 Clean, human-readable output with status icons
- 📄 Optional JSON output for programmatic use
- 🔒 Secure credential handling via environment variables
- 🚀 No dependencies except curl (jq optional for prettier JSON)

## Quick Start

### 1. Set Environment Variables

```bash
export GODADDY_KEY="YOUR_API_KEY"
export GODADDY_SECRET="YOUR_API_SECRET"
```

Get your API credentials from [GoDaddy Developer Portal](https://developer.godaddy.com/).

### 2. Check Domain Availability

```bash
# Single domain
./check-domain.sh example.com

# Multiple domains
./check-domain.sh one.com,two.net,three.ai

# JSON output
./check-domain.sh --json dreamseed.ai
```

## Installation

```bash
# Download the script
curl -O https://raw.githubusercontent.com/your-repo/check-domain.sh

# Make it executable
chmod +x check-domain.sh

# Optionally, move to PATH
sudo mv check-domain.sh /usr/local/bin/check-domain
```

## Usage

```
Usage: check-domain.sh [--json] <domain[,domain2,...]>

Check domain availability using GoDaddy API.

Examples:
  check-domain.sh example.com
  check-domain.sh one.com,two.net,three.ai
  check-domain.sh --json dreamseed.ai

Options:
  --json    Output raw JSON response (pretty-printed if jq available)

Environment Variables Required:
  GODADDY_KEY       Your GoDaddy API key
  GODADDY_SECRET    Your GoDaddy API secret
```

## Output Examples

### Human-Readable Format (Default)
```bash
$ ./check-domain.sh google.com,newdomain123.com
❌ google.com TAKEN
✅ newdomain123.com AVAILABLE — $11.99 USD
```

### JSON Format
```bash
$ ./check-domain.sh --json example.com
[
  {
    "domain": "example.com",
    "available": false,
    "definitive": true
  }
]
```

## Quick One-Liners

### Raw JSON Response
```bash
curl -s -H "Authorization: sso-key ${GODADDY_KEY}:${GODADDY_SECRET}" \
     -H "Accept: application/json" \
     "https://api.godaddy.com/v1/domains/available?domain=example.com"
```

### Extract Available Status (requires jq)
```bash
curl -s -H "Authorization: sso-key ${GODADDY_KEY}:${GODADDY_SECRET}" \
     -H "Accept: application/json" \
     "https://api.godaddy.com/v1/domains/available?domain=example.com" | \
     jq -r '.[] | "\(.domain): \(if .available then "AVAILABLE" else "TAKEN" end)"'
```

### Shell Function
Paste this into your shell for quick checks:

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
        if echo "$response" | grep -q '"available":true'; then
            echo "✅ $domain AVAILABLE"
        else
            echo "❌ $domain TAKEN"
        fi
    fi
}
```

Then use: `checkdomain example.com`

## Requirements

- **curl** (required) - For making HTTP requests
- **bc** (recommended) - For price calculations
- **jq** (optional) - For prettier JSON output and robust parsing

Most systems have these pre-installed. On Ubuntu/Debian:
```bash
sudo apt-get install curl bc jq
```

On macOS with Homebrew:
```bash
brew install curl bc jq
```

## API Details

- **Endpoint**: `GET https://api.godaddy.com/v1/domains/available`
- **Rate Limits**: GoDaddy API has rate limits - see their documentation
- **Price Format**: Prices are returned in micros (divide by 1,000,000 for dollars)
- **Bulk Requests**: Up to 500 domains per request (comma-separated)

## Exit Codes

- `0` - Success
- `1` - HTTP/API error (network issues, API errors)
- `2` - Usage/configuration error (missing credentials, invalid arguments)

## Troubleshooting

### Missing Credentials
```bash
Error: GODADDY_KEY environment variable is not set
Set it with: export GODADDY_KEY="YOUR_KEY"
```

**Solution**: Set your API credentials as shown in the Quick Start section.

### API Errors
```bash
Error: API request failed with status 401
Response: {"code":"AUTHENTICATION_FAILED","message":"Invalid authorization"}
```

**Solution**: Check that your API key and secret are correct and haven't expired.

### Invalid Domain Format
```bash
Error: Invalid domain format: invalid..domain
```

**Solution**: Ensure domains follow proper format (e.g., example.com, not example..com).

## Security Notes

- Credentials are read from environment variables only
- No secrets are written to disk or logged
- Use secure methods to set environment variables in production
- Consider using `.env` files or secret management systems

## Contributing

1. Fork the repository
2. Create a feature branch
3. Test your changes thoroughly
4. Submit a pull request

## License

MIT License - see LICENSE file for details.