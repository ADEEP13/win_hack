// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CropMarketplace
 * @dev Blockchain-based transparency for agricultural supply chain
 * NOTE: This contract does NOT handle cryptocurrency payments.
 * It only records immutable proof of agreements, prices, and transactions.
 * Actual payments happen via traditional banking (UPI/NEFT).
 */
contract CropMarketplace {
    struct Crop {
        uint256 id;
        address farmerWallet;
        string farmerBankAccount;
        string name;
        uint256 quantity; // in kg
        string quality; // A, B, or C
        uint256 pricePerKg;
        string imageHash; // File storage path or hash
        uint256 timestamp;
        bool sold;
    }

    struct Offer {
        uint256 id;
        uint256 cropId;
        address buyerWallet;
        string buyerBankAccount;
        uint256 offerPrice;
        uint256 timestamp;
        bool accepted;
        bool rejected;
    }

    struct PaymentRecord {
        uint256 offerId;
        uint256 amount;
        string paymentMethod; // "UPI", "NEFT", "Cash"
        string transactionId; // Bank transaction ID
        uint256 initiatedAt;
        uint256 completedAt;
        string status; // "initiated", "completed", "failed"
    }

    mapping(uint256 => Crop) public crops;
    mapping(uint256 => Offer) public offers;
    mapping(uint256 => PaymentRecord) public payments;

    uint256 public cropCount;
    uint256 public offerCount;

    event CropListed(
        uint256 indexed cropId,
        address indexed farmer,
        string name,
        uint256 price,
        string bankAccount
    );

    event OfferMade(
        uint256 indexed offerId,
        uint256 indexed cropId,
        address indexed buyer,
        uint256 price
    );

    event OfferAccepted(uint256 indexed offerId, uint256 indexed cropId);
    event OfferRejected(uint256 indexed offerId);

    event PaymentCommitted(
        uint256 indexed offerId,
        uint256 amount,
        string paymentMethod,
        uint256 timestamp
    );

    event PaymentCompleted(
        uint256 indexed offerId,
        string transactionId,
        uint256 timestamp
    );

    function listCrop(
        string memory _farmerBankAccount,
        string memory _name,
        uint256 _quantity,
        string memory _quality,
        uint256 _pricePerKg,
        string memory _imageHash
    ) public returns (uint256) {
        cropCount++;

        crops[cropCount] = Crop({
            id: cropCount,
            farmerWallet: msg.sender,
            farmerBankAccount: _farmerBankAccount,
            name: _name,
            quantity: _quantity,
            quality: _quality,
            pricePerKg: _pricePerKg,
            imageHash: _imageHash,
            timestamp: block.timestamp,
            sold: false
        });

        emit CropListed(cropCount, msg.sender, _name, _pricePerKg, _farmerBankAccount);
        return cropCount;
    }

    function makeOffer(
        uint256 _cropId,
        uint256 _offerPrice,
        string memory _buyerBankAccount
    ) public returns (uint256) {
        require(crops[_cropId].id != 0, "Crop does not exist");
        require(!crops[_cropId].sold, "Crop already sold");

        offerCount++;

        offers[offerCount] = Offer({
            id: offerCount,
            cropId: _cropId,
            buyerWallet: msg.sender,
            buyerBankAccount: _buyerBankAccount,
            offerPrice: _offerPrice,
            timestamp: block.timestamp,
            accepted: false,
            rejected: false
        });

        emit OfferMade(offerCount, _cropId, msg.sender, _offerPrice);
        return offerCount;
    }

    function acceptOffer(uint256 _offerId) public {
        Offer storage offer = offers[_offerId];
        Crop storage crop = crops[offer.cropId];

        require(msg.sender == crop.farmerWallet, "Only farmer can accept");
        require(!offer.accepted && !offer.rejected, "Offer already processed");

        offer.accepted = true;
        crop.sold = true;

        emit OfferAccepted(_offerId, offer.cropId);
    }

    function rejectOffer(uint256 _offerId) public {
        Offer storage offer = offers[_offerId];
        Crop storage crop = crops[offer.cropId];

        require(msg.sender == crop.farmerWallet, "Only farmer can reject");
        require(!offer.accepted && !offer.rejected, "Offer already processed");

        offer.rejected = true;

        emit OfferRejected(_offerId);
    }

    // Record payment commitment (NOT actual crypto transfer)
    function commitPayment(
        uint256 _offerId,
        uint256 _amount,
        string memory _paymentMethod
    ) public {
        Offer storage offer = offers[_offerId];
        require(offer.accepted, "Offer must be accepted first");
        require(msg.sender == offer.buyerWallet, "Only buyer can commit payment");

        payments[_offerId] = PaymentRecord({
            offerId: _offerId,
            amount: _amount,
            paymentMethod: _paymentMethod,
            transactionId: "",
            initiatedAt: block.timestamp,
            completedAt: 0,
            status: "initiated"
        });

        emit PaymentCommitted(_offerId, _amount, _paymentMethod, block.timestamp);
    }

    // Mark payment as completed (called after bank transfer succeeds)
    function confirmPayment(
        uint256 _offerId,
        string memory _transactionId
    ) public {
        Crop storage crop = crops[offers[_offerId].cropId];
        require(msg.sender == crop.farmerWallet, "Only farmer can confirm");

        PaymentRecord storage payment = payments[_offerId];
        payment.transactionId = _transactionId;
        payment.completedAt = block.timestamp;
        payment.status = "completed";

        emit PaymentCompleted(_offerId, _transactionId, block.timestamp);
    }

    function getCrop(uint256 _cropId) public view returns (Crop memory) {
        return crops[_cropId];
    }

    function getOffer(uint256 _offerId) public view returns (Offer memory) {
        return offers[_offerId];
    }

    function getPayment(uint256 _offerId) public view returns (PaymentRecord memory) {
        return payments[_offerId];
    }
}
