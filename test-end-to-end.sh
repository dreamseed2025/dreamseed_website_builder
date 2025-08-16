#!/bin/bash

echo "🧪 DreamSeed End-to-End Test"
echo "=============================="
echo ""

echo "📞 Test Call Instructions:"
echo "1. Call Assistant: 5ef9abf6-66b4-4457-9848-ee5436d6191f"
echo "2. Say: 'Hi Alex! My name is [YOUR NAME], email [EMAIL], phone [PHONE]."
echo "   I want to start [BUSINESS TYPE] called [BUSINESS NAME] in [STATE]."
echo "   Please save this information to your system right away.'"
echo ""

echo "⏳ After your call, press ENTER to check results..."
read -p ""

echo ""
echo "🔍 Checking Results..."
echo ""

echo "1️⃣ Checking Webhook Data:"
curl -s "https://f918cc42cbcf.ngrok-free.app/calls-data.json" | node -e "
const data = JSON.parse(require('fs').readFileSync(0, 'utf8'));
console.log('Total calls:', data.calls.length);
if (data.calls.length > 0) {
  const latest = data.calls[data.calls.length - 1];
  console.log('Latest call:');
  console.log('  Customer:', latest.customer.name || 'N/A');
  console.log('  Business:', latest.businessName || 'N/A');
  console.log('  State:', latest.state || 'N/A');
  console.log('  Timestamp:', latest.timestamp);
} else {
  console.log('No calls found');
}
"

echo ""
echo "2️⃣ Checking Supabase Data:"
cd ~/enhanced-business-formation-mcp && node check-supabase-data.js | grep -E "(Found|Table exists|Error|✅|❌)"

echo ""
echo "3️⃣ Dashboard Link:"
echo "   🌐 https://f918cc42cbcf.ngrok-free.app"

echo ""
echo "🎯 Test Results:"
echo "• If you see data in both webhook AND Supabase → 🎉 Perfect!"
echo "• If only webhook has data → 🔧 MCP needs troubleshooting"
echo "• If no data anywhere → 📞 Call didn't reach webhook"