import { createPublicClient, http, formatEther } from "viem";
import { sepolia } from "viem/chains";

async function main() {
  const walletAddress = "0x742626ce3c271b8d09e61a5ecf1f59c4b23b9f39";
  
  const client = createPublicClient({
    chain: sepolia,
    transport: http("https://sepolia.drpc.org")
  });
  
  const balance = await client.getBalance({
    address: walletAddress as `0x${string}`,
  });
  
  console.log(`Wallet: ${walletAddress}`);
  console.log(`Balance: ${formatEther(balance)} ETH`);
  console.log(`Network: Sepolia Testnet`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });