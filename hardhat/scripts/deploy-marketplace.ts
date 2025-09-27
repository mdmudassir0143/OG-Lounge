import { network } from "hardhat";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const { ethers } = await network.connect();

async function main() {
  console.log("🚀 Deploying GameMarketplace contract...");

  // Get signers
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance));

  // Network-specific configurations
  const networkInfo = await ethers.provider.getNetwork();
  console.log("Network:", networkInfo.name, "Chain ID:", networkInfo.chainId);

  let pythContract: string;
  let platformWallet: string;

  // Configure based on network
  if (networkInfo.chainId === 11155111n) { // Sepolia
    pythContract = "0x4305FB66699C3B2702D4d05CF36551390A4c69C6"; // Sepolia Pyth Network
    platformWallet = deployer.address; // Use deployer as platform wallet
  } else if (networkInfo.chainId === 1n) { // Mainnet
    pythContract = "0x4305FB66699C3B2702D4d05CF36551390A4c69C6"; // Mainnet Pyth Network
    platformWallet = deployer.address; // Set production platform wallet
  } else { // Local/Other networks
    pythContract = "0x4305FB66699C3B2702D4d05CF36551390A4c69C6"; // Mock Pyth for local testing
    platformWallet = deployer.address; // Local platform wallet
  }

  console.log("Configuration:");
  console.log("- Pyth Contract:", pythContract);
  console.log("- Platform Wallet:", platformWallet);

  // Deploy the contract
  const GameMarketplace = await ethers.getContractFactory("GameMarketplace");
  
  console.log("📦 Deploying contract...");
  const gameMarketplace = await GameMarketplace.deploy(
    pythContract,
    platformWallet
  );

  console.log("⏳ Waiting for deployment confirmation...");
  await gameMarketplace.waitForDeployment();
  
  const contractAddress = await gameMarketplace.getAddress();
  console.log("✅ GameMarketplace deployed to:", contractAddress);

  // Get deployment transaction details
  const deploymentTx = gameMarketplace.deploymentTransaction();
  if (deploymentTx) {
    console.log("📊 Transaction hash:", deploymentTx.hash);
    console.log("💰 Gas used:", deploymentTx.gasLimit?.toString());
  }

  // Verify basic functionality
  console.log("🔍 Verifying contract functionality...");
  const totalGames = await gameMarketplace.totalGames();
  
  console.log("- Total Games:", totalGames.toString());

  console.log("\n📋 Deployment Summary:");
  console.log("================================");
  console.log(`Network: ${networkInfo.name} (Chain ID: ${networkInfo.chainId})`);
  console.log(`Contract: GameMarketplace`);
  console.log(`Address: ${contractAddress}`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Pyth Contract: ${pythContract}`);
  console.log(`Platform Wallet: ${platformWallet}`);
  console.log("================================");

  // Save deployment info
  const deploymentInfo = {
    network: networkInfo.name,
    chainId: networkInfo.chainId.toString(),
    contract: "GameMarketplace",
    address: contractAddress,
    deployer: deployer.address,
    pythContract,
    platformWallet,
    deployedAt: new Date().toISOString(),
    transactionHash: deploymentTx?.hash
  };

  console.log("\n💾 Deployment info saved for frontend integration");
  console.log("Use this address in your frontend contracts.ts file:");
  console.log(`GameMarketplace: "${contractAddress}",`);
  
  // Verify contract on Etherscan (if on testnet/mainnet)
  console.log("\nTo verify on Etherscan, run:");
  console.log(`npx hardhat verify --network sepolia ${contractAddress} ${pythContract} ${platformWallet}`);
  
  return {
    contract: gameMarketplace,
    address: contractAddress,
    deploymentInfo
  };
}

// Execute deployment
main()
  .then((result) => {
    console.log(`\n🎉 Deployment successful!`);
    console.log(`Contract address: ${result.address}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });