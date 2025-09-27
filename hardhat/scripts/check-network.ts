import { network } from "hardhat";

const { ethers } = await network.connect();

async function checkConnection() {
  console.log("🔍 Checking network connection...");
  
  try {
    const networkInfo = await ethers.provider.getNetwork();
    console.log("✅ Connected to network:", networkInfo.name);
    console.log("Chain ID:", networkInfo.chainId.toString());
    
    const signers = await ethers.getSigners();
    console.log("📝 Available signers:", signers.length);
    
    if (signers.length > 0) {
      const deployer = signers[0];
      console.log("Deployer address:", deployer.address);
      
      const balance = await ethers.provider.getBalance(deployer.address);
      console.log("Balance:", ethers.formatEther(balance), "ETH");
    } else {
      console.log("❌ No signers available. Please configure WALLET_PRIVATE_KEY in .env file");
    }
  } catch (error) {
    console.error("❌ Connection failed:", error);
  }
}

checkConnection();