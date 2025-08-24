#!/bin/bash

# 🎤 VAPI VOICE WIDGET RECREATION SCRIPT
# This script recreates the fantastic VAPI voice widget from backup

echo "🎤 Recreating VAPI Voice Widget..."

# Create the directory if it doesn't exist
mkdir -p app/vapi-hosted-widget-simple

# Copy the backup to the correct location
cp VAPI_VOICE_WIDGET_BACKUP.tsx app/vapi-hosted-widget-simple/page.tsx

# Check if the route is in middleware.ts
if ! grep -q "vapi-hosted-widget-simple" middleware.ts; then
    echo "⚠️  Adding route to middleware.ts..."
    # Add the route to publicRoutes array (you'll need to do this manually)
    echo "Please add '/vapi-hosted-widget-simple' to the publicRoutes array in middleware.ts"
fi

echo "✅ VAPI Voice Widget recreated!"
echo "🌐 Access at: http://localhost:3000/vapi-hosted-widget-simple"
echo "🎤 The fantastic AI voice widget you loved!"

# Optional: Start the development server if not running
if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "🚀 Starting development server..."
    npm run dev &
    sleep 3
    echo "✅ Server should be running at http://localhost:3000"
fi

