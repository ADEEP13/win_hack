#!/bin/bash

# JanDhan Plus - Quick Start Script
# This script gets your development environment ready

echo "🌾 JanDhan Plus - Quick Start Setup"
echo "====================================="
echo ""

# Check Node.js
echo "✅ Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi
echo "   Node version: $(node --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi
echo "   ✅ Dependencies installed"
echo ""

# Copy environment file
if [ ! -f .env.local ]; then
    echo "⚙️  Setting up environment..."
    cp .env.local.example .env.local
    echo "   ✅ .env.local created (update with your config)"
else
    echo "⚙️  .env.local already exists"
fi
echo ""

echo "🚀 Ready to start!"
echo "====================================="
echo ""
echo "Run the following commands:"
echo ""
echo "  npm run dev        → Start development server (http://localhost:3000)"
echo "  npm run build      → Build for production"
echo "  npm start          → Run production build"
echo ""
echo "Navigate to:"
echo "  👨‍🌾 Farmer:   http://localhost:3000/farmer"
echo "  🏪 Buyer:    http://localhost:3000/buyer"
echo "  👤 Consumer: http://localhost:3000/consumer"
echo "  📊 Admin:    http://localhost:3000/admin"
echo ""
echo "Happy building! 🚀🌾"
