#!/bin/bash

# Rovo Code Flow Test Example Setup Script

echo "🚀 Setting up Rovo Code Flow Test Example..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build rovo-code-flow if needed
echo "🔨 Building rovo-code-flow..."
cd ../rovo-code-flow
if [ ! -d "dist" ]; then
    echo "Building rovo-code-flow for the first time..."
    npm install
    npm run build
else
    echo "rovo-code-flow already built"
fi
cd ../test-example

# Create necessary directories
echo "📁 Creating test directories..."
mkdir -p results
mkdir -p test-workspace

# Make test runner executable
chmod +x test-runner.js

echo "✅ Setup complete!"
echo ""
echo "🎯 Available commands:"
echo "  npm test                 # Run all tests"
echo "  npm run test:core        # Run core command tests"
echo "  npm run test:agent       # Run agent command tests"
echo "  npm run test:system      # Run system command tests"
echo "  npm run test:tools       # Run tool command tests"
echo "  npm run test:utility     # Run utility command tests"
echo "  npm run test:workflow    # Run workflow command tests"
echo "  npm run test:verbose     # Run with verbose output"
echo "  npm run test:dry-run     # Show commands without executing"
echo "  npm run test:parallel    # Run tests in parallel"
echo "  npm run test:retry       # Run with automatic retries"
echo "  node test-runner.js categories  # List available test categories"
echo ""
echo "🚀 Ready to test! Run 'npm test' to start."