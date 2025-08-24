#!/bin/bash

echo "🎤 Voice Widget Environment Setup"
echo "=================================="
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local file not found!"
    echo "Please create .env.local file first."
    exit 1
fi

echo "✅ Found .env.local file"
echo ""

# Check current environment variables
echo "🔍 Checking current environment variables..."

# Check Supabase
if grep -q "SUPABASE_URL" .env.local; then
    echo "✅ Supabase URL: Configured"
else
    echo "❌ Supabase URL: Missing"
fi

if grep -q "SUPABASE_ANON_KEY" .env.local; then
    echo "✅ Supabase Anon Key: Configured"
else
    echo "❌ Supabase Anon Key: Missing"
fi

# Check OpenAI
if grep -q "OPENAI_API_KEY" .env.local; then
    OPENAI_KEY=$(grep "OPENAI_API_KEY" .env.local | cut -d'=' -f2)
    if [[ "$OPENAI_KEY" == *"YOUR_OPENAI_KEY_HERE"* ]]; then
        echo "❌ OpenAI API Key: Not configured (still has placeholder)"
    else
        echo "✅ OpenAI API Key: Configured"
    fi
else
    echo "❌ OpenAI API Key: Missing"
fi

# Check VAPI
if grep -q "VAPI_PUBLIC_KEY" .env.local; then
    VAPI_KEY=$(grep "VAPI_PUBLIC_KEY" .env.local | cut -d'=' -f2)
    if [[ "$VAPI_KEY" == *"your_vapi_public_key_here"* ]]; then
        echo "❌ VAPI Public Key: Not configured (still has placeholder)"
    else
        echo "✅ VAPI Public Key: Configured"
    fi
else
    echo "❌ VAPI Public Key: Missing"
fi

if grep -q "VAPI_ASSISTANT_ID" .env.local; then
    VAPI_ASSISTANT=$(grep "VAPI_ASSISTANT_ID" .env.local | cut -d'=' -f2)
    if [[ "$VAPI_ASSISTANT" == *"your_vapi_assistant_id_here"* ]]; then
        echo "❌ VAPI Assistant ID: Not configured (still has placeholder)"
    else
        echo "✅ VAPI Assistant ID: Configured"
    fi
else
    echo "❌ VAPI Assistant ID: Missing"
fi

echo ""
echo "📝 To complete the setup, add these variables to your .env.local file:"
echo ""

# Show what needs to be added
if ! grep -q "VAPI_PUBLIC_KEY" .env.local; then
    echo "# VAPI Configuration"
    echo "VAPI_PUBLIC_KEY=your_vapi_public_key_here"
    echo "VAPI_ASSISTANT_ID=your_vapi_assistant_id_here"
    echo "VAPI_API_KEY=your_vapi_api_key_here"
    echo ""
fi

if ! grep -q "SUPABASE_ANON_KEY" .env.local; then
    echo "# Supabase Anon Key (if missing)"
    echo "SUPABASE_ANON_KEY=your_supabase_anon_key_here"
    echo ""
fi

echo "🔗 Get your API keys from:"
echo "   - OpenAI: https://platform.openai.com/api-keys"
echo "   - VAPI: https://dashboard.vapi.ai/account"
echo "   - Supabase: https://supabase.com/dashboard/project/[your-project]/settings/api"
echo ""

echo "🚀 After adding the keys, restart your server with:"
echo "   npm run dev"
echo ""

echo "🎯 Then test the voice widget at:"
echo "   http://localhost:3000/voice-widget-demo"

