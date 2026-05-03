#!/bin/bash

# Team Task Manager - Local Startup Script
# This script starts both the backend and frontend servers

echo "🚀 Team Task Manager - Local Startup"
echo "======================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✓ Node.js is installed: $(node --version)"
echo ""

# Backend Setup
echo "📦 Setting up Backend..."
cd backend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "  Installing dependencies..."
    npm install
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "  ⚠️  .env file not found!"
    echo "  Creating .env from .env.example..."
    cp .env.example .env
    echo "  ⚠️  Please update .env with your DATABASE_URL before running!"
    exit 1
fi

echo "✓ Backend ready"
echo ""

# Frontend Setup
echo "📦 Setting up Frontend..."
cd ../frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "  Installing dependencies..."
    npm install
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "  Creating .env.local from .env.local.example..."
    cp .env.local.example .env.local
fi

echo "✓ Frontend ready"
echo ""

# Return to root
cd ..

# Display instructions
echo "======================================"
echo "✅ Setup Complete!"
echo "======================================"
echo ""
echo "To start the servers, open two terminal windows:"
echo ""
echo "Terminal 1 (Backend):"
echo "  cd backend"
echo "  npm run dev"
echo "  → Backend will run on http://localhost:5000"
echo ""
echo "Terminal 2 (Frontend):"
echo "  cd frontend"
echo "  npm run dev"
echo "  → Frontend will run on http://localhost:3000"
echo ""
echo "Then open http://localhost:3000 in your browser!"
echo ""
echo "📚 Documentation:"
echo "  - Quick Setup: See SETUP.md"
echo "  - Full Documentation: See README.md"
echo "  - Deployment: See DEPLOYMENT.md"
echo ""
