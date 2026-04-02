// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title PriceOracle
 * @dev Enhanced oracle preventing farmer exploitation through fair price enforcement
 */
contract PriceOracle {
    address public admin;

    // Crop name => Current mandi price (₹ per quintal in paise)
    mapping(string => uint256) public mandiPrices;
    
    // Historical price tracking for volatility detection
    mapping(string => uint256[]) public priceHistory;
    mapping(string => uint256) public lastUpdateTimestamp;
    
    // Buyer reputation tracking to detect exploitative patterns
    mapping(address => uint256) public buyerFraudCount;
    mapping(address => uint256) public buyerSuccessCount;
    
    // Blacklist malicious buyers
    mapping(address => bool) public blacklistedBuyers;

    event PriceUpdated(string indexed cropName, uint256 price, uint256 timestamp);
    event PriceAnomaly(string indexed cropName, uint256 price, string reason);
    event BuyerBlacklisted(address indexed buyer, string reason);
    event FraudDetected(address indexed buyer, string indexed cropName, uint256 offerPrice);

    constructor() {
        admin = msg.sender;

        // Initialize with realistic MSP (Minimum Support Price) data
        mandiPrices["rice"] = 182000; // ₹1,820/quintal
        mandiPrices["wheat"] = 205000; // ₹2,050/quintal
        mandiPrices["tomato"] = 3500; // ₹35/kg
        mandiPrices["onion"] = 2800; // ₹28/kg
        mandiPrices["cotton"] = 480000; // ₹4,800/quintal
        mandiPrices["sugarcane"] = 325000; // ₹3,250/quintal
        mandiPrices["potato"] = 2000; // ₹20/kg
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this");
        _;
    }

    modifier notBlacklisted(address _buyer) {
        require(!blacklistedBuyers[_buyer], "Buyer is blacklisted for fraud");
        _;
    }

    /**
     * @dev Update mandi price and track history for volatility detection
     */
    function setMandiPrice(string memory _cropName, uint256 _price) public onlyAdmin {
        require(_price > 0, "Price must be positive");
        
        uint256 oldPrice = mandiPrices[_cropName];
        mandiPrices[_cropName] = _price;
        lastUpdateTimestamp[_cropName] = block.timestamp;
        
        // Store in history for volatility analysis (keep last 30 updates)
        priceHistory[_cropName].push(_price);
        if (priceHistory[_cropName].length > 30) {
            // Remove oldest price (shift left)
            uint256[] storage history = priceHistory[_cropName];
            for (uint i = 0; i < history.length - 1; i++) {
                history[i] = history[i + 1];
            }
            history.pop();
        }
        
        // Detect unusual price swings (>20% change in 24 hours)
        if (oldPrice > 0 && block.timestamp - lastUpdateTimestamp[_cropName] < 1 days) {
            uint256 percentChange = ((oldPrice > _price ? oldPrice - _price : _price - oldPrice) * 100) / oldPrice;
            if (percentChange > 20) {
                emit PriceAnomaly(_cropName, _price, "Unusual price volatility detected");
            }
        }
        
        emit PriceUpdated(_cropName, _price, block.timestamp);
    }

    /**
     * @dev Get current mandi price
     */
    function getMandiPrice(string memory _cropName) public view returns (uint256) {
        uint256 price = mandiPrices[_cropName];
        require(price > 0, "Crop price not found in oracle");
        return price;
    }

    /**
     * @dev Get minimum allowed price (85% of mandi price - ensures farmer protection)
     */
    function getMinAllowedPrice(string memory _cropName) public view returns (uint256) {
        return (mandiPrices[_cropName] * 85) / 100;
    }

    /**
     * @dev Get fair price range for farmer education
     */
    function getFairPriceRange(string memory _cropName) public view returns (uint256 minPrice, uint256 fairPrice, uint256 maxPrice) {
        uint256 mandi = mandiPrices[_cropName];
        minPrice = (mandi * 85) / 100;  // 85% minimum
        fairPrice = (mandi * 95) / 100; // 95% fair price
        maxPrice = mandi;                // 100% mandi price
    }

    /**
     * @dev Enhanced offer validation with fraud detection
     */
    function validateOfferWithDetails(
        string memory _cropName, 
        uint256 _offerPrice,
        address _buyerAddress
    ) public notBlacklisted(_buyerAddress) returns (bool isValid, uint256 fraudScore) {
        
        require(_offerPrice > 0, "Offer price must be positive");
        
        uint256 minPrice = getMinAllowedPrice(_cropName);
        uint256 fraudPoints = 0;
        
        // Rule 1: Price below minimum (HIGH RISK)
        if (_offerPrice < minPrice) {
            fraudPoints += 50;
            emit FraudDetected(_buyerAddress, _cropName, _offerPrice);
        }
        
        // Rule 2: Price extremely low (CRITICAL RISK)
        uint256 severeMinPrice = (mandiPrices[_cropName] * 70) / 100; // 70%
        if (_offerPrice < severeMinPrice) {
            fraudPoints += 30; // Additional points for severe exploitation
        }
        
        // Rule 3: Buyer has history of fraud (RISK)
        if (buyerFraudCount[_buyerAddress] > 0) {
            fraudPoints += (buyerFraudCount[_buyerAddress] * 5);
            if (fraudPoints > 100) fraudPoints = 100; // Cap at 100
        }
        
        // Rule 4: Low success rate (MODERATE RISK)
        uint256 totalTransactions = buyerFraudCount[_buyerAddress] + buyerSuccessCount[_buyerAddress];
        if (totalTransactions > 0) {
            uint256 successRate = (buyerSuccessCount[_buyerAddress] * 100) / totalTransactions;
            if (successRate < 50) {
                fraudPoints += 20;
            }
        }
        
        isValid = fraudPoints < 60; // Fraud score < 60 is acceptable
        fraudScore = fraudPoints;
    }

    /**
     * @dev Simple validation (backward compatibility)
     */
    function validateOffer(string memory _cropName, uint256 _offerPrice) public view returns (bool) {
        uint256 minPrice = getMinAllowedPrice(_cropName);
        return _offerPrice >= minPrice;
    }

    /**
     * @dev Record successful transaction for buyer reputation
     */
    function recordSuccessfulTransaction(address _buyerAddress) public onlyAdmin {
        buyerSuccessCount[_buyerAddress]++;
    }

    /**
     * @dev Record failed/suspicious transaction for buyer reputation
     */
    function recordFraudulentTransaction(address _buyerAddress) public onlyAdmin {
        buyerFraudCount[_buyerAddress]++;
        
        // Auto-blacklist after 3 fraudulent transactions
        if (buyerFraudCount[_buyerAddress] >= 3) {
            blacklistedBuyers[_buyerAddress] = true;
            emit BuyerBlacklisted(_buyerAddress, "Multiple fraud attempts detected");
        }
    }

    /**
     * @dev Get buyer reputation score (0-100)
     */
    function getBuyerReputation(address _buyerAddress) public view returns (uint256 score) {
        uint256 total = buyerFraudCount[_buyerAddress] + buyerSuccessCount[_buyerAddress];
        
        if (total == 0) return 50; // Neutral for new buyers
        
        uint256 successRate = (buyerSuccessCount[_buyerAddress] * 100) / total;
        return successRate;
    }

    /**
     * @dev Check if buyer is blacklisted
     */
    function isBuyerBlacklisted(address _buyerAddress) public view returns (bool) {
        return blacklistedBuyers[_buyerAddress];
    }

    /**
     * @dev Manual admin blacklist/whitelist control
     */
    function setBlacklistStatus(address _buyerAddress, bool _isBlacklisted) public onlyAdmin {
        blacklistedBuyers[_buyerAddress] = _isBlacklisted;
        if (_isBlacklisted) {
            emit BuyerBlacklisted(_buyerAddress, "Admin blacklisted");
        }
    }

    /**
     * @dev Get price history for volume-weighted analysis
     */
    function getPriceHistory(string memory _cropName) public view returns (uint256[] memory) {
        return priceHistory[_cropName];
    }

    /**
     * @dev Calculate average price from history
     */
    function getAveragePriceHistory(string memory _cropName) public view returns (uint256) {
        uint256[] memory history = priceHistory[_cropName];
        require(history.length > 0, "No price history available");
        
        uint256 sum = 0;
        for (uint i = 0; i < history.length; i++) {
            sum += history[i];
        }
        return sum / history.length;
    }
}
