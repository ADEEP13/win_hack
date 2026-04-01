# 🚀 Server Update Guide - USSD Feature Integration

## Overview
This guide will help you update your existing JanDhan Plus server from the old version to the new version with the USSD Dual-Phone Simulator feature.

---

## 📋 Before You Start

### Prerequisites
- Server SSH access
- git installed on server
- Node.js 18+ running
- PostgreSQL 14+ running (if using database)
- Ganache running (or ability to restart)

### Backup Your Data
```bash
# SSH into your server
ssh user@your-server-ip

# Create a backup of current state
cd ~/jandhan-plus
git stash  # Save any uncommitted changes
cp -r . ~/jandhan-plus-backup-$(date +%Y%m%d)
```

---

## ✅ Step 1: Pull Latest Code from GitHub

```bash
# Navigate to project directory
cd ~/jandhan-plus

# Fetch latest changes
git fetch origin main

# Pull latest code
git pull origin main

# Verify you're on main branch
git branch
# Output should show: * main
```

**Expected Output:**
```
remote: Enumerating objects...
remote: Counting objects...
Unpacking objects: 100%, done.
From github.com:ADEEP13/win_hack
   abc1234..def5678  main       -> origin/main
Updating abc1234..def5678
Fast-forward
 package.json                                    |  2 +
 backend/voice-api.js                           | 200 +++
 app/ussd-simulation/page.tsx                   | 450 +++++++++++
 lib/ussd-client.ts                             | 100 ++++
 lib/ussd-hooks.ts                              | 150 ++++
 supabase/migrations/006_create_ussd_requests.sql | 50 ++
 app/layout.tsx                                 |  1 +
 USSD_GUIDE.md                                  | 400 ++++++++++
 README.md                                      |  50 +++
 9 files changed, 1403 insertions(+)
```

---

## ✅ Step 2: Install New Dependencies

```bash
# Install npm dependencies (including socket.io)
npm install

# Verify socket.io was installed
npm list socket.io socket.io-client

# Expected: 
# ├── socket.io@4.7.2
# └── socket.io-client@4.7.2
```

---

## ✅ Step 3: Compile Smart Contracts (if they changed)

```bash
# Compile contracts
npm run contracts:compile

# Expected output:
# Compiling 2 files with 0.8.20
# Compilation finished successfully
```

---

## ✅ Step 4: Create USSD Database Tables

### Option A: Using psql (If you have direct database access)

```bash
# Run the new database migration
psql -U jandhan_user -d jandhan_plus -h localhost -f supabase/migrations/006_create_ussd_requests.sql

# Expected output:
# CREATE TABLE
# CREATE INDEX
# CREATE TABLE
# CREATE INDEX
# ... more CREATE statements
```

### Option B: If you can't access psql, use the create script

```bash
# Create a temporary script
cat > /tmp/run_migration.sh << 'EOF'
#!/bin/bash
PGPASSWORD="your_db_password" psql -U jandhan_user -d jandhan_plus -h localhost -f supabase/migrations/006_create_ussd_requests.sql
EOF

chmod +x /tmp/run_migration.sh
./tmp/run_migration.sh
```

### Verify Database Tables Were Created

```bash
# Connect to database
psql -U jandhan_user -d jandhan_plus -h localhost

# Inside psql, run:
\dt
# Should show: ussd_requests, ussd_sessions, ussd_audit_log

# Exit psql
\q
```

---

## ✅ Step 5: Build for Production

```bash
# Clear old build
rm -rf .next

# Build Next.js application
npm run build

# Expected output:
# ● ▲ Next.js 15.0.0
# ✓ Compiled successfully
# ✓ Linting and checking validity of types
```

---

## ✅ Step 6: Stop Old Services

```bash
# Stop all running PM2 services
pm2 stop all

# List all processes
pm2 list

# If you want to remove old processes
pm2 delete all

# Verify all stopped
pm2 list  # Should show no processes or all stopped
```

---

## ✅ Step 7: Update PM2 Configuration (if needed)

```bash
# Check current pm2-ecosystem.config.js
cat server-setup/pm2-ecosystem.config.js

# If it exists and is configured, you can continue
# If not, update with new voice-api.js that includes Socket.IO
```

---

## ✅ Step 8: Restart All Services

### Option A: Using PM2 Ecosystem File (Recommended)

```bash
# Start all services with PM2
pm2 start server-setup/pm2-ecosystem.config.js

# Expected output:
# [PM2] Starting app.js in cluster mode...
# [PM2] Starting voice-api.js...
# [PM2] Starting ai-service.py...
```

### Option B: Manual Service Start (If PM2 not configured)

**Terminal 1: Start Ganache Blockchain**
```bash
ganache --database.dbPath ~/jandhan-plus/blockchain-data --server.port 8545 --server.host 0.0.0.0
# Expected: Ganache started on 0.0.0.0:8545
```

**Terminal 2: Start Voice/USSD API**
```bash
cd ~/jandhan-plus
node backend/voice-api.js
# Expected: 
# ✅ Voice/USSD API running on port 4000
# 📱 WebSocket server enabled for real-time USSD
# 🔗 Connect WebSocket to ws://localhost:4000
```

**Terminal 3: Start AI Service** (Optional)
```bash
cd ~/jandhan-plus
python3 backend/ai-service.py
# Expected: Flask server running
```

**Terminal 4: Start Next.js Application**
```bash
cd ~/jandhan-plus
npm start
# Expected: started server on 0.0.0.0:3000
```

---

## ✅ Step 9: Verify Services Status

```bash
# Check PM2 status
pm2 status

# Expected output:
# ┌─────────────────────────────────┬────┬──────┬──────┬────────┐
# │ App name       │ id │ mode │ pid  │ status   │
# ├─────────────────────────────────┼────┼──────┼──────┼────────┤
# │ ganache        │ 0  │ fork │ 1234 │ online   │
# │ jandhan-next   │ 1  │ fork │ 5678 │ online   │
# │ jandhan-voice  │ 2  │ fork │ 9012 │ online   │
# │ jandhan-ai     │ 3  │ fork │ 3456 │ online   │
# └─────────────────────────────────┴────┴──────┴──────┴────────┘
```

---

## ✅ Step 10: Test Each Service

### 1. Test Ganache (Blockchain)
```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

# Expected:
# {"jsonrpc":"2.0","result":"0x0","id":1}
```

### 2. Test Voice/USSD API
```bash
curl http://localhost:4000/health

# Expected:
# {
#   "success": true,
#   "service": "JanDhan Plus Voice/USSD API",
#   "status": "running",
#   "port": 4000,
#   "socketIO": "enabled"
# }
```

### 3. Test Market Prices Endpoint
```bash
curl http://localhost:4000/market/prices

# Expected:
# {
#   "success": true,
#   "prices": {
#     "rice": 1820,
#     "wheat": 2050,
#     "tomato": 35,
#     "onion": 28
#   }
# }
```

### 4. Test Next.js Frontend
```bash
curl http://localhost:3000

# Expected: HTML response with landing page
```

### 5. Test USSD Endpoint
```bash
curl -X POST http://localhost:4000/ussd/send \
  -H "Content-Type: application/json" \
  -d '{
    "from": "9876543210",
    "to": "9988776655",
    "amount": 5000,
    "pin": "1234"
  }'

# Expected:
# {
#   "success": true,
#   "requestId": "uuid...",
#   "message": "Request sent successfully"
# }
```

---

## ✅ Step 11: Configure Nginx (if needed)

```bash
# Copy new Nginx configuration
sudo cp ~/jandhan-plus/server-setup/nginx.conf /etc/nginx/sites-available/jandhan-plus

# Enable the site (if not already enabled)
sudo ln -sf /etc/nginx/sites-available/jandhan-plus /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t
# Expected: nginx: configuration file test is successful

# Reload Nginx
sudo systemctl reload nginx
```

---

## ✅ Step 12: Verify Application URLs

```bash
# Test from your local machine
# Replace your-server-ip with actual server IP

# Landing Page
curl http://your-server-ip/

# Farmer Portal
curl http://your-server-ip/farmer

# Buyer Marketplace
curl http://your-server-ip/buyer

# Consumer QR Trace
curl http://your-server-ip/consumer

# Admin Dashboard
curl http://your-server-ip/admin

# NEW: USSD Simulator
curl http://your-server-ip/ussd-simulation

# All should return 200 OK with HTML content
```

---

## 🔍 Troubleshooting Common Issues

### Issue 1: Socket.IO Connection Error

**Error:** 
```
WebSocket is closed before the connection is established
```

**Solution:**
```bash
# Check if voice-api.js is running
pm2 status

# If not running, start it:
pm2 start backend/voice-api.js --name jandhan-voice

# Check logs:
pm2 logs jandhan-voice
```

### Issue 2: Port Already in Use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::4000
```

**Solution:**
```bash
# Find process using port 4000
lsof -i :4000

# Kill the process
kill -9 <PID>

# Or restart PM2
pm2 restart all
```

### Issue 3: Database Migration Failed

**Error:**
```
ERROR: relation "ussd_requests" already exists
```

**Solution:**
```bash
# This means the tables already exist, which is fine
# The migration ran successfully before

# Verify tables exist:
psql -U jandhan_user -d jandhan_plus -h localhost -c "\dt"
```

### Issue 4: Npm Install Failed

**Error:**
```
Could not resolve dependency: npm ERR! peer socket.io
```

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Install with legacy peer deps flag
npm install --legacy-peer-deps
```

### Issue 5: Next.js Build Failed

**Error:**
```
ESLint found some issues
```

**Solution:**
```bash
# Run linter to see issues
npm run lint

# Fix common issues
npm run lint -- --fix

# Or build without linting
npm run build
```

---

## 📊 Quick Status Check Command

```bash
# Create a script to check all services
cat > ~/check-services.sh << 'EOF'
#!/bin/bash
echo "====== JanDhan Plus Service Status ======"
echo ""
echo "## PM2 Processes:"
pm2 status
echo ""
echo "## Port 8545 (Ganache):"
curl -s http://localhost:8545 >/dev/null && echo "✅ Running" || echo "❌ Not responding"
echo ""
echo "## Port 4000 (Voice/USSD API):"
curl -s http://localhost:4000/health | grep -q "running" && echo "✅ Running" || echo "❌ Not responding"
echo ""
echo "## Port 3000 (Next.js):"
curl -s http://localhost:3000 >/dev/null && echo "✅ Running" || echo "❌ Not responding"
echo ""
echo "## Database:"
psql -U jandhan_user -d jandhan_plus -h localhost -c "SELECT COUNT(*) FROM ussd_requests;" 2>/dev/null && echo "✅ Connected" || echo "❌ Connection failed"
echo ""
echo "====== End Status Check ======"
EOF

chmod +x ~/check-services.sh
~/check-services.sh
```

---

## 🎯 Post-Update Checklist

- [ ] Code updated via `git pull`
- [ ] Dependencies installed via `npm install`
- [ ] Database migrations applied
- [ ] Application built successfully
- [ ] All services started (Ganache, Voice API, Next.js)
- [ ] Ganache endpoint responding (`/health`)
- [ ] Voice API responding (`/market/prices`)
- [ ] Next.js frontend accessible
- [ ] Nginx configured and reloaded
- [ ] Firewall rules still allow traffic (80, 443, 8545, 4000)
- [ ] PM2 configured for auto-restart on reboot

---

## 🔄 Rollback Plan (if needed)

```bash
# If something goes wrong, rollback to previous version
cd ~/jandhan-plus

# Stop current services
pm2 stop all

# Restore from backup
cp -r ~/jandhan-plus-backup-YYYYMMDD/* ~/jandhan-plus/

# Reinstall old dependencies
npm install

# Start services
pm2 start server-setup/pm2-ecosystem.config.js

# Verify status
pm2 status
```

---

## 📞 Quick Help Reference

| Command | Purpose |
|---------|---------|
| `git pull origin main` | Update code |
| `npm install` | Install dependencies |
| `npm run build` | Build for production |
| `pm2 start ...` | Start services |
| `pm2 stop all` | Stop all services |
| `pm2 logs` | View logs |
| `pm2 save` | Save PM2 state |
| `psql -c "\dt"` | List database tables |
| `curl localhost:4000/health` | Test Voice API |

---

## ✨ New Features After Update

After successful update, you'll have access to:

1. **USSD Dual-Phone Simulator** (`/ussd-simulation`)
   - Real-time P2P transactions
   - Dual virtual phones
   - WebSocket integration

2. **Enhanced Voice API** 
   - Socket.IO real-time events
   - New USSD endpoints
   - Better transaction handling

3. **New Database Tables**
   - `ussd_requests`
   - `ussd_sessions`
   - `ussd_audit_log`

---

## 📧 Need Help?

If you encounter issues:
1. Check the logs: `pm2 logs`
2. Review USSD_GUIDE.md in the project
3. Check README.md for setup details
4. Verify all ports are accessible

---

**Last Updated**: April 1, 2026
**Version**: 1.0.0
