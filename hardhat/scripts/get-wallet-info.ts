import { createPublicClient, http, formatEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const privateKey = process.env.WALLET_PRIVATE_KEY;
  
  if (!privateKey) {
    console.error("WALLET_PRIVATE_KEY not found in .env file");
    return;
  }
  
  console.log("🔑 Checking WALLET_PRIVATE_KEY...");
  
  // Get account from private key
  const account = privateKeyToAccount(`0x${privateKey}` as `0x${string}`);
  const walletAddress = account.address;
  
  console.log(`Wallet Address: ${walletAddress}`);
  
  // Check balance on Sepolia
  const client = createPublicClient({
    chain: sepolia,
    transport: http(process.env.SEPOLIA_RPC_URL || "https://sepolia.drpc.org")
  });
  
  const balance = await client.getBalance({
    address: walletAddress,
  });
  
  console.log(`Balance on Sepolia: ${formatEther(balance)} ETH`);
  console.log(`Network: Sepolia Testnet`);
  
  if (balance === 0n) {
    console.log("\n🚨 You need Sepolia ETH to deploy!");
    console.log("Get free testnet ETH from:");
    console.log("- https://sepoliafaucet.com/");
    console.log("- https://faucets.chain.link/sepolia");
    console.log(`- Enter this address: ${walletAddress}`);
  } else {
    console.log("\n✅ You have ETH! Ready to deploy to Sepolia.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });