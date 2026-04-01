import { ethers } from "ethers";

const GANACHE_RPC_URL = process.env.NEXT_PUBLIC_GANACHE_RPC_URL || "http://127.0.0.1:8545";
const CROP_MARKETPLACE_ADDRESS = process.env.NEXT_PUBLIC_CROP_MARKETPLACE_ADDRESS || "";
const PRICE_ORACLE_ADDRESS = process.env.NEXT_PUBLIC_PRICE_ORACLE_ADDRESS || "";

// Get provider (read-only connection)
export function getProvider() {
  return new ethers.JsonRpcProvider(GANACHE_RPC_URL);
}

// Get signer (for transactions) - uses private key from env
export function getSigner(privateKey?: string) {
  const provider = getProvider();
  const key = privateKey || process.env.GANACHE_PRIVATE_KEY || "";
  if (!key) {
    throw new Error("No private key provided for signer");
  }
  return new ethers.Wallet(key, provider);
}

// CropMarketplace ABI (simplified)
const CROP_MARKETPLACE_ABI = [
  "function listCrop(string _farmerBankAccount, string _name, uint256 _quantity, string _quality, uint256 _pricePerKg, string _imageHash) public returns (uint256)",
  "function makeOffer(uint256 _cropId, uint256 _offerPrice, string _buyerBankAccount) public returns (uint256)",
  "function acceptOffer(uint256 _offerId) public",
  "function rejectOffer(uint256 _offerId) public",
  "function commitPayment(uint256 _offerId, uint256 _amount, string _paymentMethod) public",
  "function confirmPayment(uint256 _offerId, string _transactionId) public",
  "function getCrop(uint256 _cropId) public view returns (tuple)",
  "function getOffer(uint256 _offerId) public view returns (tuple)",
  "function getPayment(uint256 _offerId) public view returns (tuple)",
];

// Get CropMarketplace contract instance
export function getCropMarketplaceContract(signer?: any) {
  if (!CROP_MARKETPLACE_ADDRESS) {
    throw new Error("CROP_MARKETPLACE_ADDRESS not set");
  }
  const signerOrProvider = signer || getProvider();
  return new ethers.Contract(
    CROP_MARKETPLACE_ADDRESS,
    CROP_MARKETPLACE_ABI,
    signerOrProvider
  );
}

// PriceOracle ABI
const PRICE_ORACLE_ABI = [
  "function getMandiPrice(string _cropName) public view returns (uint256)",
  "function getMinAllowedPrice(string _cropName) public view returns (uint256)",
  "function validateOffer(string _cropName, uint256 _offerPrice) public view returns (bool)",
  "function setMandiPrice(string _cropName, uint256 _price) public",
];

// Get PriceOracle contract instance
export function getPriceOracleContract(signer?: any) {
  if (!PRICE_ORACLE_ADDRESS) {
    throw new Error("PRICE_ORACLE_ADDRESS not set");
  }
  const signerOrProvider = signer || getProvider();
  return new ethers.Contract(
    PRICE_ORACLE_ADDRESS,
    PRICE_ORACLE_ABI,
    signerOrProvider
  );
}

// Helper to get current network
export async function getNetworkInfo() {
  const provider = getProvider();
  const network = await provider.getNetwork();
  const blockNumber = await provider.getBlockNumber();
  return { network, blockNumber };
}

// Helper to get account balance
export async function getBalance(address: string) {
  const provider = getProvider();
  return await provider.getBalance(address);
}

// Helper to convert between units
export const ethersUtils = {
  toWei: (amount: string, decimals = 18) => ethers.parseUnits(amount, decimals),
  fromWei: (amount: bigint, decimals = 18) => ethers.formatUnits(amount, decimals),
};
