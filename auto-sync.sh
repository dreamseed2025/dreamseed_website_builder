#!/bin/bash

# Auto-sync script for DreamSeed
# This script watches for changes and automatically commits and pushes them

echo "Starting auto-sync for DreamSeed..."
echo "Press Ctrl+C to stop"

while true; do
    # Check if there are changes
    if [[ -n $(git status -s) ]]; then
        echo "Changes detected, syncing..."
        git add .
        git commit -m "Auto-sync: $(date '+%Y-%m-%d %H:%M:%S')"
        git push origin main
        echo "Sync complete!"
    fi
    
    # Wait 5 minutes before checking again
    sleep 300
done