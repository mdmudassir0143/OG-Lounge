import { network } from "hardhat";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const { ethers } = await network.connect();

async function main() {
  console.log("🚀 Deploying EncryptedGameNFT contract...");

  // Get signers
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance));

  // Network-specific configurations
  const network = await ethers.provider.getNetwork();
  console.log("Network:", network.name, "Chain ID:", network.chainId);

  let pythContract: string;
  let oracleAddress: string;
  let platformWallet: string;

  // Configure based on network
  if (network.chainId === 16602n) { // 0G Testnet
    pythContract = "0x4305FB66699C3B2702D4d05CF36551390A4c69C6"; // 0G Testnet Pyth Network
    oracleAddress = deployer.address; // Use deployer as oracle for testing
    platformWallet = deployer.address; // Use deployer as platform wallet
  } else if (network.chainId === 11155111n) { // Sepolia
    pythContract = "0xDd24F84d36BF92C65F92307595335bdFab5Bbd21"; // Sepolia Pyth Network
    oracleAddress = deployer.address; // Use deployer as oracle for testing
    platformWallet = deployer.address; // Use deployer as platform wallet
  } else if (network.chainId === 1n) { // Mainnet
    pythContract = "0x4305FB66699C3B2702D4d05CF36551390A4c69C6"; // Mainnet Pyth Network
    oracleAddress = deployer.address; // Set production oracle
    platformWallet = deployer.address; // Set production platform wallet
  } else { // Local/Other networks
    pythContract = "0x4305FB66699C3B2702D4d05CF36551390A4c69C6"; // Mock Pyth for local testing
    oracleAddress = deployer.address; // Local test oracle
    platformWallet = deployer.address; // Local platform wallet
  }

  console.log("Configuration:");
  console.log("- Pyth Contract:", pythContract);
  console.log("- Oracle Address:", oracleAddress);
  console.log("- Platform Wallet:", platformWallet);

  // Deploy the contract
  const EncryptedGameNFT = await ethers.getContractFactory("EncryptedGameNFT");
  
  console.log("📦 Deploying contract...");
  const encryptedGameNFT = await EncryptedGameNFT.deploy(
    pythContract,
    platformWallet,
    oracleAddress
  );

  console.log("⏳ Waiting for deployment confirmation...");
  await encryptedGameNFT.waitForDeployment();
  
  const contractAddress = await encryptedGameNFT.getAddress();
  console.log("✅ EncryptedGameNFT deployed to:", contractAddress);

  // Get deployment transaction details
  const deploymentTx = encryptedGameNFT.deploymentTransaction();
  if (deploymentTx) {
    console.log("📊 Transaction hash:", deploymentTx.hash);
    console.log("💰 Gas used:", deploymentTx.gasLimit?.toString());
  }

  // Verify basic functionality
  console.log("🔍 Verifying contract functionality...");
  const name = await encryptedGameNFT.name();
  const symbol = await encryptedGameNFT.symbol();
  const totalSupply = await encryptedGameNFT.totalSupply();
  
  console.log("- Name:", name);
  console.log("- Symbol:", symbol);
  console.log("- Total Supply:", totalSupply.toString());

  console.log("\n📋 Deployment Summary:");
  console.log("================================");
  console.log(`Network: ${network.name} (Chain ID: ${network.chainId})`);
  console.log(`Contract: EncryptedGameNFT`);
  console.log(`Address: ${contractAddress}`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Pyth Contract: ${pythContract}`);
  console.log(`Platform Wallet: ${platformWallet}`);
  console.log(`Oracle Address: ${oracleAddress}`);
  console.log("================================");

  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId.toString(),
    contract: "EncryptedGameNFT",
    address: contractAddress,
    deployer: deployer.address,
    pythContract,
    platformWallet,
    oracleAddress,
    deployedAt: new Date().toISOString(),
    transactionHash: deploymentTx?.hash
  };

  console.log("\n💾 Deployment info saved for frontend integration");
  console.log("Use this address in your frontend:", contractAddress);
  
  return {
    contract: encryptedGameNFT,
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