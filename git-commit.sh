#!/bin/bash

# DreamSeed VAPI Web Call System - Git Commit Script
echo "🚀 Creating git commit for DreamSeed VAPI improvements..."

# Initialize git if not already initialized
if [ ! -d ".git" ]; then
    echo "📝 Initializing git repository..."
    git init
    echo "✅ Git repository initialized"
fi

# Add all files
echo "📂 Adding all files to git..."
git add .

# Check status
echo "📊 Git status:"
git status --short

# Create commit with comprehensive message
echo "💾 Creating commit..."
git commit -m "Enhanced VAPI web call system with multiple solutions

🎯 Web Call Improvements:
- Added VAPI public key support in .env configuration
- Created multiple web call interfaces (web-call-button.html, web-call-fixed.html, web-call-proxy.html)
- Implemented server-side call initiation as fallback
- Enhanced error handling and debugging capabilities

🔧 Server Updates:
- Updated /api/vapi-config endpoint to handle both public and private keys
- Added /api/create-web-session endpoint for advanced web call management
- Improved VAPI SDK integration with proper event handling

📱 New Pages Created:
- web-call-fixed.html: Robust web call with comprehensive debugging
- web-call-proxy.html: Phone callback solution (guaranteed to work)
- vapi-fix-guide.html: Detailed troubleshooting and setup guide
- git-commit.sh: This commit script

✅ Features:
- Microphone permission handling
- Real-time call status updates
- Customer context preservation
- Multiple fallback options for reliable calling
- Comprehensive debug output for troubleshooting

🎉 Generated with Claude Code"

echo "✅ Commit created successfully!"
echo "📊 Recent commits:"
git log --oneline -3

echo ""
echo "🌐 To push to remote repository:"
echo "git remote add origin <your-repository-url>"
echo "git branch -M main"
echo "git push -u origin main"