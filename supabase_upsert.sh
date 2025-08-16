#!/usr/bin/env bash
# Upsert Dream Seed site + optional images into Supabase via REST & Storage.
# Fill these before running:
SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
SERVICE_ROLE="YOUR_SERVICE_ROLE_TOKEN"

# Core fields
SLUG="dream-seed"
COMPANY_NAME="Dream Seed"
PROFILE_JSON_PATH="dreamseed_profile.json"  # path to the JSON in this folder

# Create/Upsert row in sites
curl -sS -X POST "$SUPABASE_URL/rest/v1/sites?on_conflict=slug" \  -H "apikey: $SERVICE_ROLE" \  -H "Authorization: Bearer $SERVICE_ROLE" \  -H "Content-Type: application/json" \  -d "[{\"slug\": \"$SLUG\", \"company_name\": \"$COMPANY_NAME\", \"profile_json\": $(cat "$PROFILE_JSON_PATH"), \"status\": \"draft\"}]"

# Fetch the site id
SITE_ID=$(curl -sS -X GET "$SUPABASE_URL/rest/v1/sites?slug=eq.$SLUG&select=id" \  -H "apikey: $SERVICE_ROLE" -H "Authorization: Bearer $SERVICE_ROLE" | jq -r '.[0].id')

echo "SITE_ID=$SITE_ID"

# Example: upload a placeholder hero image file if you have one locally (./hero.jpg)
# Uncomment after adding a real file:
# curl -sS -X POST "$SUPABASE_URL/storage/v1/object/public/sites/$SITE_ID/hero.jpg" \#   -H "apikey: $SERVICE_ROLE" -H "Authorization: Bearer $SERVICE_ROLE" \#   -H "x-upsert: true" -H "Content-Type: image/jpeg" \#   --data-binary "@hero.jpg"
#
# Then record it in images table:
# HERO_URL="$SUPABASE_URL/storage/v1/object/public/sites/$SITE_ID/hero.jpg"
# curl -sS -X POST "$SUPABASE_URL/rest/v1/images?on_conflict=site_id,label" \#   -H "apikey: $SERVICE_ROLE" -H "Authorization: Bearer $SERVICE_ROLE" \#   -H "Content-Type: application/json" \#   -d "[{\"site_id\": \"$SITE_ID\", \"label\": \"hero.jpg\", \"url\": \"$HERO_URL\", \"storage_path\": \"sites/$SITE_ID/hero.jpg\"}]"
#
# Repeat per image you upload (logo.png, service images, etc.).
echo "Done. Upserted site row. Add images as needed, then run your publish step."