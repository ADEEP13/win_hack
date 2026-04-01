# JanDhan Plus - Ubuntu Server Deployment Guide

## Quick Start (SSH into your Ubuntu server)

### 1. Run Automated Setup (2-3 minutes)

```bash
# Download setup script
curl -O https://your-repo-url/server-setup/setup.sh
chmod +x setup.sh

# Run with sudo
sudo ./setup.sh
```

This installs:
- Node.js 18, npm, PM2
- PostgreSQL 14
- Redis 7
- Python 3.10 + AI libraries
- Ganache CLI
- Nginx
- Firewall configuration

---

## Manual Setup (if automatic fails)

### Step 1: Update System
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git vim build-essential ufw
```

### Step 2: Install Node.js 18
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
npm install -g pm2 ganache
```

### Step 3: Install PostgreSQL
```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql

# Create database
sudo -u postgres psql <<EOF
CREATE DATABASE jandhan_plus;
CREATE USER jandhan_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE jandhan_plus TO jandhan_user;
EOF

# Test
psql -U jandhan_user -d jandhan_plus -h localhost
```

### Step 4: Install Redis
```bash
sudo apt install -y redis-server
sudo systemctl start redis-server
redis-cli ping  # Should return PONG
```

### Step 5: Install Python
```bash
sudo apt install -y python3-pip
pip3 install flask google-cloud-vision google-cloud-texttospeech
```

### Step 6: Setup Project
```bash
mkdir -p /var/www/jandhan-plus
cd /var/www/jandhan-plus

# Copy your project files here
# Then run:
npm install
npx hardhat compile
```

### Step 7: Deploy Smart Contracts
```bash
# Start Ganache in background
ganache --database.dbPath ~/jandhan-blockchain &

# Deploy contracts
npx hardhat run scripts/deploy.ts --network ganache

# Copy the contract addresses to .env.local
```

### Step 8: Configure Nginx
```bash
# Copy nginx config
sudo cp server-setup/nginx.conf /etc/nginx/sites-available/jandhan-plus
sudo ln -s /etc/nginx/sites-available/jandhan-plus /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

### Step 9: Start Services with PM2
```bash
# Build Next.js
npm run build

# Start all services
pm2 start server-setup/pm2-ecosystem.config.js

# Save and enable on boot
pm2 save
pm2 startup
# Run the output command with sudo
```

### Step 10: Create Database Schema
```bash
# Run migrations
psql -U jandhan_user -d jandhan_plus -h localhost < supabase/migrations/001_create_users.sql
psql -U jandhan_user -d jandhan_plus -h localhost < supabase/migrations/002_create_crops.sql
psql -U jandhan_user -d jandhan_plus -h localhost < supabase/migrations/003_create_offers.sql
psql -U jandhan_user -d jandhan_plus -h localhost < supabase/migrations/004_create_payments.sql
psql -U jandhan_user -d jandhan_plus -h localhost < supabase/migrations/005_create_transactions.sql
```

---

## Verification Checklist

```bash
# Check all services running
pm2 status

# Check processes
pm2 logs jandhan-next --lines 10
pm2 logs jandhan-voice --lines 10
pm2 logs jandhan-ai --lines 10

# Test endpoints
curl http://localhost/              # Frontend
curl http://localhost/api/crops/list  # API
curl http://localhost/voice/api/market-prices  # Voice API
curl http://localhost/ai/health     # AI Service

# Check database
psql -U jandhan_user -d jandhan_plus -c "SELECT COUNT(*) FROM users;"

# Check Redis
redis-cli ping

# Check Ganache
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

---

## Accessing from Laptops/Phones

Find server IP:
```bash
hostname -I
```

Then access from any device on the network:
- **Frontend**: `http://SERVER_IP/`
- **Farmer portal**: `http://SERVER_IP/farmer`
- **Buyer portal**: `http://SERVER_IP/buyer`
- **Consumer app**: `http://SERVER_IP/consumer`
- **Admin dashboard**: `http://SERVER_IP/admin`
- **USSD Simulator**: `http://SERVER_IP/ussd`
- **Blockchain explorer**: `http://SERVER_IP/blockchain`

---

## Environment Configuration

Create `.env.local` on server:
```bash
# Blockchain
NEXT_PUBLIC_GANACHE_RPC_URL=http://127.0.0.1:8545
GANACHE_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb476c6b8d6c1f02960247590f589
NEXT_PUBLIC_CROP_MARKETPLACE_ADDRESS=0x...  # From deployment
NEXT_PUBLIC_PRICE_ORACLE_ADDRESS=0x...      # From deployment

# Database
DATABASE_URL=postgresql://jandhan_user:your_password@localhost:5432/jandhan_plus
REDIS_URL=redis://localhost:6379

# Server
NEXT_PUBLIC_SERVER_IP=YOUR_SERVER_IP
SERVER_PORT=3001
NODE_ENV=production

# File storage
UPLOAD_DIR=/var/www/jandhan-plus/uploads
```

---

## Troubleshooting

### Port already in use
```bash
# Find what's using the port
sudo lsof -i :8545
# Kill it
sudo kill -9 PID
```

### PostgreSQL connection failed
```bash
# Check if running
sudo systemctl status postgresql

# Check logs
sudo tail -f /var/log/postgresql/postgresql-14-main.log

# Restart
sudo systemctl restart postgresql
```

### Ganache not responding
```bash
# Start manually
ganache --database.dbPath ~/jandhan-blockchain --server.host 0.0.0.0

# Or check status
sudo systemctl status ganache
sudo journalctl -u ganache -f
```

### Nginx not proxying
```bash
# Test config
sudo nginx -t

# View error logs
sudo tail -f /var/log/nginx/error.log

# Reload
sudo systemctl reload nginx
```

---

## Production Hardening

1. **Enable HTTPS**:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

2. **Firewall: Restrict to local network only**:
```bash
# Remove public access
sudo ufw delete allow 8545/tcp
sudo ufw delete allow 5432/tcp
sudo ufw delete allow 6379/tcp

# Allow only from local network
sudo ufw allow from 192.168.1.0/24 to any port 8545
```

3. **Database security**:
```bash
# Create pg_hba.conf entry (localhost only)
sudo nano /etc/postgresql/14/main/pg_hba.conf
# Ensure: local   all             all                                     md5
```

4. **PM2 monitoring**:
```bash
pm2 monit
pm2 web  # Web dashboard on port 9615
```

---

## Rolling Deployment

```bash
# Pull latest code
cd /var/www/jandhan-plus
git pull

# Install dependencies
npm install

# Compile contracts if changed
npx hardhat compile

# Build frontend
npm run build

# Reload services
pm2 reload ecosystem.config.js --env production

# Check status
pm2 status
```

---

## Demo Day Checklist

- [ ] All services running (`pm2 status` shows green)
- [ ] Database seeded with sample users/crops
- [ ] Smart contracts deployed (check `.env.local`)
- [ ] Nginx routing working (test all endpoints)
- [ ] Ganache blockchain running (check `/api/blockchain/status`)
- [ ] Voice API responding (check `/voice/api/market-prices`)
- [ ] AI service healthy (check `/ai/health`)
- [ ] File uploads working
- [ ] QR code generation working
- [ ] Test transaction flow end-to-end
- [ ] Backup demo video recorded

---

## Support

View logs:
```bash
pm2 logs
pm2 logs jandhan-next --lines 50
pm2 logs jandhan-voice --lines 50
pm2 logs jandhan-ai --lines 50
```

System status:
```bash
htop
df -h
free -h
```

Get server IP for demo:
```bash
echo "Access at: http://$(hostname -I | awk '{print $1}')/"
```
