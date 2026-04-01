# JanDhan Plus - Quick Start Guide

## 🚀 Windows Development (5 minutes)

### Terminal 1: Start Ganache
```bash
npm install -g ganache
ganache --database.dbPath ./blockchain-data --server.port 8545
```

### Terminal 2: Compile & Deploy Contracts
```bash
npm run contracts:compile
npm run contracts:deploy
```

**Copy contract addresses and update `.env.local`:**
```
NEXT_PUBLIC_CROP_MARKETPLACE_ADDRESS=0x...
NEXT_PUBLIC_PRICE_ORACLE_ADDRESS=0x...
```

### Terminal 3: Start Backend Services
```bash
# Voice/USSD API
node backend/voice-api.js

# In another terminal:
python backend/ai-service.py
```

### Terminal 4: Start Next.js Dev Server
```bash
npm run dev
```

Visit: http://localhost:3000

---

## 🐧 Ubuntu Server Deployment (15 minutes)

### Step 1: SSH into Server
```bash
ssh user@your-server-ip
```

### Step 2: Run Setup Script
```bash
curl -fsSL https://raw.githubusercontent.com/your-team/jandhan-plus/main/server-setup/setup.sh | bash
```

Or manually:
```bash
bash server-setup/setup.sh
```

### Step 3: Clone & Setup Project
```bash
cd ~/jandhan-plus
git clone https://github.com/your-team/jandhan-plus.git .
npm install --legacy-peer-deps
```

### Step 4: Configure Environment
```bash
cp .env.local.example .env.local
# Edit .env.local with your PostgreSQL password and contract addresses
```

### Step 5: Run Database Migrations
```bash
psql -U jandhan_user -d jandhan_plus -h localhost < supabase/migrations/001_create_users.sql
psql -U jandhan_user -d jandhan_plus -h localhost < supabase/migrations/002_create_crops.sql
psql -U jandhan_user -d jandhan_plus -h localhost < supabase/migrations/003_create_offers.sql
psql -U jandhan_user -d jandhan_plus -h localhost < supabase/migrations/004_create_payments.sql
psql -U jandhan_user -d jandhan_plus -h localhost < supabase/migrations/005_create_transactions.sql
```

### Step 6: Deploy Smart Contracts
```bash
npm run contracts:deploy
# Update .env.local with new addresses
```

### Step 7: Build & Start with PM2
```bash
npm run build

pm2 start npm --name "jandhan-next" -- start
pm2 start backend/voice-api.js --name "jandhan-voice"
pm2 start backend/ai-service.py --name "jandhan-ai" --interpreter python3

# Start Ganache as service
pm2 start "ganache --database.dbPath ~/jandhan-blockchain --server.port 8545 --server.host 0.0.0.0" --name "ganache"

pm2 save
pm2 startup
```

### Step 8: Setup Nginx
```bash
sudo cp server-setup/nginx.conf /etc/nginx/sites-available/jandhan-plus
sudo ln -s /etc/nginx/sites-available/jandhan-plus /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

### Step 9: Open Firewall
```bash
sudo ufw enable
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

### Step 10: Access from Any Device
```
http://your-server-ip/
```

---

## 📱 Demo Roles

- **Farmer**: http://your-server-ip/farmer
- **Buyer**: http://your-server-ip/buyer
- **Consumer**: http://your-server-ip/consumer
- **Admin**: http://your-server-ip/admin
- **USSD**: http://your-server-ip/ussd

---

## ✅ Verification

### Windows
```bash
# Check Ganache
curl http://127.0.0.1:8545

# Check Next.js
curl http://localhost:3000

# Check Voice API
curl http://localhost:4000/market/prices

# Check AI Service
curl http://localhost:5000/
```

### Ubuntu Server
```bash
# Check services
pm2 list

# View logs
pm2 logs

# Check database
psql -U jandhan_user -d jandhan_plus -h localhost -c "\dt"

# Check Nginx
sudo systemctl status nginx
```

---

## 🐛 Troubleshooting

**Port already in use?**
```bash
# Find what's using port 3000
lsof -i :3000
# Kill it
kill -9 <PID>
```

**Contract deployment fails?**
- Make sure Ganache is running
- Check GANACHE_RPC_URL in .env.local

**Database connection fails?**
- Verify PostgreSQL is running: `sudo systemctl status postgresql`
- Check password in .env.local matches setup

**Nginx not routing?**
- Check config: `sudo nginx -t`
- View errors: `sudo tail -f /var/log/nginx/error.log`

---

## 📊 Performance Tips

- Enable Redis caching
- Use PM2 clustering: `pm2 start npm --name "jandhan-next" -i max -- start`
- Monitor with: `pm2 monit`
