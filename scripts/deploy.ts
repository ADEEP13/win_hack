import { ethers } from "hardhat";

async function main() {
  console.log("Deploying smart contracts...");

  // Deploy CropMarketplace
  const CropMarketplace = await ethers.getContractFactory("CropMarketplace");
  const cropMarketplace = await CropMarketplace.deploy();
  await cropMarketplace.waitForDeployment();
  const cropMarketplaceAddress = await cropMarketplace.getAddress();
  console.log("CropMarketplace deployed to:", cropMarketplaceAddress);

  // Deploy PriceOracle
  const PriceOracle = await ethers.getContractFactory("PriceOracle");
  const priceOracle = await PriceOracle.deploy();
  await priceOracle.waitForDeployment();
  const priceOracleAddress = await priceOracle.getAddress();
  console.log("PriceOracle deployed to:", priceOracleAddress);

  // Save addresses to env file
  console.log("\n✅ Add these to your .env.local:");
  console.log(`NEXT_PUBLIC_CROP_MARKETPLACE_ADDRESS=${cropMarketplaceAddress}`);
  console.log(`NEXT_PUBLIC_PRICE_ORACLE_ADDRESS=${priceOracleAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
