# 🌾 JanDhan Plus - Blockchain Agricultural Marketplace

Fair prices for farmers. Transparency for consumers. Blockchain without cryptocurrency.

> **Building for BGSCET Hackathon 2025**
>
> Cybersecurity + Blockchain = One unified ecosystem for rural banking AND agriculture

## ✨ Features (MVP)

### ✅ Core Demo Features (24-hour build)
1. **Farmer Portal** - List crops with image upload
2. **Buyer Marketplace** - Browse crops and make fair-price offers
3. **Smart Contracts** - Auto-validate offers (min 85% of mandi price)
4. **Payment Flow** - Mock UPI/bank transfers (no crypto!)
5. **Blockchain Records** - Immutable audit trail on Ganache
6. **Consumer Trace** - Scan QR → see complete farm-to-table journey
7. **Fraud Detection** - AI prevents exploitation, blocks unfair offers
8. **Admin Dashboard** - Real-time monitoring and blockchain explorer

### ❌ Not Included (for 24h deadline)
- Custom AI models (using mock data)
- Real Google APIs (mock implementations)
- Production database (using in-memory state)
- Raspberry Pi hardware
- Physical fingerprint scanners

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# 1. Clone and install
git clone <repo-url>
cd jandhan-plus
npm install

# 2. Copy environment variables
cp .env.local.example .env.local

# 3. Start development server
npm run dev

# 4. Open browser
# Visit http://localhost:3000
```

## 🎭 Try Different Roles

### For Farmers (Crop Listing)
```
http://localhost:3000/farmer

- Enter farm details (name, phone, bank account)
- List crop with photo
- See mandi prices for reference
- View blockchain hash of listing
```

### For Buyers (Marketplace)
```
http://localhost:3000/buyer

- Browse all available crops
- See quality grades + fairness scores
- Make offers (smart contract validates pricing)
- Click "Test Fraud Block" to see fraud detection
```

### For Consumers (QR Tracing)
```
http://localhost:3000/consumer

- Click "Scan QR Code" button
- See complete journey:
  - Farm location
  - Quality grade
  - **Bank transfer payment proof** (NOT crypto)
  - Blockchain immutability proof
  - Fair trade score
```

### For Admins (Monitoring)
```
http://localhost:3000/admin

- View all blockchain transactions
- Monitor fraud alerts
- See blockchain status
- Check smart contract deployments
```

## 🏗️ Project Structure

```
jandhan-plus/
├── app/
│   ├── page.tsx           # Landing page
│   ├── layout.tsx         # Root layout
│   ├── globals.css        # Tailwind CSS
│   ├── farmer/            # Crop listing portal
│   ├── buyer/             # Marketplace
│   ├── consumer/          # QR tracing
│   └── admin/             # Dashboard
│
├── contracts/
│   ├── CropMarketplace.sol    # Main smart contract
│   └── PriceOracle.sol        # Price validation
│
├── scripts/
│   └── deploy.ts          # Contract deployment
│
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript config
├── tailwind.config.ts     # Tailwind CSS config
├── hardhat.config.ts      # Hardhat config
└── README.md              # This file
```

## 🔗 Smart Contracts

### CropMarketplay.sol
- **listCrop()** - Farmer lists crop with bank details
- **makeOffer()** - Buyer makes offer
- **acceptOffer()** - Farmer accepts offer
- **commitPayment()** - Record payment commitment
- **confirmPayment()** - Record payment completion

### PriceOracle.sol
- **getMandiPrice()** - Get market reference price
- **validateOffer()** - Check if offer >= 85% of mandi price
- **setMandiPrice()** - (Admin) Update prices

## 💡 Why Blockchain Without Crypto?

**Blockchain provides:**
- ✅ Immutability - Records cannot be altered
- ✅ Transparency - Anyone can verify
- ✅ Decentralization - No single point of control

**Payments happen via:**
- ✅ Real bank transfers (UPI/NEFT)
- ✅ NOT cryptocurrency
- ✅ Blockchain only records *proof* of payment

## 🎬 Demo Flow (5 minutes)

### Minute 1: Farmer Lists Crop
1. Navigate to `/farmer`
2. Fill farmer details + crop info
3. Check mandi prices (reference)
4. Click "List Crop on Blockchain"
5. See blockchain hash generated

### Minute 2: Buyer Makes Offer
1. Navigate to `/buyer`
2. Browse available crops
3. Click "Make Offer" on rice
4. Try "Test Fraud Block" to see protection
5. Make fair offer (≥₹31.7/kg)
6. See fraud score and blockchain proof

### Minute 3: Payment & Proof
1. Payment commits to blockchain
2. Admin dashboard shows transaction
3. See immutable record on blockchain explorer

### Minute 4: Consumer Tracing
1. Navigate to `/consumer`
2. Click "Scan QR Code"
3. See complete journey:
   - Farm location
   - Grade A quality (94% AI confidence)
   - **Bank payment proof** (UPI ref: UPI202501131030XXXX)
   - Blockchain hash
4. Fair trade score: 88% (farmer got fair share)

### Minute 5: Admin Monitoring
1. Navigate to `/admin`
2. See live transaction feed
3. View fraud alerts and blocks
4. Check blockchain status

## 🛠️ Development Commands

```bash
# Development server (hot reload)
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Compile smart contracts
npm run contracts:compile

# Deploy contracts (requires running Ganache)
npm run contracts:deploy

# Lint code
npm run lint
```

## 🔗 Blockchain Integration (For Production)

### Current: Local Hardhat Blockchain
```bash
# Runs in-memory during `npm run dev`
# No setup needed, perfect for demo
```

### Future: Local Ganache Node
```bash
# Install Ganache CLI (optional)
npm install -g ganache

# Start persistent Ganache
ganache --database.dbPath ./blockchain-data --server.port 8545

# Update .env.local
NEXT_PUBLIC_GANACHE_RPC_URL=http://localhost:8545
```

## 🔐 Security Notes

- ✅ No private keys hardcoded
- ✅ No cryptocurrency transfers (can't lose real money)
- ✅ Smart contracts validate all offers
- ✅ Bank account field is just text (no crypto)
- ✅ Blockchain is immutable audit log

## 📊 Mock Data

The app uses hardcoded mock data for:
- Mandi prices (reference rates)
- Crop listings
- Fraud detection rules
- Payment confirmations

In production, these would connect to:
- Real AGMARKNET API
- PostgreSQL database
- Google Vision API (image quality)
- Google TTS API (voice alerts)
- Real payment gateway (Razorpay/PayU)

## 🚨 Fraud Detection Rules

Automatically blocked offers:
- ❌ Less than 85% of mandi price
- ❌ Buyer with high fraud history
- ❌ Quality mismatch (Grade A demanded but B supplied)

Example:
```
Mandi price: ₹1,820/quintal
Min allowed: ₹1,547/quintal (85%)
Rogue offer: ₹1,092/quintal → BLOCKED 🚨
```

## 📱 Responsive Design

- ✅ Mobile-first approach
- ✅ Tailwind CSS responsive grid
- ✅ Works on phones, tablets, laptops
- ✅ Touch-friendly buttons

## 🎓 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Solidity Docs](https://docs.soliditylang.org)
- [Hardhat](https://hardhat.org)
- [ethers.js](https://docs.ethers.org)

## 🏆 Success Metrics

- ✅ Self-hosted working demo
- ✅ Functional farmer → buyer → consumer flow
- ✅ Real smart contracts on blockchain
- ✅ Fraud detection and blocking
- ✅ Transparent payment proof
- ✅ Professional UI/UX
- ✅ No cryptocurrency complexity

## 📝 License

Built for BGSCET Hackathon 2025. All rights reserved.

---

## 🌾 Philosophy

**"Your crop, your price, fair. Your money, your right, protected."**

This platform proves that blockchain can solve transparency problems WITHOUT cryptocurrency, and that agricultural supply chains can be revolutionized with simple, effective technology accessible to rural India.

**No middlemen. No exploitation. Pure fairness. Immutably recorded.**

---

## 📞 Support

For issues or questions:
1. Check existing code in `/app`
2. Review smart contracts in `/contracts`
3. Test manually in your browser
4. Check browser console for errors

Happy building! 🚀🌾
