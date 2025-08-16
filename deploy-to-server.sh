#!/bin/bash

# DreamSeed VAPI Platform - Server Deployment Script
# This script deploys the latest code to your production server

echo "🚀 DreamSeed VAPI Deployment Script"
echo "===================================="

# Configuration (update these with your server details)
SERVER_USER="your-username"
SERVER_HOST="your-server.com"
SERVER_PATH="/var/www/dreamseed-vapi"
GITLAB_REPO="git@gitlab.com:your-username/simple-vapi-webhook.git"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Deploying to: $SERVER_HOST${NC}"

# Step 1: Push to GitLab
echo -e "${GREEN}Step 1: Pushing to GitLab...${NC}"
git add -A
git commit -m "Auto-deploy: $(date +'%Y-%m-%d %H:%M:%S')" || echo "No changes to commit"
git push gitlab main || git push gitlab master

# Step 2: Deploy to server
echo -e "${GREEN}Step 2: Deploying to server...${NC}"
ssh $SERVER_USER@$SERVER_HOST << EOF
  echo "Connected to server..."
  
  # Navigate to project directory
  cd $SERVER_PATH || exit 1
  
  # Pull latest code
  echo "Pulling latest code from GitLab..."
  git pull origin main || git pull origin master
  
  # Install dependencies
  echo "Installing dependencies..."
  npm install --production
  
  # Copy environment variables if exists
  if [ -f .env.production ]; then
    cp .env.production .env
  fi
  
  # Restart application
  echo "Restarting application..."
  
  # Using PM2 (recommended)
  if command -v pm2 &> /dev/null; then
    pm2 restart dreamseed-vapi || pm2 start server.js --name dreamseed-vapi
    pm2 save
  # Using systemd
  elif systemctl is-active --quiet dreamseed-vapi; then
    sudo systemctl restart dreamseed-vapi
  # Using forever
  elif command -v forever &> /dev/null; then
    forever stop server.js
    forever start server.js
  # Fallback to basic node
  else
    pkill -f "node server.js"
    nohup node server.js > /var/log/dreamseed-vapi.log 2>&1 &
  fi
  
  echo "✅ Deployment complete!"
EOF

echo -e "${GREEN}✅ Deployment successful!${NC}"
echo "Visit: https://$SERVER_HOST"