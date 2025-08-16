#!/bin/bash

# Generate unique slug
UNIQUE_SLUG="test-$(date +%s)-$(openssl rand -hex 4)"

# Create test payload with unique slug
cat > /Users/morganwalker/DreamSeed/test_payload.json << EOF
{
  "slug": "${UNIQUE_SLUG}",
  "company_name": "Dream Seed Test",
  "profile_json": {
    "site": {
      "company_name": "Dream Seed Test",
      "domain": "test.dreamseed.ai"
    },
    "brand": {
      "primary_hex": "#0E0E10",
      "secondary_hex": "#F59E0B",
      "accent_hex": "#10B981"
    },
    "services": [
      {
        "name": "Test Service",
        "description": "Test service for validation",
        "icon": "test"
      }
    ],
    "testimonials": [
      {
        "name": "Test User",
        "company": "Test Company",
        "quote": "This is a test testimonial",
        "rating": 5
      }
    ],
    "plans": [
      {
        "name": "Test Plan",
        "price": 999,
        "currency": "USD",
        "description": "Test plan for validation"
      }
    ]
  }
}
EOF

echo "Generated test payload with slug: ${UNIQUE_SLUG}"
echo "Sending to n8n workflow..."

# Test the n8n webhook
curl -X POST https://xxyyzzyy.app.n8n.cloud/webhook/dreamseed/publish \
  -H "Content-Type: application/json" \
  -d @/Users/morganwalker/DreamSeed/test_payload.json \
  -v

echo -e "\n\nTest completed. Check n8n execution logs for results."