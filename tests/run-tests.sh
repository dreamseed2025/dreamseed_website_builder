#!/bin/bash

echo "🧪 DreamSeed Test Suite Runner"
echo "=============================="

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required to run tests"
    exit 1
fi

# Check if puppeteer is available
if ! npm list puppeteer &> /dev/null; then
    echo "📦 Installing puppeteer for browser automation..."
    npm install puppeteer
fi

# Set test environment
export NODE_ENV=test
export TEST_URL=${TEST_URL:-"https://dreamseed-website-builder-2gc3e51zz-morgans-projects-fe2cd439.vercel.app"}

echo "🌐 Testing against: $TEST_URL"
echo ""

# Run the automated test suite
node ./tests/automated-test-runner.js

# Capture exit code
TEST_EXIT_CODE=$?

echo ""
echo "🏁 Tests completed!"

if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo "🎉 All tests passed!"
else
    echo "💥 Some tests failed. Check test-results.json for details."
fi

exit $TEST_EXIT_CODE