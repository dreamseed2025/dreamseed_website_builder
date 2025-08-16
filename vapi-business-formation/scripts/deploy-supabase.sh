#!/bin/bash

# Deploy Supabase Edge Functions and Database Schema
# Run this script to deploy everything to Supabase

echo "🚀 Deploying Vapi Business Formation System to Supabase..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed"
    echo "Please install it with: npm install -g supabase"
    exit 1
fi

# Check if logged in to Supabase
if ! supabase projects list &> /dev/null; then
    echo "❌ Not logged in to Supabase"
    echo "Please run: supabase login"
    exit 1
fi

# Set the project reference
PROJECT_ID="plmmudazcsiksgmgphte"
echo "🔗 Linking to Supabase project: $PROJECT_ID"

# Link to the project
supabase link --project-ref $PROJECT_ID

# Deploy database schema
echo "📊 Deploying database schema..."
supabase db push

# Deploy Edge Functions
echo "⚡ Deploying Edge Functions..."

# Deploy each function
echo "  📞 Deploying call-1-webhook..."
supabase functions deploy call-1-webhook

echo "  📞 Deploying call-2-webhook..."
supabase functions deploy call-2-webhook

echo "  📞 Deploying call-3-webhook..."
supabase functions deploy call-3-webhook

echo "  📞 Deploying call-4-webhook..."
supabase functions deploy call-4-webhook

echo "  📊 Deploying analytics-dashboard..."
supabase functions deploy analytics-dashboard

# Set environment variables for functions
echo "🔐 Setting environment variables..."

# You'll need to set these manually in Supabase dashboard or use supabase secrets set
echo "Please set the following environment variables in your Supabase project:"
echo "  • OPENAI_API_KEY=your_openai_api_key"
echo "  • VAPI_API_KEY=your_vapi_api_key"
echo "  • VAPI_ASSISTANT_CALL_1=5ef9abf6-66b4-4457-9848-ee5436d6191f"
echo "  • VAPI_ASSISTANT_CALL_2=eb760659-21ba-4f94-a291-04f0897f0328"
echo "  • VAPI_ASSISTANT_CALL_3=65ddc60b-b813-49b6-9986-38ee2974cfc9"
echo "  • VAPI_ASSISTANT_CALL_4=af397e88-c286-416f-9f74-e7665401bdb7"
echo "  • WEBHOOK_SECRET=your_secure_webhook_secret"

echo ""
echo "You can set these with commands like:"
echo "  supabase secrets set OPENAI_API_KEY=your_key_here"

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🔗 Your webhook URLs are:"
echo "  • Call 1: https://plmmudazcsiksgmgphte.supabase.co/functions/v1/call-1-webhook"
echo "  • Call 2: https://plmmudazcsiksgmgphte.supabase.co/functions/v1/call-2-webhook"
echo "  • Call 3: https://plmmudazcsiksgmgphte.supabase.co/functions/v1/call-3-webhook"
echo "  • Call 4: https://plmmudazcsiksgmgphte.supabase.co/functions/v1/call-4-webhook"
echo "  • Analytics: https://plmmudazcsiksgmgphte.supabase.co/functions/v1/analytics-dashboard"
echo ""
echo "📋 Next steps:"
echo "  1. Set environment variables in Supabase dashboard"
echo "  2. Run setup-vapi-webhooks.ts to configure Vapi.ai assistants"
echo "  3. Test the system with a phone call"