# ⚡ QUICK UPDATE COMMANDS - Copy & Paste

## 🟢 Fastest Way to Update (5 minutes)

### SSH into your server:
```bash
ssh user@your-server-ip
cd ~/jandhan-plus
```

### Run the automated update script:
```bash
bash UPDATE_SERVER.sh
```

**That's it!** The script will:
- ✅ Back up your current version
- ✅ Pull latest code
- ✅ Install dependencies
- ✅ Compile contracts
- ✅ Create database tables
- ✅ Build for production
- ✅ Restart all services
- ✅ Verify everything is working

---

## 🟡 Step-by-Step Manual Update (if script fails)

```bash
# 1. Navigate to project
cd ~/jandhan-plus

# 2. Backup current version
cp -r . ~/jandhan-plus-backup-$(date +%Y%m%d)

# 3. Update code
git pull origin main

# 4. Install dependencies
npm install --legacy-peer-deps

# 5. Compile contracts
npm run contracts:compile

# 6. Create database tables (if PostgreSQL is running)
psql -U jandhan_user -d jandhan_plus -h localhost -f supabase/migrations/006_create_ussd_requests.sql

# 7. Clear old build and rebuild
rm -rf .next
npm run build

# 8. Stop old services
pm2 stop all

# 9. Delete old PM2 apps (optional, but recommended)
pm2 delete all

# 10. Start all services
pm2 start server-setup/pm2-ecosystem.config.js

# 11. Save PM2 state
pm2 save
pm2 startup
```

---

## 🔵 Verify Update was Successful

```bash
# Check PM2 status
pm2 status

# Check each service
curl http://localhost:4000/health          # Voice API
curl http://localhost:8545 -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'  # Ganache
curl http://localhost:3000                 # Next.js frontend

# Test USSD endpoint
curl -X POST http://localhost:4000/ussd/send \
  -H "Content-Type: application/json" \
  -d '{"from":"9876543210","to":"9988776655","amount":5000,"pin":"1234"}'
```

---

## 🔴 If Something Goes Wrong - Rollback

```bash
# Stop services
pm2 stop all

# Restore backup
rm -rf ~/jandhan-plus/*
cp -r ~/jandhan-plus-backup-YYYYMMDD/* ~/jandhan-plus/

# Reinstall and start
cd ~/jandhan-plus
npm install --legacy-peer-deps
pm2 start server-setup/pm2-ecosystem.config.js
```

---

## 📱 Test the New USSD Feature

Once update is complete:
1. Open browser: `http://your-server-ip/ussd-simulation`
2. Phone 1 (left): Press `1` → Send Money flow
3. Phone 2 (right): Receives notification automatically
4. See real-time sync in action!

---

## 🆘 Common Issues & Fixes

### Issue: "npm install ERR! " 
```bash
npm cache clean --force
npm install --legacy-peer-deps
```

### Issue: "Port 4000 already in use"
```bash
pm2 stop all
pm2 delete all
pm2 start server-setup/pm2-ecosystem.config.js
```

### Issue: "Database tables already exist"
```bash
# This is normal - just means migration ran before
# No action needed, continue with update
```

### Issue: "Connection refused on localhost:4000"
```bash
# Wait 5 seconds for services to fully start
sleep 5

# Check if running
pm2 status

# Check logs
pm2 logs   # Press Ctrl+C to exit
```

---

## 📊 Monitor Running Services

```bash
# Real-time logs
pm2 logs

# Check status
pm2 status

# Memory & CPU usage
pm2 monit

# Restart all if needed
pm2 restart all

# Stop all
pm2 stop all
```

---

## 🎯 What Changed in This Update

### New Files Created:
- `/app/ussd-simulation/page.tsx` - USSD dual-phone UI
- `/lib/ussd-client.ts` - USSD API client
- `/lib/ussd-hooks.ts` - React hooks for WebSocket
- `/supabase/migrations/006_create_ussd_requests.sql` - Database tables
- `USSD_GUIDE.md` - Full documentation
- `UPDATE_SERVER.md` - Detailed update guide (this file's parent)

### Modified Files:
- `package.json` - Added socket.io, socket.io-client
- `backend/voice-api.js` - Enhanced with WebSocket and USSD endpoints
- `app/layout.tsx` - Added USSD simulator link to navbar
- `README.md` - Updated with USSD feature info

### New Database Tables:
- `ussd_requests` - Track USSD transactions
- `ussd_sessions` - Active USSD sessions
- `ussd_audit_log` - Audit trail

---

## 📞 Need More Help?

1. **For detailed setup guidance**: Read `UPDATE_SERVER.md`
2. **For USSD feature docs**: Read `USSD_GUIDE.md`
3. **For general project info**: Read `README.md`
4. **For troubleshooting**: Check scripts/logs: `pm2 logs`

---

**Estimated Update Time**: 5-10 minutes
**Downtime**: 2-3 minutes during service restart
**Rollback Time**: 2-5 minutes (if needed)

🚀 **Let's update!**
