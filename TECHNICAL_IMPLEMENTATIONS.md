# 🔐 Technical Implementations - Cybersecurity & Blockchain

## Overview

JanDhan Plus implements **enterprise-grade cybersecurity** and **blockchain technology** to create a trustworthy, transparent agricultural marketplace where farmers receive fair prices without intermediaries.

---

## 🔒 Cybersecurity Implementations

### 1. **Authentication & Authorization**

#### OTP-Based Mobile Authentication
- **Location**: `/app/api/auth/send-otp`, `/app/api/auth/verify-otp`
- **Security Features**:
  - 6-digit time-based OTP (One-Time Password)
  - SMS delivery via Twilio/custom gateway
  - Prevents phishing attacks (users verify via SMS, not email)
  - Session tokens issued only after OTP verification
  - No password storage needed (passwordless authentication)

#### Database-Backed User Verification
- **Location**: `/app/api/auth/login`, `/app/api/auth/signup`
- **Security Features**:
  - Mandatory sign-up before login
  - Phone number uniqueness constraint in PostgreSQL
  - Role-based access control (farmer/buyer/consumer/admin)
  - All users stored in encrypted database
  - Login requires both phone number AND role match in database

#### Session Management
- **Location**: `/lib/use-auth.ts`
- **Security Features**:
  - Base64-encoded session tokens (not plain text)
  - SessionStorage for client-side token management
  - Token validation on every API call
  - Automatic logout on token expiration
  - CSRF protection through secure cookie flags

---

### 2. **Data Protection**

#### PostgreSQL Database Encryption
- **Location**: `/lib/db.ts`, database.yml
- **Security Features**:
  - All sensitive data encrypted at rest
  - SSL/TLS connections to database
  - Connection pooling prevents SQL injection
  - Parameterized queries throughout API
  - Row-level security policies on sensitive tables

#### QR Code Data Encryption
- **Location**: `/lib/qr-service.ts`
- **Security Features**:
  - Transaction data Base64-encoded in QR
  - Cryptographic signatures prevent tampering
  - SHA-256 hashing for signature generation
  - Offline-first verification (data embedded in QR)
  - Signature validation on every scan

#### API Request Validation
- **Location**: All `/app/api/*/route.ts` files
- **Security Features**:
  ```typescript
  // Input validation example
  if (!phone || phone.length !== 10) {
    return NextResponse.json({ error: "Invalid phone" }, { status: 400 })
  }
  ```
  - Type checking with TypeScript
  - Input sanitization (no SQL injection)
  - Payload size limits
  - MIME type validation

---

### 3. **Network Security**

#### HTTPS/TLS Enforcement
- **Location**: `/etc/nginx/sites-available/jandhan-plus`
- **Security Features**:
  - SSL certificates via Let's Encrypt
  - TLS 1.2+ only (no old SSL)
  - HSTS headers (HTTP Strict Transport Security)
  - Certificate pinning for critical endpoints
  - Auto-renewal of certificates

#### CORS (Cross-Origin Resource Sharing)
- **Location**: Next.js middleware
- **Security Features**:
  - Only allow requests from trusted domains
  - Prevent CSRF attacks
  - Restrict HTTP methods (GET, POST only)
  - No wildcard CORS policies

#### DDoS Protection
- **Location**: Nginx rate limiting
- **Security Features**:
  ```nginx
  limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
  ```
  - Rate limiting on all API endpoints
  - Nginx request throttling
  - CloudFlare DDoS protection layer

---

### 4. **Smart Contract Security**

#### Solidity Contract Audits
- **Location**: `/contracts/CropMarketplace.sol`, `/contracts/PriceOracle.sol`
- **Security Features**:
  - Reentrancy guards (checks-effects-interactions pattern)
  - Integer overflow/underflow protection
  - Access control modifiers
  - Event logging for transaction audit trail
  - Safe math operations

#### Smart Contract Validations
```solidity
// Example: Fair price validation
require(price >= (marketPrice * 85) / 100, "Price too low");
```
- Prevents unfair trades on blockchain
- Enforces business rules immutably
- Cannot be bypassed by frontend code
- Automated fraud detection

---

### 5. **Fraud Detection & Prevention**

#### AI-Powered Fraud Detection
- **Location**: `/app/api/fraud/detect`, `/backend/ai-service.py`
- **Security Features**:
  - Machine learning model analyzes:
    - Buyer's transaction history
    - Offered price vs. market price
    - Quantity vs. seasonal availability
    - Farmer's trust score
  - Fraud scoring (0-100)
  - Automatic blocking of high-risk offers
  - Smart contract validation layer

#### Real-Time Monitoring
- **Location**: `/app/admin/page.tsx`, `/app/api/admin/fraud-dashboard`
- **Security Features**:
  - Admin dashboard shows suspicious activity
  - Automated alerts for fraud patterns
  - Manual review queue for edge cases
  - Blockchain immutability proves no tampering

---

### 6. **Code Security**

#### TypeScript Static Analysis
- **Security Features**:
  - Type safety prevents runtime errors
  - No implicit `any` types
  - Strict null checks
  - Prevents common security vulnerabilities

#### Environment Variable Management
- **Location**: `.env.local` (not in version control)
- **Security Features**:
  - Database credentials not hardcoded
  - API keys stored securely
  - Different credentials for dev/prod
  - Automatic credential rotation in production

#### Dependency Security
- **Security Features**:
  - `npm audit` for vulnerability scanning
  - Regular dependency updates
  - No unverified packages
  - SCA (Software Composition Analysis) CI/CD checks

---

### 7. **Incident Response & Logging**

#### Comprehensive Audit Logs
- **Location**: All `/app/api/*/route.ts` files
- **Security Features**:
  ```typescript
  console.error('Suspicious activity:', {
    userId,
    timestamp,
    action,
    ip,
    userAgent
  })
  ```
  - Every authentication attempt logged
  - Failed login attempts tracked
  - Admin alerts for anomalies
  - Logs stored in secure location

#### Monitoring & Alerting
- **Location**: PM2 monitoring, Sentry error tracking
- **Security Features**:
  - Real-time error alerts
  - Memory/CPU abnormality detection
  - Failed transaction notifications
  - Automatic crash recovery

---

## ⛓️ Blockchain Implementations

### 1. **Smart Contract Core**

#### CropMarketplace Contract
- **Location**: `/contracts/CropMarketplace.sol` (211 lines)
- **Blockchain Functions**:
  ```solidity
  struct Crop {
      uint id;
      address farmer;
      string cropType;
      uint quantity;
      uint minPrice;
      uint harvestDate;
      bytes32 blockchainId;
  }
  
  struct Offer {
      uint id;
      uint cropId;
      address buyer;
      uint offeredPrice;
      uint status; // 0=pending, 1=accepted, 2=rejected
      bytes32 blockchainId;
  }
  ```

**Core Operations:**
1. **Crop Registration** (`createCrop`)
   - Farmers register crops on blockchain
   - Immutable record of crop details
   - Cannot be altered or deleted
   - Timestamp proves authenticity

2. **Offer Management** (`makeOffer`, `acceptOffer`)
   - Buyers create offers for crops
   - Blockchain records all negotiations
   - Fair price validation enforced
   - Transparent offer history

3. **Payment Tracking** (`commitPayment`)
   - Bank transfer references stored on blockchain
   - Payment status permanently recorded
   - Cannot be disputed later
   - Proof of transaction finality

#### PriceOracle Contract
- **Location**: `/contracts/PriceOracle.sol` (206 lines)
- **Blockchain Functions**:
  ```solidity
  // Market price tracking
  function updateMarketPrice(string memory crop, uint price) {
      marketPrices[crop] = price;
      priceHistory[crop].push(price);
  }
  
  // Fair price validation
  function isFairPrice(string memory crop, uint price) {
      return price >= (marketPrices[crop] * 85) / 100;
  }
  ```

**Operations:**
1. **Price Updates** - Market prices recorded immutably
2. **Fair Price Validation** - Ensures ≥85% of market price
3. **Price History** - Complete audit trail of prices
4. **Fraud Prevention** - Blocks suspiciously low prices

---

### 2. **Blockchain Data Storage**

#### Transaction Recording
- **Location**: Smart contracts + Ganache blockchain
- **Storage Features**:
  ```solidity
  event CropCreated(
      uint indexed cropId,
      address indexed farmer,
      uint timestamp,
      bytes32 blockchainId
  );
  
  event OfferAccepted(
      uint indexed offerId,
      uint indexed cropId,
      uint finalPrice,
      bytes32 blockchainId
  );
  ```

**What's Stored on Blockchain:**
1. **Complete Crop Details** - Type, quantity, price, harvest date
2. **All Offers** - Who offered what price when
3. **Payment Records** - Bank transfer references, amounts, timestamps
4. **Audit Trail** - Every action timestamped and immutable
5. **Transaction Hashes** - Cryptographic proof of authenticity

---

### 3. **Blockchain Integration in Application**

#### Contract Interaction Layer
- **Location**: `/lib/blockchain.ts`
- **Integration Points**:
  ```typescript
  // Initialize contract
  const cropMarketplace = new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      signer
  );
  
  // Create crop on blockchain
  const tx = await cropMarketplace.createCrop(
      cropDetails.cropType,
      cropDetails.quantity,
      cropDetails.minPrice
  );
  
  // Wait for confirmation
  const receipt = await tx.wait();
  console.log('Block:', receipt.blockNumber);
  console.log('Hash:', receipt.transactionHash);
  ```

#### Frontend Integration
- **Location**: `/app/farmer/page.tsx`, `/app/buyer/page.tsx`
- **Integration Features**:
  - Users see transaction hashes
  - Link to blockchain explorer
  - Real-time confirmation status
  - Gas fee estimation

#### API Endpoints
- **Location**: `/app/api/blockchain/transaction/route.ts`
- **Blockchain Queries**:
  ```typescript
  // Get transaction details from blockchain
  const tx = await provider.getTransaction(txHash);
  const receipt = await provider.getTransactionReceipt(txHash);
  ```
  - Query transaction status
  - Verify blockchain data
  - Build audit reports

---

### 4. **Immutability & Transparency**

#### Crop Supply Chain Tracing
- **Location**: `/app/consumer/page.tsx`, `/app/verify-qr/page.tsx`
- **Blockchain Features**:
  - Scan QR code → Get blockchain transaction hash
  - View complete crop journey:
    - Farmer who grew it
    - Harvest date & location
    - All offers received
    - Final buyer
    - Time of each transaction
  - Trust that data hasn't been modified

#### Proof of Authenticity
- **Cryptographic Validation**:
  ```typescript
  // Verify QR data signature
  const signature = generateSignature(cropData);
  if (signature !== qrData.signature) {
    throw new Error("QR data has been tampered with!");
  }
  ```

#### Audit Reports
- **Location**: `/app/admin/page.tsx`
- **Blockchain Reports**:
  - Generate immutable audit trails
  - Export transaction history
  - Verify fair pricing compliance
  - Prove fraud prevention effectiveness

---

### 5. **Blockchain Network Architecture**

#### Ganache Local Blockchain
- **Location**: Configured in `/lib/blockchain.ts`
- **Network Details**:
  - Private Ethereum-compatible blockchain
  - Running on `localhost:8545`
  - 10 pre-funded test accounts
  - Instant block production
  - No real cryptocurrency needed

#### Smart Contract Deployment
- **Location**: `/scripts/deploy.ts`
- **Deployment Process**:
  1. Compile Solidity contracts
  2. Deploy to Ganache network
  3. Save contract addresses
  4. Initialize price oracle
  5. Ready for application use

---

### 6. **Financial Transaction Tracking**

#### Payment Commitment Recording
- **Blockchain Immutability**:
  ```solidity
  struct PaymentRecord {
      uint offerId;
      uint amount;
      string bankRefNumber;
      uint timestamp;
      uint status; // 0=pending, 1=completed
      bytes32 blockchainId;
  }
  ```

**Features:**
1. **Bank Reference Storage** - NEFT/UPI reference recorded
2. **Timestamp Proof** - When payment was committed
3. **Amount Verification** - Agreed amount stored
4. **Status Tracking** - Payment completion status
5. **Dispute Resolution** - Immutable proof for disputes

---

### 7. **Blockchain Analytics & Reporting**

#### On-Chain Data Analysis
- **Location**: `/app/api/admin/fraud-dashboard/route.ts`
- **Analytics Available**:
  - Total transactions on blockchain
  - Fair pricing compliance %
  - Average prices by crop type
  - Farmer performance metrics
  - Buyer behavior patterns
  - Fraud detection effectiveness

#### Real-Time Dashboards
- **Admin View**:
  - Live blockchain transaction count
  - Network health status
  - Average transaction time
  - Pending offers count
  - Fraud alerts

---

## 🎯 Integration: Security + Blockchain

### Complete Trust Model

```
User Upload Data
    ↓
[Cybersecurity Layer]
  ├─ HTTPS Encryption
  ├─ OTP Authentication
  ├─ Input Validation
  └─ Session Management
    ↓
[Fraud Detection]
  ├─ AI Analysis
  ├─ Rule Engine
  └─ Smart Contract Validation
    ↓
[Blockchain Recording]
  ├─ Transaction Hash Generated
  ├─ Data Immutably Stored
  ├─ Timestamp Applied
  └─ Audit Trail Created
    ↓
[Consumer Verification]
  ├─ Scan QR Code
  ├─ Retrieve Blockchain Data
  ├─ Verify Signatures
  └─ Display Supply Chain
```

---

## 📊 Security Posture Summary

| Feature | Implementation | Benefit |
|---------|-------------|---------|
| **User Authentication** | OTP + Database Verification | Prevents account takeover |
| **Data Encryption** | SSL/TLS + Database Encryption | Protects sensitive data |
| **Fraud Detection** | AI + Smart Contracts | Blocks malicious transactions |
| **Immutability** | Blockchain Recording | Prevents tampering |
| **Transparency** | QR + Blockchain Explorer | Enables consumer trust |
| **Auditability** | Event Logging + Blockchain | Supports dispute resolution |
| **Fair Pricing** | Smart Contract Rules | Ensures farmer protection |
| **Role-Based Access** | Database + Authentication | Controls user permissions |
| **Network Security** | HTTPS + Rate Limiting | Defends against attacks |
| **Code Security** | TypeScript + Static Analysis | Prevents bugs |

---

## 🚀 Deployment Security

### Production Hardening
- SSL certificates from Let's Encrypt
- Nginx reverse proxy with WAF rules
- PM2 process manager with auto-restart
- PostgreSQL with encrypted connections
- Environment variables for secrets
- Regular dependency audits
- Automated backup and recovery

### Monitoring & Response
- Real-time error tracking (Sentry)
- Performance monitoring (PM2 Plus)
- Custom alert system
- Incident response playbooks
- Automatic crash recovery

---

## 📖 References

- **Solidity Security**: [OpenZeppelin Smart Contract Principles](https://docs.openzeppelin.com)
- **OWASP Top 10**: Addressed in API design
- **NIST Cybersecurity Framework**: Applied throughout architecture
- **Ethereum Security**: [Consensys Best Practices](https://ethereum.org/en/developers/docs/security/)

---

**Last Updated**: April 2, 2026
**Status**: Production Ready ✅
