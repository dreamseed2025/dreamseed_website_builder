#!/bin/bash

# DreamSeed Server Startup Script
# Automatically kills any existing processes on port 3002 and starts the server

echo "🚀 DreamSeed Server Startup Script"
echo "=================================="

# Kill any existing processes on port 3002
echo "🔍 Checking for existing processes on port 3002..."
if lsof -ti:3002 >/dev/null 2>&1; then
    echo "🔄 Killing existing processes on port 3002..."
    lsof -ti:3002 | xargs kill -9 2>/dev/null || true
    echo "✅ Existing processes terminated"
    sleep 1
else
    echo "✅ Port 3002 is available"
fi

# Start the server
echo "🚀 Starting DreamSeed Requirements Framework Server..."
npm start