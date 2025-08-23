#!/bin/bash

# Demo Domain Checker - Shows mock results to demonstrate functionality
# This simulates the smart TLD suggestions feature

echo "🌐 DEMO: Smart Domain Checker with TLD Suggestions"
echo "=================================================="
echo ""

# Simulate checking google.com (taken)
echo "Checking: google.com"
echo '{"domain":"google.com","available":false,"method":"godaddy","suggestions":[{"domain":"google.net","available":true,"price":1299000,"currency":"USD"},{"domain":"google.org","available":true,"price":1599000,"currency":"USD"},{"domain":"google.io","available":true,"price":4999000,"currency":"USD"},{"domain":"google.co","available":true,"price":2999000,"currency":"USD"},{"domain":"google.app","available":true,"price":1999000,"currency":"USD"}]}'
echo ""

# Simulate checking a unique domain (available) 
echo "Checking: my-awesome-startup-2024.com"
echo '{"domain":"my-awesome-startup-2024.com","available":true,"method":"godaddy","price":1299000,"currency":"USD"}'
echo ""

# Simulate checking example.com (taken)
echo "Checking: example.com"
echo '{"domain":"example.com","available":false,"method":"godaddy","suggestions":[{"domain":"example.net","available":true,"price":1299000,"currency":"USD"},{"domain":"example.org","available":true,"price":1599000,"currency":"USD"},{"domain":"example.co","available":true,"price":2999000,"currency":"USD"}]}'