// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PriceOracle {
    address public admin;

    // Crop name => Price per quintal (100kg) in smallest unit (e.g., paise)
    mapping(string => uint256) public mandiPrices;

    event PriceUpdated(string indexed cropName, uint256 price);

    constructor() {
        admin = msg.sender;

        // Initialize with sample prices (₹ per quintal in paise)
        mandiPrices["rice"] = 182000; // ₹1,820
        mandiPrices["wheat"] = 205000; // ₹2,050
        mandiPrices["tomato"] = 3500; // ₹35/kg
        mandiPrices["onion"] = 2800; // ₹28/kg
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    function setMandiPrice(string memory _cropName, uint256 _price) public onlyAdmin {
        mandiPrices[_cropName] = _price;
        emit PriceUpdated(_cropName, _price);
    }

    function getMandiPrice(string memory _cropName) public view returns (uint256) {
        return mandiPrices[_cropName];
    }

    function getMinAllowedPrice(string memory _cropName) public view returns (uint256) {
        // Return 85% of mandi price
        return (mandiPrices[_cropName] * 85) / 100;
    }

    function validateOffer(string memory _cropName, uint256 _offerPrice) public view returns (bool) {
        uint256 minPrice = getMinAllowedPrice(_cropName);
        return _offerPrice >= minPrice;
    }
}
