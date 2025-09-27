import { network } from "hardhat";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const { ethers } = await network.connect();

async function debug() {
  console.log("🔍 Debug Network Connection...");
  
  try {
    // Check network
    const networkInfo = await ethers.provider.getNetwork();
    console.log("Network:", networkInfo.name, "Chain ID:", networkInfo.chainId);
    
    // Check signers
    const signers = await ethers.getSigners();
    console.log("Number of signers:", signers.length);
    
    if (signers.length > 0) {
      const [deployer] = signers;
      console.log("Deployer address:", deployer.address);
      
      const balance = await ethers.provider.getBalance(deployer.address);
      console.log("Balance:", ethers.formatEther(balance), "ETH");
    } else {
      console.log("❌ No signers available");
      console.log("Environment check:");
      console.log("WALLET_PRIVATE_KEY set:", !!process.env.WALLET_PRIVATE_KEY);
      console.log("Private key length:", process.env.WALLET_PRIVATE_KEY?.length);
    }
    
  } catch (error: any) {
    console.error("❌ Error:", error.message);
  }
}

debug();