import { ethers } from "ethers";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function main() {
  console.log("🎮 Deploying RockPaperScissorsGame contract...");

  // Create provider and signer directly using ethers
  const rpcUrl = process.env.SEPOLIA_RPC_URL || "https://sepolia.drpc.org";
  const privateKey = process.env.WALLET_PRIVATE_KEY;

  if (!privateKey) {
    throw new Error("WALLET_PRIVATE_KEY not found in environment variables");
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const deployer = new ethers.Wallet(privateKey, provider);

  console.log("📝 Deploying with account:", deployer.address);

  // Check balance
  const balance = await provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");

  // Check if balance is sufficient for deployment
  const minBalance = ethers.parseEther("0.01"); // Minimum 0.01 ETH for deployment
  if (balance < minBalance) {
    throw new Error(`Insufficient balance. Need at least 0.01 ETH, but have ${ethers.formatEther(balance)} ETH`);
  }

  // Pyth contract addresses for different networks
  const pythContracts = {
    sepolia: "0xDd24F84d36BF92C65F92307595335bdFab5Bbd21", // Pyth Oracle on Sepolia
    mainnet: "0x4305FB66699C3B2702D4d05CF36551390A4c69C6", // Pyth Oracle on Mainnet
    hardhat: "0x4305FB66699C3B2702D4d05CF36551390A4c69C6", // Use mainnet address for local testing
  };

  // Get network info
  const network = await provider.getNetwork();
  const networkName = network.name === "unknown" ? "sepolia" : network.name; // Default to sepolia
  console.log("🌐 Network:", networkName, "Chain ID:", network.chainId.toString());

  // Get Pyth contract address for the current network
  let pythAddress: string;
  if (networkName in pythContracts) {
    pythAddress = pythContracts[networkName as keyof typeof pythContracts];
  } else {
    // Default to Sepolia for unknown networks
    pythAddress = pythContracts.sepolia;
    console.log("⚠️  Unknown network, using Sepolia Pyth address");
  }

  console.log("🔮 Using Pyth Oracle at:", pythAddress);

  try {
    // We need to read the compiled contract artifacts
    const fs = await import("fs");
    const path = await import("path");
    const { fileURLToPath } = await import("url");

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const artifactPath = path.join(__dirname, "../artifacts/contracts/RockPaperScissorsGame.sol/RockPaperScissorsGame.json");

    if (!fs.existsSync(artifactPath)) {
      throw new Error("Contract artifacts not found. Please run 'pnpm hardhat compile' first.");
    }

    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    const contractABI = artifact.abi;
    const contractBytecode = artifact.bytecode;

    console.log("📄 Contract artifact loaded successfully");

    // Create contract factory and deploy
    const contractFactory = new ethers.ContractFactory(contractABI, contractBytecode, deployer);
    const contract = await contractFactory.deploy(pythAddress);

    console.log("⏳ Waiting for deployment transaction...");
    await contract.waitForDeployment();

    const contractAddress = await contract.getAddress();
    console.log("✅ RockPaperScissorsGame deployed to:", contractAddress);

    // Save deployment info
    const deploymentInfo = {
      contractAddress,
      pythAddress,
      networkName,
      chainId: network.chainId.toString(),
      deployer: deployer.address,
      deploymentHash: contract.deploymentTransaction()?.hash,
      timestamp: new Date().toISOString(),
    };

    console.log("\n📋 Deployment Summary:");
    console.log("├─ Contract Address:", contractAddress);
    console.log("├─ Pyth Oracle:", pythAddress);
    console.log("├─ Network:", networkName);
    console.log("├─ Chain ID:", network.chainId.toString());
    console.log("├─ Deployer:", deployer.address);
    console.log("└─ Transaction Hash:", deploymentInfo.deploymentHash);

    // Verify contract if on a testnet or mainnet
    if (networkName !== "hardhat" && networkName !== "localhost") {
      console.log("\n📄 To verify the contract, run:");
      console.log(`npx hardhat verify --network ${networkName} ${contractAddress} "${pythAddress}"`);
    }

    // Test basic contract functions
    console.log("\n🧪 Testing basic contract functions...");

    try {
      // Test creating a commit hash
      const testChoice = 1; // Rock
      const testNonce = 12345;
      const testPlayer = deployer.address;

      const commitHash = await contract.generateCommitHash(testChoice, testNonce, testPlayer);
      console.log("✅ Commit hash generation works:", commitHash);

      // Check minimum bet amount
      const minBet = await contract.MIN_BET_AMOUNT();
      console.log("✅ Minimum bet amount:", ethers.formatEther(minBet), "ETH");

      // Check contract balance (should be 0)
      const contractBalance = await provider.getBalance(contractAddress);
      console.log("✅ Contract balance:", ethers.formatEther(contractBalance), "ETH");

    } catch (error) {
      console.log("❌ Contract function test failed:", error);
    }

    return {
      contract,
      address: contractAddress,
      deploymentInfo,
    };

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    throw error;
  }
}

// Execute deployment
main()
  .then(() => {
    console.log("\n🎉 Deployment completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Deployment failed:", error);
    process.exit(1);
  });

export default main;