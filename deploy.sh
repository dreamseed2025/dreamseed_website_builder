#!/bin/bash

echo "🚀 DreamSeed VAPI Deployment Script"
echo "===================================="
echo ""
echo "This script will help you deploy to Vercel for HTTPS voice calls"
echo ""

# Check if vercel is installed
if ! command -v vercel &> /dev/null
then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

echo "📝 Steps to deploy:"
echo "1. Run: vercel login (choose GitHub or Email)"
echo "2. After login, run: vercel"
echo "3. Follow the prompts:"
echo "   - Project name: dreamseed-vapi"
echo "   - Directory: ./"
echo "   - Override settings: No"
echo ""
echo "4. Add environment variables in Vercel dashboard:"
echo "   VAPI_PUBLIC_KEY=360c27df-9f83-4b80-bd33-e17dbcbf4971"
echo "   VAPI_PRIVATE_KEY=3359a2eb-02e4-4f31-a5aa-37c2a020a395"
echo "   SUPABASE_URL=your_value"
echo "   SUPABASE_SERVICE_ROLE_KEY=your_value"
echo "   AUTH_TEST_MODE=true"
echo ""
echo "5. Redeploy: vercel --prod"
echo ""
echo "Ready? Login first with: vercel login"