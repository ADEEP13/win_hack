# 🛡️ Fraud Detection System - Complete Implementation Guide

**Protecting Farmers from Price Exploitation with AI + Blockchain**

> Built into JanDhan Plus to ensure fair pricing and prevent buyer exploitation through intelligent fraud detection and real-time alerts.

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Key Features](#key-features)
3. [How It Works](#how-it-works)
4. [API Endpoints](#api-endpoints)
5. [Smart Contract Protection](#smart-contract-protection)
6. [AI Service Integration](#ai-service-integration)
7. [Farmer Alerts & Notifications](#farmer-alerts--notifications)
8. [Admin Dashboard](#admin-dashboard)
9. [Testing & Deployment](#testing--deployment)

---

## 🎯 System Overview

JanDhan Plus includes a **multi-layered fraud detection system** that:

- ✅ **Detects price exploitation** - Identifies offers below fair market value
- ✅ **Tracks buyer patterns** - Flags repeat exploiters
- ✅ **Analyzes anomalies** - Uses statistical models to spot suspicious behavior
- ✅ **Protects farmers** - Blocks or alerts on dangerous offers
- ✅ **Prevents blacklisting** - Maintains immutable records on blockchain
- ✅ **Real-time monitoring** - Admin dashboard with live fraud alerts

---

## 🎯 Key Features

### 1. **Price Floor Protection (Smart Contract)**

**File**: `contracts/PriceOracle.sol`

```solidity
// Ensures no offer falls below 85% of mandi price
uint256 minPrice = (mandiPrice * 85) / 100;
require(offerPrice >= minPrice, "Offer below minimum fair price");
```

**What it prevents:**
- Offers below 85% of market value are rejected
- Severe exploitation (< 70%) triggers critical alerts
- Historical price tracking detects volatility manipulation

**Example:**
```
Mandi Price: ₹2000
Minimum Allowed: ₹1700 (85%)
Severe Limit: ₹1400 (70%)

✅ Offer at ₹1800 - ACCEPTED (90%)
⚠️ Offer at ₹1600 - WARNED (80%)
❌ Offer at ₹1200 - BLOCKED (60% - CRITICAL)
```

### 2. **Buyer Reputation Scoring**

The system tracks each buyer's behavior:

| Metric | Calculation | Impact |
|--------|-------------|--------|
| **Success Rate** | (Accepted Offers / Total Offers) × 100 | Primary score |
| **Exploitation Rate** | (Suspicious Offers / Total Offers) × 100 | Deduction |
| **Blacklist Status** | 3+ fraudulent attempts | Auto-blacklist |

**Example Buyer Profile:**
```
Buyer: Raj's Wholesale
Total Offers: 50
Suspicious (< 85%): 8 (16%)
Exploitation Rate: 16%
Reputation Score: 84/100
Status: MONITOR (Good but watch)
```

### 3. **Real-Time Fraud Scoring**

Each offer gets a **fraud score (0-100)**:

| Score Range | Risk Level | Action | Recommendation |
|-------------|-----------|--------|-----------------|
| 0-20 | ✅ LOW | Accept | Fair offer, safe to proceed |
| 20-40 | 🟡 MEDIUM | Review | Negotiate if possible |
| 40-60 | 🟠 HIGH | Warn | Alert farmer, require review |
| 60-80 | 🔴 CRITICAL | Flag | Block or require confirmation |
| 80-100 | 🚨 SEVERE | Block | Automatic rejection |

**Fraud Score Calculation:**

```
fraudScore = 0

// Price-based (0-40 points)
if (price < 85% mandi) fruadScore += 40
if (price < 70% mandi) fraudScore += 30  // Additional

// Buyer history (0-25 points)
if (exploitation_rate > 50%) fraudScore += 25
if (exploitation_rate > 25%) fraudScore += 15

// Market anomalies (0-15 points)
if (deviation > 2 std devs) fraudScore += 15
if (rapid offers in 24h) fraudScore += 10

// Cap at 100
fraudScore = min(fraudScore, 100)
```

---

## 🔍 How It Works

### Workflow: Offer to Protection

```
┌─────────────────────────────────────────────────────────────────┐
│                    BUYER MAKES OFFER                             │
│   Farmer receives new offer on their crop                       │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                  1. BLOCKCHAIN VALIDATION                        │
│  Smart Contract (PriceOracle.sol) checks:                       │
│  • Offer >= 85% of mandi price?                                 │
│  • Buyer blacklisted?                                           │
│  • Price volatility within bounds?                              │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│               2. API FRAUD DETECTION                             │
│  /api/fraud/detect analyzes:                                    │
│  • Price below minimum (high risk)                              │
│  • Price extremely low (critical risk)                          │
│  • Buyer repeat exploitation pattern                            │
│  • Market anomaly detection                                     │
│  • Invalid quantity check                                       │
│                                                                 │
│  Returns: fraudScore (0-100)                                    │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│            3. AI SERVICE DEEP ANALYSIS                           │
│  /fraud/analyze (Python backend) runs:                          │
│  • Statistical anomaly detection (Z-score analysis)             │
│  • Buyer behavior ML model                                      │
│  • Time-series price deviation                                  │
│  • Fraud pattern matching                                       │
│                                                                 │
│  Returns: Confidence score + risk factors                       │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│              4. FARMER PROTECTION ALERT                          │
│  /api/protection returns:                                       │
│  • Fair price range (min, fair, optimal)                        │
│  • Financial impact analysis                                    │
│  • Recommended action                                           │
│  • Fraud warning message                                        │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│           5. FARMER DECISION                                     │
│  • ACCEPT (if score < 40 and price fair)                        │
│  • NEGOTIATE (if score 40-60)                                   │
│  • REJECT (if score >= 70)                                      │
│  • REPORT (suspicious behavior)                                 │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│           6. REPUTATION TRACKING                                 │
│  Smart Contract records:                                        │
│  • Successful transaction → Buyer reputation +1                 │
│  • Fraudulent attempt → Fraud count +1                          │
│  • 3 frauds → Auto-blacklist buyer                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔌 API Endpoints

### 1. **POST /api/fraud/detect** - Core Fraud Detection

Analyze an offer for fraud risk with comprehensive analysis.

**Request:**
```bash
curl -X POST http://localhost:3001/api/fraud/detect \
  -H "Content-Type: application/json" \
  -d '{
    "cropId": "crop_123",
    "offerPrice": 1500,
    "mandiPrice": 2000,
    "buyerPhone": "9876543210",
    "cropType": "rice",
    "cropQuantity": 50,
    "farmerPhone": "9111111111"
  }'
```

**Response:**
```json
{
  "success": true,
  "fraudAnalysis": {
    "fraudScore": 45,
    "isHighRisk": false,
    "isCritical": false,
    "indicators": [
      {
        "type": "BELOW_MINIMUM_PRICE",
        "severity": "HIGH",
        "message": "Offer is 25% below mandi price",
        "expectedPrice": 1700,
        "offeredPrice": 1500,
        "difference": 200
      }
    ],
    "protectionLevel": ["FLAG_OFFER"],
    "recommendation": "CAUTION - This offer is below fair price. Consider alternatives."
  },
  "priceAnalysis": {
    "mandiPrice": 2000,
    "offeredPrice": 1500,
    "pricePercentage": "75.00",
    "fairPriceGuide": {
      "minimum": 1700,
      "fair": 1900,
      "optimal": 2000,
      "currency": "₹"
    },
    "savings": {
      "fromFair": "21.05",
      "fromOptimal": "25.00"
    }
  },
  "farmerProtection": {
    "shouldAccept": false,
    "shouldReview": true,
    "shouldReject": false,
    "warningMessage": "⚠️ This offer may not be fair. Review carefully.",
    "safetyChecks": {
      "priceAboveMinimum": false,
      "reasonableDeviation": false,
      "buyerReputable": true
    }
  }
}
```

### 2. **GET /api/protection/analyze-offer?offerId=<id>** - Farmer Protection

Complete analysis with financial impact and recommendations.

**Response:**
```json
{
  "success": true,
  "offer": {
    "id": "offer_123",
    "buyerName": "Fresh Goods Wholesale",
    "cropType": "rice",
    "quantity": 50
  },
  "priceAnalysis": {
    "offeredPrice": 1500,
    "mandiPrice": 2000,
    "fairPrice": 1900,
    "priceRatio": 75
  },
  "financialImpact": {
    "lossPerUnit": 400,
    "totalLoss": 20000,
    "lossPercentage": 20,
    "equivalentQuantity": "50 bags/boxes",
    "message": "Accepting this offer would result in ₹20000 loss"
  },
  "safetyRecommendation": {
    "alert": "⚠️ HIGH RISK: Fresh Goods Wholesale's offer seems unfair. You're losing ₹400 per unit. Contact admin before accepting.",
    "shouldAccept": false,
    "shouldReview": true,
    "shouldReject": false
  }
}
```

### 3. **POST /api/protection/report-fraud** - Fraud Report

Report fraudulent buyer to admin for investigation.

**Request:**
```bash
curl -X POST http://localhost:3001/api/protection/report-fraud \
  -H "Content-Type: application/json" \
  -d '{
    "offerId": "offer_123",
    "buyerPhone": "9876543210",
    "buyerName": "Exploiter Wholesale",
    "reason": "Repeatedly offering 30% below market",
    "farmerPhone": "9111111111",
    "reportDetails": "This buyer has made 5 offers, all 30%+ below fair price"
  }'
```

**Response:**
```json
{
  "success": true,
  "report": {
    "id": "report_xyz",
    "status": "recorded",
    "message": "Your report has been recorded. Admin will review."
  },
  "buyerAnalysis": {
    "totalOffers": 5,
    "suspiciousOffers": 5,
    "recommendedAction": "BLACKLIST"
  },
  "nextSteps": [
    "Admin will investigate within 24 hours",
    "Buyer will be flagged in the system",
    "Buyer may be blacklisted",
    "You will be notified of actions taken"
  ]
}
```

### 4. **GET /api/admin/fraud-dashboard** - Admin Monitoring

Real-time fraud statistics and buyer analysis dashboard.

**Use Cases:**
- Monitor real-time fraud rates
- Identify repeat exploiters
- Review recent fraud attempts
- Get actionable recommendations

**Response Sample:**
```json
{
  "success": true,
  "summary": {
    "totalOffers": 150,
    "suspiciousOffers": 18,
    "criticOffers": 3,
    "blockedOffers": 2,
    "fraudRate": "12%",
    "highRiskBuyers": 4
  },
  "alerts": {
    "critical": "🚨 3 critical fraud attempts detected!",
    "monitoring": "⚠️ 4 buyers under investigation",
    "fraudRate": "📊 Fraud rate within acceptable range"
  },
  "topExploiters": [
    {
      "buyerName": "Kalpak Wholesale",
      "buyerPhone": "9876543210",
      "exploitationRate": "60%",
      "totalOffers": 10,
      "suspiciousOffers": 6,
      "recommendation": "INVESTIGATE"
    }
  ],
  "recommendations": [
    "🔍 INVESTIGATION NEEDED: 4 buyers show exploitation patterns",
    "📊 PATTERN DETECTED: Multiple fraud attempts suggest organized exploitation",
    "📱 FARMER PROTECTION: All offers below 85% mandi price are auto-flagged",
    "🔔 REAL-TIME ALERTS: Admin will be notified of critical fraud attempts"
  ]
}
```

---

## 🔐 Smart Contract Protection

**File**: `contracts/PriceOracle.sol`

### Key Functions

```solidity
// 1. Validate offer price
function validateOfferWithDetails(
  string cropName,
  uint256 offerPrice,
  address buyerAddress
) returns (bool isValid, uint256 fraudScore)

// 2. Get safe price range
function getFairPriceRange(string cropName)
  returns (uint256 minPrice, uint256 fairPrice, uint256 maxPrice)

// 3. Get buyer reputation
function getBuyerReputation(address buyerAddress)
  returns (uint256 score)  // 0-100

// 4. Check if buyer is blacklisted
function isBuyerBlacklisted(address buyerAddress)
  returns (bool)

// 5. Record transaction outcomes
function recordSuccessfulTransaction(address buyerAddress)
function recordFraudulentTransaction(address buyerAddress)
```

### Price Protection Rules

```solidity
// Rule 1: Minimum Price (85% of mandi)
if (offerPrice < minPrice) {
  fraudScore += 50;
  emit FraudDetected(buyer, crop, offerPrice);
}

// Rule 2: Severe Exploitation (< 70%)
if (offerPrice < severeMinPrice) {
  fraudScore += 30;
  protectionLevel = BLOCK_OFFER;
}

// Rule 3: Auto-Blacklist
if (buyerFraudCount >= 3) {
  blacklistedBuyers[buyerAddress] = true;
  emit BuyerBlacklisted(buyer, "Multiple fraud attempts");
}
```

---

## 🤖 AI Service Integration

**File**: `backend/ai-service.py` (Port 5000)

### Features

1. **ML Price Analysis**
   - Statistical anomaly detection (Z-score analysis)
   - Deviation from historical patterns
   - Market baseline comparison

2. **Buyer Behavior Learning**
   - Pattern recognition from offer history
   - Exploitation rate calculation
   - Predictive fraud scoring

3. **Time-Series Detection**
   - Rapid offers in short timeframe (spam detection)
   - Price volatility tracking
   - Seasonal pattern analysis

### Endpoints

```bash
# 1. Fraud Analysis with ML
POST /fraud/analyze
{
  "offerPrice": 1500,
  "mandiPrice": 2000,
  "buyerId": "buyer_123",
  "cropType": "rice",
  "offerHistory": [
    {"price": 1600, "recency": 48},
    {"price": 1400, "recency": 24}
  ]
}

# 2. Buyer Reputation
GET /fraud/buyer-reputation?buyerId=buyer_123

# 3. Fraud Statistics
GET /fraud/stats
```

---

## 📱 Farmer Alerts & Notifications

### Alert Types

**1. Price Warning Alert**
```
⚠️ CAUTION: This offer is below fair market price by ₹200. 
You can negotiate for better price.
```

**2. High Risk Alert**
```
🟠 HIGH RISK: Raj's Wholesale's offer seems unfair. 
You're losing ₹400 per unit. Contact admin before accepting.
```

**3. Critical Fraud Alert**
```
🚨 CRITICAL FRAUD ALERT: Exploiter Wholesale is attempting 
severe exploitation! This offer is ₹600 below fair price. 
DO NOT ACCEPT.
```

**4. Safe Offer Alert**
```
✅ SAFE: Fresh Produce's offer appears reasonable. 
You may safely accept.
```

### Integration Points

- **SMS**: Voice API can send fraud warnings via SMS
- **Voice**: Audio alerts for critical fraud
- **UI Modal**: Visual warnings in farmer portal
- **Email**: Detailed fraud report to farmer

---

## 📊 Admin Dashboard

**Route**: `/api/admin/fraud-dashboard`

### Real-Time Metrics

| Metric | Purpose | Action |
|--------|---------|--------|
| **Fraud Rate %** | Overall marketplace health | If >20%, review stricter rules |
| **High Risk Buyers** | Exploiters to investigate | Blacklist if 3+ frauds |
| **Critical Offers** | Immediate action needed | Block or contact buyer |
| **Recent Alerts** | Last 10 fraud attempts | Review and take action |

### Dashboard Sections

1. **Executive Summary**
   - Total offers analyzed
   - Fraud detection rate
   - Buyers under investigation
   - Critical threats

2. **Top Exploiters**
   - Buyer name and phone
   - Exploitation rate %
   - Recommended action
   - Total suspicius offers

3. **Recent Fraud Attempts**
   - Timestamp
   - Buyer and crop
   - Price ratio
   - Financial loss to farmer

4. **Recommendations**
   - Specific actions (Blacklist, Monitor, etc.)
   - Pattern alerts
   - System improvements needed

---

## 🧪 Testing & Deployment

### Local Testing

```bash
# 1. Run AI service
python backend/ai-service.py

# 2. Test fraud detection
curl -X POST http://localhost:5000/fraud/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "offerPrice": 1000,
    "mandiPrice": 2000,
    "buyerId": "buyer_test",
    "cropType": "rice"
  }'

# 3. Check buyer reputation
curl http://localhost:5000/fraud/buyer-reputation?buyerId=buyer_test

# 4. Get fraud stats
curl http://localhost:5000/fraud/stats
```

### Smart Contract Deployment

```bash
# 1. Deploy enhanced PriceOracle
npm run contracts:deploy

# 2. Test price validation
```

### API Testing

```bash
# Test fraud detection endpoint
curl -X POST http://localhost:3001/api/fraud/detect \
  -H "Content-Type: application/json" \
  -d '{
    "cropId": "crop_123",
    "offerPrice": 1500,
    "mandiPrice": 2000,
    "buyerPhone": "9876543210",
    "cropType": "rice",
    "cropQuantity": 50
  }'

# Test farmer protection analysis
curl http://localhost:3001/api/protection/analyze-offer?offerId=offer_123

# Test admin dashboard
curl http://localhost:3001/api/admin/fraud-dashboard
```

### Deployment to Server

```bash
# 1. Pull latest code
git pull origin main

# 2. Install dependencies
npm install --legacy-peer-deps

# 3. Build project
npm run build

# 4. Update blockchain
npm run contracts:deploy

# 5. Restart services
pm2 restart jandhan-next
pm2 restart jandhan-ai
```

---

## 📈 Fraud Detection Success Metrics

### Measurement

```
Fraud Prevention Rate = (Blocked Frauds / Total Frauds) × 100
Target: >95% of exploitation attempts detected

Farmer Savings = Amount protected from unfair offers
Target: ₹10,000+ per farmer per season

Buyer Rehabilitation = Buyers improving after warning
Target: >30% success in buyer behavior change
```

### Example Impact

**Before Fraud Detection:**
- 100 farmers × ₹5,000 loss = ₹500,000 annual loss

**After Fraud Detection:**
- 90 farmers protected early
- 10 farmers negotiate better terms
- Total savings: ₹450,000+ annually

---

## 🔔 Key Takeaways

✅ **Multi-Layer Protection** - Blockchain + API + AI  
✅ **Real-Time Detection** - Instant fraud scoring  
✅ **Farmer Education** - Price guidance + alerts  
✅ **Admin Monitoring** - Dashboard + actionable insights  
✅ **Buyer Accountability** - Reputation + blacklisting  
✅ **Immutable Records** - Blockchain audit trail  

---

## 📞 Support & Troubleshooting

### Common Issues

**Q: Fraud detection not working?**
- A: Check if AI service (port 5000) is running: `python backend/ai-service.py`

**Q: Buyer keeps making exploitative offers?**
- A: Check `/api/admin/fraud-dashboard` to review pattern and recommend blacklist

**Q: Want to adjust fraud thresholds?**
- A: Edit `contracts/PriceOracle.sol` lines 85-87 to change percentage thresholds

---

**🌾 Built to protect India's farmers from exploitation.**

