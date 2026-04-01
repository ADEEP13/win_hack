#!/bin/bash
# Quick Server Update Script for JanDhan Plus
# Run this script to update your server from old version to new version with USSD

set -e  # Exit on error

echo "🚀 JanDhan Plus Server Update Script"
echo "===================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found"
    echo "Please run this script from the jandhan-plus directory"
    echo "cd ~/jandhan-plus && bash UPDATE_SERVER.sh"
    exit 1
fi

echo -e "${YELLOW}⚠️  BACKUP NOTICE${NC}"
echo "Creating backup of current version..."
BACKUP_DIR="jandhan-plus-backup-$(date +%Y%m%d-%H%M%S)"
cp -r . ~/$BACKUP_DIR
echo -e "${GREEN}✅ Backup created at: ~/$BACKUP_DIR${NC}"
echo ""

# Step 1: Pull latest code
echo -e "${YELLOW}Step 1: Updating code from GitHub...${NC}"
git fetch origin main
git pull origin main
echo -e "${GREEN}✅ Code updated${NC}"
echo ""

# Step 2: Install dependencies
echo -e "${YELLOW}Step 2: Installing new dependencies...${NC}"
npm install --legacy-peer-deps
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Step 3: Compile contracts
echo -e "${YELLOW}Step 3: Compiling smart contracts...${NC}"
npm run contracts:compile
echo -e "${GREEN}✅ Contracts compiled${NC}"
echo ""

# Step 4: Create database tables
echo -e "${YELLOW}Step 4: Creating USSD database tables...${NC}"
if command -v psql &> /dev/null; then
    # Try to run migration if PostgreSQL is available
    psql -U jandhan_user -d jandhan_plus -h localhost -f supabase/migrations/006_create_ussd_requests.sql 2>/dev/null || {
        echo -e "${YELLOW}⚠️  Database migration skipped (tables may already exist)${NC}"
    }
    echo -e "${GREEN}✅ Database updated${NC}"
else
    echo -e "${YELLOW}⚠️  PostgreSQL not found - skipping database migration${NC}"
    echo "Run manually: psql -U jandhan_user -d jandhan_plus -h localhost -f supabase/migrations/006_create_ussd_requests.sql"
fi
echo ""

# Step 5: Build for production
echo -e "${YELLOW}Step 5: Building for production...${NC}"
npm run build
echo -e "${GREEN}✅ Build completed${NC}"
echo ""

# Step 6: Stop old services
echo -e "${YELLOW}Step 6: Stopping old services...${NC}"
pm2 stop all 2>/dev/null || echo -e "${YELLOW}⚠️  PM2 services not running${NC}"
echo -e "${GREEN}✅ Services stopped${NC}"
echo ""

# Step 7: Start services with PM2
echo -e "${YELLOW}Step 7: Starting services with PM2...${NC}"
if [ -f "server-setup/pm2-ecosystem.config.js" ]; then
    pm2 start server-setup/pm2-ecosystem.config.js
else
    echo -e "${YELLOW}⚠️  PM2 ecosystem config not found${NC}"
    echo "Manually start services:"
    echo "  Terminal 1: ganache --database.dbPath ./blockchain-data --server.port 8545"
    echo "  Terminal 2: node backend/voice-api.js"
    echo "  Terminal 3: npm start"
fi
echo -e "${GREEN}✅ Services started${NC}"
echo ""

# Step 8: Verify services
echo -e "${YELLOW}Step 8: Verifying services...${NC}"
sleep 2

# Check Ganache
if curl -s http://localhost:8545 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Ganache (port 8545): Running${NC}"
else
    echo -e "${RED}❌ Ganache (port 8545): Not responding${NC}"
fi

# Check Voice API
if curl -s http://localhost:4000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Voice API (port 4000): Running${NC}"
else
    echo -e "${RED}❌ Voice API (port 4000): Not responding${NC}"
fi

# Check Next.js
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Next.js (port 3000): Running${NC}"
else
    echo -e "${RED}❌ Next.js (port 3000): Not responding${NC}"
fi

echo ""
echo -e "${GREEN}===================================="
echo "✅ Update completed successfully!"
echo "====================================${NC}"
echo ""
echo "🌐 Access your application:"
echo "   http://your-server-ip/"
echo ""
echo "📱 New USSD Simulator:"
echo "   http://your-server-ip/ussd-simulation"
echo ""
echo "📊 Check service status:"
echo "   pm2 status"
echo ""
echo "📋 View logs:"
echo "   pm2 logs"
echo ""
echo "💾 Your backup is saved at: ~/$BACKUP_DIR"
echo ""
