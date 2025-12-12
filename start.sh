#!/bin/bash

echo "Starting Frontend Development Server..."
echo ""
echo "Make sure you have:"
echo "1. Node.js 16+ installed"
echo "2. Installed dependencies: npm install"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "⚠️  Installing dependencies..."
    npm install
    echo ""
fi

# Start the dev server
npm run dev

