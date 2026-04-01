#!/bin/bash
set -e

echo "======================================"
echo "JanDhan Plus - Ubuntu Server Setup"
echo "======================================"

# Update system
echo "1️⃣ Updating system packages..."
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git vim htop build-essential

# Install Node.js 18
echo "2️⃣ Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node --version
npm --version

# Install PM2
echo "3️⃣ Installing PM2..."
sudo npm install -g pm2

# Install PostgreSQL
echo "4️⃣ Installing PostgreSQL..."
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database
echo "5️⃣ Creating database..."
sudo -u postgres psql <<EOF
CREATE DATABASE jandhan_plus;
CREATE USER jandhan_user WITH PASSWORD 'changeme123';
GRANT ALL PRIVILEGES ON DATABASE jandhan_plus TO jandhan_user;
\q
EOF

# Install Redis
echo "6️⃣ Installing Redis..."
sudo apt install -y redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server

# Install Python
echo "7️⃣ Installing Python with Google Cloud..."
sudo apt install -y python3-pip
sudo pip3 install google-cloud-vision google-cloud-texttospeech flask

# Install Ganache
echo "8️⃣ Installing Ganache..."
sudo npm install -g ganache

# Install Nginx
echo "9️⃣ Installing Nginx..."
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Create app directory
echo "🔟 Creating app directory..."
mkdir -p ~/jandhan-plus
mkdir -p ~/jandhan-blockchain
mkdir -p /var/www/jandhan-plus/uploads
sudo chown -R $USER:$USER /var/www/jandhan-plus

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Clone jandhan-plus repo to ~/jandhan-plus"
echo "2. Run 'npm install' in project directory"
echo "3. Run 'npm run contracts:deploy' to deploy to Ganache"
echo "4. Update .env.local with contract addresses"
echo "5. Start services with PM2:"
echo "   pm2 start npm --name 'jandhan-next' -- start"
echo "   pm2 start backend/voice-api.js --name 'jandhan-voice'"
echo "   pm2 start backend/ai-service.py --name 'jandhan-ai' --interpreter python3"
